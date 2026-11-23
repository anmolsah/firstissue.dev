// Supabase Edge Function: Contribution Kit
// Deploy: supabase functions deploy contribution-kit
//
// Two actions:
//   • generate — turn a GitHub issue into a "how to start" kit (setup steps,
//     verified files to touch from the real repo tree, a drafted claim comment,
//     PR description template, and repo gotchas).
//     Free accounts get FREE_MONTHLY_KITS per calendar month; supporters are
//     unlimited. Re-opening an already-generated kit is served from cache and
//     never consumes a credit.
//   • review — supporter-only pre-submit diff review: paste a diff and get back
//     what a maintainer is likely to reject before you open the PR.
//
// Both are gated server-side because they call a billed AI provider.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createUserClient, createAdminClient } from "../_shared/supabaseClient.ts";
import { isActiveSupporter, FREE_MONTHLY_KITS } from "../_shared/supporter.ts";

const GITHUB_API_BASE = "https://api.github.com";
const REPO_SLUG_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

const IGNORED_TREE_SEGMENTS = new Set([
  "node_modules",
  "vendor",
  "dist",
  "build",
  ".next",
  "out",
  "coverage",
  "__pycache__",
  ".git",
  ".venv",
  "venv",
  "target",
  "pods",
  ".cache",
  ".turbo",
  ".yarn",
  "third_party",
  "bower_components",
]);

const IGNORED_TREE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".mp4", ".mov", ".webm", ".mp3", ".wav",
  ".pdf", ".zip", ".tar", ".gz", ".bz2", ".jar",
  ".exe", ".dll", ".so", ".dylib", ".wasm",
  ".lock", ".map", ".pyc", ".pyo", ".class", ".o",
]);

const IGNORED_TREE_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
  "cargo.lock",
  "poetry.lock",
  "gemfile.lock",
  "composer.lock",
  "go.sum",
  "flake.lock",
]);

const ROOT_MANIFEST_CANDIDATES = [
  "package.json",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
  "Makefile",
];

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "when", "into",
  "your", "about", "should", "would", "could", "there", "their", "which", "while",
  "where", "what", "does", "make", "need", "needs", "issue", "error", "bug",
  "feature", "please", "thanks", "using", "used", "add", "fix", "update",
  "change", "support", "allow", "implement", "create", "remove", "improve",
]);

interface RepoTreeCache {
  paths: string[];
  defaultBranch: string;
  truncated: boolean;
}

interface LiveIssueDetails {
  title: string;
  body: string;
  state: string;
  assigned: boolean;
  comments: number;
}

// Decode GitHub's base64 file content as UTF-8 (plain atob mangles multi-byte
// characters, which READMEs routinely contain).
function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function githubHeaders(ghToken?: string): Record<string, string> {
  return {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "firstissue-contribution-kit",
    ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
  };
}

// ── Upstash Redis helpers (README/CONTRIBUTING/tree cached to spare the ──
// GitHub rate limit; identical to the pattern in github-data).
async function redisGet(key: string) {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["GET", key]),
    });
    const data = await res.json();
    if (data.result) return JSON.parse(data.result);
  } catch (e) {
    console.error(`[Redis GET] ${key}:`, e);
  }
  return null;
}

async function redisSet(key: string, value: unknown, ex: number) {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", key, JSON.stringify(value), "EX", ex]),
    });
  } catch (e) {
    console.error(`[Redis SET] ${key}:`, e);
  }
}

// Fetch a repo doc (README or CONTRIBUTING) as decoded text, or "" if absent.
async function fetchRepoDoc(repo: string, kind: "readme" | "contributing", ghToken?: string): Promise<string> {
  const cacheKey = `repodoc:${kind}:${repo}`;
  const cached = await redisGet(cacheKey);
  if (cached !== null) return cached as string;

  const headers = githubHeaders(ghToken);

  let text = "";
  try {
    if (kind === "readme") {
      const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/readme`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.content) text = decodeBase64Utf8(json.content);
      }
    } else {
      // CONTRIBUTING can live in several conventional locations.
      const candidates = [
        "CONTRIBUTING.md",
        ".github/CONTRIBUTING.md",
        "docs/CONTRIBUTING.md",
        "CONTRIBUTING",
      ];
      for (const path of candidates) {
        const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.content) {
            text = decodeBase64Utf8(json.content);
            break;
          }
        }
      }
    }
  } catch (e) {
    console.error(`[fetchRepoDoc] ${repo} ${kind}:`, e);
  }

  // Cap length so we don't blow the prompt budget on huge READMEs.
  text = (text || "").slice(0, 6000);
  // Cache for 24h (including empty results, to avoid re-hitting 404s).
  await redisSet(cacheKey, text, 86400);
  return text;
}

function isUsefulTreePath(path: string): boolean {
  if (!path || path.length > 220) return false;
  const parts = path.split("/");
  for (let i = 0; i < parts.length - 1; i++) {
    if (IGNORED_TREE_SEGMENTS.has(parts[i].toLowerCase())) return false;
  }
  const fileName = parts[parts.length - 1].toLowerCase();
  if (IGNORED_TREE_FILENAMES.has(fileName)) return false;
  if (fileName.endsWith(".min.js") || fileName.endsWith(".min.css")) return false;
  const dotIdx = fileName.lastIndexOf(".");
  if (dotIdx !== -1) {
    const ext = fileName.slice(dotIdx);
    if (IGNORED_TREE_EXTENSIONS.has(ext)) return false;
  }
  return true;
}

// Fetch filtered repository file paths via GitHub Git Trees API (cached 24h).
async function fetchRepoTree(repo: string, ghToken?: string): Promise<RepoTreeCache> {
  const cacheKey = `repotree:v1:${repo}`;
  const cached = await redisGet(cacheKey);
  if (cached && Array.isArray(cached.paths)) {
    return cached as RepoTreeCache;
  }

  const headers = githubHeaders(ghToken);
  let defaultBranch = "HEAD";
  let treeJson: { tree?: Array<{ path?: string; type?: string }>; truncated?: boolean } | null = null;

  try {
    let res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/git/trees/HEAD?recursive=1`, { headers });
    if (!res.ok) {
      const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${repo}`, { headers });
      if (repoRes.ok) {
        const repoJson = await repoRes.json();
        if (repoJson?.default_branch) {
          defaultBranch = String(repoJson.default_branch);
          res = await fetch(
            `${GITHUB_API_BASE}/repos/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
            { headers },
          );
        }
      }
    }

    if (res.ok) {
      treeJson = await res.json();
    }
  } catch (e) {
    console.error(`[fetchRepoTree] ${repo}:`, e);
  }

  const rawTree = Array.isArray(treeJson?.tree) ? treeJson!.tree! : [];
  const filteredPaths: string[] = [];
  for (const item of rawTree) {
    if (item?.type !== "blob" || typeof item.path !== "string") continue;
    if (!isUsefulTreePath(item.path)) continue;
    filteredPaths.push(item.path);
  }

  // Keep shallower paths prioritized if a massive monorepo exceeds 2,500 files.
  const paths =
    filteredPaths.length <= 2500
      ? filteredPaths
      : filteredPaths
          .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b))
          .slice(0, 2500);

  const result: RepoTreeCache = {
    paths,
    defaultBranch,
    truncated: Boolean(treeJson?.truncated) || filteredPaths.length > 2500,
  };

  await redisSet(cacheKey, result, 86400);
  return result;
}

// Fetch the root build manifest (e.g. package.json / pyproject.toml / Cargo.toml / go.mod)
// so setup & test commands come directly from real project scripts when README is thin.
async function fetchRepoManifest(
  repo: string,
  treePaths: string[],
  ghToken?: string,
): Promise<{ file: string; content: string } | null> {
  const cacheKey = `repomanifest:v1:${repo}`;
  const cached = await redisGet(cacheKey);
  if (cached !== null) return cached || null;

  const rootFiles = new Set(treePaths.filter((p) => !p.includes("/")));
  const targetFile = ROOT_MANIFEST_CANDIDATES.find((c) => rootFiles.has(c)) ||
    (treePaths.length === 0 ? "package.json" : null);

  if (!targetFile) {
    await redisSet(cacheKey, "", 86400);
    return null;
  }

  let manifest: { file: string; content: string } | null = null;
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${targetFile}`, {
      headers: githubHeaders(ghToken),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.content) {
        let decoded = decodeBase64Utf8(json.content);
        if (targetFile === "package.json") {
          try {
            const pkg = JSON.parse(decoded);
            const compact = {
              name: pkg.name,
              packageManager: pkg.packageManager,
              engines: pkg.engines,
              scripts: pkg.scripts,
              workspaces: pkg.workspaces,
            };
            decoded = JSON.stringify(compact, null, 2);
          } catch {
            // Keep raw slice if malformed
          }
        }
        manifest = { file: targetFile, content: decoded.slice(0, 2500) };
      }
    }
  } catch (e) {
    console.error(`[fetchRepoManifest] ${repo} ${targetFile}:`, e);
  }

  await redisSet(cacheKey, manifest || "", 86400);
  return manifest;
}

// Fetch full live issue details from GitHub so kits opened from Bookmarks or
// Smart Match (which may not carry the full body) still get rich context +
// live open/assigned status.
async function fetchLiveIssueDetails(
  repo: string,
  issueNumber: number,
  ghToken?: string,
): Promise<LiveIssueDetails | null> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${repo}/issues/${issueNumber}`, {
      headers: githubHeaders(ghToken),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const assigned = Boolean(json.assignee) ||
      (Array.isArray(json.assignees) && json.assignees.length > 0);
    return {
      title: typeof json.title === "string" ? json.title : "",
      body: typeof json.body === "string" ? json.body : "",
      state: typeof json.state === "string" ? json.state : "open",
      assigned,
      comments: Number(json.comments ?? 0),
    };
  } catch (e) {
    console.error(`[fetchLiveIssueDetails] ${repo}#${issueNumber}:`, e);
    return null;
  }
}

// Rank real repo paths by relevance to the issue text + structural value so
// the LLM receives a compact, high-signal slice of real files.
function selectRelevantTreePaths(
  allPaths: string[],
  issueTitle: string,
  issueBody: string,
  maxPaths = 180,
): string[] {
  if (!allPaths.length) return [];
  if (allPaths.length <= maxPaths) return [...allPaths].sort();

  const text = `${issueTitle}\n${issueBody}`.toLowerCase();
  const rawTokens = text.match(/[a-z0-9_.-]{3,}/g) || [];
  const tokens = Array.from(
    new Set(rawTokens.filter((t) => !STOP_WORDS.has(t) && !/^\d+$/.test(t))),
  ).slice(0, 60);

  const rootConfigs = new Set([
    "package.json",
    "pyproject.toml",
    "cargo.toml",
    "go.mod",
    "makefile",
    "dockerfile",
    "tsconfig.json",
    "composer.json",
    "gemfile",
    "pom.xml",
    "build.gradle",
  ]);

  const scored = allPaths.map((p) => {
    const lower = p.toLowerCase();
    const segments = lower.split("/");
    const fileName = segments[segments.length - 1];
    const stem = fileName.replace(/\.[^.]+$/, "");
    let score = 0;

    if (text.includes(lower)) score += 60;
    else if (fileName.length >= 5 && text.includes(fileName)) score += 40;

    for (const tok of tokens) {
      if (stem === tok || fileName === tok) {
        score += 16;
      } else if (fileName.includes(tok)) {
        score += 10;
      } else if (lower.includes(tok)) {
        score += 4;
      }
    }

    if (segments.length === 1 && rootConfigs.has(fileName)) score += 14;
    if (segments.length <= 2) score += 4;
    if (/^(src|app|lib|packages?|components?|pages?|internal|cmd|api|docs|tests?)\//.test(lower)) {
      score += 2;
    }

    return { path: p, score, depth: segments.length };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.depth - b.depth || a.path.localeCompare(b.path))
    .slice(0, maxPaths)
    .map((x) => x.path)
    .sort();
}

function normalizeCandidatePath(rawPath: string): string {
  return String(rawPath || "")
    .trim()
    .replace(/^`+|`+$/g, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

// Verify each AI-suggested path against the real repository tree.
function verifyFilesAgainstTree(
  filesToTouch: Array<{ path?: string; reason?: string }>,
  allPaths: string[],
): Array<{ path: string; reason: string; verified: boolean; kind?: "file" | "dir" }> {
  if (!Array.isArray(filesToTouch)) return [];
  if (!allPaths.length) {
    return filesToTouch
      .filter((f) => f && f.path)
      .map((f) => ({
        path: normalizeCandidatePath(f.path || ""),
        reason: String(f.reason || ""),
        verified: false,
      }));
  }

  const fileMap = new Map<string, string>();
  const dirMap = new Map<string, string>();

  for (const p of allPaths) {
    fileMap.set(p.toLowerCase(), p);
    const parts = p.split("/");
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      const lowerPrefix = prefix.toLowerCase();
      if (!dirMap.has(lowerPrefix)) dirMap.set(lowerPrefix, prefix);
    }
  }

  return filesToTouch
    .filter((f) => f && f.path)
    .map((f) => {
      const normalized = normalizeCandidatePath(f.path || "");
      const lower = normalized.toLowerCase();

      const exactFile = fileMap.get(lower);
      if (exactFile) {
        return { path: exactFile, reason: String(f.reason || ""), verified: true, kind: "file" as const };
      }

      const exactDir = dirMap.get(lower);
      if (exactDir) {
        return { path: exactDir, reason: String(f.reason || ""), verified: true, kind: "dir" as const };
      }

      return { path: normalized, reason: String(f.reason || ""), verified: false };
    });
}

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseJsonResponse(rawContent: string) {
  const cleaned = rawContent.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Malformed JSON in AI response");
  }
}

async function callGrok(systemPrompt: string, userPrompt: string, maxTokens: number) {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) throw new Error("xAI API key not configured");

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4.3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`xAI error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No AI response content");

  return parseJsonResponse(content);
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Authenticate ──
    let userClient;
    try {
      userClient = createUserClient(req);
    } catch {
      return jsonResponse({ error: "Missing Authorization header" }, 401, corsHeaders);
    }

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
    }

    const body = await req.json();
    const action = body?.action;
    const admin = createAdminClient();
    const supporter = await isActiveSupporter(admin, user.id);
    const ghToken = Deno.env.get("GITHUB_API_TOKEN");

    // ─────────────────────────────────────────────────────────────
    // ACTION: review — supporter-only pre-submit diff review
    // ─────────────────────────────────────────────────────────────
    if (action === "review") {
      if (!supporter) {
        return jsonResponse(
          {
            error: "Pre-submit review is a Supporter feature.",
            code: "supporter_only",
          },
          403,
          corsHeaders,
        );
      }

      const { repo, issueTitle, diff } = body;
      if (!diff || typeof diff !== "string" || !diff.trim()) {
        return jsonResponse({ error: "Missing diff" }, 400, corsHeaders);
      }

      const reviewSystem = `Senior open-source maintainer. Pre-submit review of a contributor's diff BEFORE the PR opens. Flag anything that gets the PR rejected, change-requested, or ignored — so they fix it first.

Check: convention/style mismatch, missing tests, scope-creep/unrelated changes, missing docs/changelog, format/lint issues, commented-out code, debug logging, signs of a "first-timer who skipped CONTRIBUTING".

Return ONLY valid JSON, no markdown. Format:
{
  "verdict": "<'likely-accept' | 'needs-work' | 'likely-reject'>",
  "summary": "<1-2 sentence overall read>",
  "findings": [
    {"severity": "<'high'|'medium'|'low'>", "note": "<specific, actionable issue>"}
  ]
}
Order findings by severity (high first). Be specific, reference the diff. Clean diff -> empty findings array, verdict 'likely-accept'.`;

      const reviewUser = `## Issue being addressed
${issueTitle || "(not provided)"} ${repo ? `in ${repo}` : ""}

## Contributor's diff
\`\`\`diff
${diff.slice(0, 12000)}
\`\`\``;

      try {
        const review = await callGrok(reviewSystem, reviewUser, 2000);
        return jsonResponse({ review }, 200, corsHeaders);
      } catch (e) {
        console.error("[contribution-kit] review failed:", e);
        return jsonResponse({ error: "Pre-submit review failed. Please try again." }, 502, corsHeaders);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION: generate — build the contribution kit (default action)
    // ─────────────────────────────────────────────────────────────
    const { repo, issueNumber, issueTitle, issueBody, issueUrl } = body;
    const parsedNumber = Number(issueNumber);
    if (!repo || !REPO_SLUG_REGEX.test(String(repo)) || !Number.isInteger(parsedNumber) || parsedNumber <= 0 || !issueUrl) {
      return jsonResponse({ error: "Missing or invalid repo, issueNumber, or issueUrl" }, 400, corsHeaders);
    }

    // 1. Serve from cache if this user already generated this issue's kit.
    //    A cache hit does NOT consume a monthly credit.
    const { data: cachedRow } = await admin
      .from("contribution_kits")
      .select("kit")
      .eq("user_id", user.id)
      .eq("repo", repo)
      .eq("issue_number", parsedNumber)
      .maybeSingle();

    if (cachedRow?.kit) {
      return jsonResponse({ kit: cachedRow.kit, cached: true, supporter }, 200, corsHeaders);
    }

    // 2. Meter free accounts (supporters skip this entirely).
    let quota: { limited: boolean; used?: number; limit?: number; remaining?: number } = { limited: false };
    if (!supporter) {
      const { data: quotaRows, error: quotaError } = await admin.rpc("consume_kit_quota", {
        p_user_id: user.id,
        p_limit: FREE_MONTHLY_KITS,
      });

      if (quotaError) {
        console.error("[contribution-kit] quota check failed:", quotaError);
        return jsonResponse({ error: "Could not verify your monthly quota. Please try again." }, 500, corsHeaders);
      }

      const result = Array.isArray(quotaRows) ? quotaRows[0] : quotaRows;
      const used = result?.used ?? 0;
      const limit = result?.monthly_limit ?? FREE_MONTHLY_KITS;

      if (!result?.allowed) {
        return jsonResponse(
          {
            error: `You've used your ${limit} free Contribution Kit${limit === 1 ? "" : "s"} this month. Become a Supporter for unlimited kits.`,
            code: "monthly_limit_reached",
            used,
            limit,
          },
          429,
          corsHeaders,
        );
      }

      quota = { limited: true, used, limit, remaining: Math.max(0, limit - used) };
    }

    // 3. Gather real repo context in parallel (README, CONTRIBUTING, Git file tree, live issue details).
    const [readme, contributing, repoTree, liveIssue] = await Promise.all([
      fetchRepoDoc(repo, "readme", ghToken),
      fetchRepoDoc(repo, "contributing", ghToken),
      fetchRepoTree(repo, ghToken),
      fetchLiveIssueDetails(repo, parsedNumber, ghToken),
    ]);

    const manifest = await fetchRepoManifest(repo, repoTree.paths, ghToken);

    const effectiveTitle = (liveIssue?.title || issueTitle || "(no title)").trim();
    const effectiveBody = (
      liveIssue?.body && liveIssue.body.trim().length > (issueBody || "").trim().length
        ? liveIssue.body
        : issueBody || ""
    ).trim();

    const relevantPaths = selectRelevantTreePaths(repoTree.paths, effectiveTitle, effectiveBody, 180);

    // 4. Build the kit prompt grounded in real repo docs, manifest scripts, and file tree.
    const kitSystem = `Open-source mentor. Turn a GitHub issue + real repo docs, manifest scripts, and repository file tree into a practical starter kit for a first-time contributor.

Return ONLY valid JSON, no markdown, no commentary. Format:
{
  "summary": "<2-3 sentence plain-English explanation of what this issue is asking for>",
  "setupSteps": ["<ordered, copy-pasteable shell commands or setup steps derived from the repo docs/manifest; fall back to standard fork/clone/install/branch if docs are thin>"],
  "filesToTouch": [
    {"path": "<exact file or directory path from the Repository File Tree>", "reason": "<why this file is likely involved>"}
  ],
  "claimComment": "<a short, friendly comment the contributor can post on the issue to claim it, matching the maintainer's expected tone; do NOT overpromise a timeline>",
  "prDescription": "<a ready-to-use PR description template with sections the repo appears to expect (e.g. Summary, Changes, Testing, Related issue), pre-filled with placeholders>",
  "gotchas": ["<0-4 specific things that would get this PR rejected or delayed in THIS repo, based on CONTRIBUTING>"]
}

Rules:
- When a Repository File Tree is provided, EVERY path in filesToTouch MUST be copied verbatim from that tree (or a real directory prefix of those paths). Never invent or guess non-existent paths.
- Return 2-5 highest-signal entries in filesToTouch.
- Derive setupSteps from README, CONTRIBUTING, and the root manifest scripts (e.g. exact package manager & test command). Never invent commands not supported by the docs/manifest.
- Concrete, beginner-friendly. claimComment and prDescription MUST read natural and professional (a human posts them) — do not compress those.`;

    const treeSection = relevantPaths.length > 0
      ? `### Repository File Tree (${relevantPaths.length} real paths${repoTree.truncated ? ", sampled from larger repo" : ""})\n${relevantPaths.join("\n")}`
      : "### Repository File Tree\n(unavailable — keep candidate paths hedged)";

    const manifestSection = manifest
      ? `### Root Manifest (${manifest.file})\n${manifest.content}`
      : "";

    const kitUser = `## Repository
${repo}

## Issue #${parsedNumber}: ${effectiveTitle}
${issueUrl}

### Issue body
${(effectiveBody || "(no description provided)").slice(0, 3500)}

${treeSection}

${manifestSection}

### README (excerpt)
${readme || "(no README found)"}

### CONTRIBUTING (excerpt)
${contributing || "(no CONTRIBUTING found)"}`;

    let kit;
    try {
      kit = await callGrok(kitSystem, kitUser, 3000);
    } catch (e) {
      console.error("[contribution-kit] generate failed:", e);
      // The AI call failed after we may have consumed a credit — refund it so
      // the user isn't charged for a kit they never received.
      if (!supporter) {
        await admin.rpc("refund_kit_quota", { p_user_id: user.id }).catch(() => {});
      }
      return jsonResponse({ error: "Kit generation failed. Please try again." }, 502, corsHeaders);
    }

    // Post-validate candidate paths against the real GitHub tree and attach metadata.
    const verifiedFiles = verifyFilesAgainstTree(kit.filesToTouch || [], repoTree.paths);
    const enrichedKit = {
      ...kit,
      filesToTouch: verifiedFiles,
      defaultBranch: repoTree.defaultBranch || "HEAD",
      treeVerified: repoTree.paths.length > 0,
    };

    const issueMeta = liveIssue
      ? {
          state: liveIssue.state,
          assigned: liveIssue.assigned,
          comments: liveIssue.comments,
        }
      : null;

    // 5. Persist to cache (best-effort — a failure here shouldn't fail the request).
    const { error: cacheError } = await admin.from("contribution_kits").upsert(
      {
        user_id: user.id,
        repo,
        issue_number: parsedNumber,
        issue_url: issueUrl,
        issue_title: effectiveTitle || null,
        kit: enrichedKit,
      },
      { onConflict: "user_id,repo,issue_number" },
    );
    if (cacheError) console.error("[contribution-kit] cache write failed:", cacheError);

    return jsonResponse(
      { kit: enrichedKit, cached: false, supporter, quota, issueMeta },
      200,
      corsHeaders,
    );
  } catch (error) {
    console.error("[contribution-kit] internal error:", error);
    return jsonResponse({ error: (error as Error).message }, 500, corsHeaders);
  }
});
