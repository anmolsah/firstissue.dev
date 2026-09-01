// IndexNow URL submission script for Bing, Yahoo, Yandex, Naver.
//
// Reads all URLs from sitemap.xml and submits them via the IndexNow API
// for instant indexing on Bing, Edge, Yahoo, Yandex, and Naver.
//
// Usage:
//   node scripts/submit-indexnow.mjs              # submit all URLs
//   node scripts/submit-indexnow.mjs --dry-run    # preview without submitting
//   node scripts/submit-indexnow.mjs --batch=5    # custom batch size (default: 10)
//   node scripts/submit-indexnow.mjs --retries=5  # max retries per batch (default: 3)
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

// ── CLI flags ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    dryRun: false,
    batchSize: 10,
    maxRetries: 3,
  };

  for (const arg of args) {
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg.startsWith("--batch=")) flags.batchSize = Math.max(1, parseInt(arg.split("=")[1], 10) || 10);
    else if (arg.startsWith("--retries=")) flags.maxRetries = Math.max(1, parseInt(arg.split("=")[1], 10) || 3);
    else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: node scripts/submit-indexnow.mjs [options]

Options:
  --dry-run       Preview URLs without submitting
  --batch=N       URLs per batch (default: 10)
  --retries=N     Max retries on 429/5xx per batch (default: 3)
  -h, --help      Show this help message
`);
      process.exit(0);
    }
  }
  return flags;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Split an array into chunks of a given size. */
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Format milliseconds into a human-readable string. */
function formatMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Core ─────────────────────────────────────────────────────────────────────

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

/**
 * Submit a single batch of URLs with exponential backoff on 429 / 5xx.
 * Returns { success: boolean, accepted: number, status: number | null }
 */
async function submitBatch(urls, batchIndex, totalBatches, maxRetries) {
  const label = `[Batch ${batchIndex + 1}/${totalBatches}]`;

  const payload = {
    host: "firstissue.dev",
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });

      // Success
      if (res.ok || res.status === 200 || res.status === 202) {
        console.log(`   ✅ ${label} Accepted ${urls.length} URLs (HTTP ${res.status})`);
        return { success: true, accepted: urls.length, status: res.status };
      }

      // Rate-limited — retry with backoff
      if (res.status === 429) {
        const backoffMs = Math.min(2 ** attempt * 1000, 60_000); // 2s, 4s, 8s, … capped at 60s
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 || backoffMs : backoffMs;

        if (attempt < maxRetries) {
          console.log(`   ⏳ ${label} Rate-limited (429). Retrying in ${formatMs(waitMs)}… (attempt ${attempt}/${maxRetries})`);
          await sleep(waitMs);
          continue;
        }

        console.error(`   ❌ ${label} Rate-limited (429) after ${maxRetries} attempts. Skipping batch.`);
        return { success: false, accepted: 0, status: 429 };
      }

      // Server error — retry with backoff
      if (res.status >= 500) {
        const backoffMs = 2 ** attempt * 1000;
        if (attempt < maxRetries) {
          console.log(`   ⏳ ${label} Server error (${res.status}). Retrying in ${formatMs(backoffMs)}… (attempt ${attempt}/${maxRetries})`);
          await sleep(backoffMs);
          continue;
        }
      }

      // Other client errors — don't retry
      const body = await res.text();
      console.error(`   ❌ ${label} Failed with HTTP ${res.status}: ${body}`);
      return { success: false, accepted: 0, status: res.status };

    } catch (err) {
      const backoffMs = 2 ** attempt * 1000;
      if (attempt < maxRetries) {
        console.log(`   ⏳ ${label} Network error: ${err.message}. Retrying in ${formatMs(backoffMs)}…`);
        await sleep(backoffMs);
        continue;
      }
      console.error(`   ❌ ${label} Network error after ${maxRetries} attempts: ${err.message}`);
      return { success: false, accepted: 0, status: null };
    }
  }

  return { success: false, accepted: 0, status: null };
}

async function submitToIndexNow(urls, { batchSize, maxRetries }) {
  const batches = chunk(urls, batchSize);
  console.log(`\n🔔 IndexNow: Submitting ${urls.length} URLs in ${batches.length} batch(es) of up to ${batchSize}…\n`);

  let totalAccepted = 0;
  let totalFailed = 0;

  for (let i = 0; i < batches.length; i++) {
    const result = await submitBatch(batches[i], i, batches.length, maxRetries);

    if (result.success) {
      totalAccepted += result.accepted;
    } else {
      totalFailed += batches[i].length;
    }

    // Delay between batches to be respectful of rate limits
    if (i < batches.length - 1) {
      const delayMs = 3000;
      console.log(`   ⏱️  Waiting ${formatMs(delayMs)} before next batch…`);
      await sleep(delayMs);
    }
  }

  // Summary
  console.log(`\n📊 Results: ${totalAccepted} accepted, ${totalFailed} failed out of ${urls.length} total URLs.`);
  if (totalFailed > 0) {
    console.log(`   💡 Tip: Wait a few hours and retry. IndexNow rate limits reset over time.`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const flags = parseArgs();

  console.log("📋 Extracting URLs from sitemap.xml…");
  const urls = await extractUrlsFromSitemap();
  console.log(`   Found ${urls.length} URLs:`);
  urls.forEach((u) => console.log(`   • ${u}`));

  if (urls.length === 0) {
    console.log("⚠️  No URLs found in sitemap. Nothing to submit.");
    return;
  }

  if (flags.dryRun) {
    console.log(`\n🏜️  Dry run — ${urls.length} URLs would be submitted in ${Math.ceil(urls.length / flags.batchSize)} batch(es). No requests sent.`);
  } else {
    await submitToIndexNow(urls, flags);
  }

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
