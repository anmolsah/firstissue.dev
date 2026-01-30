import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getCache, setCache, CACHE_KEYS } from "../utils/cache";
import { useGitHubSync } from "../hooks/useGitHubSync";
import EditProfileModal from "../components/EditProfileModal";
import {
  Bookmark,
  Star,
  CheckCircle,
  Compass,
  FileText,
  Plus,
  GitMerge,
  Github,
  MapPin,
  Building,
  Link as LinkIcon,
  Calendar,
  Loader2,
  LogOut,
  TrendingUp,
  BookOpen,
  GitPullRequest,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const ProfilePageNew = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customProfile, setCustomProfile] = useState(null);

  // Use GitHub sync hook for contributions
  const { contributions, getStats, getSuccessRate } = useGitHubSync(
    user?.id,
    false,
  );

  // Cached data
  const [bookmarks, setBookmarks] = useState([]);
  const [githubProfile, setGithubProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    // Load from cache first
    const bookmarksCache = getCache(CACHE_KEYS.BOOKMARKS(user.id));
    if (bookmarksCache) {
      setBookmarks(bookmarksCache);
    }

    const profileCache = getCache(CACHE_KEYS.USER_PROFILE(user.id));
    if (profileCache) {
      setGithubProfile(profileCache);
    }

    // Fetch fresh data in background
    setLoading(true);
    try {
      await Promise.all([
        fetchBookmarks(),
        fetchGitHubProfile(),
        fetchCustomProfile(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    const cacheKey = CACHE_KEYS.BOOKMARKS(user.id);
    const cached = getCache(cacheKey);
    if (cached) {
      setBookmarks(cached);
      return;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id);

    if (!error) {
      setBookmarks(data || []);
      setCache(cacheKey, data || [], 5 * 60 * 1000);
    }
  };

  const getGitHubUsername = () => {
    return (
      user?.user_metadata?.user_name ||
      user?.user_metadata?.preferred_username ||
      user?.identities?.[0]?.identity_data?.user_name
    );
  };

  const fetchGitHubProfile = async () => {
    const username = getGitHubUsername();
    if (!username) return;

    const cacheKey = CACHE_KEYS.USER_PROFILE(user.id);
    const cached = getCache(cacheKey);
    if (cached) {
      setGithubProfile(cached);
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGithubProfile(data);
        setCache(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
      }
    } catch (error) {
      console.error("Error fetching GitHub profile:", error);
    }
  };

  const fetchCustomProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, bio, location, company, website")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setCustomProfile(data);
      }
    } catch (error) {
      console.error("Error fetching custom profile:", error);
    }
  };

  const handleProfileSave = (updatedData) => {
    setCustomProfile(updatedData);
    // Clear cache to force refresh
    const cacheKey = CACHE_KEYS.USER_PROFILE(user.id);
    setCache(cacheKey, null, 0);
  };

  // Calculate stats from contributions
  const contributionStats = getStats();
  const successRate = getSuccessRate();

  const stats = {
    totalContributions: contributionStats.total,
    merged: contributionStats.merged,
    inProgress: contributionStats.in_progress,
    applied: contributionStats.applied,
    closed: contributionStats.closed,
    bookmarksCount: bookmarks.length,
    successRate: successRate,
    publicRepos: githubProfile?.public_repos || 0,
    followers: githubProfile?.followers || 0,
    following: githubProfile?.following || 0,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading && !githubProfile && bookmarks.length === 0) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20 overflow-y-auto">
        <div className="p-6">
          {/* Profile Card */}
          <div className="bg-[#15161E] rounded-xl p-5 border border-white/5 mb-6">
            <div className="w-16 h-16 rounded-lg overflow-hidden mb-4">
              <img
                src={
                  githubProfile?.avatar_url ||
                  user?.user_metadata?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.email}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {customProfile?.name ||
                githubProfile?.name ||
                user?.user_metadata?.full_name ||
                getGitHubUsername() ||
                "User"}
            </h2>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {customProfile?.bio ||
                githubProfile?.bio ||
                "Open source enthusiast"}
            </p>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm"
            >
              Edit Profile
            </button>
          </div>

          {/* GitHub Stats Cards */}
          <div className="space-y-3 mb-6">
            <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                  Merged PRs
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.merged}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <GitMerge className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats.inProgress}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <GitPullRequest className="w-5 h-5 text-purple-400" />
              </div>
            </div>

            <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                  Bookmarks
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.bookmarksCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem
              icon={Compass}
              label="Explore"
              active={activeNav === "explore"}
              onClick={() => navigate("/explore")}
            />
            <NavItem
              icon={FileText}
              label="Bookmarks"
              active={activeNav === "saved"}
              onClick={() => navigate("/bookmarks")}
            />
            <NavItem
              icon={TrendingUp}
              label="Status"
              active={activeNav === "status"}
              onClick={() => navigate("/status")}
            />
            <NavItem
              icon={BookOpen}
              label="Docs"
              active={activeNav === "docs"}
              onClick={() => navigate("/getting-started")}
            />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
                FirstIssue.dev
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {githubProfile?.name || getGitHubUsername()}
                </p>
                <p className="text-xs text-gray-500">@{getGitHubUsername()}</p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <img
                  src={
                    githubProfile?.avatar_url || user?.user_metadata?.avatar_url
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Developer Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back,{" "}
                {customProfile?.name?.split(" ")[0] ||
                  githubProfile?.name?.split(" ")[0] ||
                  getGitHubUsername()}
                .
                {stats.totalContributions > 0 &&
                  ` You have ${stats.totalContributions} tracked contributions.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={githubProfile?.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#15161E] border border-white/10 text-gray-300 rounded-lg hover:text-white hover:border-white/20 transition-colors"
              >
                <Github className="w-4 h-4" />
                View GitHub
              </a>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Find Issues
              </button>
            </div>
          </div>

          {/* GitHub Info Card */}
          {(githubProfile || customProfile) && (
            <div className="bg-[#15161E] rounded-xl p-6 border border-white/5 mb-8">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                {(customProfile?.location || githubProfile?.location) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {customProfile?.location || githubProfile?.location}
                  </div>
                )}
                {(customProfile?.company || githubProfile?.company) && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {customProfile?.company || githubProfile?.company}
                  </div>
                )}
                {(customProfile?.website || githubProfile?.blog) && (
                  <a
                    href={
                      (
                        customProfile?.website || githubProfile?.blog
                      ).startsWith("http")
                        ? customProfile?.website || githubProfile?.blog
                        : `https://${customProfile?.website || githubProfile?.blog}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-400"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {customProfile?.website || githubProfile?.blog}
                  </a>
                )}
                {githubProfile?.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined{" "}
                    {new Date(githubProfile.created_at).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" },
                    )}
                  </div>
                )}
              </div>
              {githubProfile && (
                <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-xl font-bold text-white">
                      {stats.publicRepos}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      Repositories
                    </span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">
                      {stats.followers}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      Followers
                    </span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">
                      {stats.following}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      Following
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contribution Heatmap */}
          <div className="bg-[#15161E] rounded-xl p-6 border border-white/5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Contribution Activity
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>Less</span>
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 rounded-sm bg-[#161b22]" />
                  <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
                  <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
                  <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
                  <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
                </div>
                <span>More</span>
              </div>
            </div>
            <ContributionHeatmap contributions={contributions} />
          </div>

          {/* Contribution Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={GitMerge}
              label="Merged PRs"
              value={stats.merged}
              color="emerald"
              subtitle="Successfully merged"
            />
            <StatCard
              icon={GitPullRequest}
              label="In Progress"
              value={stats.inProgress}
              color="purple"
              subtitle="Open pull requests"
            />
            <StatCard
              icon={AlertCircle}
              label="Applied"
              value={stats.applied}
              color="amber"
              subtitle="Assigned or commented"
            />
            <StatCard
              icon={TrendingUp}
              label="Success Rate"
              value={`${stats.successRate}%`}
              color="cyan"
              subtitle="PR merge rate"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contribution Breakdown */}
            <div className="bg-[#15161E] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6">
                Contribution Breakdown
              </h3>
              <div className="space-y-4">
                <ContributionBar
                  label="Merged"
                  count={stats.merged}
                  total={stats.totalContributions}
                  color="bg-emerald-500"
                  icon={<GitMerge className="w-4 h-4" />}
                />
                <ContributionBar
                  label="In Progress"
                  count={stats.inProgress}
                  total={stats.totalContributions}
                  color="bg-purple-500"
                  icon={<GitPullRequest className="w-4 h-4" />}
                />
                <ContributionBar
                  label="Applied"
                  count={stats.applied}
                  total={stats.totalContributions}
                  color="bg-amber-500"
                  icon={<AlertCircle className="w-4 h-4" />}
                />
                <ContributionBar
                  label="Closed"
                  count={stats.closed}
                  total={stats.totalContributions}
                  color="bg-red-500"
                  icon={<XCircle className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#15161E] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickActionButton
                  icon={<Compass className="w-5 h-5" />}
                  label="Explore Issues"
                  description="Find new open source issues"
                  onClick={() => navigate("/explore")}
                />
                <QuickActionButton
                  icon={<Bookmark className="w-5 h-5" />}
                  label="View Bookmarks"
                  description={`${stats.bookmarksCount} saved issues`}
                  onClick={() => navigate("/bookmarks")}
                />
                <QuickActionButton
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Check Status"
                  description="Track your contributions"
                  onClick={() => navigate("/status")}
                />
                <QuickActionButton
                  icon={<Github className="w-5 h-5" />}
                  label="GitHub Profile"
                  description="View your GitHub profile"
                  onClick={() => window.open(githubProfile?.html_url, "_blank")}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        githubProfile={githubProfile}
        onSave={handleProfileSave}
      />
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

const StatCard = ({ icon: Icon, label, value, color, subtitle }) => {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
    amber: "bg-amber-500/10 text-amber-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <div className="bg-[#15161E] rounded-xl p-6 border border-white/5">
      <div
        className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-300 mb-1">{label}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};

const ContributionBar = ({ label, count, total, color, icon }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white font-medium">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-sm text-gray-400">{count}</span>
      </div>
      <div className="w-full h-2 bg-[#222831] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-[#0B0C10] border border-white/5 rounded-lg hover:border-white/10 hover:bg-[#12131a] transition-all group"
  >
    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <div className="text-gray-600 group-hover:text-white transition-colors">
      →
    </div>
  </button>
);

const ContributionHeatmap = ({ contributions }) => {
  // GitHub Premium Green Colors
  const getLevelColor = (level) => {
    switch (level) {
      case 0:
        return "bg-[#161b22]"; // No contributions
      case 1:
        return "bg-[#0e4429]"; // Low
      case 2:
        return "bg-[#006d32]"; // Medium-low
      case 3:
        return "bg-[#26a641]"; // Medium-high
      case 4:
        return "bg-[#39d353]"; // High
      default:
        return "bg-[#161b22]";
    }
  };

  // Generate heatmap data from contributions
  const generateHeatmapData = () => {
    const weeks = 52;
    const days = 7;
    const heatmapData = [];

    // Create a map of dates to contribution counts
    const contributionMap = new Map();
    contributions.forEach((contrib) => {
      const date = new Date(
        contrib.created_at || contrib.pr_created_at || contrib.assigned_at,
      );
      const dateStr = date.toISOString().split("T")[0];
      contributionMap.set(dateStr, (contributionMap.get(dateStr) || 0) + 1);
    });

    // Generate heatmap for last 52 weeks
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday

    for (let w = weeks - 1; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < days; d++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() - w * 7 + d);
        const dateStr = date.toISOString().split("T")[0];
        const count = contributionMap.get(dateStr) || 0;

        // Convert count to level (0-4)
        let level = 0;
        if (count > 0) level = 1;
        if (count >= 2) level = 2;
        if (count >= 4) level = 3;
        if (count >= 6) level = 4;

        week.push(level);
      }
      heatmapData.push(week);
    }

    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-2">
      {heatmapData.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-[3px]">
          {week.map((level, dayIndex) => (
            <div
              key={dayIndex}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)} hover:ring-1 hover:ring-white/20 transition-all cursor-pointer`}
              title={`${level} contributions`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProfilePageNew;
