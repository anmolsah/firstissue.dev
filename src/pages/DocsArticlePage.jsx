import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

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
    // If the static date is like "2 days ago", "1 week ago", etc.
    // we can either keep it or return something more formal based on today.
    // For now, let's make it look like a real date from May 2026.
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
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
          >
            Back to Documentation
          </Link>
        </div>
      </div>
    );
  }

  const CodeBlock = ({ children, language = "bash", id }) => (
    <div className="relative group">
      <div className="flex items-center justify-between bg-[#1e1f2e] px-4 py-2 rounded-t-lg border-b border-[#2a2b4e]">
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-[#12131a] p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm text-gray-300">{children}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0 overflow-hidden">
              <Link
                to="/docs"
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0 inline-flex items-center"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0" />
              <Link
                to="/docs"
                className="text-gray-400 hover:text-white transition-colors hidden sm:inline-block truncate max-w-[60px]"
              >
                Docs
              </Link>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0 hidden sm:inline-block" />
              <Link
                to={`/docs/${section}`}
                className="text-gray-400 hover:text-white transition-colors inline-block truncate max-w-[80px] sm:max-w-[150px]"
              >
                {sectionData?.title}
              </Link>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0" />
              <span className="text-white inline-block truncate max-w-[120px] sm:max-w-[250px]">{currentArticle.title}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0 -mr-2"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              fixed lg:static inset-y-0 left-0 z-50 lg:z-0
              w-80 lg:w-80 flex-shrink-0
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
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Documentation</span>
              </Link>

              {/* Section Navigation */}
              {sectionData && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 text-white font-medium">
                    <sectionData.icon
                      className={`w-4 h-4 ${sectionData.color}`}
                    />
                    <span className="text-sm">{sectionData.title}</span>
                  </div>
                  <div className="ml-7 space-y-1">
                    {Object.entries(docContent[section] || {}).map(
                      ([key, articleData]) => {
                        if (
                          key === "title" ||
                          key === "icon" ||
                          key === "color"
                        )
                          return null;
                        return (
                          <Link
                            key={key}
                            to={`/docs/${section}/${key}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                              key === article
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-gray-400 hover:text-white hover:bg-[#1e1f2e]"
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

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <article className="max-w-4xl">
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                    <BookOpen className="w-3 h-3" />
                    {sectionData?.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{currentArticle.readTime}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                  {currentArticle.title}
                </h1>

                {currentArticle.description && (
                  <p className="text-lg sm:text-xl text-gray-400 mb-4 sm:mb-6">
                    {currentArticle.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-[#1e1f2e]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Updated {getDynamicUpdatedDate(currentArticle.updated)}</span>
                  </div>
                  {currentArticle.difficulty && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          currentArticle.difficulty === "Beginner"
                            ? "bg-green-500/10 text-green-400"
                            : currentArticle.difficulty === "Intermediate"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {currentArticle.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                {currentArticle.content.map((block, index) => {
                  switch (block.type) {
                    case "heading":
                      const HeadingTag = `h${block.level}`;
                      return (
                        <HeadingTag
                          key={index}
                          className={`font-bold text-white mb-4 ${
                            block.level === 2
                              ? "text-2xl mt-8"
                              : block.level === 3
                                ? "text-xl mt-6"
                                : "text-lg mt-4"
                          }`}
                        >
                          {block.text}
                        </HeadingTag>
                      );

                    case "paragraph":
                      return (
                        <p
                          key={index}
                          className="text-gray-300 mb-4 leading-relaxed"
                        >
                          {block.text}
                        </p>
                      );

                    case "code":
                      return (
                        <div key={index} className="mb-6">
                          <CodeBlock
                            language={block.language}
                            id={`code-${index}`}
                          >
                            {block.code}
                          </CodeBlock>
                        </div>
                      );

                    case "list":
                      const ListTag = block.ordered ? "ol" : "ul";
                      return (
                        <ListTag
                          key={index}
                          className={`mb-4 space-y-2 ${block.ordered ? "list-decimal" : "list-disc"} list-inside`}
                        >
                          {block.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-300">
                              {item}
                            </li>
                          ))}
                        </ListTag>
                      );

                    case "callout":
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 mb-6 ${
                            block.variant === "warning"
                              ? "bg-yellow-500/10 border-yellow-500 text-yellow-200"
                              : block.variant === "error"
                                ? "bg-red-500/10 border-red-500 text-red-200"
                                : block.variant === "success"
                                  ? "bg-green-500/10 border-green-500 text-green-200"
                                  : "bg-blue-500/10 border-blue-500 text-blue-200"
                          }`}
                        >
                          <p className="font-medium mb-1">{block.title}</p>
                          <p className="text-sm opacity-90">{block.text}</p>
                        </div>
                      );

                    case "image":
                      return (
                        <div key={index} className="my-6 rounded-xl overflow-hidden border border-white/5 bg-[#12131a]/50 p-2">
                          <img
                            src={block.src}
                            alt={block.alt || "Documentation Image"}
                            className="w-full h-auto rounded-lg max-h-[500px] object-contain mx-auto"
                          />
                          {block.caption && (
                            <p className="text-center text-xs text-gray-500 mt-2 font-sans">{block.caption}</p>
                          )}
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-[#1e1f2e]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      Was this article helpful?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote("up")}
                        disabled={vote !== null || votingType !== null}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                          vote === "up"
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                            : "bg-[#15161E] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                        } disabled:cursor-default`}
                      >
                        {votingType === "up" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ThumbsUp className={`w-4 h-4 ${vote === "up" ? "fill-emerald-400/20" : ""}`} />
                        )}
                        <span className="text-xs font-medium">{voteStats.up}</span>
                      </button>
                      <button
                        onClick={() => handleVote("down")}
                        disabled={vote !== null || votingType !== null}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                          vote === "down"
                            ? "bg-red-500/10 border-red-500/50 text-red-400"
                            : "bg-[#15161E] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                        } disabled:cursor-default`}
                      >
                        {votingType === "down" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ThumbsDown className={`w-4 h-4 ${vote === "down" ? "fill-red-400/20" : ""}`} />
                        )}
                        <span className="text-xs font-medium">{voteStats.down}</span>
                      </button>
                    </div>
                  </div>
                  {vote && (
                    <span className="text-xs text-blue-400 animate-fade-in">
                      Thanks for your feedback!
                    </span>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsArticlePage;
