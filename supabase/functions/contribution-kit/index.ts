// Supabase Edge Function: Contribution Kit
// Deploy: supabase functions deploy contribution-kit
//
// Two actions:
//   • generate — turn a GitHub issue into a "how to start" kit (setup steps,
//     files to touch, a drafted claim comment, and a PR description template).
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

// Decode GitHub's base64 file content as UTF-8 (plain atob mangles multi-byte
// characters, which READMEs routinely contain).
function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// ── Upstash Redis helpers (README/CONTRIBUTING are cached to spare the ──
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

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "firstissue-contribution-kit",
    ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
  };

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

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
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

      // Terse prompt = fewer input tokens. All checks preserved; only prose
      // filler dropped. JSON schema stays exact.
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
    if (!repo || !issueNumber || !issueUrl) {
      return jsonResponse({ error: "Missing repo, issueNumber, or issueUrl" }, 400, corsHeaders);
    }

    // 1. Serve from cache if this user already generated this issue's kit.
    //    A cache hit does NOT consume a monthly credit.
    const { data: cachedRow } = await admin
      .from("contribution_kits")
      .select("kit")
      .eq("user_id", user.id)
      .eq("repo", repo)
      .eq("issue_number", issueNumber)
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

    // 3. Gather repo context (cached).
    const [readme, contributing] = await Promise.all([
      fetchRepoDoc(repo, "readme", ghToken),
      fetchRepoDoc(repo, "contributing", ghToken),
    ]);

    // 4. Build the kit prompt.
    // Prompt prose is intentionally terse to cut input tokens per call — every
    // instruction is preserved, only filler dropped. Do NOT "prettify" back to
    // verbose sentences. The JSON schema and rules stay exact.
    const kitSystem = `Open-source mentor. Turn a GitHub issue + the repo README/CONTRIBUTING into a practical starter kit for the contributor.

Return ONLY valid JSON, no markdown, no commentary. Format:
{
  "summary": "<2-3 sentence plain-English explanation of what this issue is asking for>",
  "setupSteps": ["<ordered, copy-pasteable local setup steps derived from the repo docs; fall back to standard fork/clone/install/branch if docs are thin>"],
  "filesToTouch": [
    {"path": "<best-guess file or directory>", "reason": "<why this file is likely involved>"}
  ],
  "claimComment": "<a short, friendly comment the contributor can post on the issue to claim it, matching the maintainer's expected tone; do NOT overpromise a timeline>",
  "prDescription": "<a ready-to-use PR description template with sections the repo appears to expect (e.g. Summary, Changes, Testing, Related issue), pre-filled with placeholders>",
  "gotchas": ["<0-4 specific things that would get this PR rejected or delayed in THIS repo, based on CONTRIBUTING>"]
}

Rules:
- filesToTouch = best guess. Keep reasons hedged ("likely", "probably").
- Never invent repo commands not in the docs. Unsure -> conventional defaults + note the assumption.
- Concrete, beginner-friendly. claimComment and prDescription MUST read natural and professional (a human posts them) — do not compress those.`;

    const kitUser = `## Repository
${repo}

## Issue #${issueNumber}: ${issueTitle || "(no title)"}
${issueUrl}

### Issue body
${(issueBody || "(no description provided)").slice(0, 3000)}

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

    // 5. Persist to cache (best-effort — a failure here shouldn't fail the request).
    const { error: cacheError } = await admin.from("contribution_kits").upsert(
      {
        user_id: user.id,
        repo,
        issue_number: issueNumber,
        issue_url: issueUrl,
        issue_title: issueTitle || null,
        kit,
      },
      { onConflict: "user_id,repo,issue_number" },
    );
    if (cacheError) console.error("[contribution-kit] cache write failed:", cacheError);

    return jsonResponse({ kit, cached: false, supporter, quota }, 200, corsHeaders);
  } catch (error) {
    console.error("[contribution-kit] internal error:", error);
    return jsonResponse({ error: (error as Error).message }, 500, corsHeaders);
  }
});
