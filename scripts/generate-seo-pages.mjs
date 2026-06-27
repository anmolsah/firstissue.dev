// Programmatic SEO generator — Phase 1 (languages).
//
// Runs AFTER `vite build`. For each language in scripts/seo/languages.mjs it
// queries the live GitHub Search API for open beginner-friendly issues, then
// writes a fully static, crawlable HTML landing page into the build output:
//
//   dist/good-first-issues/                 -> hub page
//   dist/good-first-issues/<slug>/index.html-> per-language page
//   dist/sitemap-good-first-issues.xml      -> sitemap for these pages
//
// These pages are standalone static HTML (not the React SPA): fast, indexable
// without JS, and they link INTO the app to convert visitors. The existing
// SPA catch-all rewrite on Vercel only fires for paths with no matching file,
// so these static files are served as-is.
//
// IMPORTANT: SEO generation is a non-critical enhancement. If GitHub is rate-
// limited or unreachable, we log loudly and still exit 0 so a flaky API can
// never break the app deploy.

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, LABELS, MIN_ISSUES, MAX_ISSUES } from "./seo/languages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "dist");
const BASE = "good-first-issues";

const SITE = "https://firstissue.dev";
const OG_IMAGE = `${SITE}/firstissue01.png`;
const LOGO = "/logo001.png";
const TODAY = new Date().toISOString().slice(0, 10);
const NICE_DATE = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const GITHUB_TOKEN =
  process.env.SEO_GITHUB_TOKEN || process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || "";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function ageLabel(days) {
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// ── Fetch & filter issues for one language ────────────────────────────────
async function fetchIssuesForLanguage(lang) {
  const seen = new Set();
  const issues = [];

  for (const label of LABELS) {
    const q = `state:open type:issue label:"${label}" language:${lang.gh} is:public -label:duplicate -label:invalid`;
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=40`;

    let res;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "firstissue.dev-seo-generator",
          ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
        },
      });
    } catch (e) {
      console.warn(`  [${lang.slug}] network error for "${label}": ${e.message}`);
      continue;
    }

    if (res.status === 403 || res.status === 429) {
      console.warn(`  [${lang.slug}] rate limited (${res.status}); backing off 60s`);
      await sleep(60_000);
      continue;
    }
    if (!res.ok) {
      console.warn(`  [${lang.slug}] GitHub returned ${res.status} for "${label}"`);
      continue;
    }

    const data = await res.json();
    for (const it of data.items || []) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      const repo = (it.repository_url || "").split("/").slice(-2).join("/");
      issues.push({
        id: it.id,
        title: it.title,
        url: it.html_url,
        repo,
        labels: (it.labels || []).map((l) => l.name).filter(Boolean),
        comments: it.comments || 0,
        created_at: it.created_at,
        assigned: !!it.assignee,
        days: daysSince(it.created_at),
      });
    }

    // Throttle to stay under GitHub's search rate limit (30/min authed).
    await sleep(2200);
  }

  // Quality filters: drop assigned and likely-abandoned issues.
  let filtered = issues.filter((i) => !i.assigned && !(i.days > 90 && i.comments === 0));

  // Repo diversity — at most 2 issues from any single repo.
  const perRepo = {};
  filtered = filtered.filter((i) => {
    perRepo[i.repo] = (perRepo[i.repo] || 0) + 1;
    return perRepo[i.repo] <= 2;
  });

  // Newest first, capped.
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return filtered.slice(0, MAX_ISSUES);
}

// ── Shared HTML chrome ────────────────────────────────────────────────────
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
.hero{padding:48px 0 8px}
h1{font-size:34px;line-height:1.15;margin:0 0 12px;color:#fff;letter-spacing:-0.5px}
.sub{color:#9ca3af;font-size:15px;max-width:680px}
.stats{display:flex;gap:22px;margin:22px 0 8px;flex-wrap:wrap}
.stat{font-size:13px;color:#9ca3af}
.stat b{display:block;color:#fff;font-size:22px;font-weight:700}
.updated{font-size:12px;color:#6b7280;margin-top:6px}
section{padding:26px 0;border-top:1px solid #15181f}
h2{font-size:20px;color:#fff;margin:0 0 14px}
.issue{border:1px solid #1f2430;border-radius:12px;padding:16px 18px;margin-bottom:12px;background:#0e1016}
.issue:hover{border-color:#343b4a}
.issue .repo{font-size:12px;color:#8b93a3;font-family:ui-monospace,monospace}
.issue h3{font-size:16px;margin:6px 0 8px}
.issue h3 a{color:#fff;text-decoration:none}
.issue h3 a:hover{color:#a78bfa}
.meta{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#6b7280;align-items:center}
.tags{margin-top:10px;display:flex;gap:6px;flex-wrap:wrap}
.tag{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#9ca3af;border:1px solid #262c38;border-radius:999px;padding:2px 8px}
ul.tips li{margin-bottom:8px;color:#cbd5e1}
.faq{margin-bottom:16px}
.faq .q{font-weight:600;color:#fff;margin-bottom:4px}
.faq .a{color:#9ca3af;font-size:14px}
.related{display:flex;gap:10px;flex-wrap:wrap}
.related a{font-size:13px;color:#cbd5e1;border:1px solid #262c38;border-radius:8px;padding:7px 12px;text-decoration:none}
.related a:hover{border-color:#475063;color:#fff}
.bigcta{background:linear-gradient(135deg,#1b1840,#0e1016);border:1px solid #2a2550;border-radius:16px;padding:28px;text-align:center;margin-top:8px}
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
<meta property="og:type" content="website"/>
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
<a href="${SITE}/${BASE}">Browse by language</a>
<a href="${SITE}/explore">Explore</a>
<a class="cta" href="${SITE}/login">Sign up free</a>
</nav></div></header>`;

const siteFooter = `<footer><div class="wrap">© ${new Date().getFullYear()} FirstIssue.dev · Find your first open source issue. Data from the GitHub API, refreshed regularly.</div></footer>`;

function bigCta(lang) {
  return `<section><div class="bigcta">
<h2>Track these ${lang ? esc(lang) + " " : ""}issues and get AI-matched</h2>
<p>Sign up free to bookmark issues, track your pull requests, and get AI-picked matches for your exact skill level.</p>
<a class="cta" href="${SITE}/login">Start contributing — it's free</a>
</div></section>`;
}

// ── Per-language page ─────────────────────────────────────────────────────
export function renderLanguagePage(lang, issues) {
  const canonical = `${SITE}/${BASE}/${lang.slug}`;
  const repoCount = new Set(issues.map((i) => i.repo)).size;
  const title = `Good First Issues in ${lang.name} (${issues.length}+ Open) | FirstIssue.dev`;
  const description = `${issues.length}+ beginner-friendly ${lang.name} open source issues across ${repoCount} repos, updated ${NICE_DATE}. Find your first "good first issue" or "help wanted" task in ${lang.name} and start contributing.`;

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Good First Issues", item: `${SITE}/${BASE}` },
        { "@type": "ListItem", position: 3, name: lang.name, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Good first issues in ${lang.name}`,
      numberOfItems: issues.length,
      itemListElement: issues.slice(0, 15).map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: i.url,
        name: i.title,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Is ${lang.name} good for first-time open source contributors?`,
          acceptedAnswer: { "@type": "Answer", text: lang.intro },
        },
        {
          "@type": "Question",
          name: `How do I set up a ${lang.name} project to contribute?`,
          acceptedAnswer: { "@type": "Answer", text: lang.setup },
        },
        {
          "@type": "Question",
          name: `What is a "good first issue"?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `A "good first issue" is a GitHub issue maintainers have labelled as suitable for newcomers — usually small, well-described, and low-risk. "Help wanted" issues are similar invitations for outside contributors.`,
          },
        },
      ],
    },
  ];

  const issueHtml = issues
    .map(
      (i) => `<article class="issue">
<div class="repo">${esc(i.repo)}</div>
<h3><a href="${esc(i.url)}" target="_blank" rel="nofollow noopener">${esc(i.title)}</a></h3>
<div class="meta"><span>opened ${ageLabel(i.days)}</span><span>${i.comments} comment${i.comments === 1 ? "" : "s"}</span></div>
<div class="tags">${i.labels.slice(0, 4).map((l) => `<span class="tag">${esc(l)}</span>`).join("")}</div>
</article>`
    )
    .join("\n");

  const related = LANGUAGES.filter((l) => l.slug !== lang.slug)
    .slice(0, 8)
    .map((l) => `<a href="${SITE}/${BASE}/${l.slug}">${esc(l.name)}</a>`)
    .join("");

  return `${head({ title, description, canonical, jsonld })}
${siteHeader}
<main class="wrap">
<div class="hero">
<h1>Good First Issues in ${esc(lang.name)}</h1>
<p class="sub">${esc(lang.intro)}</p>
<div class="stats">
<div class="stat"><b>${issues.length}+</b> open beginner issues</div>
<div class="stat"><b>${repoCount}</b> repositories</div>
<div class="stat"><b>${esc(NICE_DATE)}</b> last updated</div>
</div>
</div>

<section>
<h2>Open ${esc(lang.name)} issues for beginners</h2>
${issueHtml}
</section>

<section>
<h2>How to contribute to a ${esc(lang.name)} project</h2>
<p class="sub">${esc(lang.setup)}</p>
<ul class="tips">
${lang.tips.map((t) => `<li>${esc(t)}</li>`).join("\n")}
</ul>
</section>

${bigCta(lang.name)}

<section>
<h2>Browse good first issues in other languages</h2>
<div class="related">${related}<a href="${SITE}/${BASE}">All languages →</a></div>
</section>
</main>
${siteFooter}
</body></html>`;
}

// ── Hub page ──────────────────────────────────────────────────────────────
export function renderHub(generated) {
  const canonical = `${SITE}/${BASE}`;
  const title = `Good First Issues by Language | FirstIssue.dev`;
  const total = generated.reduce((n, g) => n + g.count, 0);
  const description = `Browse ${total}+ beginner-friendly open source issues across ${generated.length} programming languages. Find a "good first issue" in your language and make your first GitHub contribution.`;

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Good First Issues", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Good first issues by language",
      numberOfItems: generated.length,
      itemListElement: generated.map((g, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE}/${BASE}/${g.slug}`,
        name: `Good first issues in ${g.name}`,
      })),
    },
  ];

  const cards = generated
    .map(
      (g) => `<a class="issue" style="display:block;text-decoration:none" href="${SITE}/${BASE}/${g.slug}">
<h3 style="margin:0 0 6px"><span style="color:#fff">Good first issues in ${esc(g.name)}</span></h3>
<div class="meta"><span>${g.count}+ open beginner issues →</span></div>
</a>`
    )
    .join("\n");

  return `${head({ title, description, canonical, jsonld })}
${siteHeader}
<main class="wrap">
<div class="hero">
<h1>Good First Issues by Language</h1>
<p class="sub">Pick your language and find a beginner-friendly open source issue to start with. Lists are pulled live from GitHub and refreshed regularly. Updated ${esc(NICE_DATE)}.</p>
</div>
<section>
${cards}
</section>
${bigCta()}
</main>
${siteFooter}
</body></html>`;
}

export function renderSitemap(generated) {
  const urls = [
    { loc: `${SITE}/${BASE}`, priority: "0.8" },
    ...generated.map((g) => ({ loc: `${SITE}/${BASE}/${g.slug}`, priority: "0.7" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${u.loc}</loc><lastmod>${TODAY}</lastmod><changefreq>daily</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(OUT_DIR)) {
    console.warn(`[seo] ${OUT_DIR} not found — run \`vite build\` first. Skipping.`);
    return;
  }
  if (!GITHUB_TOKEN) {
    console.warn("[seo] No GitHub token (SEO_GITHUB_TOKEN/GITHUB_TOKEN/VITE_GITHUB_TOKEN). Proceeding unauthenticated — expect rate limits.");
  }

  const generated = [];

  for (const lang of LANGUAGES) {
    try {
      console.log(`[seo] ${lang.name} …`);
      const issues = await fetchIssuesForLanguage(lang);
      if (issues.length < MIN_ISSUES) {
        console.warn(`  [${lang.slug}] only ${issues.length} issues (< ${MIN_ISSUES}); skipping to avoid a thin page.`);
        continue;
      }
      const dir = path.join(OUT_DIR, BASE, lang.slug);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "index.html"), renderLanguagePage(lang, issues), "utf8");
      generated.push({ slug: lang.slug, name: lang.name, count: issues.length });
      console.log(`  [${lang.slug}] ✓ ${issues.length} issues`);
    } catch (e) {
      console.warn(`  [${lang.slug}] failed: ${e.message}`);
    }
  }

  if (generated.length === 0) {
    console.warn("[seo] No pages generated (likely rate-limited). App deploy continues.");
    return;
  }

  await mkdir(path.join(OUT_DIR, BASE), { recursive: true });
  await writeFile(path.join(OUT_DIR, BASE, "index.html"), renderHub(generated), "utf8");
  await writeFile(path.join(OUT_DIR, "sitemap-good-first-issues.xml"), renderSitemap(generated), "utf8");

  console.log(`[seo] Done. Generated ${generated.length} language pages + hub + sitemap.`);
}

// Only run the generator when executed directly (e.g. `node scripts/generate-seo-pages.mjs`),
// not when imported by a test that just wants the render functions.
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  main().catch((e) => {
    // Never fail the build over SEO generation.
    console.error("[seo] Unexpected error (continuing so the app still deploys):", e);
    process.exit(0);
  });
}
