---
title: "Common Beginner Issues"
description: "Solutions to the most frequent problems new contributors face"
readTime: "8 min read"
updated: "3 days ago"
difficulty: "Beginner"
order: 1
---
Every new contributor faces similar challenges. Here are the most common issues and how to solve them quickly.

## Git and GitHub Issues

### Problem: 'Permission denied' when pushing

This usually means you're trying to push to the original repository instead of your fork.

```bash
# Check your remote URLs
git remote -v

# Should show your fork, not the original repo
# If wrong, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/project-name.git
```

### Problem: Merge conflicts

When your branch conflicts with changes in the main branch:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Rebase your feature branch
git checkout your-feature-branch
git rebase main

# Resolve conflicts in your editor, then:
git add .
git rebase --continue
```

## Project Setup Issues

### Problem: Dependencies won't install

1. Check if you have the right Node.js/Python version
2. Clear your package manager cache
3. Delete node_modules or virtual environment and reinstall
4. Check the project's README for specific requirements

```bash
# For Node.js projects
npm cache clean --force
rm -rf node_modules
npm install

# For Python projects
pip cache purge
rm -rf venv
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## Communication Issues

### Problem: No response from maintainers

- Wait at least 3-5 days before following up
- Check if the project is actively maintained
- Look for alternative communication channels (Discord, Slack)
- Consider contributing to a more active project

> [!INFO] Patience is Key
> Remember that most maintainers are volunteers with day jobs. Give them time to respond, especially on weekends and holidays.
