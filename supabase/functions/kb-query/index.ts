// Supabase Edge Function: kb-query (RAG Assistant)
// Deploy: supabase functions deploy kb-query

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, history = [], isGuestQuery = false } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Read the authorization header to verify authentication
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    let isUserAuthenticated = false;
    let user = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const { data: { user: supabaseUser }, error: userError } = await supabaseClient.auth.getUser();
      if (!userError && supabaseUser) {
        isUserAuthenticated = true;
        user = supabaseUser;
      }
    }

    // Access Control Logic
    // If not authenticated and not claiming guest mode, block it.
    // In production, you can add IP rate limits or check redis for abuse.
    if (!isUserAuthenticated && !isGuestQuery) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in to use the AI Copilot." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API Key for OpenRouter
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("XAI_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured in Edge Function" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[kb-query] Processing query: "${message.substring(0, 60)}..." (Auth: ${isUserAuthenticated ? 'User' : 'Guest'})`);

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

    // 3. Construct System Prompt with context
    const contextText = chunks && chunks.length > 0
      ? chunks
          .filter((c: any) => c.similarity > 0.35)
          .map((c: any) => `Source: ${c.source} | Title: ${c.title}\nContent:\n${c.content}`)
          .join("\n\n---\n\n")
      : "";

    const systemPrompt = `You are a helpful, expert AI Copilot for FirstIssue.dev. 
Your goal is to answer developer questions related to open source contributions, GitHub workflows, git commands, coding syntax, codebase architecture, and firstissue.dev platform features.

Use the following retrieved context chunks from our documentation to answer the question. If the context is not sufficient, answer to the best of your knowledge but clarify that it is not explicitly documented in our guides.

Rules:
1. Be concise, direct, and developer-friendly. Avoid fluff.
2. Provide copy-pasteable code blocks or terminal commands (e.g., git commands) when helpful.
3. Keep the tone encouraging and supportive for beginners.
4. Cite the retrieved sources at the very end of your response under a "Sources:" heading if they were relevant. Format them clearly (e.g. "- [Guide Name](/docs/getting-started/first-steps)").

${contextText ? `Retrieved Context Chunks:\n${contextText}` : "No relevant documentation found in our database for this specific query. Answer using your general knowledge, but mention that this is general git/open-source guidance."}`;

    // 4. Call OpenRouter for chat completion
    // Model used: google/gemini-2.5-flash (standard, fast, cheap) or meta-llama/llama-3.1-8b-instruct
    const completionModel = Deno.env.get("RAG_COMPLETION_MODEL") || "google/gemini-2.5-flash";
    
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

    // 5. Gather sources/citations for the frontend
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
      JSON.stringify({ answer, sources }),
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
