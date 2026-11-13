// Supabase Edge Function: GitHub Data Proxy & Cache
// Deploy: supabase functions deploy github-data

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseClient.ts";
import {
  fetchRepoHealthGraphQLBatch,
  type RepoHealthRecord,
} from "../_shared/repoHealth.ts";

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

const MANIFEST_FRAMEWORK_MAP: Array<[RegExp, string]> = [
  [/^react(-dom)?$/i, 'React'],
  [/^next$/i, 'Next.js'],
  [/^vue$/i, 'Vue'],
  [/^nuxt/i, 'Nuxt'],
  [/^@angular\//i, 'Angular'],
  [/^svelte$/i, 'Svelte'],
  [/^@sveltejs\/kit$/i, 'SvelteKit'],
  [/^astro$/i, 'Astro'],
  [/^tailwindcss$/i, 'Tailwind CSS'],
  [/^vite$/i, 'Vite'],
  [/^typescript$/i, 'TypeScript'],
  [/^express$/i, 'Express'],
  [/^@nestjs\/core$/i, 'NestJS'],
  [/^fastify$/i, 'Fastify'],
  [/^prisma$/i, 'Prisma'],
  [/^@supabase\/supabase-js$/i, 'Supabase'],
  [/^@tanstack\/react-query$/i, 'React Query'],
  [/^(vitest|jest)$/i, 'Testing'],
  [/^(@playwright\/test|cypress)$/i, 'E2E Testing'],
  [/^graphql$/i, 'GraphQL'],
  [/^three$/i, 'Three.js'],
  [/^framer-motion$/i, 'Framer Motion'],
  [/^(zustand|@reduxjs\/toolkit|redux)$/i, 'State Management'],
  [/^django$/i, 'Django'],
  [/^fastapi$/i, 'FastAPI'],
  [/^flask$/i, 'Flask'],
  [/^(torch|pytorch)$/i, 'PyTorch'],
  [/^tensorflow$/i, 'TensorFlow'],
  [/^pandas$/i, 'Pandas'],
  [/^sqlalchemy$/i, 'SQLAlchemy'],
  [/^pydantic$/i, 'Pydantic'],
  [/^pytest$/i, 'Pytest'],
  [/^tokio$/i, 'Tokio'],
  [/^serde$/i, 'Serde'],
  [/^axum$/i, 'Axum'],
  [/^actix-web$/i, 'Actix Web'],
  [/^tauri$/i, 'Tauri'],
  [/^gin-gonic\/gin$/i, 'Gin'],
  [/^labstack\/echo$/i, 'Echo'],
  [/^gofiber\/fiber$/i, 'Fiber'],
  [/^spf13\/cobra$/i, 'Cobra'],
];

const TEXT_MANIFEST_KEYWORDS: Array<[string, string]> = [
  ['django', 'Django'],
  ['fastapi', 'FastAPI'],
  ['flask', 'Flask'],
  ['pytorch', 'PyTorch'],
  ['torch', 'PyTorch'],
  ['tensorflow', 'TensorFlow'],
  ['pandas', 'Pandas'],
  ['sqlalchemy', 'SQLAlchemy'],
  ['pydantic', 'Pydantic'],
  ['pytest', 'Pytest'],
  ['tokio', 'Tokio'],
  ['serde', 'Serde'],
  ['axum', 'Axum'],
  ['actix-web', 'Actix Web'],
  ['tauri', 'Tauri'],
  ['gin-gonic/gin', 'Gin'],
  ['labstack/echo', 'Echo'],
  ['gofiber/fiber', 'Fiber'],
  ['spf13/cobra', 'Cobra'],
];

function detectFrameworksFromManifestTexts(texts: {
  pkg?: string | null;
  req?: string | null;
  pyproj?: string | null;
  cargo?: string | null;
  gomod?: string | null;
}): string[] {
  const found = new Set<string>();

  if (texts.pkg) {
    try {
      const parsed = JSON.parse(texts.pkg);
      const depNames = [
        ...Object.keys(parsed?.dependencies || {}),
        ...Object.keys(parsed?.devDependencies || {}),
      ];
      for (const dep of depNames) {
        for (const [pattern, label] of MANIFEST_FRAMEWORK_MAP) {
          if (pattern.test(dep)) found.add(label);
        }
      }
    } catch {
      // Ignore malformed package.json
    }
  }

  const lineSources = [texts.req, texts.pyproj, texts.cargo, texts.gomod].filter(Boolean) as string[];
  for (const content of lineSources) {
    const lower = content.toLowerCase();
    for (const [needle, label] of TEXT_MANIFEST_KEYWORDS) {
      if (lower.includes(needle)) {
        found.add(label);
      }
    }
  }

  return Array.from(found);
}

async function extractProfile(username: string, token?: string) {
  const cacheKey = `profile:v3:${username}`;

  // 1. Check Cache
  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Profile for ${username}`);
    return cached;
  }

  const ghToken = token || Deno.env.get("GITHUB_API_TOKEN");

  // 2. Fetch from GitHub
  const reposResponse = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=pushed&per_page=30&type=owner`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
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
        const normalized = t.toLowerCase().replace(/\s+/g, '');
        if (FRAMEWORK_KEYWORDS[normalized]) {
          detectedFrameworks.add(FRAMEWORK_KEYWORDS[normalized]);
        }
      });
    }
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
  });

  // 4. Batched GraphQL: inspect manifests on top 6 non-fork repos + real PR contribution history
  let externalPRCount = 0;
  let totalPRCount = 0;
  const recentContributedRepos: string[] = [];

  if (ghToken) {
    const ownedTopRepos = (Array.isArray(repos) ? repos : [])
      .filter((r: any) => !r.fork && !r.archived && /^[a-zA-Z0-9._-]+$/.test(r.name || ''))
      .slice(0, 6);

    const repoFields = ownedTopRepos
      .map((r: any, idx: number) => `
        r${idx}: repository(owner: "${username}", name: "${r.name}") {
          pkg: object(expression: "HEAD:package.json") { ... on Blob { text } }
          req: object(expression: "HEAD:requirements.txt") { ... on Blob { text } }
          pyproj: object(expression: "HEAD:pyproject.toml") { ... on Blob { text } }
          cargo: object(expression: "HEAD:Cargo.toml") { ... on Blob { text } }
          gomod: object(expression: "HEAD:go.mod") { ... on Blob { text } }
        }`)
      .join('\n');

    const gqlQuery = `query($login:String!) {
      user(login:$login) {
        contributionsCollection {
          totalPullRequestContributions
          totalCommitContributions
          pullRequestContributionsByRepository(maxRepositories: 15) {
            repository { nameWithOwner stargazerCount }
            contributions { totalCount }
          }
        }
      }
      ${repoFields}
    }`;

    try {
      const gqlRes = await fetch(`${GITHUB_API_BASE}/graphql`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'firstissue.dev',
        },
        body: JSON.stringify({ query: gqlQuery, variables: { login: username } }),
      });

      if (gqlRes.ok) {
        const gqlData = (await gqlRes.json())?.data || {};
        const contrib = gqlData.user?.contributionsCollection;
        if (contrib) {
          totalPRCount = Number(contrib.totalPullRequestContributions ?? 0);
          const prByRepo: any[] = contrib.pullRequestContributionsByRepository || [];
          const lowerUser = `${username.toLowerCase()}/`;
          for (const entry of prByRepo) {
            const nameWithOwner: string = entry?.repository?.nameWithOwner || '';
            const count = Number(entry?.contributions?.totalCount ?? 0);
            if (nameWithOwner && !nameWithOwner.toLowerCase().startsWith(lowerUser)) {
              externalPRCount += count;
              if (recentContributedRepos.length < 5) {
                recentContributedRepos.push(nameWithOwner);
              }
            }
          }
        }

        ownedTopRepos.forEach((_: any, idx: number) => {
          const node = gqlData[`r${idx}`];
          if (!node) return;
          const manifestFrameworks = detectFrameworksFromManifestTexts({
            pkg: node.pkg?.text,
            req: node.req?.text,
            pyproj: node.pyproj?.text,
            cargo: node.cargo?.text,
            gomod: node.gomod?.text,
          });
          manifestFrameworks.forEach((fw) => detectedFrameworks.add(fw));
        });
      }
    } catch (e) {
      console.warn('[extractProfile] GraphQL manifest/PR inspection failed cleanly:', e);
    }
  }

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ language: lang, repoCount: count }));

  let experienceLevel = 'beginner';
  if (externalPRCount >= 1 || totalPRCount >= 3 || repos.length > 15 || totalStars > 40) {
    experienceLevel = 'intermediate';
  }
  if (externalPRCount >= 5 || totalPRCount >= 15 || (repos.length > 40 && totalStars > 180)) {
    experienceLevel = 'advanced';
  }

  const profile = {
    username,
    topLanguages,
    topics: Array.from(topics).slice(0, 15),
    detectedFrameworks: Array.from(detectedFrameworks).slice(0, 20),
    repoCount: repos.length,
    totalStars,
    totalForks,
    experienceLevel,
    externalPRCount,
    totalPRCount,
    recentContributedRepos,
  };

  // 5. Cache (TTL: 24 hours = 86400s)
  await redisSet(cacheKey, profile, 86400);

  return profile;
}

function stripTemplateNoise(rawBody: string | null | undefined, maxLen = 450): string {
  if (!rawBody || typeof rawBody !== 'string') return '';
  return rawBody
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s*(describe the bug|bug description|steps to reproduce|expected behavior|additional context|checklist)\b.*$/gim, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLen);
}

function getSafeAdminClient() {
  try {
    if (Deno.env.get("SUPABASE_URL") && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
      return createAdminClient();
    }
  } catch {
    // Graceful no-op when service credentials aren't mounted
  }
  return null;
}

async function fetchTrustedRepoSlugsForLanguages(langList: string[]): Promise<string[]> {
  const admin = getSafeAdminClient();
  if (!admin || langList.length === 0) return [];

  try {
    const { data } = await admin
      .from("trusted_repos")
      .select("github_url, organization, name, language")
      .eq("is_active", true)
      .order("stars", { ascending: false })
      .limit(60);

    const langSet = new Set(langList.map((l) => l.toLowerCase()));
    const matched: string[] = [];

    for (const row of data || []) {
      const rowLang = String(row.language || '').toLowerCase();
      if (rowLang && !langSet.has(rowLang)) continue;
      let slug = '';
      if (row.github_url) {
        try {
          const parts = new URL(row.github_url).pathname.replace(/^\/|\/$/g, '').split('/');
          if (parts.length >= 2) slug = `${parts[0]}/${parts[1]}`;
        } catch { /* ignore */ }
      }
      if (!slug && row.organization && row.name && !row.name.includes('/')) {
        slug = `${row.organization}/${row.name}`;
      }
      if (/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(slug)) {
        matched.push(slug);
      }
      if (matched.length >= 10) break;
    }

    return matched;
  } catch {
    return [];
  }
}

async function enrichReposWithHealth(
  repos: string[],
  ghToken?: string
): Promise<Record<string, RepoHealthRecord>> {
  const uniqueRepos = Array.from(
    new Set(repos.filter((repo) => /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repo)))
  );
  if (uniqueRepos.length === 0) return {};

  const result: Record<string, RepoHealthRecord> = {};

  // 1. Check Redis cache first
  const cachedEntries = await Promise.all(
    uniqueRepos.map(async (repo) => ({ repo, data: await redisGet(`repo:health:v1:${repo}`) }))
  );

  let missing: string[] = [];
  for (const entry of cachedEntries) {
    if (entry.data && typeof entry.data.health_score === "number") {
      result[entry.repo] = entry.data as RepoHealthRecord;
    } else {
      missing.push(entry.repo);
    }
  }

  // 2. Check Postgres repo_health table for fresh (< 7 days) records
  if (missing.length > 0) {
    const admin = getSafeAdminClient();
    if (admin) {
      try {
        const cutoffIso = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: rows } = await admin
          .from("repo_health")
          .select("*")
          .in("repo_full_name", missing)
          .gte("synced_at", cutoffIso);

        for (const row of rows || []) {
          result[row.repo_full_name] = row as RepoHealthRecord;
          await redisSet(`repo:health:v1:${row.repo_full_name}`, row, 43200);
        }
        missing = missing.filter((repo) => !result[repo]);
      } catch {
        // Table may not exist before migration; continue cleanly
      }
    }
  }

  // 3. On-demand GraphQL health fetch for remaining misses (cap 12 per request)
  if (missing.length > 0 && ghToken) {
    const onDemand = await fetchRepoHealthGraphQLBatch(missing.slice(0, 12), ghToken, 6);
    const onDemandRecords = Object.values(onDemand);
    for (const rec of onDemandRecords) {
      result[rec.repo_full_name] = rec;
      await Promise.all([
        redisSet(`repo:health:v1:${rec.repo_full_name}`, rec, 43200),
        redisSet(
          `repo:meta:v1:${rec.repo_full_name}`,
          { stars: rec.stars, pushed_at: rec.last_pushed_at, archived: rec.is_archived },
          43200
        ),
      ]);
    }

    if (onDemandRecords.length > 0) {
      const admin = getSafeAdminClient();
      if (admin) {
        try {
          const { error } = await admin
            .from("repo_health")
            .upsert(onDemandRecords, { onConflict: "repo_full_name" });
          if (error) console.warn("[repo_health upsert skipped]:", error.message);
        } catch (err) {
          console.warn("[repo_health upsert skipped]:", err);
        }
      }
    }
  }

  return result;
}

async function fetchIssues(languages: any[], token?: string, preferredLabels?: string[]) {
  // Default labels if not specified
  const labels = preferredLabels && preferredLabels.length > 0
    ? preferredLabels
    : ["good first issue", "help wanted"];

  const langList = languages.slice(0, 3).map((l: any) => l.language.toLowerCase());
  const cacheKey = `issues:v4:${langList.join('_')}:${[...labels].sort().join('_')}`;

  // 1. Check Cache
  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Issues for ${langList.join(', ')} with labels ${labels.join(', ')}`);
    return cached;
  }

  // 2. Run queries across labels + trusted repos pool
  const allIssues: any[] = [];
  const seenIds = new Set<number>();

  const ghToken = token || Deno.env.get("GITHUB_API_TOKEN");

  for (const label of labels) {
    const langFilter = langList.map((l: string) => `language:${l}`).join(' ');
    const query = `state:open type:issue label:"${label}" ${langFilter} is:public no:assignee -linked:pr archived:false -label:duplicate -label:invalid -label:wontfix -label:"won't fix" -label:stale -label:spam -label:blocked -label:"on hold" -label:"not planned" -label:"needs triage" -label:"cannot reproduce"`;

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        console.error(`GitHub search error for label "${label}":`, response.status);
        continue;
      }

      const data = await response.json();
      for (const issue of (data.items || [])) {
        if (!seenIds.has(issue.id) && !issue.pull_request && !issue.locked) {
          seenIds.add(issue.id);
          allIssues.push(issue);
        }
      }
    } catch (e) {
      console.error(`Error fetching issues for label "${label}":`, e);
    }
  }

  // Pull additional vetted issues from matching trusted_repos
  const trustedSlugs = await fetchTrustedRepoSlugsForLanguages(langList);
  if (trustedSlugs.length > 0) {
    const repoFilter = trustedSlugs.map((slug) => `repo:${slug}`).join(' ');
    const labelUnion = `label:${labels.map((l) => `"${l}"`).join(',')}`;
    const trustedQuery = `state:open type:issue ${labelUnion} ${repoFilter} is:public no:assignee -linked:pr archived:false`;
    try {
      const trustedRes = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(trustedQuery)}&sort=updated&order=desc&per_page=25`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
          },
        }
      );
      if (trustedRes.ok) {
        const trustedData = await trustedRes.json();
        for (const issue of (trustedData.items || [])) {
          if (!seenIds.has(issue.id) && !issue.pull_request && !issue.locked) {
            seenIds.add(issue.id);
            allIssues.push({ ...issue, _fromTrustedRepo: true });
          }
        }
      }
    } catch (e) {
      console.warn('[fetchIssues] trusted_repos enrichment skipped:', e);
    }
  }

  console.log(`[fetchIssues] Total unique issues fetched: ${allIssues.length}`);

  const repoNames = allIssues.map((issue: any) => issue.repository_url.split('/').slice(-2).join('/'));
  const healthMap = await enrichReposWithHealth(repoNames, ghToken);
  const missingMetaRepos = repoNames.filter((r) => !healthMap[r]);
  const repoMeta = missingMetaRepos.length > 0 ? await fetchRepoMetaBatch(missingMetaRepos, ghToken) : {};

  // 3. Format and enrich with quality signals, real repo stars, and repo_health
  const formattedIssues = allIssues.map((issue: any) => {
    const repoName = issue.repository_url.split('/').slice(-2).join('/');
    const health = healthMap[repoName] || null;
    const meta = repoMeta[repoName];
    return {
      id: issue.id,
      title: issue.title,
      body: stripTemplateNoise(issue.body, 450),
      labels: issue.labels.map((l: any) => l.name),
      repo: repoName,
      url: issue.html_url,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      comments: issue.comments,
      author_association: issue.author_association,
      user_avatar: issue.user?.avatar_url,
      from_trusted_repo: Boolean(issue._fromTrustedRepo),
      is_assigned: !!issue.assignee || (Array.isArray(issue.assignees) && issue.assignees.length > 0),
      created_days_ago: daysSince(issue.created_at),
      repo_stars: health?.stars ?? meta?.stars ?? issue.repository?.stargazers_count ?? null,
      repo_pushed_at: health?.last_pushed_at ?? meta?.pushed_at ?? null,
      repo_archived: health?.is_archived ?? meta?.archived ?? false,
      repo_health: health,
    };
  });

  // 4. Apply quality filters
  const filtered = formattedIssues.filter((issue: any) => {
    if (issue.is_assigned || issue.repo_archived) return false;
    if (issue.created_days_ago > 120 && issue.comments === 0) return false;
    return true;
  });

  // 5. Broaden pool with soft cap (max 4 per repo, max 45 total) for per-user client pre-ranking
  const repoCounts: Record<string, number> = {};
  const diverseIssues = filtered
    .filter((issue: any) => {
      repoCounts[issue.repo] = (repoCounts[issue.repo] || 0) + 1;
      return repoCounts[issue.repo] <= 4;
    })
    .slice(0, 45);

  console.log(`[fetchIssues] After filters: ${filtered.length} quality, ${diverseIssues.length} pool`);

  // 6. Cache (TTL: 2 hours = 7200s)
  await redisSet(cacheKey, diverseIssues, 7200);

  return diverseIssues;
}

const EXPLORE_EXCLUDED_LABELS = [
  "wontfix",
  "invalid",
  "duplicate",
  "stale",
  "blocked",
  "on hold",
  "need more info",
  "needs info",
  "needs-info",
  "question",
  "discussion",
];

async function fetchRepoMetaBatch(
  repos: string[],
  token?: string
): Promise<Record<string, { stars: number; pushed_at: string | null; archived: boolean }>> {
  const uniqueRepos = Array.from(
    new Set(
      repos.filter((repo) => /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repo))
    )
  );
  if (uniqueRepos.length === 0) return {};

  const result: Record<string, { stars: number; pushed_at: string | null; archived: boolean }> = {};
  const cachedEntries = await Promise.all(
    uniqueRepos.map(async (repo) => ({ repo, data: await redisGet(`repo:meta:v1:${repo}`) }))
  );

  const missing: string[] = [];
  for (const entry of cachedEntries) {
    if (entry.data && typeof entry.data.stars === "number") {
      result[entry.repo] = entry.data;
    } else {
      missing.push(entry.repo);
    }
  }

  if (missing.length === 0) return result;

  const ghToken = token || Deno.env.get("GITHUB_API_TOKEN");
  if (!ghToken) return result;

  // Query missing repos in chunks of 30 via GraphQL aliases.
  for (let i = 0; i < missing.length; i += 30) {
    const chunk = missing.slice(i, i + 30);
    const fields = chunk
      .map((fullName, idx) => {
        const [owner, name] = fullName.split("/");
        return `r${idx}: repository(owner: "${owner}", name: "${name}") { stargazerCount pushedAt isArchived }`;
      })
      .join("\n");

    try {
      const gqlRes = await fetch(`${GITHUB_API_BASE}/graphql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          "Content-Type": "application/json",
          "User-Agent": "firstissue.dev",
        },
        body: JSON.stringify({ query: `query {\n${fields}\n}` }),
      });

      if (!gqlRes.ok) continue;
      const payload = await gqlRes.json();
      const data = payload?.data || {};

      await Promise.all(
        chunk.map(async (fullName, idx) => {
          const node = data[`r${idx}`];
          if (!node) return;
          const meta = {
            stars: Number(node.stargazerCount ?? 0),
            pushed_at: node.pushedAt ?? null,
            archived: Boolean(node.isArchived),
          };
          result[fullName] = meta;
          await redisSet(`repo:meta:v1:${fullName}`, meta, 43200);
        })
      );
    } catch (e) {
      console.error("[fetchRepoMetaBatch] GraphQL batch error:", e);
    }
  }

  return result;
}

async function findStarredReposForExplore(
  language: string,
  minStars: number,
  ghToken?: string
): Promise<string[]> {
  const cleanLang = (language || "").trim();
  const cacheKey = `explore:repos:v1:${cleanLang || "all"}:${minStars}`;
  const cached = await redisGet(cacheKey);
  if (Array.isArray(cached) && cached.length > 0) return cached;

  const langPart = cleanLang
    ? /\s/.test(cleanLang)
      ? `language:"${cleanLang}"`
      : `language:${cleanLang}`
    : "";

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "firstissue.dev",
    ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
  };

  for (const extra of ["good-first-issues:>0", ""]) {
    const q = `stars:>=${minStars} archived:false is:public ${langPart} ${extra}`.replace(/\s+/g, " ").trim();
    try {
      const res = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=15`,
        { headers }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const repos = (data.items || []).map((r: any) => r.full_name).filter(Boolean);
      if (repos.length > 0) {
        await redisSet(cacheKey, repos, 1800);
        return repos;
      }
    } catch (e) {
      console.error("[findStarredReposForExplore] error:", e);
    }
  }

  return [];
}

async function exploreSearch({
  token,
  labels = [],
  language = "",
  keywords = "",
  sort = "updated",
  minStars = 0,
  trending = false,
  page = 1,
}: {
  token?: string;
  labels?: string[];
  language?: string;
  keywords?: string;
  sort?: string;
  minStars?: number;
  trending?: boolean;
  page?: number;
}) {
  const ghToken = token || Deno.env.get("GITHUB_API_TOKEN");
  const minStarsInt = Math.max(0, parseInt(String(minStars || 0), 10) || 0);
  const safePage = Math.max(1, Math.min(33, parseInt(String(page || 1), 10) || 1));

  let repoQualifiers: string[] = [];
  if (minStarsInt > 0 && !(keywords || "").trim()) {
    repoQualifiers = await findStarredReposForExplore(language, minStarsInt, ghToken);
  }

  const excluded = EXPLORE_EXCLUDED_LABELS.map((l) => `-label:"${l}"`).join(" ");
  const parts = [
    "state:open",
    "type:issue",
    "is:public",
    "no:assignee",
    "-linked:pr",
    "archived:false",
    excluded,
  ];

  const cleanLabels = (Array.isArray(labels) ? labels : [])
    .map((l) => String(l || "").trim())
    .filter(Boolean);
  if (cleanLabels.length === 1) {
    parts.push(`label:"${cleanLabels[0]}"`);
  } else if (cleanLabels.length > 1) {
    parts.push(`label:${cleanLabels.map((l) => `"${l}"`).join(",")}`);
  }

  const cleanLang = String(language || "").trim();
  if (cleanLang && repoQualifiers.length === 0) {
    parts.push(/\s/.test(cleanLang) ? `language:"${cleanLang}"` : `language:${cleanLang}`);
  }

  if (trending) {
    const sinceDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    parts.push(`created:>=${sinceDate}`);
  }

  for (const repo of repoQualifiers) {
    parts.push(`repo:${repo}`);
  }

  const cleanKeywords = String(keywords || "").trim();
  if (cleanKeywords) {
    parts.push(cleanKeywords);
  }

  const query = parts.join(" ");
  const githubSort = trending
    ? "interactions"
    : sort === "created"
      ? "created"
      : "updated";

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "firstissue.dev",
    ...(ghToken ? { Authorization: `Bearer ${ghToken}` } : {}),
  };

  const response = await fetch(
    `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&sort=${githubSort}&order=desc&per_page=30&page=${safePage}`,
    { headers }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub search failed (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawItems: any[] = data.items || [];

  const repoNames = rawItems
    .map((issue: any) => issue.repository_url?.split("/").slice(-2).join("/"))
    .filter(Boolean);
  const healthMap = await enrichReposWithHealth(repoNames, ghToken);
  const missingMetaRepos = repoNames.filter((r) => !healthMap[r]);
  const repoMeta = missingMetaRepos.length > 0 ? await fetchRepoMetaBatch(missingMetaRepos, ghToken) : {};

  const items = rawItems
    .map((issue: any) => {
      const repoName = issue.repository_url?.split("/").slice(-2).join("/") || "";
      const health = healthMap[repoName] || null;
      const meta = repoMeta[repoName];
      return {
        ...issue,
        repo_stars: health?.stars ?? meta?.stars ?? null,
        repo_pushed_at: health?.last_pushed_at ?? meta?.pushed_at ?? null,
        repo_archived: health?.is_archived ?? meta?.archived ?? false,
        repo_health: health,
      };
    })
    .filter((issue: any) => {
      if (issue.pull_request || issue.locked || issue.repo_archived) return false;
      if (issue.assignee || (Array.isArray(issue.assignees) && issue.assignees.length > 0)) return false;
      if (daysSince(issue.created_at) > 180 && (issue.comments ?? 0) === 0) return false;
      if (minStarsInt > 0 && typeof issue.repo_stars === "number" && issue.repo_stars < minStarsInt) {
        return false;
      }
      return true;
    });

  return {
    items,
    total_count: Math.min(Number(data.total_count ?? 0), 1000),
    raw_count: rawItems.length,
  };
}

// Public contribution totals for any GitHub user, via the GraphQL
// contributionsCollection (past 12 months). Works for a logged-out visitor
// because it uses a SERVER token (GITHUB_API_TOKEN) rather than the viewer's —
// the numbers returned are the target user's PUBLIC contributions.
async function getContributionStats(username: string, token?: string) {
  const cacheKey = `contribstats:v1:${username}`;
  const cached = await redisGet(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Contribution stats for ${username}`);
    return cached;
  }

  const ghToken = token || Deno.env.get("GITHUB_API_TOKEN");
  if (!ghToken) throw new Error("No GitHub token available for contribution stats");

  const query = `query($login:String!){
    user(login:$login){
      contributionsCollection{
        totalCommitContributions
        totalPullRequestContributions
        contributionCalendar{ totalContributions }
      }
    }
  }`;

  const res = await fetch(`${GITHUB_API_BASE}/graphql`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ghToken}`,
      "Content-Type": "application/json",
      "User-Agent": "firstissue.dev",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.status}`);
  const json = await res.json();
  const cc = json?.data?.user?.contributionsCollection;
  if (!cc) throw new Error("User not found or no contribution data");

  const stats = {
    totalContributions: cc.contributionCalendar?.totalContributions || 0,
    totalCommits: cc.totalCommitContributions || 0,
    totalPRs: cc.totalPullRequestContributions || 0,
  };

  // Cache 6h — contribution graph doesn't change minute-to-minute.
  await redisSet(cacheKey, stats, 21600);
  return stats;
}

async function parseNaturalQuery(queryText: string) {
  const clean = String(queryText || "").trim();
  if (!clean) return { fallback: true };

  const cacheKey = `nlq:v1:${clean.toLowerCase().slice(0, 120)}`;
  const cached = await redisGet(cacheKey);
  if (cached) return cached;

  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) {
    return { fallback: true };
  }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4.3",
        temperature: 0.1,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content:
              'Convert a developer open-source issue search sentence into strict JSON. Allowed languages: typescript, javascript, python, go, rust, java, c++, c#, php, swift, ruby, kotlin, dart, or "". Allowed labels: "good first issue", "help wanted", "beginner friendly", "documentation", "bug". Allowed sort: "best", "health", "updated", "created". Output ONLY JSON: {"language":"","labels":["good first issue"],"keywords":"","minStars":"0","sort":"best","summary":""}',
          },
          { role: "user", content: clean },
        ],
      }),
    });

    if (!res.ok) return { fallback: true };
    const aiData = await res.json();
    const content = aiData?.choices?.[0]?.message?.content;
    if (!content) return { fallback: true };

    const parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    const normalized = {
      fallback: false,
      language: typeof parsed.language === "string" ? parsed.language.toLowerCase() : "",
      labels: Array.isArray(parsed.labels) && parsed.labels.length > 0 ? parsed.labels : ["good first issue"],
      keywords: typeof parsed.keywords === "string" ? parsed.keywords.trim() : "",
      minStars: String(Math.max(0, Math.min(10000, parseInt(parsed.minStars || "0", 10) || 0))),
      sort: ["best", "health", "updated", "created"].includes(parsed.sort) ? parsed.sort : "best",
      summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
    };

    await redisSet(cacheKey, normalized, 86400);
    return normalized;
  } catch {
    return { fallback: true };
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, username, token, languages, preferredLabels } = body;

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

    if (action === "exploreSearch") {
      const result = await exploreSearch({
        token,
        labels: body.labels,
        language: body.language,
        keywords: body.keywords,
        sort: body.sort,
        minStars: body.minStars,
        trending: body.trending,
        page: body.page,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "contributionStats") {
      if (!username) throw new Error("Missing username");
      const stats = await getContributionStats(username, token);
      return new Response(JSON.stringify({ stats }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "parseNaturalQuery") {
      if (!body.query) throw new Error("Missing query");
      const parsed = await parseNaturalQuery(body.query);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
