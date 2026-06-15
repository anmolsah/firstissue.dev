import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Menu,
  X,
  Search,
  Clock,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import Footer from "../components/Footer";
import { docContent } from "../data/docContent";

const DocsSectionPage = () => {
  const { section } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sectionData = docContent[section];

  if (!sectionData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Section Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The documentation section you're looking for doesn't exist.
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

  const articles = Object.entries(sectionData).filter(
    ([key]) => !["title", "icon", "color"].includes(key),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden text-zinc-200">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
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
              <span className="text-zinc-100 font-medium truncate max-w-[250px]">{sectionData.title}</span>
            </div>
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
              <div className="space-y-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  {sectionData.title}
                </div>
                <div className="space-y-1">
                  {articles.map(([key, articleData]) => (
                    <Link
                      key={key}
                      to={`/docs/${section}/${key}`}
                      onClick={() => setSidebarOpen(false)}
                      className="block px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-[#12131a] border border-transparent hover:border-zinc-800/50 rounded-md transition-all"
                    >
                      {articleData.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full overflow-hidden">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                {sectionData.title}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                {sectionData.title}
              </h1>

              <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                Explore all articles in this section to master {sectionData.title.toLowerCase()}.
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map(([key, articleData]) => (
                <Link
                  key={key}
                  to={`/docs/${section}/${key}`}
                  className="p-6 bg-[#12131a] border border-[#1e1f2e] rounded-lg hover:border-zinc-700 transition-all duration-200 group"
                >
                  <h3 className="text-white font-semibold mb-2 group-hover:text-white transition-colors">
                    {articleData.title}
                  </h3>
                  {articleData.description && (
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                      {articleData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{articleData.readTime}</span>
                    </div>
                    {articleData.difficulty && (
                      <>
                        <span className="text-zinc-700">•</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            articleData.difficulty === "Beginner"
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                              : articleData.difficulty === "Intermediate"
                                ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                                : "bg-red-500/5 border-red-500/20 text-red-400"
                          }`}
                        >
                          {articleData.difficulty}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsSectionPage;
