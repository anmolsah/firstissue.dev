# FirstIssue.dev Documentation (`firstissue-doc/`)

Welcome! All developer guides rendered on `https://firstissue.dev/docs` live in this directory as standard **Markdown (`.md`)** files.

If you'd like to fix a typo, improve an explanation, or add a new guide, you don't need to touch any React components—just edit or add a `.md` file here and open a Pull Request.

---

## Directory Structure

```text
firstissue-doc/
  <section-slug>/
    _section.json        # Section title, description, icon, color, and display order
    <article-slug>.md    # Individual guide rendered at /docs/<section-slug>/<article-slug>
```

---

## Adding or Editing an Article

Every `.md` file starts with YAML frontmatter:

```markdown
---
title: "Your Guide Title"
description: "One-line summary shown in search results and at the top of the guide."
readTime: "6 min read"
updated: "2026-11-28"
difficulty: "Beginner" # Beginner | Intermediate | Advanced
order: 1
---

## Section Heading

Regular paragraph text.

- Unordered list item
- Another item

1. Ordered step one
2. Ordered step two

```bash
git status
```
```

### Callouts

Use GitHub-style alert syntax for callouts:

```markdown
> [!INFO] Helpful Context
> Background note rendered in an info callout box.

> [!TIP] Best Practice
> Rendered in an emerald success callout box.

> [!WARNING] Be Careful
> Rendered in an amber warning callout box.

> [!CRITICAL] Destructive Action
> Rendered in a red error/critical callout box.
```

### Technical Diagrams

Embed built-in interactive SVG diagrams using:

```markdown
:::diagram architecture
alt: "System architecture diagram"
caption: "High-level architecture of FirstIssue.dev"
:::
```

---

## Updating FirstMate AI Knowledge Base

FirstMate's RAG pipeline (`scripts/seed_kb.js`) reads directly from `firstissue-doc/`, so merged documentation PRs automatically keep the AI assistant up to date when `npm run seed-kb` is run.

---

## How to Raise a Documentation PR

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/firstissue.dev.git
   cd firstissue.dev
   git checkout -b docs/my-guide-update
   ```
2. **Copy `_template.md`** (for a new guide) into the target section folder `firstissue-doc/<section>/<slug>.md`, or edit an existing `.md` file.
3. **Preview & Verify Locally**:
   ```bash
   npm install
   npm run dev
   node --test src/utils/__tests__/docMarkdownParser.test.js
   ```
4. **Commit & Open a Pull Request**:
   ```bash
   git add firstissue-doc/
   git commit -m "docs(<section>): <short description>"
   git push -u origin docs/my-guide-update
   ```
   Open a PR against `main` on GitHub and select the **Docs PR template** (`.github/PULL_REQUEST_TEMPLATE/docs.md`).

