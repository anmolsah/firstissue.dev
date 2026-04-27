// Supabase Edge Function: GitHub Sync
// Deploy: supabase functions deploy github-sync

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GITHUB_API_BASE = "https://api.github.com";

const fetchGitHub = async (endpoint: string, token: string) => {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
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

    // 4. Fetch GitHub Data
    const [assignedIssues, pullRequests] = await Promise.all([
      fetchGitHub(`/search/issues?q=assignee:${username}+is:issue&per_page=100`, token).then(d => d.items || []),
      fetchGitHub(`/search/issues?q=author:${username}+is:pr&per_page=100&sort=updated`, token).then(d => d.items || [])
    ]);

    console.log(`Found ${assignedIssues.length} assigned issues and ${pullRequests.length} PRs`);

    const contributions: any[] = [];

    // Helper to find linked PR
    const findLinkedPR = async (owner: string, repo: string, issueNumber: number) => {
      try {
        const data = await fetchGitHub(`/search/issues?q=repo:${owner}/${repo}+author:${username}+is:pr+${issueNumber}`, token);
        return data.items?.[0] || null;
      } catch (e) {
        return null;
      }
    };

    // Helper to fetch PR details
    const fetchPRDetails = async (owner: string, repo: string, number: number) => {
      try {
        return await fetchGitHub(`/repos/${owner}/${repo}/pulls/${number}`, token);
      } catch (e) {
        return null;
      }
    };

    // 5. Process Assigned Issues
    for (const issue of assignedIssues) {
      const parsed = parseGitHubUrl(issue.html_url);
      if (!parsed) continue;

      const linkedPR = await findLinkedPR(parsed.owner, parsed.repo, parsed.number);
      
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

      if (linkedPR) {
        const prParsed = parseGitHubUrl(linkedPR.html_url);
        if (prParsed) {
          const prDetails = await fetchPRDetails(prParsed.owner, prParsed.repo, prParsed.number);
          if (prDetails) {
            contribution.pr_url = linkedPR.html_url;
            contribution.pr_number = prParsed.number;
            contribution.pr_title = linkedPR.title;
            contribution.pr_status = prDetails.merged_at ? 'merged' : prDetails.state;
            contribution.pr_created_at = prDetails.created_at;
            contribution.pr_merged_at = prDetails.merged_at;
            contribution.pr_closed_at = prDetails.closed_at;
          }
        }
      }

      contributions.push(contribution);
    }

    // 6. Process Pull Requests (not linked)
    for (const pr of pullRequests) {
      const parsed = parseGitHubUrl(pr.html_url);
      if (!parsed) continue;

      const exists = contributions.some(
        c => c.github_repo_owner === parsed.owner &&
             c.github_repo_name === parsed.repo &&
             c.pr_number === parsed.number
      );

      if (!exists) {
        const prDetails = await fetchPRDetails(parsed.owner, parsed.repo, parsed.number);
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
          pr_status: prDetails?.merged_at ? 'merged' : pr.state,
          pr_created_at: pr.created_at,
          pr_merged_at: prDetails?.merged_at,
          pr_closed_at: pr.closed_at,
          language: pr.repository?.language || null,
          labels: pr.labels?.map((l: any) => l.name) || [],
          last_synced_at: new Date().toISOString(),
        };

        contributions.push(contribution);
      }
    }

    // 7. Upsert to DB
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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
