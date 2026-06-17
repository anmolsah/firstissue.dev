import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Zap,
  Users,
  Wrench,
  AlertTriangle,
  FileText,
  Key,
  Settings,
  ArrowRight,
  ChevronRight,
  Home,
  Menu,
  X,
  Terminal,
  Shield,
  Command,
  GitBranch,
  Code,
  HelpCircle,
  Star,
  Clock,
} from "lucide-react";
import Footer from "../components/Footer";
import ContactFormModal from "../components/ContactFormModal";
import { docContent } from "../data/docContent";

const DocsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Developer Documentation & Guides | FirstIssue.dev";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Access FirstIssue.dev developer documentation. Learn git workflows, GitHub labels, troubleshooting setup issues, and system architecture.");
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

  const docSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      description: "Learn how to get started with open source contributions",
      articles: [
        {
          id: "first-steps",
          title: "Your First Open Source Contribution",
          readTime: "8 min",
        },
        {
          id: "understanding-labels",
          title: "Understanding GitHub Labels",
          readTime: "6 min",
        },
        {
          id: "platform-guide",
          title: "Using FirstIssue.dev Platform",
          readTime: "7 min",
        },
      ],
    },
    {
      id: "contribution-guide",
      title: "Contribution Guide",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      description: "Learn how to contribute effectively",
      articles: [
        { id: "workflow", title: "Contribution Workflow", readTime: "10 min" },
        {
          id: "pull-requests",
          title: "Pull Request Guidelines",
          readTime: "7 min",
        },
        { id: "code-review", title: "Code Review Process", readTime: "5 min" },
      ],
    },
    {
      id: "finding-issues",
      title: "Finding Issues",
      icon: Terminal,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      description: "Master finding the perfect issues for your skill level",
      articles: [
        { id: "using-filters", title: "Using Filters", readTime: "6 min" },
        {
          id: "project-evaluation",
          title: "Evaluating Projects",
          readTime: "8 min",
        },
      ],
    },
    {
      id: "git-commands",
      title: "Git Commands",
      icon: GitBranch,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      description:
        "Essential Git commands for version control and collaboration",
      articles: [
        {
          id: "setup-configuration",
          title: "Setup & Configuration",
          readTime: "5 min",
        },
        {
          id: "basic-snapshotting",
          title: "Basic Snapshotting",
          readTime: "8 min",
        },
        {
          id: "branching-merging",
          title: "Branching & Merging",
          readTime: "10 min",
        },
        {
          id: "remote-collaboration",
          title: "Remote Collaboration",
          readTime: "9 min",
        },
        {
          id: "advanced-history",
          title: "Advanced & History Management",
          readTime: "12 min",
        },
        {
          id: "reverting-features",
          title: "Revert the Commit (Undo Feature Safely)",
          readTime: "6 min",
        },
        {
          id: "resolving-conflicts",
          title: "Resolving Merge Conflicts",
          readTime: "12 min",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: AlertTriangle,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      description: "Common issues and solutions",
      articles: [
        {
          id: "common-issues",
          title: "Common Beginner Issues",
          readTime: "8 min",
        },
        { id: "getting-help", title: "Getting Help", readTime: "5 min" },
      ],
    },
    {
      id: "best-practices",
      title: "Best Practices",
      icon: Code,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      description: "Best practices for open source contributions",
      articles: [
        {
          id: "contribution-etiquette",
          title: "Open Source Etiquette",
          readTime: "7 min",
        },
        {
          id: "building-portfolio",
          title: "Building Your Portfolio",
          readTime: "6 min",
        },
        {
          id: "conventional-commits",
          title: "Conventional Commits",
          readTime: "8 min",
        },
      ],
    },
    {
      id: "architecture-guide",
      title: "Architecture & Workflow",
      icon: Code,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description: "Platform workflow, database design, and system architecture",
      articles: [
        {
          id: "system-architecture",
          title: "Website Workflow & System Architecture",
          readTime: "12 min",
        },
      ],
    },
  ];

  const popularArticles = [
    {
      icon: FileText,
      title: "Your First Open Source Contribution",
      section: "getting-started",
      article: "first-steps",
      readTime: "8 min read",
      updated: "Updated 2 days ago",
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
      icon: Settings,
      title: "Using FirstIssue.dev Platform",
      section: "getting-started",
      article: "platform-guide",
      readTime: "7 min read",
      updated: "Updated 4 days ago",
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
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden text-zinc-200">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left side - Back button */}
            <Link
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
            {/* Mobile menu button */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
              w-64 flex-shrink-0
              bg-[#0a0a0f] lg:bg-transparent
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              overflow-y-auto lg:overflow-visible
              border-r border-[#1e1f2e] lg:border-0
            `}
          >
            <div className="lg:sticky lg:top-24 p-6 lg:p-0">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full bg-[#12131a] border border-[#1e1f2e] rounded-md py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-6">
                {filteredSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${section.id}/${article.id}`}
                          onClick={() => setSidebarOpen(false)}
                          className="block px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#12131a] border border-transparent hover:border-zinc-800/50 rounded-md transition-all"
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full overflow-hidden">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4 sm:mb-6">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                Documentation
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 sm:mb-4">
                FirstIssue.dev Documentation
              </h1>
              <p className="text-lg text-zinc-400 mb-6 max-w-3xl leading-relaxed">
                Guides, tutorials, and system references for open source contribution and community engagement.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-500 font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-600" />
                  <span>
                    {docSections.reduce(
                      (acc, section) => acc + section.articles.length,
                      0,
                    )}{" "}
                    Articles
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-600" />
                  <span>Updated {getLatestUpdateDate()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-zinc-600" />
                  <span>Community Maintained</span>
                </div>
              </div>
            </div>

            {/* Documentation Categories */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className="p-5 sm:p-6 bg-[#12131a] border border-[#1e1f2e] rounded-lg hover:border-zinc-700 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-center mb-4 text-zinc-400">
                      <section.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                      {section.description}
                    </p>
                    <div className="space-y-2.5">
                      {section.articles.slice(0, 3).map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${section.id}/${article.id}`}
                          className="flex items-center justify-between text-sm text-zinc-400 hover:text-zinc-100 transition-colors gap-2"
                        >
                          <span className="truncate">{article.title}</span>
                          <span className="text-xs text-zinc-600 flex-shrink-0">
                            {article.readTime}
                          </span>
                        </Link>
                      ))}
                      {section.articles.length > 3 && (
                        <Link
                          to={`/docs/${section.id}`}
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors mt-2"
                        >
                          <span>
                            View all {section.articles.length} articles
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                Popular Articles
              </h2>
              <div className="space-y-2">
                {popularArticles.map((article, index) => (
                  <Link
                    key={index}
                    to={`/docs/${article.section}/${article.article}`}
                    className="flex items-center gap-4 p-4 bg-[#12131a] border border-[#1e1f2e] rounded-lg hover:border-zinc-700 transition-all group"
                  >
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center flex-shrink-0 text-zinc-400">
                      <article.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                        {article.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {article.readTime} • {article.updated.replace("Updated ", "")}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-[#12131a] border border-[#1e1f2e] rounded-lg p-6 sm:p-8 text-center">
              <HelpCircle className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                Need Assistance?
              </h3>
              <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
                Contact our support team for specialized guidance on setup, workflows, or platform issues.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-black rounded-md font-medium text-sm transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
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
