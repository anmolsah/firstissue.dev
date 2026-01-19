import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Zap,
  Users,
  Wrench,
  AlertTriangle,
  BookOpen,
  FileText,
  Key,
  Settings,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Mail,
  Terminal,
  Shield,
  Command,
} from "lucide-react";
import Footer from "../components/Footer";

const GettingStartedPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const docCategories = [
    {
      id: "getting-started",
      icon: Zap,
      title: "Getting Started",
      description:
        "Set up your local development environment in minutes with our automated CLI.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      id: "contribution-guide",
      icon: Users,
      title: "Contribution Guide",
      description:
        "Learn the professional workflow for submitting your first production pull request.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "finding-issues",
      icon: Wrench,
      title: "Finding Issues",
      description:
        "Master our filtering system to find the perfect issues for your skill level.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      id: "troubleshooting",
      icon: AlertTriangle,
      title: "Troubleshooting",
      description:
        "Fix common issues and get help when you're stuck on your contribution journey.",
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
  ];

  const popularArticles = [
    {
      icon: FileText,
      title: "Your First Open Source Contribution",
      section: "getting-started",
      article: "first-steps",
      readTime: "5 min read",
      updated: "Updated 2 days ago",
    },
    {
      icon: Key,
      title: "Understanding GitHub Labels",
      section: "getting-started",
      article: "understanding-labels",
      readTime: "8 min read",
      updated: "Updated 1 week ago",
    },
    {
      icon: Settings,
      title: "Using FirstIssue.dev Platform",
      section: "getting-started",
      article: "platform-guide",
      readTime: "3 min read",
      updated: "Updated 4 days ago",
    },
  ];

  const quickLinks = [
    {
      icon: BookOpen,
      label: "Getting Started Guide",
      href: "/docs/getting-started/first-steps",
    },
    { icon: MessageSquare, label: "Community Discord", href: "#" },
    {
      icon: FileText,
      label: "Contribution Guide",
      href: "/docs/contribution-guide/workflow",
    },
    {
      icon: Shield,
      label: "Best Practices",
      href: "/docs/best-practices/contribution-etiquette",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            ALL SYSTEMS OPERATIONAL
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How can we help you contribute?
          </h1>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for guides, CLI commands, troubleshooting..."
              className="w-full bg-[#12131a] border border-[#1e1f2e] rounded-xl py-4 pl-12 pr-16 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-600">
              <kbd className="px-2 py-1 bg-[#1e1f2e] rounded border border-[#2a2b4e]">
                ⌘
              </kbd>
              <kbd className="px-2 py-1 bg-[#1e1f2e] rounded border border-[#2a2b4e]">
                K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">
              Documentation Categories
            </h2>
            <a
              href="/docs"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all docs <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {docCategories.map((cat, index) => (
              <Link
                key={index}
                to={`/docs/${cat.id || "getting-started"}`}
                className={`p-6 bg-[#12131a] border ${cat.borderColor} rounded-xl hover:border-white/20 transition-colors cursor-pointer group`}
              >
                <div
                  className={`w-12 h-12 ${cat.bgColor} rounded-xl flex items-center justify-center mb-4`}
                >
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles & Quick Links */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Articles */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">
              Popular Articles
            </h2>
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  to={`/docs/${article.section}/${article.article}`}
                  className="p-4 bg-[#12131a] border border-[#1e1f2e] rounded-xl flex items-center gap-4 hover:border-white/20 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-[#1e1f2e] rounded-lg flex items-center justify-center flex-shrink-0">
                    <article.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors truncate">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {article.readTime} • {article.updated}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Quick Links</h2>
            <div className="p-6 bg-[#12131a] border border-[#1e1f2e] rounded-xl space-y-4">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm">{link.label}</span>
                </a>
              ))}
            </div>

            {/* Developer Tip */}
            <div className="mt-4 p-4 bg-[#12131a] border border-[#1e1f2e] rounded-xl">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                Pro Tip
              </p>
              <div className="bg-[#0a0a0f] rounded-lg p-3 font-mono text-sm">
                <span className="text-purple-400"># Find your first issue</span>
                <br />
                <span className="text-gray-400">
                  Filter by "good first issue" label
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#12131a] border border-[#1e1f2e] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
              Our developer support team is available 24/5 to help you with
              complex technical issues, account problems, or maintainer
              inquiries.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button className="px-6 py-3 bg-[#1e1f2e] text-white rounded-xl font-medium hover:bg-[#2a2b4e] transition-colors flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Submit a Ticket
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                <div className="flex items-center">
                  <img
                    className="w-7.5 rounded-full border-3 border-white"
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50"
                    alt="userImage1"
                  />
                  <img
                    className="w-7.5 rounded-full border-3 border-white -translate-x-2"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50"
                    alt="userImage2"
                  />
                  <img
                    className="w-7.5 rounded-full border-3 border-white -translate-x-4"
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop"
                    alt="userImage3"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Current response time:{" "}
                <span className="text-emerald-400">&lt; 2 Days</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}

      <Footer />
    </div>
  );
};

export default GettingStartedPage;
