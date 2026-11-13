/**
 * User Learning Affinity & Feedback Engine
 * Learns contributor preferences from bookmarks, PR contributions, clicks, and dismissals
 * to re-rank Explore and Smart Match results.
 * Pure ES module compatible with Vite/browser runtime and Node.js test runner.
 */

import { classifyIssueTaskType, getIssueLabelNames } from "./issueQualityFilter.js";

function incrementMap(map, key, amount) {
  const clean = String(key || "").trim().toLowerCase();
  if (!clean || !amount) return;
  map[clean] = (map[clean] || 0) + amount;
}

/**
 * Builds normalized per-user affinity weights from observed interactions.
 */
export function buildUserAffinityProfile({
  bookmarks = [],
  contributions = [],
  feedbackRows = [],
  clickEvents = [],
} = {}) {
  const repos = {};
  const languages = {};
  const taskTypes = {};
  const labels = {};
  const dismissedUrls = new Set();

  for (const contrib of contributions || []) {
    const repoSlug =
      contrib.github_repo_owner && contrib.github_repo_name
        ? `${contrib.github_repo_owner}/${contrib.github_repo_name}`
        : "";
    const status = String(contrib.pr_status || "").toLowerCase();
    const isMerged = status === "merged" || Boolean(contrib.pr_merged_at);
    const repoWeight = isMerged ? 12 : status === "open" || contrib.is_assigned ? 7 : 4;
    const langWeight = isMerged ? 8 : 5;

    incrementMap(repos, repoSlug, repoWeight);
    incrementMap(languages, contrib.language, langWeight);
    for (const label of contrib.labels || []) {
      incrementMap(labels, label, isMerged ? 4 : 2);
    }
  }

  for (const bm of bookmarks || []) {
    incrementMap(repos, bm.repo_name, 5);
    incrementMap(languages, bm.language, 4);
    incrementMap(taskTypes, bm.task_type, 3);
  }

  for (const ev of clickEvents || []) {
    incrementMap(repos, ev.repo, 2);
  }

  for (const fb of feedbackRows || []) {
    if (!fb) continue;
    if (fb.feedback === "dismissed") {
      if (fb.issue_url) dismissedUrls.add(fb.issue_url);
      incrementMap(repos, fb.repo, -10);
      incrementMap(languages, fb.language, -2);
      incrementMap(taskTypes, fb.task_type, -4);
      for (const label of fb.labels || []) {
        incrementMap(labels, label, -3);
      }
    } else if (fb.feedback === "bookmarked") {
      incrementMap(repos, fb.repo, 4);
      incrementMap(taskTypes, fb.task_type, 3);
    } else if (fb.feedback === "merged") {
      incrementMap(repos, fb.repo, 12);
      incrementMap(languages, fb.language, 8);
    } else if (fb.feedback === "clicked") {
      incrementMap(repos, fb.repo, 2);
    }
  }

  return {
    repos,
    languages,
    taskTypes,
    labels,
    dismissedUrls,
    hasSignals:
      Object.keys(repos).length > 0 ||
      Object.keys(languages).length > 0 ||
      Object.keys(taskTypes).length > 0 ||
      dismissedUrls.size > 0,
  };
}

/**
 * Extracts repo slug cleanly from either Smart Match (`issue.repo`) or GitHub Search (`issue.repository_url`).
 */
export function getIssueRepoSlug(issue) {
  if (!issue) return "";
  if (issue.repo) return String(issue.repo).toLowerCase();
  if (issue.repository_url) {
    return String(issue.repository_url).split("/").slice(-2).join("/").toLowerCase();
  }
  return "";
}

/**
 * Scores how well an issue fits a user's historical positive/negative signals (-15 to +18).
 */
export function scoreIssueAffinity(issue, affinityProfile) {
  if (!issue || !affinityProfile) {
    return { delta: 0, isDismissed: false, reasons: [] };
  }

  const url = issue.html_url || issue.url || "";
  if (url && affinityProfile.dismissedUrls?.has(url)) {
    return { delta: -30, isDismissed: true, reasons: ["Hidden by user"] };
  }

  if (!affinityProfile.hasSignals) {
    return { delta: 0, isDismissed: false, reasons: [] };
  }

  let delta = 0;
  const reasons = [];

  const repoSlug = getIssueRepoSlug(issue);
  const repoWeight = affinityProfile.repos?.[repoSlug] || 0;
  if (repoWeight !== 0) {
    const cappedRepo = Math.max(-10, Math.min(10, repoWeight));
    delta += cappedRepo;
    if (cappedRepo >= 5) reasons.push(`Repo affinity (${repoSlug})`);
  }

  const issueLabels = getIssueLabelNames(issue);
  let labelDelta = 0;
  for (const label of issueLabels) {
    labelDelta += affinityProfile.labels?.[label] || 0;
    const langMatch = affinityProfile.languages?.[label] || 0;
    if (langMatch) delta += Math.max(-4, Math.min(6, langMatch));
  }
  if (labelDelta !== 0) {
    delta += Math.max(-4, Math.min(6, labelDelta));
  }

  const taskType = issue.taskType || issue._readiness?.taskType || classifyIssueTaskType(issue);
  if (taskType) {
    const typeWeight = affinityProfile.taskTypes?.[taskType.toLowerCase()] || 0;
    if (typeWeight !== 0) {
      delta += Math.max(-4, Math.min(6, typeWeight));
      if (typeWeight >= 3) reasons.push(`Preferred task: ${taskType}`);
    }
  }

  return {
    delta: Math.max(-15, Math.min(18, Math.round(delta))),
    isDismissed: false,
    reasons,
  };
}

/**
 * Filters out dismissed issues, attaches `_affinity`, and applies personal ranking boost on 'best' sort.
 */
export function applyUserAffinity(issues, sortMode = "updated", affinityProfile = null) {
  if (!Array.isArray(issues)) return [];
  if (!affinityProfile) return issues;

  const kept = [];
  for (const issue of issues) {
    const affinity = scoreIssueAffinity(issue, affinityProfile);
    if (affinity.isDismissed) continue;
    kept.push({
      ...issue,
      _affinity: affinity,
    });
  }

  if (sortMode === "best") {
    return kept.sort((a, b) => {
      const aScore = (a._readiness?.score ?? 50) + Math.round((a._affinity?.delta ?? 0) * 0.7);
      const bScore = (b._readiness?.score ?? 50) + Math.round((b._affinity?.delta ?? 0) * 0.7);
      if (bScore !== aScore) return bScore - aScore;
      return (b.repo_stars ?? 0) - (a.repo_stars ?? 0);
    });
  }

  return kept;
}
