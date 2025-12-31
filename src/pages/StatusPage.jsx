import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  AlertCircle,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

const StatusPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusOptions = [
    {
      value: "all",
      label: "All Status",
      icon: null,
      color: "text-[#EEEEEE]",
      bg: "bg-[#393E46]",
    },
    {
      value: "saved",
      label: "Saved",
      icon: Clock,
      color: "text-[#EEEEEE]/60",
      bg: "bg-[#393E46]",
    },
    {
      value: "applied",
      label: "Applied",
      icon: AlertCircle,
      color: "text-[#00ADB5]",
      bg: "bg-[#00ADB5]/20",
    },
    {
      value: "working_on",
      label: "Working On",
      icon: PlayCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/20",
    },
    {
      value: "done",
      label: "Done",
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookmarks = () =>
    selectedStatus === "all"
      ? bookmarks
      : bookmarks.filter((b) => b.status === selectedStatus);
  const getStatusStats = () => {
    const stats = {};
    statusOptions.slice(1).forEach((s) => {
      stats[s.value] = bookmarks.filter((b) => b.status === s.value).length;
    });
    return stats;
  };
  const getProgressPercentage = () =>
    bookmarks.length === 0
      ? 0
      : Math.round(
          (bookmarks.filter((b) => b.status === "done").length /
            bookmarks.length) *
            100
        );
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const getStatusConfig = (status) =>
    statusOptions.find((o) => o.value === status) || statusOptions[1];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
          <span className="ml-3 text-[#EEEEEE]/60">Loading status...</span>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();
  const filteredBookmarks = getFilteredBookmarks();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#EEEEEE] mb-2">
          Progress Tracker
        </h1>
        <p className="text-[#EEEEEE]/60">
          Monitor your open source contribution journey
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-[#00ADB5]/20 to-[#393E46]/50 rounded-2xl p-8 mb-8 border border-[#00ADB5]/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#EEEEEE] mb-2">
              Your Progress
            </h2>
            <p className="text-[#EEEEEE]/60">
              {stats.done} out of {bookmarks.length} issues completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-[#00ADB5] mb-1">
              {progressPercentage}%
            </div>
            <div className="flex items-center text-[#EEEEEE]/60">
              <TrendingUp className="h-4 w-4 mr-1" />
              Complete
            </div>
          </div>
        </div>
        <div className="w-full bg-[#222831] rounded-full h-3">
          <div
            className="bg-[#00ADB5] rounded-full h-3 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusOptions
          .slice(1)
          .map(({ value, label, icon: Icon, color, bg }) => {
            const count = stats[value];
            return (
              <div
                key={value}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${bg} border-[#393E46] ${
                  selectedStatus === value ? "ring-2 ring-[#00ADB5]" : ""
                }`}
                onClick={() =>
                  setSelectedStatus(selectedStatus === value ? "all" : value)
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${color}`} />
                  <span className="text-2xl font-bold text-[#EEEEEE]">
                    {count}
                  </span>
                </div>
                <p className={`text-sm font-medium ${color}`}>{label}</p>
              </div>
            );
          })}
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl p-2 mb-8 border border-[#393E46]">
        <div className="flex flex-wrap gap-1">
          {statusOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedStatus === value
                  ? "bg-[#00ADB5] text-[#222831] shadow-lg"
                  : "text-[#EEEEEE]/60 hover:text-[#00ADB5] hover:bg-[#222831]"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
              {value !== "all" && (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedStatus === value
                      ? "bg-[#222831]/30 text-[#222831]"
                      : "bg-[#222831] text-[#EEEEEE]/60"
                  }`}
                >
                  {stats[value] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12 bg-[#393E46]/50 backdrop-blur-sm rounded-2xl border border-[#393E46]">
          <Clock className="h-12 w-12 text-[#EEEEEE]/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">
            {selectedStatus === "all"
              ? "No bookmarks yet"
              : `No ${selectedStatus.replace("_", " ")} issues`}
          </h3>
          <p className="text-[#EEEEEE]/60 mb-6">
            {selectedStatus === "all"
              ? "Start by exploring issues and bookmarking the ones you're interested in."
              : `You don't have any issues with ${selectedStatus.replace(
                  "_",
                  " "
                )} status yet.`}
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-3 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all"
          >
            Explore Issues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => {
            const statusConfig = getStatusConfig(bookmark.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={bookmark.id}
                className="bg-[#393E46]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#393E46] hover:border-[#00ADB5]/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#00ADB5]">
                        {bookmark.repo_name}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-[#222831] text-[#EEEEEE]/70 rounded-full">
                        {bookmark.language}
                      </span>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
                      {bookmark.title}
                    </h3>
                    <p className="text-sm text-[#EEEEEE]/50">
                      Bookmarked on {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                  <a
                    href={bookmark.issue_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#00ADB5]/20 text-[#00ADB5] rounded-lg hover:bg-[#00ADB5]/30 transition-colors ml-4"
                    title="View on GitHub"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusPage;
