// Supabase Edge Function: kb-query (RAG Assistant)
// Deploy: supabase functions deploy kb-query

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createUserClient, createAdminClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { isActiveSupporter, FREE_DAILY_COPILOT_MESSAGES } from "../_shared/supporter.ts";

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

interface StartupOrgMatch {
  id: string | number;
  github_name: string;
  display_name: string;
  description: string;
  github_url: string;
  website: string;
  category: string;
  stars: number | null;
  country: string | null;
  founded_year: number | null;
}

const STARTUP_INTENT_REGEX =
  /\b(startup|startups|startup org|startup orgs|new org|new orgs|early[- ]stage|yc\b|y combinator|fast[- ]growing|emerging org|suggest.*startup|recommend.*startup|contribute.*startup|companies to contribute|tech stack.*contribute|contribute.*tech stack)\b/i;

const STARTUP_FOLLOWUP_REGEX =
  /\b(more startups|other startups|newer ones|any in (rust|python|go|typescript|javascript|ai|fintech|security|cloud|data|india|us|uk|europe))\b/i;

const TECH_CATEGORY_HINTS: Array<{ pattern: RegExp; categories: string[]; keywords: string[] }> = [
  {
    pattern: /\b(ai|ml|llm|agent|agents|mcp|rag|langchain|openai|pytorch|genai|nlp|embedding|inference|vision)\b/i,
    categories: ["AI/ML"],
    keywords: ["ai", "llm", "agent", "mcp", "model", "inference", "embedding", "vector", "rag", "python"],
  },
  {
    pattern: /\b(typescript|javascript|react|next\.?js|node\.?js|frontend|vue|svelte|tailwind|web|email|sdk|cli|editor|linter|devtools)\b/i,
    categories: ["DevTools", "AI/ML", "Infrastructure"],
    keywords: ["typescript", "react", "web", "editor", "cli", "sdk", "email", "linter", "formatter", "developer", "framework"],
  },
  {
    pattern: /\b(python|fastapi|django|pydantic|ruff|uv|data science)\b/i,
    categories: ["AI/ML", "DevTools", "Data"],
    keywords: ["python", "pydantic", "ruff", "uv", "agent", "llm", "data", "ai"],
  },
  {
    pattern: /\b(rust|cargo|systems|compiler|wasm)\b/i,
    categories: ["DevTools", "Data", "Infrastructure", "FinTech"],
    keywords: ["rust", "vector", "editor", "linter", "payment", "fast", "binary", "engine"],
  },
  {
    pattern: /\b(go|golang|docker|kubernetes|k8s|ci\/cd|devops|queue|workflow|infra|infrastructure|distributed|backend)\b/i,
    categories: ["Infrastructure", "Cloud"],
    keywords: ["go", "workflow", "queue", "container", "ci/cd", "backend", "distributed", "cloud", "infrastructure"],
  },
  {
    pattern: /\b(postgres|postgresql|sql|sqlite|database|db|vector|analytics|warehouse|etl|duckdb|data)\b/i,
    categories: ["Data"],
    keywords: ["postgres", "sql", "sqlite", "database", "vector", "embedding", "storage", "analytics"],
  },
  {
    pattern: /\b(security|auth|oauth|secret|secrets|kms|iam|cybersecurity|infosec|zero[- ]trust)\b/i,
    categories: ["Security"],
    keywords: ["security", "secret", "auth", "authorization", "kms", "pki", "access"],
  },
  {
    pattern: /\b(cloud|serverless|edge|redis|self[- ]hosted|hosting|paas|deploy)\b/i,
    categories: ["Cloud", "Infrastructure"],
    keywords: ["cloud", "serverless", "edge", "redis", "self-host", "deploy", "hosting"],
  },
  {
    pattern: /\b(fintech|payment|payments|commerce|ecommerce|ledger|billing|stripe|banking)\b/i,
    categories: ["FinTech"],
    keywords: ["payment", "ledger", "commerce", "financial", "fintech", "billing"],
  },
];

function isStartupDiscoveryQuery(message: string, history: any[] = []): boolean {
  if (STARTUP_INTENT_REGEX.test(message)) return true;
  if (STARTUP_FOLLOWUP_REGEX.test(message)) return true;
  const recentHistory = Array.isArray(history) ? history.slice(-3) : [];
  const hadStartupContext = recentHistory.some((h: any) =>
    STARTUP_INTENT_REGEX.test(String(h?.content || ""))
  );
  if (hadStartupContext && /\b(more|another|other|suggest|recommend|filter|rust|python|typescript|go|ai|fintech|security|cloud|data|new)\b/i.test(message)) {
    return true;
  }
  return false;
}

async function searchStartupOrgs(
  adminClient: any,
  message: string
): Promise<StartupOrgMatch[]> {
  try {
    const { data, error } = await adminClient
      .from("startup_orgs")
      .select("id, github_name, display_name, description, github_url, website, category, stars, country, founded_year")
      .eq("is_active", true)
      .eq("is_startup", true)
      .order("stars", { ascending: false })
      .limit(200);

    if (error || !Array.isArray(data) || data.length === 0) return [];

    const lowerMsg = message.toLowerCase();
    const wantsNew = /\b(new|newest|recent|recently|emerging|latest|fresh|early|2023|2024|2025|2026)\b/i.test(lowerMsg);

    const preferredCategories = new Set<string>();
    const expandedKeywords = new Set<string>();

    for (const hint of TECH_CATEGORY_HINTS) {
      if (hint.pattern.test(lowerMsg)) {
        for (const cat of hint.categories) preferredCategories.add(cat);
        for (const kw of hint.keywords) expandedKeywords.add(kw);
      }
    }

    // Raw meaningful user words (length >= 3, excluding generic stopwords)
    const stopWords = new Set([
      "the", "and", "for", "with", "that", "this", "have", "having", "want", "contribute",
      "contributing", "startup", "startups", "org", "orgs", "suggest", "recommend", "few",
      "some", "good", "best", "new", "ones", "can", "you", "please", "find", "show", "tech",
      "stack", "stacks", "open", "source", "opensource", "projects", "repos", "using", "use",
    ]);
    const rawTokens = lowerMsg
      .replace(/[^a-z0-9.+#/-]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !stopWords.has(t));

    const countryMatch = lowerMsg.match(/\b(india|us|usa|uk|germany|france|canada|europe|sweden|denmark|global)\b/i)?.[1]?.toLowerCase() || "";

    const scored = data.map((org: any) => {
      const hay = `${org.display_name || ""} ${org.github_name || ""} ${org.description || ""} ${org.category || ""}`.toLowerCase();
      let score = 0;

      if (org.category && preferredCategories.has(org.category)) {
        score += 18;
      }

      for (const kw of expandedKeywords) {
        if (hay.includes(kw)) score += 7;
      }

      for (const tok of rawTokens) {
        if (hay.includes(tok)) score += 10;
      }

      if (countryMatch && org.country) {
        const c = String(org.country).toLowerCase();
        if (
          c === countryMatch ||
          (countryMatch === "usa" && c === "us") ||
          (countryMatch === "europe" && ["uk", "germany", "france", "sweden", "denmark", "netherlands", "switzerland", "hungary"].includes(c))
        ) {
          score += 20;
        }
      }

      const foundedYear = Number(org.founded_year) || 0;
      if (wantsNew) {
        if (foundedYear >= 2024) score += 22;
        else if (foundedYear >= 2023) score += 15;
        else if (foundedYear >= 2022) score += 8;
      } else if (foundedYear >= 2023) {
        score += 4;
      }

      // Mild popularity tie-breaker without letting mega-orgs drown out relevant niche matches
      const stars = Number(org.stars) || 0;
      score += Math.min(8, Math.log10(Math.max(10, stars)) * 1.6);

      return { org, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Diversify across categories slightly when no single category was requested
    const selected: StartupOrgMatch[] = [];
    const seenLogins = new Set<string>();
    for (const item of scored) {
      if (selected.length >= 6) break;
      const login = String(item.org.github_name || "").toLowerCase();
      if (!login || seenLogins.has(login)) continue;
      seenLogins.add(login);
      selected.push({
        id: item.org.id,
        github_name: item.org.github_name,
        display_name: item.org.display_name || item.org.github_name,
        description: item.org.description || "Open-source startup organization",
        github_url: item.org.github_url || `https://github.com/${item.org.github_name}`,
        website: item.org.website || "",
        category: item.org.category || "DevTools",
        stars: typeof item.org.stars === "number" ? item.org.stars : null,
        country: item.org.country || null,
        founded_year: typeof item.org.founded_year === "number" ? item.org.founded_year : null,
      });
    }

    return selected;
  } catch (err) {
    console.warn("[kb-query] startup_orgs lookup skipped:", err);
    return [];
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

    // 1. Generate text embedding using OpenRouter
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

    // 2. Query Supabase vector similarity search
    // We use the service client (admin client) to read from kb_chunks table if necessary,
    // but the anonymous user also has read permission on kb_chunks. We will use the request's client.
    const { data: chunks, error: rpcError } = await supabaseClient.rpc("match_kb_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: 0.28, // broader recall across Git, GitHub, GitLab, Licenses & OSS docs
      match_count: 10 // retrieve top 10 before source diversification
    });

    if (rpcError) {
      console.error("[kb-query] RPC similarity search failed:", rpcError);
      return new Response(
        JSON.stringify({ error: "Failed to query similar chunks", details: rpcError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[kb-query] Found ${chunks?.length || 0} matching document chunks`);

    // 3. Retrieve learned community solutions & corrections
    let dbLearned: any[] = [];
    try {
      const { data: learnedData } = await adminClient
        .from("ai_learned_solutions")
        .select("query_text, assistant_response, user_correction, helpful_count")
        .or("user_feedback.eq.up,user_correction.neq.null")
        .order("helpful_count", { ascending: false })
        .limit(4);
      if (learnedData && Array.isArray(learnedData)) {
        dbLearned = learnedData;
      }
    } catch {
      // Table might be initializing or connection error
    }

    const combinedLearned = [...(Array.isArray(learnedContext) ? learnedContext : []), ...dbLearned];
    const learnedApplied = combinedLearned.length > 0;

    const learnedPromptBlock = learnedApplied
      ? `\n\nVerified Community Best Practices & Self-Learned Corrections:\n` +
        combinedLearned
          .slice(0, 3)
          .map((item: any, idx: number) => 
            `[Pattern ${idx + 1}] User Question Context: "${item.query_text || ''}"\nValidated Best Solution / Correction: "${item.user_correction || item.assistant_response || ''}"`
          )
          .join("\n---\n")
      : "";

    // 4. Construct Advanced FirstMate System Prompt (diversified across sources)
    const sourceChunkCounts: Record<string, number> = {};
    const diversifiedChunks = (chunks || [])
      .filter((c: any) => c.similarity > 0.30)
      .filter((c: any) => {
        const key = c.source || c.path || "unknown";
        sourceChunkCounts[key] = (sourceChunkCounts[key] || 0) + 1;
        return sourceChunkCounts[key] <= 2;
      })
      .slice(0, 6);

    const contextText = diversifiedChunks.length > 0
      ? diversifiedChunks
          .map((c: any) => `Source: ${c.source} | Title: ${c.title}\nContent:\n${c.content}`)
          .join("\n\n---\n\n")
      : "";

    const issueContextBlock = buildIssueContextBlock(issueContext);

    // 4b. Live Startup Orgs Directory Search when user asks for startup recommendations / tech-stack matches
    const startupIntent = isStartupDiscoveryQuery(message, history);
    const matchedStartupOrgs = startupIntent
      ? await searchStartupOrgs(adminClient, message)
      : [];
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

${contextText ? `Retrieved Documentation Knowledge:\n${contextText}` : "No specific vector chunk matched above threshold. Rely on your comprehensive knowledge of Git, GitHub, GitLab, Forgejo, open-source licenses, CI/CD, and contribution best practices."}${issueContextBlock}${startupOrgsBlock}${learnedPromptBlock}`;

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
    const sources = [];
    const seenPaths = new Set();
    for (const chunk of diversifiedChunks) {
      if (chunk.similarity > 0.32 && chunk.path && !seenPaths.has(chunk.path)) {
        seenPaths.add(chunk.path);
        sources.push({
          source: chunk.source,
          title: chunk.title,
          path: chunk.path,
          similarity: chunk.similarity
        });
      }
    }

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
