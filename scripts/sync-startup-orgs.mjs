import { createClient } from '@supabase/supabase-js';
import process from 'process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const equalsIdx = trimmed.indexOf('=');
          const key = trimmed.substring(0, equalsIdx).trim();
          let val = trimmed.substring(equalsIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.substring(1, val.length - 1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Warning: Failed to read local .env file:', err.message);
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN || '';
const MAX_DISCOVER = Math.max(0, parseInt(process.env.MAX_DISCOVER || '15', 10) || 15);
const MAX_STAR_REFRESH = Math.max(0, parseInt(process.env.MAX_STAR_REFRESH || '30', 10) || 30);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Curated modern open-source startup organizations guaranteed to stay present & fresh
const CURATED_STARTUPS = [
  { github_name: 'astral-sh', display_name: 'Astral', category: 'DevTools', country: 'US', founded_year: 2022, website: 'https://astral.sh', description: 'Next-generation Python developer tooling behind Ruff and uv, written in Rust.' },
  { github_name: 'zed-industries', display_name: 'Zed Industries', category: 'DevTools', country: 'US', founded_year: 2021, website: 'https://zed.dev', description: 'High-performance, multiplayer code editor written in Rust with native AI workflows.' },
  { github_name: 'biomejs', display_name: 'Biome', category: 'DevTools', country: 'Global', founded_year: 2023, website: 'https://biomejs.dev', description: 'Fast toolchain for web projects offering formatting and linting in a single Rust binary.' },
  { github_name: 'triggerdotdev', display_name: 'Trigger.dev', category: 'Infrastructure', country: 'UK', founded_year: 2022, website: 'https://trigger.dev', description: 'Open-source background jobs and long-running AI workflow infrastructure for TypeScript.' },
  { github_name: 'inngest', display_name: 'Inngest', category: 'Infrastructure', country: 'US', founded_year: 2021, website: 'https://www.inngest.com', description: 'Durable workflow engine and event-driven queues without managing infrastructure.' },
  { github_name: 'resend', display_name: 'Resend', category: 'DevTools', country: 'US', founded_year: 2023, website: 'https://resend.com', description: 'Email API and React Email component ecosystem built for developers.' },
  { github_name: 'mastra-ai', display_name: 'Mastra', category: 'AI/ML', country: 'US', founded_year: 2024, website: 'https://mastra.ai', description: 'Open-source TypeScript agent framework for building production AI applications and MCP workflows.' },
  { github_name: 'browser-use', display_name: 'Browser Use', category: 'AI/ML', country: 'US', founded_year: 2024, website: 'https://browser-use.com', description: 'Make websites accessible for AI agents with open-source browser automation.' },
  { github_name: 'pydantic', display_name: 'Pydantic', category: 'AI/ML', country: 'UK', founded_year: 2022, website: 'https://pydantic.dev', description: 'Data validation library for Python and the PydanticAI agent framework.' },
  { github_name: 'langchain-ai', display_name: 'LangChain', category: 'AI/ML', country: 'US', founded_year: 2022, website: 'https://www.langchain.com', description: 'Open-source agent orchestration, LangGraph state machines, and LLM tooling.' },
  { github_name: 'vllm-project', display_name: 'vLLM', category: 'AI/ML', country: 'US', founded_year: 2023, website: 'https://vllm.ai', description: 'High-throughput and memory-efficient inference and serving engine for LLMs.' },
  { github_name: 'crewAIInc', display_name: 'CrewAI', category: 'AI/ML', country: 'US', founded_year: 2023, website: 'https://www.crewai.com', description: 'Framework for orchestrating role-playing, autonomous AI agents in Python.' },
  { github_name: 'BerriAI', display_name: 'LiteLLM', category: 'AI/ML', country: 'US', founded_year: 2023, website: 'https://litellm.ai', description: 'Unified OpenAI-compatible proxy and SDK for calling 100+ LLM APIs.' },
  { github_name: 'composiohq', display_name: 'Composio', category: 'AI/ML', country: 'US', founded_year: 2023, website: 'https://composio.dev', description: 'Production-ready toolset and MCP integration layer for AI agents.' },
  { github_name: 'mem0ai', display_name: 'Mem0', category: 'AI/ML', country: 'US', founded_year: 2023, website: 'https://mem0.ai', description: 'Universal memory layer for personalized AI agents and assistants.' },
  { github_name: 'agno-agi', display_name: 'Agno', category: 'AI/ML', country: 'US', founded_year: 2023, website: 'https://www.agno.com', description: 'Lightweight framework for building multimodal reasoning agents with memory and tools.' },
  { github_name: 'Arize-ai', display_name: 'Arize Phoenix', category: 'AI/ML', country: 'US', founded_year: 2020, website: 'https://phoenix.arize.com', description: 'Open-source AI observability, OpenTelemetry tracing, and LLM evaluation platform.' },
  { github_name: 'qdrant', display_name: 'Qdrant', category: 'Data', country: 'Germany', founded_year: 2021, website: 'https://qdrant.tech', description: 'High-performance Rust vector similarity search engine and vector database.' },
  { github_name: 'chroma-core', display_name: 'Chroma', category: 'Data', country: 'US', founded_year: 2022, website: 'https://www.trychroma.com', description: 'AI-native open-source embedding and retrieval database.' },
  { github_name: 'neondatabase', display_name: 'Neon', category: 'Data', country: 'US', founded_year: 2021, website: 'https://neon.tech', description: 'Serverless open-source Postgres with instant branching and scale-to-zero storage.' },
  { github_name: 'tursodatabase', display_name: 'Turso', category: 'Data', country: 'US', founded_year: 2021, website: 'https://turso.tech', description: 'Edge-hosted distributed database built on libSQL, an open-source fork of SQLite.' },
  { github_name: 'lancedb', display_name: 'LanceDB', category: 'Data', country: 'US', founded_year: 2022, website: 'https://lancedb.com', description: 'Developer-friendly, embedded multimodal vector database for AI.' },
  { github_name: 'infisical', display_name: 'Infisical', category: 'Security', country: 'US', founded_year: 2022, website: 'https://infisical.com', description: 'Open-source secret management, PKI, and KMS platform for engineering teams.' },
  { github_name: 'cerbos', display_name: 'Cerbos', category: 'Security', country: 'UK', founded_year: 2021, website: 'https://cerbos.dev', description: 'Open-source, scalable authorization layer for fine-grained access control.' },
  { github_name: 'phasehq', display_name: 'Phase', category: 'Security', country: 'UK', founded_year: 2023, website: 'https://phase.dev', description: 'Open-source application secrets and environment variable management.' },
  { github_name: 'upstash', display_name: 'Upstash', category: 'Cloud', country: 'US', founded_year: 2021, website: 'https://upstash.com', description: 'Serverless Redis, Vector, and QStash messaging SDKs built for edge runtimes.' },
  { github_name: 'coollabsio', display_name: 'Coolify', category: 'Cloud', country: 'Hungary', founded_year: 2021, website: 'https://coolify.io', description: 'Open-source and self-hostable Heroku, Netlify, and Vercel alternative.' },
  { github_name: 'daytonaio', display_name: 'Daytona', category: 'Infrastructure', country: 'US', founded_year: 2023, website: 'https://www.daytona.io', description: 'Secure, elastic infrastructure for running AI-generated code and dev environments.' },
  { github_name: 'hatchet-dev', display_name: 'Hatchet', category: 'Infrastructure', country: 'US', founded_year: 2023, website: 'https://hatchet.run', description: 'Distributed, fault-tolerant task queue and workflow engine replacing legacy brokers.' },
  { github_name: 'encoredev', display_name: 'Encore', category: 'Infrastructure', country: 'Sweden', founded_year: 2021, website: 'https://encore.dev', description: 'Type-safe backend development framework for Go and TypeScript with cloud automation.' },
  { github_name: 'dagger', display_name: 'Dagger', category: 'Infrastructure', country: 'US', founded_year: 2022, website: 'https://dagger.io', description: 'Programmable CI/CD engine that runs pipelines inside portable containers.' },
  { github_name: 'medusajs', display_name: 'Medusa', category: 'FinTech', country: 'Denmark', founded_year: 2021, website: 'https://medusajs.com', description: 'Composable open-source digital commerce platform built for customization.' },
  { github_name: 'formancehq', display_name: 'Formance', category: 'FinTech', country: 'France', founded_year: 2021, website: 'https://www.formance.com', description: 'Open-source programmable financial ledger and payment orchestration infrastructure.' },
  { github_name: 'juspay', display_name: 'Hyperswitch', category: 'FinTech', country: 'India', founded_year: 2022, website: 'https://hyperswitch.io', description: 'Open-source Rust payment switch connecting global payment processors.' },
];

// Exclude Big Tech, foundations, tutorial collections, and non-startup orgs during auto-discovery
const EXCLUDED_ORG_LOGINS = new Set([
  'microsoft',
  'google',
  'facebook',
  'meta-llama',
  'apple',
  'aws',
  'amzn',
  'amazon-science',
  'cloudflare',
  'apache',
  'kubernetes',
  'cncf',
  'linuxfoundation',
  'rust-lang',
  'golang',
  'python',
  'nodejs',
  'reactjs',
  'vuejs',
  'angular',
  'sveltejs',
  'vercel',
  'mozilla',
  'redhat-developer',
  'ibm',
  'oracle',
  'alibaba',
  'tencent',
  'bytedance',
  'huggingface',
  'openai',
  'anthropics',
  'nvidia',
  'freecodecamp',
  'thealgorithms',
  'public-apis',
  'sindresorhus',
  'shadcn-ui',
  'kamranahmedse',
  'ossu',
]);

// Rotating search queries to surface active OSS startup orgs with beginner-friendly issues
const DISCOVERY_QUERIES = [
  { q: 'topic:ai-agents good-first-issues:>2 stars:400..45000 archived:false fork:false', fallbackCategory: 'AI/ML' },
  { q: 'topic:mcp good-first-issues:>1 stars:250..40000 archived:false fork:false', fallbackCategory: 'AI/ML' },
  { q: 'topic:llm good-first-issues:>3 stars:500..45000 archived:false fork:false', fallbackCategory: 'AI/ML' },
  { q: 'topic:developer-tools good-first-issues:>2 stars:400..45000 archived:false fork:false', fallbackCategory: 'DevTools' },
  { q: 'topic:vector-database good-first-issues:>1 stars:350..45000 archived:false fork:false', fallbackCategory: 'Data' },
  { q: 'topic:postgres good-first-issues:>2 stars:400..45000 archived:false fork:false', fallbackCategory: 'Data' },
  { q: 'topic:security good-first-issues:>2 stars:400..35000 archived:false fork:false', fallbackCategory: 'Security' },
  { q: 'topic:self-hosted good-first-issues:>3 stars:600..45000 archived:false fork:false', fallbackCategory: 'Cloud' },
  { q: 'topic:workflow-engine good-first-issues:>1 stars:300..40000 archived:false fork:false', fallbackCategory: 'Infrastructure' },
  { q: 'topic:payments OR topic:fintech good-first-issues:>1 stars:250..40000 archived:false fork:false', fallbackCategory: 'FinTech' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ghFetch(endpoint) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'firstissue.dev-startup-sync',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com${endpoint}`, { headers });
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new Error('GitHub API rate limit exhausted.');
    }
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${endpoint}`);
  }
  return res.json();
}

function normalizeWebsite(rawBlog) {
  if (!rawBlog || typeof rawBlog !== 'string') return '';
  let url = rawBlog.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (
      host.includes('github.com') ||
      host.includes('twitter.com') ||
      host.includes('x.com') ||
      host.includes('linkedin.com') ||
      host.includes('youtube.com')
    ) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

function normalizeCountry(rawLocation) {
  if (!rawLocation || typeof rawLocation !== 'string') return null;
  const loc = rawLocation.trim();
  if (!loc) return null;
  const lower = loc.toLowerCase();

  if (
    /\b(usa|united states|san francisco|new york|nyc|seattle|austin|boston|palo alto|california|mountain view|brooklyn|los angeles|chicago|denver)\b/.test(
      lower
    ) ||
    /,\s*(ca|ny|wa|tx|ma)\b/.test(lower)
  ) {
    return 'US';
  }
  if (/\b(uk|united kingdom|london|cambridge|edinburgh|manchester)\b/.test(lower)) return 'UK';
  if (/\b(germany|berlin|munich|hamburg)\b/.test(lower)) return 'Germany';
  if (/\b(france|paris|lyon)\b/.test(lower)) return 'France';
  if (/\b(india|bangalore|bengaluru|mumbai|delhi|hyderabad|chennai|pune)\b/.test(lower)) return 'India';
  if (/\b(canada|toronto|vancouver|montreal|waterloo)\b/.test(lower)) return 'Canada';
  if (/\b(singapore)\b/.test(lower)) return 'Singapore';
  if (/\b(switzerland|zurich|geneva)\b/.test(lower)) return 'Switzerland';
  if (/\b(netherlands|amsterdam)\b/.test(lower)) return 'Netherlands';
  if (/\b(sweden|stockholm)\b/.test(lower)) return 'Sweden';
  if (/\b(denmark|copenhagen)\b/.test(lower)) return 'Denmark';
  if (/\b(israel|tel aviv)\b/.test(lower)) return 'Israel';
  if (/\b(australia|sydney|melbourne)\b/.test(lower)) return 'Australia';
  if (/\b(remote|global|worldwide|distributed|everywhere)\b/.test(lower)) return 'Global';

  return loc.length <= 18 ? loc : null;
}

function classifyCategory(text, topics = [], fallback = 'DevTools') {
  const hay = `${text || ''} ${(topics || []).join(' ')}`.toLowerCase();
  if (/\b(fintech|payment|ledger|billing|commerce|invoice|banking|checkout)\b/.test(hay)) {
    return 'FinTech';
  }
  if (/\b(security|secret|auth|iam|oauth|encryption|vulnerability|zero-trust|kms|pentest)\b/.test(hay)) {
    return 'Security';
  }
  if (/\b(llm|agent|ai|mcp|rag|inference|ml|embedding|prompt|model|openai|vision)\b/.test(hay)) {
    return 'AI/ML';
  }
  if (/\b(postgres|database|sql|vector|olap|analytics|warehouse|etl|storage|duckdb|sqlite)\b/.test(hay)) {
    return 'Data';
  }
  if (/\b(cloud|paas|serverless|hosting|edge|deploy|self-hosted|kubernetes)\b/.test(hay)) {
    return 'Cloud';
  }
  if (/\b(queue|workflow|orchestrat|runtime|sandbox|ci\/cd|container|distributed|infra)\b/.test(hay)) {
    return 'Infrastructure';
  }
  if (/\b(cli|sdk|editor|ide|linter|formatter|compiler|testing|devtools|framework|email)\b/.test(hay)) {
    return 'DevTools';
  }
  return fallback;
}

async function fetchOrgTotalStars(orgLogin) {
  const repos = await ghFetch(
    `/orgs/${encodeURIComponent(orgLogin)}/repos?type=public&sort=pushed&per_page=40`
  );
  if (!Array.isArray(repos)) return 0;
  return repos.reduce((sum, repo) => {
    if (repo.fork) return sum;
    return sum + (Number(repo.stargazers_count) || 0);
  }, 0);
}

async function run() {
  console.log('Starting weekly FirstIssue.dev startup_orgs sync...');

  const { data: existingRows, error: fetchErr } = await supabase
    .from('startup_orgs')
    .select('id, github_name, stars, stars_synced_at');

  if (fetchErr) {
    console.error('Failed to read startup_orgs from Supabase:', fetchErr.message);
    process.exit(1);
  }

  const existingByLower = new Map();
  for (const row of existingRows || []) {
    if (row.github_name) {
      existingByLower.set(row.github_name.toLowerCase(), row);
    }
  }

  // Detect primary key format of startup_orgs.id (integer/bigint, uuid, or text slug)
  const sampleId = (existingRows || []).find((r) => r.id !== null && r.id !== undefined)?.id;
  const isNumericId =
    typeof sampleId === 'number' ||
    (typeof sampleId === 'string' && /^\d+$/.test(sampleId));
  const isUuidId =
    typeof sampleId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sampleId);

  let nextNumericId = isNumericId
    ? Math.max(0, ...(existingRows || []).map((r) => Number(r.id) || 0)) + 1
    : 1;
  const usedIds = new Set((existingRows || []).map((r) => String(r.id)));

  const allocateOrgId = (githubName) => {
    if (isNumericId) {
      while (usedIds.has(String(nextNumericId))) {
        nextNumericId += 1;
      }
      const allocated = typeof sampleId === 'string' ? String(nextNumericId) : nextNumericId;
      usedIds.add(String(nextNumericId));
      nextNumericId += 1;
      return allocated;
    }
    if (isUuidId || sampleId === undefined) {
      const uuid = crypto.randomUUID();
      usedIds.add(uuid);
      return uuid;
    }
    const hasOrgPrefix = typeof sampleId === 'string' && sampleId.startsWith('org-');
    let candidate = hasOrgPrefix
      ? `org-${githubName.toLowerCase()}`
      : githubName.toLowerCase();
    if (usedIds.has(candidate)) {
      candidate = `${candidate}-${Date.now().toString().slice(-4)}`;
    }
    usedIds.add(candidate);
    return candidate;
  };

  console.log(
    `Found ${existingByLower.size} existing organizations in startup_orgs (id type: ${
      isNumericId ? 'numeric' : isUuidId ? 'uuid' : typeof sampleId
    }).`
  );

  let curatedInserted = 0;
  let discoveredInserted = 0;
  let starsRefreshed = 0;

  // 1. Ensure all curated startups exist in startup_orgs
  for (const seed of CURATED_STARTUPS) {
    const key = seed.github_name.toLowerCase();
    if (existingByLower.has(key)) continue;

    let liveStars = null;
    let displayName = seed.display_name;
    let description = seed.description;
    let website = seed.website;
    let country = seed.country;
    let foundedYear = seed.founded_year;

    try {
      const orgData = await ghFetch(`/orgs/${encodeURIComponent(seed.github_name)}`);
      liveStars = await fetchOrgTotalStars(seed.github_name);
      displayName = orgData.name?.trim() || displayName;
      description = orgData.description?.trim() || description;
      website = normalizeWebsite(orgData.blog) || website;
      country = normalizeCountry(orgData.location) || country;
      if (orgData.created_at) {
        const yr = new Date(orgData.created_at).getFullYear();
        if (yr >= 2010 && yr <= new Date().getFullYear()) {
          foundedYear = yr;
        }
      }
      await sleep(200);
    } catch (err) {
      console.warn(`GitHub lookup fallback for ${seed.github_name}: ${err.message}`);
    }

    const payload = {
      id: allocateOrgId(seed.github_name),
      github_name: seed.github_name,
      display_name: displayName,
      description,
      github_url: `https://github.com/${seed.github_name}`,
      website,
      category: seed.category,
      stars: liveStars,
      country,
      founded_year: foundedYear,
      is_active: true,
      is_startup: true,
      stars_synced_at: liveStars != null ? new Date().toISOString() : null,
    };

    const { error: insertErr } = await supabase.from('startup_orgs').insert(payload);
    if (insertErr) {
      console.warn(`Could not insert curated org ${seed.github_name}: ${insertErr.message}`);
    } else {
      existingByLower.set(key, payload);
      curatedInserted += 1;
      console.log(`[+ Curated] Added ${seed.github_name} (${seed.category})`);
    }
  }

  // 2. Discover new modern OSS startup orgs from GitHub Search API
  if (MAX_DISCOVER > 0) {
    const candidateReposByOrg = new Map();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    for (const item of DISCOVERY_QUERIES) {
      if (candidateReposByOrg.size >= MAX_DISCOVER * 4) break;
      try {
        const fullQuery = `${item.q} pushed:>=${ninetyDaysAgo}`;
        const searchRes = await ghFetch(
          `/search/repositories?q=${encodeURIComponent(fullQuery)}&sort=updated&order=desc&per_page=25`
        );
        for (const repo of searchRes.items || []) {
          const login = repo?.owner?.login;
          if (!login || repo?.owner?.type !== 'Organization') continue;
          const lower = login.toLowerCase();
          if (existingByLower.has(lower) || EXCLUDED_ORG_LOGINS.has(lower)) continue;
          if (/awesome|tutorial|course|university|labs-archive|bootcamp|guide/i.test(login)) {
            continue;
          }
          if (!candidateReposByOrg.has(lower)) {
            candidateReposByOrg.set(lower, { repo, fallbackCategory: item.fallbackCategory });
          }
        }
        await sleep(450);
      } catch (err) {
        console.warn(`Discovery search warning (${item.fallbackCategory}): ${err.message}`);
      }
    }

    for (const [lower, { repo, fallbackCategory }] of candidateReposByOrg.entries()) {
      if (discoveredInserted >= MAX_DISCOVER) break;
      const orgLogin = repo.owner.login;

      try {
        const orgData = await ghFetch(`/orgs/${encodeURIComponent(orgLogin)}`);
        const createdYear = orgData.created_at
          ? new Date(orgData.created_at).getFullYear()
          : null;

        // Focus on modern startup organizations founded 2018+ with an external company website
        const website = normalizeWebsite(orgData.blog) || normalizeWebsite(repo.homepage);
        if (!website) continue;
        if (createdYear && createdYear < 2018) continue;
        if ((orgData.public_repos || 0) < 2) continue;

        const description = (orgData.description || repo.description || '').trim();
        if (description.length < 20) continue;

        const totalStars = await fetchOrgTotalStars(orgLogin);
        if (totalStars < 300) continue;

        const category = classifyCategory(
          `${orgData.name || ''} ${description}`,
          repo.topics || [],
          fallbackCategory
        );

        const newOrg = {
          id: allocateOrgId(orgLogin),
          github_name: orgLogin,
          display_name: (orgData.name || orgLogin).trim(),
          description: description.slice(0, 280),
          github_url: `https://github.com/${orgLogin}`,
          website,
          category,
          stars: totalStars,
          country: normalizeCountry(orgData.location),
          founded_year: createdYear,
          is_active: true,
          is_startup: true,
          stars_synced_at: new Date().toISOString(),
        };

        const { error: discInsertErr } = await supabase.from('startup_orgs').insert(newOrg);
        if (!discInsertErr) {
          existingByLower.set(lower, newOrg);
          discoveredInserted += 1;
          console.log(
            `[+ Discovered] ${orgLogin} (${category}, ${totalStars.toLocaleString()} stars, Est. ${createdYear})`
          );
        }
        await sleep(300);
      } catch (err) {
        console.warn(`Skipping candidate ${orgLogin}: ${err.message}`);
      }
    }
  }

  // 3. Refresh star counts for existing rows older than 7 days (or never synced)
  const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const staleRows = (existingRows || [])
    .filter((row) => {
      if (!row.github_name) return false;
      if (!row.stars_synced_at) return true;
      return new Date(row.stars_synced_at).getTime() < sevenDaysAgoMs;
    })
    .slice(0, MAX_STAR_REFRESH);

  for (const row of staleRows) {
    try {
      const freshStars = await fetchOrgTotalStars(row.github_name);
      if (freshStars > 0) {
        const { error: updateErr } = await supabase
          .from('startup_orgs')
          .update({
            stars: freshStars,
            stars_synced_at: new Date().toISOString(),
          })
          .eq('id', row.id);

        if (!updateErr) {
          starsRefreshed += 1;
        }
      }
      await sleep(250);
    } catch (err) {
      console.warn(`Could not refresh stars for ${row.github_name}: ${err.message}`);
    }
  }

  console.log(
    `Sync complete — Curated added: ${curatedInserted}, Newly discovered: ${discoveredInserted}, Stars refreshed: ${starsRefreshed}.`
  );
}

run().catch((err) => {
  console.error('Fatal error in sync-startup-orgs:', err);
  process.exit(1);
});
