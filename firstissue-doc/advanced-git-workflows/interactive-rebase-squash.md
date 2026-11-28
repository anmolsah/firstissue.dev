---
title: "Interactive Rebase & Squashing Commits"
description: "Master `git rebase -i` to clean up messy commit histories before code review."
readTime: "11 min read"
updated: "today"
difficulty: "Advanced"
order: 1
---
While developing a feature, your local git log often fills up with 'wip', 'fix typo', and 'cleanup' commits. Interactive rebase lets you tidy up these commits into clean, logical units before requesting review.

## 1. Starting an Interactive Rebase

```bash
# Rebase the last 4 commits on your current branch:
git rebase -i HEAD~4
```

Git opens your default terminal editor showing the list of commits from oldest to newest with action keywords:

```text
pick a1b2c3d feat(auth): add google oauth provider
squash d4e5f6g fix typo in auth config
fixup h7i8j9k remove debug logs

# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = pause for amending
# s, squash = meld into previous commit and keep message
# f, fixup = like squash, but discard this commit's log message
# d, drop = remove commit
```

> [!INFO] Squash vs Fixup
> Use 'squash' when you want to combine messages, and 'fixup' when the commit is just a small bugfix or typo whose individual message isn't worth keeping.
