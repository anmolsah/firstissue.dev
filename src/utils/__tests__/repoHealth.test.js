import test from "node:test";
import assert from "node:assert/strict";
import {
  scoreRepoHealth,
  formatRepoHealthSummary,
  formatHoursCompact,
  median,
} from "../repoHealth.js";
import {
  scoreIssueReadiness,
  enrichAndSortIssues,
} from "../issueQualityFilter.js";

const FIXED_NOW = new Date("2026-11-13T12:00:00Z").getTime();

test("median and formatHoursCompact handle valid, edge, and invalid values cleanly", () => {
  assert.equal(median([10, 4, 2]), 4);
  assert.equal(median([10, 4, 2, 20]), 7);
  assert.equal(median([]), null);

  assert.equal(formatHoursCompact(0.4), "<1h");
  assert.equal(formatHoursCompact(18.2), "18h");
  assert.equal(formatHoursCompact(72), "3d");
  assert.equal(formatHoursCompact(null), null);
});

test("scoreRepoHealth scores active fast-merging repos much higher than stale slow repos", () => {
  const healthy = scoreRepoHealth(
    {
      stars: 2400,
      last_pushed_at: "2026-11-12T08:00:00Z",
      median_pr_merge_hours: 18,
      first_timer_merge_rate: 0.75,
      merged_prs_30d: 9,
      has_contributing: true,
      has_code_of_conduct: true,
      is_archived: false,
    },
    FIXED_NOW
  );

  const staleSlow = scoreRepoHealth(
    {
      stars: 40,
      last_pushed_at: "2025-11-01T08:00:00Z",
      median_pr_merge_hours: 900,
      first_timer_merge_rate: 0.1,
      merged_prs_30d: 0,
      has_contributing: false,
      is_archived: false,
    },
    FIXED_NOW
  );

  assert.equal(healthy.health_tier, "healthy");
  assert.ok(healthy.health_score >= 85, `Expected >= 85, got ${healthy.health_score}`);
  assert.match(healthy.health_summary, /~18h PR merge/);
  assert.match(healthy.health_summary, /75% PRs merged/);
  assert.match(healthy.health_summary, /CONTRIBUTING\.md/);

  assert.equal(staleSlow.health_tier, "slow");
  assert.ok(staleSlow.health_score < 40, `Expected < 40, got ${staleSlow.health_score}`);
});

test("scoreRepoHealth and formatRepoHealthSummary handle archived repos honestly", () => {
  const archived = scoreRepoHealth({ is_archived: true, stars: 5000 }, FIXED_NOW);
  assert.equal(archived.health_score, 0);
  assert.equal(archived.health_tier, "inactive");
  assert.equal(archived.health_summary, "Archived repository");
  assert.equal(formatRepoHealthSummary({}, FIXED_NOW), null);
});

test("enrichAndSortIssues supports 'health' sort mode and repo_health integration in readiness score", () => {
  const slowRepoIssue = {
    id: 1,
    title: "Fix docs typo",
    body: "Please update README.md in `docs/README.md` with accurate setup instructions.\n- [ ] Fix typo",
    created_at: "2026-11-10T10:00:00Z",
    comments: 0,
    author_association: "MEMBER",
    repo_stars: 500,
    repo_health: { health_score: 30, health_tier: "slow", has_contributing: false },
  };

  const healthyRepoIssue = {
    id: 2,
    title: "Fix docs typo",
    body: "Please update README.md in `docs/README.md` with accurate setup instructions.\n- [ ] Fix typo",
    created_at: "2026-11-10T10:00:00Z",
    comments: 0,
    author_association: "MEMBER",
    repo_stars: 500,
    repo_health: { health_score: 92, health_tier: "healthy", has_contributing: true },
  };

  const rSlow = scoreIssueReadiness(slowRepoIssue, FIXED_NOW);
  const rHealthy = scoreIssueReadiness(healthyRepoIssue, FIXED_NOW);
  assert.ok(rHealthy.score > rSlow.score);

  const sortedByHealth = enrichAndSortIssues([slowRepoIssue, healthyRepoIssue], "health", FIXED_NOW);
  assert.equal(sortedByHealth[0].id, 2);
});

