import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Menu,
  X,
  Search,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import Footer from "../components/Footer";
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
    // Reset state when navigating to a different article
    setVote(null);
    setVoteStats({ up: 0, down: 0 });
    setVotingType(null);

    fetchVotes();
    // Check local storage for previous vote
    const savedVote = localStorage.getItem(`docs-vote-${articleId}`);
    if (savedVote) setVote(savedVote);
  }, [articleId]);

  // Dynamically set page title and description for SEO
  useEffect(() => {
    if (currentArticle) {
      document.title = `${currentArticle.title} | FirstIssue.dev Docs`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", currentArticle.description || `Read about ${currentArticle.title} on the FirstIssue.dev developer guides.`);
      }
    }
  }, [currentArticle]);

  // Scroll to hash element if it exists in the URL (e.g. for linking directly to section)
  useEffect(() => {
    if (location.hash && currentArticle) {
      const timer = setTimeout(() => {
        const id = decodeURIComponent(location.hash.replace("#", ""));
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 400); // 400ms delay to allow DOM & markdown to fully render and lay out
      return () => clearTimeout(timer);
    }
  }, [location.hash, currentArticle]);

  // Set up intersection observer for scroll spy
  useEffect(() => {
    if (!currentArticle) return;
    
    const h2s = currentArticle.content.filter(
      (block) => block.type === "heading" && block.level === 2
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
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
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
        { up: 0, down: 0 }
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
    if (staticDate.includes("day")) {
      const days = parseInt(staticDate) || 1;
      now.setDate(now.getDate() - days);
    } else if (staticDate.includes("week")) {
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The documentation article you're looking for doesn't exist.
          </p>
          <Link
            to="/docs"
            className="px-6 py-3 bg-[#12131a] border border-zinc-800 text-white rounded-md font-medium hover:bg-zinc-900 transition-colors"
          >
            Back to Documentation
          </Link>
        </div>
      </div>
    );
  }

  const CodeBlock = ({ children, language = "bash", id }) => (
    <div className="relative border border-zinc-800/80 bg-[#12131a] rounded-lg overflow-hidden group my-6 w-full max-w-full">
      <div className="flex items-center justify-between bg-zinc-950/30 px-4 py-1.5 border-b border-zinc-800/40">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-0.5 px-2 bg-zinc-900/40 border border-zinc-800/60 rounded hover:bg-zinc-900"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-[13px] text-zinc-300 leading-relaxed bg-[#12131a] w-full max-w-full">
        <code className="block w-full overflow-x-auto">{children}</code>
      </pre>
    </div>
  );

  const h2Headings = currentArticle.content.filter(
    (block) => block.type === "heading" && block.level === 2
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden text-zinc-200">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-zinc-400 min-w-0 overflow-hidden">
              <Link
                to="/docs"
                className="hover:text-white transition-colors flex-shrink-0 inline-flex items-center"
              >
                <Home className="w-3.5 h-3.5" />
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
              <Link
                to="/docs"
                className="hover:text-white transition-colors hidden sm:inline-block"
              >
                Docs
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0 hidden sm:inline-block" />
              <Link
                to={`/docs/${section}`}
                className="hover:text-white transition-colors inline-block truncate max-w-[150px]"
              >
                {sectionData?.title}
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
              <span className="text-zinc-100 font-medium truncate max-w-[250px]">{currentArticle.title}</span>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors flex-shrink-0 -mr-2"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8 justify-between">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar (Left Column) */}
          <div
            className={`
              fixed lg:static inset-y-0 left-0 z-50 lg:z-0
              w-64 flex-shrink-0
              bg-[#0a0a0f] lg:bg-transparent
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              overflow-y-auto lg:overflow-visible
              border-r border-[#1e1f2e] lg:border-0
            `}
          >
            <div className="lg:sticky lg:top-24 p-6 lg:p-0">
              {/* Back to Docs */}
              <Link
                to="/docs"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Docs</span>
              </Link>

              {/* Section Navigation */}
              {sectionData && (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    {sectionData.title}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(docContent[section] || {}).map(
                      ([key, articleData]) => {
                        if (
                          key === "title" ||
                          key === "icon" ||
                          key === "color"
                        )
                          return null;
                        
                        const isCurrent = key === article;
                        return (
                          <Link
                            key={key}
                            to={`/docs/${section}/${key}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-3 py-1.5 text-sm rounded-md transition-all border ${
                              isCurrent
                                ? "text-blue-400 bg-blue-500/5 border-zinc-800/60 font-medium"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-[#12131a] border-transparent hover:border-zinc-800/50"
                            }`}
                          >
                            {articleData.title}
                          </Link>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Article Container (Center Column) */}
          <div className="flex-1 min-w-0 max-w-[760px] mx-auto lg:mx-0 w-full overflow-hidden">
            <article>
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                    {sectionData?.title}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs text-zinc-500 font-medium">{currentArticle.readTime}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                  {currentArticle.title}
                </h1>

                {currentArticle.description && (
                  <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                    {currentArticle.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pb-6 border-b border-zinc-800/60">
                  <span>Updated {getDynamicUpdatedDate(currentArticle.updated)}</span>
                  {currentArticle.difficulty && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          currentArticle.difficulty === "Beginner"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                            : currentArticle.difficulty === "Intermediate"
                              ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                              : "bg-red-500/5 border-red-500/20 text-red-400"
                        }`}
                      >
                        {currentArticle.difficulty}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none w-full break-words">
                {currentArticle.content.map((block, index) => {
                  switch (block.type) {
                    case "heading": {
                      const HeadingTag = `h${block.level}`;
                      const headingId = block.level === 2 
                        ? block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                        : undefined;
                      return (
                        <div key={index} className="group relative">
                          <HeadingTag
                            id={headingId}
                            className={`font-bold text-white mb-4 scroll-mt-24 flex items-center gap-2 ${
                              block.level === 2
                                ? "text-2xl mt-8 border-b border-zinc-800/40 pb-2"
                                : block.level === 3
                                  ? "text-xl mt-6"
                                  : "text-lg mt-4"
                            }`}
                          >
                            {block.text}
                            {block.level === 2 && headingId && (
                              <a
                                href={`#${headingId}`}
                                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity ml-1.5"
                                aria-label="Anchor link"
                              >
                                #
                              </a>
                            )}
                          </HeadingTag>
                        </div>
                      );
                    }

                    case "paragraph":
                      return (
                        <p
                          key={index}
                          className="text-zinc-300 mb-4 leading-relaxed text-[15px] break-words"
                        >
                          {block.text}
                        </p>
                      );

                    case "code":
                      return (
                        <div key={index} className="mb-6 w-full max-w-full overflow-hidden">
                          <CodeBlock
                            language={block.language}
                            id={`code-${index}`}
                          >
                            {block.code}
                          </CodeBlock>
                        </div>
                      );

                    case "list": {
                      const ListTag = block.ordered ? "ol" : "ul";
                      return (
                        <ListTag
                          key={index}
                          className={`mb-4 space-y-2 ${block.ordered ? "list-decimal pl-5" : "list-disc pl-5"} text-[15px]`}
                        >
                          {block.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-zinc-300 pl-1 break-words">
                              {item}
                            </li>
                          ))}
                        </ListTag>
                      );
                    }

                    case "callout": {
                      const borderLeftColor = 
                        block.variant === "warning" ? "border-l-amber-500 bg-amber-500/5" :
                        block.variant === "error" ? "border-l-red-500 bg-red-500/5" :
                        block.variant === "success" ? "border-l-emerald-500 bg-emerald-500/5" :
                        "border-l-blue-500 bg-blue-500/5";
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-r-lg border border-zinc-800/80 border-l-4 mb-6 ${borderLeftColor}`}
                        >
                          <p className="font-semibold text-zinc-100 text-sm mb-1 break-words">{block.title}</p>
                          <p className="text-sm text-zinc-300 leading-relaxed opacity-95 break-words">{block.text}</p>
                        </div>
                      );
                    }

                    case "image":
                      return (
                        <div key={index} className="my-6 rounded-lg overflow-hidden border border-zinc-800/80 bg-[#12131a] p-2">
                          <img
                            src={block.src}
                            alt={block.alt || "Documentation Image"}
                            className="w-full h-auto rounded-md max-h-[500px] object-contain mx-auto"
                          />
                          {block.caption && (
                            <p className="text-center text-xs text-zinc-500 mt-2 font-mono">{block.caption}</p>
                          )}
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>

              {/* Article Footer (Helpful rating) */}
              <div className="mt-12 pt-8 border-t border-zinc-800/60">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500 font-medium">
                      Was this article helpful?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote("up")}
                        disabled={vote !== null || votingType !== null}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                          vote === "up"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold"
                            : "bg-[#12131a] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        } disabled:cursor-default`}
                      >
                        {votingType === "up" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ThumbsUp className={`w-3.5 h-3.5 ${vote === "up" ? "fill-emerald-400/20" : ""}`} />
                        )}
                        <span>{voteStats.up}</span>
                      </button>
                      <button
                        onClick={() => handleVote("down")}
                        disabled={vote !== null || votingType !== null}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                          vote === "down"
                            ? "bg-red-500/10 border-red-500/40 text-red-400 font-semibold"
                            : "bg-[#12131a] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        } disabled:cursor-default`}
                      >
                        {votingType === "down" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ThumbsDown className={`w-3.5 h-3.5 ${vote === "down" ? "fill-red-400/20" : ""}`} />
                        )}
                        <span>{voteStats.down}</span>
                      </button>
                    </div>
                  </div>
                  {vote && (
                    <span className="text-xs text-blue-400 animate-fade-in font-medium">
                      Thanks for your feedback!
                    </span>
                  )}
                </div>
              </div>
            </article>
          </div>

          {/* Table of Contents (Right Column) */}
          {h2Headings.length > 0 && (
            <div className="hidden xl:block w-60 flex-shrink-0 sticky top-24 self-start">
              <div className="pl-6 border-l border-zinc-800/80 space-y-3">
                <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  On this page
                </h4>
                <ul className="space-y-2">
                  {h2Headings.map((heading, i) => {
                    const headingId = heading.text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    const isActive = activeId === headingId;
                    return (
                      <li key={i}>
                        <a
                          href={`#${headingId}`}
                          className={`block text-xs transition-colors py-0.5 ${
                            isActive
                              ? "text-blue-400 font-medium"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(headingId)?.scrollIntoView({
                              behavior: "smooth"
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
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsArticlePage;
