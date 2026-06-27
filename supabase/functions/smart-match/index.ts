// Supabase Edge Function: Smart Match via xAI Grok
// Deploy: supabase functions deploy smart-match

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createUserClient, createAdminClient } from "../_shared/supabaseClient.ts";
import { isActiveSupporter } from "../_shared/supporter.ts";

// Free (non-supporter) users get a taste of Smart Match: the top N AI-ranked
// matches are revealed, the rest are locked behind an upgrade. To contain the
// cost of the billed AI provider for free traffic, we also cap how many
// candidate issues the AI scores for them.
const FREE_PREVIEW_MATCHES = 2;
const FREE_PREVIEW_CANDIDATES = 12;

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Authenticate the caller and enforce Supporter-only access ──
    // Smart Match is a paid feature and calls a billed AI provider, so it must
    // be gated server-side rather than relying on the client UI.
    let userClient;
    try {
      userClient = createUserClient(req);
    } catch {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Supporters get the full ranked list; everyone else gets a free preview
    // (top FREE_PREVIEW_MATCHES). We no longer hard-block non-supporters here.
    const supporter = await isActiveSupporter(createAdminClient(), user.id);

    const { userProfile, candidateIssues } = await req.json();

    if (!userProfile || !candidateIssues?.length) {
      return new Response(
        JSON.stringify({ error: "Missing userProfile or candidateIssues" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit how many issues the AI scores for free users to contain cost.
    const scoredCandidates = supporter
      ? candidateIssues
      : candidateIssues.slice(0, FREE_PREVIEW_CANDIDATES);

    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    if (!XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "xAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the AI prompt
    const systemPrompt = `You are an expert developer-issue matchmaker for open source contributions.

Given a developer's profile (including their self-declared tech stack) and a list of open GitHub issues, score each issue from 0.0 to 1.0 on how well it matches the developer.

Scoring criteria (in order of importance):
1. **Tech Stack Alignment** (highest weight): Match the developer's declared tech stack and frameworks. A React developer should score React issues much higher than Vue issues. Language match alone is not enough — framework matters most.
2. **Difficulty Appropriateness**: Match issue complexity to the developer's experience level. Beginners should get simple, well-documented issues. Advanced developers should get meatier challenges.
3. **Repo Quality**: Prefer issues from repos with 10+ stars, recent activity, and responsive maintainers. Penalize issues from very low-quality repos (< 5 stars, no recent updates).
4. **Issue Quality**: Prefer issues with clear, detailed descriptions over vague one-liners. Issues with 0 comments and poor descriptions should score lower.
5. **Uniqueness**: If multiple issues are nearly identical tasks (e.g., "Create X Theme: Y Section"), they should NOT all get the same high score. Give the BEST one a high score and progressively lower scores to the rest. Developers want variety.

CRITICAL RULES:
- Do NOT give the same score to multiple similar issues. Differentiate them.
- Scores should span a wide range (use the full 0.0 to 1.0 scale).
- Every reason must be specific to the issue, not generic.

Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "matches": [
    {"issueId": <number>, "matchScore": <0.0-1.0>, "reason": "<1 specific sentence>"}
  ]
}

Sort by matchScore descending. Include ALL issues from the input.`;

    // Build tech stack display
    const techStackDisplay = userProfile.techStack && userProfile.techStack.length > 0
      ? `- Declared Tech Stack: ${userProfile.techStack.join(", ")}`
      : "";
    
    const frameworksDisplay = userProfile.detectedFrameworks && userProfile.detectedFrameworks.length > 0
      ? `- Auto-detected Frameworks: ${userProfile.detectedFrameworks.join(", ")}`
      : "";

    const userPrompt = `## Developer Profile
- Username: ${userProfile.username}
- Top Languages: ${userProfile.topLanguages.map((l: any) => `${l.language} (${l.repoCount} repos)`).join(", ")}
${techStackDisplay}
${frameworksDisplay}
- Topics: ${userProfile.topics.join(", ") || "none detected"}
- Experience Level: ${userProfile.experienceLevel}
- Total Repos: ${userProfile.repoCount}
- Total Stars: ${userProfile.totalStars}

## Candidate Issues (score each one)
${scoredCandidates.map((issue: any, i: number) => {
  const stars = issue.repo_stars ? `⭐${issue.repo_stars}` : '';
  const age = issue.created_days_ago != null ? `${issue.created_days_ago}d old` : '';
  const comments = issue.comments != null ? `${issue.comments} comments` : '';
  const meta = [stars, age, comments].filter(Boolean).join(', ');
  return `${i + 1}. [ID: ${issue.id}] "${issue.title}" in ${issue.repo} (${meta}) | Labels: ${issue.labels.join(", ")} | ${issue.body?.substring(0, 200) || "no description"}`;
}).join("\n")}`;

    console.log("[SmartMatch] Sending", scoredCandidates.length, "issues to AI (supporter:", supporter, ")");
    console.log("[SmartMatch] User tech stack:", userProfile.techStack || "not set");

    // Call xAI
    const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4.3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("xAI error status:", aiResponse.status, "body:", errorText);
      return new Response(
        JSON.stringify({ error: "AI matching failed", details: errorText, status: aiResponse.status }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    console.log("AI raw response length:", content?.length);

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
    if (parsed.matches?.length > 0) {
      console.log("Score range:",
        Math.min(...parsed.matches.map((m: any) => m.matchScore)),
        "to",
        Math.max(...parsed.matches.map((m: any) => m.matchScore))
      );
    }

    // For free users, reveal only the top matches and tell the client how many
    // more are available so it can show an upgrade prompt. The full set never
    // leaves the server, so the gate can't be bypassed from the browser.
    if (!supporter && Array.isArray(parsed.matches)) {
      const ranked = [...parsed.matches].sort((a: any, b: any) => b.matchScore - a.matchScore);
      parsed.totalAvailable = ranked.length;
      parsed.matches = ranked.slice(0, FREE_PREVIEW_MATCHES);
      parsed.limited = true;
      console.log(`[SmartMatch] Free preview: revealing ${parsed.matches.length} of ${ranked.length} matches`);
    }

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
