import { supabase } from '../lib/supabase';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contribution-kit`;

/**
 * Parse `owner/repo` and issue number out of a GitHub issue URL.
 * Returns null when the URL isn't a recognizable issue link.
 */
export function parseIssueUrl(url) {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!m) return null;
  return { repo: `${m[1]}/${m[2]}`, issueNumber: Number(m[3]) };
}

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  return headers;
}

/**
 * A thin client for the `contribution-kit` edge function.
 *
 * These are plain async functions (not React state) so a component can own its
 * own loading/error UI. Errors thrown carry `.code` and `.status` so callers
 * can distinguish "out of quota" (429) and "supporters only" (403) from
 * generic failures.
 */
export function useContributionKit() {
  const request = async (payload) => {
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(json.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.code = json.code;
      err.limit = json.limit;
      err.used = json.used;
      throw err;
    }
    return json;
  };

  /**
   * Generate (or fetch the cached) kit for an issue.
   * @param {{repo:string, issueNumber:number, issueTitle?:string, issueBody?:string, issueUrl:string}} issue
   */
  const generateKit = (issue) => request({ action: 'generate', ...issue });

  /**
   * Supporter-only pre-submit diff review.
   * @param {{repo?:string, issueTitle?:string, diff:string}} input
   */
  const reviewDiff = (input) => request({ action: 'review', ...input });

  return { generateKit, reviewDiff };
}
