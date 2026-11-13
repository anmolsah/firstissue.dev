/**
 * Smart Match Pre-AI Candidate Ranker
 * Computes deterministic personalized ranking:
 *   score = stackFit + repoHealth + issueClarity + freshness + claimRisk + experienceFit + repoDiversity
 * Pure ES module compatible with Vite/browser runtime and Node.js test runner.
 */

import {
  scoreIssueReadiness,
  extractCleanSummary,
  getIssueLabelNames,
  daysSince,
} from "./issueQualityFilter.js";
import { scoreRepoHealth } from "./repoHealth.js";

const SKILL_ALIASES = {
  javascript: ["javascript", "js", "ecmascript", "es6"],
  typescript: ["typescript", "ts", "tsx"],
  python: ["python", "py"],
  "react": ["react", "reactjs", "react.js", "jsx", "tsx"],
  "next.js": ["nextjs", "next.js", "next"],
  "tailwind css": ["tailwind", "tailwindcss"],
  "node.js": ["nodejs", "node.js", "node"],
  vue: ["vue", "vuejs", "vue.js"],
  svelte: ["svelte", "sveltekit"],
  "c++": ["c++", "cpp"],
  "c#": ["c#", "csharp", ".net", "dotnet"],
  go: ["golang", "go"],
  rust: ["rust", "cargo", "crates"],
  postgresql: ["postgres", "postgresql", "sql"],
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSkillEntries(userProfile = {}) {
  const entryMap = new Map();

  const register = (rawName, weight, kind) => {
    const label = String(rawName || "").trim();
    if (!label) return;
    const key = label.toLowerCase();
    const existing = entryMap.get(key);
    if (!existing || existing.weight < weight) {
      const aliases = SKILL_ALIASES[key] || [key];
      entryMap.set(key, {
        label,
        key,
        weight,
        kind,
        aliases,
      });
    }
  };

  for (const tech of userProfile.techStack || []) {
    register(tech, 14, "stack");
  }
  for (const fw of userProfile.detectedFrameworks || []) {
    register(fw, 12, "framework");
  }

  const langs = Array.isArray(userProfile.topLanguages) ? userProfile.topLanguages : [];
  langs.slice(0, 4).forEach((entry, index) => {
    const langName = typeof entry === "string" ? entry : entry?.language;
    const langWeight = Math.max(5, 10 - index * 2);
    register(langName, langWeight, "language");
  });

  for (const topic of (userProfile.topics || []).slice(0, 10)) {
    register(topic, 5, "topic");
  }

  return Array.from(entryMap.values());
}

function textMatchesSkill(haystack, aliases) {
  for (const alias of aliases) {
    const clean = alias.toLowerCase();
    if (clean === "c++" || clean === "c#") {
      if (haystack.includes(clean)) return true;
      continue;
    }
    const regex = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(clean)}(?:$|[^a-z0-9])`, "i");
    if (regex.test(haystack)) return true;
  }
  return false;
}

/**
 * Scores how closely an issue aligns with the developer's languages, frameworks, and topics (0-35).
 */
export function computeStackFit(issue, userProfile = {}) {
  const entries = buildSkillEntries(userProfile);
  if (entries.length === 0) return { score: 0, matchedSkills: [] };

  const labels = getIssueLabelNames(issue).join(" ");
  const titleRepo = `${issue?.title || ""} ${issue?.repo || ""} ${labels}`.toLowerCase();
  const body = extractCleanSummary(issue?.body || "", 400).toLowerCase();

  let score = 0;
  const matchedSkills = [];

  for (const skill of entries) {
    const inHeader = textMatchesSkill(titleRepo, skill.aliases);
    const inBody = !inHeader && textMatchesSkill(body, skill.aliases);

    if (inHeader) {
      score += skill.weight;
      matchedSkills.push(skill.label);
    } else if (inBody) {
      score += Math.round(skill.weight * 0.7);
      matchedSkills.push(skill.label);
    }
  }

  return {
    score: Math.min(35, Math.round(score)),
    matchedSkills: matchedSkills.slice(0, 4),
  };
}

/**
 * Computes deterministic pre-AI suitability score (0-99) and breakdown for one candidate issue.
 */
export function scoreSmartMatchCandidate(issue, userProfile = {}, now = Date.now()) {
  const readiness = issue._readiness || scoreIssueReadiness(issue, now);
  const stack = computeStackFit(issue, userProfile);

  // 1. Repo Health (0-22)
  let repoHealthPts = 0;
  if (issue.repo_health && typeof issue.repo_health.health_score === "number") {
    repoHealthPts = Math.round((issue.repo_health.health_score / 100) * 22);
  } else {
    const derived = scoreRepoHealth(
      {
        stars: issue.repo_stars ?? 0,
        last_pushed_at: issue.repo_pushed_at ?? null,
        is_archived: Boolean(issue.repo_archived),
      },
      now
    );
    repoHealthPts = Math.round((derived.health_score / 100) * 18);
  }

  // 2. Issue Clarity (0-18) — scaled from readiness structural score
  const clarityPts = Math.round(((readiness.score - 5) / 94) * 18);

  // 3. Freshness (0-10, or -5 if stale)
  const createdDays =
    typeof issue.created_days_ago === "number"
      ? issue.created_days_ago
      : daysSince(issue.created_at, now);
  const updatedDays = issue.updated_at ? daysSince(issue.updated_at, now) : createdDays;
  const freshestDays = Math.min(createdDays, updatedDays);

  let freshnessPts = 0;
  if (freshestDays <= 7) freshnessPts = 10;
  else if (freshestDays <= 21) freshnessPts = 7;
  else if (freshestDays <= 45) freshnessPts = 4;
  else if (createdDays > 120) freshnessPts = -5;

  // 4. Claim Risk (-15 to +10)
  const comments = Number(issue.comments ?? 0);
  let claimRiskPts = 0;
  if (comments === 0) claimRiskPts = 10;
  else if (comments <= 2) claimRiskPts = 6;
  else if (comments <= 5) claimRiskPts = 2;
  else if (comments >= 8) claimRiskPts = -15;

  // 5. Experience Alignment (-4 to +5)
  const labels = getIssueLabelNames(issue);
  const isBeginnerLabeled = labels.some(
    (l) => l.includes("good first") || l.includes("beginner") || l.includes("easy") || l.includes("starter")
  );
  const experience = userProfile?.experienceLevel || "beginner";
  let experiencePts = 0;

  if (experience === "beginner") {
    if (isBeginnerLabeled || readiness.taskType === "Docs" || readiness.taskType === "Tests") {
      experiencePts += 5;
    }
  } else if (experience === "advanced") {
    if (readiness.taskType === "Bug fix" || readiness.taskType === "Feature" || (issue.repo_stars ?? 0) >= 500) {
      experiencePts += 4;
    }
  } else {
    experiencePts += 2;
  }

  // Bonus for vetted trusted repos
  const trustedBonus = issue.from_trusted_repo ? 3 : 0;

  const rawTotal =
    stack.score + repoHealthPts + clarityPts + freshnessPts + claimRiskPts + experiencePts + trustedBonus;
  const clampedBase = Math.max(5, Math.min(99, Math.round(rawTotal)));

  const reasons = [];
  if (stack.matchedSkills.length > 0) {
    reasons.push(`Matches ${stack.matchedSkills.slice(0, 3).join(", ")}`);
  }
  if (issue.repo_health?.health_summary) {
    reasons.push(issue.repo_health.health_summary);
  } else if (typeof issue.repo_stars === "number" && issue.repo_stars >= 100) {
    reasons.push(`${issue.repo_stars.toLocaleString()} GitHub stars`);
  }
  if (comments === 0) {
    reasons.push("Unclaimed (0 comments)");
  } else if (comments >= 8) {
    reasons.push("High thread activity — verify if still open");
  }
  if (readiness.signals?.some((s) => s.key === "file_paths" || s.key === "clear_scope")) {
    reasons.push("Clear implementation scope");
  }

  return {
    preScore: clampedBase,
    preMatchScore: Number((clampedBase / 100).toFixed(2)),
    matchedSkills: stack.matchedSkills,
    cleanSummary: readiness.summary || extractCleanSummary(issue.body || "", 260),
    taskType: readiness.taskType,
    _readiness: readiness,
    preScoreBreakdown: {
      stackFit: stack.score,
      repoHealth: repoHealthPts,
      issueClarity: clarityPts,
      freshness: freshnessPts,
      claimRisk: claimRiskPts,
      experienceFit: experiencePts,
      trustedBonus,
    },
    preReasons: reasons.slice(0, 3),
  };
}

/**
 * Ranks Smart Match candidate pool per user, applying repo diversity penalties
 * so one active repository never dominates the top 20 queue.
 */
export function rankCandidatesForUser(candidates, userProfile = {}, options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];
  const { maxCandidates = 20, maxPerRepo = 3, now = Date.now() } = options;

  const scored = candidates
    .filter((issue) => issue && !issue.is_assigned && !issue.repo_archived)
    .map((issue) => ({
      ...issue,
      ...scoreSmartMatchCandidate(issue, userProfile, now),
    }))
    .sort((a, b) => b.preScore - a.preScore);

  const repoSeenCounts = {};
  const diversified = [];

  for (const item of scored) {
    const repoKey = item.repo || item.repository_url || String(item.id);
    const seen = repoSeenCounts[repoKey] || 0;
    if (seen >= maxPerRepo) continue;

    repoSeenCounts[repoKey] = seen + 1;
    const diversityPenalty = seen === 0 ? 0 : seen === 1 ? 8 : 18;
    const adjustedScore = Math.max(5, Math.min(99, item.preScore - diversityPenalty));

    diversified.push({
      ...item,
      preScore: adjustedScore,
      preMatchScore: Number((adjustedScore / 100).toFixed(2)),
      preScoreBreakdown: {
        ...item.preScoreBreakdown,
        diversityPenalty: -diversityPenalty,
      },
    });
  }

  return diversified
    .sort((a, b) => {
      if (b.preScore !== a.preScore) return b.preScore - a.preScore;
      return (b.repo_stars ?? 0) - (a.repo_stars ?? 0);
    })
    .slice(0, maxCandidates);
}

/**
 * Produces fallback UI-ready match results purely from deterministic ranking
 * when the LLM ranking endpoint is temporarily unavailable.
 */
export function buildDeterministicMatchResults(rankedCandidates, limit = null) {
  const sliced =
    typeof limit === "number" && limit > 0
      ? rankedCandidates.slice(0, limit)
      : rankedCandidates;

  return sliced.map((issue) => ({
    ...issue,
    matchScore: issue.preMatchScore,
    matchReason:
      issue.preReasons?.length > 0
        ? issue.preReasons.join(" · ")
        : "Strong match for your language profile and repository activity",
    isAIRanked: false,
  }));
}

