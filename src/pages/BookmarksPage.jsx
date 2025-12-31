import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import {
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react";

const BookmarksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    bookmarkId: null,
    bookmarkTitle: "",
    loading: false,
  });

  const statusOptions = [
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

  const updateStatus = async (bookmarkId, newStatus) => {
    setUpdatingStatus(bookmarkId);
    try {
      const { error } = await supabase
        .from("bookmarks")
        .update({ status: newStatus })
        .eq("id", bookmarkId);
      if (error) throw error;
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteBookmark = async (bookmarkId) => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);
      if (error) throw error;
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      setDeleteDialog({
        isOpen: false,
        bookmarkId: null,
        bookmarkTitle: "",
        loading: false,
      });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusConfig = (status) =>
    statusOptions.find((o) => o.value === status) || statusOptions[0];
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
          <span className="ml-3 text-[#EEEEEE]/60">Loading bookmarks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#EEEEEE] mb-2">
          My Bookmarks
        </h1>
        <p className="text-sm sm:text-base text-[#EEEEEE]/60">
          Track your saved issues and manage your contribution progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statusOptions.map(({ value, label, icon: Icon, color, bg }) => {
          const count = bookmarks.filter((b) => b.status === value).length;
          return (
            <div
              key={value}
              className={`p-3 sm:p-4 rounded-xl ${bg} border border-[#393E46]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium ${color}`}>
                    {label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#EEEEEE]">
                    {count}
                  </p>
                </div>
                <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[#393E46]">
          <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-[#EEEEEE]/40 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-[#EEEEEE] mb-2">
            No bookmarks yet
          </h3>
          <p className="text-sm text-[#EEEEEE]/60 mb-6 px-4">
            Start by exploring issues and bookmarking the ones you're interested
            in.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all"
          >
            Explore Issues
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {bookmarks.map((bookmark) => {
            const statusConfig = getStatusConfig(bookmark.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={bookmark.id}
                className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#393E46] hover:border-[#00ADB5]/50 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#00ADB5] truncate">
                        {bookmark.repo_name}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#222831] text-[#EEEEEE]/70 rounded-full">
                        {bookmark.language}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#EEEEEE] mb-2 line-clamp-2">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#EEEEEE]/50 mb-4">
                      Bookmarked on {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-start sm:ml-4">
                    <a
                      href={bookmark.issue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 sm:p-2 bg-[#00ADB5]/20 text-[#00ADB5] rounded-lg hover:bg-[#00ADB5]/30 transition-colors"
                      title="View on GitHub"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          isOpen: true,
                          bookmarkId: bookmark.id,
                          bookmarkTitle: bookmark.title,
                          loading: false,
                        })
                      }
                      className="p-2.5 sm:p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                    <span className="text-sm font-medium text-[#EEEEEE]/70">
                      Status:
                    </span>
                  </div>
                  <select
                    value={bookmark.status}
                    onChange={(e) => updateStatus(bookmark.id, e.target.value)}
                    disabled={updatingStatus === bookmark.id}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1 text-sm bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] focus:ring-2 focus:ring-[#00ADB5] disabled:opacity-50"
                  >
                    {statusOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          !deleteDialog.loading &&
          setDeleteDialog({
            isOpen: false,
            bookmarkId: null,
            bookmarkTitle: "",
            loading: false,
          })
        }
        onConfirm={() =>
          deleteDialog.bookmarkId && deleteBookmark(deleteDialog.bookmarkId)
        }
        loading={deleteDialog.loading}
        title="Remove Bookmark"
        message={`Are you sure you want to remove "${deleteDialog.bookmarkTitle}" from your bookmarks?`}
      />
    </div>
  );
};

export default BookmarksPage;
