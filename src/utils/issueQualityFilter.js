/**
 * Issue Quality Filter, Query Builder & Readiness Scoring Engine
 * Pure ES module compatible with both Vite/browser runtime and Node.js test runner.
 */

export const EXCLUDED_LABELS = [
  "wontfix",
  "invalid",
  "duplicate",
  "stale",
  "blocked",
  "on hold",
  "need more info",
  "needs info",
  "needs-info",
  "question",
  "discussion",
];

export const MAX_STALE_DAYS_NO_COMMENTS = 180;

const BEGINNER_LABELS = new Set([
  "good first issue",
  "good-first-issue",
  "beginner friendly",
  "beginner-friendly",
  "first-timers-only",
  "easy",
  "starter",
  "up-for-grabs",
]);

const MAINTAINER_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

const TEMPLATE_NOISE_PATTERNS = [
  /^#+\s*(describe the bug|bug description|is your feature request related|to reproduce|steps to reproduce|expected behavior|actual behavior|current behavior|screenshots?|additional context|environment|desktop|smartphone|checklist|prerequisite|system info|version)\b/i,
  /^(please describe|i have searched|i confirm|make sure you|before submitting|note:|thank you for|thanks for)/i,
  /^(none|n\/a|na|tbd|-|\*)+$/i,
];

const FILE_PATH_REGEX =
  /(?:`[^`\s]+\.[a-z0-9]{1,6}(?::\d+)?`|\b(?:src|app|lib|packages?|components?|pages?|utils?|hooks?|services?|tests?|docs?)\/[a-zA-Z0-9_./-]+)/i;

const SCOPE_CUE_REGEX =
  /(?:-\s*\[[ xX]\]|acceptance criteria|expected behavior|steps to reproduce|how to reproduce|requirements?:|^\s*\d+\.\s+\S)/im;

export const QUERY_EXCLUDED_LABELS = ["wontfix", "invalid", "duplicate", "stale"];

const EXCLUDED_LABEL_SET = new Set(EXCLUDED_LABELS.map((l) => l.toLowerCase()));

/**
 * Builds the compact GitHub issue search query fragment for excluded low-quality labels.
 * Kept short so queries with language, multiple labels, and repo filters stay under GitHub's 256-char limit.
 */
export function buildExcludedLabelsQuery() {
  return QUERY_EXCLUDED_LABELS.map((l) => (/\s/.test(l) ? `-label:"${l}"` : `-label:${l}`)).join(" ");
}

/**
 * Returns the number of elapsed days since an ISO timestamp.
 */
export function daysSince(dateStr, now = Date.now()) {
  if (!dateStr) return 0;
  const parsed = new Date(dateStr).getTime();
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, (now - parsed) / 86400000);
}

/**
 * Normalizes a label list (GitHub REST label objects or plain strings) into lowercase strings.
 */
export function getIssueLabelNames(issue) {
  if (!issue || !Array.isArray(issue.labels)) return [];
  return issue.labels
    .map((label) => (typeof label === "string" ? label : label?.name || ""))
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Builds a valid GitHub `/search/issues` query string.
 * - Excludes PRs, linked PRs, archived repos, assigned issues, and noisy labels.
 * - Uses comma-joined `label:"a","b"` (OR semantics) when multiple labels are chosen.
 * - Never emits invalid `stars:>=N` qualifiers into `/search/issues`.
 * - Adds `created:>=YYYY-MM-DD` when `trending` is enabled.
 */
export function buildGitHubIssueSearchQuery({
  labels = [],
  language = "",
  keywords = "",
  trending = false,
  trendingDays = 30,
  extraRepoQualifiers = [],
  now = Date.now(),
} = {}) {
  const repoQuals = (Array.isArray(extraRepoQualifiers) ? extraRepoQualifiers : [])
    .map((repo) => String(repo || "").trim())
    .filter((repo) => /^[\w.-]+\/[\w.-]+$/.test(repo));

  const parts = [
    "state:open",
    "type:issue",
    "is:public",
    "no:assignee",
    "-linked:pr",
    "archived:false",
  ];

  // When scoping by repo: qualifiers, save character budget and rely on filterStaleIssues for excluded labels
  if (repoQuals.length === 0) {
    parts.push(buildExcludedLabelsQuery());
  }

  const cleanLabels = (Array.isArray(labels) ? labels : [])
    .map((l) => String(l || "").trim())
    .filter(Boolean);

  if (cleanLabels.length === 1) {
    parts.push(`label:"${cleanLabels[0]}"`);
  } else if (cleanLabels.length > 1) {
    parts.push(`label:${cleanLabels.map((l) => `"${l}"`).join(",")}`);
  }

  const cleanLang = String(language || "").trim();
  if (cleanLang) {
    parts.push(/\s/.test(cleanLang) ? `language:"${cleanLang}"` : `language:${cleanLang}`);
  }

  if (trending) {
    const safeDays = Math.max(1, Number(trendingDays) || 30);
    const sinceDate = new Date(now - safeDays * 86400000).toISOString().slice(0, 10);
    parts.push(`created:>=${sinceDate}`);
  }

  const cleanKeywords = String(keywords || "").trim();
  const baseLength = parts.join(" ").length + (cleanKeywords ? cleanKeywords.length + 1 : 0);
  let runningLength = baseLength;

  let addedRepos = 0;
  for (const repo of repoQuals) {
    if (addedRepos >= 8) break;
    const term = `repo:${repo}`;
    if (runningLength + term.length + 1 > 250) break;
    parts.push(term);
    runningLength += term.length + 1;
    addedRepos += 1;
  }

  if (cleanKeywords) {
    parts.push(cleanKeywords);
  }

  return parts.join(" ");
}

/**
 * Filters out claimed, locked, archived, PR-shaped, excluded-labeled, stale zero-comment, and under-min-star issues.
 */
export function filterStaleIssues(issues, options = {}) {
  if (!Array.isArray(issues)) return [];
  const {
    minStars = 0,
    maxStaleDaysNoComments = MAX_STALE_DAYS_NO_COMMENTS,
    requireKnownStars = false,
    now = Date.now(),
  } = options;

  const minStarsInt = Math.max(0, parseInt(minStars, 10) || 0);

  return issues.filter((issue) => {
    if (!issue || typeof issue !== "object") return false;
    if (issue.pull_request) return false;
    if (issue.locked || issue.repo_archived) return false;
    if (issue.assignee) return false;
    if (Array.isArray(issue.assignees) && issue.assignees.length > 0) return false;

    const labelNames = getIssueLabelNames(issue);
    if (labelNames.some((label) => EXCLUDED_LABEL_SET.has(label))) return false;

    const comments = Number(issue.comments ?? 0);
    if (daysSince(issue.created_at, now) > maxStaleDaysNoComments && comments === 0) {
      return false;
    }

    if (minStarsInt > 0) {
      if (typeof issue.repo_stars === "number") {
        if (issue.repo_stars < minStarsInt) return false;
      } else if (requireKnownStars) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Strips markdown, HTML comments, template headers, and code blocks into readable summary text.
 */
export function extractCleanSummary(body, maxLength = 175) {
  if (!body || typeof body !== "string") return "";

  let cleaned = body
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ");

  const keptLines = [];
  for (const rawLine of cleaned.split(/\r?\n/)) {
    const line = rawLine
      .replace(/^\s{0,3}>\s?/, "")
      .replace(/^\s*[-*+]\s+\[[ xX]\]\s*/, "")
      .replace(/^\s*[-*+]\s+/, "")
      .replace(/^\s{0,3}#{1,6}\s*/, "")
      .replace(/[*_`~]+/g, "")
      .trim();

    if (!line) continue;
    if (TEMPLATE_NOISE_PATTERNS.some((pattern) => pattern.test(rawLine.trim()) || pattern.test(line))) {
      continue;
    }
    keptLines.push(line);
  }

  const collapsed = keptLines.join(" ").replace(/\s+/g, " ").trim();
  if (!collapsed) return "";
  if (collapsed.length <= maxLength) return collapsed;

  const sliced = collapsed.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.trimEnd()}...`;
}

/**
 * Classifies an issue into a concise contribution category.
 */
export function classifyIssueTaskType(issue) {
  const labels = getIssueLabelNames(issue);
  const text = `${issue?.title || ""} ${(issue?.body || "").slice(0, 600)}`.toLowerCase();

  const hasLabel = (needles) =>
    labels.some((label) => needles.some((needle) => label.includes(needle)));

  if (hasLabel(["doc", "documentation", "readme"]) || /\b(readme|docstring|jsdoc|documentation|typo)\b/.test(text)) {
    return "Docs";
  }
  if (hasLabel(["test", "testing", "qa"]) || /\b(unit test|e2e|integration test|test coverage|vitest|jest|pytest)\b/.test(text)) {
    return "Tests";
  }
  if (hasLabel(["ui", "ux", "css", "a11y", "accessibility", "frontend", "design"]) || /\b(responsive|dark mode|aria-|accessibility|layout|padding|tooltip|css)\b/.test(text)) {
    return "UI";
  }
  if (hasLabel(["bug", "regression", "fix"]) || /\b(crash|exception|broken|regression|stack trace|fails to)\b/.test(text)) {
    return "Bug fix";
  }
  if (hasLabel(["enhancement", "feature"])) {
    return "Feature";
  }
  return null;
}

/**
 * Formats integer star counts into compact readable notation (e.g. 12.4k, 840).
 */
export function formatCompactNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) return null;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(Math.round(value));
}

/**
 * Deterministically scores how beginner-ready and actionable an issue is (5-99).
 */
export function scoreIssueReadiness(issue, now = Date.now()) {
  if (!issue || typeof issue !== "object") {
    return {
      score: 5,
      tier: "fair",
      taskType: null,
      signals: [],
      summary: "",
      reasons: [],
    };
  }

  let score = 45;
  const signals = [];
  const reasons = [];

  const body = typeof issue.body === "string" ? issue.body : "";
  const title = typeof issue.title === "string" ? issue.title : "";
  const combinedText = `${title}\n${body}`;
  const summary = extractCleanSummary(body, 175);
  const labels = getIssueLabelNames(issue);
  const comments = Number(issue.comments ?? 0);

  if (summary.length >= 120) {
    score += 13;
    reasons.push("Detailed problem description");
  } else if (summary.length >= 40) {
    score += 8;
    reasons.push("Clear description");
  } else if (summary.length < 20) {
    score -= 12;
  }

  if (FILE_PATH_REGEX.test(combinedText)) {
    score += 10;
    signals.push({ key: "file_paths", label: "File paths", tone: "positive" });
    reasons.push("References concrete file paths");
  }

  if (SCOPE_CUE_REGEX.test(body)) {
    score += 7;
    signals.push({ key: "clear_scope", label: "Clear scope", tone: "positive" });
    reasons.push("Includes checklist or acceptance criteria");
  }

  if (MAINTAINER_ASSOCIATIONS.has(issue.author_association)) {
    score += 10;
    signals.push({ key: "maintainer", label: "Maintainer", tone: "positive" });
    reasons.push("Opened by repository maintainer");
  }

  if (labels.some((l) => BEGINNER_LABELS.has(l))) {
    score += 8;
    reasons.push("Tagged beginner-friendly");
  }

  if ((issue.reactions?.total_count ?? 0) >= 2) {
    score += 2;
  }

  if (comments === 0) {
    score += 12;
    signals.push({ key: "unclaimed", label: "Unclaimed", tone: "positive" });
    reasons.push("Zero comments so far (unclaimed)");
  } else if (comments <= 2) {
    score += 8;
    signals.push({ key: "low_traffic", label: "Low traffic", tone: "neutral" });
  } else if (comments <= 6) {
    score += 2;
  } else {
    score -= 15;
    signals.push({ key: "hot_thread", label: "Hot thread", tone: "warn" });
    reasons.push("High comment activity (likely discussed/claimed)");
  }

  const createdDays = daysSince(issue.created_at, now);
  const updatedDays = daysSince(issue.updated_at || issue.created_at, now);
  const freshestDays = Math.min(createdDays, updatedDays);

  if (freshestDays <= 14) {
    score += 10;
    reasons.push("Active in the last 14 days");
  } else if (freshestDays <= 45) {
    score += 5;
  } else if (createdDays > 120) {
    score -= 10;
  }

  if (issue.repo_pushed_at) {
    const repoPushDays = daysSince(issue.repo_pushed_at, now);
    if (repoPushDays <= 30) {
      score += 5;
    } else if (repoPushDays > 180) {
      score -= 12;
      reasons.push("Repository has not been pushed to in 6+ months");
    }
  }

  if (issue.repo_health && typeof issue.repo_health.health_score === "number") {
    if (issue.repo_health.health_score >= 75) {
      score += 6;
      reasons.push("Healthy maintainer response rate");
    } else if (issue.repo_health.health_score < 40) {
      score -= 10;
      reasons.push("Slow or inactive repository maintenance");
    }
    if (issue.repo_health.has_contributing) {
      score += 2;
    }
  }

  const clamped = Math.max(5, Math.min(99, Math.round(score)));
  const tier = clamped >= 78 ? "strong" : clamped >= 58 ? "good" : "fair";

  // Sort highest-priority signals first (warn, then positive actionability, then neutral).
  const orderedSignals = [
    ...signals.filter((s) => s.tone === "warn"),
    ...signals.filter((s) => s.tone === "positive"),
    ...signals.filter((s) => s.tone === "neutral"),
  ];

  return {
    score: clamped,
    tier,
    taskType: classifyIssueTaskType(issue),
    signals: orderedSignals,
    summary,
    reasons,
  };
}

function getEffectiveRepoHealthScore(issue, now = Date.now()) {
  if (typeof issue?.repo_health?.health_score === "number") {
    return issue.repo_health.health_score;
  }
  let fallback = 45;
  if (issue?.repo_pushed_at) {
    const pushDays = daysSince(issue.repo_pushed_at, now);
    if (pushDays <= 14) fallback += 16;
    else if (pushDays <= 45) fallback += 8;
    else if (pushDays > 180) fallback -= 20;
  }
  if (typeof issue?.repo_stars === "number") {
    if (issue.repo_stars >= 1000) fallback += 10;
    else if (issue.repo_stars >= 100) fallback += 5;
  }
  return Math.max(5, Math.min(99, fallback));
}

/**
 * Attaches `_readiness` metadata and sorts issues according to the active sort mode.
 */
export function enrichAndSortIssues(issues, sortMode = "updated", now = Date.now()) {
  if (!Array.isArray(issues)) return [];
  const enriched = issues.map((issue) => ({
    ...issue,
    _readiness: scoreIssueReadiness(issue, now),
  }));

  if (sortMode === "health") {
    return enriched.sort((a, b) => {
      const healthDiff = getEffectiveRepoHealthScore(b, now) - getEffectiveRepoHealthScore(a, now);
      if (healthDiff !== 0) return healthDiff;
      const scoreDiff = (b._readiness?.score ?? 0) - (a._readiness?.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (b.repo_stars ?? 0) - (a.repo_stars ?? 0);
    });
  }

  if (sortMode === "best") {
    return enriched.sort((a, b) => {
      const scoreDiff = (b._readiness?.score ?? 0) - (a._readiness?.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      const healthDiff = getEffectiveRepoHealthScore(b, now) - getEffectiveRepoHealthScore(a, now);
      if (healthDiff !== 0) return healthDiff;
      const starsDiff = (b.repo_stars ?? 0) - (a.repo_stars ?? 0);
      if (starsDiff !== 0) return starsDiff;
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
  }

  return enriched;
}
