---
title: "Branching & Merging"
description: "Learn how to use branches to develop features in isolation and merge changes"
readTime: "10 min read"
updated: "2 days ago"
difficulty: "Intermediate"
order: 3
---
Branches allow you to develop features in isolation. Merging integrates changes from one branch into another.

## Branch Management

- git branch - Lists all local branches
- git branch <name> - Creates a new branch
- git branch -d <branch> - Deletes a specified branch (if it has been merged)

```bash
# List all branches
git branch

# Create a new branch
git branch feature-login

# Delete a branch
git branch -d feature-login
```

## Switching Branches

- git switch <branch> or git checkout <branch> - Switches to the specified branch
- git switch -c <branch> or git checkout -b <branch> - Creates a new branch and switches to it

```bash
# Switch to an existing branch
git switch main
git checkout main

# Create and switch to a new branch
git switch -c feature-dashboard
git checkout -b feature-dashboard
```

## Merging Branches

- git merge <branch> - Merges the specified branch's history into the current branch
- git log --oneline --graph - Shows the commit history as a compact graph, useful for visualizing branches

```bash
# Merge a feature branch into main
git switch main
git merge feature-login

# View branch history
git log --oneline --graph
```

> [!TIP] Best Practice
> Always create a new branch for each feature or bug fix. This keeps your main branch clean and makes it easier to manage multiple changes simultaneously.
