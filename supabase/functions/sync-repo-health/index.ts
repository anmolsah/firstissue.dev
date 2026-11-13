// Supabase Edge Function: sync-repo-health
// Collects maintainer responsiveness, PR merge rate, onboarding docs, and recency
// for active repositories and persists them to public.repo_health.
//
// Deploy: supabase functions deploy sync-repo-health
// Invoke: POST /functions/v1/sync-repo-health

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";
import { fetchRepoHealthGraphQLBatch } from "../_shared/repoHealth.ts";

function extractOwnerRepo(urlOrSlug?: string | null, org?: string | null, name?: string | null): string | null {
  if (urlOrSlug) {
    try {
      if (urlOrSlug.startsWith("http")) {
        const parts = new URL(urlOrSlug).pathname.replace(/^\/|\/$/g, "").split("/");
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      } else if (/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(urlOrSlug.trim())) {
        return urlOrSlug.trim();
      }
    } catch {
      // fall through
    }
  }
  if (org && name && !name.includes("/")) return `${org}/${name}`;
  if (name && /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(name)) return name;
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ghToken = Deno.env.get("GITHUB_API_TOKEN") || Deno.env.get("GITHUB_TOKEN") || "";
  if (!ghToken) {
    return new Response(JSON.stringify({ error: "Missing GITHUB_API_TOKEN" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const requestedRepos: string[] = Array.isArray(body?.repos) ? body.repos : [];
    const force = Boolean(body?.force);
    const limit = Math.min(100, Math.max(1, Number(body?.limit ?? 60)));

    const supabase = createAdminClient();
    const repoSet = new Set<string>();

    for (const r of requestedRepos) {
      const slug = extractOwnerRepo(r);
      if (slug) repoSet.add(slug);
    }

    if (repoSet.size < limit) {
      const { data: trustedRows } = await supabase
        .from("trusted_repos")
        .select("github_url, organization, name")
        .eq("is_active", true)
        .limit(80);

      for (const row of trustedRows || []) {
        const slug = extractOwnerRepo(row.github_url, row.organization, row.name);
        if (slug) repoSet.add(slug);
      }
    }

    if (repoSet.size < limit) {
      const { data: clickRows } = await supabase
        .from("issue_click_events")
        .select("repo")
        .not("repo", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      for (const row of clickRows || []) {
        const slug = extractOwnerRepo(row.repo);
        if (slug) repoSet.add(slug);
      }
    }

    let targets = Array.from(repoSet).slice(0, limit);

    if (!force && targets.length > 0) {
      const cutoffIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: freshRows } = await supabase
        .from("repo_health")
        .select("repo_full_name, synced_at")
        .in("repo_full_name", targets)
        .gte("synced_at", cutoffIso);

      const freshSet = new Set((freshRows || []).map((r: any) => r.repo_full_name));
      targets = targets.filter((slug) => !freshSet.has(slug));
    }

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0, message: "All target repos are fresh" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const healthMap = await fetchRepoHealthGraphQLBatch(targets, ghToken, 8);
    const records = Object.values(healthMap);

    if (records.length > 0) {
      const { error: upsertError } = await supabase
        .from("repo_health")
        .upsert(records, { onConflict: "repo_full_name" });

      if (upsertError) throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        requested: targets.length,
        synced: records.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[sync-repo-health] error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

