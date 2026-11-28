---
title: "Debugging GitHub Actions & CI/CD PR Checks"
description: "Diagnose failing automated tests, linters, and build checks in your Pull Requests."
readTime: "10 min read"
updated: "today"
difficulty: "Intermediate"
order: 4
---
When you open a Pull Request, automated CI/CD workflows run linters, type checks, and integration tests. Understanding how to read and reproduce CI failures saves maintainers and contributors immense time.

## 1. How to Read CI Failure Logs

1. On your GitHub PR, scroll to the checks section at the bottom.
2. Click 'Details' next to any red ❌ check.
3. Expand the failed step (often named 'Run linter', 'Run tests', or 'Build').
4. Look for the first error line or failing assertion near the top of the trace.

## 2. Reproducing Checks Locally

Most projects configure package scripts that mirror CI checks:

```bash
# Run the linter locally to catch formatting errors:
npm run lint

# Run tests locally:
npm test

# Test production build bundle:
npm run build
```

> [!INFO] Amending Without New Commits
> If you just need to fix a small lint failure in your latest commit, use 'git commit --amend --no-edit' followed by 'git push --force-with-lease origin branch-name' to keep your commit history clean.
