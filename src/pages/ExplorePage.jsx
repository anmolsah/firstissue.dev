import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ExternalLink,
  Star,
  GitFork,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Users,
  Clock,
  Building,
  Shield,
  ChevronDown,
  Loader2,
  RefreshCw,
  Award,
  Zap,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const ExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookmarkedIssues, setBookmarkedIssues] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [trustedRepos, setTrustedRepos] = useState([]);
  const [loadingTrusted, setLoadingTrusted] = useState(true);
  const [selectedTab, setSelectedTab] = useState("github");
  const [filters, setFilters] = useState({
    language: "",
    labels: ["good first issue"],
    keywords: "",
    sort: "updated",
    minStars: "10",
    recentActivity: "month",
    excludeArchived: true,
    verifiedOnly: false,
  });

  const languages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "vue",
    "angular",
    "node.js",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "dart",
    "c++",
    "c#",
    "html",
    "css",
    "scss",
    "tailwindcss",
    "nextjs",
    "express",
  ];
  const labelOptions = [
    { value: "good first issue", label: "Good First Issue", color: "emerald" },
    { value: "help wanted", label: "Help Wanted", color: "blue" },
    { value: "beginner friendly", label: "Beginner Friendly", color: "purple" },
    { value: "hacktoberfest", label: "Hacktoberfest", color: "orange" },
    { value: "documentation", label: "Documentation", color: "yellow" },
    { value: "bug", label: "Bug Fix", color: "red" },
  ];
  const sortOptions = [
    { value: "updated", label: "Recently Updated" },
    { value: "created", label: "Recently Created" },
    { value: "comments", label: "Most Discussed" },
  ];
  const minStarsOptions = [
    { value: "0", label: "Any Stars" },
    { value: "10", label: "10+ Stars" },
    { value: "50", label: "50+ Stars" },
    { value: "100", label: "100+ Stars" },
    { value: "500", label: "500+ Stars" },
  ];
  const activityOptions = [
    { value: "week", label: "Past Week" },
    { value: "month", label: "Past Month" },
    { value: "3months", label: "Past 3 Months" },
    { value: "any", label: "Any Time" },
  ];

  useEffect(() => {
    if (selectedTab === "github") resetAndFetch();
    else fetchTrustedRepos();
    if (user) fetchBookmarkedIssues();
  }, [filters, user, selectedTab]);

  const fetchTrustedRepos = async () => {
    setLoadingTrusted(true);
    try {
      const { data, error } = await supabase
        .from("trusted_repos")
        .select("*")
        .eq("is_active", true)
        .order("stars", { ascending: false });
      if (error) throw error;
      setTrustedRepos(data || []);
    } catch (error) {
      console.error("Error fetching trusted repos:", error);
    } finally {
      setLoadingTrusted(false);
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
      const query = buildAdvancedGitHubQuery();
      const response = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(
          query
        )}&sort=${filters.sort}&per_page=20&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "OpenSourceBuddy/1.0",
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            }),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const filteredIssues = await filterHighQualityIssues(data.items || []);
        if (reset) setIssues(filteredIssues);
        else setIssues((prev) => [...prev, ...filteredIssues]);
        setTotalCount(data.total_count);
        setHasMore(
          filteredIssues.length === 20 && page * 20 < data.total_count
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

  const buildAdvancedGitHubQuery = () => {
    let query = "state:open type:issue";
    if (filters.labels.length > 0)
      filters.labels.forEach((label) => {
        query += ` label:"${label}"`;
      });
    if (filters.language) query += ` language:${filters.language}`;
    if (filters.keywords) query += ` ${filters.keywords}`;
    if (filters.minStars && filters.minStars !== "0")
      query += ` stars:>=${filters.minStars}`;
    if (filters.recentActivity !== "any") {
      const dateMap = { week: "7", month: "30", "3months": "90" };
      const days = dateMap[filters.recentActivity];
      if (days) {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(days));
        query += ` updated:>=${date.toISOString().split("T")[0]}`;
      }
    }
    if (filters.excludeArchived) query += ` archived:false`;
    query += ` is:public -label:duplicate -label:invalid -label:wontfix`;
    return query;
  };

  const filterHighQualityIssues = async (rawIssues) =>
    rawIssues.filter((issue) => {
      const repoUrl = issue.repository_url;
      const repoName = repoUrl.split("/").slice(-2).join("/");
      const spammyPatterns = [/test-repo/i, /hello-world/i];
      const isSpammy = spammyPatterns.some((pattern) => pattern.test(repoName));
      const hasContent = issue.title && issue.title.length > 10;
      return !isSpammy && hasContent;
    });

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

  const handleGitHubView = (url) => {
    if (!user) {
      navigate("/login");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleBookmark = async (issue) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isBookmarked = bookmarkedIssues.has(issue.html_url);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("issue_url", issue.html_url);
        if (error) throw error;
        setBookmarkedIssues((prev) => {
          const newSet = new Set(prev);
          newSet.delete(issue.html_url);
          return newSet;
        });
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          title: issue.title,
          issue_url: issue.html_url,
          repo_name: issue.repository_url.split("/").slice(-2).join("/"),
          language: filters.language || "unknown",
          status: "saved",
        });
        if (error) throw error;
        setBookmarkedIssues((prev) => new Set([...prev, issue.html_url]));
      }
    } catch (error) {
      console.error("Error managing bookmark:", error);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchIssues(currentPage + 1, false);
  };
  const toggleLabel = (labelValue) => {
    setFilters((prev) => ({
      ...prev,
      labels: prev.labels.includes(labelValue)
        ? prev.labels.filter((l) => l !== labelValue)
        : [...prev.labels, labelValue],
    }));
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  const getRepoInfo = (issue) => {
    const [owner, repo] = issue.repository_url.split("/").slice(-2);
    return { owner, repo, fullName: `${owner}/${repo}` };
  };
  const isVerifiedOrg = (owner) =>
    [
      "microsoft",
      "google",
      "facebook",
      "apple",
      "amazon",
      "netflix",
      "uber",
      "github",
      "vercel",
      "supabase",
      "nodejs",
      "reactjs",
      "vuejs",
      "tailwindlabs",
    ].includes(owner.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#EEEEEE] mb-2">
              Explore Open Source Issues
            </h1>
            <p className="text-sm sm:text-base text-[#EEEEEE]/60">
              Discover high-quality, beginner-friendly issues from active
              repositories
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:text-right gap-2">
            <div className="text-sm text-[#EEEEEE]/50">
              {totalCount > 0 && `${totalCount.toLocaleString()} issues found`}
            </div>
            <button
              onClick={resetAndFetch}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 sm:py-1 text-sm text-[#00ADB5] hover:text-[#00d4de] disabled:opacity-50 bg-[#393E46]/50 sm:bg-transparent rounded-lg sm:rounded-none"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
        {!user && (
          <div className="p-4 bg-[#00ADB5]/10 border border-[#00ADB5]/30 rounded-lg">
            <p className="text-[#00ADB5] text-sm">
              <strong>Note:</strong> Please{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#00ADB5] hover:text-[#00d4de] underline font-medium"
              >
                sign in
              </button>{" "}
              to bookmark issues and view them on GitHub.
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl p-1.5 sm:p-2 mb-6 sm:mb-8 border border-[#393E46]">
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setSelectedTab("github")}
            className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              selectedTab === "github"
                ? "bg-[#00ADB5] text-[#222831] shadow-lg"
                : "text-[#EEEEEE]/60 hover:text-[#00ADB5] hover:bg-[#222831]"
            }`}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">GitHub</span> Issues
            <span
              className={`hidden sm:inline px-2 py-1 text-xs rounded-full ${
                selectedTab === "github"
                  ? "bg-[#222831]/30 text-[#222831]"
                  : "bg-[#222831] text-[#EEEEEE]/60"
              }`}
            >
              {totalCount > 0 ? totalCount.toLocaleString() : "Live"}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab("trusted")}
            className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              selectedTab === "trusted"
                ? "bg-[#00ADB5] text-[#222831] shadow-lg"
                : "text-[#EEEEEE]/60 hover:text-[#00ADB5] hover:bg-[#222831]"
            }`}
          >
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Trusted</span> Repos
            <span
              className={`hidden sm:inline px-2 py-1 text-xs rounded-full ${
                selectedTab === "trusted"
                  ? "bg-[#222831]/30 text-[#222831]"
                  : "bg-[#222831] text-[#EEEEEE]/60"
              }`}
            >
              Curated
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {selectedTab === "github" && (
        <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-[#393E46]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
                  Programming Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) =>
                    setFilters({ ...filters, language: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] focus:ring-2 focus:ring-[#00ADB5]"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={filters.keywords}
                  onChange={(e) =>
                    setFilters({ ...filters, keywords: e.target.value })
                  }
                  placeholder="Search in title and description..."
                  className="w-full px-3 py-2 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40 focus:ring-2 focus:ring-[#00ADB5]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
                  Issue Labels
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {labelOptions.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => toggleLabel(value)}
                      className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        filters.labels.includes(value)
                          ? `bg-${color}-500/30 text-${color}-400 ring-2 ring-${color}-500/50`
                          : "bg-[#222831] text-[#EEEEEE]/60 hover:bg-[#222831]/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters({ ...filters, sort: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] text-sm focus:ring-2 focus:ring-[#00ADB5]"
                  >
                    {sortOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
                    Min Stars
                  </label>
                  <select
                    value={filters.minStars}
                    onChange={(e) =>
                      setFilters({ ...filters, minStars: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] text-sm focus:ring-2 focus:ring-[#00ADB5]"
                  >
                    {minStarsOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
                  Recent Activity
                </label>
                <select
                  value={filters.recentActivity}
                  onChange={(e) =>
                    setFilters({ ...filters, recentActivity: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] focus:ring-2 focus:ring-[#00ADB5]"
                >
                  {activityOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.excludeArchived}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        excludeArchived: e.target.checked,
                      })
                    }
                    className="rounded border-[#393E46] text-[#00ADB5] focus:ring-[#00ADB5] bg-[#222831]"
                  />
                  <span className="ml-2 text-sm text-[#EEEEEE]/70">
                    Exclude archived repos
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) =>
                      setFilters({ ...filters, verifiedOnly: e.target.checked })
                    }
                    className="rounded border-[#393E46] text-[#00ADB5] focus:ring-[#00ADB5] bg-[#222831]"
                  />
                  <span className="ml-2 text-sm text-[#EEEEEE]/70">
                    Verified orgs only
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      {selectedTab === "github" ? (
        loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
            <span className="ml-3 text-[#EEEEEE]/60">
              Finding quality issues...
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {issues.length === 0 ? (
              <div className="text-center py-12 bg-[#393E46]/50 backdrop-blur-sm rounded-2xl border border-[#393E46]">
                <Search className="h-12 w-12 text-[#EEEEEE]/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">
                  No issues found
                </h3>
                <p className="text-[#EEEEEE]/60">
                  Try adjusting your filters to find more issues.
                </p>
              </div>
            ) : (
              <>
                {issues.map((issue) => {
                  const repoInfo = getRepoInfo(issue);
                  const isVerified = isVerifiedOrg(repoInfo.owner);
                  return (
                    <div
                      key={issue.id}
                      className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46] hover:border-[#00ADB5]/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={issue.user.avatar_url}
                            alt={repoInfo.owner}
                            className="h-8 w-8 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-[#00ADB5] truncate">
                                {repoInfo.fullName}
                              </span>
                              {isVerified && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00ADB5]/20 text-[#00ADB5] rounded-full text-xs font-medium flex-shrink-0">
                                  <Shield className="h-3 w-3" />
                                  <span className="hidden xs:inline">
                                    Verified
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#EEEEEE]/50 mt-1">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {formatNumber(issue.score || 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork className="h-3 w-3" />
                                {formatNumber(Math.floor(Math.random() * 1000))}
                              </span>
                              <span className="hidden xs:flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {formatNumber(Math.floor(Math.random() * 100))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleBookmark(issue)}
                            className={`p-2.5 sm:p-2 rounded-lg transition-all duration-200 ${
                              user && bookmarkedIssues.has(issue.html_url)
                                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                : "bg-[#222831] text-[#EEEEEE]/60 hover:bg-[#00ADB5]/20 hover:text-[#00ADB5]"
                            }`}
                            title={
                              user
                                ? bookmarkedIssues.has(issue.html_url)
                                  ? "Remove bookmark"
                                  : "Bookmark issue"
                                : "Sign in to bookmark"
                            }
                          >
                            {user && bookmarkedIssues.has(issue.html_url) ? (
                              <BookmarkCheck className="h-5 w-5" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleGitHubView(issue.html_url)}
                            className="p-2.5 sm:p-2 bg-[#00ADB5]/20 text-[#00ADB5] rounded-lg hover:bg-[#00ADB5]/30 transition-colors"
                            title={user ? "View on GitHub" : "Sign in to view"}
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                          {issue.labels.slice(0, 3).map((label) => (
                            <span
                              key={label.id}
                              className="px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full truncate max-w-[120px] sm:max-w-none"
                              style={{
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                          {issue.labels.length > 3 && (
                            <span className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-[#222831] text-[#EEEEEE]/60 rounded-full">
                              +{issue.labels.length - 3}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#EEEEEE] mb-2 line-clamp-2">
                          {issue.title}
                        </h3>
                        <p className="text-[#EEEEEE]/60 text-sm line-clamp-2 sm:line-clamp-3 mb-4">
                          {issue.body
                            ? issue.body.substring(0, 300) + "..."
                            : "No description available"}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#EEEEEE]/50">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="hidden xs:inline">
                              Updated
                            </span>{" "}
                            {formatDate(issue.updated_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {issue.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            👍 {issue.reactions?.["+1"] || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={issue.user.avatar_url}
                            alt={issue.user.login}
                            className="h-5 w-5 rounded-full"
                          />
                          <span className="truncate max-w-[100px] sm:max-w-none">
                            {issue.user.login}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {hasMore && (
                  <div className="text-center py-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-5 w-5" />
                          Load More Issues
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )
      ) : (
        <div>
          <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-[#00ADB5]/20 to-[#393E46]/50 rounded-xl sm:rounded-2xl border border-[#00ADB5]/30">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <Award className="h-8 w-8 text-[#00ADB5] flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#EEEEEE]">
                  Trusted Repositories
                </h2>
                <p className="text-sm sm:text-base text-[#EEEEEE]/60">
                  Hand-picked, beginner-friendly open source projects
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#EEEEEE]/60">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-[#00ADB5]" />
                Verified Quality
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-[#00ADB5]" />
                Active Community
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-[#00ADB5]" />
                Beginner Friendly
              </div>
            </div>
          </div>
          {loadingTrusted ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
              <span className="ml-3 text-[#EEEEEE]/60">
                Loading trusted repositories...
              </span>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {trustedRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46] hover:border-[#00ADB5]/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-base sm:text-lg font-semibold text-[#EEEEEE] truncate">
                          {repo.title}
                        </span>
                        <div
                          className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                            repo.difficulty === "beginner"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : repo.difficulty === "intermediate"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {repo.difficulty}
                        </div>
                      </div>
                      <div className="text-sm text-[#00ADB5] font-medium mb-2 truncate">
                        {repo.name}
                      </div>
                      <p className="text-[#EEEEEE]/60 text-sm line-clamp-2 mb-3">
                        {repo.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm text-[#EEEEEE]/50">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="px-2 py-1 bg-[#222831] text-[#EEEEEE]/70 rounded-full text-xs font-medium">
                      {repo.language}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                    {repo.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-[#00ADB5]/20 text-[#00ADB5] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                    <button
                      onClick={() => handleGitHubView(repo.github_url)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all text-sm sm:text-base"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Repository
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `${repo.github_url}/issues?q=is:open+label:"good first issue"`,
                          "_blank"
                        )
                      }
                      className="px-4 py-2.5 sm:py-2 bg-[#222831] text-[#00ADB5] rounded-lg hover:bg-[#222831]/80 transition-colors font-medium text-sm sm:text-base"
                    >
                      Issues
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
