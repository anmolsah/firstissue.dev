/**
 * Repository Health Scoring & Formatting Utilities
 * Pure ES module compatible with Vite/browser runtime and Node.js test runner.
 */

export function daysSinceTimestamp(dateStr, now = Date.now()) {
  if (!dateStr) return null;
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return null;
  return Math.max(0, (now - ts) / 86400000);
}

/**
 * Formats response / merge duration in hours into compact readable string.
 */
export function formatHoursCompact(hours) {
  if (typeof hours !== "number" || Number.isNaN(hours) || hours < 0) return null;
  if (hours < 1) return "<1h";
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

/**
 * Computes a deterministic median from numeric values, returning null if empty.
 */
export function median(values) {
  const nums = (Array.isArray(values) ? values : [])
    .filter((v) => typeof v === "number" && !Number.isNaN(v) && Number.isFinite(v))
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
}

/**
 * Generates an honest, compact health summary strictly from observed fields.
 */
export function formatRepoHealthSummary(metrics = {}, now = Date.now()) {
  if (!metrics || typeof metrics !== "object") return null;
  if (metrics.is_archived) return "Archived repository";

  const parts = [];

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
    const pushedDays = daysSinceTimestamp(metrics.last_pushed_at, now);
    if (pushedDays !== null) {
      parts.push(pushedDays < 1 ? "Active today" : `Active ${Math.round(pushedDays)}d ago`);
    }
  }

  if (parts.length === 0) return null;
  return parts.slice(0, 3).join(" · ");
}

/**
 * Computes normalized repository health score (0-99), tier, and summary.
 */
export function scoreRepoHealth(metrics = {}, now = Date.now()) {
  if (!metrics || typeof metrics !== "object") {
    return {
      health_score: 50,
      health_tier: "moderate",
      health_summary: null,
    };
  }

  if (metrics.is_archived) {
    return {
      health_score: 0,
      health_tier: "inactive",
      health_summary: "Archived repository",
    };
  }

  let score = 42;

  const pushDays = daysSinceTimestamp(metrics.last_pushed_at, now);
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

