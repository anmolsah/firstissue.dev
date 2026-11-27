/**
 * Pure, runtime-agnostic helpers for FirstMate's hybrid RAG pipeline.
 * Used by `supabase/functions/kb-query/index.ts` and tested directly with Node's test runner.
 */

export interface HybridChunk {
  id?: string;
  source?: string;
  title?: string;
  path?: string;
  content?: string;
  similarity?: number;
  fts_rank?: number;
  hybrid_score?: number;
}

export interface CitationSource {
  source: string;
  title: string;
  path: string;
  similarity: number;
  fts_rank?: number;
}

export interface LearnedSolutionItem {
  id?: string;
  query_text?: string;
  assistant_response?: string;
  user_correction?: string | null;
  helpful_count?: number;
  is_verified?: boolean;
  similarity?: number;
  fts_rank?: number;
  score?: number;
}

export interface StartupOrgMatch {
  id: string | number;
  github_name: string;
  display_name: string;
  description: string;
  github_url: string;
  website: string;
  category: string;
  stars: number | null;
  country: string | null;
  founded_year: number | null;
}

export interface StartupSearchParams {
  preferredCategories: string[];
  expandedKeywords: string[];
  countryFilter: string[];
  wantsNew: boolean;
  rawTokens: string[];
}

export const STARTUP_INTENT_REGEX =
  /\b(startup|startups|startup org|startup orgs|new org|new orgs|early[- ]stage|yc\b|y combinator|fast[- ]growing|emerging org|suggest.*startup|recommend.*startup|contribute.*startup|companies to contribute|tech stack.*contribute|contribute.*tech stack)\b/i;

export const STARTUP_FOLLOWUP_REGEX =
  /\b(more startups|other startups|newer ones|any in (rust|python|go|typescript|javascript|ai|fintech|security|cloud|data|india|us|uk|europe))\b/i;

export const TECH_CATEGORY_HINTS: Array<{
  pattern: RegExp;
  categories: string[];
  keywords: string[];
}> = [
  {
    pattern: /\b(ai|ml|llm|agent|agents|mcp|rag|langchain|openai|pytorch|genai|nlp|embedding|inference|vision)\b/i,
    categories: ["AI/ML"],
    keywords: ["ai", "llm", "agent", "mcp", "model", "inference", "embedding", "vector", "rag", "python"],
  },
  {
    pattern: /\b(typescript|javascript|react|next\.?js|node\.?js|frontend|vue|svelte|tailwind|web|email|sdk|cli|editor|linter|devtools)\b/i,
    categories: ["DevTools", "AI/ML", "Infrastructure"],
    keywords: ["typescript", "react", "web", "editor", "cli", "sdk", "email", "linter", "formatter", "developer", "framework"],
  },
  {
    pattern: /\b(python|fastapi|django|pydantic|ruff|uv|data science)\b/i,
    categories: ["AI/ML", "DevTools", "Data"],
    keywords: ["python", "pydantic", "ruff", "uv", "agent", "llm", "data", "ai"],
  },
  {
    pattern: /\b(rust|cargo|systems|compiler|wasm)\b/i,
    categories: ["DevTools", "Data", "Infrastructure", "FinTech"],
    keywords: ["rust", "vector", "editor", "linter", "payment", "fast", "binary", "engine"],
  },
  {
    pattern: /\b(go|golang|docker|kubernetes|k8s|ci\/cd|devops|queue|workflow|infra|infrastructure|distributed|backend)\b/i,
    categories: ["Infrastructure", "Cloud"],
    keywords: ["go", "workflow", "queue", "container", "ci/cd", "backend", "distributed", "cloud", "infrastructure"],
  },
  {
    pattern: /\b(postgres|postgresql|sql|sqlite|database|db|vector|analytics|warehouse|etl|duckdb|data)\b/i,
    categories: ["Data"],
    keywords: ["postgres", "sql", "sqlite", "database", "vector", "embedding", "storage", "analytics"],
  },
  {
    pattern: /\b(security|auth|oauth|secret|secrets|kms|iam|cybersecurity|infosec|zero[- ]trust)\b/i,
    categories: ["Security"],
    keywords: ["security", "secret", "auth", "authorization", "kms", "pki", "access"],
  },
  {
    pattern: /\b(cloud|serverless|edge|redis|self[- ]hosted|hosting|paas|deploy)\b/i,
    categories: ["Cloud", "Infrastructure"],
    keywords: ["cloud", "serverless", "edge", "redis", "self-host", "deploy", "hosting"],
  },
  {
    pattern: /\b(fintech|payment|payments|commerce|ecommerce|ledger|billing|stripe|banking)\b/i,
    categories: ["FinTech"],
    keywords: ["payment", "ledger", "commerce", "financial", "fintech", "billing"],
  },
];

const STARTUP_STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "have", "having", "want", "contribute",
  "contributing", "startup", "startups", "org", "orgs", "suggest", "recommend", "few",
  "some", "good", "best", "new", "ones", "can", "you", "please", "find", "show", "tech",
  "stack", "stacks", "open", "source", "opensource", "projects", "repos", "using", "use",
]);

const EUROPE_COUNTRIES = [
  "uk",
  "germany",
  "france",
  "sweden",
  "denmark",
  "netherlands",
  "switzerland",
  "hungary",
  "spain",
  "italy",
  "poland",
  "ireland",
  "finland",
  "norway",
  "austria",
  "belgium",
  "portugal",
  "europe",
];

export function isStartupDiscoveryQuery(
  message: string,
  history: Array<{ role?: string; content?: string }> = []
): boolean {
  if (STARTUP_INTENT_REGEX.test(message)) return true;
  if (STARTUP_FOLLOWUP_REGEX.test(message)) return true;
  const recentHistory = Array.isArray(history) ? history.slice(-3) : [];
  const hadStartupContext = recentHistory.some((h) =>
    STARTUP_INTENT_REGEX.test(String(h?.content || ""))
  );
  if (
    hadStartupContext &&
    /\b(more|another|other|suggest|recommend|filter|rust|python|typescript|go|ai|fintech|security|cloud|data|new)\b/i.test(
      message
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Extracts structured filters and expanded keywords for the Postgres
 * `search_startup_orgs` RPC (and for the JS fallback if RPC is unavailable).
 */
export function extractStartupSearchParams(message: string): StartupSearchParams {
  const lowerMsg = String(message || "").toLowerCase();
  const wantsNew =
    /\b(new|newest|recent|recently|emerging|latest|fresh|early|2023|2024|2025|2026)\b/i.test(
      lowerMsg
    );

  const preferredCategories = new Set<string>();
  const expandedKeywords = new Set<string>();

  for (const hint of TECH_CATEGORY_HINTS) {
    if (hint.pattern.test(lowerMsg)) {
      for (const cat of hint.categories) preferredCategories.add(cat);
      for (const kw of hint.keywords) expandedKeywords.add(kw);
    }
  }

  const rawTokens = lowerMsg
    .replace(/[^a-z0-9.+#/-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STARTUP_STOP_WORDS.has(t));

  for (const tok of rawTokens) {
    expandedKeywords.add(tok);
  }

  const countryMatch =
    lowerMsg.match(
      /\b(india|us|usa|uk|germany|france|canada|europe|sweden|denmark|global)\b/i
    )?.[1]?.toLowerCase() || "";

  let countryFilter: string[] = [];
  if (countryMatch === "usa" || countryMatch === "us") {
    countryFilter = ["us", "usa"];
  } else if (countryMatch === "europe") {
    countryFilter = EUROPE_COUNTRIES;
  } else if (countryMatch) {
    countryFilter = [countryMatch];
  }

  return {
    preferredCategories: Array.from(preferredCategories),
    expandedKeywords: Array.from(expandedKeywords),
    countryFilter,
    wantsNew,
    rawTokens,
  };
}

/**
 * Accepts chunks that pass either the semantic similarity threshold OR a strong
 * full-text keyword match (so exact git flags like `--force-with-lease`, `git reflog`,
 * or license names aren't dropped if vector similarity is slightly below 0.30).
 * Diversifies to at most `maxPerSource` chunks per source, capped at `maxTotal`.
 */
export function selectDiversifiedChunks(
  chunks: HybridChunk[] | null | undefined,
  options: {
    minSimilarity?: number;
    minFtsOnlyRank?: number;
    minHybridFtsRank?: number;
    minHybridSimilarity?: number;
    maxPerSource?: number;
    maxTotal?: number;
  } = {}
): HybridChunk[] {
  const {
    minSimilarity = 0.30,
    minFtsOnlyRank = 0.08,
    minHybridFtsRank = 0.03,
    minHybridSimilarity = 0.22,
    maxPerSource = 2,
    maxTotal = 6,
  } = options;

  const sourceChunkCounts: Record<string, number> = {};

  return (chunks || [])
    .filter((c) => {
      const sim = typeof c.similarity === "number" ? c.similarity : 0;
      const fts = typeof c.fts_rank === "number" ? c.fts_rank : 0;
      return (
        sim > minSimilarity ||
        fts >= minFtsOnlyRank ||
        (fts >= minHybridFtsRank && sim >= minHybridSimilarity)
      );
    })
    .filter((c) => {
      const key = c.source || c.path || "unknown";
      sourceChunkCounts[key] = (sourceChunkCounts[key] || 0) + 1;
      return sourceChunkCounts[key] <= maxPerSource;
    })
    .slice(0, maxTotal);
}

/**
 * Extracts deduplicated citation metadata for the frontend from diversified chunks.
 */
export function extractCitationSources(
  diversifiedChunks: HybridChunk[],
  options: { minSimilarity?: number; minFtsRank?: number } = {}
): CitationSource[] {
  const { minSimilarity = 0.32, minFtsRank = 0.08 } = options;
  const sources: CitationSource[] = [];
  const seenPaths = new Set<string>();

  for (const chunk of diversifiedChunks) {
    const sim = typeof chunk.similarity === "number" ? chunk.similarity : 0;
    const fts = typeof chunk.fts_rank === "number" ? chunk.fts_rank : 0;
    if ((sim > minSimilarity || fts >= minFtsRank) && chunk.path && !seenPaths.has(chunk.path)) {
      seenPaths.add(chunk.path);
      sources.push({
        source: chunk.source || "",
        title: chunk.title || "",
        path: chunk.path,
        similarity: sim,
        ...(typeof chunk.fts_rank === "number" ? { fts_rank: chunk.fts_rank } : {}),
      });
    }
  }

  return sources;
}

/**
 * Merges and deduplicates client-provided local learned context and DB-retrieved
 * semantic/FTS learned solutions, keeping up to `maxItems` distinct high-signal entries.
 */
export function mergeLearnedSolutions(
  clientLearned: LearnedSolutionItem[] | null | undefined,
  dbLearned: LearnedSolutionItem[] | null | undefined,
  maxItems = 3
): LearnedSolutionItem[] {
  const combined = [
    ...(Array.isArray(dbLearned) ? dbLearned : []),
    ...(Array.isArray(clientLearned) ? clientLearned : []),
  ];

  const deduped: LearnedSolutionItem[] = [];
  const seenKeys = new Set<string>();

  for (const item of combined) {
    if (!item) continue;
    const q = String(item.query_text || "").trim().toLowerCase().replace(/\s+/g, " ");
    const ans = String(item.user_correction || item.assistant_response || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (!q && !ans) continue;

    const key = `${q}::${ans.slice(0, 120)}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    deduped.push(item);
    if (deduped.length >= maxItems) break;
  }

  return deduped;
}

/**
 * Keyword-based fallback filter for `ai_learned_solutions` if the Postgres
 * `match_learned_solutions` RPC is not yet deployed. Avoids polluting prompts
 * with unrelated global rows.
 */
export function filterLearnedSolutionsByKeywords(
  message: string,
  candidates: LearnedSolutionItem[],
  maxItems = 3
): LearnedSolutionItem[] {
  const terms = String(message || "")
    .toLowerCase()
    .replace(/[^a-z0-9._/#+-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STARTUP_STOP_WORDS.has(t));

  if (terms.length === 0 || !Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  return candidates
    .map((item) => {
      const hay = `${item.query_text || ""} ${item.user_correction || ""} ${item.assistant_response || ""}`.toLowerCase();
      let hits = 0;
      for (const t of terms) {
        if (hay.includes(t)) hits++;
      }
      return { item, hits };
    })
    .filter((entry) => entry.hits > 0)
    .sort(
      (a, b) =>
        b.hits - a.hits ||
        (Number(b.item.helpful_count) || 0) - (Number(a.item.helpful_count) || 0)
    )
    .slice(0, maxItems)
    .map((entry) => entry.item);
}

/**
 * Formats a learned solution row into compact text suitable for OpenRouter embeddings.
 */
export function buildLearnedSolutionEmbeddingText(row: {
  query_text?: string;
  user_correction?: string | null;
  assistant_response?: string;
}): string {
  const parts: string[] = [];
  if (row.query_text) parts.push(`Question: ${String(row.query_text).trim()}`);
  if (row.user_correction && String(row.user_correction).trim()) {
    parts.push(`Correction: ${String(row.user_correction).trim()}`);
  } else if (row.assistant_response) {
    parts.push(`Answer: ${String(row.assistant_response).trim().slice(0, 800)}`);
  }
  return parts.join("\n").slice(0, 1600);
}

/**
 * Formats a startup_orgs row into compact text suitable for OpenRouter embeddings.
 */
export function buildStartupOrgEmbeddingText(org: {
  display_name?: string;
  github_name?: string;
  category?: string;
  country?: string | null;
  founded_year?: number | null;
  description?: string;
}): string {
  const parts = [
    `${org.display_name || org.github_name || ""} (@${org.github_name || ""})`,
    org.category ? `Category: ${org.category}` : "",
    org.country ? `Country: ${org.country}` : "",
    org.founded_year ? `Founded: ${org.founded_year}` : "",
    org.description ? `Description: ${org.description}` : "",
  ].filter(Boolean);
  return parts.join(" | ").slice(0, 1200);
}
