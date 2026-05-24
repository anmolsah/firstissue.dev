// Supabase Edge Function: GitHub Data Proxy & Cache
// Deploy: supabase functions deploy github-data

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const GITHUB_API_BASE = 'https://api.github.com';

// Framework detection map — maps repo topics to framework names
const FRAMEWORK_KEYWORDS: Record<string, string> = {
  'react': 'React', 'reactjs': 'React', 'react-js': 'React',
  'nextjs': 'Next.js', 'next-js': 'Next.js', 'next': 'Next.js',
  'vue': 'Vue', 'vuejs': 'Vue', 'vue-js': 'Vue',
  'nuxt': 'Nuxt', 'nuxtjs': 'Nuxt',
  'angular': 'Angular', 'angularjs': 'Angular',
  'svelte': 'Svelte', 'sveltekit': 'SvelteKit',
  'express': 'Express', 'expressjs': 'Express',
  'nestjs': 'NestJS', 'nest-js': 'NestJS',
  'fastify': 'Fastify',
  'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI',
  'spring': 'Spring', 'springboot': 'Spring Boot', 'spring-boot': 'Spring Boot',
  'rails': 'Rails', 'ruby-on-rails': 'Rails',
  'laravel': 'Laravel',
  'tailwindcss': 'Tailwind CSS', 'tailwind': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'nodejs': 'Node.js', 'node-js': 'Node.js', 'node': 'Node.js',
  'deno': 'Deno',
  'docker': 'Docker', 'kubernetes': 'Kubernetes',
  'typescript': 'TypeScript',
  'graphql': 'GraphQL',
  'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
  'firebase': 'Firebase', 'supabase': 'Supabase',
  'flutter': 'Flutter', 'dart': 'Dart',
  'react-native': 'React Native', 'reactnative': 'React Native',
  'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch',
  'aws': 'AWS', 'gcp': 'GCP', 'azure': 'Azure',
};

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

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

async function extractProfile(username: string, token?: string) {
  const cacheKey = `profile:v2:${username}`;
  
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
  const detectedFrameworks = new Set<string>();
  let totalStars = 0;
  let totalForks = 0;

  repos.forEach((repo: any) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
    if (repo.topics) {
      repo.topics.forEach((t: string) => {
        topics.add(t);
        // Auto-detect frameworks from topics
        const normalized = t.toLowerCase().replace(/\s+/g, '');
        if (FRAMEWORK_KEYWORDS[normalized]) {
          detectedFrameworks.add(FRAMEWORK_KEYWORDS[normalized]);
        }
      });
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
    detectedFrameworks: Array.from(detectedFrameworks),
    repoCount: repos.length,
    totalStars,
    totalForks,
    experienceLevel,
  };

  // 4. Cache (TTL: 24 hours = 86400s)
  await redisSet(cacheKey, profile, 86400);

  return profile;
}

async function fetchIssues(languages: any[], token?: string, preferredLabels?: string[]) {
  // Default labels if not specified
  const labels = preferredLabels && preferredLabels.length > 0
    ? preferredLabels
    : ["good first issue", "help wanted"];

  const langList = languages.slice(0, 3).map((l: any) => l.language.toLowerCase());
  const cacheKey = `issues:v2:${langList.join('_')}:${labels.sort().join('_')}`;

  // 1. Check Cache
  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Issues for ${langList.join(', ')} with labels ${labels.join(', ')}`);
    return cached;
  }

  // 2. Run multiple queries — one per label × language combo for wider coverage
  const allIssues: any[] = [];
  const seenIds = new Set<number>();

  for (const label of labels) {
    // Combine all languages into one query per label for efficiency
    const langFilter = langList.map((l: string) => `language:${l}`).join(' ');
    const query = `state:open type:issue label:"${label}" ${langFilter} is:public -label:duplicate -label:invalid`;

    try {
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
        console.error(`GitHub search error for label "${label}":`, response.status);
        continue;
      }

      const data = await response.json();
      for (const issue of (data.items || [])) {
        if (!seenIds.has(issue.id)) {
          seenIds.add(issue.id);
          allIssues.push(issue);
        }
      }
    } catch (e) {
      console.error(`Error fetching issues for label "${label}":`, e);
    }
  }

  console.log(`[fetchIssues] Total unique issues fetched: ${allIssues.length}`);

  // 3. Format and enrich with quality signals
  const formattedIssues = allIssues.map((issue: any) => ({
    id: issue.id,
    title: issue.title,
    body: issue.body?.substring(0, 300) || '',
    labels: issue.labels.map((l: any) => l.name),
    repo: issue.repository_url.split('/').slice(-2).join('/'),
    url: issue.html_url,
    created_at: issue.created_at,
    comments: issue.comments,
    user_avatar: issue.user?.avatar_url,
    // Quality signals
    is_assigned: !!issue.assignee,
    created_days_ago: daysSince(issue.created_at),
    repo_stars: issue.repository?.stargazers_count || null,
  }));

  // 4. Apply quality filters
  const filtered = formattedIssues.filter((issue: any) => {
    // Filter out assigned issues (someone's already working on it)
    if (issue.is_assigned) return false;
    // Filter out stale issues (> 90 days old with 0 comments = likely abandoned)
    if (issue.created_days_ago > 90 && issue.comments === 0) return false;
    return true;
  });

  // 5. Apply repo diversity cap — max 3 issues per repo
  const repoCounts: Record<string, number> = {};
  const diverseIssues = filtered.filter((issue: any) => {
    repoCounts[issue.repo] = (repoCounts[issue.repo] || 0) + 1;
    return repoCounts[issue.repo] <= 3;
  });

  console.log(`[fetchIssues] After filters: ${filtered.length} quality, ${diverseIssues.length} diverse`);

  // 6. Cache (TTL: 2 hours = 7200s)
  await redisSet(cacheKey, diverseIssues, 7200);

  return diverseIssues;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, username, token, languages, preferredLabels } = await req.json();

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
      const issues = await fetchIssues(languages, token, preferredLabels);
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
