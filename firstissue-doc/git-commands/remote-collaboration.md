---
title: "Remote Collaboration"
description: "Commands for sharing code and synchronizing work with remote repositories"
readTime: "9 min read"
updated: "1 day ago"
difficulty: "Intermediate"
order: 4
---
These commands let you share code and synchronize work with remote repositories (e.g., on GitHub or GitLab).

## Managing Remotes

- git remote add origin <url> - Adds a new remote repository connection, typically named origin

```bash
# Add a remote repository
git remote add origin https://github.com/username/repository.git

# View all remotes
git remote -v
```

## Pushing Changes

- git push -u origin <branch> - Pushes a local branch to a remote repository and sets it as the upstream track
- git push - Pushes committed changes from the current branch to its upstream remote branch

```bash
# Push and set upstream for the first time
git push -u origin main

# Push subsequent changes
git push
```

## Fetching and Pulling Changes

- git fetch - Downloads objects and refs (like new branches) from a remote but does not merge them
- git pull - Fetches from a remote and automatically merges the changes into your current branch (git fetch + git merge)
- git pull --rebase - Fetches and then rebases your local commits on top of the remote changes, creating a linear history

```bash
# Fetch changes without merging
git fetch origin

# Fetch and merge changes
git pull

# Fetch and rebase
git pull --rebase
```

> [!INFO] Fetch vs Pull
> git fetch is safer than git pull because it lets you review changes before merging them into your local branch. Use fetch when you want to see what's new without affecting your work.
