// Supabase Edge Function: kb-query (FirstMate Hybrid RAG Assistant)
// Deploy: supabase functions deploy kb-query

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createUserClient, createAdminClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { isActiveSupporter, FREE_DAILY_COPILOT_MESSAGES } from "../_shared/supporter.ts";
import {
  type HybridChunk,
  type LearnedSolutionItem,
  type StartupOrgMatch,
  isStartupDiscoveryQuery,
  extractStartupSearchParams,
  selectDiversifiedChunks,
  extractCitationSources,
  mergeLearnedSolutions,
  filterLearnedSolutionsByKeywords,
  buildLearnedSolutionEmbeddingText,
} from "../_shared/ragHelpers.ts";

function sanitizeLine(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function sanitizeGitHubUrl(val: unknown): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!/^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+/.test(trimmed)) {
    return "";
  }
  return trimmed.slice(0, 300);
}

function buildIssueContextBlock(raw: any): string {
  if (!raw || typeof raw !== "object") return "";

  const repo = sanitizeLine(raw.repo, 120);
  const issueTitle = sanitizeLine(raw.issueTitle, 240);
  if (!repo && !issueTitle) return "";

  const issueNumber = Number.isInteger(Number(raw.issueNumber)) && Number(raw.issueNumber) > 0
    ? Number(raw.issueNumber)
    : null;
  const issueUrl = sanitizeGitHubUrl(raw.issueUrl);
  const prUrl = sanitizeGitHubUrl(raw.prUrl);
  const prStatus = sanitizeLine(raw.prStatus, 32);
  const language = sanitizeLine(raw.language, 48);
  const summary = sanitizeLine(raw.summary, 500);

  const setupSteps = Array.isArray(raw.setupSteps)
    ? raw.setupSteps.map((s: unknown) => sanitizeLine(s, 180)).filter(Boolean).slice(0, 6)
    : [];
  const filesToTouch = Array.isArray(raw.filesToTouch)
    ? raw.filesToTouch
        .map((f: any) => sanitizeLine(typeof f === "string" ? f : f?.path, 160))
        .filter(Boolean)
        .slice(0, 6)
    : [];
  const gotchas = Array.isArray(raw.gotchas)
    ? raw.gotchas.map((g: unknown) => sanitizeLine(g, 180)).filter(Boolean).slice(0, 4)
    : [];

  const lines: string[] = ["\n\nActive Issue / PR Context:"];
  if (repo) lines.push(`- Repository: ${repo}`);
  if (issueTitle || issueNumber) {
    lines.push(`- Issue: ${issueNumber ? `#${issueNumber} ` : ""}${issueTitle || "(untitled)"}`);
  }
  if (language) lines.push(`- Primary Language: ${language}`);
  if (issueUrl) lines.push(`- Issue URL: ${issueUrl}`);
  if (prUrl) lines.push(`- Pull Request URL: ${prUrl}${prStatus ? ` (status: ${prStatus})` : ""}`);
  else if (prStatus) lines.push(`- Contribution Status: ${prStatus}`);
  if (summary) lines.push(`- Issue Summary: ${summary}`);
  if (setupSteps.length > 0) {
    lines.push(`- Known Repo Setup Steps:\n${setupSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}`);
  }
  if (filesToTouch.length > 0) {
    lines.push(`- Candidate Files to Inspect: ${filesToTouch.join(", ")}`);
  }
  if (gotchas.length > 0) {
    lines.push(`- Repo Gotchas: ${gotchas.join(" | ")}`);
  }

  return lines.join("\n");
}

function normalizeStartupOrgRow(org: any): StartupOrgMatch {
  return {
    id: org.id,
    github_name: org.github_name,
    display_name: org.display_name || org.github_name,
    description: org.description || "Open-source startup organization",
    github_url: org.github_url || `https://github.com/${org.github_name}`,
    website: org.website || "",
    category: org.category || "DevTools",
    stars: typeof org.stars === "number" ? org.stars : null,
    country: org.country || null,
    founded_year: typeof org.founded_year === "number" ? org.founded_year : null,
  };
}

/**
 * Query-filtered Postgres FTS + pgvector startup org search.
 * Falls back gracefully to bounded in-memory scoring if the SQL RPC has not been applied yet.
 */
async function searchStartupOrgs(
  adminClient: any,
  message: string,
  queryEmbedding: number[] | null
): Promise<StartupOrgMatch[]> {
  const params = extractStartupSearchParams(message);

  try {
    const { data: rpcData, error: rpcError } = await adminClient.rpc("search_startup_orgs", {
      query_text: message,
      query_embedding: queryEmbedding,
      preferred_categories: params.preferredCategories.length > 0 ? params.preferredCategories : null,
      expanded_keywords: params.expandedKeywords.length > 0 ? params.expandedKeywords : null,
      country_filter: params.countryFilter.length > 0 ? params.countryFilter : null,
      wants_new: params.wantsNew,
      match_count: 6,
    });

    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData
        .filter((org: any) => org?.github_name)
        .map(normalizeStartupOrgRow);
    }

    if (rpcError) {
      console.warn("[kb-query] search_startup_orgs RPC fallback:", rpcError.message);
    }
  } catch (err) {
    console.warn("[kb-query] search_startup_orgs RPC threw, falling back:", err);
  }

  // Fallback path (pre-migration safety)
  try {
    const { data, error } = await adminClient
      .from("startup_orgs")
      .select("id, github_name, display_name, description, github_url, website, category, stars, country, founded_year")
      .eq("is_active", true)
      .eq("is_startup", true)
      .order("stars", { ascending: false })
      .limit(200);

    if (error || !Array.isArray(data) || data.length === 0) return [];

    const preferredCategorySet = new Set(params.preferredCategories);
    const countrySet = new Set(params.countryFilter);

    const scored = data.map((org: any) => {
      const hay = `${org.display_name || ""} ${org.github_name || ""} ${org.description || ""} ${org.category || ""}`.toLowerCase();
      let score = 0;

      if (org.category && preferredCategorySet.has(org.category)) score += 18;
      for (const kw of params.expandedKeywords) {
        if (hay.includes(kw)) score += 7;
      }
      for (const tok of params.rawTokens) {
        if (hay.includes(tok)) score += 10;
      }
      if (countrySet.size > 0 && org.country && countrySet.has(String(org.country).toLowerCase())) {
        score += 20;
      }

      const foundedYear = Number(org.founded_year) || 0;
      if (params.wantsNew) {
        if (foundedYear >= 2024) score += 22;
        else if (foundedYear >= 2023) score += 15;
        else if (foundedYear >= 2022) score += 8;
      } else if (foundedYear >= 2023) {
        score += 4;
      }

      const stars = Number(org.stars) || 0;
      score += Math.min(8, Math.log10(Math.max(10, stars)) * 1.6);

      return { org, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected: StartupOrgMatch[] = [];
    const seenLogins = new Set<string>();
    for (const item of scored) {
      if (selected.length >= 6) break;
      const login = String(item.org.github_name || "").toLowerCase();
      if (!login || seenLogins.has(login)) continue;
      seenLogins.add(login);
      selected.push(normalizeStartupOrgRow(item.org));
    }

    return selected;
  } catch (err) {
    console.warn("[kb-query] startup_orgs fallback lookup skipped:", err);
    return [];
  }
}

/**
 * Hybrid KB retrieval: Postgres FTS + pgvector RRF via `match_kb_chunks_hybrid`,
 * falling back to vector-only `match_kb_chunks` if the migration hasn't been pushed yet.
 */
async function retrieveKbChunks(
  supabaseClient: any,
  message: string,
  queryEmbedding: number[]
): Promise<{ chunks: HybridChunk[]; error: any }> {
  const { data: hybridData, error: hybridError } = await supabaseClient.rpc(
    "match_kb_chunks_hybrid",
    {
      query_text: message,
      query_embedding: queryEmbedding,
      match_threshold: 0.25,
      match_count: 12,
      full_text_weight: 1.0,
      semantic_weight: 1.0,
      rrf_k: 50,
    }
  );

  if (!hybridError && Array.isArray(hybridData)) {
    return { chunks: hybridData, error: null };
  }

  console.warn(
    "[kb-query] match_kb_chunks_hybrid unavailable, falling back to match_kb_chunks:",
    hybridError?.message
  );

  const { data: vecData, error: vecError } = await supabaseClient.rpc("match_kb_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 0.28,
    match_count: 10,
  });

  return { chunks: Array.isArray(vecData) ? vecData : [], error: vecError };
}

/**
 * Semantic + FTS retrieval for `ai_learned_solutions` via `match_learned_solutions`.
 * Falls back to keyword-filtered lookup (never injects unrelated global top rows).
 */
async function retrieveLearnedSolutions(
  adminClient: any,
  message: string,
  queryEmbedding: number[]
): Promise<LearnedSolutionItem[]> {
  try {
    const { data: rpcData, error: rpcError } = await adminClient.rpc(
      "match_learned_solutions",
      {
        p_query_text: message,
        query_embedding: queryEmbedding,
        match_threshold: 0.35,
        match_count: 4,
        rrf_k: 50,
      }
    );

    if (!rpcError && Array.isArray(rpcData)) {
      return rpcData;
    }

    if (rpcError) {
      console.warn(
        "[kb-query] match_learned_solutions unavailable, falling back to keyword filter:",
        rpcError.message
      );
    }

    // Pre-migration fallback: fetch recent validated entries and filter strictly by query keywords
    const { data: fallbackRows } = await adminClient
      .from("ai_learned_solutions")
      .select("id, query_text, assistant_response, user_correction, helpful_count, is_verified")
      .or("user_feedback.eq.up,user_correction.neq.null")
      .order("helpful_count", { ascending: false })
      .limit(40);

    if (Array.isArray(fallbackRows) && fallbackRows.length > 0) {
      return filterLearnedSolutionsByKeywords(message, fallbackRows, 3);
    }
  } catch (err) {
    console.warn("[kb-query] Learned solutions lookup skipped:", err);
  }

  return [];
}

/**
 * Non-blocking self-healing backfill: embeds up to 5 validated `ai_learned_solutions`
 * rows whose `embedding` is still NULL (e.g. recently submitted from the browser)
 * in a single batched OpenRouter embeddings call.
 */
async function backfillUnembeddedLearnedSolutions(
  adminClient: any,
  apiKey: string
): Promise<void> {
  try {
    const { data: pendingRows, error } = await adminClient
      .from("ai_learned_solutions")
      .select("id, query_text, user_correction, assistant_response")
      .is("embedding", null)
      .or("user_feedback.eq.up,user_correction.neq.null")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !Array.isArray(pendingRows) || pendingRows.length === 0) {
      return;
    }

    const validRows = pendingRows
      .map((row: any) => ({
        id: row.id,
        text: buildLearnedSolutionEmbeddingText(row),
      }))
      .filter((r) => r.text.length > 0);

    if (validRows.length === 0) return;

    const embRes = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://firstissue.dev",
        "X-Title": "FirstIssue Learned Solutions Embedding",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: validRows.map((r) => r.text),
      }),
    });

    if (!embRes.ok) return;

    const embJson = await embRes.json();
    const vectors = Array.isArray(embJson?.data) ? embJson.data : [];

    for (let i = 0; i < validRows.length; i++) {
      const vec = vectors[i]?.embedding;
      if (!Array.isArray(vec) || vec.length === 0) continue;
      await adminClient
        .from("ai_learned_solutions")
        .update({ embedding: vec })
        .eq("id", validRows[i].id);
    }

    console.log(`[kb-query] Backfilled embeddings for ${validRows.length} learned solution(s)`);
  } catch (err) {
    console.warn("[kb-query] Lazy learned-solution embedding backfill skipped:", err);
  }
}

function buildStartupOrgsPromptBlock(orgs: StartupOrgMatch[]): string {
  if (!orgs || orgs.length === 0) return "";
  const lines = orgs.map((org, idx) => {
    const meta = [
      org.category,
      org.stars != null ? `${org.stars.toLocaleString()} stars` : null,
      org.founded_year ? `Est. ${org.founded_year}` : null,
      org.country || null,
    ]
      .filter(Boolean)
      .join(" | ");
    return `${idx + 1}. **${org.display_name}** (@${org.github_name}) [${meta}]\n   - GitHub: ${org.github_url}${org.website ? ` | Website: ${org.website}` : ""}\n   - Summary: ${org.description}`;
  });
  return `\n\nMatched Open-Source Startup Orgs from FirstIssue.dev Directory (Verified Live DB):\n${lines.join("\n")}`;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, history = [], learnedContext = [], issueContext = null } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate via shared pooling-optimized client factory
    let supabaseClient;
    let user = null;

    try {
      supabaseClient = createUserClient(req);
      const { data: { user: supabaseUser }, error: userError } = await supabaseClient.auth.getUser();

      if (userError || !supabaseUser) {
        throw new Error(userError?.message || "Invalid session");
      }
      user = supabaseUser;
    } catch (authErr: any) {
      console.warn(`[kb-query] Access denied: ${authErr.message}`);
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in to use FirstMate." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Daily quota: free accounts get FREE_DAILY_COPILOT_MESSAGES/day, ──
    // supporters are unlimited. Consumed BEFORE any billable API call so a
    // rejected request never costs us an embedding or a completion.
    const adminClient = createAdminClient();
    const supporter = await isActiveSupporter(adminClient, user.id);
    let quota: { limited: boolean; used?: number; limit?: number; remaining?: number } = {
      limited: false,
    };

    if (!supporter) {
      const { data: quotaRows, error: quotaError } = await adminClient.rpc(
        "consume_ai_copilot_quota",
        { p_user_id: user.id, p_limit: FREE_DAILY_COPILOT_MESSAGES },
      );

      if (quotaError) {
        console.error("[kb-query] Quota check failed:", quotaError);
        return new Response(
          JSON.stringify({ error: "Could not verify your daily message quota. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const result = Array.isArray(quotaRows) ? quotaRows[0] : quotaRows;
      const used = result?.used ?? 0;
      const limit = result?.daily_limit ?? FREE_DAILY_COPILOT_MESSAGES;

      if (!result?.allowed) {
        console.log(`[kb-query] Daily limit reached for user ${user.id} (${used}/${limit})`);
        return new Response(
          JSON.stringify({
            error: `You've used all ${limit} free FirstMate messages for today. Become a supporter for unlimited chat, or come back tomorrow.`,
            code: "daily_limit_reached",
            used,
            limit,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      quota = { limited: true, used, limit, remaining: Math.max(0, limit - used) };
    }

    // Get API Key for OpenRouter
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("XAI_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured in Edge Function" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[kb-query] Processing query: "${message.substring(0, 60)}..." (Auth: User)`);

    // 1. Generate text embedding once via OpenRouter (reused across KB, learned solutions, and startup orgs)
    // Model used: openai/text-embedding-3-small (1536 dimensions)
    const embeddingResponse = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://firstissue.dev",
        "X-Title": "FirstIssue RAG Assistant"
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: message
      })
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      console.error("[kb-query] Embedding generation failed:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to generate question embedding", details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const embeddingJson = await embeddingResponse.json();
    const queryEmbedding = embeddingJson.data?.[0]?.embedding;

    if (!queryEmbedding) {
      return new Response(
        JSON.stringify({ error: "Embedding data was empty from API response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Run all three Postgres retrieval pipelines in parallel:
    //    - Hybrid FTS + pgvector search on kb_chunks
    //    - Semantic + FTS search on ai_learned_solutions
    //    - Query-filtered FTS + pgvector search on startup_orgs (when startup discovery intent is detected)
    const startupIntent = isStartupDiscoveryQuery(message, history);

    const [kbResult, dbLearned, matchedStartupOrgs] = await Promise.all([
      retrieveKbChunks(supabaseClient, message, queryEmbedding),
      retrieveLearnedSolutions(adminClient, message, queryEmbedding),
      startupIntent
        ? searchStartupOrgs(adminClient, message, queryEmbedding)
        : Promise.resolve([] as StartupOrgMatch[]),
    ]);

    if (kbResult.error) {
      console.error("[kb-query] RPC similarity search failed:", kbResult.error);
      return new Response(
        JSON.stringify({ error: "Failed to query similar chunks", details: kbResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chunks = kbResult.chunks;
    console.log(
      `[kb-query] Retrieved ${chunks.length} KB chunks, ${dbLearned.length} learned solutions, ${matchedStartupOrgs.length} startup orgs`
    );

    // Schedule non-blocking lazy embedding backfill for any recently added learned solutions
    const edgeRuntime = (globalThis as any).EdgeRuntime;
    if (typeof edgeRuntime?.waitUntil === "function") {
      edgeRuntime.waitUntil(backfillUnembeddedLearnedSolutions(adminClient, OPENROUTER_API_KEY));
    }

    // 3. Merge & deduplicate learned community solutions & corrections
    const combinedLearned = mergeLearnedSolutions(learnedContext, dbLearned, 3);
    const learnedApplied = combinedLearned.length > 0;

    const learnedPromptBlock = learnedApplied
      ? `\n\nVerified Community Best Practices & Self-Learned Corrections:\n` +
        combinedLearned
          .map((item, idx) =>
            `[Pattern ${idx + 1}] User Question Context: "${item.query_text || ""}"\nValidated Best Solution / Correction: "${item.user_correction || item.assistant_response || ""}"`
          )
          .join("\n---\n")
      : "";

    // 4. Construct Advanced FirstMate System Prompt (diversified across sources)
    const diversifiedChunks = selectDiversifiedChunks(chunks);

    const contextText = diversifiedChunks.length > 0
      ? diversifiedChunks
          .map((c) => `Source: ${c.source} | Title: ${c.title}\nContent:\n${c.content}`)
          .join("\n\n---\n\n")
      : "";

    const issueContextBlock = buildIssueContextBlock(issueContext);
    const startupOrgsBlock = buildStartupOrgsPromptBlock(matchedStartupOrgs);

    const systemPrompt = `You are FirstMate, an expert open-source engineering copilot for FirstIssue.dev.
You have deep expertise across the full open-source contribution lifecycle:
- Git internals & recovery: interactive rebase (\`git rebase -i\`), \`git reflog\`, \`git bisect\`, \`git worktree\`, \`git cherry-pick\`, GPG/SSH commit signing, and safe history rewrites (\`--force-with-lease\`).
- Multi-platform collaboration: GitHub (Forks, Pull Requests, Draft PRs, \`gh\` CLI, GitHub Actions workflows, Dependabot, CODEOWNERS), GitLab (Merge Requests, \`glab\` CLI, push options like \`git push -o merge_request.create\`, \`.gitlab-ci.yml\` stages/artifacts, squash/rebase policies), and Codeberg/Forgejo.
- Licensing & compliance: MIT, Apache-2.0 (patent grant), GPLv3/AGPL (copyleft), BSD, MPL-2.0, Contributor Covenant Code of Conduct, DCO (\`git commit -s\`), and CLAs.
- PR craft & CI debugging: Conventional Commits, SemVer, Keep a Changelog, reproducing CI failures locally, writing focused small PRs, and responding professionally to maintainer review feedback.
- Open-source programs: Google Summer of Code (GSoC) project selection & proposals, LFX Mentorship, Outreachy, Hacktoberfest, and MLH Fellowship.
- Open-source startup discovery: Matching contributors' tech stacks and interests to active open-source startups in the FirstIssue.dev directory.

CRITICAL INSTRUCTIONS & RESPONSE STRUCTURE:
1. Direct, Actionable Solution: Start with the clearest direct answer and copy-pasteable terminal commands or code snippets in syntax-highlighted code blocks (\`\`\`bash, \`\`\`yaml, etc.).
2. Flag-by-Flag & Step-by-Step Breakdown: Explain why each command flag or config option is used instead of giving blind commands.
3. Platform Differences When Relevant: If a workflow differs between GitHub and GitLab (e.g., Pull Request vs Merge Request, \`.github/workflows\` vs \`.gitlab-ci.yml\`, \`gh\` vs \`glab\`), briefly show both cleanly.
4. Safety Warnings & Local Verification: Flag destructive operations (history rewrites, force pushes, hard resets) and include a quick command to verify the fix locally before pushing.
5. Self-Improvement: When learned community solutions are provided below, incorporate their validated insights.
6. Documentation Citations: Cite retrieved sources at the end under a "Sources:" heading using Markdown links.
7. Active Issue / PR Grounding: When Active Issue / PR Context is provided below, tailor git commands (repo clone/remote URLs, branch names, file paths, setup/test commands, and PR/CI troubleshooting) directly to that specific repository and issue instead of generic placeholders.
8. Startup Org Discovery: When "Matched Open-Source Startup Orgs from FirstIssue.dev Directory" are provided below, recommend specifically from those verified startups (do not invent fake orgs), explain clearly why each fits the user's tech stack or request (category, founded year, focus), include their clickable GitHub links, and give a quick tip on how to pick their first issue in those orgs. Note that interactive startup cards will also render right below your message.

${contextText ? `Retrieved Documentation Knowledge:\n${contextText}` : "No specific knowledge base chunk matched above threshold. Rely on your comprehensive knowledge of Git, GitHub, GitLab, Forgejo, open-source licenses, CI/CD, and contribution best practices."}${issueContextBlock}${startupOrgsBlock}${learnedPromptBlock}`;

    // 5. Call OpenRouter for chat completion
    const completionModel = Deno.env.get("RAG_COMPLETION_MODEL") || "google/gemini-2.5-flash-lite";

    // Standardize history formatting to avoid issues
    const formattedHistory = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.content || ""
    }));

    const completionResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://firstissue.dev",
        "X-Title": "FirstIssue RAG Assistant"
      },
      body: JSON.stringify({
        model: completionModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: message }
        ],
        temperature: 0.35,
        max_tokens: 2400
      })
    });

    if (!completionResponse.ok) {
      const errText = await completionResponse.text();
      console.error("[kb-query] Completion generation failed:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to generate AI response", details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const completionJson = await completionResponse.json();
    const answer = completionJson.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // 6. Gather sources/citations for the frontend
    const sources = extractCitationSources(diversifiedChunks);

    return new Response(
      JSON.stringify({
        answer,
        sources,
        startup_orgs: matchedStartupOrgs,
        quota,
        learned_applied: learnedApplied,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[kb-query] Internal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
