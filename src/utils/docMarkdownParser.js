/**
 * Pure Markdown + YAML-frontmatter parser and serializer for `firstissue-doc/`.
 * Works identically in Vite (browser bundle) and Node.js (`scripts/seed_kb.js`).
 */

const CALLOUT_TAG_TO_VARIANT = {
  INFO: "info",
  NOTE: "info",
  TIP: "success",
  SUCCESS: "success",
  WARNING: "warning",
  CAUTION: "warning",
  ERROR: "error",
  CRITICAL: "error",
};

const VARIANT_TO_CALLOUT_TAG = {
  info: "INFO",
  success: "TIP",
  warning: "WARNING",
  error: "CRITICAL",
};

function stripQuotes(val) {
  const s = String(val ?? "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\"/g, '"');
  }
  return s;
}

/**
 * Parses YAML-like frontmatter (`--- ... ---`) at the top of a doc Markdown file.
 */
export function parseFrontmatter(raw) {
  const normalized = String(raw ?? "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: normalized };
  }

  const meta = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    const rawVal = trimmed.slice(colonIdx + 1).trim();
    const val = stripQuotes(rawVal);
    if (key === "order") {
      const n = Number(val);
      meta[key] = Number.isFinite(n) ? n : 999;
    } else {
      meta[key] = val;
    }
  }

  return { meta, body: match[2] };
}

/**
 * Parses a `firstissue-doc/<section>/<article>.md` file into the block-based
 * article object consumed by `DocsArticlePage.jsx` and `scripts/seed_kb.js`.
 */
export function parseDocMarkdown(rawMarkdown, fallbackId = "") {
  const { meta, body } = parseFrontmatter(rawMarkdown);
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const content = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced code block: ```lang ... ```
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "text";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }
      content.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Diagram block: :::diagram <diagramId> ... :::
    if (trimmed.startsWith(":::diagram")) {
      const headerId = trimmed.slice(":::diagram".length).trim();
      const diagramProps = {
        type: "diagram",
        diagramId: headerId || "",
        alt: "",
        caption: "",
      };
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const propLine = lines[i].trim();
        const colonIdx = propLine.indexOf(":");
        if (colonIdx !== -1) {
          const pKey = propLine.slice(0, colonIdx).trim();
          const pVal = stripQuotes(propLine.slice(colonIdx + 1).trim());
          if (pKey === "diagramId" || pKey === "id") diagramProps.diagramId = pVal;
          else if (pKey === "alt") diagramProps.alt = pVal;
          else if (pKey === "caption") diagramProps.caption = pVal;
        }
        i++;
      }
      if (i < lines.length && lines[i].trim() === ":::") {
        i++;
      }
      if (diagramProps.diagramId) {
        content.push(diagramProps);
      }
      continue;
    }

    // 3. Heading (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(4, Math.max(2, headingMatch[1].length));
      content.push({
        type: "heading",
        level,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 4. Callout block: > [!INFO] Title \n > body...
    const calloutMatch = trimmed.match(/^>\s*\[!([A-Za-z]+)\]\s*(.*)$/);
    if (calloutMatch) {
      const tag = calloutMatch[1].toUpperCase();
      const variant = CALLOUT_TAG_TO_VARIANT[tag] || "info";
      const title = calloutMatch[2].trim();
      const bodyLines = [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        bodyLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      content.push({
        type: "callout",
        variant,
        title,
        text: bodyLines.join(" ").trim(),
      });
      continue;
    }

    // 5. Ordered list (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      content.push({
        type: "list",
        ordered: true,
        items,
      });
      continue;
    }

    // 6. Unordered list (- item or * item)
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      content.push({
        type: "list",
        ordered: false,
        items,
      });
      continue;
    }

    // 7. Paragraph (collect consecutive non-special lines)
    const paraLines = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (
        !cur ||
        cur.startsWith("```") ||
        cur.startsWith(":::diagram") ||
        /^#{1,4}\s+/.test(cur) ||
        /^>\s*\[![A-Za-z]+\]/.test(cur) ||
        /^\d+\.\s+/.test(cur) ||
        /^[-*]\s+/.test(cur)
      ) {
        break;
      }
      paraLines.push(cur);
      i++;
    }
    if (paraLines.length > 0) {
      content.push({
        type: "paragraph",
        text: paraLines.join(" "),
      });
    }
  }

  return {
    title: meta.title || fallbackId || "Untitled Guide",
    description: meta.description || "",
    readTime: meta.readTime || "5 min read",
    updated: meta.updated || "recently",
    difficulty: meta.difficulty || "Beginner",
    order: typeof meta.order === "number" ? meta.order : 999,
    content,
  };
}

function escapeYaml(val) {
  return `"${String(val ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Serializes an article object (from legacy `docContent.js`) into clean Markdown
 * with YAML frontmatter for `firstissue-doc/`.
 */
export function serializeArticleToMarkdown(article, order = 1) {
  const fmLines = [
    "---",
    `title: ${escapeYaml(article.title || "")}`,
    `description: ${escapeYaml(article.description || "")}`,
    `readTime: ${escapeYaml(article.readTime || "5 min read")}`,
    `updated: ${escapeYaml(article.updated || "recently")}`,
    `difficulty: ${escapeYaml(article.difficulty || "Beginner")}`,
    `order: ${order}`,
    "---",
    "",
  ];

  const blocks = (article.content || []).map((block) => {
    switch (block.type) {
      case "heading": {
        const hashes = "#".repeat(Math.min(4, Math.max(2, block.level || 2)));
        return `${hashes} ${block.text}`;
      }
      case "paragraph":
        return block.text;
      case "code": {
        const lang = block.language || "text";
        // Use 4 backticks if code itself contains triple backticks
        const fence = String(block.code || "").includes("```") ? "````" : "```";
        return `${fence}${lang}\n${block.code}\n${fence}`;
      }
      case "list": {
        return (block.items || [])
          .map((item, idx) => (block.ordered ? `${idx + 1}. ${item}` : `- ${item}`))
          .join("\n");
      }
      case "callout": {
        const tag = VARIANT_TO_CALLOUT_TAG[block.variant] || "INFO";
        const bodyLines = String(block.text || "")
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n");
        return `> [!${tag}] ${block.title || ""}\n${bodyLines}`;
      }
      case "diagram": {
        const lines = [`:::diagram ${block.diagramId}`];
        if (block.alt) lines.push(`alt: ${escapeYaml(block.alt)}`);
        if (block.caption) lines.push(`caption: ${escapeYaml(block.caption)}`);
        lines.push(":::");
        return lines.join("\n");
      }
      default:
        return block.text || "";
    }
  });

  return `${fmLines.join("\n")}${blocks.join("\n\n")}\n`;
}
