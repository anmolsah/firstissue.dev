import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGitHubIssueSearchQuery,
  filterStaleIssues,
  extractCleanSummary,
  scoreIssueReadiness,
  enrichAndSortIssues,
  classifyIssueTaskType,
  formatCompactNumber,
} from "../issueQualityFilter.js";

const FIXED_NOW = new Date("2026-11-13T12:00:00Z").getTime();

test("buildGitHubIssueSearchQuery emits valid qualifiers, OR labels, -linked:pr, archived:false, and omits stars:>=N", () => {
  const q = buildGitHubIssueSearchQuery({
    labels: ["good first issue", "help wanted"],
    language: "TypeScript",
    keywords: "dark mode",
    trending: true,
    trendingDays: 30,
    extraRepoQualifiers: ["vercel/next.js", "invalid repo!"],
    now: FIXED_NOW,
  });

  assert.match(q, /state:open type:issue is:public no:assignee -linked:pr archived:false/);
  assert.match(q, /label:"good first issue","help wanted"/);
  assert.match(q, /language:TypeScript/);
  assert.match(q, /created:>=2026-10-14/);
  assert.match(q, /repo:vercel\/next\.js/);
  assert.doesNotMatch(q, /invalid repo/);
  assert.doesNotMatch(q, /stars:>=/);
  assert.ok(q.endsWith("dark mode"));
});

test("buildGitHubIssueSearchQuery handles single label without trailing comma", () => {
  const q = buildGitHubIssueSearchQuery({ labels: ["documentation"] });
  assert.match(q, /\slabel:"documentation"(?:\s|$)/);
  assert.doesNotMatch(q, /label:"documentation",/);
});

test("filterStaleIssues drops PRs, assigned, locked, archived, stale zero-comment issues, and below-minStars issues", () => {
  const issues = [
    {
      id: 1,
      created_at: "2026-11-10T10:00:00Z",
      comments: 0,
      repo_stars: 1200,
    },
    {
      id: 2,
      created_at: "2026-11-10T10:00:00Z",
      comments: 0,
      pull_request: { url: "https://api.github.com/pulls/2" },
    },
    {
      id: 3,
      created_at: "2026-11-10T10:00:00Z",
      comments: 0,
      assignees: [{ login: "dev" }],
    },
    {
      id: 4,
      created_at: "2026-01-01T10:00:00Z",
      comments: 0,
    },
    {
      id: 5,
      created_at: "2026-11-10T10:00:00Z",
      comments: 0,
      repo_archived: true,
    },
    {
      id: 6,
      created_at: "2026-11-10T10:00:00Z",
      comments: 1,
      repo_stars: 400,
    },
    {
      id: 7,
      created_at: "2026-11-10T10:00:00Z",
      comments: 1,
      repo_stars: null,
    },
  ];

  const keptWithStars = filterStaleIssues(issues, { minStars: 1000, now: FIXED_NOW });
  assert.deepEqual(
    keptWithStars.map((i) => i.id),
    [1, 7]
  );

  const keptRequireKnown = filterStaleIssues(issues, {
    minStars: 1000,
    requireKnownStars: true,
    now: FIXED_NOW,
  });
  assert.deepEqual(
    keptRequireKnown.map((i) => i.id),
    [1]
  );
});

test("extractCleanSummary strips HTML comments, issue template headings, and code blocks", () => {
  const rawBody = `
<!-- Please fill out this template -->
### Describe the bug
When switching to dark mode in \`src/pages/ExplorePage.jsx\`, the sidebar dropdown border vanishes on Safari 18.
\`\`\`js
const broken = true;
console.log(broken);
\`\`\`
### Additional context
- [x] Fix border token in [ExplorePage](https://github.com/org/repo)
`;

  const clean = extractCleanSummary(rawBody, 175);
  assert.doesNotMatch(clean, /<!--/);
  assert.doesNotMatch(clean, /Describe the bug/i);
  assert.doesNotMatch(clean, /console\.log/);
  assert.match(clean, /When switching to dark mode/);
  assert.match(clean, /ExplorePage/);
});

test("scoreIssueReadiness rewards maintainer + file paths + clear scope + unclaimed over noisy hot threads", () => {
  const strongIssue = {
    title: "Fix focus ring on modal close button",
    body: "Please update `src/components/Modal.jsx` so the close button keeps a 2px focus outline.\n- [ ] Add visible focus-visible class\n- [ ] Verify keyboard navigation",
    author_association: "MEMBER",
    labels: [{ name: "good first issue" }, { name: "ui" }],
    comments: 0,
    created_at: "2026-11-11T10:00:00Z",
    updated_at: "2026-11-12T10:00:00Z",
    repo_pushed_at: "2026-11-12T08:00:00Z",
    repo_stars: 3400,
  };

  const noisyIssue = {
    title: "Help?",
    body: "not working",
    author_association: "NONE",
    labels: [],
    comments: 14,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    repo_pushed_at: "2025-10-01T08:00:00Z",
    repo_stars: 50,
  };

  const strongResult = scoreIssueReadiness(strongIssue, FIXED_NOW);
  const noisyResult = scoreIssueReadiness(noisyIssue, FIXED_NOW);

  assert.equal(strongResult.tier, "strong");
  assert.equal(strongResult.taskType, "UI");
  assert.ok(strongResult.score >= 80, `Expected >= 80, got ${strongResult.score}`);
  assert.ok(strongResult.signals.some((s) => s.label === "File paths"));
  assert.ok(strongResult.signals.some((s) => s.label === "Unclaimed"));

  assert.equal(noisyResult.tier, "fair");
  assert.ok(noisyResult.score < 40, `Expected < 40, got ${noisyResult.score}`);
  assert.ok(noisyResult.signals.some((s) => s.label === "Hot thread" && s.tone === "warn"));

  const sorted = enrichAndSortIssues([noisyIssue, strongIssue], "best", FIXED_NOW);
  assert.equal(sorted[0].title, strongIssue.title);
});

test("classifyIssueTaskType and formatCompactNumber classify and format cleanly", () => {
  assert.equal(classifyIssueTaskType({ title: "Add unit test for parser", labels: [] }), "Tests");
  assert.equal(classifyIssueTaskType({ title: "Update README typo", labels: [] }), "Docs");
  assert.equal(formatCompactNumber(12450), "12.4k");
  assert.equal(formatCompactNumber(1000), "1k");
  assert.equal(formatCompactNumber(840), "840");
  assert.equal(formatCompactNumber(null), null);
});
