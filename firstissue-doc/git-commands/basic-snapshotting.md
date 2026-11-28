---
title: "Basic Snapshotting (The Core Workflow)"
description: "Master the fundamental edit-stage-commit workflow for tracking file changes"
readTime: "8 min read"
updated: "1 day ago"
difficulty: "Beginner"
order: 2
---
This is the fundamental edit-stage-commit workflow for tracking file changes in Git.

## Checking Status and Differences

- git status - Shows the state of your working directory and staging area (tracked/untracked, modified files)
- git diff - Shows unstaged changes since the last commit
- git diff --staged - Shows changes that are staged for the next commit

```bash
# Check what files have changed
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

## Staging Files

- git add <file> - Stages a specific file for the next commit
- git add . or git add -A - Stages all new and changed files

```bash
# Stage a specific file
git add index.html

# Stage all changes
git add .
git add -A
```

## Committing Changes

- git commit -m "message" - Records the staged snapshot to the project history with a message
- git commit --amend - Modifies the most recent commit (e.g., to change its message or add forgotten files)

```bash
# Commit with a message
git commit -m "Add login feature"

# Amend the last commit
git commit --amend -m "Add login feature with validation"
```

## File Operations

- git rm <file> - Removes a file from the working directory and stages the deletion
- git mv <old> <new> - Moves or renames a file and stages the operation
- git restore <file> - Discards unstaged changes in a file, restoring it to its last committed state

```bash
# Remove a file
git rm oldfile.txt

# Rename a file
git mv oldname.txt newname.txt

# Discard changes to a file
git restore index.html
```

> [!WARNING] Be Careful with git restore
> git restore permanently discards your unstaged changes. Make sure you really want to lose those changes before running this command!
