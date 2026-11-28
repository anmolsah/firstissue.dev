---
title: "Contributor License Agreements (CLA) & DCO"
description: "Learn why major projects require signed commits (`git commit -s`), EasyCLA, and DCO sign-offs."
readTime: "7 min read"
updated: "today"
difficulty: "Intermediate"
order: 2
---
When you contribute code to an enterprise or foundation-backed open source repository, you will frequently see automated bots requesting a CLA sign-off or DCO commit verification.

## 1. Developer Certificate of Origin (DCO)

Created by the Linux kernel community, DCO is a lightweight legal affirmation that you wrote the code or have the legal right to submit it under the project's license.

```bash
# Sign off on your commit using the -s flag:
git commit -s -m "feat: implement token caching"
```

This automatically appends 'Signed-off-by: Your Name <your.email@example.com>' to the bottom of the commit message.

## 2. How to Fix Missing DCO on Existing Commits

If a DCO bot fails your PR on GitHub, you can sign off on your branch's past commits with an interactive rebase:

```bash
# Re-sign the last 3 commits with your author sign-off:
git rebase --signoff HEAD~3

# Safely push the updated branch to your fork:
git push --force-with-lease origin branch-name
```
