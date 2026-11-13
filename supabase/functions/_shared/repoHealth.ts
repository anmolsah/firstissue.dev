/**
 * Shared Repository Health Computation, GraphQL Batching & Caching
 * Used by both `github-data` and `sync-repo-health` Edge Functions.
 */

const GITHUB_API_BASE = "https://api.github.com";

export interface RepoHealthRecord {
  repo_full_name: string;
  stars: number;
  open_issues_count: number;
  is_archived: boolean;
  has_contributing: boolean;
  has_code_of_conduct: boolean;
  last_pushed_at: string | null;
  median_pr_merge_hours: number | null;
  median_issue_reply_hours: number | null;
  first_timer_merge_rate: number | null;
  merged_prs_30d: number;
  good_first_issue_count: number;
  health_score: number;
  health_tier: "healthy" | "moderate" | "slow" | "inactive";
  health_summary: string | null;
  synced_at: string;
}

const MAINTAINER_ROLES = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const COMMUNITY_ROLES = new Set([
  "FIRST_TIME_CONTRIBUTOR",
  "FIRST_TIMER",
  "CONTRIBUTOR",
  "NONE",
]);

function daysSince(dateStr: string | null | undefined, now = Date.now()): number | null {
  if (!dateStr) return null;
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return null;
  return Math.max(0, (now - ts) / 86400000);
}

function median(values: number[]): number | null {
  const nums = values
    .filter((v) => typeof v === "number" && !Number.isNaN(v) && Number.isFinite(v))
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
}

function formatHoursCompact(hours: number | null): string | null {
  if (typeof hours !== "number" || Number.isNaN(hours) || hours < 0) return null;
  if (hours < 1) return "<1h";
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function formatRepoHealthSummary(
  metrics: Partial<RepoHealthRecord>,
  now = Date.now()
): string | null {
  if (metrics.is_archived) return "Archived repository";
  const parts: string[] = [];

  if (typeof metrics.median_pr_merge_hours === "number") {
    const label = formatHoursCompact(metrics.median_pr_merge_hours);
    if (label) parts.push(`~${label} PR merge`);
  } else if (typeof metrics.median_issue_reply_hours === "number") {
    const label = formatHoursCompact(metrics.median_issue_reply_hours);
    if (label) parts.push(`~${label} reply`);
  }

  if (typeof metrics.first_timer_merge_rate === "number") {
    parts.push(`${Math.round(metrics.first_timer_merge_rate * 100)}% PRs merged`);
  } else if ((metrics.merged_prs_30d ?? 0) > 0) {
    parts.push(`${metrics.merged_prs_30d} PRs/30d`);
  }

  if (metrics.has_contributing) {
    parts.push("CONTRIBUTING.md");
  } else {
    const pushDays = daysSince(metrics.last_pushed_at, now);
    if (pushDays !== null) {
      parts.push(pushDays < 1 ? "Active today" : `Active ${Math.round(pushDays)}d ago`);
    }
  }

  return parts.length > 0 ? parts.slice(0, 3).join(" · ") : null;
}

export function scoreRepoHealth(
  metrics: Partial<RepoHealthRecord>,
  now = Date.now()
): Pick<RepoHealthRecord, "health_score" | "health_tier" | "health_summary"> {
  if (metrics.is_archived) {
    return {
      health_score: 0,
      health_tier: "inactive",
      health_summary: "Archived repository",
    };
  }

  let score = 42;

  const pushDays = daysSince(metrics.last_pushed_at, now);
  if (pushDays !== null) {
    if (pushDays <= 7) score += 20;
    else if (pushDays <= 30) score += 14;
    else if (pushDays <= 90) score += 6;
    else if (pushDays > 180) score -= 22;
  }

  const responseHours =
    typeof metrics.median_pr_merge_hours === "number"
      ? metrics.median_pr_merge_hours
      : typeof metrics.median_issue_reply_hours === "number"
        ? metrics.median_issue_reply_hours
        : null;

  if (responseHours !== null) {
    if (responseHours <= 48) score += 18;
    else if (responseHours <= 120) score += 12;
    else if (responseHours <= 336) score += 5;
    else if (responseHours > 720) score -= 10;
  }

  if (typeof metrics.first_timer_merge_rate === "number") {
    if (metrics.first_timer_merge_rate >= 0.6) score += 14;
    else if (metrics.first_timer_merge_rate >= 0.35) score += 8;
    else if (metrics.first_timer_merge_rate < 0.15) score -= 8;
  }

  const merged30d = Number(metrics.merged_prs_30d ?? 0);
  if (merged30d >= 5) score += 6;
  else if (merged30d >= 1) score += 3;

  if (metrics.has_contributing) score += 8;
  if (metrics.has_code_of_conduct) score += 2;

  const stars = Number(metrics.stars ?? 0);
  if (stars >= 100) score += 4;
  else if (stars > 0 && stars < 5) score -= 4;

  const health_score = Math.max(5, Math.min(99, Math.round(score)));
  const health_tier =
    health_score >= 75 ? "healthy" : health_score >= 52 ? "moderate" : "slow";

  return {
    health_score,
    health_tier,
    health_summary: formatRepoHealthSummary(metrics, now),
  };
}

export function buildRepoHealthFromGraphQLNode(
  fullName: string,
  node: any,
  now = Date.now()
): RepoHealthRecord {
  const prNodes: any[] = node?.recentPRs?.nodes || [];
  const issueNodes: any[] = node?.recentIssues?.nodes || [];

  const mergeHours: number[] = [];
  let merged30d = 0;

  for (const pr of prNodes) {
    if (pr?.state === "MERGED" && pr.mergedAt && pr.createdAt) {
      const hours = (new Date(pr.mergedAt).getTime() - new Date(pr.createdAt).getTime()) / 3600000;
      if (hours >= 0 && !Number.isNaN(hours)) mergeHours.push(hours);
      const mergeDays = daysSince(pr.mergedAt, now);
      if (mergeDays !== null && mergeDays <= 30) merged30d++;
    }
  }

  const communityResolved = prNodes.filter(
    (pr) =>
      COMMUNITY_ROLES.has(pr?.authorAssociation) &&
      (pr?.state === "MERGED" || pr?.state === "CLOSED")
  );
  const allResolved = prNodes.filter(
    (pr) => pr?.state === "MERGED" || pr?.state === "CLOSED"
  );
  const rateSample = communityResolved.length >= 3 ? communityResolved : allResolved;
  const firstTimerMergeRate =
    rateSample.length >= 3
      ? Number(
          (
            rateSample.filter((pr) => pr.state === "MERGED").length / rateSample.length
          ).toFixed(2)
        )
      : null;

  const replyHours: number[] = [];
  for (const issue of issueNodes) {
    const comments: any[] = issue?.comments?.nodes || [];
    if (!issue?.createdAt || comments.length === 0) continue;
    const maintainerComment =
      comments.find((c) => MAINTAINER_ROLES.has(c?.authorAssociation)) || comments[0];
    if (maintainerComment?.createdAt) {
      const hours =
        (new Date(maintainerComment.createdAt).getTime() -
          new Date(issue.createdAt).getTime()) /
        3600000;
      if (hours >= 0 && !Number.isNaN(hours)) replyHours.push(hours);
    }
  }

  const medianMerge = median(mergeHours);
  const medianReply = median(replyHours);

  const raw: Partial<RepoHealthRecord> = {
    repo_full_name: fullName,
    stars: Number(node?.stargazerCount ?? 0),
    open_issues_count: Number(node?.openIssues?.totalCount ?? 0),
    is_archived: Boolean(node?.isArchived),
    has_contributing: Boolean(node?.contributingRoot || node?.contributingGithub),
    has_code_of_conduct: Boolean(node?.codeOfConduct?.key),
    last_pushed_at: node?.pushedAt ?? null,
    median_pr_merge_hours: medianMerge !== null ? Number(medianMerge.toFixed(1)) : null,
    median_issue_reply_hours: medianReply !== null ? Number(medianReply.toFixed(1)) : null,
    first_timer_merge_rate: firstTimerMergeRate,
    merged_prs_30d: merged30d,
    good_first_issue_count: Number(node?.gfiIssues?.totalCount ?? 0),
    synced_at: new Date(now).toISOString(),
  };

  const scored = scoreRepoHealth(raw, now);

  return {
    ...(raw as RepoHealthRecord),
    ...scored,
  };
}

export async function fetchRepoHealthGraphQLBatch(
  repos: string[],
  ghToken: string,
  chunkSize = 8
): Promise<Record<string, RepoHealthRecord>> {
  const validRepos = Array.from(
    new Set(repos.filter((r) => /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(r)))
  );
  const results: Record<string, RepoHealthRecord> = {};
  if (!ghToken || validRepos.length === 0) return results;

  for (let i = 0; i < validRepos.length; i += chunkSize) {
    const chunk = validRepos.slice(i, i + chunkSize);
    const fields = chunk
      .map((fullName, idx) => {
        const [owner, name] = fullName.split("/");
        return `r${idx}: repository(owner: "${owner}", name: "${name}") {
          stargazerCount
          pushedAt
          isArchived
          contributingRoot: object(expression: "HEAD:CONTRIBUTING.md") { __typename }
          contributingGithub: object(expression: "HEAD:.github/CONTRIBUTING.md") { __typename }
          codeOfConduct { key }
          openIssues: issues(states: OPEN) { totalCount }
          gfiIssues: issues(states: OPEN, labels: ["good first issue"]) { totalCount }
          recentPRs: pullRequests(first: 12, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              state
              createdAt
              mergedAt
              authorAssociation
            }
          }
          recentIssues: issues(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              createdAt
              comments(first: 5) {
                nodes {
                  createdAt
                  authorAssociation
                }
              }
            }
          }
        }`;
      })
      .join("\n");

    try {
      const res = await fetch(`${GITHUB_API_BASE}/graphql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          "Content-Type": "application/json",
          "User-Agent": "firstissue.dev",
        },
        body: JSON.stringify({ query: `query {\n${fields}\n}` }),
      });

      if (!res.ok) continue;
      const payload = await res.json();
      const data = payload?.data || {};

      chunk.forEach((fullName, idx) => {
        const node = data[`r${idx}`];
        if (!node) return;
        results[fullName] = buildRepoHealthFromGraphQLNode(fullName, node);
      });
    } catch (e) {
      console.error("[repoHealth] GraphQL batch error:", e);
    }
  }

  return results;
}

