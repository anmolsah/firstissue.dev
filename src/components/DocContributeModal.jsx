import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  GitPullRequest,
  ExternalLink,
  FileCode2,
  BookOpen,
} from "lucide-react";

const DOC_ARTICLE_TEMPLATE = `---
title: "Your Guide Title"
description: "One-line summary of what the reader will learn."
readTime: "6 min read"
updated: "2026-11-28"
difficulty: "Beginner"
order: 10
---

## Overview

Introduce the topic clearly and explain when a contributor needs it.

> [!INFO] Helpful Context
> Use callouts for key notes, tips (> [!TIP]), warnings (> [!WARNING]), or critical steps (> [!CRITICAL]).

## Step-by-Step Guide

1. First actionable step
2. Second actionable step
3. How to verify the result locally

\`\`\`bash
# Example command with clear flags
git status
\`\`\`

## Common Pitfalls

- Explain what to avoid and how to recover safely.
`;

const DocContributeModal = ({ isOpen, onClose, section, article }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filePath = `firstissue-doc/${section}/${article}.md`;
  const editOnGitHubUrl = `https://github.com/anmolsah/firstissue.dev/edit/main/${filePath}`;
  const docsReadmeUrl = `https://github.com/anmolsah/firstissue.dev/blob/main/firstissue-doc/README.md`;
  const newPrUrl = `https://github.com/anmolsah/firstissue.dev/compare?expand=1&template=docs.md`;

  const branchCmd = `git checkout -b docs/${section}-${article}`;
  const prCommands = `git clone https://github.com/<your-username>/firstissue.dev.git
cd firstissue.dev
${branchCmd}
# Edit ${filePath} (or add a new .md file in firstissue-doc/${section}/)
npm install && npm run dev
node --test src/utils/__tests__/docMarkdownParser.test.js
git add firstissue-doc/
git commit -m "docs(${section}): improve ${article}"
git push -u origin docs/${section}-${article}`;

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contribute-doc-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#141518] border border-[#2B2E36] rounded-[4px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-[#22242A] bg-[#0F0F0F] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[4px] bg-[#17181B] border border-[#2B2E36] flex items-center justify-center text-[#DAFA9C] shrink-0">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="contribute-doc-modal-title"
                className="text-xs font-mono font-bold text-[#F4F4F0] uppercase tracking-wider"
              >
                Contribute to this doc
              </h2>
              <p className="text-[11px] font-mono text-[#8C929C] truncate mt-0.5">
                {filePath}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close contribute dialog"
            className="p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            <a
              href={editOnGitHubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Edit this file on GitHub
            </a>
            <a
              href={docsReadmeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#17181B] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#F4F4F0] rounded-[4px] font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#DAFA9C]" />
              Full Docs Guide
            </a>
            <a
              href={newPrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#17181B] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] font-semibold transition-colors"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-[#34D399]" />
              Open Docs PR
            </a>
          </div>

          {/* Step-by-step PR Guidance */}
          <div className="bg-[#0B0C0E] border border-[#22242A] rounded-[4px] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-mono font-bold text-[#F4F4F0] uppercase tracking-wider text-[11px]">
                How to Raise a PR
              </h3>
              <button
                type="button"
                onClick={() => copyText(prCommands, "pr-cmds")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] rounded-[4px] text-[11px] font-mono text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors cursor-pointer"
              >
                {copiedKey === "pr-cmds" ? (
                  <>
                    <Check className="w-3 h-3 text-[#34D399]" />
                    <span className="text-[#34D399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <ol className="list-decimal pl-4 space-y-1.5 text-[#A8ADB6] leading-relaxed">
              <li>
                <strong className="text-[#F4F4F0]">Fork &amp; branch:</strong> Fork{" "}
                <code className="text-[#DAFA9C] font-mono">anmolsah/firstissue.dev</code> and create a branch like{" "}
                <code className="text-[#DAFA9C] font-mono">docs/{section}-{article}</code>.
              </li>
              <li>
                <strong className="text-[#F4F4F0]">Edit or add Markdown:</strong> Update{" "}
                <code className="text-[#F4F4F0] font-mono">{filePath}</code> or add a new{" "}
                <code className="text-[#F4F4F0] font-mono">.md</code> file inside{" "}
                <code className="text-[#F4F4F0] font-mono">firstissue-doc/{section}/</code>.
              </li>
              <li>
                <strong className="text-[#F4F4F0]">Test locally:</strong> Run{" "}
                <code className="text-[#DAFA9C] font-mono">npm run dev</code> to preview the page and{" "}
                <code className="text-[#DAFA9C] font-mono">node --test src/utils/__tests__/docMarkdownParser.test.js</code>{" "}
                to validate frontmatter and blocks.
              </li>
              <li>
                <strong className="text-[#F4F4F0]">Raise the PR:</strong> Commit with a clear message (e.g.{" "}
                <code className="text-[#F4F4F0] font-mono">docs({section}): improve {article}</code>), push to your fork, and open a PR against <code className="text-[#F4F4F0] font-mono">main</code>.
              </li>
            </ol>

            <pre className="p-3 bg-[#141518] border border-[#22242A] rounded-[4px] font-mono text-[11px] text-[#A8ADB6] overflow-x-auto leading-relaxed">
              <code>{prCommands}</code>
            </pre>
          </div>

          {/* Markdown Article Template */}
          <div className="bg-[#0B0C0E] border border-[#22242A] rounded-[4px] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-mono font-bold text-[#F4F4F0] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-[#DAFA9C]" />
                New Doc Template (firstissue-doc/_template.md)
              </h3>
              <button
                type="button"
                onClick={() => copyText(DOC_ARTICLE_TEMPLATE, "template")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] rounded-[4px] text-[11px] font-mono text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors cursor-pointer"
              >
                {copiedKey === "template" ? (
                  <>
                    <Check className="w-3 h-3 text-[#34D399]" />
                    <span className="text-[#34D399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Template</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-[#141518] border border-[#22242A] rounded-[4px] font-mono text-[11px] text-[#F4F4F0]/90 overflow-x-auto leading-relaxed max-h-56 overflow-y-auto">
              <code>{DOC_ARTICLE_TEMPLATE}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocContributeModal;
