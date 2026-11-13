/**
 * Natural-Language Issue Search Parser & Curated Intent Presets
 * Pure ES module compatible with Vite/browser runtime and Node.js test runner.
 */

export const EXPLORE_PRESETS = [
  {
    id: "docs",
    label: "Docs",
    description: "README updates, typos, guides, and examples",
    labels: ["good first issue", "documentation"],
    keywords: "documentation OR readme OR typo",
    sort: "best",
  },
  {
    id: "tests",
    label: "Tests",
    description: "Unit tests, E2E specs, and coverage improvements",
    labels: ["good first issue", "help wanted"],
    keywords: "test OR spec OR coverage",
    sort: "best",
  },
  {
    id: "ui",
    label: "UI / CSS",
    description: "Styling fixes, responsive layout, and accessibility",
    labels: ["good first issue", "help wanted"],
    keywords: "css OR ui OR layout OR accessibility OR aria",
    sort: "best",
  },
  {
    id: "bug",
    label: "Bug fix",
    description: "Reproducible defects ready for focused patches",
    labels: ["bug", "good first issue"],
    keywords: "",
    sort: "best",
  },
  {
    id: "quick",
    label: "Under 2 hours",
    description: "Small scoped cleanups, typos, and starter fixes",
    labels: ["good first issue", "beginner friendly"],
    keywords: "typo OR small OR cleanup OR refactor",
    sort: "best",
  },
  {
    id: "first_pr",
    label: "First PR welcome",
    description: "Healthy active repos friendly to first-time contributors",
    labels: ["good first issue", "beginner friendly"],
    keywords: "",
    sort: "health",
    minStars: "200",
  },
];

const LANGUAGE_PATTERNS = [
  { canonical: "typescript", patterns: [/\btypescript\b/i, /\bts\b/i, /\btsx\b/i] },
  { canonical: "javascript", patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  { canonical: "python", patterns: [/\bpython\b/i, /\bpy\b/i, /\bdjango\b/i, /\bfastapi\b/i, /\bflask\b/i] },
  { canonical: "go", patterns: [/\bgolang\b/i, /\bin\s+go\b/i, /\bgo\s+(?:issue|bug|docs|test|cli|api)\b/i] },
  { canonical: "rust", patterns: [/\brust\b/i, /\bcargo\b/i, /\btokio\b/i] },
  { canonical: "java", patterns: [/\bjava\b/i, /\bspring\b/i] },
  { canonical: "c++", patterns: [/(?:^|\s)c\+\+(?:\s|$|[,.])/i, /\bcpp\b/i] },
  { canonical: "c#", patterns: [/(?:^|\s)c#(?:\s|$|[,.])/i, /\bcsharp\b/i, /\bdotnet\b/i] },
  { canonical: "php", patterns: [/\bphp\b/i, /\blaravel\b/i] },
  { canonical: "swift", patterns: [/\bswift\b/i, /\bswiftui\b/i] },
  { canonical: "ruby", patterns: [/\bruby\b/i, /\brails\b/i] },
  { canonical: "kotlin", patterns: [/\bkotlin\b/i] },
  { canonical: "dart", patterns: [/\bdart\b/i, /\bflutter\b/i] },
];

const TOPIC_KEYWORDS = [
  "react",
  "nextjs",
  "next.js",
  "vue",
  "svelte",
  "angular",
  "tailwind",
  "docker",
  "kubernetes",
  "graphql",
  "postgres",
  "supabase",
  "prisma",
  "vite",
  "cli",
  "api",
  "dark mode",
  "a11y",
  "accessibility",
  "modal",
  "auth",
  "performance",
  "markdown",
];

const STOP_WORDS = new Set([
  "i", "im", "i'm", "want", "to", "find", "me", "a", "an", "the", "some", "any",
  "good", "first", "issue", "issues", "ticket", "tickets", "task", "tasks",
  "work", "on", "in", "for", "with", "about", "from", "of", "and", "or",
  "looking", "help", "fix", "fixing", "small", "quick", "easy", "simple",
  "beginner", "friendly", "starter", "stars", "star", "least", "at", "more",
  "than", "over", "under", "hours", "hour", "repo", "repos", "repository",
  "repositories", "project", "projects", "please", "can", "you", "show",
  "fast", "active", "responsive", "maintainers", "healthy", "popular",
]);

/**
 * Checks whether user text reads like a natural-language intent sentence rather than a raw keyword search.
 */
export function looksLikeNaturalLanguage(input) {
  const clean = String(input || "").trim();
  if (!clean) return false;
  if (/\b(i want|find me|looking for|work on|under \d+|with \d+|>\s*\d+\s*stars|\bdocs?\b.+\bin\b|\btests?\b.+\bin\b|\bbugs?\b.+\bin\b)\b/i.test(clean)) {
    return true;
  }
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  return wordCount >= 4;
}

/**
 * Deterministically converts a natural-language request into structured Explore filters.
 */
export function parseNaturalLanguageQuery(input, currentFilters = {}) {
  const raw = String(input || "").trim();
  if (!raw) {
    return {
      applied: false,
      filters: { ...currentFilters },
      matchedTokens: [],
      summary: "",
    };
  }

  let working = raw;
  const labels = new Set(["good first issue"]);
  let language = "";
  let minStars = "";
  let sort = "";
  let presetId = null;
  const keywordTerms = new Set();
  const matchedSummary = [];

  // 1. Detect star constraints e.g. ">500 stars", "1000+ stars", "at least 2k stars", "popular"
  const starMatch = working.match(/(?:>|at\s+least|min(?:imum)?|over)?\s*(\d+(?:\.\d+)?)\s*(k)?\+?\s*stars?/i);
  if (starMatch) {
    let val = parseFloat(starMatch[1]);
    if (starMatch[2]) val *= 1000;
    const rounded = Math.max(0, Math.min(10000, Math.round(val / 100) * 100));
    minStars = String(rounded);
    matchedSummary.push(`${rounded.toLocaleString()}+ stars`);
    working = working.replace(starMatch[0], " ");
  } else if (/\b(popular|well[- ]known|major)\b/i.test(working)) {
    minStars = "500";
    matchedSummary.push("500+ stars");
  }

  // 2. Detect language
  for (const entry of LANGUAGE_PATTERNS) {
    if (entry.patterns.some((re) => re.test(working))) {
      language = entry.canonical;
      matchedSummary.push(entry.canonical);
      for (const re of entry.patterns) {
        if (!/django|fastapi|flask|spring|laravel|flutter|tokio|rails/.test(re.source)) {
          working = working.replace(re, " ");
        }
      }
      break;
    }
  }

  // 3. Detect task intents -> labels, keywords, presets
  if (/\b(docs?|documentation|readme|typo|typos|guide|docstring|jsdoc)\b/i.test(working)) {
    labels.add("documentation");
    keywordTerms.add("documentation");
    presetId = presetId || "docs";
    matchedSummary.push("Docs");
  }
  if (/\b(tests?|testing|unit test|e2e|coverage|vitest|jest|pytest|spec)\b/i.test(working)) {
    labels.add("help wanted");
    keywordTerms.add("test");
    presetId = presetId || "tests";
    matchedSummary.push("Tests");
  }
  if (/\b(ui|ux|css|styling|style|layout|responsive|accessibility|a11y|dark mode|frontend)\b/i.test(working)) {
    labels.add("help wanted");
    keywordTerms.add("ui");
    presetId = presetId || "ui";
    matchedSummary.push("UI");
  }
  if (/\b(bug|bugs|crash|broken|error|regression|exception)\b/i.test(working)) {
    labels.add("bug");
    presetId = presetId || "bug";
    matchedSummary.push("Bug fix");
  }
  if (/\b(beginner|starter|first pr|first-time|newcomer)\b/i.test(working)) {
    labels.add("beginner friendly");
  }
  if (/\b(small|quick|under 2|short|tiny|simple|easy)\b/i.test(working)) {
    sort = "best";
    presetId = presetId || "quick";
    matchedSummary.push("Quick win");
  }
  if (/\b(active|healthy|responsive|fast|maintained)\b/i.test(working)) {
    sort = "health";
    matchedSummary.push("Healthy repos");
  }

  // 4. Preserve known framework/topic keywords cleanly
  const lowerRaw = raw.toLowerCase();
  for (const topic of TOPIC_KEYWORDS) {
    if (lowerRaw.includes(topic)) {
      keywordTerms.add(topic);
      if (!matchedSummary.includes(topic)) matchedSummary.push(topic);
    }
  }

  // 5. Keep specific leftover nouns/identifiers not in STOP_WORDS
  const leftover = working
    .replace(/[^\w\s./+-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t.toLowerCase()));

  for (const token of leftover.slice(0, 3)) {
    if (!keywordTerms.has(token.toLowerCase())) {
      keywordTerms.add(token);
    }
  }

  const finalKeywords = Array.from(keywordTerms).slice(0, 4).join(" ");
  const finalLabels = Array.from(labels);
  const finalSort = sort || currentFilters.sort || "best";

  return {
    applied: true,
    presetId,
    filters: {
      ...currentFilters,
      language: language || currentFilters.language || "",
      labels: finalLabels,
      keywords: finalKeywords,
      minStars: minStars || currentFilters.minStars || "0",
      sort: finalSort,
    },
    matchedTokens: matchedSummary,
    summary: matchedSummary.slice(0, 4).join(" · ") || "Structured intent query",
  };
}

