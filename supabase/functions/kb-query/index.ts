// Supabase Edge Function: kb-query (RAG Assistant)
// Deploy: supabase functions deploy kb-query

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createUserClient, createAdminClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { isActiveSupporter, FREE_DAILY_COPILOT_MESSAGES } from "../_shared/supporter.ts";

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

    const issueContextBlock = issueContext && (issueContext.repo || issueContext.issueTitle)
      ? `\n\nActive Issue Context:\n- Repository: ${issueContext.repo || "unknown"}\n- Issue: ${issueContext.issueTitle || "not provided"}${issueContext.language ? `\n- Primary Language: ${issueContext.language}` : ""}`
      : "";

    const systemPrompt = `You are FirstMate, an expert open-source engineering copilot for FirstIssue.dev.
You have deep expertise across the full open-source contribution lifecycle:
- Git internals & recovery: interactive rebase (\`git rebase -i\`), \`git reflog\`, \`git bisect\`, \`git worktree\`, \`git cherry-pick\`, GPG/SSH commit signing, and safe history rewrites (\`--force-with-lease\`).
- Multi-platform collaboration: GitHub (Forks, Pull Requests, Draft PRs, \`gh\` CLI, GitHub Actions workflows, Dependabot, CODEOWNERS), GitLab (Merge Requests, \`glab\` CLI, push options like \`git push -o merge_request.create\`, \`.gitlab-ci.yml\` stages/artifacts, squash/rebase policies), and Codeberg/Forgejo.
- Licensing & compliance: MIT, Apache-2.0 (patent grant), GPLv3/AGPL (copyleft), BSD, MPL-2.0, Contributor Covenant Code of Conduct, DCO (\`git commit -s\`), and CLAs.
- PR craft & CI debugging: Conventional Commits, SemVer, Keep a Changelog, reproducing CI failures locally, writing focused small PRs, and responding professionally to maintainer review feedback.
- Open-source programs: Google Summer of Code (GSoC) project selection & proposals, LFX Mentorship, Outreachy, Hacktoberfest, and MLH Fellowship.

CRITICAL INSTRUCTIONS & RESPONSE STRUCTURE:
1. Direct, Actionable Solution: Start with the clearest direct answer and copy-pasteable terminal commands or code snippets in syntax-highlighted code blocks (\`\`\`bash, \`\`\`yaml, etc.).
2. Flag-by-Flag & Step-by-Step Breakdown: Explain why each command flag or config option is used instead of giving blind commands.
3. Platform Differences When Relevant: If a workflow differs between GitHub and GitLab (e.g., Pull Request vs Merge Request, \`.github/workflows\` vs \`.gitlab-ci.yml\`, \`gh\` vs \`glab\`), briefly show both cleanly.
4. Safety Warnings & Local Verification: Flag destructive operations (history rewrites, force pushes, hard resets) and include a quick command to verify the fix locally before pushing.
5. Self-Improvement: When learned community solutions are provided below, incorporate their validated insights.
6. Documentation Citations: Cite retrieved sources at the end under a "Sources:" heading using Markdown links.

${contextText ? `Retrieved Documentation Knowledge:\n${contextText}` : "No specific vector chunk matched above threshold. Rely on your comprehensive knowledge of Git, GitHub, GitLab, Forgejo, open-source licenses, CI/CD, and contribution best practices."}${issueContextBlock}${learnedPromptBlock}`;

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
      JSON.stringify({ answer, sources, quota, learned_applied: learnedApplied }),
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
