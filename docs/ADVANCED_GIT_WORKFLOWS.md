# Advanced Git Workflows, Clean History & Collaboration Mastery

A deep-dive technical reference guide for developers looking to master Git beyond the basics.

---

## 1. Interactive Rebase (`git rebase -i`)

### Purpose
Interactive rebase is used to clean up your local commit history before opening or updating a Pull Request. It allows you to squash noisy WIP commits, edit commit messages, drop obsolete commits, and reorder changes.

### Common Commands:
```bash
# Rebase the last 4 commits on your current branch
git rebase -i HEAD~4

# Rebase your branch against the latest upstream main
git fetch upstream
git rebase -i upstream/main
```

### Interactive Rebase Commands in Editor:
- `pick (p)`: Use commit as is.
- `reword (r)`: Keep commit content, but rewrite the commit message.
- `edit (e)`: Pause rebase to amend files or commits.
- `squash (s)`: Meld commit into previous commit; keep both commit messages for editing.
- `fixup (f)`: Meld commit into previous commit; discard this commit's log message.
- `drop (d)`: Remove commit entirely.

### Example: Squashing 3 Commits into One
```text
pick a1b2c3d feat(auth): add google oauth provider
squash d4e5f6g fix typo in auth config
fixup h7i8j9k remove debug logs
```
Save and close the editor. Git will squash all changes into the first commit.

---

## 2. Fork Syncing & Remote Management

### Setting Up Remotes:
When contributing to open source, you work on your fork (`origin`) and track the parent repository (`upstream`):
```bash
# Verify existing remotes
git remote -v

# Add the parent repo as upstream
git remote add upstream https://github.com/original-owner/project.git

# Verify upstream is added
git remote -v
# origin   https://github.com/your-username/project.git (fetch)
# origin   https://github.com/your-username/project.git (push)
# upstream https://github.com/original-owner/project.git (fetch)
# upstream https://github.com/original-owner/project.git (push)
```

### Clean Fork Sync Workflow:
```bash
# 1. Fetch latest changes from upstream
git fetch upstream

# 2. Switch to your local main branch
git checkout main

# 3. Fast-forward your main to match upstream/main
git merge --ff-only upstream/main

# 4. Push updated main to your GitHub fork
git push origin main

# 5. Update your feature branch with upstream changes
git checkout feat/my-cool-feature
git rebase upstream/main

# 6. Push rebased branch safely
git push --force-with-lease origin feat/my-cool-feature
```

> **Caution**: Always use `--force-with-lease` instead of raw `--force`. If someone else (or a GitHub action) pushed a commit to the remote branch in the meantime, `--force-with-lease` halts and protects against accidental overwriting.

---

## 3. Git Stash & Git Worktrees

### Git Stashing Mastery:
```bash
# Stash tracked and untracked changes with a descriptive message
git stash push -u -m "wip: auth navbar integration"

# View all saved stashes
git stash list

# Inspect what is inside a specific stash without applying it
git stash show -p stash@{0}

# Apply and remove the stash from the stash stack
git stash pop

# Apply a specific stash while keeping it in the stack
git stash apply stash@{1}

# Drop a specific stash
git stash drop stash@{0}
```

### Git Worktrees: Multitasking Without Stashing
Worktrees let you check out multiple branches of the same repository in separate local directories simultaneously.
```bash
# Add a new worktree in a sibling folder on a new branch
git worktree add ../project-hotfix -b hotfix/critical-bug

# Switch to that directory and work independently
cd ../project-hotfix
npm install
npm test

# List all active worktrees
git worktree list

# When done, delete the folder and prune the worktree
git worktree remove ../project-hotfix
```

---

## 4. Git Reflog: The Time Machine for Lost Commits

Git never immediately deletes commits. If you accidentally ran `git reset --hard` or deleted a branch by mistake, `git reflog` records every HEAD movement.

```bash
# View the log of all HEAD movements
git reflog

# Output example:
# 1a2b3c4 HEAD@{0}: reset: moving to HEAD~1
# 5d6e7f8 HEAD@{1}: commit: feat: awesome feature that got deleted
# 9g0h1i2 HEAD@{2}: checkout: moving from main to feature

# Recover the lost commit into a new rescue branch
git checkout -b rescue-branch 5d6e7f8
```

---

## 5. Git Bisect: Automated Bug Hunting

When a bug exists in the current version, but you know it worked 50 commits ago:
```bash
# Start bisect session
git bisect start

# Mark current state as broken
git bisect bad

# Mark a known working commit from the past
git bisect good v1.4.0

# Git checks out the midpoint commit automatically.
# Test your application, then tell Git:
git bisect good   # If the bug is not present
# OR
git bisect bad    # If the bug is present

# Repeat until Git pinpoints the exact commit that introduced the bug!
# End the bisect session and return to your original branch:
git bisect reset
```
