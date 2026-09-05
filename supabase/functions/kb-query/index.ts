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
    const { message, history = [], learnedContext = [] } = await req.json();

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
      match_threshold: 0.3, // default threshold
      match_count: 5 // retrieve top 5 results
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

    // 4. Construct Advanced FirstMate System Prompt
    const contextText = chunks && chunks.length > 0
      ? chunks
          .filter((c: any) => c.similarity > 0.35)
          .map((c: any) => `Source: ${c.source} | Title: ${c.title}\nContent:\n${c.content}`)
          .join("\n\n---\n\n")
      : "";

    const systemPrompt = `You are FirstMate, an exceptionally advanced, expert AI copilot for FirstIssue.dev.
You specialize in open source software development, Git version control, GitHub/GitLab collaboration workflows, codebase architectures, licenses (MIT, Apache, GPL, CLA, DCO), bug triage, CI/CD checks, and global open source programs (Google Summer of Code, LFX Mentorship, Hacktoberfest, Outreachy, MLH).

Your mission is to provide the highest-quality, most accurate, and developer-friendly answers possible.

CRITICAL INSTRUCTIONS & RESPONSE STRUCTURE:
1. Direct, Actionable Solutions: Start with a clear, direct answer and immediately provide copy-pasteable terminal commands or code snippets in syntax-highlighted code blocks (e.g. \`\`\`bash).
2. Deep Step-by-Step Breakdown: Explain what each command flag or method does (e.g., explain why to use \`git push --force-with-lease\` instead of raw \`--force\`).
3. Safety Warnings & Pro Tips: Explicitly flag potential data loss risks, remote branch collisions, or open source etiquette pitfalls.
4. Self-Improvement & Continuous Learning: When learned community solutions are provided below, prioritize their insights to guarantee the latest best practices.
5. Tone: Encouraging, precise, and professional. Avoid filler words.
6. Documentation Citations: Cite referenced documents at the end under a "Sources:" heading formatted cleanly (e.g. "- [Guide Title](/docs/section/article)").

${contextText ? `Retrieved Documentation Knowledge:\n${contextText}` : "No specific vector document matched. Rely on your deep, comprehensive knowledge of Git, GitHub, and open-source ecosystems."}
${learnedPromptBlock}`;

    // 5. Call OpenRouter for chat completion
    // Model used: google/gemini-2.5-flash (standard, fast, cheap) or meta-llama/llama-3.1-8b-instruct
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
        temperature: 0.4,
        max_tokens: 1500
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
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.similarity > 0.38 && chunk.path && !seenPaths.has(chunk.path)) {
          seenPaths.add(chunk.path);
          sources.push({
            source: chunk.source,
            title: chunk.title,
            path: chunk.path,
            similarity: chunk.similarity
          });
        }
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
