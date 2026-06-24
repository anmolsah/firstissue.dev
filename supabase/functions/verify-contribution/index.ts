import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseClient.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { isActiveSupporter, FREE_ATTESTATION_LIMIT } from "../_shared/supporter.ts";

const GITHUB_API_BASE = 'https://api.github.com';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prUrl, githubUsername } = await req.json();

    if (!prUrl || !githubUsername) {
      return new Response(JSON.stringify({ error: "Missing prUrl or githubUsername" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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

    // ── Enforce the freemium limit server-side ──
    // Free accounts may mint up to FREE_ATTESTATION_LIMIT proofs; supporters unlimited.
    if (!(await isActiveSupporter(supabaseAdmin, userId))) {
      const { count, error: countError } = await supabaseAdmin
        .from("user_attestations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        console.error("Failed to count existing attestations:", countError);
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

    // Parse PR URL (e.g., https://github.com/vercel/next.js/pull/123)
    const urlMatch = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!urlMatch) {
      return new Response(JSON.stringify({ error: "Invalid GitHub PR URL format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const [, owner, repo, pullNumber] = urlMatch;
    const repoName = `${owner}/${repo}`;

    // Fetch PR details from GitHub API
    // Using an optional GitHub token if available from env to prevent rate limiting, otherwise public access
    const ghToken = Deno.env.get("GITHUB_API_TOKEN");
    const ghHeaders = {
      "Accept": "application/vnd.github.v3+json",
      ...(ghToken ? { "Authorization": `Bearer ${ghToken}` } : {})
    };

    const prRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
      headers: ghHeaders
    });

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

    // Verify ownership and merged status
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

    // Calculate Impact Score
    // Base: 10 points
    // +1 point per 10 lines of code added
    // +1 point per 20 lines deleted
    // +5 points per comment/review
    // Cap at 100 per PR, plus repo prestige bonus
    const additions = prData.additions || 0;
    const deletions = prData.deletions || 0;
    const comments = prData.comments || 0;
    const reviewComments = prData.review_comments || 0;
    
    let baseScore = 10 + Math.floor(additions / 10) + Math.floor(deletions / 20) + ((comments + reviewComments) * 5);
    baseScore = Math.min(baseScore, 100);

    // Repo prestige bonus (fetch repo stars)
    const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers: ghHeaders });
    let repoStars = 0;
    let primaryLanguage = "Unknown";
    if (repoRes.ok) {
      const repoData = await repoRes.json();
      repoStars = repoData.stargazers_count || 0;
      primaryLanguage = repoData.language || "Unknown";
    }

    let bonus = 0;
    if (repoStars > 10000) bonus = 50;
    else if (repoStars > 1000) bonus = 30;
    else if (repoStars > 100) bonus = 10;

    const totalImpactScore = baseScore + bonus;

    // Generate simulated on-chain identifiers
    const timestampStr = new Date().toISOString();
    
    // In Deno, we use Web Crypto API to generate a hash
    const encoder = new TextEncoder();
    const dataToHash = encoder.encode(`${userId}-${repoName}-${pullNumber}-${timestampStr}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const txHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const attestationId = 'att_' + txHash.substring(2, 18);

    // Insert into database using the Service Role client created above.
    const attestationData = {
      user_id: userId,
      repo_name: repoName,
      pr_number: parseInt(pullNumber, 10),
      pr_title: prData.title,
      impact_score: totalImpactScore,
      primary_language: primaryLanguage,
      merged_at: prData.merged_at,
      tx_hash: txHash,
      attestation_id: attestationId
    };

    const { error: insertError } = await supabaseAdmin
      .from('user_attestations')
      .insert(attestationData);

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        return new Response(JSON.stringify({ error: "You have already minted a proof for this Pull Request" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      console.error("Database insert error:", insertError);
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
