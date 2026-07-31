// Supabase Edge Function: badge-svg
// Public, embeddable Proof of Work badge (README / anywhere via <img>).
// Deploy: supabase functions deploy badge-svg
//
// GET ?u=<github_username>&style=card|flat  ->  image/svg+xml
//
// The badge is the PAID "live distribution" feature:
//   • Active supporters  -> stats recomputed live from user_attestations AND
//                           snapshotted to profiles.badge_stats on every render.
//   • Everyone else      -> the last snapshot is rendered ("frozen"). If no
//                           snapshot exists yet, we compute one, store it, and
//                           render it (so a free badge shows real numbers once,
//                           then stops moving until they subscribe).
//
// This function is registered with verify_jwt = false in config.toml — it is
// hit by <img> requests (GitHub's camo proxy, browsers) that carry no Supabase
// JWT, exactly like kb-query for logged-out visitors.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";
import { isActiveSupporter } from "../_shared/supporter.ts";

interface BadgeStats {
  username: string;
  name: string | null;
  prCount: number;
  totalImpact: number;
  topLanguage: string | null;
  tier: string;
}

// XML-escape text destined for SVG (usernames/names can contain &, <, >, ").
function esc(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tierFor(impact: number, prCount: number): string {
  if (impact >= 400 || prCount >= 25) return "Legend";
  if (impact >= 200 || prCount >= 12) return "Champion";
  if (impact >= 80 || prCount >= 5) return "Contributor";
  if (prCount >= 1) return "Rookie";
  return "Newcomer";
}

// SVG responses always return HTTP 200 (even for "not found") so the <img>
// always shows *something* rather than a broken-image icon.
function svgResponse(svg: string, maxAge = 1800): Response {
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Short cache + SWR: badge stays reasonably fresh but survives traffic
      // spikes. GitHub's camo proxy caches on top of this.
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=86400`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function fallbackSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="80" viewBox="0 0 380 80" role="img" aria-label="${esc(message)}">
  <rect width="380" height="80" rx="10" fill="#0d0e12" stroke="#27272a"/>
  <text x="24" y="34" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12" fill="#a1a1aa" font-weight="700">FIRSTISSUE · PROOF OF WORK</text>
  <text x="24" y="56" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="13" fill="#71717a">${esc(message)}</text>
</svg>`;
}

function cardSvg(s: BadgeStats): string {
  const title = esc(s.name || s.username);
  const lang = s.topLanguage ? esc(s.topLanguage) : "Polyglot";
  const stat = (label: string, value: string, x: number) => `
    <text x="${x}" y="86" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="26" font-weight="800" fill="#fafafa">${esc(value)}</text>
    <text x="${x}" y="106" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="11" font-weight="600" fill="#71717a" letter-spacing="0.5">${esc(label)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="140" viewBox="0 0 480 140" role="img" aria-label="${title} — Proof of Work on FirstIssue">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#34d399"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="479" height="139" rx="16" fill="#0d0e12" stroke="#27272a"/>
  <rect x="0.5" y="0.5" width="6" height="139" rx="3" fill="url(#g)"/>
  <text x="28" y="34" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" font-weight="700" letter-spacing="1" fill="#71717a">FIRSTISSUE · PROOF OF WORK</text>
  <text x="28" y="60" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="20" font-weight="800" fill="#fafafa">${title}</text>
  <g transform="translate(360,44)">
    <rect x="0" y="0" width="96" height="24" rx="12" fill="#10241d" stroke="#134e4a"/>
    <text x="48" y="16" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" fill="#34d399">${esc(s.tier)}</text>
  </g>
  ${stat("MERGED PRs", String(s.prCount), 28)}
  ${stat("IMPACT SCORE", String(s.totalImpact), 168)}
  ${stat("TOP LANGUAGE", lang, 308)}
</svg>`;
}

function flatSvg(s: BadgeStats): string {
  const label = "Proof of Work";
  const value = `${s.prCount} PRs · ${s.totalImpact} impact`;
  // Rough width estimate so the pill isn't clipped.
  const valW = 20 + value.length * 6.6;
  const total = 130 + valW;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(total)}" height="28" viewBox="0 0 ${Math.ceil(total)} 28" role="img" aria-label="${esc(label)}: ${esc(value)}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
  <rect width="130" height="28" rx="6" fill="#18181b"/>
  <rect x="130" width="${Math.ceil(valW)}" height="28" rx="6" fill="url(#g)"/>
  <rect x="124" width="12" height="28" fill="#18181b"/>
  <text x="14" y="18" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="600" fill="#e4e4e7">${esc(label)}</text>
  <text x="${130 + valW / 2}" y="18" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" fill="#0b0c10">${esc(value)}</text>
</svg>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("u") || url.searchParams.get("username") || "").trim();
    const style = (url.searchParams.get("style") || "card").toLowerCase();

    if (!username) {
      return svgResponse(fallbackSvg("Add ?u=<github-username>"));
    }

    const admin = createAdminClient();

    // 1. Resolve the profile by github_username.
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, name, github_username, badge_stats")
      .eq("github_username", username)
      .maybeSingle();

    if (profileError || !profile) {
      return svgResponse(fallbackSvg(`@${username} isn't on FirstIssue yet`));
    }

    // 2. Compute LIVE stats from the user's attestations.
    const { data: attestations } = await admin
      .from("user_attestations")
      .select("impact_score, primary_language")
      .eq("user_id", profile.id);

    const rows = attestations || [];
    const prCount = rows.length;
    const totalImpact = rows.reduce((acc: number, r: any) => acc + (r.impact_score || 0), 0);

    // Modal (most common) primary language.
    const langCounts = new Map<string, number>();
    for (const r of rows) {
      const l = (r.primary_language || "").trim();
      if (l) langCounts.set(l, (langCounts.get(l) || 0) + 1);
    }
    let topLanguage: string | null = null;
    let best = 0;
    for (const [l, c] of langCounts) {
      if (c > best) { best = c; topLanguage = l; }
    }

    const live: BadgeStats = {
      username: profile.github_username,
      name: profile.name,
      prCount,
      totalImpact,
      topLanguage,
      tier: tierFor(totalImpact, prCount),
    };

    // 3. Gating: supporters get live + fresh snapshot; others get the frozen
    //    snapshot (seeded once if none exists yet).
    const supporter = await isActiveSupporter(admin, profile.id);
    let stats: BadgeStats = live;

    if (supporter) {
      await admin
        .from("profiles")
        .update({ badge_stats: live, badge_stats_frozen_at: new Date().toISOString() })
        .eq("id", profile.id);
    } else if (profile.badge_stats) {
      stats = profile.badge_stats as BadgeStats;
    } else {
      // First ever render for a free user: seed and freeze at current numbers.
      await admin
        .from("profiles")
        .update({ badge_stats: live, badge_stats_frozen_at: new Date().toISOString() })
        .eq("id", profile.id);
      stats = live;
    }

    const svg = style === "flat" ? flatSvg(stats) : cardSvg(stats);
    return svgResponse(svg);
  } catch (error) {
    console.error("[badge-svg] Internal error:", error);
    return svgResponse(fallbackSvg("Badge temporarily unavailable"), 60);
  }
});
