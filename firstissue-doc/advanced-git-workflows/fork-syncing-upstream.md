---
title: "Syncing Forks & Managing Remotes"
description: "Configure upstream remotes, rebase feature branches on upstream/main, and safely push with `--force-with-lease`."
readTime: "8 min read"
updated: "today"
difficulty: "Intermediate"
order: 2
---
When contributing to open source, changes are constantly being merged into the parent project. Keeping your fork in sync avoids painful merge conflicts later.

## 1. Setting Up Upstream Remote

```bash
# Check your existing remotes (usually just origin):
git remote -v

# Add the parent project as upstream:
git remote add upstream https://github.com/original-owner/repo.git

# Verify both origin and upstream are configured:
git remote -v
```

## 2. The Golden Rebase Routine

```bash
# 1. Fetch latest changes from the parent project:
git fetch upstream

# 2. Checkout your feature branch:
git checkout feat/my-cool-feature

# 3. Rebase your work on top of upstream/main:
git rebase upstream/main

# 4. Push updated commits to your GitHub fork:
git push --force-with-lease origin feat/my-cool-feature
```

> [!WARNING] Always Use --force-with-lease
> Never use plain 'git push --force'. If someone else pushed to the branch, '--force' will obliterate their work. '--force-with-lease' verifies no unknown remote commits exist before pushing.
