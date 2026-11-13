import { supabase } from "../lib/supabase";
import { buildUserAffinityProfile, getIssueRepoSlug } from "../utils/userAffinity";
import { classifyIssueTaskType, getIssueLabelNames } from "../utils/issueQualityFilter";

const LOCAL_DISMISSED_KEY = "firstissue_dismissed_urls_v1";
const MAX_LOCAL_DISMISSED = 200;

export function getLocalDismissedUrls() {
  try {
    const raw = localStorage.getItem(LOCAL_DISMISSED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalDismissedUrls(urlSet) {
  try {
    const list = Array.from(urlSet).slice(-MAX_LOCAL_DISMISSED);
    localStorage.setItem(LOCAL_DISMISSED_KEY, JSON.stringify(list));
  } catch {
    // ignore storage quota failures
  }
}

/**
 * Loads user interaction history (bookmarks, PR contributions, feedback/dismissals)
 * cleanly with silent tolerance for pre-migration environments.
 */
export async function fetchUserAffinitySignals(userId) {
  const localDismissed = getLocalDismissedUrls();

  if (!userId) {
    const localRows = Array.from(localDismissed).map((issue_url) => ({
      issue_url,
      feedback: "dismissed",
    }));
    return {
      affinityProfile: buildUserAffinityProfile({ feedbackRows: localRows }),
      dismissedUrls: localDismissed,
    };
  }

  const [bookmarksRes, contribRes, feedbackRes] = await Promise.allSettled([
    supabase.from("bookmarks").select("repo_name, language, issue_url").eq("user_id", userId),
    supabase
      .from("contributions")
      .select("github_repo_owner, github_repo_name, pr_status, pr_merged_at, is_assigned, language, labels")
      .eq("user_id", userId),
    supabase
      .from("issue_feedback")
      .select("issue_url, repo, language, task_type, labels, feedback")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const bookmarks =
    bookmarksRes.status === "fulfilled" && !bookmarksRes.value.error
      ? bookmarksRes.value.data || []
      : [];

  const contributions =
    contribRes.status === "fulfilled" && !contribRes.value.error
      ? contribRes.value.data || []
      : [];

  const remoteFeedback =
    feedbackRes.status === "fulfilled" && !feedbackRes.value.error
      ? feedbackRes.value.data || []
      : [];

  const mergedDismissed = new Set(localDismissed);
  for (const row of remoteFeedback) {
    if (row?.feedback === "dismissed" && row.issue_url) {
      mergedDismissed.add(row.issue_url);
    }
  }

  const remoteDismissedUrls = new Set(
    remoteFeedback.filter((r) => r.feedback === "dismissed").map((r) => r.issue_url)
  );
  const extraLocalRows = Array.from(localDismissed)
    .filter((url) => !remoteDismissedUrls.has(url))
    .map((issue_url) => ({ issue_url, feedback: "dismissed" }));

  const affinityProfile = buildUserAffinityProfile({
    bookmarks,
    contributions,
    feedbackRows: [...remoteFeedback, ...extraLocalRows],
  });

  saveLocalDismissedUrls(mergedDismissed);

  return {
    affinityProfile,
    dismissedUrls: mergedDismissed,
  };
}

/**
 * Dismisses an issue ("Not for me") locally and in Supabase if signed in.
 */
export async function recordDismissal({ userId, issue, language = null }) {
  const issueUrl = issue?.html_url || issue?.url;
  if (!issueUrl) return getLocalDismissedUrls();

  const updated = getLocalDismissedUrls();
  updated.add(issueUrl);
  saveLocalDismissedUrls(updated);

  if (userId) {
    try {
      await supabase.from("issue_feedback").upsert(
        {
          user_id: userId,
          issue_url: issueUrl,
          repo: getIssueRepoSlug(issue) || null,
          language: language || null,
          task_type: issue?._readiness?.taskType || classifyIssueTaskType(issue) || null,
          labels: getIssueLabelNames(issue),
          feedback: "dismissed",
        },
        { onConflict: "user_id,issue_url,feedback" }
      );
    } catch {
      // Tolerate missing migration gracefully while local cache stays effective
    }
  }

  return updated;
}

/**
 * Restores a dismissed issue ("Undo").
 */
export async function undoDismissal({ userId, issueUrl }) {
  const updated = getLocalDismissedUrls();
  updated.delete(issueUrl);
  saveLocalDismissedUrls(updated);

  if (userId && issueUrl) {
    try {
      await supabase
        .from("issue_feedback")
        .delete()
        .eq("user_id", userId)
        .eq("issue_url", issueUrl)
        .eq("feedback", "dismissed");
    } catch {
      // ignore
    }
  }

  return updated;
}

/**
 * Clears all dismissed issues so hidden items can appear again.
 */
export async function clearAllDismissals({ userId }) {
  saveLocalDismissedUrls(new Set());

  if (userId) {
    try {
      await supabase
        .from("issue_feedback")
        .delete()
        .eq("user_id", userId)
        .eq("feedback", "dismissed");
    } catch {
      // ignore
    }
  }

  return new Set();
}

/**
 * Records a lightweight positive feedback signal (bookmark / click) for affinity learning.
 */
export async function recordPositiveSignal({ userId, issue, feedback = "bookmarked", language = null }) {
  const issueUrl = issue?.html_url || issue?.url;
  if (!userId || !issueUrl) return;

  try {
    await supabase.from("issue_feedback").upsert(
      {
        user_id: userId,
        issue_url: issueUrl,
        repo: getIssueRepoSlug(issue) || null,
        language: language || null,
        task_type: issue?._readiness?.taskType || classifyIssueTaskType(issue) || null,
        labels: getIssueLabelNames(issue),
        feedback,
      },
      { onConflict: "user_id,issue_url,feedback" }
    );
  } catch {
    // non-fatal
  }
}

