import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Link2,
} from "lucide-react";
import Footer from "../components/Footer";
import TechnicalDiagram from "../components/diagrams/TechnicalDiagrams";
import { docContent } from "../data/docContent";
import { supabase } from "../lib/supabase";

const DocsArticlePage = () => {
  const { section, article } = useParams();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeId, setActiveId] = useState("");

  const currentArticle = docContent[section]?.[article];
  const sectionData = docContent[section];

  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
  };

  const [vote, setVote] = useState(null);
  const [votingType, setVotingType] = useState(null);
  const [voteStats, setVoteStats] = useState({ up: 0, down: 0 });

  const articleId = `${section}/${article}`;

  useEffect(() => {
    setVote(null);
    setVoteStats({ up: 0, down: 0 });
    setVotingType(null);

    fetchVotes();
    const savedVote = localStorage.getItem(`docs-vote-${articleId}`);
    if (savedVote) setVote(savedVote);
  }, [articleId]);

  useEffect(() => {
    if (currentArticle) {
      document.title = `${currentArticle.title} | FirstIssue.dev Docs`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          currentArticle.description ||
            `Read about ${currentArticle.title} on the FirstIssue.dev developer guides.`,
        );
      }
    }
  }, [currentArticle]);

  useEffect(() => {
    if (location.hash && currentArticle) {
      const timer = setTimeout(() => {
        const id = decodeURIComponent(location.hash.replace("#", ""));
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location.hash, currentArticle]);

  useEffect(() => {
    if (!currentArticle) return;

    const h2s = currentArticle.content.filter(
      (block) => block.type === "heading" && block.level === 2,
    );

    if (h2s.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 },
    );

    h2s.forEach((heading) => {
      const id = heading.text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentArticle]);

  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from("docs_feedback")
        .select("vote_type")
        .eq("article_id", articleId);

      if (error) throw error;

      const stats = data.reduce(
        (acc, curr) => {
          if (curr.vote_type === "up") acc.up++;
          if (curr.vote_type === "down") acc.down++;
          return acc;
        },
        { up: 0, down: 0 },
      );
      setVoteStats(stats);
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const handleVote = async (type) => {
    if (votingType) return;
    setVotingType(type);

    try {
      const { error } = await supabase
        .from("docs_feedback")
        .insert([{ article_id: articleId, vote_type: type }]);

      if (error) throw error;

      setVote(type);
      localStorage.setItem(`docs-vote-${articleId}`, type);
      fetchVotes();
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setVotingType(null);
    }
  };

  const getDynamicUpdatedDate = (staticDate) => {
    const now = new Date();
    if (staticDate?.includes("day")) {
      const days = parseInt(staticDate) || 1;
      now.setDate(now.getDate() - days);
    } else if (staticDate?.includes("week")) {
      const weeks = parseInt(staticDate) || 1;
      now.setDate(now.getDate() - weeks * 7);
    }

    return now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!currentArticle) {
    return (
      <main className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4 text-[#F4F4F0]">
        <div className="text-center max-w-md p-8 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
          <h1 className="text-2xl font-bold text-[#F4F4F0] mb-3 text-balance">
            Article Not Found
          </h1>
          <p className="text-sm text-[#A8ADB6] mb-6 text-pretty">
            The documentation article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            to="/docs"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors"
          >
            Back to Documentation
          </Link>
        </div>
      </main>
    );
  }

  const CodeBlock = ({ children, language = "bash", id }) => (
    <div className="relative border border-[#2B2E36] bg-[#0B0C0E] rounded-[4px] overflow-hidden my-6 w-full max-w-full">
      <div className="flex items-center justify-between bg-[#141518] px-4 py-2 border-b border-[#22242A]">
        <span className="text-xs text-[#8C929C] font-mono uppercase tracking-wider">
          {language}
        </span>
        <button
          type="button"
          onClick={() => copyToClipboard(children, id)}
          aria-label={`Copy ${language} snippet`}
          className="flex items-center gap-1.5 text-xs font-mono text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors py-0.5 px-2 bg-[#17181B] border border-[#2B2E36] rounded-[4px] cursor-pointer"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-3 h-3 text-[#34D399]" />
              <span className="text-[#34D399] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-[13px] text-[#F4F4F0] leading-relaxed bg-[#0B0C0E] w-full max-w-full">
        <code className="block w-full overflow-x-auto">{children}</code>
      </pre>
    </div>
  );

  const h2Headings = currentArticle.content.filter(
    (block) => block.type === "heading" && block.level === 2,
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] overflow-x-hidden text-[#F4F4F0] font-sans">
      {/* Header */}
      <header className="border-b border-[#22242A] bg-[#0F0F0F] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#A8ADB6] min-w-0 overflow-hidden font-mono">
            <Link
              to="/docs"
              aria-label="Documentation home"
              className="hover:text-[#DAFA9C] transition-colors shrink-0 inline-flex items-center"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
            <ChevronRight className="w-3 h-3 text-[#8C929C] shrink-0" />
            <Link
              to="/docs"
              className="hover:text-[#F4F4F0] transition-colors hidden sm:inline-block"
            >
              Docs
            </Link>
            <ChevronRight className="w-3 h-3 text-[#8C929C] shrink-0 hidden sm:inline-block" />
            <Link
              to={`/docs/${section}`}
              className="hover:text-[#F4F4F0] transition-colors inline-block truncate max-w-[150px]"
            >
              {sectionData?.title}
            </Link>
            <ChevronRight className="w-3 h-3 text-[#8C929C] shrink-0" />
            <span className="text-[#F4F4F0] font-medium truncate max-w-[260px]">
              {currentArticle.title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] hover:bg-[#17181B] transition-colors shrink-0 -mr-2 cursor-pointer"
            aria-label="Toggle documentation menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8 justify-between">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/75 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar (Left Column) */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 lg:z-0
              w-64 shrink-0
              bg-[#0F0F0F] lg:bg-transparent
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              overflow-y-auto lg:overflow-visible
              border-r border-[#22242A] lg:border-0
            `}
          >
            <div className="lg:sticky lg:top-24 p-6 lg:p-0">
              <Link
                to="/docs"
                className="flex items-center gap-2 text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors mb-6 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Docs</span>
              </Link>

              {sectionData && (
                <div className="space-y-2">
                  <div className="px-2.5 py-1 text-xs font-mono font-semibold text-[#8C929C] uppercase tracking-wider">
                    {sectionData.title}
                  </div>
                  <nav aria-label="Section articles" className="space-y-1">
                    {Object.entries(docContent[section] || {}).map(
                      ([key, articleData]) => {
                        if (key === "title" || key === "icon" || key === "color") {
                          return null;
                        }

                        const isCurrent = key === article;
                        return (
                          <Link
                            key={key}
                            to={`/docs/${section}/${key}`}
                            onClick={() => setSidebarOpen(false)}
                            aria-current={isCurrent ? "page" : undefined}
                            className={`block px-2.5 py-1.5 text-xs rounded-[4px] transition-colors border ${
                              isCurrent
                                ? "text-[#DAFA9C] bg-[#17181B] border-[#DAFA9C]/50 font-semibold"
                                : "text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#141518] border-transparent hover:border-[#2B2E36]"
                            }`}
                          >
                            {articleData.title}
                          </Link>
                        );
                      },
                    )}
                  </nav>
                </div>
              )}
            </div>
          </aside>

          {/* Main Article Container (Center Column) */}
          <main className="flex-1 min-w-0 max-w-[740px] mx-auto lg:mx-0 w-full overflow-hidden">
            <article>
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 font-mono">
                  <span className="text-xs text-[#DAFA9C] font-semibold uppercase tracking-wider px-2.5 py-0.5 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
                    {sectionData?.title}
                  </span>
                  <span className="text-[#3A3E48]">·</span>
                  <span className="text-xs text-[#8C929C] font-medium">
                    {currentArticle.readTime}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F0] tracking-tight mb-3 text-balance">
                  {currentArticle.title}
                </h1>

                {currentArticle.description && (
                  <p className="text-base sm:text-lg text-[#A8ADB6] mb-6 max-w-[54ch] leading-relaxed text-pretty">
                    {currentArticle.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#8C929C] font-mono pb-6 border-b border-[#22242A]">
                  <span>Updated {getDynamicUpdatedDate(currentArticle.updated)}</span>
                  {currentArticle.difficulty && (
                    <>
                      <span className="text-[#3A3E48]">·</span>
                      <span
                        className={`px-2 py-0.5 rounded-[4px] text-xs font-semibold border ${
                          currentArticle.difficulty === "Beginner"
                            ? "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]"
                            : currentArticle.difficulty === "Intermediate"
                              ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                              : "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]"
                        }`}
                      >
                        {currentArticle.difficulty}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Article Content */}
              <div className="max-w-none w-full break-words">
                {currentArticle.content.map((block, index) => {
                  switch (block.type) {
                    case "heading": {
                      const HeadingTag = `h${block.level}`;
                      const headingId =
                        block.level === 2
                          ? block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                          : undefined;
                      return (
                        <div
                          key={index}
                          className={`group relative flex items-center gap-2 ${
                            block.level === 2
                              ? "mt-9 mb-4 border-b border-[#22242A] pb-2"
                              : block.level === 3
                                ? "mt-6 mb-3"
                                : "mt-4 mb-2"
                          }`}
                        >
                          <HeadingTag
                            id={headingId}
                            className={`font-bold text-[#F4F4F0] scroll-mt-24 text-balance ${
                              block.level === 2
                                ? "text-2xl"
                                : block.level === 3
                                  ? "text-xl"
                                  : "text-lg"
                            }`}
                          >
                            {block.text}
                          </HeadingTag>
                          {block.level === 2 && headingId && (
                            <a
                              href={`#${headingId}`}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-[#8C929C] hover:text-[#DAFA9C] transition-opacity p-1"
                              aria-label={`Copy anchor link to ${block.text}`}
                            >
                              <Link2 className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    }

                    case "paragraph":
                      return (
                        <p
                          key={index}
                          className="text-[#F4F4F0]/90 mb-4 leading-[1.7] text-base max-w-[54ch] break-words text-pretty"
                        >
                          {block.text}
                        </p>
                      );

                    case "code":
                      return (
                        <div key={index} className="mb-6 w-full max-w-full overflow-hidden">
                          <CodeBlock language={block.language} id={`code-${index}`}>
                            {block.code}
                          </CodeBlock>
                        </div>
                      );

                    case "list": {
                      const ListTag = block.ordered ? "ol" : "ul";
                      return (
                        <ListTag
                          key={index}
                          className={`mb-5 space-y-2 max-w-[54ch] ${
                            block.ordered ? "list-decimal pl-5" : "list-disc pl-5"
                          } text-base`}
                        >
                          {block.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-[#F4F4F0]/90 pl-1 break-words leading-[1.65] text-pretty"
                            >
                              {item}
                            </li>
                          ))}
                        </ListTag>
                      );
                    }

                    case "callout": {
                      const variantStyles =
                        block.variant === "warning"
                          ? "border-[#F59E0B]/40 bg-[#F59E0B]/5 text-[#F59E0B]"
                          : block.variant === "error"
                            ? "border-[#F87171]/40 bg-[#F87171]/5 text-[#F87171]"
                            : block.variant === "success"
                              ? "border-[#34D399]/40 bg-[#34D399]/5 text-[#34D399]"
                              : "border-[#DAFA9C]/40 bg-[#DAFA9C]/5 text-[#DAFA9C]";

                      const tagLabel =
                        block.variant === "warning"
                          ? "CAUTION"
                          : block.variant === "error"
                            ? "CRITICAL"
                            : block.variant === "success"
                              ? "TIP"
                              : "NOTE";

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-[4px] border mb-6 max-w-[56ch] ${variantStyles}`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider">
                              [{tagLabel}]
                            </span>
                            <p className="font-semibold text-[#F4F4F0] text-sm break-words">
                              {block.title}
                            </p>
                          </div>
                          <p className="text-sm text-[#A8ADB6] leading-relaxed max-w-[50ch] break-words text-pretty">
                            {block.text}
                          </p>
                        </div>
                      );
                    }

                    case "diagram":
                      return (
                        <figure key={index} className="my-6">
                          <TechnicalDiagram id={block.diagramId} />
                          {block.caption && (
                            <figcaption className="text-center text-xs text-[#8C929C] mt-2.5 font-mono max-w-[54ch] mx-auto text-pretty">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );

                    case "image":
                      return (
                        <figure
                          key={index}
                          className="my-6 rounded-[4px] overflow-hidden border border-[#2B2E36] bg-[#141518] p-2"
                        >
                          <img
                            src={block.src}
                            alt={block.alt || "Documentation illustration"}
                            className="w-full h-auto rounded-[2px] max-h-[500px] object-contain mx-auto"
                          />
                          {block.caption && (
                            <figcaption className="text-center text-xs text-[#8C929C] mt-2 font-mono max-w-[54ch] mx-auto text-pretty">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );

                    default:
                      return null;
                  }
                })}
              </div>

              {/* Article Footer (Helpful rating) */}
              <div className="mt-12 pt-8 border-t border-[#22242A]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs sm:text-sm text-[#A8ADB6] font-medium">
                      Was this article helpful?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Mark article helpful"
                        onClick={() => handleVote("up")}
                        disabled={vote !== null || votingType !== null}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-xs font-mono font-medium transition-colors cursor-pointer ${
                          vote === "up"
                            ? "bg-[#34D399]/10 border-[#34D399]/40 text-[#34D399] font-semibold"
                            : "bg-[#141518] border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48]"
                        } disabled:cursor-default`}
                      >
                        {votingType === "up" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ThumbsUp className="w-3.5 h-3.5" />
                        )}
                        <span className="tabular-nums">{voteStats.up}</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Mark article unhelpful"
                        onClick={() => handleVote("down")}
                        disabled={vote !== null || votingType !== null}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-xs font-mono font-medium transition-colors cursor-pointer ${
                          vote === "down"
                            ? "bg-[#F87171]/10 border-[#F87171]/40 text-[#F87171] font-semibold"
                            : "bg-[#141518] border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48]"
                        } disabled:cursor-default`}
                      >
                        {votingType === "down" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ThumbsDown className="w-3.5 h-3.5" />
                        )}
                        <span className="tabular-nums">{voteStats.down}</span>
                      </button>
                    </div>
                  </div>
                  {vote && (
                    <span className="text-xs font-mono text-[#DAFA9C] font-medium">
                      Thanks for your feedback!
                    </span>
                  )}
                </div>
              </div>
            </article>
          </main>

          {/* Table of Contents (Right Column) */}
          {h2Headings.length > 0 && (
            <aside className="hidden xl:block w-60 shrink-0 sticky top-24 self-start">
              <div className="p-4 rounded-[4px] bg-[#141518] border border-[#22242A] space-y-3">
                <h2 className="text-xs font-mono font-semibold text-[#8C929C] uppercase tracking-wider">
                  On this page
                </h2>
                <ul className="space-y-1.5">
                  {h2Headings.map((heading, i) => {
                    const headingId = heading.text
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-");
                    const isActive = activeId === headingId;
                    return (
                      <li key={i}>
                        <a
                          href={`#${headingId}`}
                          className={`block text-xs transition-colors py-1 px-2 rounded-[4px] ${
                            isActive
                              ? "text-[#DAFA9C] bg-[#17181B] font-semibold"
                              : "text-[#A8ADB6] hover:text-[#F4F4F0]"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(headingId)?.scrollIntoView({
                              behavior: "smooth",
                            });
                            setActiveId(headingId);
                          }}
                        >
                          {heading.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsArticlePage;
