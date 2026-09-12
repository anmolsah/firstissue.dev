/**
 * Issue Quality Filter Utility
 * 
 * Shared constants and helpers for filtering stale, spam, and incorrectly-labeled
 * GitHub issues. Used by the Explore page (basic hygiene) and the github-data
 * edge function (stricter filtering for Smart Match).
 */

/**
 * Labels that indicate an issue is NOT suitable for new contributors.
 * These are excluded at the GitHub Search API query level.
 */
export const EXCLUDED_LABELS = [
  'duplicate',
  'invalid',
  'wontfix',
  "won't fix",
  'stale',
  'spam',
  'blocked',
  'on hold',
  'not planned',
  'needs triage',
  'cannot reproduce',
];

/**
 * Maximum age (in days) for an issue with 0 comments before it's considered
 * abandoned. Issues older than this with no engagement are filtered out
 * client-side after fetching.
 */
export const MAX_STALE_DAYS_NO_COMMENTS = 180;

/**
 * Build the GitHub Search API exclusion fragment for labels.
 * Returns a string like: -label:duplicate -label:invalid -label:wontfix ...
 */
export function buildExcludedLabelsQuery() {
  return EXCLUDED_LABELS
    .map(label => (label.includes(' ') ? `-label:"${label}"` : `-label:${label}`))
    .join(' ');
}

/**
 * Calculate days since a date string.
 */
function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Post-fetch quality filter for the free Explore page.
 * Removes issues that slipped through the search query but are clearly stale
 * or unsuitable for new contributors.
 *
 * @param {Array} issues - Raw issues from GitHub Search API
 * @returns {Array} Filtered issues
 */
export function filterStaleIssues(issues) {
  return issues.filter(issue => {
    // Filter out assigned issues (someone's already working on it)
    if (issue.assignee) return false;

    // Filter out issues with excluded labels that somehow got through
    const issueLabels = (issue.labels || []).map(l =>
      (typeof l === 'string' ? l : l.name || '').toLowerCase()
    );
    const hasExcludedLabel = EXCLUDED_LABELS.some(excluded =>
      issueLabels.includes(excluded.toLowerCase())
    );
    if (hasExcludedLabel) return false;

    // Filter out very old issues with zero engagement (likely abandoned)
    const age = daysSince(issue.created_at);
    const comments = issue.comments || 0;
    if (age > MAX_STALE_DAYS_NO_COMMENTS && comments === 0) return false;

    return true;
  });
}
