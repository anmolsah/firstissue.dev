import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  User,
  Mail,
  Github,
  Calendar,
  Award,
  Target,
  TrendingUp,
  LogOut,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import ManualContributionModal from "../components/ManualContributionModal";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [manualContributions, setManualContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const [bookmarksResult, contributionsResult] = await Promise.all([
        supabase.from("bookmarks").select("*").eq("user_id", user.id),
        supabase
          .from("manual_contributions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (bookmarksResult.error) throw bookmarksResult.error;
      if (contributionsResult.error) throw contributionsResult.error;
      setBookmarks(bookmarksResult.data || []);
      setManualContributions(contributionsResult.data || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (formData) => {
    const { data, error } = await supabase
      .from("manual_contributions")
      .insert({ user_id: user.id, ...formData })
      .select()
      .single();
    if (error) throw error;
    setManualContributions((prev) => [data, ...prev]);
  };

  const handleEditContribution = async (formData) => {
    const { data, error } = await supabase
      .from("manual_contributions")
      .update(formData)
      .eq("id", editingContribution.id)
      .select()
      .single();
    if (error) throw error;
    setManualContributions((prev) =>
      prev.map((c) => (c.id === editingContribution.id ? data : c))
    );
    setEditingContribution(null);
  };

  const handleDeleteContribution = async (contributionId) => {
    if (!confirm("Are you sure you want to delete this contribution?")) return;
    const { error } = await supabase
      .from("manual_contributions")
      .delete()
      .eq("id", contributionId);
    if (error) {
      console.error("Error deleting:", error);
      return;
    }
    setManualContributions((prev) =>
      prev.filter((c) => c.id !== contributionId)
    );
  };

  const getStatusConfig = (status) => {
    const configs = {
      planned: {
        icon: AlertCircle,
        color: "text-[#EEEEEE]/60",
        bg: "bg-[#393E46]",
      },
      in_progress: {
        icon: Plus,
        color: "text-[#00ADB5]",
        bg: "bg-[#00ADB5]/20",
      },
      completed: {
        icon: CheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/20",
      },
    };
    return configs[status] || configs.planned;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const getStats = () => ({
    total: bookmarks.length,
    done: bookmarks.filter((b) => b.status === "done").length,
    workingOn: bookmarks.filter((b) => b.status === "working_on").length,
    applied: bookmarks.filter((b) => b.status === "applied").length,
  });
  const getCombinedStats = () => {
    const bs = getStats();
    const ms = {
      planned: manualContributions.filter((c) => c.status === "planned").length,
      in_progress: manualContributions.filter((c) => c.status === "in_progress")
        .length,
      completed: manualContributions.filter((c) => c.status === "completed")
        .length,
    };
    return {
      total: bs.total + manualContributions.length,
      done: bs.done + ms.completed,
      workingOn: bs.workingOn + ms.in_progress,
      applied: bs.applied + ms.planned,
    };
  };
  const getJoinDate = () =>
    user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown";
  const getLanguageStats = () => {
    const languages = {};
    bookmarks.forEach((b) => {
      const lang = b.language || "unknown";
      languages[lang] = (languages[lang] || 0) + 1;
    });
    return Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
          <span className="ml-3 text-[#EEEEEE]/60">Loading profile...</span>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const combinedStats = getCombinedStats();
  const languageStats = getLanguageStats();

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#EEEEEE] mb-2">Profile</h1>
          <p className="text-[#EEEEEE]/60">
            Manage your account and view your contribution statistics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#00ADB5]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ADB5]/30">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#00ADB5]" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#EEEEEE] mb-1">
                  {user?.user_metadata?.full_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </h2>
                <p className="text-[#EEEEEE]/60 text-sm">
                  Open Source Contributor
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-[#EEEEEE]/60">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm truncate">{user?.email}</span>
                </div>
                {user?.user_metadata?.provider === "github" && (
                  <div className="flex items-center gap-3 text-[#EEEEEE]/60">
                    <Github className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm truncate">
                      {user?.user_metadata?.user_name || "GitHub User"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[#EEEEEE]/60">
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Joined {getJoinDate()}</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {/* Stats */}
            <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46]">
              <h3 className="text-base sm:text-lg font-semibold text-[#EEEEEE] mb-4 sm:mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-[#00ADB5]" />
                Overall Statistics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-[#00ADB5]/10 rounded-xl border border-[#00ADB5]/20">
                  <div className="text-xl sm:text-2xl font-bold text-[#00ADB5] mb-1">
                    {combinedStats.total}
                  </div>
                  <div className="text-xs sm:text-sm text-[#00ADB5]/70 font-medium">
                    Total
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-400 mb-1">
                    {combinedStats.done}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-400/70 font-medium">
                    Completed
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-amber-400 mb-1">
                    {combinedStats.workingOn}
                  </div>
                  <div className="text-xs sm:text-sm text-amber-400/70 font-medium">
                    In Progress
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-[#393E46] rounded-xl border border-[#EEEEEE]/10">
                  <div className="text-xl sm:text-2xl font-bold text-[#EEEEEE]/70 mb-1">
                    {combinedStats.applied}
                  </div>
                  <div className="text-xs sm:text-sm text-[#EEEEEE]/50 font-medium">
                    Planned
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-[#222831] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#EEEEEE]/70">
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-[#00ADB5]">
                    {combinedStats.total > 0
                      ? Math.round(
                          (combinedStats.done / combinedStats.total) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-[#393E46] rounded-full h-2">
                  <div
                    className="bg-[#00ADB5] rounded-full h-2 transition-all duration-500"
                    style={{
                      width: `${
                        combinedStats.total > 0
                          ? (combinedStats.done / combinedStats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Manual Contributions */}
            <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46]">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#EEEEEE] flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#00ADB5]" />
                  <span className="hidden xs:inline">Manual</span> Contributions
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all transform hover:scale-105 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">Add</span>
                </button>
              </div>
              {manualContributions.length === 0 ? (
                <div className="text-center py-8 text-[#EEEEEE]/50">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No manual contributions yet.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {manualContributions.map((contribution) => {
                    const statusConfig = getStatusConfig(contribution.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div
                        key={contribution.id}
                        className="p-3 sm:p-4 border border-[#393E46] rounded-xl hover:border-[#00ADB5]/50 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-medium text-[#00ADB5] truncate">
                                {contribution.repository_name}
                              </span>
                              <div
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusConfig.bg} ${statusConfig.color}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {contribution.status.replace("_", " ")}
                              </div>
                            </div>
                            {contribution.description && (
                              <p className="text-sm text-[#EEEEEE]/60 mb-2 line-clamp-2">
                                {contribution.description}
                              </p>
                            )}
                            <p className="text-xs text-[#EEEEEE]/40">
                              Added {formatDate(contribution.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-start">
                            {contribution.contribution_link && (
                              <a
                                href={contribution.contribution_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 sm:p-2 bg-[#00ADB5]/20 text-[#00ADB5] rounded-lg hover:bg-[#00ADB5]/30 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setEditingContribution(contribution);
                                setShowModal(true);
                              }}
                              className="p-2.5 sm:p-2 bg-[#222831] text-[#EEEEEE]/60 rounded-lg hover:bg-[#222831]/80 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteContribution(contribution.id)
                              }
                              className="p-2.5 sm:p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Languages */}
            {languageStats.length > 0 && (
              <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46]">
                <h3 className="text-base sm:text-lg font-semibold text-[#EEEEEE] mb-4 sm:mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#00ADB5]" />
                  Top Languages
                </h3>
                <div className="space-y-3">
                  {languageStats.map(([language, count], index) => (
                    <div
                      key={language}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-[#00ADB5]"
                              : index === 1
                              ? "bg-emerald-400"
                              : index === 2
                              ? "bg-amber-400"
                              : "bg-[#EEEEEE]/40"
                          }`}
                        ></div>
                        <span className="font-medium text-[#EEEEEE] capitalize">
                          {language}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#222831] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              index === 0
                                ? "bg-[#00ADB5]"
                                : index === 1
                                ? "bg-emerald-400"
                                : index === 2
                                ? "bg-amber-400"
                                : "bg-[#EEEEEE]/40"
                            }`}
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-[#EEEEEE]/60 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46]">
              <h3 className="text-base sm:text-lg font-semibold text-[#EEEEEE] mb-4 sm:mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => navigate("/explore")}
                  className="p-3 sm:p-4 text-left bg-[#00ADB5]/10 hover:bg-[#00ADB5]/20 rounded-xl transition-colors border border-[#00ADB5]/20"
                >
                  <h4 className="font-medium text-[#00ADB5] mb-1 text-sm sm:text-base">
                    Explore Issues
                  </h4>
                  <p className="text-xs sm:text-sm text-[#00ADB5]/70">
                    Find new issues to contribute to
                  </p>
                </button>
                <button
                  onClick={() => navigate("/bookmarks")}
                  className="p-3 sm:p-4 text-left bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors border border-amber-500/20"
                >
                  <h4 className="font-medium text-amber-400 mb-1 text-sm sm:text-base">
                    View Bookmarks
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-400/70">
                    Manage your saved issues
                  </p>
                </button>
                <button
                  onClick={() => navigate("/status")}
                  className="p-3 sm:p-4 text-left bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-500/20"
                >
                  <h4 className="font-medium text-emerald-400 mb-1 text-sm sm:text-base">
                    Track Progress
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-400/70">
                    Monitor your contributions
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ManualContributionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingContribution(null);
        }}
        onSubmit={
          editingContribution ? handleEditContribution : handleAddContribution
        }
        editingContribution={editingContribution}
      />
    </>
  );
};

export default ProfilePage;
