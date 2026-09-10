import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { isActiveSupporter, FREE_ATTESTATION_LIMIT } from "../_shared/supporter.ts";

const GITHUB_API_BASE = 'https://api.github.com';

async function generateQuantifiedImpact(prData: any, repoData: any) {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set. Skipping AI summary.");
    return null;
  }

  const model = Deno.env.get("OPENROUTER_COMPLETION_MODEL") || "google/gemini-2.5-flash-lite:batch";
  
  const prompt = `
You are an expert engineering manager. Analyze the following Pull Request and generate a Quantified Impact summary.
Return ONLY valid JSON matching this schema:
{
  "headline": "Short 3-6 word action-oriented title (e.g. 'Distributed State Sync Engine')",
  "impact_summary": "1-2 sentence quantified impact statement",
  "problem_solved": "Brief explanation of the underlying problem",
  "technical_highlights": ["Highlight 1", "Highlight 2"],
  "tech_stack": ["Tag1", "Tag2"]
}

PR Title: ${prData.title}
PR Body: ${(prData.body || "").substring(0, 1000)}
Additions: ${prData.additions}
Deletions: ${prData.deletions}
Changed Files: ${prData.changed_files}
Repo Description: ${repoData.description || ""}
Repo Topics: ${(repoData.topics || []).join(", ")}
`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://firstissue.dev",
        "X-Title": "FirstIssue Proof of Work",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!res.ok) {
      console.error("OpenRouter API error:", await res.text());
      return null;
    }

    const json = await res.json();
    let content = json.choices[0].message.content;
    
    // Clean up markdown formatting if present
    if (content.startsWith("\`\`\`json")) {
      content = content.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    }
    
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to generate AI impact:", err);
    return null;
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, attestationId, prUrl, githubUsername } = await req.json();

    // ── Authenticate the caller; derive userId from the JWT, never the body ──
    let userClient;
    try {
      userClient = createUserClient(req);
    } catch {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const userId = user.id;

    // Service-role client for entitlement checks and the privileged insert.
    const supabaseAdmin = createAdminClient();

    const ghToken = Deno.env.get("GITHUB_API_TOKEN");
    const ghHeaders = {
      "Accept": "application/vnd.github.v3+json",
      ...(ghToken ? { "Authorization": `Bearer ${ghToken}` } : {})
    };

    if (action === "summarize-existing") {
      if (!attestationId) {
        return new Response(JSON.stringify({ error: "Missing attestationId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Fetch existing attestation
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from('user_attestations')
        .select('*')
        .eq('id', attestationId)
        .eq('user_id', userId)
        .single();

      if (fetchErr || !existing) {
        return new Response(JSON.stringify({ error: "Attestation not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const [owner, repo] = existing.repo_name.split("/");
      
      const prRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${existing.pr_number}`, { headers: ghHeaders });
      if (!prRes.ok) throw new Error("Failed to fetch PR from GitHub");
      const prData = await prRes.json();

      const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers: ghHeaders });
      let repoData = {};
      if (repoRes.ok) {
        repoData = await repoRes.json();
      }

      const aiImpact = await generateQuantifiedImpact(prData, repoData);
      if (!aiImpact) {
         return new Response(JSON.stringify({ error: "Failed to generate AI summary." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const updatePayload = {
        headline: aiImpact.headline,
        impact_summary: aiImpact.impact_summary,
        problem_solved: aiImpact.problem_solved,
        technical_highlights: aiImpact.technical_highlights,
        tech_stack: aiImpact.tech_stack,
        repo_stars: repoData.stargazers_count || 0,
        additions: prData.additions || 0,
        deletions: prData.deletions || 0,
        changed_files: prData.changed_files || 0
      };

      const { error: updateErr } = await supabaseAdmin
        .from('user_attestations')
        .update(updatePayload)
        .eq('id', attestationId);

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({ success: true, data: { ...existing, ...updatePayload } }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    if (!prUrl || !githubUsername) {
      return new Response(JSON.stringify({ error: "Missing prUrl or githubUsername" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── Enforce the freemium limit server-side ──
    if (!(await isActiveSupporter(supabaseAdmin, userId))) {
      const { count, error: countError } = await supabaseAdmin
        .from("user_attestations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        return new Response(JSON.stringify({ error: "Could not verify attestation quota" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if ((count ?? 0) >= FREE_ATTESTATION_LIMIT) {
        return new Response(JSON.stringify({
          error: `Free accounts are limited to ${FREE_ATTESTATION_LIMIT} Proofs of Work. Become a supporter for unlimited attestations.`,
        }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Parse PR URL
    const urlMatch = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!urlMatch) {
      return new Response(JSON.stringify({ error: "Invalid GitHub PR URL format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const [, owner, repo, pullNumber] = urlMatch;
    const repoName = `${owner}/${repo}`;

    const prRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`, { headers: ghHeaders });

    if (!prRes.ok) {
      if (prRes.status === 404) {
        return new Response(JSON.stringify({ error: "Pull request not found or repository is private" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: `GitHub API error: ${prRes.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const prData = await prRes.json();

    if (prData.user.login.toLowerCase() !== githubUsername.toLowerCase()) {
      return new Response(JSON.stringify({ error: `Verification failed: PR author (${prData.user.login}) does not match your GitHub username (${githubUsername})` }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!prData.merged) {
      return new Response(JSON.stringify({ error: "Verification failed: Pull request is not merged" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const additions = prData.additions || 0;
    const deletions = prData.deletions || 0;
    const changed_files = prData.changed_files || 0;
    const comments = prData.comments || 0;
    const reviewComments = prData.review_comments || 0;
    
    let baseScore = 10 + Math.floor(additions / 10) + Math.floor(deletions / 20) + ((comments + reviewComments) * 5);
    baseScore = Math.min(baseScore, 100);

    const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers: ghHeaders });
    let repoStars = 0;
    let primaryLanguage = "Unknown";
    let repoData = {};
    if (repoRes.ok) {
      repoData = await repoRes.json();
      repoStars = repoData.stargazers_count || 0;
      primaryLanguage = repoData.language || "Unknown";
    }

    let bonus = 0;
    if (repoStars > 10000) bonus = 50;
    else if (repoStars > 1000) bonus = 30;
    else if (repoStars > 100) bonus = 10;

    const totalImpactScore = baseScore + bonus;

    const timestampStr = new Date().toISOString();
    const encoder = new TextEncoder();
    const dataToHash = encoder.encode(`${userId}-${repoName}-${pullNumber}-${timestampStr}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const txHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const attestationIdStr = 'att_' + txHash.substring(2, 18);

    // AI Generation
    const aiImpact = await generateQuantifiedImpact(prData, repoData);

    const attestationData = {
      user_id: userId,
      repo_name: repoName,
      pr_number: parseInt(pullNumber, 10),
      pr_title: prData.title,
      impact_score: totalImpactScore,
      primary_language: primaryLanguage,
      merged_at: prData.merged_at,
      tx_hash: txHash,
      attestation_id: attestationIdStr,
      repo_stars: repoStars,
      additions: additions,
      deletions: deletions,
      changed_files: changed_files,
      ...(aiImpact ? {
        headline: aiImpact.headline,
        impact_summary: aiImpact.impact_summary,
        problem_solved: aiImpact.problem_solved,
        technical_highlights: aiImpact.technical_highlights,
        tech_stack: aiImpact.tech_stack
      } : {})
    };

    const { error: insertError } = await supabaseAdmin
      .from('user_attestations')
      .insert(attestationData);

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ error: "You have already minted a proof for this Pull Request" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true, data: attestationData }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error("verify-contribution error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
