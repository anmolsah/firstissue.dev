import test from "node:test";
import assert from "node:assert/strict";
import {
  computeStackFit,
  scoreSmartMatchCandidate,
  rankCandidatesForUser,
  buildDeterministicMatchResults,
} from "../smartMatchRanker.js";

const FIXED_NOW = new Date("2026-11-13T12:00:00Z").getTime();

const SAMPLE_PROFILE = {
  username: "alice",
  techStack: ["React", "Tailwind CSS"],
  detectedFrameworks: ["Next.js", "Vitest"],
  topLanguages: [
    { language: "TypeScript", repoCount: 12 },
    { language: "Python", repoCount: 4 },
  ],
  topics: ["frontend", "ui"],
  experienceLevel: "beginner",
};

test("computeStackFit matches user declared stack, frameworks, and aliases cleanly", () => {
  const reactIssue = {
    id: 1,
    repo: "acme/dashboard",
    title: "Fix Tailwind responsive button spacing in React modal",
    labels: ["good first issue", "typescript"],
    body: "Update the TSX button component.",
  };
  const rustIssue = {
    id: 2,
    repo: "rust-lang/tool",
    title: "Optimize Tokio async TCP socket buffer allocation",
    labels: ["help wanted"],
    body: "Refactor Cargo workspace crate.",
  };

  const reactFit = computeStackFit(reactIssue, SAMPLE_PROFILE);
  const rustFit = computeStackFit(rustIssue, SAMPLE_PROFILE);

  assert.ok(reactFit.score >= 25, `Expected high stack score, got ${reactFit.score}`);
  assert.ok(reactFit.matchedSkills.includes("React"));
  assert.ok(reactFit.matchedSkills.includes("Tailwind CSS"));
  assert.equal(rustFit.score, 0);
});

test("scoreSmartMatchCandidate integrates stackFit, repoHealth, clarity, and claimRisk", () => {
  const greatCandidate = {
    id: 10,
    repo: "vercel/example",
    title: "Add unit test coverage for Next.js React route parser",
    body: "Update `src/router.ts` and `src/router.test.ts`.\n- [ ] Handle trailing slashes\n- [ ] Verify error message",
    labels: ["good first issue"],
    comments: 0,
    created_at: "2026-11-11T10:00:00Z",
    updated_at: "2026-11-12T10:00:00Z",
    author_association: "MEMBER",
    from_trusted_repo: true,
    repo_stars: 5400,
    repo_health: {
      health_score: 90,
      health_tier: "healthy",
      health_summary: "~12h PR merge · 82% PRs merged · CONTRIBUTING.md",
      has_contributing: true,
    },
  };

  const weakCandidate = {
    id: 11,
    repo: "random/legacy",
    title: "Bug in C++ kernel driver",
    body: "Broken",
    labels: [],
    comments: 14,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-02T10:00:00Z",
    author_association: "NONE",
    repo_stars: 4,
    repo_health: {
      health_score: 25,
      health_tier: "slow",
      health_summary: "Active 200d ago",
    },
  };

  const great = scoreSmartMatchCandidate(greatCandidate, SAMPLE_PROFILE, FIXED_NOW);
  const weak = scoreSmartMatchCandidate(weakCandidate, SAMPLE_PROFILE, FIXED_NOW);

  assert.ok(great.preScore >= 80, `Expected preScore >= 80, got ${great.preScore}`);
  assert.ok(weak.preScore < 35, `Expected weak preScore < 35, got ${weak.preScore}`);
  assert.equal(great.taskType, "Tests");
  assert.ok(great.preReasons.length >= 2);
});

test("rankCandidatesForUser enforces repo diversity penalties and caps top N results", () => {
  const candidates = [];
  for (let i = 1; i <= 6; i++) {
    candidates.push({
      id: i,
      repo: "same/repo",
      title: `React + TypeScript issue #${i}`,
      body: "Fix styling inside `src/App.tsx`.\n- [ ] Update layout",
      labels: ["good first issue"],
      comments: 0,
      created_at: "2026-11-12T10:00:00Z",
      repo_stars: 2000,
      repo_health: { health_score: 85, health_tier: "healthy" },
    });
  }
  candidates.push({
    id: 99,
    repo: "other/repo",
    title: "React + TypeScript dark mode fix",
    body: "Fix theme token in `src/theme.ts`.\n- [ ] Update contrast",
    labels: ["good first issue"],
    comments: 0,
    created_at: "2026-11-12T10:00:00Z",
    repo_stars: 1800,
    repo_health: { health_score: 85, health_tier: "healthy" },
  });

  const ranked = rankCandidatesForUser(candidates, SAMPLE_PROFILE, {
    maxCandidates: 20,
    maxPerRepo: 3,
    now: FIXED_NOW,
  });

  const sameRepoCount = ranked.filter((item) => item.repo === "same/repo").length;
  assert.equal(sameRepoCount, 3);
  // 2nd entry in same/repo gets -8 penalty, allowing other/repo to rank above the 2nd issue from same/repo
  assert.ok(ranked.findIndex((r) => r.id === 99) < 2);

  const fallbackPreview = buildDeterministicMatchResults(ranked, 2);
  assert.equal(fallbackPreview.length, 2);
  assert.equal(fallbackPreview[0].isAIRanked, false);
  assert.ok(fallbackPreview[0].matchScore > 0);
});

