---
title: "Resolving Git Merge Conflicts"
description: "A comprehensive, step-by-step guide to understanding conflict markers, choosing merge vs rebase, and using tools to resolve conflicts"
readTime: "12 min read"
updated: "today"
difficulty: "Intermediate"
order: 7
---
Merge conflicts occur when Git cannot automatically determine how to merge two sets of changes. This typically happens when two developers modify the same lines in the same file on different branches, or when one developer deletes a file that another developer is modifying. Resolving conflicts is a normal part of developer workflow.

## Understanding Git Conflict Markers

When a conflict occurs during a merge or rebase, Git suspends the process and writes conflict markers directly into the affected files. You must open these files and manually decide which changes to keep.

```text
<<<<<<< HEAD
This is the content on your current active branch (e.g. your feature branch).
=======
This is the content on the incoming branch you are merging (e.g. main/master).
>>>>>>> main
```

- <<<<<<< HEAD - Marks the beginning of the conflicting changes on your current active branch (the HEAD branch).
- ======= - The separator line dividing your local changes from the incoming changes.
- >>>>>>> [branch-name] - Marks the end of the incoming changes, showing the name of the branch the changes came from.

## Step-by-Step Resolution Process

Follow this systematic workflow to resolve conflicts safely and verify that the application still works correctly.

1. Identify the conflicting files: Run 'git status' to see the list of files marked as 'both modified'.
2. Open the conflicting files in your editor: Look for the conflict markers (<<<<<<<, =======, >>>>>>>).
3. Analyze the changes: Decide whether to keep your branch's changes, keep the incoming changes, or combine both in a new way.
4. Remove the markers: Edit the file to delete the conflict markers (<<<<<<<, =======, >>>>>>>) and leave only the desired code.
5. Test the codebase: Run the compiler, linters, or test suite to ensure the resolution did not introduce syntax errors or broken functionality.
6. Stage the resolved files: Run 'git add <filename>' to mark each resolved file as staged.
7. Complete the merge or rebase operation: Run 'git commit' (for merges) or 'git rebase --continue' (for rebases).

### Resolution CLI Walkthrough

```bash
# 1. Check which files are in conflict
git status

# 2. (Manual Edit in VS Code / Editor to resolve the code and remove markers)

# 3. Stage the resolved file
git add src/components/Header.jsx

# 4. Complete the merge
git commit -m "Merge branch 'main' and resolve conflicts in Header"

# Alternatively, if you were rebasing:
# git rebase --continue
```

## Merge vs Rebase: Handling Conflicts

The strategy you choose to update your branch determines how conflicts are presented and recorded in your repository history.

### Merging Main into Your Feature Branch

Merging is non-destructive. It preserves history by creating a new 'merge commit' that connects your branch history with the main branch. Any conflicts are resolved in a single step during this merge commit.

```bash
# Switch to your feature branch
git checkout feature-branch

# Merge main into it
git merge main

# Resolve conflicts, git add, then:
git commit -m "Merge main into feature-branch"
```

### Rebasing Your Feature Branch on Main

Rebasing rewrites history by moving your feature branch commits on top of the target branch. If there are conflicts, Git pauses at each commit that has conflicts. You must resolve conflicts commit-by-commit, which can be repetitive but results in a clean, linear commit history without merge commits.

```bash
# Switch to your feature branch
git checkout feature-branch

# Rebase on top of main
git rebase main

# For each conflict pause: resolve, stage, then:
git rebase --continue

# If it gets too messy, abort the rebase:
git rebase --abort
```

## Using Conflict Resolution Tools

Resolving conflicts manually in raw text files can be error-prone. Modern development tools simplify this process.

- Visual Studio Code: Offers a built-in interactive diff editor with 'Accept Current Change', 'Accept Incoming Change', and 'Compare Changes' buttons directly above the conflict markers.
- Git Mergetool: Launches external visual diff tools like KDiff3, Meld, or Beyond Compare. Configure Git to use a specific tool with: git config --global merge.tool meld.
- Three-Way Merges: Visualizes the base file (the last shared commit), the local changes, and the remote changes side-by-side to understand exactly how the codebase evolved.

> [!WARNING] Aborting in Case of Mistakes
> If you feel overwhelmed or make a mistake during conflict resolution, you can safely abort the process and return to the pre-conflict state: git merge --abort or git rebase --abort.
