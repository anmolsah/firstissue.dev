import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGitHubSync } from "../hooks/useGitHubSync";
import { getContributionStatus, getStatusConfig } from "../services/githubSync";
import { useBookmarks } from "../hooks/queries/useBookmarks";
import AppSidebar from "../components/AppSidebar";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Search,
  Compass,
  Bookmark,
  User,
  Command,
  Bell,
  Plus,
  Loader2,
  RefreshCw,
  GitPullRequest,
  GitMerge,
  XCircle,
  Github,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const StatusPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("status");
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
    getSuccessRate,
  } = useGitHubSync(user?.id, true);

  // Bookmarks hook
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks(user?.id);

  const loading = syncLoading || bookmarksLoading;

  const statusOptions = [
    {
      value: "all",
      label: "All",
      icon: Activity,
      color: "text-white",
      bg: "bg-blue-600",
    },
    {
      value: "saved",
      label: "Saved",
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
    {
      value: "applied",
      label: "Applied",
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/20",
    },
    {
      value: "in_progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
    },
    {
      value: "merged",
      label: "Merged",
      icon: GitMerge,
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    },
    {
      value: "closed",
      label: "Closed",
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/20",
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
    // Map bookmarks to contribution shape
    const bookmarkedContributions = bookmarks.map((b) => ({
      ...b,
      id: b.id,
      issue_title: b.title,
      github_repo_name: b.repo_name?.split("/")?.[1] || b.repo_name,
      github_repo_owner: b.repo_name?.split("/")?.[0] || "",
      is_bookmark: true,
      // Status mapping
      status: b.status || "saved",
      created_at: b.created_at,
    }));

    // Deduplicate: if an issue is both bookmarked and in contributions, 
    // prefer the contribution data as it has more GitHub metadata
    const contributionUrls = new Set(contributions.map((c) => c.issue_url));
    const uniqueBookmarks = bookmarkedContributions.filter(
      (b) => !contributionUrls.has(b.issue_url)
    );

    // Merge and sort by date
    return [...contributions, ...uniqueBookmarks].sort(
      (a, b) => new Date(b.created_at || b.pr_created_at) - new Date(a.created_at || a.pr_created_at)
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

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => {
        const status = item.is_bookmark ? item.status : getContributionStatus(item);
        return status === selectedStatus;
      });
    }

    // Filter by search query
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

  // Reset to page 1 when filters or search change
  // NOTE: This useEffect MUST be before the early return to maintain
  // consistent hook call order across renders (React rules of hooks).
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  if (loading) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading contributions...</span>
      </div>
    );
  }

  const successRate = getSuccessRate();
  const filteredContributions = getFilteredContributions();

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredContributions.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedContributions = filteredContributions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate visible page numbers (show max 5 pages around current)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex flex-1 items-center max-w-xl relative">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search contributions..."
              className="w-full bg-zinc-950/40 border border-zinc-800/80 rounded-md py-1.5 pl-9 pr-4 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-650"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button className="text-zinc-500 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/60">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user?.user_metadata?.user_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </p>
                <p className="text-[10px] font-bold text-zinc-500 mt-0.5 uppercase tracking-wider">Contributor</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-zinc-800 p-[1px] bg-zinc-900 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.email || "User"}`
                  }
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Sync Status Bar */}
          <div className="bg-zinc-950/20 rounded-xl p-4 border border-zinc-800/60 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-400 flex-shrink-0">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">GitHub Contributions</p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {lastSynced
                    ? `Last synced ${formatDate(lastSynced)}`
                    : "Not synced yet"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white hover:bg-zinc-200 text-black rounded font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>

          {syncError && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-red-400 text-sm mb-1">Sync Error</p>
                  <p className="text-xs text-red-300/95 leading-relaxed">{syncError}</p>
                  {syncError.includes("token") && (
                    <p className="text-[10px] text-red-400/50 mt-1 leading-normal">
                      Your GitHub connection may have expired or lacks required permissions.
                    </p>
                  )}
                </div>
                {syncError.includes("token") && (
                  <button
                    onClick={() => {
                      // Trigger GitHub reconnection
                      window.location.href = `${window.location.origin}/login`;
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/35 text-red-400 rounded text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Reconnect GitHub
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Progress Card */}
          <div className="bg-zinc-950/20 rounded-xl p-6 border border-zinc-800/60 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 tracking-tight">
                  Your Progress
                </h2>
                <p className="text-xs text-zinc-400">
                  {stats.merged || 0} merged out of {stats.total} contributions
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white font-mono leading-none mb-1">
                  {successRate}%
                </div>
                <div className="flex items-center justify-end text-zinc-500 text-[10px] uppercase font-bold tracking-wider gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-555" />
                  Success Rate
                </div>
              </div>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800/60 overflow-hidden">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {statusOptions
              .slice(1)
              .map(({ value, label, icon: Icon, color, bg }) => {
                const count = stats[value] || 0;
                const isActive = selectedStatus === value;
                return (
                  <div
                    key={value}
                    className={`bg-zinc-950/25 rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                      isActive ? "border-zinc-500 bg-white/[0.01]" : "border-zinc-800/60 hover:border-zinc-700/80 hover:bg-white/[0.005]"
                    }`}
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === value ? "all" : value,
                      )
                    }
                  >
                    <div
                      className={`w-7 h-7 rounded bg-zinc-900 border border-zinc-800/60 flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <p className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider mb-1 truncate">{label}</p>
                    <span className="text-2xl font-bold text-white font-mono leading-none">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-3 scrollbar-hide mask-fade-right -mx-4 px-4 sm:mx-0 sm:px-0">
            {statusOptions.map(({ value, label, icon: Icon, color }) => {
              const count = value === "all" ? stats.total : stats[value] || 0;
              const isActive = selectedStatus === value;
              return (
                <button
                  key={value}
                  onClick={() => setSelectedStatus(value)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all border whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-white/[0.04] text-white border-zinc-700/80 shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                      : "bg-zinc-950/20 text-zinc-400 hover:text-zinc-150 border-zinc-850/60 hover:bg-white/[0.01]"
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : color}`} />}
                  {label}
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${
                      isActive ? "bg-white/10 text-white border-white/10" : "bg-zinc-900 text-zinc-550 border-zinc-850"
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
            <div className="text-center py-12 sm:py-16 bg-zinc-950/20 rounded-xl border border-zinc-800/60 px-4">
              <Github className="w-9 h-9 text-zinc-550 mx-auto mb-4 animate-pulse" />
              <h3 className="text-sm font-semibold text-white mb-2">
                {selectedStatus === "all"
                  ? "No contributions yet"
                  : `No ${selectedStatus.replace("_", " ")} contributions`}
              </h3>
              <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
                {selectedStatus === "all"
                  ? "Start contributing to open source projects and they'll appear here automatically."
                  : `You don't have any ${selectedStatus.replace("_", " ")} contributions yet.`}
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-4 py-2 border border-zinc-800 bg-white text-black hover:bg-zinc-200 rounded text-xs font-semibold transition-colors"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-zinc-500 font-mono">
                  Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredContributions.length)} of {filteredContributions.length}
                </p>
              </div>

              <div className="space-y-3">
                {paginatedContributions.map((item) => {
                  const status = item.is_bookmark ? item.status : getContributionStatus(item);
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
                <div className="flex items-center justify-center gap-1.5 mt-6 pt-6 border-t border-zinc-800/60">
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border border-zinc-800/60 bg-zinc-950/25 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-white/[0.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400 disabled:hover:border-zinc-800/60 disabled:hover:bg-zinc-950/25"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* First page + ellipsis */}
                  {getPageNumbers()[0] > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-mono font-bold transition-all border border-zinc-800/60 bg-zinc-950/25 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-white/[0.02]"
                      >
                        1
                      </button>
                      {getPageNumbers()[0] > 2 && (
                        <span className="w-8 h-8 flex items-center justify-center text-xs text-zinc-600 font-mono">…</span>
                      )}
                    </>
                  )}

                  {/* Page numbers */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-mono font-bold transition-all border ${
                        page === safePage
                          ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                          : "border-zinc-800/60 bg-zinc-950/25 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-white/[0.02]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Last page + ellipsis */}
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <>
                      {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                        <span className="w-8 h-8 flex items-center justify-center text-xs text-zinc-600 font-mono">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-mono font-bold transition-all border border-zinc-800/60 bg-zinc-950/25 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-white/[0.02]"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border border-zinc-800/60 bg-zinc-950/25 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-white/[0.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400 disabled:hover:border-zinc-800/60 disabled:hover:bg-zinc-950/25"
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
    statusConfig.icon === "📌"
      ? Clock
      : statusConfig.icon === "📝"
        ? AlertCircle
        : statusConfig.icon === "🔨"
          ? PlayCircle
          : statusConfig.icon === "✅"
            ? GitMerge
            : XCircle;

  return (
    <div className="bg-zinc-950/25 rounded-xl p-4 sm:p-5 border border-zinc-800/60 hover:border-zinc-750 hover:bg-white/[0.005] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none">
              {contribution.github_repo_owner}/{contribution.github_repo_name}
            </span>
            {contribution.language && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium bg-zinc-900 text-zinc-500 rounded border border-zinc-850/80">
                {contribution.language}
              </span>
            )}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${statusConfig.bg} ${statusConfig.color}`}
              style={{ borderColor: 'rgba(255,255,255,0.03)' }}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </div>
          </div>

          <h3 className="text-sm sm:text-base text-white font-semibold mb-2 line-clamp-2">
            {contribution.issue_title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-zinc-500 font-mono">
            {contribution.is_assigned && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-zinc-600" />
                <span>Assigned {formatDate(contribution.assigned_at)}</span>
              </div>
            )}
            {contribution.pr_created_at && (
              <div className="flex items-center gap-1.5">
                <GitPullRequest className="w-3 h-3 text-zinc-600" />
                <span>PR opened {formatDate(contribution.pr_created_at)}</span>
              </div>
            )}
            {contribution.pr_merged_at && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <GitMerge className="w-3 h-3 text-emerald-500/80" />
                <span>Merged {formatDate(contribution.pr_merged_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto pt-2 sm:pt-0 border-t border-zinc-800/60 sm:border-0 w-full sm:w-auto justify-end">
          {contribution.pr_url && (
            <a
              href={contribution.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded hover:bg-white/5 border border-transparent"
              title="View Pull Request"
            >
              <GitPullRequest className="w-4 h-4" />
            </a>
          )}
          <a
            href={contribution.issue_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded hover:bg-white/5 border border-transparent"
            title="View Issue"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
