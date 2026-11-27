import test from "node:test";
import assert from "node:assert/strict";
import {
  isStartupDiscoveryQuery,
  extractStartupSearchParams,
  selectDiversifiedChunks,
  extractCitationSources,
  mergeLearnedSolutions,
  filterLearnedSolutionsByKeywords,
  buildLearnedSolutionEmbeddingText,
  buildStartupOrgEmbeddingText,
} from "../../../supabase/functions/_shared/ragHelpers.ts";

test("selectDiversifiedChunks retains strong FTS exact-flag matches even when cosine similarity is below 0.30", () => {
  const chunks = [
    {
      source: "ADVANCED_GIT_WORKFLOWS.md",
      title: "Safe Force Pushing",
      path: "docs/ADVANCED_GIT_WORKFLOWS.md",
      content: "Always prefer git push --force-with-lease over --force.",
      similarity: 0.24,
      fts_rank: 0.14, // strong FTS hit on --force-with-lease
      hybrid_score: 0.036,
    },
    {
      source: "LICENSES_AND_GOVERNANCE.md",
      title: "Apache-2.0 Patent Grant",
      path: "docs/LICENSES_AND_GOVERNANCE.md",
      content: "Apache-2.0 includes an explicit patent grant.",
      similarity: 0.25,
      fts_rank: 0.04, // moderate FTS + moderate semantic hybrid hit
      hybrid_score: 0.025,
    },
    {
      source: "noise.md",
      title: "Unrelated Low Score",
      path: "docs/noise.md",
      content: "Irrelevant text",
      similarity: 0.19,
      fts_rank: 0.01,
      hybrid_score: 0.01,
    },
    {
      source: "ADVANCED_GIT_WORKFLOWS.md",
      title: "Interactive Rebase",
      path: "docs/ADVANCED_GIT_WORKFLOWS.md",
      content: "Use git rebase -i HEAD~3",
      similarity: 0.55,
      fts_rank: 0.0,
    },
    {
      source: "ADVANCED_GIT_WORKFLOWS.md",
      title: "Third Chunk From Same Source (Should Be Capped)",
      path: "docs/ADVANCED_GIT_WORKFLOWS.md",
      content: "Use git reflog to recover commits.",
      similarity: 0.52,
      fts_rank: 0.12,
    },
  ];

  const selected = selectDiversifiedChunks(chunks);
  assert.equal(selected.length, 3);
  assert.equal(selected[0].title, "Safe Force Pushing");
  assert.equal(selected[1].title, "Apache-2.0 Patent Grant");
  assert.equal(selected[2].title, "Interactive Rebase");
});

test("extractCitationSources includes strong FTS hits and deduplicates by path", () => {
  const diversified = [
    {
      source: "ADVANCED_GIT_WORKFLOWS.md",
      title: "Safe Force Pushing",
      path: "docs/ADVANCED_GIT_WORKFLOWS.md",
      similarity: 0.26,
      fts_rank: 0.12,
    },
    {
      source: "ADVANCED_GIT_WORKFLOWS.md",
      title: "Interactive Rebase",
      path: "docs/ADVANCED_GIT_WORKFLOWS.md",
      similarity: 0.61,
      fts_rank: 0.05,
    },
    {
      source: "LICENSES_AND_GOVERNANCE.md",
      title: "GPLv3 Copyleft",
      path: "docs/LICENSES_AND_GOVERNANCE.md",
      similarity: 0.48,
      fts_rank: 0.0,
    },
  ];

  const sources = extractCitationSources(diversified);
  assert.equal(sources.length, 2);
  assert.equal(sources[0].path, "docs/ADVANCED_GIT_WORKFLOWS.md");
  assert.equal(sources[1].path, "docs/LICENSES_AND_GOVERNANCE.md");
});

test("mergeLearnedSolutions deduplicates identical client and DB learned entries and caps at 3", () => {
  const dbLearned = [
    {
      query_text: "How do I recover a deleted branch?",
      user_correction: "Use git reflog to find the commit SHA and git checkout -b branch SHA.",
      helpful_count: 5,
    },
    {
      query_text: "How to sign commits?",
      assistant_response: "Configure git config --global commit.gpgsign true.",
      helpful_count: 2,
    },
  ];
  const clientLearned = [
    {
      query_text: "how do i recover a deleted branch?",
      user_correction: "Use git reflog to find the commit SHA and git checkout -b branch SHA.",
      helpful_count: 1,
    },
    {
      query_text: "Fix DCO check failure",
      user_correction: "Run git commit --amend -s --no-edit && git push --force-with-lease",
    },
    {
      query_text: "Fourth distinct item",
      user_correction: "Should be capped beyond maxItems=3",
    },
  ];

  const merged = mergeLearnedSolutions(clientLearned, dbLearned, 3);
  assert.equal(merged.length, 3);
  assert.equal(merged[0].query_text, "How do I recover a deleted branch?");
  assert.equal(merged[1].query_text, "How to sign commits?");
  assert.equal(merged[2].query_text, "Fix DCO check failure");
});

test("filterLearnedSolutionsByKeywords filters out unrelated global rows in fallback mode", () => {
  const candidates = [
    {
      query_text: "How do I write a GSoC proposal?",
      assistant_response: "Start early and talk to mentors.",
      helpful_count: 99,
    },
    {
      query_text: "Fix git push rejected after rebase",
      user_correction: "Use git push --force-with-lease instead of --force.",
      helpful_count: 3,
    },
  ];

  const matched = filterLearnedSolutionsByKeywords(
    "My git push was rejected after interactive rebase, should I use --force-with-lease?",
    candidates
  );

  assert.equal(matched.length, 1);
  assert.equal(matched[0].query_text, "Fix git push rejected after rebase");
});

test("extractStartupSearchParams extracts categories, keywords, country aliases, and recency intent", () => {
  const params = extractStartupSearchParams(
    "Suggest some new Rust and AI startups in Europe I can contribute to"
  );

  assert.equal(params.wantsNew, true);
  assert.ok(params.preferredCategories.includes("AI/ML"));
  assert.ok(params.preferredCategories.includes("DevTools"));
  assert.ok(params.preferredCategories.includes("Data"));
  assert.ok(params.expandedKeywords.includes("rust"));
  assert.ok(params.expandedKeywords.includes("vector"));
  assert.ok(params.countryFilter.includes("germany"));
  assert.ok(params.countryFilter.includes("uk"));
  assert.equal(isStartupDiscoveryQuery("Suggest some new Rust startups"), true);
  assert.equal(isStartupDiscoveryQuery("How does git bisect work?"), false);
});

test("embedding text builders produce compact non-empty strings", () => {
  const learnedText = buildLearnedSolutionEmbeddingText({
    query_text: "How do I fix a detached HEAD?",
    user_correction: "Create a branch at HEAD with git switch -c fix-branch.",
  });
  assert.ok(learnedText.includes("Question: How do I fix a detached HEAD?"));
  assert.ok(learnedText.includes("Correction: Create a branch at HEAD"));

  const orgText = buildStartupOrgEmbeddingText({
    display_name: "Astral",
    github_name: "astral-sh",
    category: "DevTools",
    country: "US",
    founded_year: 2022,
    description: "Next-generation Python tooling behind Ruff and uv.",
  });
  assert.ok(orgText.includes("Astral (@astral-sh)"));
  assert.ok(orgText.includes("Category: DevTools"));
  assert.ok(orgText.includes("Founded: 2022"));
});
