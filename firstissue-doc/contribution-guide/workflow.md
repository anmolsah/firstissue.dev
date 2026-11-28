---
title: "Open Source Contribution Workflow"
description: "Master the standard workflow for contributing to open source projects"
readTime: "10 min read"
updated: "1 day ago"
difficulty: "Beginner"
order: 1
---
Every open source contribution follows a similar workflow. Understanding this process will make you a confident contributor to any project.

## The Complete Workflow

1. Find an issue on FirstIssue.dev
2. Read the issue description and project guidelines
3. Comment on the issue to express interest
4. Fork the repository to your GitHub account
5. Clone your fork to your local machine
6. Create a new branch for your changes
7. Make your changes and test them
8. Commit your changes with a clear message
9. Push your branch to your fork
10. Create a Pull Request to the original repository
11. Respond to feedback and make requested changes
12. Track and monitor your pull request until it is merged.

## Step-by-Step Example

Let's walk through a real example of contributing to a project:

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/awesome-project.git
cd awesome-project

# 2. Create a new branch for your feature
git checkout -b fix-typo-in-readme

# 3. Make your changes (edit files)
# Fix the typo in README.md

# 4. Stage and commit your changes
git add README.md
git commit -m "Fix typo in installation instructions"

# 5. Push your branch to your fork
git push origin fix-typo-in-readme
```

After pushing, GitHub will show you a button to create a Pull Request. Click it and fill out the PR template with details about your changes.

> [!TIP] Best Practice
> Always create a new branch for each contribution. Never work directly on the main branch!

## Collaborative Development Models

In professional software engineering, there are two primary methods for managing code contributions: the Fork and Pull model and the Shared Repository model.

### The Fork and Pull Model

Used by default in open source projects. Since you do not have write access to the original codebase (the upstream repository), you create a personal copy (a fork) under your own GitHub account. You write code in your fork and submit a pull request, requesting that the upstream maintainers pull your changes into the main repository. This model protects public repositories from unauthorized or malicious changes.

### The Shared Repository Model

Common in corporate settings and small startup teams. All contributors have write access to a single, shared repository. Instead of forking, developers clone the main repository directly, create feature branches, and submit pull requests. Access control is maintained using GitHub branch protection rules, which restrict direct pushes to main/master branches and require automated checks or code reviews before merging.

## Managing Remotes: Origin vs Upstream

When working with a forked repository, Git needs to know about two different remote versions of the codebase. These are tracked using remotes, which are simply aliases for repository URLs.

- origin: Points to your personal fork of the repository on GitHub. You have full write (push) access here.
- upstream: Points to the original repository owned by the organization or project creator. You only have read access here.

### Syncing Your Fork with Upstream Changes

As other developers merge changes into the upstream repository, your local clone and remote fork will fall behind. To keep your project up to date, you must sync your repository regularly.

```bash
# 1. Add the upstream remote (only needed once after cloning)
git remote add upstream https://github.com/original-owner/original-repo.git

# 2. Verify both remotes are registered
git remote -v

# 3. Switch to your local main branch
git checkout main

# 4. Fetch the latest changes from upstream
git fetch upstream

# 5. Merge upstream changes into your local main branch
git merge upstream/main

# 6. Push the updated main branch to your remote fork (origin)
git push origin main
```

> [!INFO] Rebasing Feature Branches
> If you have an active feature branch and main has updated, do not merge main into your branch. Instead, rebase your feature branch on top of upstream/main: git checkout feature-branch && git rebase upstream/main. This keeps Git history clean and linear.
