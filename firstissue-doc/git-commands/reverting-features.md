---
title: "Revert the Commit (Undo Feature Safely)"
description: "Learn how to safely undo features in production without breaking Git history"
readTime: "6 min read"
updated: "1 day ago"
difficulty: "Intermediate"
order: 6
---
This keeps Git history clean and is production-safe. When you need to undo a feature that's already been deployed, reverting is the safest approach.

## Step 1: Find the commit where you added the feature

```bash
git log --oneline
```

You'll see something like:

```text
a1b2c3d Add image crop feature
b4c5d6e Fix login bug
c7d8e9f Update documentation
```

## Step 2: Revert that commit

```bash
git revert a1b2c3d
```

This will:

- Create a new commit
- Undo the specific code changes
- Safe for production environments
- Does not rewrite git history

## Step 3: Push to production

```bash
git push origin main
```

> [!TIP] Production Best Practice
> This is standard industry practice for maintaining a linear git log. It maintains a complete history of all changes and is safe for collaborative environments.

## Not Recommended (destructive actions)

### Reset & force push (Only for personal / not-live projects)

Rewriting git history can disrupt collaborative workspaces.

```bash
git reset --hard a1b2c3d~1
git push origin main --force
```

> [!WARNING] Use ONLY if:
> The developer is working independently on a personal branch
> The repository has no other active collaborators
> You need to force-overwrite changes intentionally
> 
> Force pushing rewrites history and can cause serious problems for team members who have already pulled the changes.

## When to Use Each Approach

- Use git revert - Safe for production and shared team branches
- Use git reset --hard - Only for unpushed local experiments
- Default to git revert to maintain complete auditability
