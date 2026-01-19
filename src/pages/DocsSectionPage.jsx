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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-[#1e1f2e] bg-[#12131a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/getting-started"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <Link
                to="/docs"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-white">{sectionData.title}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div
            className={`lg:block ${sidebarOpen ? "block" : "hidden"} w-80 flex-shrink-0`}
          >
            <div className="sticky top-24">
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

              <h1 className="text-4xl font-bold text-white mb-4">
                {sectionData.title}
              </h1>

              <p className="text-xl text-gray-400 mb-8">
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
