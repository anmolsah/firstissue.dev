import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useAddBookmark, useRemoveBookmark, bookmarkKeys } from "../hooks/queries/useBookmarks";
import { useQueryClient } from "@tanstack/react-query";
import SmartMatchTab from "../components/SmartMatchTab";
import AppSidebar from "../components/AppSidebar";
import {
  Search,
  Compass,
  Bookmark,
  BookmarkCheck,
  Bell,
  Star,
  ChevronDown,
  Command,
  Loader2,
  ExternalLink,
  TrendingUp,
  User,
  Shield,
  GitFork,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(now - date) / 36e5;
  if (diffHours < 24) return `${Math.ceil(diffHours)}h ago`;
  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays}d ago`;
};

const ExplorePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Set SEO metadata
  useEffect(() => {
    document.title = "Explore Beginner-Friendly Open Source Issues | FirstIssue.dev";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Find open source issues labeled good first issue and help wanted. Filter by language and stars to start contributing today.");
    }
  }, []);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookmarkedIssues, setBookmarkedIssues] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all");

  // Trusted Repos State
  const [trustedRepos, setTrustedRepos] = useState([]);
  const [loadingTrustedRepos, setLoadingTrustedRepos] = useState(true);

  // Sidebar State
  const [activeSidebarItem, setActiveSidebarItem] = useState("explore");

  // Filters State
  const [filters, setFilters] = useState({
    language: "",
    labels: ["good first issue"],
    keywords: "",
    sort: "updated",
    minStars: "0",
  });

  // Sort dropdown state
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { name: "TypeScript", color: "blue" },
    { name: "JavaScript", color: "yellow" },
    { name: "Python", color: "blue" },
    { name: "Go", color: "cyan" },
    { name: "Rust", color: "orange" },
    { name: "Java", color: "red" },
    { name: "C++", color: "blue" },
    { name: "C#", color: "purple" },
    { name: "PHP", color: "indigo" },
    { name: "Swift", color: "orange" },
    { name: "Ruby", color: "red" },
    { name: "Kotlin", color: "purple" },
    { name: "Dart", color: "blue" },
  ];

  const labelOptions = [
    { id: "good first issue", label: "Good First Issue", color: "emerald" },
    { id: "help wanted", label: "Help Wanted", color: "blue" },
    { id: "beginner friendly", label: "Beginner Friendly", color: "purple" },
    { id: "hacktoberfest", label: "Hacktoberfest", color: "orange" },
    { id: "documentation", label: "Documentation", color: "yellow" },
    { id: "bug", label: "Bug Fix", color: "red" },
  ];

  /* --- Fetch Logic (debounced to prevent excessive API calls) --- */
  useEffect(() => {
    // Bookmarks don't need debouncing
    if (user) fetchBookmarkedIssues();

    // Debounce the search/filter fetch by 400ms
    const timer = setTimeout(() => {
      resetAndFetch();
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, selectedTab, user]);

  // Fetch Trusted Repos from Supabase
  useEffect(() => {
    fetchTrustedRepos();
  }, []);

  const fetchTrustedRepos = async () => {
    try {
      setLoadingTrustedRepos(true);
      const { data, error } = await supabase
        .from("trusted_repos")
        .select("*")
        .eq("is_active", true)
        .order("stars", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTrustedRepos(data || []);
    } catch (error) {
      console.error("Error fetching trusted repos:", error);
    } finally {
      setLoadingTrustedRepos(false);
    }
  };

  const resetAndFetch = () => {
    setCurrentPage(1);
    setIssues([]);
    setHasMore(true);
    fetchIssues(1, true);
  };

  const fetchIssues = async (page = 1, reset = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const query = buildQuery();
      const response = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(
          query,
        )}&sort=${filters.sort}&order=desc&per_page=30&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "OpenSourceBuddy/1.0",
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            }),
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const filteredIssues = data.items || [];

        if (reset) setIssues(filteredIssues);
        else setIssues((prev) => [...prev, ...filteredIssues]);

        setTotalCount(data.total_count);
        setHasMore(
          filteredIssues.length === 30 && page * 30 < data.total_count,
        );
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const buildQuery = () => {
    let query =
      "state:open type:issue is:public -label:duplicate -label:invalid -label:wontfix";

    if (filters.labels.length > 0) {
      filters.labels.forEach((label) => (query += ` label:"${label}"`));
    }
    if (filters.language) query += ` language:${filters.language}`;
    if (filters.keywords) query += ` ${filters.keywords}`;
    
    const minStarsInt = parseInt(filters.minStars);
    if (minStarsInt > 0) {
      query += ` stars:>=${minStarsInt}`;
    }

    return query;
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchIssues(currentPage + 1, false);
  };

  /* --- Bookmark Logic (using shared TanStack Query mutations) --- */
  const addBookmarkMutation = useAddBookmark(user?.id);
  const removeBookmarkMutation = useRemoveBookmark(user?.id);
  const queryClient = useQueryClient();

  const fetchBookmarkedIssues = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("issue_url")
        .eq("user_id", user.id);
      if (error) throw error;
      setBookmarkedIssues(new Set(data.map((b) => b.issue_url)));
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleBookmark = async (issue) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isBookmarked = bookmarkedIssues.has(issue.html_url);
    try {
      if (isBookmarked) {
        // Find the bookmark ID from the cached bookmarks
        const cachedBookmarks = queryClient.getQueryData(bookmarkKeys.all(user.id)) || [];
        const bookmark = cachedBookmarks.find(b => b.issue_url === issue.html_url);
        if (bookmark) {
          await removeBookmarkMutation.mutateAsync(bookmark.id);
        } else {
          // Fallback: delete directly if not in cache
          await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", user.id)
            .eq("issue_url", issue.html_url);
          queryClient.invalidateQueries({ queryKey: bookmarkKeys.all(user.id) });
        }
        setBookmarkedIssues((prev) => {
          const newSet = new Set(prev);
          newSet.delete(issue.html_url);
          return newSet;
        });
      } else {
        // Detect language: prefer the active filter, then try to extract from issue labels
        const detectedLanguage = filters.language ||
          issue.labels?.find((l) => languages.some((lang) => lang.name.toLowerCase() === l.name?.toLowerCase()))?.name?.toLowerCase() ||
          "unknown";

        await addBookmarkMutation.mutateAsync({
          title: issue.title,
          issue_url: issue.html_url,
          repo_name: issue.repository_url.split("/").slice(-2).join("/"),
          language: detectedLanguage,
          status: "saved",
        });
        setBookmarkedIssues((prev) => new Set([...prev, issue.html_url]));
      }
    } catch (error) {
      console.error("Error managing bookmark:", error);
    }
  };

  /* --- Render --- */
  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      <AppSidebar>
        {/* Explore-specific filters */}
        <div className="mt-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 select-none">
            Languages
          </p>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((lang) => (
              <button
                key={lang.name}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    language:
                      prev.language === lang.name.toLowerCase()
                        ? ""
                        : lang.name.toLowerCase(),
                  }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition-all ${
                  filters.language === lang.name.toLowerCase()
                    ? "bg-white/[0.04] border-zinc-700/85 text-white"
                    : "bg-transparent border-zinc-800/80 text-zinc-400 hover:border-zinc-700/60 hover:text-zinc-200"
                }`}
              >
                <div
                  className={`w-1 h-1 rounded-full bg-${lang.color}-500`}
                />
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 select-none">
            Labels
          </p>
          <div className="space-y-2.5">
            {labelOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200 select-none"
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                    filters.labels.includes(opt.id)
                      ? "border-zinc-700 bg-white/[0.08] text-white"
                      : "border-zinc-800 bg-zinc-950/50 text-transparent"
                  }`}
                >
                  {filters.labels.includes(opt.id) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={filters.labels.includes(opt.id)}
                  onChange={() => {
                    setFilters((prev) => ({
                      ...prev,
                      labels: prev.labels.includes(opt.id)
                        ? prev.labels.filter((l) => l !== opt.id)
                        : [...prev.labels, opt.id],
                    }));
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Project Stars Slider */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest select-none">
              Project Stars
            </p>
            <span className="text-xs font-bold text-white font-mono">
              {parseInt(filters.minStars) >= 10000
                ? "10k+"
                : parseInt(filters.minStars).toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={filters.minStars}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minStars: e.target.value }))
            }
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-2">
            <span>0</span>
            <span>10k+</span>
          </div>
        </div>
      </AppSidebar>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex flex-1 items-center max-w-xl relative">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search repositories, issues or topics..."
              className="w-full bg-zinc-950/40 border border-zinc-800/80 rounded-md py-1.5 pl-9 pr-12 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-650"
              value={filters.keywords}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keywords: e.target.value }))
              }
            />
            <div className="absolute right-3 flex items-center gap-0.5 border border-zinc-800/85 bg-white/[0.01] rounded px-1.5 py-0.5 select-none pointer-events-none">
              <Command className="w-2.5 h-2.5 text-zinc-600" />
              <span className="text-[9px] text-zinc-500 font-bold font-mono">K</span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/60">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user ? user.user_metadata?.full_name || "User" : "Guest"}
                </p>
                <p className="text-[10px] font-bold text-zinc-500 mt-0.5 uppercase tracking-wider">Lvl 4 Contributor</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-zinc-800 p-[1px] bg-zinc-900 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.email || "Guest"}`
                  }
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Explore Issues
            </h1>
            <p className="text-gray-400">
              Curated open-source opportunities tailored to your skills.
            </p>
          </div>

          {/* Filters Bar Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="bg-zinc-950/30 p-0.5 rounded-lg flex border border-zinc-800/60 overflow-x-auto scrollbar-hide">
              <TabButton
                label="All Issues"
                active={selectedTab === "all"}
                onClick={() => setSelectedTab("all")}
              />
              <TabButton
                label="Trending"
                active={selectedTab === "trending"}
                onClick={() => setSelectedTab("trending")}
              />
              <TabButton
                label="Trusted Repos"
                active={selectedTab === "trusted"}
                onClick={() => setSelectedTab("trusted")}
                icon={Shield}
              />
              <TabButton
                label="Smart Match"
                active={selectedTab === "smart"}
                onClick={() => setSelectedTab("smart")}
                icon={Sparkles}
                isPremium
              />
            </div>

            {selectedTab !== "trusted" && selectedTab !== "smart" && (
              <div className="flex items-center gap-2">
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/30 border border-zinc-800/80 rounded-md text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    {filters.sort === "updated"
                      ? "Recently Updated"
                      : "Recently Created"}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-zinc-950 border border-zinc-800/80 rounded-md shadow-2xl z-50 overflow-hidden p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: "updated" }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                          filters.sort === "updated"
                            ? "bg-white/[0.04] text-white font-medium"
                            : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"
                        }`}
                      >
                        Recently Updated
                      </button>
                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: "created" }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                          filters.sort === "created"
                            ? "bg-white/[0.04] text-white font-medium"
                            : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"
                        }`}
                      >
                        Recently Created
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {selectedTab === "smart" ? (
            /* Smart Match Tab Content */
            <SmartMatchTab
              username={user?.user_metadata?.user_name || user?.user_metadata?.preferred_username}
              token={null}
              userId={user?.id}
              bookmarkedIssues={bookmarkedIssues}
              onToggleBookmark={(issue) => {
                // SmartMatch issues use 'url' instead of 'html_url'
                const adaptedIssue = {
                  ...issue,
                  html_url: issue.url || issue.html_url,
                  repository_url: `https://api.github.com/repos/${issue.repo}`,
                };
                handleBookmark(adaptedIssue);
              }}
            />
          ) : selectedTab === "trusted" ? (
            /* Trusted Repos Tab Content */
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Trusted Repositories
                  </h2>
                  <p className="text-sm text-gray-500">
                    Hand-picked repos perfect for first contributions
                  </p>
                </div>
              </div>

              {loadingTrustedRepos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <TrustedRepoSkeleton key={i} />
                  ))}
                </div>
              ) : trustedRepos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {trustedRepos.map((repo) => (
                    <TrustedRepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    No trusted repos yet
                  </h3>
                  <p className="text-gray-500">
                    Curated repositories will appear here soon.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Issues Tab Content */
            <>
              {loading && issues.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <IssueSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {issues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        isBookmarked={bookmarkedIssues.has(issue.html_url)}
                        onToggleBookmark={() => handleBookmark(issue)}
                      />
                    ))}
                  </div>

                  {issues.length === 0 && !loading && (
                    <div className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <Search className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">
                        No issues found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your filters to find more results.
                      </p>
                      <button
                        onClick={resetAndFetch}
                        className="mt-6 px-4 py-2 border border-zinc-800 bg-white text-black hover:bg-zinc-200 rounded text-xs font-semibold transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {hasMore && issues.length > 0 && (
                    <div className="flex justify-center mt-12 pb-12">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-5 py-2 bg-zinc-950/20 border border-zinc-800/80 text-zinc-350 rounded hover:bg-white/[0.02] hover:text-white transition-all disabled:opacity-50 text-xs font-semibold"
                      >
                        {loadingMore ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        {loadingMore ? "Loading..." : "Load More Issues"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

/* --- Sub Components --- */

const TabButton = ({ label, active, onClick, icon: Icon, isPremium }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border ${
      active
        ? isPremium
          ? "bg-purple-950/20 text-purple-300 border-purple-500/30 shadow-[0_1px_2px_rgba(147,51,234,0.1)] font-semibold"
          : "bg-white/[0.04] text-white border-zinc-850/80 shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-semibold"
        : isPremium
          ? "text-purple-400/60 hover:text-purple-300 border-transparent hover:bg-white/[0.01]"
          : "text-zinc-400 hover:text-zinc-100 border-transparent hover:bg-white/[0.01]"
    }`}
  >
    {Icon && (
      <Icon
        className={`w-3.5 h-3.5 ${
          active
            ? isPremium ? "text-purple-400" : "text-white"
            : isPremium ? "text-purple-500/40" : "text-zinc-500"
        }`}
      />
    )}
    {label}
  </button>
);

const IssueCard = ({ issue, isBookmarked, onToggleBookmark }) => {
  const repoName = issue.repository_url.split("/").slice(-2).join("/");
  const timeAgo = formatTimeAgo(issue.created_at);

  return (
    <div className="bg-zinc-950/25 border border-zinc-800/60 rounded-xl p-6 hover:border-zinc-750 hover:bg-white/[0.01] transition-all duration-300 group flex flex-col h-full relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800/60 overflow-hidden">
            <img
              src={issue.user.avatar_url}
              alt="Repo"
              className="w-5 h-5 rounded-sm opacity-80"
            />
          </div>
          <div>
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white font-mono font-medium transition-colors"
            >
              {repoName}
            </a>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono mt-0.5">
              <Star className="w-3 h-3 text-zinc-650" />
              <span>{issue.score ? Math.floor(issue.score) : "—"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] text-zinc-500 font-mono">{timeAgo}</div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleBookmark();
            }}
            className={`p-1.5 rounded transition-all ${isBookmarked ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"}`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
        <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
          {issue.title}
        </a>
      </h3>

      <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3 flex-1">
        {issue.body
          ? issue.body.substring(0, 150) + "..."
          : "No description provided."}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/60">
        <div className="flex flex-wrap gap-1.5">
          {issue.labels.slice(0, 2).map((label) => (
            <Badge
              key={label.id}
              label={label.name.toUpperCase()}
              color={label.color}
            />
          ))}
        </div>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-250 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

const Badge = ({ label, color }) => {
  return (
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide select-none"
      style={{
        backgroundColor: color ? `#${color}10` : "rgba(244, 244, 245, 0.03)",
        color: color ? `#${color}` : "#a1a1aa",
        borderColor: color ? `#${color}20` : "rgba(244, 244, 245, 0.08)",
      }}
    >
      {label.length > 15 ? label.substring(0, 15) + "..." : label.toLowerCase()}
    </span>
  );
};

const TrustedRepoCard = ({ repo }) => {
  const difficultyColors = {
    beginner: {
      bg: "bg-emerald-500/5",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    intermediate: {
      bg: "bg-amber-500/5",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
    advanced: {
      bg: "bg-red-500/5",
      text: "text-red-400",
      border: "border-red-500/20",
    },
  };

  const colors = difficultyColors[repo.difficulty] || difficultyColors.beginner;

  return (
    <a
      href={repo.github_url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-zinc-950/25 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-750 hover:bg-white/[0.01] transition-all duration-300 group flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800/60 group-hover:border-zinc-750 transition-colors">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white group-hover:text-emerald-350 transition-colors line-clamp-1">
              {repo.title}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{repo.name}</p>
          </div>
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {repo.difficulty}
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2 flex-1">
        {repo.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-550">
            <Star className="w-3 h-3 text-zinc-650" />
            <span>{repo.stars?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-550">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
            <span>{repo.language}</span>
          </div>
        </div>
        {repo.tags && repo.tags.length > 0 && (
          <div className="flex gap-1.5">
            {repo.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.02] text-zinc-400 border border-zinc-800 uppercase tracking-wider font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};

const TrustedRepoSkeleton = () => (
  <div className="bg-zinc-950/25 border border-zinc-800/60 rounded-xl p-5 h-[180px] animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded bg-white/5" />
      <div className="space-y-2 flex-1">
        <div className="w-3/4 h-3 bg-white/5 rounded" />
        <div className="w-1/2 h-2.5 bg-white/5 rounded" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-2.5 bg-white/5 rounded" />
      <div className="w-2/3 h-2.5 bg-white/5 rounded" />
    </div>
    <div className="flex gap-4 pt-3 border-t border-zinc-800/60">
      <div className="w-16 h-2.5 bg-white/5 rounded" />
      <div className="w-16 h-2.5 bg-white/5 rounded" />
    </div>
  </div>
);

const IssueSkeleton = () => (
  <div className="bg-zinc-950/25 border border-zinc-800/60 rounded-xl p-6 h-[300px] animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded bg-white/5" />
      <div className="space-y-2 flex-1">
        <div className="w-24 h-3 bg-white/5 rounded" />
        <div className="w-12 h-2.5 bg-white/5 rounded" />
      </div>
    </div>
    <div className="w-full h-5 bg-white/5 rounded mb-4" />
    <div className="w-2/3 h-5 bg-white/5 rounded mb-8" />
    <div className="space-y-2">
      <div className="w-full h-2.5 bg-white/5 rounded" />
      <div className="w-full h-2.5 bg-white/5 rounded" />
      <div className="w-3/4 h-2.5 bg-white/5 rounded" />
    </div>
  </div>
);

// Helper for 'RefreshCw' used in Load More
const RefreshCw = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default ExplorePage;
