---
title: "Website Workflow & System Architecture"
description: "Deep dive into FirstIssue.dev's workflow, system architecture, database design, and backend processing."
readTime: "12 min read"
updated: "today"
difficulty: "Advanced"
order: 1
---
FirstIssue.dev is a developer verification and issue-matching platform that helps contributors ship open-source pull requests while building GitHub-verified portfolios. This guide outlines the platform's workflow, database architecture, and integration with the GitHub API.

## High-Level System Architecture

The platform is built using a modern, serverless architecture that separates the user-facing frontend from sensitive back-end operations. This ensures security when handling users' GitHub OAuth tokens and performing cryptographic operations.

:::diagram architecture
alt: "FirstIssue.dev System Architecture Diagram"
caption: "Figure 1: Serverless topology separating the SPA from Edge Functions, PostgreSQL, and GitHub APIs."
:::

## Core Components

- Frontend Application: Built with Vite, React, Tailwind CSS, and Framer Motion for responsive, keyboard-accessible UI interactions.
- Supabase Backend: Handles user authentication (OAuth via GitHub), database storage, and serves as our API layer.
- Supabase Edge Functions: Serverless JavaScript/TypeScript functions running on Deno. These securely make calls to the GitHub GraphQL/REST APIs, sign Proof of Work credentials, and generate payment webhooks without exposing private tokens to the client.
- GitHub Sync Engine: Periodically fetches pull requests, assignments, and commits from the user's connected GitHub account to build their activity stats.
- Proof of Work (PoW) Verification Engine: Validates that a submitted PR is merged, belongs to the logged-in user, and scores its impact based on repository prestige and codebase diff size.

## Step-by-Step Workflow Behind the Scenes

### 1. Authentication & Syncing

When a user signs in, Supabase handles the OAuth handshake with GitHub. It returns a temporary provider token. The sync engine immediately triggers a secure Supabase Edge Function that uses this provider token to request the user's recent repository contributions.

### 2. Proof of Work Submission

To claim a contribution, a user inputs a merged PR link (e.g., github.com/owner/repo/pull/123). The frontend sends this to our Edge Function. The backend performs the following checks:

1. GitHub API check: Fetches details of the PR using GitHub GraphQL API.
2. Author matching: Validates that the PR author's GitHub ID matches the authenticated user's GitHub ID.
3. Status check: Validates that the PR state is marked as 'MERGED'.
4. Attestation signing: If valid, the engine cryptographically signs a JSON payload proving the contribution.

### 3. MetalCard Generation

Once the attestation is verified and saved to the Supabase database, the client UI is notified. The application renders an interactive 3D MetalCard matching the programming languages detected in the PR. The card can be downloaded as an image using html-to-image conversion, enabling seamless sharing.

## Data Model & Database Design

The data is structured cleanly to support real-time querying and secure validation. The core tables include:

- profiles: Stores user metadata, display name, bio, location, and total impact score.
- contributions: Cached representation of GitHub PRs, issues, and sync statuses.
- attestations: Stores cryptographically signed Proof of Work credentials (SHA-256 verification digests, impact scores).
- supporters: Manages subscription status, payment IDs, and freemium feature limits.

> [!INFO] Security Consideration
> All operations involving the GitHub API are proxied through server-side Edge Functions. This ensures GitHub OAuth provider tokens are never stored long-term in the database or exposed in client browser memory.
