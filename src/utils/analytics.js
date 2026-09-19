/**
 * Analytics Event Tracker
 *
 * Fires custom events to Umami (already loaded in index.html) and
 * optionally logs them to Supabase for first-party analytics ownership.
 *
 * Uses the global `window.umami.track()` API.
 * @see https://umami.is/docs/tracker-functions
 *
 * @module utils/analytics
 */

import { supabase } from '../lib/supabase';

/**
 * Track an outbound issue click event.
 *
 * - Fires a custom Umami event named "issue_click"
 * - Inserts a row into the Supabase `issue_click_events` table
 *
 * Both destinations are fire-and-forget — errors are silently caught
 * so tracking never blocks or breaks user navigation.
 *
 * @param {object} data
 * @param {string} data.issueUrl - The raw GitHub issue URL (without UTM)
 * @param {string} data.source  - Feature surface: 'explore' | 'smart_match' | 'bookmarks' | 'status'
 * @param {string} data.repo    - Repository name (e.g. 'facebook/react')
 * @param {string} data.action  - Click action: 'title_click' | 'view_issue' | 'external_link' | 'repo_link'
 */
export function trackIssueClick({ issueUrl, source, repo, action }) {
  const eventData = {
    url: issueUrl,
    source,
    repo: repo || 'unknown',
    action: action || 'click',
  };

  // ── Umami custom event ──
  try {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('issue_click', eventData);
    }
  } catch {
    // Silently ignore — analytics should never break the app
  }

  // ── Supabase event log (fire-and-forget) ──
  try {
    supabase
      .from('issue_click_events')
      .insert({
        issue_url: issueUrl,
        source,
        repo: repo || 'unknown',
        action: action || 'click',
      })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) {
          console.warn('[analytics] Supabase insert failed:', error.message);
        }
      });
  } catch {
    // Silently ignore
  }
}
