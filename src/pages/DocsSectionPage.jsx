import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Menu,
  X,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Footer from "../components/Footer";
import { docContent } from "../data/docContent";

const DocsSectionPage = () => {
  const { section } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sectionData = docContent[section];

  if (!sectionData) {
    return (
      <main className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4 text-[#F4F4F0]">
        <div className="text-center max-w-md p-8 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
          <h1 className="text-2xl font-bold text-[#F4F4F0] mb-3 text-balance">
            Section Not Found
          </h1>
          <p className="text-sm text-[#A8ADB6] mb-6 text-pretty">
            The documentation section you&apos;re looking for doesn&apos;t exist.
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

  const articles = Object.entries(sectionData).filter(
    ([key]) => !["title", "icon", "color"].includes(key),
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
            <span className="text-[#F4F4F0] font-medium truncate max-w-[260px]">
              {sectionData.title}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] hover:bg-[#17181B] transition-colors shrink-0 -mr-2 cursor-pointer"
            aria-label="Toggle section menu"
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
              <Link
                to="/docs"
                className="flex items-center gap-2 text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors mb-6 text-xs font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Docs</span>
              </Link>

              <div className="space-y-2">
                <div className="px-2.5 py-1 text-xs font-mono font-semibold text-[#8C929C] uppercase tracking-wider">
                  {sectionData.title}
                </div>
                <nav aria-label="Section articles" className="space-y-1">
                  {articles.map(([key, articleData]) => (
                    <Link
                      key={key}
                      to={`/docs/${section}/${key}`}
                      onClick={() => setSidebarOpen(false)}
                      className="block px-2.5 py-1.5 text-xs text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#141518] border border-transparent hover:border-[#2B2E36] rounded-[4px] transition-colors"
                    >
                      {articleData.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full overflow-hidden">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F0] tracking-tight mb-3 text-balance">
                {sectionData.title}
              </h1>

              <p className="text-base sm:text-lg text-[#A8ADB6] mb-6 max-w-[65ch] leading-relaxed text-pretty">
                Explore all articles in this section to master{" "}
                {sectionData.title.toLowerCase()}.
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {articles.map(([key, articleData]) => (
                <Link
                  key={key}
                  to={`/docs/${section}/${key}`}
                  className="p-6 bg-[#141518] border border-[#2B2E36] rounded-[4px] hover:border-[#DAFA9C]/60 hover:bg-[#17181B] transition-colors group"
                >
                  <h2 className="text-[#F4F4F0] text-base font-semibold mb-2 group-hover:text-[#DAFA9C] transition-colors text-balance">
                    {articleData.title}
                  </h2>
                  {articleData.description && (
                    <p className="text-xs sm:text-sm text-[#A8ADB6] mb-4 leading-relaxed text-pretty">
                      {articleData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#8C929C] font-mono tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8C929C]" />
                      <span>{articleData.readTime}</span>
                    </div>
                    {articleData.difficulty && (
                      <>
                        <span className="text-[#3A3E48]">·</span>
                        <span
                          className={`px-2 py-0.5 rounded-[4px] text-xs font-semibold border ${
                            articleData.difficulty === "Beginner"
                              ? "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]"
                              : articleData.difficulty === "Intermediate"
                                ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                                : "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]"
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
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsSectionPage;
