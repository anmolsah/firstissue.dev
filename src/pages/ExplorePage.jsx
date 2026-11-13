import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAddBookmark, useRemoveBookmark, bookmarkKeys } from "../hooks/queries/useBookmarks";
import { useQueryClient } from "@tanstack/react-query";
import SmartMatchTab from "../components/SmartMatchTab";
import AppSidebar from "../components/AppSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import ContributionKitModal from "../components/ContributionKitModal";
import {
  buildGitHubIssueSearchQuery,
  filterStaleIssues,
  scoreIssueReadiness,
  enrichAndSortIssues,
  formatCompactNumber,
} from "../utils/issueQualityFilter";
import { getCache, setCache } from "../utils/cache";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  ChevronDown,
  Command,
  Loader2,
  ExternalLink,
  Shield,
  GitPullRequest,
  Rocket,
  Globe,
  Wrench,
  RefreshCw,
  SlidersHorizontal,
  X,
  MessageSquare,
  Sparkles,
  Activity,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { withUTM } from "../utils/utm";
import { trackIssueClick } from "../utils/analytics";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(now - date) / 36e5;
  if (diffHours < 24) return `${Math.ceil(diffHours)}h ago`;
  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays}d ago`;
};

const LANGUAGES = [
  { name: "TypeScript", dot: "#3B82F6" },
  { name: "JavaScript", dot: "#EAB308" },
  { name: "Python", dot: "#60A5FA" },
  { name: "Go", dot: "#22D3EE" },
  { name: "Rust", dot: "#F97316" },
  { name: "Java", dot: "#EF4444" },
  { name: "C++", dot: "#38BDF8" },
  { name: "C#", dot: "#A8ADB6" },
  { name: "PHP", dot: "#94A3B8" },
  { name: "Swift", dot: "#FB923C" },
  { name: "Ruby", dot: "#F87171" },
  { name: "Kotlin", dot: "#F59E0B" },
  { name: "Dart", dot: "#34D399" },
];

const LABEL_OPTIONS = [
  { id: "good first issue", label: "Good First Issue" },
  { id: "help wanted", label: "Help Wanted" },
  { id: "beginner friendly", label: "Beginner Friendly" },
  { id: "hacktoberfest", label: "Hacktoberfest" },
  { id: "documentation", label: "Documentation" },
  { id: "bug", label: "Bug Fix" },
];

const ExplorePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    document.title = "Explore Beginner-Friendly Open Source Issues | FirstIssue.dev";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Find open source issues labeled good first issue and help wanted. Filter by language and stars to start contributing today."
      );
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [trustedRepos, setTrustedRepos] = useState([]);
  const [loadingTrustedRepos, setLoadingTrustedRepos] = useState(true);

  const [startupOrgs, setStartupOrgs] = useState([]);
  const [loadingStartupOrgs, setLoadingStartupOrgs] = useState(true);

  const [orgSearchQuery, setOrgSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    language: "",
    labels: ["good first issue"],
    keywords: "",
    sort: "updated",
    minStars: "0",
  });

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut Cmd/Ctrl + K focuses search input
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) fetchBookmarkedIssues();
    if (selectedTab === "trusted" || selectedTab === "startups" || selectedTab === "smart") {
      return;
    }

    const timer = setTimeout(() => {
      resetAndFetch();
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, selectedTab, user]);

  useEffect(() => {
    fetchTrustedRepos();
  }, []);

  useEffect(() => {
    fetchStartupOrgs();
  }, []);

  const fetchTrustedRepos = async () => {
    try {
      setLoadingTrustedRepos(true);
      const { data, error } = await supabase
        .from("trusted_repos")
        .select("*")
        .eq("is_active", true)
        .order("stars", { ascending: false })
        .limit(69);

      if (error) throw error;
      setTrustedRepos(data || []);
    } catch (error) {
      console.error("Error fetching trusted repos:", error);
    } finally {
      setLoadingTrustedRepos(false);
    }
  };

  const fetchStartupOrgs = async () => {
    try {
      setLoadingStartupOrgs(true);
      const { data, error } = await supabase
        .from("startup_orgs")
        .select("*")
        .eq("is_active", true)
        .eq("is_startup", true)
        .order("stars", { ascending: false })
        .limit(63);

      if (error) throw error;
      setStartupOrgs(data || []);
    } catch (error) {
      console.error("Error fetching startup orgs:", error);
    } finally {
      setLoadingStartupOrgs(false);
    }
  };

  const resetAndFetch = () => {
    setCurrentPage(1);
    setIssues([]);
    setHasMore(true);
    fetchIssues(1, true);
  };

  const handleClearFilters = () => {
    setFilters({
      language: "",
      labels: ["good first issue"],
      keywords: "",
      sort: "updated",
      minStars: "0",
    });
  };

  const getClientGithubHeaders = () => ({
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "OpenSourceBuddy/1.0",
    ...(import.meta.env.VITE_GITHUB_TOKEN && {
      Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    }),
  });

  const enrichClientIssuesWithRepoMeta = async (rawItems, minStarsInt) => {
    const trustedStarMap = new Map(
      (trustedRepos || []).map((repo) => [
        repo.full_name || `${repo.owner}/${repo.name}`,
        repo.stars,
      ])
    );

    const repoNames = Array.from(
      new Set(
        rawItems
          .map((item) => item.repository_url?.split("/").slice(-2).join("/"))
          .filter(Boolean)
      )
    );

    const metaMap = new Map();
    const healthMap = new Map();
    const uncached = [];

    // Best-effort lookup from persisted Supabase repo_health table
    if (repoNames.length > 0) {
      try {
        const { data: healthRows, error: healthErr } = await supabase
          .from("repo_health")
          .select("*")
          .in("repo_full_name", repoNames);
        if (!healthErr && Array.isArray(healthRows)) {
          for (const row of healthRows) {
            healthMap.set(row.repo_full_name, row);
            metaMap.set(row.repo_full_name, {
              stars: Number(row.stars ?? 0),
              pushed_at: row.last_pushed_at ?? null,
              archived: Boolean(row.is_archived),
            });
          }
        }
      } catch {
        // Table may not be migrated yet; continue silently
      }
    }

    for (const repoName of repoNames) {
      if (metaMap.has(repoName)) continue;
      const cached = getCache(`repo_meta_v1_${repoName}`);
      if (cached && typeof cached.stars === "number") {
        metaMap.set(repoName, cached);
        continue;
      }
      if (trustedStarMap.has(repoName) && typeof trustedStarMap.get(repoName) === "number") {
        const meta = { stars: trustedStarMap.get(repoName), pushed_at: null, archived: false };
        metaMap.set(repoName, meta);
        continue;
      }
      uncached.push(repoName);
    }

    const clientToken = import.meta.env.VITE_GITHUB_TOKEN;
    if (uncached.length > 0 && clientToken) {
      const chunk = uncached.slice(0, 30);
      const fields = chunk
        .map((fullName, idx) => {
          const [owner, name] = fullName.split("/");
          if (!/^[a-zA-Z0-9._-]+$/.test(owner) || !/^[a-zA-Z0-9._-]+$/.test(name)) return "";
          return `r${idx}: repository(owner: "${owner}", name: "${name}") { stargazerCount pushedAt isArchived }`;
        })
        .filter(Boolean)
        .join("\n");

      if (fields) {
        try {
          const gqlRes = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${clientToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: `query {\n${fields}\n}` }),
          });
          if (gqlRes.ok) {
            const payload = await gqlRes.json();
            const data = payload?.data || {};
            chunk.forEach((fullName, idx) => {
              const node = data[`r${idx}`];
              if (!node) return;
              const meta = {
                stars: Number(node.stargazerCount ?? 0),
                pushed_at: node.pushedAt ?? null,
                archived: Boolean(node.isArchived),
              };
              metaMap.set(fullName, meta);
              setCache(`repo_meta_v1_${fullName}`, meta, 6 * 60 * 60 * 1000);
            });
          }
        } catch (err) {
          console.warn("GraphQL repo metadata fallback skipped:", err);
        }
      }
    } else if (uncached.length > 0 && minStarsInt > 0) {
      // Only perform lightweight REST repo lookups when filtering by stars without a client token.
      await Promise.all(
        uncached.slice(0, 12).map(async (fullName) => {
          try {
            const res = await fetch(`https://api.github.com/repos/${fullName}`, {
              headers: getClientGithubHeaders(),
            });
            if (!res.ok) return;
            const repo = await res.json();
            const meta = {
              stars: Number(repo.stargazers_count ?? 0),
              pushed_at: repo.pushed_at ?? null,
              archived: Boolean(repo.archived),
            };
            metaMap.set(fullName, meta);
            setCache(`repo_meta_v1_${fullName}`, meta, 6 * 60 * 60 * 1000);
          } catch {
            // Keep graceful fallback when GitHub unauthenticated limit is tight
          }
        })
      );
    }

    return rawItems.map((item) => {
      const repoName = item.repository_url?.split("/").slice(-2).join("/") || "";
      const meta = metaMap.get(repoName);
      const health = healthMap.get(repoName) || null;
      if (!meta && !health) return item;
      return {
        ...item,
        repo_stars: meta?.stars ?? item.repo_stars ?? null,
        repo_pushed_at: meta?.pushed_at ?? item.repo_pushed_at ?? null,
        repo_archived: meta?.archived ?? item.repo_archived ?? false,
        repo_health: health || item.repo_health || null,
      };
    });
  };

  const findClientReposByStars = async (minStarsInt) => {
    const cacheKey = `explore_repos_${filters.language || "all"}_${minStarsInt}`;
    const cached = getCache(cacheKey);
    if (Array.isArray(cached) && cached.length > 0) return cached;

    const cleanLang = (filters.language || "").trim();
    const langPart = cleanLang
      ? /\s/.test(cleanLang)
        ? `language:"${cleanLang}"`
        : `language:${cleanLang}`
      : "";

    for (const extra of ["good-first-issues:>0", ""]) {
      const repoQuery = `stars:>=${minStarsInt} archived:false is:public ${langPart} ${extra}`
        .replace(/\s+/g, " ")
        .trim();
      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(repoQuery)}&sort=stars&order=desc&per_page=15`,
          { headers: getClientGithubHeaders() }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const repos = (data.items || []).map((repo) => repo.full_name).filter(Boolean);
        if (repos.length > 0) {
          setCache(cacheKey, repos, 10 * 60 * 1000);
          return repos;
        }
      } catch {
        // Ignore transient repo lookup failure and fall back to unrestricted issue search
      }
    }

    return [];
  };

  const fetchIssues = async (page = 1, reset = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const minStarsInt = Math.max(0, parseInt(filters.minStars, 10) || 0);
    const isTrending = selectedTab === "trending";

    try {
      let rawItems = [];
      let rawCount = 0;
      let rawTotalCount = 0;
      let loadedViaEdge = false;

      // 1. Try Supabase Edge Function (`exploreSearch`) for server-token GraphQL stars + Redis caching
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke("github-data", {
          body: {
            action: "exploreSearch",
            labels: filters.labels,
            language: filters.language,
            keywords: filters.keywords,
            sort: filters.sort,
            minStars: minStarsInt,
            trending: isTrending,
            page,
          },
        });
        if (!edgeError && edgeData && Array.isArray(edgeData.items)) {
          rawItems = edgeData.items;
          rawCount = Number(edgeData.raw_count ?? edgeData.items.length);
          rawTotalCount = Number(edgeData.total_count ?? edgeData.items.length);
          loadedViaEdge = true;
        }
      } catch {
        // Fallback smoothly to direct GitHub Search API when Edge Function is unavailable
      }

      // 2. Direct GitHub Search API fallback
      if (!loadedViaEdge) {
        let extraRepoQualifiers = [];
        if (minStarsInt > 0 && !filters.keywords.trim()) {
          extraRepoQualifiers = await findClientReposByStars(minStarsInt);
        }

        const query = buildGitHubIssueSearchQuery({
          labels: filters.labels,
          language: extraRepoQualifiers.length === 0 ? filters.language : "",
          keywords: filters.keywords,
          trending: isTrending,
          trendingDays: 30,
          extraRepoQualifiers,
        });

        const githubSort = isTrending
          ? "interactions"
          : filters.sort === "created"
            ? "created"
            : "updated";

        const response = await fetch(
          `https://api.github.com/search/issues?q=${encodeURIComponent(
            query
          )}&sort=${githubSort}&order=desc&per_page=30&page=${page}`,
          { headers: getClientGithubHeaders() }
        );

        if (response.ok) {
          const data = await response.json();
          const fetchedItems = data.items || [];
          rawCount = fetchedItems.length;
          rawTotalCount = Number(data.total_count ?? fetchedItems.length);
          rawItems = await enrichClientIssuesWithRepoMeta(fetchedItems, minStarsInt);
        }
      }

      const filteredIssues = filterStaleIssues(rawItems, { minStars: minStarsInt });
      const preparedIssues = enrichAndSortIssues(filteredIssues, filters.sort);

      if (reset) {
        setIssues(preparedIssues);
      } else {
        setIssues((prev) => {
          const seenIds = new Set(prev.map((item) => item.id));
          const merged = [...prev, ...preparedIssues.filter((item) => !seenIds.has(item.id))];
          return filters.sort === "best" || filters.sort === "health"
            ? enrichAndSortIssues(merged, filters.sort)
            : merged;
        });
      }

      const cappedTotal = Math.min(rawTotalCount, 1000);
      setTotalCount(cappedTotal);
      setHasMore(rawCount === 30 && page * 30 < cappedTotal);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchIssues(currentPage + 1, false);
  };

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
        const cachedBookmarks = queryClient.getQueryData(bookmarkKeys.all(user.id)) || [];
        const bookmark = cachedBookmarks.find((b) => b.issue_url === issue.html_url);
        if (bookmark) {
          await removeBookmarkMutation.mutateAsync(bookmark.id);
        } else {
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
        const detectedLanguage =
          filters.language ||
          issue.labels
            ?.find((l) =>
              LANGUAGES.some((lang) => lang.name.toLowerCase() === l.name?.toLowerCase())
            )
            ?.name?.toLowerCase() ||
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

  const FilterControls = () => (
    <div className="space-y-6">
      {/* Languages */}
      <div>
        <p className="text-[11px] font-mono font-semibold text-[#8C929C] uppercase tracking-wider mb-3 select-none">
          Languages
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((lang) => {
            const isSelected = filters.language === lang.name.toLowerCase();
            return (
              <button
                key={lang.name}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    language:
                      prev.language === lang.name.toLowerCase()
                        ? ""
                        : lang.name.toLowerCase(),
                  }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#17181B] border-[#DAFA9C]/60 text-[#DAFA9C]"
                    : "bg-[#141518] border-[#22242A] text-[#A8ADB6] hover:border-[#3A3E48] hover:text-[#F4F4F0]"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: lang.dot }}
                  aria-hidden="true"
                />
                {lang.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div>
        <p className="text-[11px] font-mono font-semibold text-[#8C929C] uppercase tracking-wider mb-3 select-none">
          Labels
        </p>
        <div className="space-y-2">
          {LABEL_OPTIONS.map((opt) => {
            const checked = filters.labels.includes(opt.id);
            const inputId = `explore-label-${opt.id.replace(/\s+/g, "-")}`;
            return (
              <label
                key={opt.id}
                htmlFor={inputId}
                className="flex items-center gap-2.5 text-xs text-[#A8ADB6] cursor-pointer hover:text-[#F4F4F0] select-none py-0.5"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => {
                    setFilters((prev) => ({
                      ...prev,
                      labels: prev.labels.includes(opt.id)
                        ? prev.labels.filter((l) => l !== opt.id)
                        : [...prev.labels, opt.id],
                    }));
                  }}
                />
                <span
                  aria-hidden="true"
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                    checked
                      ? "border-[#DAFA9C] bg-[#DAFA9C]/15"
                      : "border-[#2B2E36] bg-[#0B0C0E]"
                  }`}
                >
                  {checked && <span className="w-2 h-2 rounded-[2px] bg-[#DAFA9C]" />}
                </span>
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Min Stars Slider */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label
            htmlFor="explore-min-stars"
            className="text-[11px] font-mono font-semibold text-[#8C929C] uppercase tracking-wider select-none"
          >
            Min Stars
          </label>
          <span className="text-xs font-semibold text-[#F4F4F0] font-mono tabular-nums">
            {parseInt(filters.minStars, 10) >= 10000
              ? "10k+"
              : parseInt(filters.minStars, 10).toLocaleString()}
          </span>
        </div>
        <input
          id="explore-min-stars"
          type="range"
          min="0"
          max="10000"
          step="100"
          value={filters.minStars}
          onChange={(e) => setFilters((prev) => ({ ...prev, minStars: e.target.value }))}
          className="w-full h-1.5 bg-[#22242A] rounded-[4px] appearance-none cursor-pointer accent-[#DAFA9C]"
        />
        <div className="flex justify-between text-[11px] font-mono text-[#8C929C] mt-1.5 tabular-nums">
          <span>0</span>
          <span>10k+</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#0F0F0F] min-h-screen text-[#F4F4F0] font-sans">
      <AppSidebar>
        <div className="mt-4">
          <FilterControls />
        </div>
      </AppSidebar>

      {/* Main Workspace */}
      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Sticky Top Header */}
        <header className="h-16 border-b border-[#22242A] bg-[#0F0F0F]/95 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 gap-3">
          <div className="flex flex-1 items-center max-w-xl relative">
            <Search className="absolute left-3 w-4 h-4 text-[#8C929C]" />
            <input
              ref={searchInputRef}
              type="text"
              aria-label="Search repositories, issues or topics"
              placeholder="Search repositories, issues or topics..."
              className="w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] py-2 pl-9 pr-14 text-xs text-[#F4F4F0] focus:outline-none focus:border-[#DAFA9C] transition-colors placeholder:text-[#8C929C]"
              value={filters.keywords}
              onChange={(e) => setFilters((prev) => ({ ...prev, keywords: e.target.value }))}
            />
            <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 border border-[#2B2E36] bg-[#0B0C0E] rounded-[4px] px-1.5 py-0.5 select-none pointer-events-none">
              <Command className="w-2.5 h-2.5 text-[#8C929C]" />
              <span className="text-[11px] text-[#8C929C] font-mono">K</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-[#141518] border border-[#2B2E36] rounded-[4px] text-xs font-medium text-[#F4F4F0] hover:border-[#3A3E48] cursor-pointer min-h-[40px]"
              aria-expanded={mobileFiltersOpen}
              aria-label="Toggle issue filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#DAFA9C]" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-[#22242A]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-[#F4F4F0] leading-tight">
                  {user ? user.user_metadata?.full_name || "Contributor" : "Guest"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.email || "Guest"}`
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile / Tablet Collapsible Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden border-b border-[#2B2E36] bg-[#141518] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F4F4F0]">
                Filter Dispatch Queue
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="p-1.5 text-[#8C929C] hover:text-[#F4F4F0] bg-[#0B0C0E] border border-[#22242A] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterControls />
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F4F0] mb-1">
                Explore Issues
              </h1>
              <p className="text-sm text-[#A8ADB6]">
                Curated open-source issues checked for active maintainers and clear acceptance criteria.
              </p>
            </div>
            {selectedTab !== "trusted" &&
              selectedTab !== "smart" &&
              selectedTab !== "startups" &&
              totalCount > 0 && (
                <span className="text-xs font-mono text-[#8C929C] tabular-nums">
                  {totalCount.toLocaleString()} matching issues
                </span>
              )}
          </div>

          {/* Tabs & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="bg-[#141518] p-1 rounded-[4px] flex border border-[#2B2E36] overflow-x-auto scrollbar-hide">
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
                onClick={() => {
                  setSelectedTab("trusted");
                  setOrgSearchQuery("");
                }}
                icon={Shield}
              />
              <TabButton
                label="Startup Orgs"
                active={selectedTab === "startups"}
                onClick={() => {
                  setSelectedTab("startups");
                  setOrgSearchQuery("");
                }}
                icon={Rocket}
              />
              <TabButton
                label="Smart Match"
                active={selectedTab === "smart"}
                onClick={() => setSelectedTab("smart")}
                icon={GitPullRequest}
                isPremium
              />
            </div>

            {selectedTab !== "trusted" && selectedTab !== "smart" && selectedTab !== "startups" && (
              <div className="flex items-center gap-2">
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    aria-expanded={sortDropdownOpen}
                    className="flex items-center gap-2 px-3 py-2 bg-[#141518] border border-[#2B2E36] rounded-[4px] text-xs font-medium text-[#F4F4F0] hover:border-[#3A3E48] transition-colors cursor-pointer"
                  >
                    <span>
                      {filters.sort === "best"
                        ? "Best Readiness"
                        : filters.sort === "health"
                          ? "Repo Health"
                          : filters.sort === "created"
                            ? "Recently Created"
                            : "Recently Updated"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#8C929C] transition-transform ${
                        sortDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-[#17181B] border border-[#2B2E36] rounded-[4px] shadow-xl z-40 p-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: "best" }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-[4px] text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          filters.sort === "best"
                            ? "bg-[#1C1E23] text-[#DAFA9C] font-medium"
                            : "text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0]"
                        }`}
                      >
                        <span>Best Readiness</span>
                        <Sparkles className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: "health" }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-[4px] text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          filters.sort === "health"
                            ? "bg-[#1C1E23] text-[#DAFA9C] font-medium"
                            : "text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0]"
                        }`}
                      >
                        <span>Repo Health</span>
                        <Activity className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: "updated" }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-[4px] text-xs transition-colors cursor-pointer ${
                          filters.sort === "updated"
                            ? "bg-[#1C1E23] text-[#DAFA9C] font-medium"
                            : "text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0]"
                        }`}
                      >
                        Recently Updated
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: "created" }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-[4px] text-xs transition-colors cursor-pointer ${
                          filters.sort === "created"
                            ? "bg-[#1C1E23] text-[#DAFA9C] font-medium"
                            : "text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0]"
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

          {/* Tab Body */}
          {selectedTab === "smart" ? (
            <SmartMatchTab
              username={user?.user_metadata?.user_name || user?.user_metadata?.preferred_username}
              token={null}
              userId={user?.id}
              bookmarkedIssues={bookmarkedIssues}
              onToggleBookmark={(issue) => {
                const adaptedIssue = {
                  ...issue,
                  html_url: issue.url || issue.html_url,
                  repository_url: `https://api.github.com/repos/${issue.repo}`,
                };
                handleBookmark(adaptedIssue);
              }}
            />
          ) : selectedTab === "trusted" ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-[#141518] border border-[#2B2E36] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-[#34D399]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#F4F4F0]">Trusted Repositories</h2>
                    <p className="text-xs text-[#A8ADB6]">
                      Maintainer-vetted repositories welcoming first pull requests
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C929C]" />
                  <input
                    type="text"
                    aria-label="Filter trusted organizations"
                    placeholder="Filter by organization..."
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    className="w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] py-2 pl-9 pr-3 text-xs text-[#F4F4F0] focus:outline-none focus:border-[#DAFA9C] transition-colors placeholder:text-[#8C929C]"
                  />
                </div>
              </div>

              {loadingTrustedRepos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <TrustedRepoSkeleton key={i} />
                  ))}
                </div>
              ) : trustedRepos.filter((repo) => {
                  if (!orgSearchQuery) return true;
                  const orgName = (repo.organization || "").toLowerCase();
                  return orgName.includes(orgSearchQuery.toLowerCase());
                }).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {trustedRepos
                    .filter((repo) => {
                      if (!orgSearchQuery) return true;
                      const orgName = (repo.organization || "").toLowerCase();
                      return orgName.includes(orgSearchQuery.toLowerCase());
                    })
                    .map((repo) => (
                      <TrustedRepoCard key={repo.id} repo={repo} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
                  <Shield className="w-8 h-8 text-[#34D399] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#F4F4F0] mb-1">
                    No trusted repos matching filter
                  </h3>
                  <p className="text-xs text-[#8C929C]">
                    Curated repositories will appear here.
                  </p>
                </div>
              )}
            </div>
          ) : selectedTab === "startups" ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-[#141518] border border-[#2B2E36] flex items-center justify-center shrink-0">
                    <Rocket className="w-5 h-5 text-[#DAFA9C]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#F4F4F0]">Startup Orgs</h2>
                    <p className="text-xs text-[#A8ADB6]">
                      Contribute to fast-moving engineering startups building open source
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C929C]" />
                  <input
                    type="text"
                    aria-label="Filter startup organizations"
                    placeholder="Filter by organization..."
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    className="w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] py-2 pl-9 pr-3 text-xs text-[#F4F4F0] focus:outline-none focus:border-[#DAFA9C] transition-colors placeholder:text-[#8C929C]"
                  />
                </div>
              </div>

              {loadingStartupOrgs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <StartupOrgSkeleton key={i} />
                  ))}
                </div>
              ) : startupOrgs.filter((org) => {
                  if (!orgSearchQuery) return true;
                  const orgName = (org.github_name || org.display_name || "").toLowerCase();
                  return orgName.includes(orgSearchQuery.toLowerCase());
                }).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {startupOrgs
                    .filter((org) => {
                      if (!orgSearchQuery) return true;
                      const orgName = (org.github_name || org.display_name || "").toLowerCase();
                      return orgName.includes(orgSearchQuery.toLowerCase());
                    })
                    .map((org) => (
                      <StartupOrgCard key={org.id} org={org} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
                  <Rocket className="w-8 h-8 text-[#DAFA9C] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#F4F4F0] mb-1">
                    No startup orgs matching filter
                  </h3>
                  <p className="text-xs text-[#8C929C]">
                    Startup organizations will appear here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {loading && issues.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <IssueSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                    <div className="text-center py-16 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
                      <Search className="w-8 h-8 text-[#8C929C] mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-[#F4F4F0] mb-1.5">
                        No issues match those filters
                      </h3>
                      <p className="text-xs text-[#A8ADB6] mb-5">
                        Try clearing a label or expanding minimum star count.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}

                  {hasMore && issues.length > 0 && (
                    <div className="flex justify-center mt-10 pb-8">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] text-[#F4F4F0] rounded-[4px] transition-colors disabled:opacity-50 text-xs font-semibold cursor-pointer min-h-[40px]"
                      >
                        {loadingMore ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-[#A8ADB6]" />
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

      <MobileBottomNav />
    </div>
  );
};

/* --- Sub Components --- */

const TabButton = ({ label, active, onClick, icon: Icon, isPremium }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
      active
        ? isPremium
          ? "bg-[#DAFA9C] text-[#0F0F0F] font-semibold"
          : "bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] font-semibold"
        : isPremium
          ? "text-[#DAFA9C] hover:bg-[#17181B]"
          : "text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#17181B]"
    }`}
  >
    {Icon && (
      <Icon
        className={`w-3.5 h-3.5 ${
          active
            ? isPremium
              ? "text-[#0F0F0F]"
              : "text-[#DAFA9C]"
            : isPremium
              ? "text-[#DAFA9C]"
              : "text-[#8C929C]"
        }`}
      />
    )}
    {label}
  </button>
);

const IssueCard = ({ issue, isBookmarked, onToggleBookmark }) => {
  const repoName = issue.repository_url.split("/").slice(-2).join("/");
  const timeAgo = formatTimeAgo(issue.created_at);
  const [kitOpen, setKitOpen] = useState(false);
  const readiness = issue._readiness || scoreIssueReadiness(issue);
  const starLabel = formatCompactNumber(issue.repo_stars);
  const commentsCount = Number(issue.comments ?? 0);

  const readinessToneClass =
    readiness.tier === "strong"
      ? "bg-[#DAFA9C]/10 text-[#DAFA9C] border-[#DAFA9C]/35"
      : readiness.tier === "good"
        ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
        : "bg-[#0B0C0E] text-[#A8ADB6] border-[#22242A]";

  const signalChips = readiness.signals.slice(0, 2);

  return (
    <div className="bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] p-5 transition-colors group flex flex-col h-full">
      <div className="flex items-start justify-between mb-3.5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] flex items-center justify-center border border-[#22242A] overflow-hidden shrink-0">
            <img src={issue.user.avatar_url} alt="" className="w-6 h-6 rounded-[2px] object-cover" />
          </div>
          <div className="min-w-0">
            <a
              href={withUTM(issue.html_url, { medium: "explore", content: "repo_link" })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#A8ADB6] hover:text-[#F4F4F0] font-mono font-medium transition-colors block truncate"
              onClick={() =>
                trackIssueClick({
                  issueUrl: issue.html_url,
                  source: "explore",
                  repo: repoName,
                  action: "repo_link",
                })
              }
            >
              {repoName}
            </a>
            <div className="flex items-center gap-2.5 text-xs text-[#8C929C] font-mono mt-0.5 tabular-nums">
              {starLabel !== null && (
                <span className="inline-flex items-center gap-1" title={`${issue.repo_stars} GitHub stars`}>
                  <Star className="w-3 h-3 text-[#DAFA9C]" />
                  <span>{starLabel}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1" title={`${commentsCount} comments on issue`}>
                <MessageSquare className="w-3 h-3 text-[#8C929C]" />
                <span>{starLabel === null ? `${commentsCount} replies` : commentsCount}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            title={readiness.reasons.join(" · ") || "Rule-based issue readiness score"}
            className={`text-xs font-mono px-2 py-0.5 rounded-[4px] border tabular-nums select-none ${readinessToneClass}`}
          >
            Fit {readiness.score}
          </span>
          <span className="text-xs text-[#8C929C] font-mono tabular-nums">{timeAgo}</span>
          <button
            type="button"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark issue"}
            onClick={(e) => {
              e.preventDefault();
              onToggleBookmark();
            }}
            className={`p-1.5 rounded-[4px] border transition-colors cursor-pointer ${
              isBookmarked
                ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/40"
                : "bg-[#0B0C0E] text-[#8C929C] hover:text-[#F4F4F0] border-[#22242A] hover:border-[#3A3E48]"
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <h3 className="text-[15px] font-semibold text-[#F4F4F0] mb-2 leading-snug group-hover:text-[#DAFA9C] transition-colors line-clamp-2">
        <a
          href={withUTM(issue.html_url, { medium: "explore", content: "title_click" })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackIssueClick({
              issueUrl: issue.html_url,
              source: "explore",
              repo: repoName,
              action: "title_click",
            })
          }
        >
          {issue.title}
        </a>
      </h3>

      <p className="text-xs text-[#A8ADB6] leading-relaxed mb-4 line-clamp-3 flex-1">
        {readiness.summary || "No concise description provided — inspect the GitHub thread for context."}
      </p>

      {issue.repo_health?.health_summary && (
        <div
          title={`Repo Health Score: ${issue.repo_health.health_score ?? "—"}/100`}
          className="mb-4 px-2.5 py-1.5 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center gap-2 text-xs font-mono text-[#A8ADB6] truncate"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              issue.repo_health.health_tier === "healthy"
                ? "bg-[#34D399]"
                : issue.repo_health.health_tier === "moderate"
                  ? "bg-[#F59E0B]"
                  : "bg-[#8C929C]"
            }`}
            aria-hidden="true"
          />
          <span className="truncate">{issue.repo_health.health_summary}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-[#22242A] gap-2">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {readiness.taskType && (
            <Badge label={readiness.taskType} tone="neutral" />
          )}
          {signalChips.map((signal) => (
            <Badge key={signal.key} label={signal.label} tone={signal.tone} />
          ))}
          {!readiness.taskType && signalChips.length === 0 &&
            issue.labels.slice(0, 2).map((label) => (
              <Badge key={label.id} label={label.name} tone="neutral" />
            ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setKitOpen(true)}
            title="Generate a Contribution Kit for this issue"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] text-[#F4F4F0] hover:border-[#DAFA9C]/60 hover:text-[#DAFA9C] transition-colors text-xs font-medium cursor-pointer"
          >
            <Wrench className="w-3 h-3" />
            Kit
          </button>
          <a
            href={withUTM(issue.html_url, { medium: "explore", content: "external_icon" })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${repoName} issue on GitHub`}
            className="p-1.5 rounded-[4px] text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#1C1E23] transition-colors"
            onClick={() =>
              trackIssueClick({
                issueUrl: issue.html_url,
                source: "explore",
                repo: repoName,
                action: "external_link",
              })
            }
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <ContributionKitModal
        issue={{ url: issue.html_url, title: issue.title, body: issue.body }}
        isOpen={kitOpen}
        onClose={() => setKitOpen(false)}
      />
    </div>
  );
};

const Badge = ({ label, tone = "neutral" }) => {
  const display = label.length > 18 ? label.substring(0, 18) + "..." : label;
  const toneClass =
    tone === "warn"
      ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
      : tone === "positive"
        ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
        : "bg-[#0B0C0E] text-[#A8ADB6] border-[#22242A]";

  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded-[4px] border select-none ${toneClass}`}>
      {display}
    </span>
  );
};

const TrustedRepoCard = ({ repo }) => {
  const [imgError, setImgError] = useState(false);

  const difficultyStyles = {
    beginner: "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30",
    intermediate: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    advanced: "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30",
  };

  const badgeClass = difficultyStyles[repo.difficulty] || difficultyStyles.beginner;

  const getOwner = () => {
    if (repo.github_url) {
      try {
        const urlParts = repo.github_url.replace(/\/$/, "").split("/");
        if (urlParts.length >= 4) return urlParts[3];
      } catch (e) {
        console.error(e);
      }
    }
    if (repo.name && repo.name.includes("/")) {
      return repo.name.split("/")[0];
    }
    return null;
  };

  const owner = getOwner();
  const logoSrc = repo.logo_url || (owner ? `https://github.com/${owner}.png?size=40` : null);

  return (
    <div className="bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] p-5 transition-colors group flex flex-col">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] flex items-center justify-center border border-[#22242A] overflow-hidden shrink-0">
            {logoSrc && !imgError ? (
              <img
                src={logoSrc}
                alt={repo.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Shield className="w-4 h-4 text-[#34D399]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#F4F4F0] group-hover:text-[#DAFA9C] transition-colors truncate flex items-center gap-1.5">
              <a
                href={repo.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline"
              >
                {repo.title}
              </a>
              {repo.verified && (
                <span
                  title="Verified Repository"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30 text-[10px] font-mono shrink-0"
                >
                  ✓
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#8C929C] font-mono mt-0.5 truncate">
              {repo.organization ? `${repo.organization} / ${repo.name}` : repo.name}
            </p>
          </div>
        </div>
        <span
          className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[4px] border shrink-0 ${badgeClass}`}
        >
          {repo.difficulty}
        </span>
      </div>

      <p className="text-xs text-[#A8ADB6] leading-relaxed mb-4 line-clamp-2 flex-1">
        {repo.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[#22242A]">
        <div className="flex items-center gap-3.5 text-xs font-mono text-[#A8ADB6] tabular-nums">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#8C929C]" />
            {repo.stars?.toLocaleString() || 0}
          </span>
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DAFA9C]" />
              {repo.language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {repo.tags && repo.tags.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-[#A8ADB6] border border-[#22242A]">
              {repo.tags[0]}
            </span>
          )}
          {repo.website && (
            <a
              href={repo.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${repo.title} website`}
              className="text-[#8C929C] hover:text-[#DAFA9C] transition-colors p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const StartupOrgCard = ({ org }) => {
  const [imgError, setImgError] = useState(false);

  const categoryStyles = {
    "AI/ML": "bg-[#DAFA9C]/10 text-[#DAFA9C] border-[#DAFA9C]/30",
    DevTools: "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30",
    Infrastructure: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    Security: "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30",
    Data: "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30",
    Cloud: "bg-[#A8ADB6]/10 text-[#A8ADB6] border-[#A8ADB6]/30",
    FinTech: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  };

  const badgeClass =
    categoryStyles[org.category] || "bg-[#0B0C0E] text-[#A8ADB6] border-[#2B2E36]";

  return (
    <a
      href={org.github_url || `https://github.com/${org.github_name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 rounded-[4px] p-5 transition-colors group flex flex-col"
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] flex items-center justify-center border border-[#22242A] overflow-hidden shrink-0">
            {!imgError ? (
              <img
                src={`https://github.com/${org.github_name}.png?size=40`}
                alt={org.display_name || org.github_name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Rocket className="w-4 h-4 text-[#DAFA9C]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#F4F4F0] group-hover:text-[#DAFA9C] transition-colors truncate">
              {org.display_name || org.github_name}
            </h3>
            <p className="text-[11px] text-[#8C929C] font-mono mt-0.5 truncate">{org.github_name}</p>
          </div>
        </div>
        {org.category && (
          <span
            className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[4px] border shrink-0 ${badgeClass}`}
          >
            {org.category}
          </span>
        )}
      </div>

      <p className="text-xs text-[#A8ADB6] leading-relaxed mb-4 line-clamp-2 flex-1">
        {org.description || "Open-source startup organization"}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[#22242A]">
        <div className="flex items-center gap-3.5 text-xs font-mono text-[#A8ADB6] tabular-nums">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#8C929C]" />
            {org.stars == null
              ? "—"
              : org.stars >= 1000
              ? `${(org.stars / 1000).toFixed(1)}k`
              : org.stars.toLocaleString()}
          </span>
          {org.country && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#8C929C]" />
              {org.country}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {org.founded_year && (
            <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-[#A8ADB6] border border-[#22242A] font-mono tabular-nums">
              Est. {org.founded_year}
            </span>
          )}
          {org.website && (
            <ExternalLink className="w-3.5 h-3.5 text-[#8C929C] group-hover:text-[#DAFA9C] transition-colors" />
          )}
        </div>
      </div>
    </a>
  );
};

const StartupOrgSkeleton = () => (
  <div className="bg-[#141518] border border-[#22242A] rounded-[4px] p-5 h-[180px] animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-[4px] bg-[#17181B]" />
      <div className="space-y-2 flex-1">
        <div className="w-3/4 h-3 bg-[#17181B] rounded-[4px]" />
        <div className="w-1/2 h-2.5 bg-[#17181B] rounded-[4px]" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-2.5 bg-[#17181B] rounded-[4px]" />
      <div className="w-2/3 h-2.5 bg-[#17181B] rounded-[4px]" />
    </div>
    <div className="flex gap-4 pt-3 border-t border-[#22242A]">
      <div className="w-16 h-2.5 bg-[#17181B] rounded-[4px]" />
      <div className="w-16 h-2.5 bg-[#17181B] rounded-[4px]" />
    </div>
  </div>
);

const TrustedRepoSkeleton = StartupOrgSkeleton;

const IssueSkeleton = () => (
  <div className="bg-[#141518] border border-[#22242A] rounded-[4px] p-5 h-[280px] animate-pulse">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-[4px] bg-[#17181B]" />
      <div className="space-y-2 flex-1">
        <div className="w-24 h-3 bg-[#17181B] rounded-[4px]" />
        <div className="w-12 h-2.5 bg-[#17181B] rounded-[4px]" />
      </div>
    </div>
    <div className="w-full h-5 bg-[#17181B] rounded-[4px] mb-3" />
    <div className="w-2/3 h-5 bg-[#17181B] rounded-[4px] mb-6" />
    <div className="space-y-2">
      <div className="w-full h-2.5 bg-[#17181B] rounded-[4px]" />
      <div className="w-full h-2.5 bg-[#17181B] rounded-[4px]" />
      <div className="w-3/4 h-2.5 bg-[#17181B] rounded-[4px]" />
    </div>
  </div>
);

export default ExplorePage;
