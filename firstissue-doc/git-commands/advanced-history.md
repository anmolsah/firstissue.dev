---
title: "Advanced & History Management"
description: "Powerful tools for rewriting history, undoing changes, and managing work"
readTime: "12 min read"
updated: "3 days ago"
difficulty: "Advanced"
order: 5
---
These are powerful tools for rewriting history, undoing changes, and saving work temporarily. Use with caution!

## Stashing Changes

- git stash - Temporarily shelves (stashes) all modified tracked files
- git stash pop - Reapplies the most recently stashed changes and removes them from the stash list

```bash
# Stash your current changes
git stash

# Apply stashed changes
git stash pop

# List all stashes
git stash list
```

## Rebasing

- git rebase <base> - Reapplies commits from your current branch onto the tip of another branch, often used to clean up history
- git rebase -i <base> - Starts an interactive rebase, allowing you to edit, squash, or reorder commits

```bash
# Rebase your branch onto main
git rebase main

# Interactive rebase to clean up commits
git rebase -i HEAD~3
```

## Resetting and Reverting

- git reset --soft <commit> - Moves the branch pointer back to a commit, keeping your staged and working directory changes
- git reset --hard <commit> - Warning: Resets the branch pointer and discards all staged and working directory changes to match the specified commit. Use with extreme caution
- git revert <commit> - Creates a new commit that undoes the changes made in a specified previous commit. This is a safe way to undo public history

```bash
# Soft reset (keeps changes)
git reset --soft HEAD~1

# Hard reset (DANGER: discards changes)
git reset --hard HEAD~1

# Revert a commit (safe for public history)
git revert abc123
```

> [!WARNING] Danger Zone
> git reset --hard permanently deletes your changes. Never use it on commits that have been pushed to a shared repository. Use git revert instead for public history.

## Advanced History Tools

- git cherry-pick <commit> - Applies the changes from a specific commit onto your current branch
- git log -- <file> - Shows the commit history for a specific file
- git blame <file> - Shows what revision and author last modified each line of a file

```bash
# Cherry-pick a specific commit
git cherry-pick abc123

# View history of a file
git log -- index.html

# See who changed each line
git blame index.html
```

> [!INFO] When to Use These Commands
> These advanced commands are powerful but can be dangerous. Use them when you need to clean up your local history before pushing, but avoid rewriting history that others depend on.
