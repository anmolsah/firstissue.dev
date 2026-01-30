import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGitHubSync } from "../hooks/useGitHubSync";
import { getContributionStatus, getStatusConfig } from "../services/githubSync";
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
} from "lucide-react";

const StatusPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("status");

  // GitHub sync hook
  const {
    contributions,
    loading,
    syncing,
    lastSynced,
    syncError,
    sync,
    getStats,
    getSuccessRate,
  } = useGitHubSync(user?.id, true);

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
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const getFilteredContributions = () => {
    let filtered = contributions;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((c) => {
        const status = getContributionStatus(c);
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

  if (loading) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading contributions...</span>
      </div>
    );
  }

  const stats = getStats();
  const successRate = getSuccessRate();
  const filteredContributions = getFilteredContributions();

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* Left Sidebar */}
      <aside className="w-56 border-r border-white/5 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-10">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Command className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              FirstIssue.dev
            </span>
          </div>

          <nav className="space-y-1">
            <NavItem
              icon={Compass}
              label="Explore"
              active={activeNav === "explore"}
              onClick={() => navigate("/explore")}
            />
            <NavItem
              icon={Bookmark}
              label="Bookmarks"
              active={activeNav === "bookmarks"}
              onClick={() => navigate("/bookmarks")}
            />
            <NavItem
              icon={TrendingUp}
              label="Status"
              active={activeNav === "status"}
              onClick={() => setActiveNav("status")}
            />
            <NavItem
              icon={User}
              label="Profile"
              active={activeNav === "profile"}
              onClick={() => navigate("/profile")}
            />
          </nav>
        </div>

        <div className="mt-auto p-4">
          <button
            onClick={() => navigate("/explore")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Issue
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex flex-1 items-center max-w-xl relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search contributions..."
              className="w-full bg-[#15161E] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <span className="text-sm text-gray-400">
                {user?.user_metadata?.user_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.email || "User"}`
                  }
                  alt="Avatar"
                  className="w-full h-full rounded-full bg-[#0B0C10]"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Sync Status Bar */}
          <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">GitHub Contributions</p>
                <p className="text-xs text-gray-500">
                  {lastSynced
                    ? `Last synced ${formatDate(lastSynced)}`
                    : "Not synced yet"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>

          {syncError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-red-400 mb-1">Sync Error</p>
                  <p className="text-sm text-red-300">{syncError}</p>
                  {syncError.includes("token") && (
                    <p className="text-xs text-red-400/70 mt-2">
                      Your GitHub connection may have expired or lacks required
                      permissions.
                    </p>
                  )}
                </div>
                {syncError.includes("token") && (
                  <button
                    onClick={() => {
                      // Trigger GitHub reconnection
                      window.location.href = `${window.location.origin}/login`;
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors whitespace-nowrap"
                  >
                    <Github className="w-4 h-4" />
                    Reconnect GitHub
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Progress Card */}
          <div className="bg-[#15161E] rounded-xl p-6 border border-white/5 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Your Progress
                </h2>
                <p className="text-gray-500">
                  {stats.merged || 0} merged out of {stats.total} contributions
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-cyan-400">
                  {successRate}%
                </div>
                <div className="flex items-center justify-end text-gray-500 text-sm gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Success Rate
                </div>
              </div>
            </div>
            <div className="w-full bg-[#222831] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full h-2 transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {statusOptions
              .slice(1)
              .map(({ value, label, icon: Icon, color, bg }) => {
                const count = stats[value] || 0;
                return (
                  <div
                    key={value}
                    className={`bg-[#15161E] rounded-xl p-4 border border-white/5 cursor-pointer hover:border-white/10 transition-colors ${
                      selectedStatus === value ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === value ? "all" : value,
                      )
                    }
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{label}</p>
                    <span className="text-2xl font-bold text-white">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {statusOptions.map(({ value, label, icon: Icon, color }) => {
              const count = value === "all" ? stats.total : stats[value] || 0;
              const isActive = selectedStatus === value;
              return (
                <button
                  key={value}
                  onClick={() => setSelectedStatus(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-[#15161E] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                  <span
                    className={`text-xs ${isActive ? "text-blue-200" : "text-gray-500"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contributions List */}
          {filteredContributions.length === 0 ? (
            <div className="text-center py-16 bg-[#15161E] rounded-xl border border-white/5">
              <Github className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {selectedStatus === "all"
                  ? "No contributions yet"
                  : `No ${selectedStatus.replace("_", " ")} contributions`}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedStatus === "all"
                  ? "Start contributing to open source projects and they'll appear here automatically."
                  : `You don't have any ${selectedStatus.replace("_", " ")} contributions yet.`}
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContributions.map((contribution) => {
                const status = getContributionStatus(contribution);
                const statusConfig = getStatusConfig(status);

                return (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                    status={status}
                    statusConfig={statusConfig}
                    formatDate={formatDate}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* --- Sub Components --- */

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-600/10 text-blue-400"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-gray-500"}`} />
    {label}
  </button>
);

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
    <div className="bg-[#15161E] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
              {contribution.github_repo_owner}/{contribution.github_repo_name}
            </span>
            {contribution.language && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#222831] text-gray-400 rounded border border-white/5">
                {contribution.language}
              </span>
            )}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded ${statusConfig.bg} ${statusConfig.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </div>
          </div>

          <h3 className="text-white font-medium mb-2 line-clamp-2">
            {contribution.issue_title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {contribution.is_assigned && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Assigned {formatDate(contribution.assigned_at)}
              </div>
            )}
            {contribution.pr_created_at && (
              <div className="flex items-center gap-1">
                <GitPullRequest className="w-3 h-3" />
                PR opened {formatDate(contribution.pr_created_at)}
              </div>
            )}
            {contribution.pr_merged_at && (
              <div className="flex items-center gap-1 text-emerald-400">
                <GitMerge className="w-3 h-3" />
                Merged {formatDate(contribution.pr_merged_at)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {contribution.pr_url && (
            <a
              href={contribution.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/5"
              title="View Pull Request"
            >
              <GitPullRequest className="w-5 h-5" />
            </a>
          )}
          <a
            href={contribution.issue_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="View Issue"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
