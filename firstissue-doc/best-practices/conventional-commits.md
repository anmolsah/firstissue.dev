---
title: "Conventional Commits Specification"
description: "A detailed guide to the Conventional Commits specification, commit message formatting, standard types, and how to write clean histories"
readTime: "8 min read"
updated: "today"
difficulty: "Beginner"
order: 3
---
Conventional Commits is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history, which makes it easier to write automated tools on top of. By structuring commit messages systematically, teams can automate release notes generation, semantic versioning (major, minor, patch), and build status tracking.

## Commit Message Format

The commit message should be structured as follows:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Standard Commit Types

The type is mandatory and describes the nature of the change. Standard types include:

- feat: A new feature is introduced to the codebase.
- fix: A bug fix is applied to the codebase.
- docs: Documentation-only changes (e.g. updating README, API docs).
- style: Changes that do not affect the meaning of the code (formatting, white-space, missing semi-colons).
- refactor: A code change that neither fixes a bug nor adds a feature, but improves internal structure.
- perf: A code change that improves performance.
- test: Adding missing tests or correcting existing tests.
- chore: Updates to build processes, auxiliary tools, or libraries (e.g. updating node modules).

## Adding Scopes and Descriptions

The scope is an optional noun providing additional contextual information about where the change was made (e.g. feat(auth):, fix(parser):).

The description is a short summary of the code changes. It should be written in the imperative mood (e.g., 'add login button' instead of 'added login button' or 'adds login button').

```text
feat(auth): implement GitHub OAuth authentication flow
fix(landing-page): correct alignment of CTA buttons on mobile devices
docs(api): document query parameters for the search endpoint
```

## Documenting Breaking Changes

Breaking changes indicate that API compatibility has been broken, necessitating a major version bump in semantic versioning. You can specify a breaking change in two ways:

- Add an exclamation mark (!) immediately after the type/scope (e.g., feat(auth)!: remove deprecated password field).
- Add a 'BREAKING CHANGE:' prefix at the beginning of the footer section.

```text
refactor(api)!: remove deprecated v1 search endpoint

We have migrated all clients to the v2 search engine, which provides structured responses.

BREAKING CHANGE: The v1 search endpoint (/api/v1/search) has been completely removed.
```

## Benefits of Conventional Commits

- Automated CHANGELOG generation: Tools like standard-version or release-please parse your commit history to build beautiful lists of changes automatically.
- Semantic Versioning: Automated build systems can automatically bump the package version (major for breaking changes, minor for feat, patch for fix).
- Better collaboration: Clear commit histories make it easy for other developers to scan what has changed and why.

> [!INFO] Git Commit Hooks
> You can enforce Conventional Commits in your local environment using tools like Husky and commitlint. These tools intercept your 'git commit' command and validate the message structure before letting the commit succeed.
