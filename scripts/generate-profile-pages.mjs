// Programmatic SEO generator — public Proof of Work profiles (Phase 3).
//
// Runs AFTER `vite build`, alongside generate-seo-pages.mjs. Queries Supabase
// for every profile that has ≥1 verified attestation and writes a fully static,
// crawlable HTML page into the build output:
//
//   dist/u/<username>/index.html   -> indexable public résumé for that user
//   dist/sitemap-profiles.xml      -> sitemap for these profile pages
//
// Same rationale as the language pages: the SPA route /u/:username is not
// indexable on its own, so we emit standalone static HTML at the same path.
// For a direct hit the static file wins (fast + crawlable); the interactive
// SPA view is still reachable via in-app navigation. Reads use the public
// anon key (profiles + user_attestations both have public SELECT RLS).
//
// NON-CRITICAL: any failure logs loudly and exits 0 so it can never break the
// app deploy.

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "dist");

const SITE = "https://firstissue.dev";
const OG_IMAGE = `${SITE}/firstissue01.png`;
const LOGO = "/logo001.png";
const TODAY = new Date().toISOString().slice(0, 10);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function niceDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

// ── Shared HTML chrome (kept in sync with generate-seo-pages.mjs style) ─────
const STYLE = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0B0C10;color:#E5E7EB;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6}
a{color:inherit}
.wrap{max-width:920px;margin:0 auto;padding:0 20px}
header.site{border-bottom:1px solid #1f2430;padding:14px 0}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;color:#fff;text-decoration:none;font-size:15px}
.brand img{width:26px;height:26px;border-radius:6px}
.nav a{color:#9ca3af;text-decoration:none;font-size:13px;margin-left:18px}
.nav a:hover{color:#fff}
.cta{background:#fff;color:#000;padding:8px 14px;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;display:inline-block}
.cta:hover{background:#e4e4e7}
.hero{padding:40px 0 8px;display:flex;gap:22px;align-items:center;flex-wrap:wrap}
.avatar{width:84px;height:84px;border-radius:999px;border:3px solid #1f2430;object-fit:cover}
h1{font-size:30px;line-height:1.15;margin:0 0 6px;color:#fff;letter-spacing:-0.5px}
.sub{color:#9ca3af;font-size:15px;max-width:680px}
.otw{display:inline-flex;align-items:center;gap:8px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#6ee7b7;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;margin-top:10px}
.dot{width:8px;height:8px;border-radius:999px;background:#34d399;display:inline-block}
.stats{display:flex;gap:22px;margin:20px 0 8px;flex-wrap:wrap}
.stat{font-size:13px;color:#9ca3af}
.stat b{display:block;color:#fff;font-size:22px;font-weight:700}
section{padding:26px 0;border-top:1px solid #15181f}
h2{font-size:20px;color:#fff;margin:0 0 14px}
.issue{border:1px solid #1f2430;border-radius:12px;padding:16px 18px;margin-bottom:12px;background:#0e1016}
.issue .repo{font-size:12px;color:#8b93a3;font-family:ui-monospace,monospace}
.issue h3{font-size:16px;margin:6px 0 8px;color:#fff}
.meta{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#6b7280;align-items:center}
.impact{color:#34d399;font-weight:700}
.bigcta{background:linear-gradient(135deg,#0e2a20,#0e1016);border:1px solid #14532d;border-radius:16px;padding:28px;text-align:center;margin-top:8px}
.bigcta h2{margin-bottom:8px}
.bigcta p{color:#9ca3af;margin:0 0 18px}
footer{border-top:1px solid #15181f;padding:28px 0;color:#6b7280;font-size:12px;text-align:center}
`;

function head({ title, description, canonical, jsonld }) {
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${canonical}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<link rel="icon" href="${LOGO}" type="image/png"/>
<meta property="og:type" content="profile"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:image" content="${OG_IMAGE}"/>
<meta property="og:site_name" content="FirstIssue.dev"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${OG_IMAGE}"/>
<link rel="preconnect" href="https://github.com"/>
<style>${STYLE}</style>
${ld}
</head><body>`;
}

const siteHeader = `<header class="site"><div class="wrap">
<a class="brand" href="${SITE}"><img src="${LOGO}" alt="FirstIssue.dev"/> FirstIssue.dev</a>
<nav class="nav">
<a href="${SITE}/explore">Explore</a>
<a class="cta" href="${SITE}/login">Sign up free</a>
</nav></div></header>`;

const siteFooter = `<footer><div class="wrap">© ${new Date().getFullYear()} FirstIssue.dev · Cryptographically verified open source contributions.</div></footer>`;

function renderProfilePage(profile, attestations) {
  const username = profile.github_username;
  const name = profile.name || username;
  const canonical = `${SITE}/u/${username}`;
  const prCount = attestations.length;
  const totalImpact = attestations.reduce((n, a) => n + (a.impact_score || 0), 0);

  const langCounts = {};
  for (const a of attestations) {
    const l = (a.primary_language || "").trim();
    if (l) langCounts[l] = (langCounts[l] || 0) + 1;
  }
  const topLanguages = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);

  const title = `${name} — Open Source Proof of Work | FirstIssue.dev`;
  const description = `${name} (@${username}) has ${prCount} verified merged pull request${prCount === 1 ? "" : "s"} and ${totalImpact} total impact${topLanguages.length ? ` across ${topLanguages.join(", ")}` : ""}. Cryptographically verified open source contributions.`;

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name,
        alternateName: username,
        url: `https://github.com/${username}`,
        image: `https://github.com/${username}.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Verified contributions by ${name}`,
      numberOfItems: prCount,
      itemListElement: attestations.slice(0, 20).map((a, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `${a.repo_name} #${a.pr_number}: ${a.pr_title}`,
      })),
    },
  ];

  const prHtml = attestations
    .map(
      (a) => `<article class="issue">
<div class="repo">${esc(a.repo_name)} #${esc(String(a.pr_number))}</div>
<h3>${esc(a.pr_title || "(untitled)")}</h3>
<div class="meta"><span class="impact">+${a.impact_score || 0} impact</span>${a.primary_language ? `<span>${esc(a.primary_language)}</span>` : ""}${a.merged_at ? `<span>merged ${esc(niceDate(a.merged_at))}</span>` : ""}</div>
</article>`
    )
    .join("\n");

  const otw = profile.open_to_work
    ? `<div class="otw"><span class="dot"></span> Open to opportunities${profile.open_to_work_blurb ? ` — ${esc(profile.open_to_work_blurb)}` : ""}</div>`
    : "";

  return `${head({ title, description, canonical, jsonld })}
${siteHeader}
<main class="wrap">
<div class="hero">
<img class="avatar" src="${esc(profile.github_avatar_url || `https://github.com/${username}.png`)}" alt="${esc(name)}" width="84" height="84"/>
<div>
<h1>${esc(name)}</h1>
<p class="sub"><a href="https://github.com/${esc(username)}" rel="nofollow noopener">github.com/${esc(username)}</a> · Verified Open Source Contributor</p>
${otw}
</div>
</div>
<div class="stats">
<div class="stat"><b>${prCount}</b> merged PRs</div>
<div class="stat"><b>${totalImpact}</b> total impact</div>
${topLanguages.length ? `<div class="stat"><b>${esc(topLanguages[0])}</b> top language</div>` : ""}
</div>

<section>
<h2>Verified Contributions</h2>
${prHtml || '<p class="sub">No verified contributions yet.</p>'}
</section>

<section><div class="bigcta">
<h2>Build your own verified open source résumé</h2>
<p>Mint your merged pull requests into tamper-proof credentials and share a live portfolio like this one.</p>
<a class="cta" href="${SITE}/login">Start free</a>
</div></section>
</main>
${siteFooter}
</body></html>`;
}

function renderSitemap(usernames) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${usernames
    .map((u) => `  <url><loc>${SITE}/u/${esc(u)}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`)
    .join("\n")}
</urlset>
`;
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    console.warn(`[seo:profiles] ${OUT_DIR} not found — run \`vite build\` first. Skipping.`);
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[seo:profiles] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Skipping profile pages.");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Pull all attestations (public RLS), group by user.
  const { data: attestations, error: attErr } = await supabase
    .from("user_attestations")
    .select("user_id, repo_name, pr_number, pr_title, impact_score, primary_language, merged_at")
    .order("merged_at", { ascending: false });

  if (attErr) {
    console.warn(`[seo:profiles] Could not read attestations: ${attErr.message}. Skipping.`);
    return;
  }
  if (!attestations || attestations.length === 0) {
    console.warn("[seo:profiles] No attestations found. Skipping.");
    return;
  }

  const byUser = new Map();
  for (const a of attestations) {
    if (!byUser.has(a.user_id)) byUser.set(a.user_id, []);
    byUser.get(a.user_id).push(a);
  }

  const userIds = [...byUser.keys()];
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, github_username, name, github_avatar_url, open_to_work, open_to_work_blurb")
    .in("id", userIds);

  if (profErr) {
    console.warn(`[seo:profiles] Could not read profiles: ${profErr.message}. Skipping.`);
    return;
  }

  const generated = [];
  for (const profile of profiles || []) {
    if (!profile.github_username) continue;
    try {
      const dir = path.join(OUT_DIR, "u", profile.github_username);
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, "index.html"),
        renderProfilePage(profile, byUser.get(profile.id) || []),
        "utf8",
      );
      generated.push(profile.github_username);
    } catch (e) {
      console.warn(`  [${profile.github_username}] failed: ${e.message}`);
    }
  }

  if (generated.length === 0) {
    console.warn("[seo:profiles] No profile pages generated. App deploy continues.");
    return;
  }

  await writeFile(path.join(OUT_DIR, "sitemap-profiles.xml"), renderSitemap(generated), "utf8");
  console.log(`[seo:profiles] Done. Generated ${generated.length} profile pages + sitemap.`);
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  main().catch((e) => {
    console.error("[seo:profiles] Unexpected error (continuing so the app still deploys):", e);
    process.exit(0);
  });
}
