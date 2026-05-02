// Supabase Edge Function: GitHub Sync
// Deploy: supabase functions deploy github-sync

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  "https://firstissue.dev",
  "https://www.firstissue.dev",
  "http://localhost:5173",
  "http://localhost:3000",
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

const GITHUB_API_BASE = "https://api.github.com";

// Concurrency limiter — process N promises at a time to avoid GitHub secondary rate limits
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize = 5
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(processor));
    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }
  return results;
}

const fetchGitHub = async (endpoint: string, token: string) => {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    // Handle rate limiting gracefully
    if (response.status === 403 || response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new Error(`GitHub rate limit exceeded. Retry after ${retryAfter || '60'} seconds.`);
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const getGitHubUsername = async (token: string) => {
  const user = await fetchGitHub("/user", token);
  return user.login;
};

const parseGitHubUrl = (url: string) => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/(\d+)/;
  const match = url.match(regex);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    type: match[3],
    number: parseInt(match[4]),
  };
};

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Client using the user's Auth Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2. Get the user identity securely
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // 3. Fetch github_token from profiles (using server side to prevent exposing it to client)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('github_token, github_token_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_token) {
      throw new Error("GitHub account not connected or token missing.");
    }

    if (profile.github_token_expires_at) {
      const expiresAt = new Date(profile.github_token_expires_at);
      if (expiresAt < new Date()) {
        throw new Error("GitHub connection expired.");
      }
    }

    const token = profile.github_token;
    const username = await getGitHubUsername(token);

    // 4. Fetch GitHub Data — parallel initial fetches
    const [assignedIssues, pullRequests] = await Promise.all([
      fetchGitHub(`/search/issues?q=assignee:${username}+is:issue&per_page=100`, token).then(d => d.items || []),
      fetchGitHub(`/search/issues?q=author:${username}+is:pr&per_page=100&sort=updated`, token).then(d => d.items || [])
    ]);

    console.log(`Found ${assignedIssues.length} assigned issues and ${pullRequests.length} PRs`);

    // 5. Build a lookup map of PRs by repo for fast linking (avoids N+1 findLinkedPR calls)
    const prsByRepo = new Map<string, any[]>();
    for (const pr of pullRequests) {
      const parsed = parseGitHubUrl(pr.html_url);
      if (!parsed) continue;
      const repoKey = `${parsed.owner}/${parsed.repo}`;
      if (!prsByRepo.has(repoKey)) {
        prsByRepo.set(repoKey, []);
      }
      prsByRepo.get(repoKey)!.push({ ...pr, _parsed: parsed });
    }

    // 6. Process Assigned Issues — use the PR map for linking instead of individual API calls
    const contributions: any[] = [];

    // Collect PRs that need detail fetches (only when we can't determine merge status from search)
    const prsNeedingDetails: { pr: any; parsed: any; contributionIndex: number }[] = [];

    for (const issue of assignedIssues) {
      const parsed = parseGitHubUrl(issue.html_url);
      if (!parsed) continue;

      const contribution: any = {
        user_id: user.id,
        github_issue_number: parsed.number,
        github_repo_owner: parsed.owner,
        github_repo_name: parsed.repo,
        issue_url: issue.html_url,
        issue_title: issue.title,
        issue_state: issue.state,
        is_assigned: true,
        assigned_at: issue.created_at,
        language: issue.repository?.language || null,
        labels: issue.labels?.map((l: any) => l.name) || [],
        last_synced_at: new Date().toISOString(),
      };

      // Link PR from the local lookup map instead of making an API call
      const repoKey = `${parsed.owner}/${parsed.repo}`;
      const repoPRs = prsByRepo.get(repoKey) || [];
      const linkedPR = repoPRs.find(pr => {
        // Match PR to issue by checking if the PR title/body references the issue number
        // or if the PR was created for this issue
        return pr.title?.includes(`#${parsed.number}`) ||
               pr.body?.includes(`#${parsed.number}`) ||
               pr.body?.includes(`issues/${parsed.number}`);
      });

      if (linkedPR) {
        const prParsed = linkedPR._parsed;
        contribution.pr_url = linkedPR.html_url;
        contribution.pr_number = prParsed.number;
        contribution.pr_title = linkedPR.title;
        contribution.pr_created_at = linkedPR.created_at;
        contribution.pr_closed_at = linkedPR.closed_at;

        // The search API includes `pull_request.merged_at` if merged
        if (linkedPR.pull_request?.merged_at) {
          contribution.pr_status = 'merged';
          contribution.pr_merged_at = linkedPR.pull_request.merged_at;
        } else if (linkedPR.state === 'closed') {
          // Need a detail fetch to confirm if it was merged or just closed
          prsNeedingDetails.push({
            pr: linkedPR,
            parsed: prParsed,
            contributionIndex: contributions.length,
          });
          contribution.pr_status = linkedPR.state; // Temporary, will be updated
        } else {
          contribution.pr_status = linkedPR.draft ? 'draft' : linkedPR.state;
        }
      }

      contributions.push(contribution);
    }

    // 7. Process PRs not already linked to issues
    for (const pr of pullRequests) {
      const parsed = parseGitHubUrl(pr.html_url);
      if (!parsed) continue;

      const exists = contributions.some(
        c => c.github_repo_owner === parsed.owner &&
             c.github_repo_name === parsed.repo &&
             c.pr_number === parsed.number
      );

      if (!exists) {
        const contribution: any = {
          user_id: user.id,
          github_issue_number: pr.number,
          github_repo_owner: parsed.owner,
          github_repo_name: parsed.repo,
          issue_url: pr.html_url,
          issue_title: pr.title,
          issue_state: pr.state,
          pr_url: pr.html_url,
          pr_number: parsed.number,
          pr_title: pr.title,
          pr_created_at: pr.created_at,
          pr_closed_at: pr.closed_at,
          language: pr.repository?.language || null,
          labels: pr.labels?.map((l: any) => l.name) || [],
          last_synced_at: new Date().toISOString(),
        };

        // Use pull_request.merged_at from search results to avoid detail fetch
        if (pr.pull_request?.merged_at) {
          contribution.pr_status = 'merged';
          contribution.pr_merged_at = pr.pull_request.merged_at;
        } else if (pr.state === 'closed') {
          // Closed but not merged according to search — need detail fetch to confirm
          prsNeedingDetails.push({
            pr,
            parsed,
            contributionIndex: contributions.length,
          });
          contribution.pr_status = pr.state;
        } else {
          contribution.pr_status = pr.draft ? 'draft' : pr.state;
        }

        contributions.push(contribution);
      }
    }

    // 8. Batch-fetch PR details ONLY for closed PRs where we need to confirm merge status
    // This replaces the old N+1 pattern — typically only ~10-20% of PRs are closed
    if (prsNeedingDetails.length > 0) {
      console.log(`Fetching details for ${prsNeedingDetails.length} closed PRs (batch)`);

      const detailResults = await batchProcess(
        prsNeedingDetails,
        async ({ parsed }) => {
          return await fetchGitHub(`/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`, token);
        },
        5 // Process 5 at a time to stay under GitHub's secondary rate limit
      );

      // Update contributions with detailed merge status
      for (let i = 0; i < detailResults.length; i++) {
        const detail = detailResults[i];
        const { contributionIndex } = prsNeedingDetails[i];
        if (detail && contributions[contributionIndex]) {
          contributions[contributionIndex].pr_status = detail.merged_at ? 'merged' : detail.state;
          contributions[contributionIndex].pr_merged_at = detail.merged_at || null;
          contributions[contributionIndex].pr_closed_at = detail.closed_at || null;
        }
      }
    }

    // 9. Upsert to DB
    if (contributions.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from("contributions")
        .upsert(contributions, {
          onConflict: "user_id,github_repo_owner,github_repo_name,github_issue_number",
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: contributions.length,
      lastSynced: new Date().toISOString()
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error("github-sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } 
    });
  }
});
