---
title: "Git Stashing & Worktrees"
description: "Master `git stash` with labels and use `git worktree` to work on multiple branches simultaneously without switching."
readTime: "9 min read"
updated: "today"
difficulty: "Intermediate"
order: 3
---
Need to switch branches to review a PR or fix an urgent bug without committing your half-finished changes? Git provides two powerful tools: Stash and Worktree.

## 1. Labeled Stashing

```bash
# Save untracked and modified files with a clear label:
git stash push -u -m "wip: stripe checkout modal"

# List all saved stashes:
git stash list

# Inspect changes inside the top stash:
git stash show -p stash@{0}

# Restore and pop the stash:
git stash pop
```

## 2. Git Worktrees: Simultaneous Branches

Git worktree allows you to checkout multiple branches in separate directories on disk at the same time, without touching your current node_modules or build cache.

```bash
# Check out a branch in a parallel folder:
git worktree add ../hotfix-folder -b hotfix/critical-api-bug

# Now navigate and work in both directories simultaneously:
cd ../hotfix-folder
npm test

# When finished, remove the worktree:
git worktree remove ../hotfix-folder
```
