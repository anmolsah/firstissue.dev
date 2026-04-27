// Supabase Edge Function: GitHub Data Proxy & Cache
// Deploy: supabase functions deploy github-data

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GITHUB_API_BASE = 'https://api.github.com';

// Redis Helpers using Upstash REST API
async function redisGet(key: string) {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["GET", key])
    });
    const data = await res.json();
    if (data.result) {
      return JSON.parse(data.result);
    }
  } catch (e) {
    console.error(`[Redis GET] Error for key ${key}:`, e);
  }
  return null;
}

async function redisSet(key: string, value: any, ex: number) {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", key, JSON.stringify(value), "EX", ex])
    });
  } catch (e) {
    console.error(`[Redis SET] Error for key ${key}:`, e);
  }
}

async function extractProfile(username: string, token?: string) {
  const cacheKey = `profile:${username}`;
  
  // 1. Check Cache
  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Profile for ${username}`);
    return cached;
  }

  // 2. Fetch from GitHub
  const reposResponse = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=pushed&per_page=30&type=owner`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!reposResponse.ok) {
    throw new Error(`GitHub API error: ${reposResponse.status}`);
  }

  const repos = await reposResponse.json();

  // 3. Process Data
  const languageCounts: Record<string, number> = {};
  const topics = new Set<string>();
  let totalStars = 0;
  let totalForks = 0;

  repos.forEach((repo: any) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
    if (repo.topics) {
      repo.topics.forEach((t: string) => topics.add(t));
    }
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
  });

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ language: lang, repoCount: count }));

  let experienceLevel = 'beginner';
  if (repos.length > 20 || totalStars > 50) experienceLevel = 'intermediate';
  if (repos.length > 50 || totalStars > 200) experienceLevel = 'advanced';

  const profile = {
    username,
    topLanguages,
    topics: Array.from(topics).slice(0, 15),
    repoCount: repos.length,
    totalStars,
    totalForks,
    experienceLevel,
  };

  // 4. Cache (TTL: 24 hours = 86400s)
  await redisSet(cacheKey, profile, 86400);

  return profile;
}

async function fetchIssues(languages: any[], token?: string) {
  const langQuery = languages
    .slice(0, 3)
    .map((l: any) => l.language.toLowerCase())
    .join('_');
  
  const cacheKey = `issues:${langQuery || 'none'}`;

  // 1. Check Cache
  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Issues for ${langQuery}`);
    return cached;
  }

  // 2. Fetch from GitHub
  const langFilter = languages
    .slice(0, 3)
    .map((l: any) => `language:${l.language.toLowerCase()}`)
    .join(' ');

  const query = `state:open type:issue label:"good first issue" ${langFilter} is:public -label:duplicate -label:invalid`;

  const response = await fetch(
    `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  const formattedIssues = (data.items || []).map((issue: any) => ({
    id: issue.id,
    title: issue.title,
    body: issue.body?.substring(0, 300) || '',
    labels: issue.labels.map((l: any) => l.name),
    repo: issue.repository_url.split('/').slice(-2).join('/'),
    url: issue.html_url,
    created_at: issue.created_at,
    comments: issue.comments,
    user_avatar: issue.user?.avatar_url,
  }));

  // 3. Cache (TTL: 2 hours = 7200s)
  await redisSet(cacheKey, formattedIssues, 7200);

  return formattedIssues;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, username, token, languages } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    if (action === "extractProfile") {
      if (!username) throw new Error("Missing username");
      const profile = await extractProfile(username, token);
      return new Response(JSON.stringify({ profile }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    } 
    
    if (action === "fetchIssues") {
      if (!languages || !Array.isArray(languages)) throw new Error("Missing or invalid languages");
      const issues = await fetchIssues(languages, token);
      return new Response(JSON.stringify({ issues }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    throw new Error("Invalid action");

  } catch (error: any) {
    console.error("github-data error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
