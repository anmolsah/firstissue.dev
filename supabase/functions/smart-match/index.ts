// Supabase Edge Function: Smart Match via xAI Grok
// Deploy: supabase functions deploy smart-match

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userProfile, candidateIssues } = await req.json();

    if (!userProfile || !candidateIssues?.length) {
      return new Response(
        JSON.stringify({ error: "Missing userProfile or candidateIssues" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    if (!XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "xAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the AI prompt
    const systemPrompt = `You are an expert developer-issue matchmaker for open source contributions. 

Given a developer's profile and a list of open GitHub issues, score each issue from 0.0 to 1.0 on how well it matches the developer's skills.

Consider:
- Language/framework alignment (highest weight)
- Difficulty vs experience level
- Topic relevance
- Issue freshness and engagement

Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "matches": [
    {"issueId": <number>, "matchScore": <0.0-1.0>, "reason": "<1 sentence why>"}
  ]
}

Sort by matchScore descending. Include ALL issues from the input.`;

    const userPrompt = `## Developer Profile
- Username: ${userProfile.username}
- Top Languages: ${userProfile.topLanguages.map((l: any) => `${l.language} (${l.repoCount} repos)`).join(", ")}
- Topics: ${userProfile.topics.join(", ") || "none detected"}
- Experience Level: ${userProfile.experienceLevel}
- Total Repos: ${userProfile.repoCount}
- Total Stars: ${userProfile.totalStars}

## Candidate Issues (score each one)
${candidateIssues.map((issue: any, i: number) => 
  `${i + 1}. [ID: ${issue.id}] "${issue.title}" in ${issue.repo} | Labels: ${issue.labels.join(", ")} | ${issue.body?.substring(0, 150) || "no description"}`
).join("\n")}`;

    // Call xAI
    const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("xAI error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI matching failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    console.log("AI raw response content:", content);

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No AI response content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the AI response
    let parsed;
    try {
      // Handle potential markdown code blocks in response
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize: ensure issueId is a number and matchScore is a float
    if (parsed.matches && Array.isArray(parsed.matches)) {
      parsed.matches = parsed.matches.map((m: any) => ({
        ...m,
        issueId: Number(m.issueId) || m.issueId,
        matchScore: parseFloat(m.matchScore) || 0,
      }));
    }

    console.log("Parsed matches count:", parsed.matches?.length);
    console.log("Sample match:", JSON.stringify(parsed.matches?.[0]));

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Smart match error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
