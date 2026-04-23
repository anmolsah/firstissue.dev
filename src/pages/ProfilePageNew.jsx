import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getCache, setCache, CACHE_KEYS } from "../utils/cache";
import { useGitHubSync } from "../hooks/useGitHubSync";
import EditProfileModal from "../components/EditProfileModal";
import BadgesSection from "../components/BadgesSection";
import BadgeUnlockedNotification from "../components/BadgeUnlockedNotification";
import { useBadges } from "../hooks/useBadges";
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
  User,
  Menu,
  X,
} from "lucide-react";

const ProfilePageNew = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customProfile, setCustomProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use GitHub sync hook for contributions with auto-sync enabled
  const { contributions, getStats, getSuccessRate } =
    useGitHubSync(
      user?.id,
      true, // Enable auto-sync for real-time updates
    );

  // Use badges hook for notifications
  const { newlyUnlockedBadge, dismissNotification } = useBadges(
    getStats(),
    contributions
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

  const displayName = customProfile?.name ||
    githubProfile?.name ||
    user?.user_metadata?.full_name ||
    getGitHubUsername() ||
    "User";

  const displayBio = customProfile?.bio ||
    githubProfile?.bio ||
    "Open source enthusiast";

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
      {/* ── Left Sidebar (Desktop only) ── */}
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
            <h2 className="text-lg font-bold text-white mb-1 truncate">
              {displayName}
            </h2>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed line-clamp-2">
              {displayBio}
            </p>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          {/* GitHub Stats Cards */}
          <div className="space-y-3 mb-6">
            <SidebarStatCard label="Merged PRs" value={stats.merged} color="emerald" icon={GitMerge} />
            <SidebarStatCard label="In Progress" value={stats.inProgress} color="purple" icon={GitPullRequest} />
            <SidebarStatCard label="Bookmarks" value={stats.bookmarksCount} color="blue" icon={Bookmark} />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <SidebarLink icon={Compass} label="Explore" to="/explore" />
            <SidebarLink icon={FileText} label="Bookmarks" to="/bookmarks" />
            <SidebarLink icon={TrendingUp} label="Status" to="/status" />
            <SidebarLink icon={BookOpen} label="Docs" to="/getting-started" />
          </nav>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
                FirstIssue.dev
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                  {githubProfile?.name || getGitHubUsername()}
                </p>
                <p className="text-xs text-gray-500">@{getGitHubUsername()}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex-shrink-0">
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

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B0C10] border-b border-white/5 px-4 py-4 space-y-2 animate-badge-modal-backdrop">
            {/* Mobile Profile Summary */}
            <div className="flex items-center gap-3 p-3 bg-[#15161E] rounded-xl border border-white/5 mb-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={githubProfile?.avatar_url || user?.user_metadata?.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{displayBio}</p>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(true); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors flex-shrink-0"
              >
                Edit
              </button>
            </div>

            {/* Mobile stat pills */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#15161E] rounded-lg p-2.5 text-center border border-white/5">
                <p className="text-lg font-bold text-emerald-400">{stats.merged}</p>
                <p className="text-[10px] text-gray-500">Merged</p>
              </div>
              <div className="bg-[#15161E] rounded-lg p-2.5 text-center border border-white/5">
                <p className="text-lg font-bold text-purple-400">{stats.inProgress}</p>
                <p className="text-[10px] text-gray-500">In Progress</p>
              </div>
              <div className="bg-[#15161E] rounded-lg p-2.5 text-center border border-white/5">
                <p className="text-lg font-bold text-blue-400">{stats.bookmarksCount}</p>
                <p className="text-[10px] text-gray-500">Bookmarks</p>
              </div>
            </div>

            {/* Nav links */}
            <SidebarLink icon={Compass} label="Explore" to="/explore" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={FileText} label="Bookmarks" to="/bookmarks" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={TrendingUp} label="Status" to="/status" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={BookOpen} label="Docs" to="/getting-started" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Developer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Welcome back,{" "}
                {customProfile?.name?.split(" ")[0] ||
                  githubProfile?.name?.split(" ")[0] ||
                  getGitHubUsername()}
                .
                {stats.totalContributions > 0 &&
                  ` You have ${stats.totalContributions} tracked contributions.`}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={githubProfile?.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#15161E] border border-white/10 text-gray-300 rounded-lg hover:text-white hover:border-white/20 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                <span className="hidden xs:inline">View GitHub</span>
              </a>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Find Issues</span>
              </button>
            </div>
          </div>

          {/* GitHub Info Card */}
          {(githubProfile || customProfile) && (
            <div className="bg-[#15161E] rounded-xl p-4 sm:p-6 border border-white/5 mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-400">
                {(customProfile?.location || githubProfile?.location) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{customProfile?.location || githubProfile?.location}</span>
                  </div>
                )}
                {(customProfile?.company || githubProfile?.company) && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{customProfile?.company || githubProfile?.company}</span>
                  </div>
                )}
                {(customProfile?.website || githubProfile?.blog) && (
                  <a
                    href={
                      (customProfile?.website || githubProfile?.blog || ""
                      ).startsWith("http")
                        ? customProfile?.website || githubProfile?.blog
                        : `https://${customProfile?.website || githubProfile?.blog}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-400"
                  >
                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{customProfile?.website || githubProfile?.blog}</span>
                  </a>
                )}
                {githubProfile?.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    Joined{" "}
                    {new Date(githubProfile.created_at).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" },
                    )}
                  </div>
                )}
              </div>
              {githubProfile && (
                <div className="flex gap-4 sm:gap-6 mt-4 pt-4 border-t border-white/5">
                  <GitHubCounter label="Repositories" value={stats.publicRepos} />
                  <GitHubCounter label="Followers" value={stats.followers} />
                  <GitHubCounter label="Following" value={stats.following} />
                </div>
              )}
            </div>
          )}

          {/* Contribution Heatmap */}
          <div className="bg-[#15161E] rounded-xl p-4 sm:p-6 border border-white/5 mb-6 sm:mb-8">
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
            <ContributionHeatmap contributions={contributions} username={getGitHubUsername()} />
          </div>

          {/* Badges Section */}
          <div className="mb-6 sm:mb-8">
            <BadgesSection
              stats={contributionStats}
              contributions={contributions}
              username={getGitHubUsername()}
            />
          </div>

          {/* Contribution Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Contribution Breakdown */}
            <div className="bg-[#15161E] rounded-xl p-5 sm:p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6">
                Contribution Breakdown
              </h3>
              <div className="space-y-4">
                <ContributionBar label="Merged" count={stats.merged} total={stats.totalContributions} color="bg-emerald-500" icon={<GitMerge className="w-4 h-4" />} />
                <ContributionBar label="In Progress" count={stats.inProgress} total={stats.totalContributions} color="bg-purple-500" icon={<GitPullRequest className="w-4 h-4" />} />
                <ContributionBar label="Applied" count={stats.applied} total={stats.totalContributions} color="bg-amber-500" icon={<AlertCircle className="w-4 h-4" />} />
                <ContributionBar label="Closed" count={stats.closed} total={stats.totalContributions} color="bg-red-500" icon={<XCircle className="w-4 h-4" />} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#15161E] rounded-xl p-5 sm:p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickActionButton icon={<Compass className="w-5 h-5" />} label="Explore Issues" description="Find new open source issues" onClick={() => navigate("/explore")} />
                <QuickActionButton icon={<Bookmark className="w-5 h-5" />} label="View Bookmarks" description={`${stats.bookmarksCount} saved issues`} onClick={() => navigate("/bookmarks")} />
                <QuickActionButton icon={<TrendingUp className="w-5 h-5" />} label="Check Status" description="Track your contributions" onClick={() => navigate("/status")} />
                <QuickActionButton icon={<Github className="w-5 h-5" />} label="GitHub Profile" description="View your GitHub profile" onClick={() => window.open(githubProfile?.html_url, "_blank")} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="mobile-bottom-nav lg:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          <MobileNavItem icon={Compass} label="Explore" onClick={() => navigate("/explore")} />
          <MobileNavItem icon={Bookmark} label="Saved" onClick={() => navigate("/bookmarks")} />
          <MobileNavItem icon={User} label="Profile" active onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <MobileNavItem icon={TrendingUp} label="Status" onClick={() => navigate("/status")} />
          <MobileNavItem icon={BookOpen} label="Docs" onClick={() => navigate("/getting-started")} />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        githubProfile={githubProfile}
        onSave={handleProfileSave}
      />

      {/* Badge Unlocked Notification */}
      {newlyUnlockedBadge && (
        <BadgeUnlockedNotification
          badge={newlyUnlockedBadge}
          onClose={dismissNotification}
        />
      )}
    </div>
  );
};

/* ── Sub Components ── */

const SidebarLink = ({ icon: Icon, label, to, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        active
          ? "bg-blue-600/10 text-blue-400"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-blue-400" : "text-gray-500"}`} />
      {label}
    </button>
  );
};

const MobileNavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
      active ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const SidebarStatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/10" },
    blue: { text: "text-blue-400", bg: "bg-blue-500/10" },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
    </div>
  );
};

const GitHubCounter = ({ label, value }) => (
  <div>
    <span className="text-lg sm:text-xl font-bold text-white">{value}</span>
    <span className="text-xs sm:text-sm text-gray-500 ml-1.5 sm:ml-2">{label}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, subtitle }) => {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
    amber: "bg-amber-500/10 text-amber-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <div className="bg-[#15161E] rounded-xl p-4 sm:p-6 border border-white/5">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3 sm:mb-4`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{value}</p>
      <p className="text-xs sm:text-sm font-medium text-gray-300 mb-0.5 sm:mb-1">{label}</p>
      <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">{subtitle}</p>
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
          <span className="text-sm">{label}</span>
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
    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0B0C10] border border-white/5 rounded-lg hover:border-white/10 hover:bg-[#12131a] transition-all group cursor-pointer"
  >
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-xs text-gray-500 truncate">{description}</p>
    </div>
    <div className="text-gray-600 group-hover:text-white transition-colors flex-shrink-0">
      →
    </div>
  </button>
);

const ContributionHeatmap = ({ contributions, username }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [ghCalendar, setGhCalendar] = useState(null);
  const [, setLoadingCalendar] = useState(false);

  // Fetch real contribution data from GitHub GraphQL API
  useEffect(() => {
    if (!username) return;

    const cacheKey = `gh_calendar_${username}`;
    const cached = getCache(cacheKey);
    if (cached) {
      setGhCalendar(cached);
      return;
    }

    const fetchCalendar = async () => {
      setLoadingCalendar(true);
      try {
        // Get GitHub token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.provider_token;

        if (!token) {
          console.warn("No GitHub token for GraphQL, falling back to local data");
          setLoadingCalendar(false);
          return;
        }

        const query = `
          query($username: String!) {
            user(login: $username) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                      contributionLevel
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, variables: { username } }),
        });

        if (response.ok) {
          const data = await response.json();
          const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
          if (calendar) {
            setGhCalendar(calendar);
            setCache(cacheKey, calendar, 30 * 60 * 1000); // Cache 30 min
          }
        }
      } catch (err) {
        console.error("Failed to fetch GitHub calendar:", err);
      } finally {
        setLoadingCalendar(false);
      }
    };

    fetchCalendar();
  }, [username]);

  // GitHub Premium Green Colors
  const getLevelColor = (level) => {
    switch (level) {
      case 0: return "bg-[#161b22]";
      case 1: return "bg-[#0e4429]";
      case 2: return "bg-[#006d32]";
      case 3: return "bg-[#26a641]";
      case 4: return "bg-[#39d353]";
      default: return "bg-[#161b22]";
    }
  };

  // Map GitHub GraphQL contributionLevel string to number
  const levelToNumber = (levelStr) => {
    switch (levelStr) {
      case "NONE": return 0;
      case "FIRST_QUARTILE": return 1;
      case "SECOND_QUARTILE": return 2;
      case "THIRD_QUARTILE": return 3;
      case "FOURTH_QUARTILE": return 4;
      default: return 0;
    }
  };

  // Generate heatmap data — prefer GitHub GraphQL data, fallback to local
  const generateHeatmapData = () => {
    // --- Source A: Real GitHub GraphQL calendar ---
    if (ghCalendar?.weeks?.length) {
      const heatmapData = [];
      const monthLabels = [];
      let currentMonth = null;

      ghCalendar.weeks.forEach((week, wIndex) => {
        const weekData = week.contributionDays.map((day) => ({
          level: levelToNumber(day.contributionLevel),
          count: day.contributionCount,
          date: day.date,
          dateObj: new Date(day.date),
        }));

        // Month label from first day of each week (Sunday)
        if (week.contributionDays.length > 0) {
          const firstDay = new Date(week.contributionDays[0].date);
          const monthName = firstDay.toLocaleDateString("en-US", { month: "short" });
          if (monthName !== currentMonth) {
            monthLabels.push({ week: wIndex, label: monthName });
            currentMonth = monthName;
          }
        }

        heatmapData.push(weekData);
      });

      return { heatmapData, monthLabels };
    }

    // --- Source B: Fallback to local contributions data ---
    const weeks = 52;
    const heatmapData = [];
    const monthLabels = [];

    const contributionMap = new Map();
    contributions.forEach((contrib) => {
      const date = new Date(
        contrib.pr_created_at || contrib.assigned_at || contrib.created_at,
      );
      const dateStr = date.toISOString().split("T")[0];
      contributionMap.set(dateStr, (contributionMap.get(dateStr) || 0) + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7) - today.getDay());

    let currentMonth = null;

    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split("T")[0];
        const count = contributionMap.get(dateStr) || 0;

        if (date > today) {
          week.push({ level: 0, count: 0, date: dateStr, dateObj: date, isFuture: true });
          continue;
        }

        let level = 0;
        if (count > 0) level = 1;
        if (count >= 2) level = 2;
        if (count >= 4) level = 3;
        if (count >= 6) level = 4;

        week.push({ level, count, date: dateStr, dateObj: date });
      }

      const weekSunday = new Date(startDate);
      weekSunday.setDate(startDate.getDate() + w * 7);
      const monthName = weekSunday.toLocaleDateString("en-US", { month: "short" });
      if (monthName !== currentMonth) {
        monthLabels.push({ week: w, label: monthName });
        currentMonth = monthName;
      }

      heatmapData.push(week);
    }

    return { heatmapData, monthLabels };
  };

  const { heatmapData, monthLabels } = generateHeatmapData();
  // totalContributions available: ghCalendar?.totalContributions ?? contributions.length

  const formatTooltipDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Month Labels */}
      <div className="flex gap-[3px] mb-2 ml-8 heatmap-scroll overflow-x-auto">
        {monthLabels.map((month, idx) => (
          <div
            key={idx}
            className="text-[10px] text-gray-500"
            style={{ marginLeft: idx === 0 ? 0 : `${(month.week - (monthLabels[idx - 1]?.week || 0)) * 14}px` }}
          >
            {month.label}
          </div>
        ))}
      </div>

      {/* Day Labels + Grid */}
      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px] text-[10px] text-gray-500 justify-around pr-1 flex-shrink-0">
          <div style={{ height: "12px" }}>Mon</div>
          <div style={{ height: "12px" }}></div>
          <div style={{ height: "12px" }}>Wed</div>
          <div style={{ height: "12px" }}></div>
          <div style={{ height: "12px" }}>Fri</div>
          <div style={{ height: "12px" }}></div>
          <div style={{ height: "12px" }}>Sun</div>
        </div>

        {/* Heatmap Grid — horizontally scrollable on mobile */}
        <div className="flex gap-[3px] overflow-x-auto pb-2 heatmap-scroll">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px] flex-shrink-0">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-white/40 transition-all cursor-pointer relative`}
                  onMouseEnter={() => setHoveredDay({ ...day, weekIndex, dayIndex })}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="absolute z-50 bg-[#1c1d26] border border-white/20 rounded-lg px-3 py-2 text-xs text-white shadow-xl pointer-events-none whitespace-nowrap"
          style={{
            left: `${Math.min(hoveredDay.weekIndex * 14 + 40, (typeof window !== 'undefined' ? window.innerWidth - 200 : 600))}px`,
            top: `${hoveredDay.dayIndex * 14 + 30}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-semibold">
            {hoveredDay.count} {hoveredDay.count === 1 ? "contribution" : "contributions"}
          </div>
          <div className="text-gray-400 mt-0.5">
            {formatTooltipDate(hoveredDay.date)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePageNew;
