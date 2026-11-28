import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseDocMarkdown, serializeArticleToMarkdown } from "../docMarkdownParser.js";

test("parseDocMarkdown round-trips all 6 block types (heading, paragraph, code, list, callout, diagram)", () => {
  const sample = {
    title: "Sample Guide",
    description: "Testing all blocks",
    readTime: "4 min read",
    updated: "2026-11-28",
    difficulty: "Intermediate",
    content: [
      { type: "heading", level: 2, text: "Overview" },
      { type: "paragraph", text: "Intro paragraph with `inline` code." },
      { type: "callout", variant: "warning", title: "Careful", text: "Always check git status first." },
      { type: "list", ordered: true, items: ["Step one", "Step two"] },
      { type: "list", ordered: false, items: ["Bullet A", "Bullet B"] },
      { type: "code", language: "bash", code: "git status\ngit diff" },
      { type: "diagram", diagramId: "architecture", alt: "Arch", caption: "System overview" },
    ],
  };

  const md = serializeArticleToMarkdown(sample, 2);
  const parsed = parseDocMarkdown(md, "sample-guide");

  assert.equal(parsed.title, "Sample Guide");
  assert.equal(parsed.description, "Testing all blocks");
  assert.equal(parsed.difficulty, "Intermediate");
  assert.equal(parsed.order, 2);
  assert.deepEqual(parsed.content, sample.content);
});

test("every markdown article in firstissue-doc/ parses cleanly with frontmatter and content", () => {
  const docRoot = path.join(process.cwd(), "firstissue-doc");
  assert.ok(fs.existsSync(docRoot), "firstissue-doc/ directory must exist");

  const sections = fs
    .readdirSync(docRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  assert.ok(sections.length >= 11, `Expected >= 11 sections, found ${sections.length}`);

  let totalArticles = 0;
  for (const sec of sections) {
    const secDir = path.join(docRoot, sec);
    assert.ok(
      fs.existsSync(path.join(secDir, "_section.json")),
      `Missing _section.json in ${sec}`
    );

    const mdFiles = fs
      .readdirSync(secDir)
      .filter((f) => f.endsWith(".md") && f.toUpperCase() !== "README.MD");

    assert.ok(mdFiles.length > 0, `Section ${sec} must contain at least one .md file`);

    for (const file of mdFiles) {
      const raw = fs.readFileSync(path.join(secDir, file), "utf-8");
      const parsed = parseDocMarkdown(raw, file.replace(/\.md$/, ""));
      assert.ok(parsed.title && parsed.title.length > 0, `${sec}/${file} missing title`);
      assert.ok(parsed.content.length > 0, `${sec}/${file} has empty content`);
      totalArticles++;
    }
  }

  assert.equal(totalArticles, 33);
});
