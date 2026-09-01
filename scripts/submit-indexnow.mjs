// IndexNow URL submission script for Bing, Yahoo, Yandex, Naver.
//
// Reads all URLs from sitemap.xml and submits them via the IndexNow API
// for instant indexing on Bing, Edge, Yahoo, Yandex, and Naver.
//
// Usage:
//   node scripts/submit-indexnow.mjs
//
// Environment:
//   INDEXNOW_KEY  — your IndexNow API key (defaults to the placeholder key)

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SITE = "https://firstissue.dev";
const KEY = process.env.INDEXNOW_KEY || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

// IndexNow endpoints — submitting to one propagates to all partners
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

async function extractUrlsFromSitemap() {
  const sitemapPath = path.join(ROOT, "public", "sitemap.xml");
  const xml = await readFile(sitemapPath, "utf-8");

  const urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function submitToIndexNow(urls) {
  console.log(`\n🔔 IndexNow: Submitting ${urls.length} URLs...\n`);

  const payload = {
    host: "firstissue.dev",
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`✅ IndexNow accepted ${urls.length} URLs (status: ${res.status})`);
    } else {
      const body = await res.text();
      console.error(`❌ IndexNow returned ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error(`❌ IndexNow submission failed:`, err.message);
  }
}

async function main() {
  console.log("📋 Extracting URLs from sitemap.xml...");
  const urls = await extractUrlsFromSitemap();
  console.log(`   Found ${urls.length} URLs:`);
  urls.forEach((u) => console.log(`   • ${u}`));

  if (urls.length === 0) {
    console.log("⚠️  No URLs found in sitemap. Nothing to submit.");
    return;
  }

  await submitToIndexNow(urls);

  console.log("\n📌 Reminder: Submit your sitemap to these services manually:");
  console.log("   • Google Search Console: https://search.google.com/search-console");
  console.log("   • Brave Search: https://search.brave.com/submit-url");
  console.log("   • Yandex Webmaster: https://webmaster.yandex.com");
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
