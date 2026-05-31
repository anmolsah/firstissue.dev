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
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
              <Link
                to="/docs"
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0" />
              <Link
                to="/docs"
                className="text-gray-400 hover:text-white transition-colors hidden sm:inline"
              >
                Docs
              </Link>
              <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0 hidden sm:inline" />
              <span className="text-white truncate max-w-[150px] sm:max-w-[250px]">{sectionData.title}</span>
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
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 text-white font-medium">
                  <sectionData.icon
                    className={`w-4 h-4 ${sectionData.color}`}
                  />
                  <span className="text-sm">{sectionData.title}</span>
                </div>
                <div className="ml-7 space-y-1">
                  {articles.map(([key, articleData]) => (
                    <Link
                      key={key}
                      to={`/docs/${section}/${key}`}
                      onClick={() => setSidebarOpen(false)}
                      className="block px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#1e1f2e] rounded-md transition-colors"
                    >
                      {articleData.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                <BookOpen className="w-3 h-3" />
                {sectionData.title}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                {sectionData.title}
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">
                Explore all articles in this section to master{" "}
                {sectionData.title.toLowerCase()}.
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map(([key, articleData]) => (
                <Link
                  key={key}
                  to={`/docs/${section}/${key}`}
                  className="p-6 bg-[#12131a] border border-[#1e1f2e] rounded-xl hover:border-white/20 transition-colors group"
                >
                  <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                    {articleData.title}
                  </h3>
                  {articleData.description && (
                    <p className="text-sm text-gray-500 mb-4">
                      {articleData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{articleData.readTime}</span>
                    </div>
                    {articleData.difficulty && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          articleData.difficulty === "Beginner"
                            ? "bg-green-500/10 text-green-400"
                            : articleData.difficulty === "Intermediate"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {articleData.difficulty}
                      </span>
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
