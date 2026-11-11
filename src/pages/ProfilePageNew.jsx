import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
import MobileBottomNav from "../components/MobileBottomNav";
import ProofOfWorkTab from "../components/ProofOfWorkTab";
import { BrandLogo } from "../components/BrandMark";
import { useBadges } from "../hooks/useBadges";
import { useAttestations } from "../hooks/useProofOfWork";
import {
  Bookmark,
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
  AlertCircle,
  Menu,
  X,
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from "lucide-react";

const ProfilePageNew = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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

  const { contributions, stats: ghStats, getSuccessRate, loading: syncLoading } =
    useGitHubSync(user?.id, true);

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks(user?.id);
  const { data: githubProfile = null } = useGitHubProfile(getGitHubUsername());
  const { data: customProfile = null } = useCustomProfile(user?.id);
  const { data: attestations = [] } = useAttestations(user?.id);

  const { newlyUnlockedBadge, dismissNotification } = useBadges(
    ghStats,
    contributions,
    attestations,
  );

  const loading = syncLoading || bookmarksLoading;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleProfileSave = () => {
    queryClient.invalidateQueries({ queryKey: profileInfoKeys.custom(user.id) });
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { userId: user.id },
      });

      if (error) throw error;
      if (data?.success) {
        await refreshStatus();
        toast.success("Subscription cancelled. Access remains until billing period end.");
      } else {
        toast.error("Failed to cancel subscription: " + (data?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      toast.error("Error cancelling subscription");
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
        const sortedInvoices = [...data.items].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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

  const ghUsername = getGitHubUsername();
  const displayName =
    customProfile?.name ||
    githubProfile?.name ||
    user?.user_metadata?.full_name ||
    ghUsername ||
    "Developer";

  const displayBio =
    customProfile?.bio ||
    githubProfile?.bio ||
    "Open-source contributor";

  if (loading && !githubProfile && bookmarks.length === 0) {
    return (
      <div className="flex bg-[#0F0F0F] min-h-screen items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#DAFA9C] animate-spin" />
        <span className="ml-3 text-[#A8ADB6] text-xs font-mono">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0F0F0F] min-h-screen text-[#F4F4F0] font-sans">
      {/* Left Sidebar (Desktop only) */}
      <AppSidebar>
        {/* Profile Card */}
        <div className="bg-[#141518] rounded-[4px] p-4 border border-[#2B2E36] mb-5">
          <div className="w-14 h-14 rounded-[4px] overflow-hidden mb-3 border border-[#2B2E36] bg-[#0B0C0E]">
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
          <h2 className="text-sm font-bold text-[#F4F4F0] mb-0.5 truncate flex items-center gap-1.5">
            <span className="truncate">{displayName}</span>
            {isSupporter && (
              <BadgeCheck
                className="w-4 h-4 text-[#DAFA9C] shrink-0"
                title="FirstIssue.dev Supporter"
              />
            )}
          </h2>
          <p className="text-xs text-[#A8ADB6] mb-3 leading-relaxed line-clamp-2">
            {displayBio}
          </p>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="w-full py-1.5 bg-[#17181B] border border-[#2B2E36] hover:border-[#3A3E48] hover:text-[#F4F4F0] transition-colors text-xs font-semibold rounded-[4px] text-[#A8ADB6] cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* GitHub Stats Cards */}
        <div className="space-y-2">
          <SidebarStatCard label="Merged PRs" value={stats.merged} icon={GitMerge} />
          <SidebarStatCard label="In Progress" value={stats.inProgress} icon={GitPullRequest} />
          <SidebarStatCard label="Saved" value={stats.bookmarksCount} icon={Bookmark} />
        </div>
      </AppSidebar>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-[#22242A] bg-[#0F0F0F]/95 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] hover:bg-[#17181B] transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to="/"
              className="lg:hidden inline-flex items-center hover:opacity-90 transition-opacity"
            >
              <BrandLogo size="sm" />
            </Link>
            <span className="hidden lg:inline-block text-xs font-mono uppercase tracking-wider text-[#8C929C]">
              Profile &amp; Proof of Work
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-[#22242A]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#F4F4F0] truncate max-w-[140px] flex items-center gap-1 justify-end">
                  {isSupporter && (
                    <BadgeCheck
                      className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0"
                      title="FirstIssue.dev Supporter"
                    />
                  )}
                  <span className="truncate">{githubProfile?.name || ghUsername}</span>
                </p>
                {ghUsername && (
                  <p className="text-[11px] text-[#8C929C] font-mono">@{ghUsername}</p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] border border-[#2B2E36] overflow-hidden shrink-0 bg-[#141518]">
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
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="p-2 text-[#8C929C] hover:text-[#F87171] hover:bg-[#17181B] rounded-[4px] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F0F0F] border-b border-[#22242A] px-4 py-4 space-y-2 animate-in-fade">
            {/* Mobile Profile Summary */}
            <div className="flex items-center gap-3 p-3 bg-[#141518] rounded-[4px] border border-[#2B2E36] mb-3">
              <div className="w-10 h-10 rounded-[4px] overflow-hidden shrink-0 border border-[#2B2E36] bg-[#0B0C0E]">
                <img
                  src={githubProfile?.avatar_url || user?.user_metadata?.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#F4F4F0] truncate flex items-center gap-1.5">
                  <span className="truncate">{displayName}</span>
                  {isSupporter && (
                    <BadgeCheck
                      className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0"
                      title="FirstIssue.dev Supporter"
                    />
                  )}
                </p>
                <p className="text-[11px] text-[#8C929C] truncate leading-relaxed">{displayBio}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 bg-[#17181B] border border-[#2B2E36] hover:border-[#3A3E48] hover:text-[#F4F4F0] transition-colors text-[11px] font-semibold rounded-[4px] text-[#A8ADB6] shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Mobile stat pills */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#141518] rounded-[4px] p-2.5 text-center border border-[#2B2E36]">
                <p className="text-base font-bold text-[#F4F4F0] font-mono tabular-nums">
                  {stats.merged}
                </p>
                <p className="text-[11px] text-[#8C929C] font-mono uppercase tracking-wider font-semibold">
                  Merged
                </p>
              </div>
              <div className="bg-[#141518] rounded-[4px] p-2.5 text-center border border-[#2B2E36]">
                <p className="text-base font-bold text-[#F4F4F0] font-mono tabular-nums">
                  {stats.inProgress}
                </p>
                <p className="text-[11px] text-[#8C929C] font-mono uppercase tracking-wider font-semibold">
                  In Progress
                </p>
              </div>
              <div className="bg-[#141518] rounded-[4px] p-2.5 text-center border border-[#2B2E36]">
                <p className="text-base font-bold text-[#F4F4F0] font-mono tabular-nums">
                  {stats.bookmarksCount}
                </p>
                <p className="text-[11px] text-[#8C929C] font-mono uppercase tracking-wider font-semibold">
                  Saved
                </p>
              </div>
            </div>

            <SidebarLink icon={Compass} label="Explore Issues" to="/explore" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={Bookmark} label="Saved" to="/bookmarks" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={TrendingUp} label="Status" to="/status" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={BookOpen} label="Docs" to="/docs" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight">
                Developer Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#A8ADB6] mt-1">
                Welcome back,{" "}
                {customProfile?.name?.split(" ")[0] ||
                  githubProfile?.name?.split(" ")[0] ||
                  ghUsername ||
                  "Developer"}
                .
                {stats.totalContributions > 0 &&
                  ` You have ${stats.totalContributions} tracked contributions.`}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={githubProfile?.html_url || (ghUsername ? `https://github.com/${ghUsername}` : "https://github.com")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48] hover:bg-[#17181B] rounded-[4px] transition-colors text-xs font-semibold"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">View GitHub</span>
              </a>
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold transition-colors text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Find Issues</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            role="tablist"
            aria-label="Profile dashboard views"
            className="flex space-x-6 border-b border-[#22242A] mb-6"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              className={`px-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px] cursor-pointer ${
                activeTab === "overview"
                  ? "border-[#DAFA9C] text-[#F4F4F0]"
                  : "border-transparent text-[#8C929C] hover:text-[#F4F4F0]"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "proof-of-work"}
              onClick={() => setActiveTab("proof-of-work")}
              className={`px-1 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
                activeTab === "proof-of-work"
                  ? "border-[#DAFA9C] text-[#F4F4F0]"
                  : "border-transparent text-[#8C929C] hover:text-[#F4F4F0]"
              }`}
            >
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  activeTab === "proof-of-work" ? "text-[#DAFA9C]" : "text-[#8C929C]"
                }`}
              />
              Proof of Work
            </button>
          </div>

          {activeTab === "overview" ? (
            <>
              {/* GitHub Info Card */}
              {(githubProfile || customProfile) && (
                <div className="bg-[#141518] rounded-[4px] p-4 sm:p-5 border border-[#2B2E36] mb-6 sm:mb-8">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#A8ADB6]">
                    {(customProfile?.college || user?.user_metadata?.college) && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#8C929C]" />
                        <span className="truncate">
                          {customProfile?.college || user?.user_metadata?.college}
                        </span>
                      </div>
                    )}
                    {(customProfile?.location || githubProfile?.location) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#8C929C]" />
                        <span className="truncate">
                          {customProfile?.location || githubProfile?.location}
                        </span>
                      </div>
                    )}
                    {(customProfile?.company || githubProfile?.company) && (
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 shrink-0 text-[#8C929C]" />
                        <span className="truncate">
                          {customProfile?.company || githubProfile?.company}
                        </span>
                      </div>
                    )}
                    {(customProfile?.website || githubProfile?.blog) && (
                      <a
                        href={
                          (customProfile?.website || githubProfile?.blog || "").startsWith("http")
                            ? customProfile?.website || githubProfile?.blog
                            : `https://${customProfile?.website || githubProfile?.blog}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#DAFA9C] transition-colors"
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0 text-[#8C929C]" />
                        <span className="truncate">
                          {customProfile?.website || githubProfile?.blog}
                        </span>
                      </a>
                    )}
                    {githubProfile?.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-[#8C929C]" />
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
                    <div className="flex flex-wrap gap-5 sm:gap-6 mt-4 pt-4 border-t border-[#22242A]">
                      <GitHubCounter label="Repositories" value={stats.publicRepos} />
                      <GitHubCounter label="Followers" value={stats.followers} />
                      <GitHubCounter label="Following" value={stats.following} />
                    </div>
                  )}
                </div>
              )}

              {/* Contribution Heatmap */}
              <div className="bg-[#141518] rounded-[4px] p-4 sm:p-5 border border-[#2B2E36] mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-mono font-bold text-[#A8ADB6] uppercase tracking-wider">
                    Contribution Activity
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C929C]">
                    <span>Less</span>
                    <div className="flex gap-0.5">
                      <div className="w-3 h-3 rounded-[2px] bg-[#161b22]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#0e4429]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#006d32]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#26a641]" />
                      <div className="w-3 h-3 rounded-[2px] bg-[#39d353]" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
                <ContributionHeatmap contributions={contributions} username={ghUsername} />
              </div>

              {/* Badges Section */}
              <div className="mb-6 sm:mb-8">
                <BadgesSection
                  stats={contributionStats}
                  contributions={contributions}
                  attestations={attestations}
                  username={ghUsername}
                />
              </div>

              {/* Contribution Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatCard
                  icon={GitMerge}
                  label="Merged PRs"
                  value={stats.merged}
                  iconColor="text-[#34D399]"
                  subtitle="Successfully merged"
                />
                <StatCard
                  icon={GitPullRequest}
                  label="In Progress"
                  value={stats.inProgress}
                  iconColor="text-[#DAFA9C]"
                  subtitle="Open pull requests"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Applied"
                  value={stats.applied}
                  iconColor="text-[#F59E0B]"
                  subtitle="Assigned or commented"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Success Rate"
                  value={`${stats.successRate}%`}
                  iconColor="text-[#34D399]"
                  subtitle="PR merge rate"
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Contribution Breakdown */}
                <div className="bg-[#141518] rounded-[4px] p-5 border border-[#2B2E36]">
                  <h2 className="text-xs font-mono font-bold text-[#A8ADB6] uppercase tracking-wider mb-6">
                    Contribution Breakdown
                  </h2>
                  <div className="space-y-4">
                    <ContributionBar
                      label="Merged"
                      count={stats.merged}
                      total={stats.totalContributions}
                      color="bg-[#34D399]"
                      icon={<GitMerge className="w-3.5 h-3.5 text-[#34D399]" />}
                    />
                    <ContributionBar
                      label="In Progress"
                      count={stats.inProgress}
                      total={stats.totalContributions}
                      color="bg-[#DAFA9C]"
                      icon={<GitPullRequest className="w-3.5 h-3.5 text-[#DAFA9C]" />}
                    />
                    <ContributionBar
                      label="Applied"
                      count={stats.applied}
                      total={stats.totalContributions}
                      color="bg-[#F59E0B]"
                      icon={<AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                    />
                    <ContributionBar
                      label="Closed"
                      count={stats.closed}
                      total={stats.totalContributions}
                      color="bg-[#F87171]"
                      icon={<XCircle className="w-3.5 h-3.5 text-[#F87171]" />}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#141518] rounded-[4px] p-5 border border-[#2B2E36]">
                  <h2 className="text-xs font-mono font-bold text-[#A8ADB6] uppercase tracking-wider mb-6">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <QuickActionButton
                      icon={<Compass className="w-4 h-4" />}
                      label="Explore Issues"
                      description="Find verified good first issues"
                      onClick={() => navigate("/explore")}
                    />
                    <QuickActionButton
                      icon={<Bookmark className="w-4 h-4" />}
                      label="Saved Queue"
                      description={`${stats.bookmarksCount} saved items`}
                      onClick={() => navigate("/bookmarks")}
                    />
                    <QuickActionButton
                      icon={<TrendingUp className="w-4 h-4" />}
                      label="Check Status"
                      description="Track active pull requests"
                      onClick={() => navigate("/status")}
                    />
                    <QuickActionButton
                      icon={<Github className="w-4 h-4" />}
                      label="GitHub Profile"
                      description="Open your public GitHub profile"
                      onClick={() =>
                        window.open(
                          githubProfile?.html_url ||
                            (ghUsername ? `https://github.com/${ghUsername}` : "https://github.com"),
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              {supporterData && (
                <div className="bg-[#141518] rounded-[4px] p-5 border border-[#2B2E36] mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center text-[#DAFA9C] shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#F4F4F0] flex items-center gap-1.5 uppercase tracking-wide">
                          FirstIssue.dev Supporter
                          <BadgeCheck className="w-4 h-4 text-[#DAFA9C]" />
                        </h3>
                        <p className="text-xs text-[#A8ADB6] mt-0.5 tabular-nums">
                          {supporterData.status === "active"
                            ? `Renews on ${new Date(supporterData.expires_at).toLocaleDateString()}`
                            : `Access until ${new Date(supporterData.expires_at).toLocaleDateString()} (Cancelled)`}
                        </p>
                      </div>
                    </div>
                    {supporterData.status === "active" && (
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="px-3 py-1.5 border border-[#F87171]/35 hover:border-[#F87171]/60 text-[#F87171] hover:bg-[#F87171]/10 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>

                  {/* Billing History & Invoices Accordion */}
                  <div className="mt-6 pt-5 border-t border-[#22242A]">
                    <button
                      type="button"
                      aria-expanded={showInvoices}
                      onClick={() => setShowInvoices(!showInvoices)}
                      className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-[#A8ADB6] uppercase tracking-wider cursor-pointer hover:text-[#F4F4F0] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8C929C]" />
                        Billing History & Invoices
                      </span>
                      <span className="p-1 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] text-[#A8ADB6]">
                        {showInvoices ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>

                    {showInvoices && (
                      <div className="mt-4">
                        {loadingInvoices ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 text-[#DAFA9C] animate-spin" />
                            <span className="ml-2.5 text-xs font-mono text-[#8C929C]">
                              Loading invoices...
                            </span>
                          </div>
                        ) : invoices.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-[#22242A] text-[#8C929C] font-mono font-semibold uppercase tracking-wider text-[11px]">
                                  <th className="pb-2">Date</th>
                                  <th className="pb-2">Invoice ID</th>
                                  <th className="pb-2">Amount</th>
                                  <th className="pb-2">Status</th>
                                  <th className="pb-2 text-right">Invoice</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoices.map((invoice) => (
                                  <tr
                                    key={invoice.payment_id}
                                    className="border-b border-[#22242A] last:border-0 hover:bg-[#17181B] transition-colors"
                                  >
                                    <td className="py-2.5 text-[#F4F4F0] tabular-nums">
                                      {new Date(invoice.created_at).toLocaleDateString(
                                        undefined,
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        },
                                      )}
                                    </td>
                                    <td
                                      className="py-2.5 text-[#A8ADB6] font-mono truncate max-w-[140px]"
                                      title={invoice.invoice_id || invoice.payment_id}
                                    >
                                      {invoice.invoice_id || invoice.payment_id}
                                    </td>
                                    <td className="py-2.5 text-[#F4F4F0] font-mono font-medium tabular-nums">
                                      {Number.isFinite(invoice.amount)
                                        ? (invoice.amount / 100).toLocaleString(undefined, {
                                            style: "currency",
                                            currency: invoice.currency || "USD",
                                          })
                                        : "—"}
                                    </td>
                                    <td className="py-2.5">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-semibold uppercase tracking-wide ${
                                          invoice.status === "succeeded" ||
                                          invoice.status === "completed"
                                            ? "bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30"
                                            : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                                        }`}
                                      >
                                        {invoice.status}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                      {invoice.invoice_url ? (
                                        <a
                                          href={invoice.invoice_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[#DAFA9C] hover:text-[#C7F275] transition-colors font-medium hover:underline"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          Download
                                        </a>
                                      ) : (
                                        <span className="text-[#8C929C]">Pending</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-[#8C929C] py-4 text-center bg-[#0B0C0E] border border-dashed border-[#2B2E36] rounded-[4px]">
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

      <MobileBottomNav />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        githubProfile={githubProfile}
        onSave={handleProfileSave}
      />

      {newlyUnlockedBadge && (
        <BadgeUnlockedNotification
          badge={newlyUnlockedBadge}
          onClose={dismissNotification}
        />
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-sub-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-badge-modal-backdrop"
        >
          <div className="bg-[#141518] border border-[#2B2E36] w-full max-w-md p-6 rounded-[4px] relative shadow-2xl animate-badge-modal-in">
            <button
              type="button"
              aria-label="Close cancel subscription dialog"
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 p-1 text-[#8C929C] hover:text-[#F4F4F0] rounded-[4px] hover:bg-[#1C1E23] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3
              id="cancel-sub-title"
              className="text-base font-bold text-[#F4F4F0] mb-2 uppercase tracking-wide"
            >
              Cancel Subscription?
            </h3>
            <p className="text-[#A8ADB6] mb-6 text-xs leading-relaxed">
              Are you sure you want to cancel your FirstIssue.dev Supporter subscription?
              You will continue to have full access until the end of your current billing
              period on{" "}
              <span className="text-[#F4F4F0] font-semibold">
                {new Date(supporterData?.expires_at).toLocaleDateString()}
              </span>
              .
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 bg-[#17181B] border border-[#2B2E36] hover:border-[#3A3E48] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="px-3.5 py-2 bg-[#F87171]/15 hover:bg-[#F87171]/25 border border-[#F87171]/40 text-[#F87171] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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

/* Sub Components */

const SidebarLink = ({ icon, label, to, onClick }) => {
  const Icon = icon;
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] border text-xs font-semibold transition-colors ${
        active
          ? "bg-[#17181B] text-[#F4F4F0] border-[#2B2E36]"
          : "text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#141518] border-transparent"
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-[#DAFA9C]" : "text-[#8C929C]"}`} />
      <span>{label}</span>
    </Link>
  );
};

const SidebarStatCard = ({ label, value, icon }) => {
  const Icon = icon;
  return (
    <div className="bg-[#141518] rounded-[4px] p-3 border border-[#2B2E36] flex items-center justify-between">
      <div>
        <p className="text-[11px] font-mono text-[#8C929C] uppercase tracking-wider font-semibold mb-0.5">
          {label}
        </p>
        <p className="text-xl font-bold text-[#F4F4F0] font-mono tabular-nums">{value}</p>
      </div>
      <div className="w-8 h-8 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center text-[#A8ADB6]">
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
};

const GitHubCounter = ({ label, value }) => (
  <div>
    <span className="text-base sm:text-lg font-bold text-[#F4F4F0] font-mono tabular-nums">
      {value}
    </span>
    <span className="text-[11px] text-[#8C929C] font-mono font-semibold ml-1.5 tracking-wide uppercase">
      {label}
    </span>
  </div>
);

const StatCard = ({ icon, label, value, subtitle, iconColor = "text-[#A8ADB6]" }) => {
  const Icon = icon;
  return (
    <div className="bg-[#141518] rounded-[4px] p-4 sm:p-5 border border-[#2B2E36] hover:border-[#3A3E48] transition-colors">
      <div className="w-8 h-8 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#F4F4F0] font-mono mb-1 tabular-nums">
        {value}
      </p>
      <p className="text-[11px] font-mono font-bold text-[#A8ADB6] uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-[11px] text-[#8C929C] hidden xs:block">{subtitle}</p>
    </div>
  );
};

const ContributionBar = ({ label, count, total, color, icon }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-medium">
          <span>{icon}</span>
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#F4F4F0]">
            {label}
          </span>
        </div>
        <span className="text-xs font-mono text-[#A8ADB6] tabular-nums">{count}</span>
      </div>
      <div className="w-full h-2 bg-[#0B0C0E] border border-[#22242A] rounded-[2px] overflow-hidden">
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
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 sm:gap-4 p-3 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] hover:border-[#DAFA9C]/60 hover:bg-[#17181B] transition-colors group cursor-pointer"
  >
    <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] flex items-center justify-center group-hover:text-[#DAFA9C] transition-colors shrink-0">
      {icon}
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className="text-[#F4F4F0] font-mono font-semibold text-xs uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xs text-[#8C929C] truncate mt-0.5">{description}</p>
    </div>
    <div className="text-[#8C929C] group-hover:text-[#DAFA9C] transition-colors shrink-0 text-sm font-mono">
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
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed._ts < 30 * 60 * 1000) {
          setGhCalendar(parsed.data);
          return;
        }
      }
    } catch {
      /* ignore sessionStorage read errors */
    }

    const fetchCalendar = async () => {
      setLoadingCalendar(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, variables: { username } }),
        });

        if (response.ok) {
          const data = await response.json();
          const calendar =
            data?.data?.user?.contributionsCollection?.contributionCalendar;
          if (calendar) {
            setGhCalendar(calendar);
            try {
              sessionStorage.setItem(
                cacheKey,
                JSON.stringify({ data: calendar, _ts: Date.now() }),
              );
            } catch {
              /* ignore sessionStorage write errors */
            }
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

  const getLevelColor = (level) => {
    switch (level) {
      case 0:
        return "bg-[#161b22]";
      case 1:
        return "bg-[#0e4429]";
      case 2:
        return "bg-[#006d32]";
      case 3:
        return "bg-[#26a641]";
      case 4:
        return "bg-[#39d353]";
      default:
        return "bg-[#161b22]";
    }
  };

  const levelToNumber = (levelStr) => {
    switch (levelStr) {
      case "NONE":
        return 0;
      case "FIRST_QUARTILE":
        return 1;
      case "SECOND_QUARTILE":
        return 2;
      case "THIRD_QUARTILE":
        return 3;
      case "FOURTH_QUARTILE":
        return 4;
      default:
        return 0;
    }
  };

  const generateHeatmapData = () => {
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

        if (week.contributionDays.length > 0) {
          const firstDay = new Date(week.contributionDays[0].date + "T00:00:00");
          const monthName = firstDay.toLocaleDateString("en-US", {
            month: "short",
          });
          if (monthName !== currentMonth) {
            monthLabels.push({ week: wIndex, label: monthName });
            currentMonth = monthName;
          }
        }

        heatmapData.push(weekData);
      });

      return { heatmapData, monthLabels };
    }

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
    startDate.setDate(today.getDate() - weeks * 7 - today.getDay());

    let currentMonth = null;

    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split("T")[0];
        const count = contributionMap.get(dateStr) || 0;

        if (date > today) {
          week.push({
            level: 0,
            count: 0,
            date: dateStr,
            dateObj: date,
            isFuture: true,
          });
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

  const monthGroups = [];
  let currentGroup = null;
  heatmapData.forEach((week, weekIndex) => {
    const ml = monthLabels.find((m) => m.week === weekIndex);
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
        <div className="flex flex-col gap-[3px] text-[11px] font-mono text-[#8C929C] justify-around pr-1 shrink-0 mt-[20px]">
          <div style={{ height: "12px" }}>Mon</div>
          <div style={{ height: "12px" }} />
          <div style={{ height: "12px" }}>Wed</div>
          <div style={{ height: "12px" }} />
          <div style={{ height: "12px" }}>Fri</div>
          <div style={{ height: "12px" }} />
          <div style={{ height: "12px" }}>Sun</div>
        </div>

        {/* Scrollable Heatmap Grid */}
        <div className="flex gap-3 overflow-x-auto pb-2 heatmap-scroll">
          {monthGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col">
              <div className="text-[11px] font-mono text-[#8C929C] mb-1.5 h-3.5">
                {group.label}
              </div>
              <div className="flex gap-[3px]">
                {group.weeks.map(({ days, weekIndex }) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px] shrink-0">
                    {days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-[2px] ${getLevelColor(day.level)} hover:ring-2 hover:ring-[#DAFA9C]/60 transition-all cursor-pointer relative`}
                        onMouseEnter={(e) => {
                          const rect = e.target.getBoundingClientRect();
                          setHoveredDay({
                            ...day,
                            rect: { top: rect.top, left: rect.left, width: rect.width },
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
          className="fixed z-50 bg-[#17181B] border border-[#3A3E48] rounded-[4px] px-3 py-2 text-xs text-[#F4F4F0] shadow-xl pointer-events-none whitespace-nowrap"
          style={{
            left: `${hoveredDay.rect.left + hoveredDay.rect.width / 2}px`,
            top: `${hoveredDay.rect.top - 8}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-mono font-semibold tabular-nums">
            {hoveredDay.count} {hoveredDay.count === 1 ? "contribution" : "contributions"}
          </div>
          <div className="text-[#8C929C] text-[11px] mt-0.5">
            {formatTooltipDate(hoveredDay.date)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePageNew;
