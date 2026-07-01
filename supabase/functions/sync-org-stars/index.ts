// Supabase Edge Function: sync-org-stars
// Fetches total star counts for all startup_orgs from GitHub and persists them.
//
// Deploy:   supabase functions deploy sync-org-stars
// Invoke:   POST /functions/v1/sync-org-stars  (with service-role or cron trigger)
//
// How star counts are calculated:
//   GitHub organisations don't expose an aggregate "total stars" field.
//   We fetch the org's public repos (up to 100 per page, paginated) and sum
//   their `stargazers_count`.  This mirrors the approach used by tools like
//   star-history and gives the most accurate figure.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";

const GITHUB_API = "https://api.github.com";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Sleep for `ms` milliseconds (used for rate-limit back-off). */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a single GitHub API endpoint with auth + sensible error handling.
 * Returns `null` on 404 / org-not-found so the caller can skip gracefully.
 */
async function ghFetch(endpoint: string, token: string): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "firstissue-star-sync/1.0",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${endpoint}`, { headers });

  if (res.status === 404) return null; // org/repo not found — skip
  if (res.status === 403 || res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? 60);
    console.warn(`Rate limited – waiting ${retryAfter}s`);
    await sleep(retryAfter * 1000);
    // Retry once after back-off
    const retry = await fetch(`${GITHUB_API}${endpoint}`, { headers });
    if (!retry.ok) throw new Error(`GitHub ${retry.status}: ${endpoint}`);
    return retry.json();
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${endpoint}`);
  return res.json();
}

/**
 * Sum stargazers across ALL public repos of a GitHub organisation.
 * Paginates through every page of /orgs/{org}/repos.
 */
async function fetchOrgTotalStars(
  orgLogin: string,
  token: string
): Promise<number> {
  let totalStars = 0;
  let page = 1;

  while (true) {
    const repos = await ghFetch(
      `/orgs/${orgLogin}/repos?type=public&per_page=100&page=${page}`,
      token
    );

    // null  → org doesn't exist / is a user account → try /users endpoint
    if (repos === null) {
      const userRepos = await ghFetch(
        `/users/${orgLogin}/repos?type=public&per_page=100&page=${page}`,
        token
      );
      if (!userRepos || !Array.isArray(userRepos)) break;
      for (const r of userRepos) totalStars += r.stargazers_count ?? 0;
      if (userRepos.length < 100) break;
      page++;
      continue;
    }

    if (!Array.isArray(repos) || repos.length === 0) break;
    for (const r of repos) totalStars += r.stargazers_count ?? 0;
    if (repos.length < 100) break; // last page
    page++;
  }

  return totalStars;
}

// ── Main handler ───────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Allow only POST (or OPTIONS for CORS pre-flight)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use service-role client so we can write to startup_orgs without RLS
  const supabase = createAdminClient();

  // GitHub token from env (set in Supabase dashboard → Edge Functions → Secrets)
  const token = Deno.env.get("GITHUB_TOKEN") ?? "";

  try {
    // 1. Fetch all active startup orgs that we need to sync
    const { data: orgs, error: fetchError } = await supabase
      .from("startup_orgs")
      .select("id, github_name, stars")
      .eq("is_active", true);

    if (fetchError) throw fetchError;
    if (!orgs || orgs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, updated: 0, message: "No orgs found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing stars for ${orgs.length} startup orgs…`);

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // 2. Process orgs in batches of 5 to respect GitHub secondary rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < orgs.length; i += BATCH_SIZE) {
      const batch = orgs.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (org) => {
          try {
            if (!org.github_name) {
              skipped++;
              return;
            }

            const stars = await fetchOrgTotalStars(org.github_name, token);

            // Only update if the value changed (avoids unnecessary writes)
            if (stars === (org.stars ?? 0)) {
              skipped++;
              return;
            }

            const { error: updateError } = await supabase
              .from("startup_orgs")
              .update({
                stars,
                stars_synced_at: new Date().toISOString(),
              })
              .eq("id", org.id);

            if (updateError) {
              errors.push(`${org.github_name}: ${updateError.message}`);
            } else {
              updated++;
              console.log(`✓ ${org.github_name}: ${stars.toLocaleString()} ⭐`);
            }
          } catch (err: any) {
            errors.push(`${org.github_name}: ${err.message}`);
            console.error(`✗ ${org.github_name}:`, err.message);
          }
        })
      );

      // Small delay between batches to be a good API citizen
      if (i + BATCH_SIZE < orgs.length) {
        await sleep(1000);
      }
    }

    const result = {
      success: true,
      total: orgs.length,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      syncedAt: new Date().toISOString(),
    };

    console.log("Sync complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("sync-org-stars error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
