import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  EXPLORE_PRESETS,
  looksLikeNaturalLanguage,
  parseNaturalLanguageQuery,
} from "../naturalLanguageSearch.js";
import {
  buildUserAffinityProfile,
  getIssueRepoSlug,
  scoreIssueAffinity,
  applyUserAffinity,
} from "../userAffinity.js";
import { rankCandidatesForUser } from "../smartMatchRanker.js";

describe("naturalLanguageSearch", () => {
  it("exposes curated explore intent presets", () => {
    const ids = EXPLORE_PRESETS.map((p) => p.id);
    assert.deepEqual(ids, ["docs", "tests", "ui", "bug", "quick", "first_pr"]);
    for (const preset of EXPLORE_PRESETS) {
      assert.ok(preset.label);
      assert.ok(Array.isArray(preset.labels) && preset.labels.length > 0);
      assert.ok(preset.sort);
    }
  });

  it("distinguishes natural-language sentences from short keyword queries", () => {
    assert.equal(looksLikeNaturalLanguage(""), false);
    assert.equal(looksLikeNaturalLanguage("tailwind"), false);
    assert.equal(looksLikeNaturalLanguage("react modal"), false);

    assert.equal(looksLikeNaturalLanguage("I want to fix a small React UI bug"), true);
    assert.equal(looksLikeNaturalLanguage("docs work in Rust"), true);
    assert.equal(looksLikeNaturalLanguage("tests in python >500 stars"), true);
  });

  it("parses React UI bug prompt into labels, topic keywords, and best sort", () => {
    const res = parseNaturalLanguageQuery("I want to fix a small React UI bug", {
      language: "",
      labels: ["good first issue"],
      keywords: "",
      sort: "updated",
      minStars: "0",
    });

    assert.equal(res.applied, true);
    assert.ok(res.filters.labels.includes("good first issue"));
    assert.ok(res.filters.labels.includes("help wanted"));
    assert.ok(res.filters.labels.includes("bug"));
    assert.ok(res.filters.keywords.toLowerCase().includes("react"));
    assert.ok(res.filters.keywords.toLowerCase().includes("ui"));
    assert.equal(res.filters.sort, "best");
    assert.ok(res.summary.length > 0);
  });

  it("parses docs work in Rust and test coverage in Python with star floor", () => {
    const rustDocs = parseNaturalLanguageQuery("docs work in Rust");
    assert.equal(rustDocs.filters.language, "rust");
    assert.equal(rustDocs.presetId, "docs");
    assert.ok(rustDocs.filters.labels.includes("documentation"));
    assert.ok(rustDocs.filters.keywords.includes("documentation"));

    const pyTests = parseNaturalLanguageQuery("tests in python >500 stars");
    assert.equal(pyTests.filters.language, "python");
    assert.equal(pyTests.filters.minStars, "500");
    assert.equal(pyTests.presetId, "tests");
    assert.ok(pyTests.filters.labels.includes("help wanted"));
    assert.ok(pyTests.filters.keywords.includes("test"));
  });
});

describe("userAffinity", () => {
  const mkExploreIssue = (id, repoSlug, overrides = {}) => ({
    id,
    title: `Improve error handling in ${repoSlug}`,
    body: "## Problem\nSee `src/index.ts` for repro steps.",
    html_url: `https://github.com/${repoSlug}/issues/${id}`,
    repository_url: `https://api.github.com/repos/${repoSlug}`,
    labels: [{ name: "good first issue" }],
    comments: 0,
    repo_stars: 400,
    _readiness: { score: 75, taskType: "Bug fix" },
    ...overrides,
  });

  it("extracts repo slug consistently across Explore and Smart Match issue shapes", () => {
    assert.equal(
      getIssueRepoSlug({ repository_url: "https://api.github.com/repos/Acme/Widget" }),
      "acme/widget"
    );
    assert.equal(getIssueRepoSlug({ repo: "Vercel/Next.js" }), "vercel/next.js");
  });

  it("learns positive repo/task weights from merged PRs and bookmarks, and hides dismissed issues", () => {
    const dismissedUrl = "https://github.com/noisy/repo/issues/99";
    const profile = buildUserAffinityProfile({
      contributions: [
        {
          github_repo_owner: "acme",
          github_repo_name: "core",
          pr_status: "merged",
          pr_merged_at: "2026-10-01T00:00:00Z",
          language: "typescript",
          labels: ["good first issue"],
        },
      ],
      bookmarks: [
        {
          repo_name: "docs/starter",
          language: "typescript",
          task_type: "Docs",
        },
      ],
      feedbackRows: [
        {
          issue_url: dismissedUrl,
          repo: "noisy/repo",
          language: "java",
          task_type: "Tests",
          feedback: "dismissed",
        },
      ],
    });

    assert.equal(profile.hasSignals, true);

    const hiddenCheck = scoreIssueAffinity(
      mkExploreIssue(99, "noisy/repo", { html_url: dismissedUrl }),
      profile
    );
    assert.equal(hiddenCheck.isDismissed, true);

    const boostedIssue = mkExploreIssue(1, "acme/core", {
      _readiness: { score: 74, taskType: "Bug fix" },
    });
    const neutralIssue = mkExploreIssue(2, "other/project", {
      _readiness: { score: 78, taskType: "Bug fix" },
    });
    const penalizedSibling = mkExploreIssue(3, "noisy/repo", {
      _readiness: { score: 78, taskType: "Tests" },
    });

    const affinityBoost = scoreIssueAffinity(boostedIssue, profile);
    assert.ok(affinityBoost.delta >= 10);
    assert.ok(affinityBoost.reasons.some((r) => r.includes("acme/core")));

    const ranked = applyUserAffinity(
      [neutralIssue, penalizedSibling, boostedIssue, mkExploreIssue(99, "noisy/repo", { html_url: dismissedUrl })],
      "best",
      profile
    );

    assert.equal(ranked.length, 3);
    assert.equal(ranked.some((item) => item.html_url === dismissedUrl), false);
    assert.equal(ranked[0].id, boostedIssue.id);
    assert.equal(ranked[ranked.length - 1].id, penalizedSibling.id);
  });

  it("integrates affinity filtering and boosts inside Smart Match rankCandidatesForUser", () => {
    const profile = buildUserAffinityProfile({
      contributions: [
        {
          github_repo_owner: "preferred",
          github_repo_name: "sdk",
          pr_status: "merged",
          pr_merged_at: "2026-10-15T00:00:00Z",
        },
      ],
      feedbackRows: [
        {
          issue_url: "https://github.com/neutral/lib/issues/3",
          repo: "neutral/lib",
          feedback: "dismissed",
        },
      ],
    });

    const now = Date.now();
    const baseCandidate = (id, repo) => ({
      id,
      repo,
      url: `https://github.com/${repo}/issues/${id}`,
      title: `Fix TypeScript strict check in ${repo}`,
      body: "## Reproduction\nUpdate `src/client.ts`.",
      language: "TypeScript",
      labels: ["good first issue"],
      comments: 0,
      created_days_ago: 2,
      repo_stars: 900,
      repo_pushed_at: new Date(now - 2 * 86400000).toISOString(),
    });

    const ranked = rankCandidatesForUser(
      [
        baseCandidate(1, "neutral/lib"),
        baseCandidate(2, "preferred/sdk"),
        baseCandidate(3, "neutral/lib"),
      ],
      { languages: ["TypeScript"], experienceLevel: "beginner" },
      { affinityProfile: profile, now }
    );

    assert.equal(ranked.length, 2);
    assert.equal(ranked.some((c) => c.id === 3), false);
    assert.equal(ranked[0].id, 2);
    assert.ok(ranked[0].preScore > ranked[1].preScore);
  });
});

