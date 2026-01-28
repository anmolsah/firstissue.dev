import { supabase } from "../lib/supabase";

/**
 * GitHub Sync Service
 * Fetches user's GitHub activity and syncs with contributions table
 */

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Get GitHub access token from user session
 */
const getGitHubToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token; // GitHub OAuth token
};

/**
 * Fetch data from GitHub API
 */
const fetchGitHub = async (endpoint, token) => {
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

/**
 * Get authenticated user's GitHub username
 */
export const getGitHubUsername = async (token) => {
    try {
        const user = await fetchGitHub("/user", token);
        return user.login;
    } catch (error) {
        console.error("Error fetching GitHub username:", error);
        throw error;
    }
};

/**
 * Fetch user's assigned issues
 */
export const fetchAssignedIssues = async (username, token) => {
    try {
        const query = `assignee:${username}+is:issue`;
        const data = await fetchGitHub(`/search/issues?q=${query}&per_page=100`, token);
        return data.items || [];
    } catch (error) {
        console.error("Error fetching assigned issues:", error);
        return [];
    }
};

/**
 * Fetch user's pull requests
 */
export const fetchUserPullRequests = async (username, token) => {
    try {
        const query = `author:${username}+is:pr`;
        const data = await fetchGitHub(`/search/issues?q=${query}&per_page=100&sort=updated`, token);
        return data.items || [];
    } catch (error) {
        console.error("Error fetching pull requests:", error);
        return [];
    }
};

/**
 * Fetch detailed PR information
 */
export const fetchPullRequestDetails = async (owner, repo, prNumber, token) => {
    try {
        return await fetchGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
    } catch (error) {
        console.error(`Error fetching PR details for ${owner}/${repo}#${prNumber}:`, error);
        return null;
    }
};

/**
 * Check if user has commented on an issue
 */
export const checkUserComments = async (owner, repo, issueNumber, username, token) => {
    try {
        const comments = await fetchGitHub(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, token);
        const userComments = comments.filter(comment => comment.user.login === username);
        return {
            hasCommented: userComments.length > 0,
            commentCount: userComments.length,
            firstCommentAt: userComments.length > 0 ? userComments[0].created_at : null,
        };
    } catch (error) {
        console.error(`Error checking comments for ${owner}/${repo}#${issueNumber}:`, error);
        return { hasCommented: false, commentCount: 0, firstCommentAt: null };
    }
};

/**
 * Parse GitHub URL to extract owner, repo, and issue/PR number
 */
export const parseGitHubUrl = (url) => {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/(\d+)/;
    const match = url.match(regex);

    if (!match) return null;

    return {
        owner: match[1],
        repo: match[2],
        type: match[3], // 'issues' or 'pull'
        number: parseInt(match[4]),
    };
};

/**
 * Find linked PR for an issue
 */
export const findLinkedPR = async (owner, repo, issueNumber, username, token) => {
    try {
        // Search for PRs that mention this issue
        const query = `repo:${owner}/${repo}+author:${username}+is:pr+${issueNumber}`;
        const data = await fetchGitHub(`/search/issues?q=${query}`, token);

        if (data.items && data.items.length > 0) {
            // Get the most recent PR
            return data.items[0];
        }

        return null;
    } catch (error) {
        console.error(`Error finding linked PR for ${owner}/${repo}#${issueNumber}:`, error);
        return null;
    }
};

/**
 * Sync user's GitHub contributions
 */
export const syncGitHubContributions = async (userId) => {
    try {
        const token = await getGitHubToken();

        if (!token) {
            throw new Error("No GitHub token found. Please reconnect your GitHub account.");
        }

        const username = await getGitHubUsername(token);

        // Fetch all data in parallel
        const [assignedIssues, pullRequests] = await Promise.all([
            fetchAssignedIssues(username, token),
            fetchUserPullRequests(username, token),
        ]);

        console.log(`Found ${assignedIssues.length} assigned issues and ${pullRequests.length} PRs`);

        const contributions = [];

        // Process assigned issues
        for (const issue of assignedIssues) {
            const parsed = parseGitHubUrl(issue.html_url);
            if (!parsed) continue;

            // Check for linked PR
            const linkedPR = await findLinkedPR(parsed.owner, parsed.repo, parsed.number, username, token);

            const contribution = {
                user_id: userId,
                github_issue_number: parsed.number,
                github_repo_owner: parsed.owner,
                github_repo_name: parsed.repo,
                issue_url: issue.html_url,
                issue_title: issue.title,
                issue_state: issue.state,
                is_assigned: true,
                assigned_at: issue.created_at,
                language: issue.repository?.language || null,
                labels: issue.labels?.map(l => l.name) || [],
                last_synced_at: new Date().toISOString(),
            };

            // Add PR data if found
            if (linkedPR) {
                const prParsed = parseGitHubUrl(linkedPR.html_url);
                const prDetails = await fetchPullRequestDetails(prParsed.owner, prParsed.repo, prParsed.number, token);

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
                c => c.github_repo_owner === parsed.owner &&
                    c.github_repo_name === parsed.repo &&
                    c.pr_number === parsed.number
            );

            if (!exists) {
                const prDetails = await fetchPullRequestDetails(parsed.owner, parsed.repo, parsed.number, token);

                const contribution = {
                    user_id: userId,
                    github_issue_number: pr.number, // PR number
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
                    labels: pr.labels?.map(l => l.name) || [],
                    last_synced_at: new Date().toISOString(),
                };

                contributions.push(contribution);
            }
        }

        // Upsert contributions to database
        if (contributions.length > 0) {
            const { data, error } = await supabase
                .from("contributions")
                .upsert(contributions, {
                    onConflict: "user_id,github_repo_owner,github_repo_name,github_issue_number",
                    ignoreDuplicates: false,
                });

            if (error) {
                console.error("Error upserting contributions:", error);
                throw error;
            }

            console.log(`Successfully synced ${contributions.length} contributions`);
        }

        return {
            success: true,
            count: contributions.length,
            lastSynced: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error syncing GitHub contributions:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Get contribution status based on activity
 */
export const getContributionStatus = (contribution) => {
    if (contribution.pr_status === 'merged') {
        return 'merged';
    }

    if (contribution.pr_status === 'open' || contribution.pr_status === 'draft') {
        return 'in_progress';
    }

    if (contribution.pr_status === 'closed' && !contribution.pr_merged_at) {
        return 'closed';
    }

    if (contribution.is_assigned || contribution.has_commented) {
        return 'applied';
    }

    return 'saved';
};

/**
 * Get status display config
 */
export const getStatusConfig = (status) => {
    const configs = {
        saved: {
            label: 'Saved',
            icon: '📌',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
        },
        applied: {
            label: 'Applied',
            icon: '📝',
            color: 'text-amber-400',
            bg: 'bg-amber-500/20',
        },
        in_progress: {
            label: 'In Progress',
            icon: '🔨',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
        },
        merged: {
            label: 'Merged',
            icon: '✅',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
        },
        closed: {
            label: 'Closed',
            icon: '❌',
            color: 'text-red-400',
            bg: 'bg-red-500/20',
        },
    };

    return configs[status] || configs.saved;
};
