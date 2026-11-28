import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Zap,
  Users,
  AlertTriangle,
  FileText,
  Key,
  ArrowRight,
  ChevronRight,
  Home,
  Menu,
  X,
  Terminal,
  GitBranch,
  Code,
  HelpCircle,
  Star,
  Clock,
  Award,
  ShieldCheck,
  GitMerge,
  Cpu,
} from "lucide-react";
import Footer from "../components/Footer";
import ContactFormModal from "../components/ContactFormModal";
import { BrandLogo } from "../components/BrandMark";
import { docContent, docSections } from "../data/docContent";

const DocsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Developer Documentation & Guides | FirstIssue.dev";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Access FirstIssue.dev developer documentation. Learn git workflows, GitHub labels, troubleshooting setup issues, and system architecture.",
      );
    }
  }, []);

  const getLatestUpdateDate = () => {
    let minDays = Infinity;

    Object.keys(docContent).forEach((sectionKey) => {
      const section = docContent[sectionKey];
      Object.keys(section).forEach((articleKey) => {
        if (["title", "icon", "color"].includes(articleKey)) return;
        const article = section[articleKey];
        if (article.updated) {
          let days = 0;
          if (article.updated === "today") {
            days = 0;
          } else if (article.updated.includes("day")) {
            days = parseInt(article.updated) || 1;
          } else if (article.updated.includes("week")) {
            days = (parseInt(article.updated) || 1) * 7;
          } else if (article.updated.includes("month")) {
            days = (parseInt(article.updated) || 1) * 30;
          }
          if (days < minDays) {
            minDays = days;
          }
        }
      });
    });

    const date = new Date();
    if (minDays !== Infinity && minDays > 0) {
      date.setDate(date.getDate() - minDays);
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // `docSections` is loaded from firstissue-doc/ via src/data/docContent.js

  const popularArticles = [
    {
      icon: Cpu,
      title: "Introduction to Reverse Engineering",
      section: "reverse-engineering",
      article: "intro-to-reverse-engineering",
      readTime: "12 min read",
      updated: "Updated today",
    },
    {
      icon: Award,
      title: "Google Summer of Code (GSoC) Complete Roadmap",
      section: "open-source-programs",
      article: "gsoc-guide",
      readTime: "12 min read",
      updated: "Updated today",
    },
    {
      icon: GitMerge,
      title: "Interactive Rebase & Squashing Commits",
      section: "advanced-git-workflows",
      article: "interactive-rebase-squash",
      readTime: "11 min read",
      updated: "Updated today",
    },
    {
      icon: FileText,
      title: "Your First Open Source Contribution",
      section: "getting-started",
      article: "first-steps",
      readTime: "8 min read",
      updated: "Updated 2 days ago",
    },
    {
      icon: ShieldCheck,
      title: "Understanding Open Source Licenses",
      section: "licenses-and-legal",
      article: "license-types",
      readTime: "9 min read",
      updated: "Updated today",
    },
    {
      icon: Key,
      title: "Understanding GitHub Labels",
      section: "getting-started",
      article: "understanding-labels",
      readTime: "6 min read",
      updated: "Updated 1 week ago",
    },
    {
      icon: GitBranch,
      title: "Open Source Contribution Workflow",
      section: "contribution-guide",
      article: "workflow",
      readTime: "10 min read",
      updated: "Updated 1 day ago",
    },
  ];

  const filteredSections = docSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.articles.some((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] overflow-x-hidden text-[#F4F4F0] font-sans">
      {/* Header */}
      <header className="border-b border-[#22242A] bg-[#0F0F0F] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <BrandLogo size="sm" />
            </Link>
            <span className="hidden sm:inline-block w-px h-4 bg-[#22242A]" />
            <Link
              to="/explore"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Issues Workspace</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] hover:bg-[#17181B] transition-colors shrink-0 -mr-2 cursor-pointer"
            aria-label="Toggle documentation navigation"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/75 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
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
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C929C] pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search documentation"
                  placeholder="Search documentation..."
                  className="w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] py-2 pl-9 pr-4 text-xs text-[#F4F4F0] placeholder:text-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Navigation */}
              <nav aria-label="Documentation sections" className="space-y-6">
                {filteredSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="px-2.5 py-1 text-xs font-mono font-semibold text-[#8C929C] uppercase tracking-wider">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${section.id}/${article.id}`}
                          onClick={() => setSidebarOpen(false)}
                          className="block px-2.5 py-1.5 text-xs text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#141518] border border-transparent hover:border-[#2B2E36] rounded-[4px] transition-colors"
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full overflow-hidden">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F0] tracking-tight mb-3 sm:mb-4 text-balance">
                FirstIssue.dev Documentation
              </h1>
              <p className="text-base sm:text-lg text-[#A8ADB6] mb-6 max-w-[65ch] leading-relaxed text-pretty">
                Guides, reference manuals, and architecture notes for open-source contribution workflows.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#8C929C] font-mono tabular-nums">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8C929C]" />
                  <span>
                    {docSections.reduce(
                      (acc, section) => acc + section.articles.length,
                      0,
                    )}{" "}
                    Articles
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8C929C]" />
                  <span>Updated {getLatestUpdateDate()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#8C929C]" />
                  <span>Community Maintained</span>
                </div>
              </div>
            </div>

            {/* Documentation Categories */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl font-bold text-[#F4F4F0] mb-4 sm:mb-6 tracking-tight text-balance">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className="p-5 sm:p-6 bg-[#141518] border border-[#2B2E36] rounded-[4px] hover:border-[#3A3E48] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <section.icon className={`w-4 h-4 shrink-0 ${section.color}`} />
                      <h3 className="text-base font-semibold text-[#F4F4F0]">
                        {section.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[#A8ADB6] mb-4 leading-relaxed text-pretty">
                      {section.description}
                    </p>
                    <div className="space-y-2.5">
                      {section.articles.slice(0, 3).map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${section.id}/${article.id}`}
                          className="flex items-center justify-between text-xs sm:text-sm text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors gap-2"
                        >
                          <span className="truncate">{article.title}</span>
                          <span className="text-xs font-mono text-[#8C929C] shrink-0 tabular-nums">
                            {article.readTime}
                          </span>
                        </Link>
                      ))}
                      {section.articles.length > 3 && (
                        <Link
                          to={`/docs/${section.id}`}
                          className="inline-flex items-center gap-1 text-xs font-mono text-[#DAFA9C] hover:text-[#C7F275] font-medium transition-colors mt-2"
                        >
                          <span>View all {section.articles.length} articles</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl font-bold text-[#F4F4F0] mb-4 sm:mb-6 tracking-tight text-balance">
                Popular Articles
              </h2>
              <div className="space-y-2">
                {popularArticles.map((article, index) => (
                  <Link
                    key={index}
                    to={`/docs/${article.section}/${article.article}`}
                    className="flex items-center gap-4 p-4 bg-[#141518] border border-[#2B2E36] rounded-[4px] hover:border-[#DAFA9C]/60 hover:bg-[#17181B] transition-colors group"
                  >
                    <article.icon className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#F4F4F0] group-hover:text-[#DAFA9C] transition-colors truncate">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[#8C929C] font-mono mt-0.5 tabular-nums">
                        {article.readTime} · {article.updated.replace("Updated ", "")}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C929C] group-hover:text-[#DAFA9C] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#F4F4F0] mb-1 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                  <span>Need Assistance?</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#A8ADB6] max-w-[54ch] leading-relaxed text-pretty">
                  Contact our support team for specialized guidance on setup, workflows, or platform issues.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold text-xs transition-colors cursor-pointer shrink-0 min-h-[40px]"
              >
                Contact Support
              </button>
            </div>
          </main>
        </div>
      </div>

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default DocsPage;
