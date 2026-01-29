import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubUser {
  login: string;
}

interface GitHubIssue {
  html_url: string;
  title: string;
  state: string;
  created_at: string;
  number: number;
  labels?: Array<{ name: string }>;
  repository?: { language?: string };
}

interface GitHubPR {
  html_url: string;
  title: string;
  state: string;
  created_at: string;
  closed_at?: string;
  merged_at?: string;
  number: number;
  labels?: Array<{ name: string }>;
  repository?: { language?: string };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user session
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get GitHub token from session
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const githubToken = sessionData.session?.provider_token;

    if (!githubToken) {
      throw new Error('No GitHub token found. Please reconnect your GitHub account.');
    }

    // Fetch GitHub username
    const username = await fetchGitHubUsername(githubToken);

    // Fetch all data in parallel
    const [assignedIssues, pullRequests] = await Promise.all([
      fetchAssignedIssues(username, githubToken),
      fetchUserPullRequests(username, githubToken),
    ]);

    console.log(`Found ${assignedIssues.length} assigned issues and ${pullRequests.length} PRs`);

    const contributions = [];

    // Process assigned issues
    for (const issue of assignedIssues) {
      const parsed = parseGitHubUrl(issue.html_url);
      if (!parsed) continue;

      // Check for linked PR
      const linkedPR = await findLinkedPR(
        parsed.owner,
        parsed.repo,
        parsed.number,
        username,
        githubToken
      );

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
        labels: issue.labels?.map((l) => l.name) || [],
        last_synced_at: new Date().toISOString(),
      };

      // Add PR data if found
      if (linkedPR) {
        const prParsed = parseGitHubUrl(linkedPR.html_url);
        const prDetails = await fetchPullRequestDetails(
          prParsed.owner,
          prParsed.repo,
          prParsed.number,
          githubToken
        );

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

      contributions.push(contribution);
    }

    // Process PRs that might not be linked to assigned issues
    for (const pr of pullRequests) {
      const parsed = parseGitHubUrl(pr.html_url);
      if (!parsed) continue;

      // Check if we already have this as an assigned issue
      const exists = contributions.some(
        (c) =>
          c.github_repo_owner === parsed.owner &&
          c.github_repo_name === parsed.repo &&
          c.pr_number === parsed.number
      );

      if (!exists) {
        const prDetails = await fetchPullRequestDetails(
          parsed.owner,
          parsed.repo,
          parsed.number,
          githubToken
        );

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
          labels: pr.labels?.map((l) => l.name) || [],
          last_synced_at: new Date().toISOString(),
        };

        contributions.push(contribution);
      }
    }

    // Upsert contributions to database
    if (contributions.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('contributions')
        .upsert(contributions, {
          onConflict: 'user_id,github_repo_owner,github_repo_name,github_issue_number',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        throw upsertError;
      }

      console.log(`Successfully synced ${contributions.length} contributions`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: contributions.length,
        lastSynced: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error syncing GitHub contributions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper functions
async function fetchGitHub(endpoint: string, token: string) {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchGitHubUsername(token: string): Promise<string> {
  const user: GitHubUser = await fetchGitHub('/user', token);
  return user.login;
}

async function fetchAssignedIssues(username: string, token: string): Promise<GitHubIssue[]> {
  try {
    const query = `assignee:${username}+is:issue`;
    const data = await fetchGitHub(`/search/issues?q=${query}&per_page=100`, token);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching assigned issues:', error);
    return [];
  }
}

async function fetchUserPullRequests(username: string, token: string): Promise<GitHubPR[]> {
  try {
    const query = `author:${username}+is:pr`;
    const data = await fetchGitHub(
      `/search/issues?q=${query}&per_page=100&sort=updated`,
      token
    );
    return data.items || [];
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return [];
  }
}

async function fetchPullRequestDetails(
  owner: string,
  repo: string,
  prNumber: number,
  token: string
): Promise<GitHubPR | null> {
  try {
    return await fetchGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
  } catch (error) {
    console.error(`Error fetching PR details for ${owner}/${repo}#${prNumber}:`, error);
    return null;
  }
}

function parseGitHubUrl(url: string) {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/(\d+)/;
  const match = url.match(regex);

  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    type: match[3],
    number: parseInt(match[4]),
  };
}

async function findLinkedPR(
  owner: string,
  repo: string,
  issueNumber: number,
  username: string,
  token: string
): Promise<GitHubIssue | null> {
  try {
    const query = `repo:${owner}/${repo}+author:${username}+is:pr+${issueNumber}`;
    const data = await fetchGitHub(`/search/issues?q=${query}`, token);

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }

    return null;
  } catch (error) {
    console.error(`Error finding linked PR for ${owner}/${repo}#${issueNumber}:`, error);
    return null;
  }
}
