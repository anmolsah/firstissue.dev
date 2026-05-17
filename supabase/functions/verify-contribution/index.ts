import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getCorsHeaders } from "../_shared/cors.ts";

const GITHUB_API_BASE = 'https://api.github.com';

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prUrl } = await req.json();

    if (!prUrl) {
      return new Response(JSON.stringify({ error: "Missing prUrl" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Initialize Supabase Client to verify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the user's GitHub username from profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('github_username')
      .eq('id', user.id)
      .single();

    const githubUsername = profile?.github_username || 
                          user.user_metadata?.user_name || 
                          user.user_metadata?.preferred_username;

    if (!githubUsername) {
      return new Response(JSON.stringify({ error: "GitHub username not found in profile" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
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
    const dataToHash = encoder.encode(`${user.id}-${repoName}-${pullNumber}-${timestampStr}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const txHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const attestationId = 'att_' + txHash.substring(2, 18);

    // Insert into database using Service Role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const attestationData = {
      user_id: user.id,
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
