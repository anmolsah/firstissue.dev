import {
  Zap,
  Users,
  Terminal,
  AlertTriangle,
  Code,
  GitBranch,
  Award,
  ShieldCheck,
  GitMerge,
  Cpu,
  BookOpen,
  FileText,
} from "lucide-react";
import { parseDocMarkdown } from "../utils/docMarkdownParser";

const ICON_MAP = {
  Zap,
  Users,
  Terminal,
  AlertTriangle,
  Code,
  GitBranch,
  Award,
  ShieldCheck,
  GitMerge,
  Cpu,
  BookOpen,
  FileText,
};

const sectionMetaModules = import.meta.glob("../../firstissue-doc/**/_section.json", {
  eager: true,
  import: "default",
});

const articleMarkdownModules = import.meta.glob("../../firstissue-doc/*/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function buildDocsCatalog() {
  const sectionsBySlug = {};

  // 1. Load section metadata from _section.json
  for (const [filePath, meta] of Object.entries(sectionMetaModules)) {
    const match = filePath.match(/firstissue-doc\/([^/]+)\/_section\.json$/);
    if (!match) continue;
    const sectionSlug = match[1];
    sectionsBySlug[sectionSlug] = {
      id: sectionSlug,
      title: meta?.title || sectionSlug,
      description: meta?.description || "",
      icon: ICON_MAP[meta?.icon] || FileText,
      color: meta?.color || "text-[#DAFA9C]",
      order: typeof meta?.order === "number" ? meta.order : 999,
      articles: [],
    };
  }

  // 2. Parse each Markdown article into its section
  for (const [filePath, rawMarkdown] of Object.entries(articleMarkdownModules)) {
    const match = filePath.match(/firstissue-doc\/([^/]+)\/([^/]+)\.md$/);
    if (!match) continue;
    const [, sectionSlug, articleSlug] = match;
    if (articleSlug.toUpperCase() === "README") continue;

    if (!sectionsBySlug[sectionSlug]) {
      sectionsBySlug[sectionSlug] = {
        id: sectionSlug,
        title: sectionSlug,
        description: "",
        icon: FileText,
        color: "text-[#DAFA9C]",
        order: 999,
        articles: [],
      };
    }

    const parsed = parseDocMarkdown(rawMarkdown, articleSlug);
    sectionsBySlug[sectionSlug].articles.push({
      id: articleSlug,
      ...parsed,
    });
  }

  // 3. Sort sections & articles by `order` and build both `docContent` and `docSections`
  const sortedSections = Object.values(sectionsBySlug).sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title)
  );

  const contentMap = {};
  const sectionsList = [];

  for (const sec of sortedSections) {
    sec.articles.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

    const sectionObj = {
      title: sec.title,
      icon: sec.icon,
      color: sec.color,
    };

    const summaryArticles = [];
    for (const art of sec.articles) {
      const { id, order: _order, ...articleData } = art;
      sectionObj[id] = articleData;
      summaryArticles.push({
        id,
        title: art.title,
        readTime: String(art.readTime || "5 min").replace(/\s*read$/i, ""),
      });
    }

    contentMap[sec.id] = sectionObj;
    sectionsList.push({
      id: sec.id,
      title: sec.title,
      icon: sec.icon,
      color: sec.color,
      description: sec.description,
      articles: summaryArticles,
    });
  }

  return { docContent: contentMap, docSections: sectionsList };
}

const { docContent, docSections } = buildDocsCatalog();

export { docContent, docSections };
