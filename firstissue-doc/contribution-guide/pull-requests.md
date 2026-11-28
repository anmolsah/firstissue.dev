---
title: "Creating Great Pull Requests"
description: "Learn how to write pull requests that get accepted quickly"
readTime: "7 min read"
updated: "5 days ago"
difficulty: "Intermediate"
order: 2
---
A well-written pull request is your chance to clearly communicate your changes and make a great impression on maintainers.

## PR Title Best Practices

- Be specific and descriptive
- Use action verbs (Fix, Add, Update, Remove)
- Reference the issue number if applicable
- Keep it under 50 characters when possible

### Good PR Title Examples

```text
 Fix login button alignment on mobile devices
 Add dark mode toggle to user settings
 Update installation instructions in README
 Remove deprecated API endpoints

 Fixed stuff
 Updates
 Changes to the code
```

## Writing the PR Description

Your PR description should tell the story of your changes:

1. What problem does this solve?
2. How did you solve it?
3. What testing did you do?
4. Are there any breaking changes?
5. Screenshots (for UI changes)

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Changes Made
- List of specific changes
- Another change
- One more change

## Fixes
Closes #123

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] All tests pass

## Screenshots (if applicable)
[Add screenshots here]
```

> [!INFO] Pro Tip
> Use 'Closes #123' or 'Fixes #123' in your PR description to automatically close the related issue when your PR is merged.

## Writing a Detailed Description Body

A pull request description is the primary source of context for code reviewers. While the code changes show what was modified, the description explains why the changes were necessary, the design choices made, and how to verify that the implementation is correct.

- Context and Problem: Explain the root cause of the issue or the user need behind the feature. Why was this code written?
- Technical Approach: Describe your implementation strategy. Highlight non-obvious design choices or structural changes in the codebase.
- Verification Steps: Provide detailed instructions on how a reviewer can manually test your changes in their local environment.
- Impact and Risks: List potential edge cases or side effects that this pull request might introduce (e.g. migration requirements, performance impact).

## Linking Issues with Magic Keywords

GitHub and other hosting providers support automatic issue closing when a pull request is merged. By linking pull requests to issues, you keep project boards organized and ensure clean traceability.

To close an issue automatically, use one of the supported keywords followed by the issue reference in your PR description:

- Keywords: close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved
- Local references (same repository): 'Closes #45'
- Cross-repository references (different repository in the same organization): 'Fixes owner/repo#82'

```markdown
## Linked Issues
This pull request implements the requested feature and solves the bug.

Closes #42
```

## Handling CI/CD Failures

Most professional and open source projects run automated validation pipelines (CI/CD) on every pull request. These checks compile the codebase, run styling checks (linters), and execute test suites. A red status check means your PR cannot be merged yet.

### Step 1: Read the Failure Logs

Go to the bottom of the pull request page on GitHub. Locate the failing check, click 'Details', and view the console output to find the exact file name, line number, and error message.

### Step 2: Run Checks Locally

Do not rely on the CI/CD pipeline to test your fixes. Run the verification commands on your local machine to speed up iteration.

```bash
# Run syntax and code formatting checks
npm run lint

# Run unit and integration tests
npm run test

# Build the production bundle to check for transpilation errors
npm run build
```

### Step 3: Commit and Push the Fix

Once you have resolved the error locally, stage, commit, and push your changes to your feature branch. The pull request will automatically update and restart the CI/CD pipeline.
