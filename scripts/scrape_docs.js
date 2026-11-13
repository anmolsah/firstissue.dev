import { createClient } from '@supabase/supabase-js';
import process from 'process';
import fs from 'fs';
import path from 'path';

// Manual .env loader to support all Node versions without external dependencies
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const equalsIdx = trimmed.indexOf('=');
          const key = trimmed.substring(0, equalsIdx).trim();
          let val = trimmed.substring(equalsIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Warning: Failed to load .env file manually:', err.message);
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Prefer service role key for inserting to database
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.XAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set.');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY must be set to generate embeddings.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================================================
// TARGET LIST — All documentation URLs to scrape and index
// =============================================================================
const TARGETS = [
  // ─── Git Command Manuals (git-scm.com/docs) ──────────────────────────────
  { url: 'https://git-scm.com/docs/git-commit',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-push',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-pull',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-rebase',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-merge',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-clone',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-init',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-add',         type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-branch',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-checkout',    type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-stash',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-log',         type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-diff',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-reset',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-remote',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-fetch',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-cherry-pick', type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-tag',         type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-worktree',    type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-bisect',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-reflog',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-submodule',   type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-blame',       type: 'git-scm', category: 'Git Commands' },

  // ─── GitHub CLI Manuals (cli.github.com/manual) ───────────────────────────
  { url: 'https://cli.github.com/manual/gh_pr_create',    type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_view',      type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_repo_fork',    type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_issue_create', type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_issue_list',   type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_issue_view',   type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_checkout',  type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_merge',     type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_list',      type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_repo_clone',   type: 'gh-cli', category: 'GitHub CLI' },

  // ─── GitHub Docs (docs.github.com — uses Markdown API) ────────────────────
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/using-github/github-flow',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/getting-started-with-git/setting-up-git',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/actions/writing-workflows/quickstart',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/codespaces/getting-started/quickstart',
    type: 'github-docs', category: 'GitHub Docs' },

  // ─── Open Source Guides (opensource.guide) ─────────────────────────────────
  { url: 'https://opensource.guide/how-to-contribute/',  type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/starting-a-project/', type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/best-practices/',     type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/finding-users/',      type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/code-of-conduct/',    type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/getting-paid/',       type: 'opensource-guide', category: 'Open Source Guides' },

  // ─── Pro Git Book (git-scm.com/book) ──────────────────────────────────────
  { url: 'https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows',      type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project', type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging',           type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning',        type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History',            type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging', type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Basics-Tagging',                     type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things',              type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases',                 type: 'git-book', category: 'Pro Git Book' },

  // ─── GitHub Docs — forking / contributing workflow (Markdown API) ─────────
  { url: 'https://docs.github.com/en/get-started/quickstart/fork-a-repo',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/about-merge-conflicts',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/discussions/quickstart',
    type: 'github-docs', category: 'GitHub Docs' },

  // ─── Open Source Guides — remaining chapters (opensource.guide) ────────────
  { url: 'https://opensource.guide/leadership-and-governance/', type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/metrics/',                   type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/legal/',                     type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/building-community/',        type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/maintaining-balance/',       type: 'opensource-guide', category: 'Open Source Guides' },

  // ─── Raw Markdown specs & guides (clean .md, no HTML parsing) ──────────────
  { url: 'https://raw.githubusercontent.com/semver/semver/master/semver.md',
    type: 'raw-md', category: 'Specs & Conventions', title: 'Semantic Versioning (SemVer) Specification' },
  { url: 'https://raw.githubusercontent.com/firstcontributions/first-contributions/main/README.md',
    type: 'raw-md', category: 'Specs & Conventions', title: 'First Contributions — Beginner Git/GitHub Guide' },
  { url: 'https://raw.githubusercontent.com/conventional-commits/conventionalcommits.org/master/content/v1.0.0/index.md',
    type: 'raw-md', category: 'Specs & Conventions', title: 'Conventional Commits 1.0.0 Specification' },
  { url: 'https://raw.githubusercontent.com/olivierlacan/keep-a-changelog/main/README.md',
    type: 'raw-md', category: 'Specs & Conventions', title: 'Keep a Changelog Guide & Specification' },

  // ─── GitLab Official Docs (raw Markdown from gitlab-org/gitlab) ──────────
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/user/project/repository/forking_workflow.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Project Forking Workflow' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/user/project/merge_requests/index.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Merge Requests Overview' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/user/project/merge_requests/creating_merge_requests.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Creating Merge Requests' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/user/project/merge_requests/reviews/index.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Reviewing Merge Requests' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/user/project/merge_requests/conflicts.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Resolving Merge Conflicts' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/topics/git/git_rebase.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Git Rebase & Force Push' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/ci/quick_start/index.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab CI/CD — Quick Start (.gitlab-ci.yml)' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/user/project/protected_branches.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Protected Branches' },
  { url: 'https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/development/contributing/merge_request_workflow.md',
    type: 'gitlab-md', category: 'GitLab Docs', title: 'GitLab — Contributor Merge Request Workflow' },

  // ─── Additional GitHub Docs (Actions, PR checkout, Releases, Supply Chain) ─
  { url: 'https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/troubleshooting-workflows/using-workflow-run-logs',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases',
    type: 'github-docs', category: 'GitHub Docs' },

  // ─── Forgejo / Codeberg Docs ──────────────────────────────────────────────
  { url: 'https://codeberg.org/forgejo/docs/raw/branch/main/content/user/pull-requests.md',
    type: 'gitlab-md', category: 'Codeberg & Forgejo', title: 'Forgejo / Codeberg — Pull Requests & Forks' },

  // ─── Google Engineering Practices & Ecosystem Contributor Guides ───────────
  { url: 'https://raw.githubusercontent.com/google/eng-practices/master/review/developer/index.md',
    type: 'raw-md', category: 'Code Review & PR Craft', title: 'Google Eng Practices — PR Author Guide' },
  { url: 'https://raw.githubusercontent.com/google/eng-practices/master/review/developer/cl-descriptions.md',
    type: 'raw-md', category: 'Code Review & PR Craft', title: 'Google Eng Practices — Writing Clear PR Descriptions' },
  { url: 'https://raw.githubusercontent.com/google/eng-practices/master/review/developer/small-cls.md',
    type: 'raw-md', category: 'Code Review & PR Craft', title: 'Google Eng Practices — Keeping PRs Small & Focused' },
  { url: 'https://raw.githubusercontent.com/nodejs/node/main/doc/contributing/pull-requests.md',
    type: 'raw-md', category: 'Code Review & PR Craft', title: 'Node.js Contributing — Pull Request Lifecycle' },
  { url: 'https://raw.githubusercontent.com/python/devguide/main/getting-started/pull-request-lifecycle.md',
    type: 'raw-md', category: 'Code Review & PR Craft', title: 'Python Devguide — Pull Request Lifecycle' },
  { url: 'https://raw.githubusercontent.com/cncf/contribute/main/README.md',
    type: 'raw-md', category: 'Code Review & PR Craft', title: 'CNCF — Contributing to Cloud Native Projects' },

  // ─── Open Source Programs (Google Summer of Code Guides) ───────────────────
  { url: 'https://raw.githubusercontent.com/google/gsocguides/master/student/what-is-gsoc.md',
    type: 'raw-md', category: 'OSS Programs (GSoC)', title: 'GSoC Guide — What is Google Summer of Code?' },
  { url: 'https://raw.githubusercontent.com/google/gsocguides/master/student/finding-the-right-project.md',
    type: 'raw-md', category: 'OSS Programs (GSoC)', title: 'GSoC Guide — Finding the Right Organization & Project' },
  { url: 'https://raw.githubusercontent.com/google/gsocguides/master/student/writing-a-proposal.md',
    type: 'raw-md', category: 'OSS Programs (GSoC)', title: 'GSoC Guide — Writing a Strong Proposal' },

  // ─── Open Source Licenses, Governance & Tooling ───────────────────────────
  { url: 'https://raw.githubusercontent.com/github/choosealicense.com/gh-pages/_licenses/mit.txt',
    type: 'gitlab-md', category: 'Licenses & Governance', title: 'MIT License — Terms & Conditions' },
  { url: 'https://raw.githubusercontent.com/github/choosealicense.com/gh-pages/_licenses/apache-2.0.txt',
    type: 'gitlab-md', category: 'Licenses & Governance', title: 'Apache License 2.0 — Terms & Patent Grant' },
  { url: 'https://raw.githubusercontent.com/github/choosealicense.com/gh-pages/_licenses/gpl-3.0.txt',
    type: 'gitlab-md', category: 'Licenses & Governance', title: 'GNU GPL v3.0 — Copyleft Terms' },
  { url: 'https://raw.githubusercontent.com/ContributorCovenant/contributor_covenant/release/content/version/2/1/code_of_conduct.md',
    type: 'raw-md', category: 'Licenses & Governance', title: 'Contributor Covenant v2.1 Code of Conduct' },
  { url: 'https://raw.githubusercontent.com/pre-commit/pre-commit/main/README.md',
    type: 'raw-md', category: 'Specs & Conventions', title: 'pre-commit Hooks Framework Guide' },
];

// =============================================================================
// HTML → Markdown Utilities
// =============================================================================

// Helper to clean HTML and translate to markdown
function cleanHtmlToMarkdown(html) {
  let text = html;

  // Replace <code>...</code> with `...`
  text = text.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');

  // Replace <pre><code>...</code></pre> with ```...```
  text = text.replace(/<pre>[\s\S]*?<code>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<pre>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

  // Replace list items <li>...</li> with - ...
  text = text.replace(/<li>([\s\S]*?)<\/li>/gi, '\n- $1');

  // Replace paragraphs <p>...</p> with linebreaks
  text = text.replace(/<p>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Unescape HTML entities
  text = text.replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#x27;/g, "'")
             .replace(/&#x60;/g, "`");

  // Clean up multiple empty lines
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return text;
}

// =============================================================================
// PARSERS — One for each site type
// =============================================================================

// Git-SCM HTML Parser (for /docs/git-*)
function parseGitScmHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(' - Git documentation', '').trim() : 'Git Command';

  const mainContentMatch = html.match(/<div id="main"[\s\S]*?>([\s\S]*?)<\/div>\s*?<div id="footer">/i);
  const contentHtml = mainContentMatch ? mainContentMatch[1] : html;

  const sectionRegex = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[1].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[2];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `${pageTitle} - ${sectionTitle}`,
        content: `## ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: pageTitle,
      content: `# ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// GitHub CLI HTML Parser (for cli.github.com/manual)
function parseGithubCliHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(' | GitHub CLI Manual', '').trim() : 'GitHub CLI';

  const bodyMatch = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i) || html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  const contentHtml = bodyMatch ? bodyMatch[1] : html;

  const sectionRegex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h2|<h3|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[3];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `${pageTitle} - ${sectionTitle}`,
        content: `## ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: pageTitle,
      content: `# ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// GitHub Docs Parser — fetches clean Markdown via their official API
// instead of parsing complex Next.js HTML
async function fetchGithubDocsMarkdown(url) {
  // Extract the pathname from the full URL
  // e.g. https://docs.github.com/en/get-started/using-github/github-flow
  //   → /en/get-started/using-github/github-flow
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  const apiUrl = `https://docs.github.com/api/article/body?pathname=${pathname}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'FirstIssueScraper/1.0 (https://firstissue.dev; bot)',
      'Accept': 'text/markdown, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Docs API error: ${response.status}`);
  }

  const markdown = await response.text();

  // Extract the title from the first # heading
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const pageTitle = titleMatch ? titleMatch[1].trim() : pathname.split('/').pop().replace(/-/g, ' ');

  return parseMarkdownIntoChunks(markdown, pageTitle, url);
}

// Open Source Guide Parser (opensource.guide) — HTML with <article> wrapper
function parseOpenSourceGuideHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch
    ? titleMatch[1].replace(/\s*\|\s*Open Source Guides/i, '').trim()
    : 'Open Source Guide';

  // Content is inside <article> → <div class="article-body">
  const articleMatch = html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  const contentHtml = articleMatch ? articleMatch[1] : html;

  // Split by h2 sections
  const sectionRegex = /<h2[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[3];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    // Remove <aside class="pquote"> quote attribution noise but keep the quote text
    markdownText = markdownText.replace(/— @\w+,\s*"[^"]*"/g, '');

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `${pageTitle} - ${sectionTitle}`,
        content: `## ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: pageTitle,
      content: `# ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// Pro Git Book Parser (git-scm.com/book) — HTML with <div id="main"> wrapper
function parseGitBookHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch
    ? titleMatch[1].replace(/^Git\s*-\s*/, '').trim()
    : 'Pro Git';

  // Content is inside <div class="sect1"> or <div id="main">
  const mainMatch = html.match(/<div class="sect1">([\s\S]*?)(?:<div id="nav"|<div id="footer"|$)/i);
  const contentHtml = mainMatch ? mainMatch[1] : html;

  // Split by h2 and h3 sections
  const sectionRegex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h2|<h3|<div class="sect|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[3];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `Pro Git: ${pageTitle} - ${sectionTitle}`,
        content: `## Pro Git: ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: `Pro Git: ${pageTitle}`,
      content: `# Pro Git: ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// =============================================================================
// Shared Markdown Chunker (for GitHub Docs Markdown API responses)
// =============================================================================
function parseMarkdownIntoChunks(markdown, pageTitle) {
  const lines = markdown.split('\n');
  const chunks = [];
  let currentHeader = pageTitle;
  let currentChunk = [];

  for (const line of lines) {
    // Split on h2 (##) headings
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (currentChunk.length > 0) {
        const text = currentChunk.join('\n').trim();
        if (text.length > 0) {
          chunks.push({
            title: `${pageTitle} - ${currentHeader}`,
            content: text
          });
        }
      }
      currentHeader = line.replace(/^#+\s+/, '').trim();
      currentChunk = [line];
    } else {
      currentChunk.push(line);
    }
  }

  // Push the last chunk
  if (currentChunk.length > 0) {
    const text = currentChunk.join('\n').trim();
    if (text.length > 0) {
      chunks.push({
        title: `${pageTitle} - ${currentHeader}`,
        content: text
      });
    }
  }

  // If no sections were found, treat the whole page as one chunk
  if (chunks.length === 0) {
    chunks.push({
      title: pageTitle,
      content: markdown.trim()
    });
  }

  return chunks;
}

// =============================================================================
// Embedding Generation (OpenRouter API)
// =============================================================================
async function getEmbedding(text) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://firstissue.dev',
        'X-Title': 'FirstIssue Doc Scraper'
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter Embeddings Error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    return resJson.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding for: ', text.substring(0, 40) + '...');
    throw error;
  }
}

function cleanMarkdownFrontmatter(markdown) {
  let cleaned = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  // Strip GitLab-specific inline metadata / alert markers while keeping readable content
  cleaned = cleaned
    .replace(/^(?:stage|group|info|description):.*$/gm, '')
    .replace(/^(?:DETAILS|FLAG|WARNING|NOTE|CAUTION):.*$/gm, '')
    .replace(/\{\{<[\s\S]*?>\}\}/g, '')
    .replace(/\{\{%[\s\S]*?%\}\}/g, '');
  return cleaned.trim();
}

// =============================================================================
// Main Scrape & Index Pipeline
// =============================================================================
async function scrapeAndIndex() {
  const categoryArg = process.argv.find((a) => a.startsWith('--category='));
  const categoryFilter = categoryArg ? categoryArg.split('=')[1].trim().toLowerCase() : '';
  const activeTargets = categoryFilter
    ? TARGETS.filter((t) => t.category.toLowerCase().includes(categoryFilter))
    : TARGETS;

  console.log('=== Starting Web Documentation Scraper ===');
  console.log(`Total targets: ${activeTargets.length} pages across ${[...new Set(activeTargets.map(t => t.category))].length} categories\n`);

  // Group targets by category for logging
  const categories = [...new Set(activeTargets.map(t => t.category))];
  for (const cat of categories) {
    const count = activeTargets.filter(t => t.category === cat).length;
    console.log(`  📂 ${cat}: ${count} pages`);
  }
  console.log('');

  let totalSuccess = 0;
  let totalChunks = 0;

  for (let idx = 0; idx < activeTargets.length; idx++) {
    const target = activeTargets[idx];
    console.log(`[${idx + 1}/${activeTargets.length}] [${target.category}] Fetching: ${target.url}...`);

    try {
      let chunks = [];

      // ── GitHub Docs: Use their Markdown API (no HTML parsing needed) ──
      if (target.type === 'github-docs') {
        chunks = await fetchGithubDocsMarkdown(target.url);
      } else if (target.type === 'raw-md' || target.type === 'gitlab-md') {
        // ── Raw Markdown files (GitHub raw, GitLab raw, Forgejo raw, ChooseALicense) ──
        const response = await fetch(target.url, {
          headers: { 'User-Agent': 'FirstIssueScraper/1.0 (https://firstissue.dev; bot)' }
        });
        if (!response.ok) {
          console.error(`  [ERROR] Failed to fetch: Status ${response.status}`);
          continue;
        }
        let markdown = await response.text();
        if (target.type === 'gitlab-md') {
          markdown = cleanMarkdownFrontmatter(markdown);
        }
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        const pageTitle = target.title || (titleMatch ? titleMatch[1].trim() : 'Documentation');
        chunks = parseMarkdownIntoChunks(markdown, pageTitle, target.url);
      } else {
        // ── All other types: Fetch HTML and parse ──
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'FirstIssueScraper/1.0 (https://firstissue.dev; bot)'
          }
        });

        if (!response.ok) {
          console.error(`  [ERROR] Failed to fetch: Status ${response.status}`);
          continue;
        }

        const html = await response.text();

        // Route to the right parser
        if (target.type === 'git-scm') {
          chunks = parseGitScmHtml(html);
        } else if (target.type === 'gh-cli') {
          chunks = parseGithubCliHtml(html);
        } else if (target.type === 'opensource-guide') {
          chunks = parseOpenSourceGuideHtml(html);
        } else if (target.type === 'git-book') {
          chunks = parseGitBookHtml(html);
        }
      }

      console.log(`  [PARSE] Split into ${chunks.length} semantic chunks.`);

      if (chunks.length === 0) continue;

      // Clear existing chunks for this URL (de-duplication)
      const { error: deleteError } = await supabase
        .from('kb_chunks')
        .delete()
        .eq('source', target.url);

      if (deleteError) {
        console.warn(`  [WARN] Failed to clear old chunks: ${deleteError.message}`);
      }

      // Generate embeddings and insert
      let successCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`    → Embedding [${i + 1}/${chunks.length}]: "${chunk.title.substring(0, 50)}..."`);

        try {
          const embedding = await getEmbedding(chunk.content);

          const { error: insertError } = await supabase
            .from('kb_chunks')
            .insert({
              source: target.url,
              title: chunk.title,
              path: target.url,
              content: chunk.content,
              embedding: embedding
            });

          if (insertError) {
            console.error(`    [DB ERROR] ${insertError.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`    [API ERROR] ${err.message}`);
        }

        // Delay to prevent hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      totalSuccess += successCount;
      totalChunks += chunks.length;
      console.log(`  [DONE] Indexed ${successCount}/${chunks.length} chunks.\n`);

    } catch (error) {
      console.error(`  [FATAL] Error crawling ${target.url}:`, error.message);
    }

    // 1.5 seconds delay between sites to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('=== Web Documentation Scraper completed ===');
  console.log(`Total: ${totalSuccess}/${totalChunks} chunks indexed across ${activeTargets.length} pages.`);
}

scrapeAndIndex().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
