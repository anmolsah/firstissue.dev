import React, { useState } from "react";
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

const DocsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left side - Back button */}
            <Link
              to="/getting-started"
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors flex-shrink-0"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </Link>
            
            {/* Mobile menu button */}
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
              w-80 lg:w-80 flex-shrink-0
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full bg-[#12131a] border border-[#1e1f2e] rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 text-white font-medium">
                      <section.icon className={`w-4 h-4 ${section.color}`} />
                      <span className="text-sm">{section.title}</span>
                    </div>
                    <div className="ml-7 space-y-1">
                      {section.articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${section.id}/${article.id}`}
                          onClick={() => setSidebarOpen(false)}
                          className="block px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#1e1f2e] rounded-md transition-colors"
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
          <div className="flex-1 min-w-0">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4 sm:mb-6">
                <BookOpen className="w-4 h-4" />
                DOCUMENTATION
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                FirstIssue.dev Documentation
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-3xl">
                Everything you need to know about contributing to open source
                projects and building a thriving developer community.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    {docSections.reduce(
                      (acc, section) => acc + section.articles.length,
                      0,
                    )}{" "}
                    articles
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Community maintained</span>
                </div>
              </div>
            </div>

            {/* Documentation Categories */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                Browse by Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-4 sm:p-6 bg-[#12131a] border ${section.borderColor} rounded-xl hover:border-white/20 transition-colors group`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${section.bgColor} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}
                    >
                      <section.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${section.color}`} />
                    </div>
                    <h3 className="text-base sm:text-lg text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      {section.description}
                    </p>
                    <div className="space-y-2">
                      {section.articles.slice(0, 3).map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${section.id}/${article.id}`}
                          className="flex items-center justify-between text-xs sm:text-sm text-gray-400 hover:text-white transition-colors gap-2"
                        >
                          <span className="truncate">{article.title}</span>
                          <span className="text-xs text-gray-600 flex-shrink-0">
                            {article.readTime}
                          </span>
                        </Link>
                      ))}
                      {section.articles.length > 3 && (
                        <Link
                          to={`/docs/${section.id}`}
                          className="flex items-center gap-1 text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>
                            View all {section.articles.length} articles
                          </span>
                          <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                Popular Articles
              </h2>
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <Link
                    key={index}
                    to={`/docs/${article.section}/${article.article}`}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#12131a] border border-[#1e1f2e] rounded-xl hover:border-white/20 transition-colors group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1e1f2e] rounded-lg flex items-center justify-center flex-shrink-0">
                      <article.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base text-white font-medium mb-1 group-hover:text-blue-400 transition-colors truncate">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {article.readTime} • {article.updated}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-[#12131a] border border-[#1e1f2e] rounded-xl p-6 sm:p-8 text-center">
              <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                Our community is here to help. Join our Discord or submit a
                support ticket for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors text-sm sm:text-base"
                >
                  Get Support
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
