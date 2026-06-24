import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useSupporter } from "../contexts/SupporterContext";
import { supabase } from "../lib/supabase";
import { useGitHubSync } from "../hooks/useGitHubSync";
import { useGitHubProfile } from "../hooks/queries/useGitHubProfile";
import { useCustomProfile, profileInfoKeys } from "../hooks/queries/useProfileInfo";
import { useBookmarks } from "../hooks/queries/useBookmarks";
import EditProfileModal from "../components/EditProfileModal";
import BadgesSection from "../components/BadgesSection";
import BadgeUnlockedNotification from "../components/BadgeUnlockedNotification";
import AppSidebar from "../components/AppSidebar";
import ProofOfWorkTab from "../components/ProofOfWorkTab";
import { useBadges } from "../hooks/useBadges";
import { useAttestations } from "../hooks/useProofOfWork";
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
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ProfilePageNew = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subscription states
  const { isSupporter, supporterData, refreshStatus } = useSupporter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const getGitHubUsername = () => {
    return (
      user?.user_metadata?.user_name ||
      user?.user_metadata?.preferred_username ||
      user?.identities?.[0]?.identity_data?.user_name
    );
  };

  // Use GitHub sync hook for contributions with auto-sync enabled
  const { contributions, stats: ghStats, getStats, getSuccessRate, loading: syncLoading } =
    useGitHubSync(
      user?.id,
      true, // Enable auto-sync for real-time updates
    );

  // TanStack Query hooks for data
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks(user?.id);
  const { data: githubProfile = null } = useGitHubProfile(getGitHubUsername());
  const { data: customProfile = null } = useCustomProfile(user?.id);
  const { data: attestations = [] } = useAttestations(user?.id);

  // Use badges hook for notifications
  const { newlyUnlockedBadge, dismissNotification } = useBadges(
    ghStats,
    contributions,
    attestations
  );

  const loading = syncLoading || bookmarksLoading;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, authLoading, navigate]);

  const handleProfileSave = (updatedData) => {
    // Invalidate custom profile cache so it refetches
    queryClient.invalidateQueries({ queryKey: profileInfoKeys.custom(user.id) });
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { userId: user.id }
      });

      if (error) throw error;
      if (data?.success) {
        await refreshStatus();
      } else {
        alert("Failed to cancel subscription: " + data?.error);
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      alert("Error cancelling subscription");
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-invoices");
      if (error) throw error;
      if (data?.items) {
        // Sort invoices by created_at descending (newest first)
        const sortedInvoices = [...data.items].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setInvoices(sortedInvoices);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (isSupporter) {
      fetchInvoices();
    }
  }, [isSupporter]);

  // Calculate stats from contributions
  const contributionStats = ghStats;
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
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="ml-3 text-zinc-400 text-sm">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* ── Left Sidebar (Desktop only) ── */}
      <AppSidebar>
        {/* Profile Card */}
        <div className="bg-zinc-950/25 rounded-lg p-4 border border-zinc-800/60 mb-5">
          <div className="w-16 h-16 rounded-lg overflow-hidden mb-3.5 border border-zinc-800/60">
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
          <h2 className="text-sm font-bold text-white mb-0.5 truncate flex items-center gap-1.5">
            {displayName}
            {isSupporter && (
              <BadgeCheck className="w-4 h-4 text-white fill-white/10 flex-shrink-0" title="FirstIssue.dev Supporter" />
            )}
          </h2>
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed line-clamp-2">
            {displayBio}
          </p>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white transition-all text-xs font-semibold rounded-md text-zinc-300 cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* GitHub Stats Cards */}
        <div className="space-y-2">
          <SidebarStatCard label="Merged PRs" value={stats.merged} icon={GitMerge} />
          <SidebarStatCard label="In Progress" value={stats.inProgress} icon={GitPullRequest} />
          <SidebarStatCard label="Bookmarks" value={stats.bookmarksCount} icon={Bookmark} />
        </div>
      </AppSidebar>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
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
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-zinc-800/60">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white truncate max-w-[120px] flex items-center gap-1 justify-end">
                  {isSupporter && <BadgeCheck className="w-3.5 h-3.5 text-white fill-white/10" title="FirstIssue.dev Supporter" />}
                  {githubProfile?.name || getGitHubUsername()}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">@{getGitHubUsername()}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-zinc-800 overflow-hidden flex-shrink-0">
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
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B0C10] border-b border-zinc-800/60 px-4 py-4 space-y-2 animate-badge-modal-backdrop">
            {/* Mobile Profile Summary */}
            <div className="flex items-center gap-3 p-3 bg-zinc-950/25 rounded-lg border border-zinc-800/60 mb-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800/60">
                <img
                  src={githubProfile?.avatar_url || user?.user_metadata?.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  {displayName}
                  {isSupporter && <BadgeCheck className="w-3.5 h-3.5 text-white fill-white/10 flex-shrink-0" title="FirstIssue.dev Supporter" />}
                </p>
                <p className="text-[11px] text-zinc-500 truncate leading-relaxed">{displayBio}</p>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(true); setMobileMenuOpen(false); }}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white transition-all text-[11px] font-semibold rounded text-zinc-300 flex-shrink-0"
              >
                Edit
              </button>
            </div>

            {/* Mobile stat pills */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-zinc-950/25 rounded-lg p-2 text-center border border-zinc-800/60">
                <p className="text-base font-bold text-white font-mono">{stats.merged}</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Merged</p>
              </div>
              <div className="bg-zinc-950/25 rounded-lg p-2 text-center border border-zinc-800/60">
                <p className="text-base font-bold text-white font-mono">{stats.inProgress}</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">In Progress</p>
              </div>
              <div className="bg-zinc-950/25 rounded-lg p-2 text-center border border-zinc-800/60">
                <p className="text-base font-bold text-white font-mono">{stats.bookmarksCount}</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Bookmarks</p>
              </div>
            </div>

            {/* Nav links */}
            <SidebarLink icon={Compass} label="Explore" to="/explore" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={Bookmark} label="Bookmarks" to="/bookmarks" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={TrendingUp} label="Status" to="/status" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={BookOpen} label="Docs" to="/getting-started" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Developer Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
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
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-zinc-950/40 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 rounded transition-all text-xs font-semibold"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">View GitHub</span>
              </a>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white hover:bg-zinc-200 text-black rounded font-semibold transition-all text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Find Issues</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 border-b border-zinc-800/60 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-450 hover:text-zinc-200 hover:border-zinc-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('proof-of-work')}
              className={`px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'proof-of-work'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-450 hover:text-zinc-200 hover:border-zinc-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Proof of Work
            </button>
          </div>

          {activeTab === 'overview' ? (
            <>
          {/* GitHub Info Card */}
          {(githubProfile || customProfile) && (
            <div className="bg-zinc-950/25 rounded-lg p-4 sm:p-5 border border-zinc-800/60 mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400">
                {(customProfile?.location || githubProfile?.location) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                    <span className="truncate">{customProfile?.location || githubProfile?.location}</span>
                  </div>
                )}
                {(customProfile?.company || githubProfile?.company) && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
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
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                    <span className="truncate">{customProfile?.website || githubProfile?.blog}</span>
                  </a>
                )}
                {githubProfile?.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                    <span>
                      Joined{" "}
                      {new Date(githubProfile.created_at).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" },
                      )}
                    </span>
                  </div>
                )}
              </div>
              {githubProfile && (
                <div className="flex gap-4 sm:gap-6 mt-4 pt-4 border-t border-zinc-800/60">
                  <GitHubCounter label="Repositories" value={stats.publicRepos} />
                  <GitHubCounter label="Followers" value={stats.followers} />
                  <GitHubCounter label="Following" value={stats.following} />
                </div>
              )}
            </div>
          )}

          {/* Contribution Heatmap */}
          <div className="bg-zinc-950/25 rounded-lg p-4 sm:p-5 border border-zinc-800/60 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Contribution Activity
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
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
              attestations={attestations}
              username={getGitHubUsername()}
            />
          </div>

          {/* Contribution Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
            <div className="bg-zinc-950/25 rounded-lg p-5 border border-zinc-800/60">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">
                Contribution Breakdown
              </h3>
              <div className="space-y-4">
                <ContributionBar label="Merged" count={stats.merged} total={stats.totalContributions} color="bg-emerald-500" icon={<GitMerge className="w-3.5 h-3.5" />} />
                <ContributionBar label="In Progress" count={stats.inProgress} total={stats.totalContributions} color="bg-purple-500" icon={<GitPullRequest className="w-3.5 h-3.5" />} />
                <ContributionBar label="Applied" count={stats.applied} total={stats.totalContributions} color="bg-amber-500" icon={<AlertCircle className="w-3.5 h-3.5" />} />
                <ContributionBar label="Closed" count={stats.closed} total={stats.totalContributions} color="bg-red-500" icon={<XCircle className="w-3.5 h-3.5" />} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-950/25 rounded-lg p-5 border border-zinc-800/60">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickActionButton icon={<Compass className="w-4 h-4" />} label="Explore Issues" description="Find new open source issues" onClick={() => navigate("/explore")} />
                <QuickActionButton icon={<Bookmark className="w-4 h-4" />} label="View Bookmarks" description={`${stats.bookmarksCount} saved issues`} onClick={() => navigate("/bookmarks")} />
                <QuickActionButton icon={<TrendingUp className="w-4 h-4" />} label="Check Status" description="Track your contributions" onClick={() => navigate("/status")} />
                <QuickActionButton icon={<Github className="w-4 h-4" />} label="GitHub Profile" description="View your GitHub profile" onClick={() => window.open(githubProfile?.html_url, "_blank")} />
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          {supporterData && (
            <div className="bg-zinc-950/25 rounded-lg p-5 border border-zinc-800/60 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-400 flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                      FirstIssue.dev Supporter
                      <BadgeCheck className="w-4 h-4 text-white fill-white/10" />
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {supporterData.status === "active"
                        ? `Renews on ${new Date(supporterData.expires_at).toLocaleDateString()}`
                        : `Access until ${new Date(supporterData.expires_at).toLocaleDateString()} (Cancelled)`}
                    </p>
                  </div>
                </div>
                {supporterData.status === "active" && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 border border-red-950/30 hover:border-red-500/20 text-red-400/90 hover:bg-red-500/5 rounded text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>

              {/* Billing History & Invoices Accordion */}
              <div className="mt-6 pt-6 border-t border-zinc-800/60">
                <button
                  onClick={() => setShowInvoices(!showInvoices)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-zinc-450 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-450" />
                    Billing History & Invoices
                  </span>
                  <span className="p-1 rounded bg-zinc-900 border border-zinc-800/60 text-zinc-400">
                    {showInvoices ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-300" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                  </span>
                </button>

                {showInvoices && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {loadingInvoices ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <span className="ml-2.5 text-xs text-zinc-555">Loading invoices...</span>
                      </div>
                    ) : invoices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800/60 text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">
                              <th className="pb-2">Date</th>
                              <th className="pb-2">Invoice ID</th>
                              <th className="pb-2">Amount</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2 text-right">Invoice</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((invoice) => (
                              <tr key={invoice.payment_id} className="border-b border-zinc-850/40 last:border-0 hover:bg-white/[0.01] transition-colors">
                                <td className="py-2.5 text-zinc-300 font-sans">
                                  {new Date(invoice.created_at).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="py-2.5 text-zinc-450 font-mono truncate max-w-[120px]" title={invoice.invoice_id || invoice.payment_id}>
                                  {invoice.invoice_id || invoice.payment_id}
                                </td>
                                <td className="py-2.5 text-white font-medium">
                                  {Number.isFinite(invoice.amount)
                                    ? (invoice.amount / 100).toLocaleString(undefined, {
                                        style: "currency",
                                        currency: invoice.currency || "USD",
                                      })
                                    : "—"}
                                </td>
                                <td className="py-2.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                                    invoice.status === "succeeded" || invoice.status === "completed"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  }`}>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right">
                                  {invoice.invoice_url ? (
                                    <a
                                      href={invoice.invoice_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors font-medium hover:underline"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-zinc-600">Pending</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 py-3 text-center bg-zinc-950/20 border border-dashed border-zinc-800/60 rounded-lg">
                        No payment history or invoices found.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          </>
          ) : (
            <ProofOfWorkTab />
          )}
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

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md p-5 rounded-lg relative shadow-2xl">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">Cancel Subscription?</h3>
            <p className="text-zinc-450 mb-6 text-xs leading-relaxed">
              Are you sure you want to cancel your FirstIssue.dev Supporter subscription? 
              You'll continue to have full access until the end of your current billing period on 
              {" "}<span className="text-white font-medium">{new Date(supporterData?.expires_at).toLocaleDateString()}</span>.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-1.5 text-zinc-450 hover:text-white text-xs font-semibold transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 rounded text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Sub Components ── */

const SidebarLink = ({ icon: Icon, label, to, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded border text-xs font-semibold transition-all cursor-pointer ${
        active
          ? "bg-white/[0.04] text-white border-zinc-800/80"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] border-transparent"
      }`}
    >
      <Icon className={`w-4 h-4 transition-colors ${active ? "text-white" : "text-zinc-500"}`} />
      {label}
    </Link>
  );
};

const MobileNavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded transition-colors cursor-pointer min-w-0 ${
      active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

const SidebarStatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="bg-zinc-950/25 rounded-lg p-3 border border-zinc-800/60 flex items-center justify-between">
      <div>
        <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="text-xl font-bold text-white font-mono">{value}</p>
      </div>
      <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-400">
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
};

const GitHubCounter = ({ label, value }) => (
  <div>
    <span className="text-base sm:text-lg font-bold text-white font-mono">{value}</span>
    <span className="text-[11px] text-zinc-500 font-semibold ml-1.5 tracking-wide uppercase">{label}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subtitle }) => {
  return (
    <div className="bg-zinc-950/25 rounded-lg p-4 sm:p-5 border border-zinc-800/60 hover:border-zinc-700/80 transition-all group">
      <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800/60 flex items-center justify-center mb-3 text-zinc-400 group-hover:text-white transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white font-mono mb-1">{value}</p>
      <p className="text-[10px] sm:text-[11px] font-bold text-zinc-450 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[10px] text-zinc-650 hidden xs:block">{subtitle}</p>
    </div>
  );
};

const ContributionBar = ({ label, count, total, color, icon }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-zinc-350 font-medium">
          <span className="text-zinc-500">{icon}</span>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-zinc-300">{label}</span>
        </div>
        <span className="text-xs font-mono text-zinc-400">{count}</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800/40 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 sm:gap-4 p-3 bg-zinc-950/30 border border-zinc-800/60 rounded-lg hover:border-zinc-700/80 hover:bg-white/[0.01] transition-all group cursor-pointer"
  >
    <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 flex items-center justify-center group-hover:bg-zinc-850 transition-colors flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className="text-zinc-200 font-semibold text-xs uppercase tracking-wider">{label}</p>
      <p className="text-xs text-zinc-500 truncate mt-0.5">{description}</p>
    </div>
    <div className="text-zinc-600 group-hover:text-white transition-colors flex-shrink-0 text-sm">
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
    // Try sessionStorage cache
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed._ts < 30 * 60 * 1000) {
          setGhCalendar(parsed.data);
          return;
        }
      }
    } catch {}

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
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify({ data: calendar, _ts: Date.now() }));
            } catch {}
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
          dateObj: new Date(day.date + "T00:00:00"),
        }));

        // Month label from first day of each week (Sunday)
        if (week.contributionDays.length > 0) {
          const firstDay = new Date(week.contributionDays[0].date + "T00:00:00");
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

  // Group heatmapData by month to separate them
  const monthGroups = [];
  let currentGroup = null;
  heatmapData.forEach((week, weekIndex) => {
    const ml = monthLabels.find(m => m.week === weekIndex);
    if (ml) {
      currentGroup = { label: ml.label, weeks: [], groupIdx: monthGroups.length };
      monthGroups.push(currentGroup);
    } else if (!currentGroup && weekIndex === 0) {
      currentGroup = { label: "", weeks: [], groupIdx: 0 };
      monthGroups.push(currentGroup);
    }
    if (currentGroup) {
      currentGroup.weeks.push({ days: week, weekIndex });
    }
  });

  const formatTooltipDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Fixed Day Labels */}
        <div className="flex flex-col gap-[3px] text-[10px] text-gray-500 justify-around pr-1 flex-shrink-0 mt-[18px]">
          <div style={{ height: "12px" }}>Mon</div>
          <div style={{ height: "12px" }}></div>
          <div style={{ height: "12px" }}>Wed</div>
          <div style={{ height: "12px" }}></div>
          <div style={{ height: "12px" }}>Fri</div>
          <div style={{ height: "12px" }}></div>
          <div style={{ height: "12px" }}>Sun</div>
        </div>

        {/* Scrollable Heatmap Grid */}
        <div className="flex gap-3 overflow-x-auto pb-2 heatmap-scroll">
          {monthGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col">
              <div className="text-[10px] text-gray-500 mb-1.5 h-3">{group.label}</div>
              <div className="flex gap-[3px]">
                {group.weeks.map(({ days, weekIndex }) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px] flex-shrink-0">
                    {days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-white/40 transition-all cursor-pointer relative`}
                        onMouseEnter={(e) => {
                          const rect = e.target.getBoundingClientRect();
                          setHoveredDay({ 
                            ...day, 
                            rect: { top: rect.top, left: rect.left, width: rect.width }
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredDay.rect && (
        <div
          className="fixed z-50 bg-[#1c1d26] border border-white/20 rounded-lg px-3 py-2 text-xs text-white shadow-xl pointer-events-none whitespace-nowrap"
          style={{
            left: `${hoveredDay.rect.left + hoveredDay.rect.width / 2}px`,
            top: `${hoveredDay.rect.top - 8}px`,
            transform: "translate(-50%, -100%)",
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
