import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGitHubSync } from "../hooks/useGitHubSync";
import { getContributionStatus, getStatusConfig } from "../services/githubSync";
import { useBookmarks } from "../hooks/queries/useBookmarks";
import AppSidebar from "../components/AppSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import BrandMark from "../components/BrandMark";
import {
  Clock,
  PlayCircle,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Search,
  Loader2,
  RefreshCw,
  GitPullRequest,
  GitMerge,
  XCircle,
  Github,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { withUTM, extractRepo } from "../utils/utm";
import { trackIssueClick } from "../utils/analytics";

const StatusPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // GitHub sync hook
  const {
    contributions,
    loading: syncLoading,
    syncing,
    lastSynced,
    syncError,
    sync,
  } = useGitHubSync(user?.id, true);

  // Bookmarks hook
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks(user?.id);

  const loading = syncLoading || bookmarksLoading;

  const statusOptions = [
    {
      value: "all",
      label: "All",
      icon: Activity,
      color: "text-[#DAFA9C]",
      bg: "bg-[#DAFA9C]/15",
    },
    {
      value: "saved",
      label: "Saved",
      icon: Clock,
      color: "text-[#A8ADB6]",
      bg: "bg-[#1C1E23]",
    },
    {
      value: "applied",
      label: "Applied",
      icon: AlertCircle,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/15",
    },
    {
      value: "in_progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "text-[#DAFA9C]",
      bg: "bg-[#DAFA9C]/15",
    },
    {
      value: "merged",
      label: "Merged",
      icon: GitMerge,
      color: "text-[#34D399]",
      bg: "bg-[#34D399]/15",
    },
    {
      value: "closed",
      label: "Closed",
      icon: XCircle,
      color: "text-[#F87171]",
      bg: "bg-[#F87171]/15",
    },
  ];

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Combine contributions and bookmarks
  const allItems = React.useMemo(() => {
    const bookmarkedContributions = bookmarks.map((b) => ({
      ...b,
      id: b.id,
      issue_title: b.title,
      github_repo_name: b.repo_name?.split("/")?.[1] || b.repo_name,
      github_repo_owner: b.repo_name?.split("/")?.[0] || "",
      is_bookmark: true,
      status: b.status || "saved",
      created_at: b.created_at,
    }));

    const contributionUrls = new Set(contributions.map((c) => c.issue_url));
    const uniqueBookmarks = bookmarkedContributions.filter(
      (b) => !contributionUrls.has(b.issue_url),
    );

    return [...contributions, ...uniqueBookmarks].sort(
      (a, b) =>
        new Date(b.created_at || b.pr_created_at) -
        new Date(a.created_at || a.pr_created_at),
    );
  }, [contributions, bookmarks]);

  const stats = React.useMemo(() => {
    const s = {
      total: allItems.length,
      saved: 0,
      applied: 0,
      in_progress: 0,
      merged: 0,
      closed: 0,
    };

    allItems.forEach((item) => {
      const status = item.is_bookmark ? item.status : getContributionStatus(item);
      if (s[status] !== undefined) {
        s[status]++;
      }
    });

    return s;
  }, [allItems]);

  const getFilteredContributions = () => {
    let filtered = allItems;

    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => {
        const status = item.is_bookmark ? item.status : getContributionStatus(item);
        return status === selectedStatus;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.issue_title?.toLowerCase().includes(q) ||
          c.github_repo_name?.toLowerCase().includes(q) ||
          c.github_repo_owner?.toLowerCase().includes(q),
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSync = async () => {
    await sync();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  if (loading) {
    return (
      <div className="flex bg-[#0F0F0F] min-h-screen items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#DAFA9C] animate-spin" />
        <span className="ml-3 text-[#A8ADB6] text-xs font-mono">Loading contributions...</span>
      </div>
    );
  }

  const successRate =
    stats.total > 0 ? Math.round((stats.merged / stats.total) * 100) : 0;
  const filteredContributions = getFilteredContributions();

  const totalPages = Math.max(
    1,
    Math.ceil(filteredContributions.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedContributions = filteredContributions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex bg-[#0F0F0F] min-h-screen text-[#F4F4F0] font-sans">
      <AppSidebar />

      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-[#22242A] bg-[#0F0F0F]/95 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <Link
              to="/"
              className="lg:hidden shrink-0"
              aria-label="FirstIssue.dev home"
            >
              <BrandMark size="sm" />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C929C] pointer-events-none" />
              <input
                type="text"
                aria-label="Search tracked contributions"
                placeholder="Search contributions by title or repo..."
                className="w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] py-2 pl-9 pr-4 text-xs text-[#F4F4F0] focus:outline-none focus:border-[#DAFA9C] transition-colors placeholder:text-[#8C929C]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-[#22242A] shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#F4F4F0] leading-tight">
                {user?.user_metadata?.user_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={
                  user?.user_metadata?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.email || "User"}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl pb-24 lg:pb-8">
          {/* Sync Status Bar */}
          <div className="bg-[#141518] rounded-[4px] p-4 border border-[#2B2E36] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center text-[#A8ADB6] shrink-0">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[#F4F4F0] uppercase tracking-wider">
                  GitHub Contribution Pipeline
                </p>
                <p className="text-[11px] text-[#8C929C] font-mono mt-0.5 tabular-nums">
                  {lastSynced
                    ? `Last synced ${formatDate(lastSynced)}`
                    : "Not synced yet"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>

          {syncError && (
            <div
              role="alert"
              className="bg-[#141518] border border-[#F87171]/40 rounded-[4px] p-4 mb-6"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-[#F87171] text-sm mb-1">
                    Sync Error
                  </p>
                  <p className="text-xs text-[#F4F4F0]/90 leading-relaxed">
                    {syncError}
                  </p>
                  {syncError.includes("token") && (
                    <p className="text-[11px] text-[#8C929C] mt-1 leading-normal">
                      Your GitHub connection may have expired or lacks required permissions.
                    </p>
                  )}
                </div>
                {syncError.includes("token") && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `${window.location.origin}/login`;
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/40 text-[#F87171] rounded-[4px] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Reconnect GitHub
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Progress Card */}
          <div className="bg-[#141518] rounded-[4px] p-5 sm:p-6 border border-[#2B2E36] mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#F4F4F0] mb-1 tracking-tight">
                  Your Progress
                </h1>
                <p className="text-xs text-[#A8ADB6] tabular-nums">
                  {stats.merged || 0} merged out of {stats.total} tracked contributions
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#F4F4F0] font-mono leading-none mb-1.5 tabular-nums">
                  {successRate}%
                </div>
                <div className="flex items-center justify-end text-[#8C929C] text-[11px] font-mono uppercase font-semibold tracking-wider gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#34D399]" />
                  Merge Rate
                </div>
              </div>
            </div>
            <div className="w-full bg-[#0B0C0E] rounded-[2px] h-2 border border-[#22242A] overflow-hidden">
              <div
                className="bg-[#DAFA9C] h-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {statusOptions
              .slice(1)
              .map(({ value, label, icon, color, bg }) => {
                const Icon = icon;
                const count = stats[value] || 0;
                const isActive = selectedStatus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === value ? "all" : value,
                      )
                    }
                    className={`text-left rounded-[4px] p-4 border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#17181B] border-[#DAFA9C]"
                        : "bg-[#141518] border-[#2B2E36] hover:border-[#3A3E48] hover:bg-[#17181B]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-[4px] ${bg} border border-[#2B2E36] flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <p className="text-[#8C929C] text-[11px] font-mono font-semibold uppercase tracking-wider mb-1 truncate">
                      {label}
                    </p>
                    <span className="text-2xl font-bold text-[#F4F4F0] font-mono leading-none tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {statusOptions.map(({ value, label, icon: Icon, color }) => {
              const count = value === "all" ? stats.total : stats[value] || 0;
              const isActive = selectedStatus === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedStatus(value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors border whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#17181B] text-[#F4F4F0] border-[#DAFA9C]"
                      : "bg-[#141518] text-[#A8ADB6] hover:text-[#F4F4F0] border-[#2B2E36] hover:border-[#3A3E48]"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 ${isActive ? "text-[#DAFA9C]" : color}`}
                    />
                  )}
                  <span>{label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-[2px] font-mono text-[11px] font-semibold border tabular-nums ${
                      isActive
                        ? "bg-[#DAFA9C]/15 text-[#DAFA9C] border-[#DAFA9C]/30"
                        : "bg-[#0B0C0E] text-[#8C929C] border-[#22242A]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contributions List */}
          {filteredContributions.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-[#141518] rounded-[4px] border border-[#2B2E36] px-4">
              <div className="w-10 h-10 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center mx-auto mb-4 text-[#8C929C]">
                <Github className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-[#F4F4F0] mb-2">
                {selectedStatus === "all"
                  ? "No contributions yet"
                  : `No ${selectedStatus.replace("_", " ")} contributions`}
              </h2>
              <p className="text-xs text-[#8C929C] mb-6 max-w-xs mx-auto leading-relaxed">
                {selectedStatus === "all"
                  ? "Start contributing to open source projects and they will appear here automatically."
                  : `You don't have any ${selectedStatus.replace("_", " ")} contributions yet.`}
              </p>
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="px-4 py-2 bg-[#DAFA9C] text-[#0F0F0F] hover:bg-[#C7F275] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#8C929C] font-mono tabular-nums">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredContributions.length,
                  )}{" "}
                  of {filteredContributions.length}
                </p>
              </div>

              <div className="space-y-3">
                {paginatedContributions.map((item) => {
                  const status = item.is_bookmark
                    ? item.status
                    : getContributionStatus(item);
                  const statusConfig = getStatusConfig(status);

                  return (
                    <ContributionCard
                      key={item.id}
                      contribution={item}
                      status={status}
                      statusConfig={statusConfig}
                      formatDate={formatDate}
                    />
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-6 pt-6 border-t border-[#22242A]">
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] text-xs font-medium transition-colors border border-[#2B2E36] bg-[#141518] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {getPageNumbers()[0] > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-[4px] text-xs font-mono font-bold transition-colors border border-[#2B2E36] bg-[#141518] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48] cursor-pointer"
                      >
                        1
                      </button>
                      {getPageNumbers()[0] > 2 && (
                        <span className="w-8 h-8 flex items-center justify-center text-xs text-[#8C929C] font-mono">
                          …
                        </span>
                      )}
                    </>
                  )}

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={page === safePage ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-[4px] text-xs font-mono font-bold transition-colors border tabular-nums cursor-pointer ${
                        page === safePage
                          ? "bg-[#DAFA9C] text-[#0F0F0F] border-[#DAFA9C]"
                          : "border-[#2B2E36] bg-[#141518] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <>
                      {getPageNumbers()[getPageNumbers().length - 1] <
                        totalPages - 1 && (
                        <span className="w-8 h-8 flex items-center justify-center text-xs text-[#8C929C] font-mono">
                          …
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-[4px] text-xs font-mono font-bold transition-colors border border-[#2B2E36] bg-[#141518] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48] cursor-pointer"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] text-xs font-medium transition-colors border border-[#2B2E36] bg-[#141518] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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

const ContributionCard = ({
  contribution,
  status,
  statusConfig,
  formatDate,
}) => {
  const StatusIcon =
    status === "saved"
      ? Clock
      : status === "applied"
        ? AlertCircle
        : status === "in_progress"
          ? PlayCircle
          : status === "merged"
            ? GitMerge
            : XCircle;

  return (
    <div className="bg-[#141518] rounded-[4px] p-4 sm:p-5 border border-[#2B2E36] hover:border-[#3A3E48] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-[#A8ADB6] truncate max-w-[180px] sm:max-w-none">
              {contribution.github_repo_owner}/{contribution.github_repo_name}
            </span>
            {contribution.language && (
              <span className="px-1.5 py-0.5 text-[11px] font-mono font-medium bg-[#0B0C0E] text-[#A8ADB6] rounded-[4px] border border-[#22242A]">
                {contribution.language}
              </span>
            )}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-[4px] border border-[#2B2E36] ${statusConfig.bg} ${statusConfig.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </div>
          </div>

          <h2 className="text-sm sm:text-base text-[#F4F4F0] font-semibold mb-2 line-clamp-2">
            {contribution.issue_title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#8C929C] font-mono tabular-nums">
            {contribution.is_assigned && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#8C929C]" />
                <span>Assigned {formatDate(contribution.assigned_at)}</span>
              </div>
            )}
            {contribution.pr_created_at && (
              <div className="flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-[#8C929C]" />
                <span>PR opened {formatDate(contribution.pr_created_at)}</span>
              </div>
            )}
            {contribution.pr_merged_at && (
              <div className="flex items-center gap-1.5 text-[#34D399] font-medium">
                <GitMerge className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Merged {formatDate(contribution.pr_merged_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto pt-2 sm:pt-0 border-t border-[#22242A] sm:border-0 w-full sm:w-auto justify-end">
          {contribution.pr_url && (
            <a
              href={contribution.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View pull request for ${contribution.issue_title}`}
              className="p-2 text-[#8C929C] hover:text-[#F4F4F0] transition-colors rounded-[4px] hover:bg-[#1C1E23] border border-transparent hover:border-[#2B2E36]"
              title="View Pull Request"
            >
              <GitPullRequest className="w-4 h-4" />
            </a>
          )}
          <a
            href={withUTM(contribution.issue_url, {
              medium: "status",
              content: "contribution_link",
            })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View issue ${contribution.issue_title} on GitHub`}
            className="p-2 text-[#8C929C] hover:text-[#DAFA9C] transition-colors rounded-[4px] hover:bg-[#1C1E23] border border-transparent hover:border-[#2B2E36]"
            title="View Issue"
            onClick={() =>
              trackIssueClick({
                issueUrl: contribution.issue_url,
                source: "status",
                repo: extractRepo(contribution.issue_url),
                action: "external_link",
              })
            }
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
