/**
 * UTM URL Builder Utility
 *
 * Appends UTM tracking parameters to outbound GitHub issue URLs so that
 * repo owners can see firstissue.dev as a traffic source, and we can
 * differentiate clicks by feature surface, campaign, and content target.
 *
 * @module utils/utm
 */

const UTM_SOURCE = 'firstissue.dev';

/**
 * Appends UTM tracking parameters to a GitHub issue URL.
 *
 * @param {string} url - The raw GitHub issue/PR URL
 * @param {object} options
 * @param {string} options.medium  - Traffic medium / feature surface:
 *   'explore' | 'smart_match' | 'bookmarks' | 'status' | 'ai_copilot'
 * @param {string} [options.campaign] - Campaign name for grouping
 *   (e.g. 'react_issues', 'python_beginner')
 * @param {string} [options.content] - Content differentiator for A/B style
 *   tracking (e.g. 'title_click', 'view_issue_btn', 'external_icon')
 * @returns {string} URL with UTM params appended
 */
export function withUTM(url, { medium, campaign, content } = {}) {
  if (!url) return url;

  try {
    const u = new URL(url);

    u.searchParams.set('utm_source', UTM_SOURCE);

    if (medium) {
      u.searchParams.set('utm_medium', medium);
    }

    if (campaign) {
      u.searchParams.set('utm_campaign', campaign);
    }

    if (content) {
      u.searchParams.set('utm_content', content);
    }

    return u.toString();
  } catch {
    // If the URL is malformed, return it unchanged
    return url;
  }
}

/**
 * Extracts the repository name from a GitHub issue URL.
 * e.g. "https://github.com/facebook/react/issues/123" → "facebook/react"
 *
 * @param {string} url - A GitHub URL
 * @returns {string|null} The "owner/repo" string, or null if not parseable
 */
export function extractRepo(url) {
  if (!url) return null;

  try {
    const u = new URL(url);
    if (!u.hostname.includes('github.com')) return null;

    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}
