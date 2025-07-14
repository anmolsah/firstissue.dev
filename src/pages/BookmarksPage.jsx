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

  const statusOptions = [
    { value: "saved", label: "Saved", icon: Clock, color: "gray" },
    { value: "applied", label: "Applied", icon: AlertCircle, color: "blue" },
    {
      value: "working_on",
      label: "Working On",
      icon: PlayCircle,
      color: "yellow",
    },
    { value: "done", label: "Done", icon: CheckCircle, color: "green" },
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
        prev.map((bookmark) =>
          bookmark.id === bookmarkId
            ? { ...bookmark, status: newStatus }
            : bookmark
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteBookmark = async (bookmarkId) => {
    if (!confirm("Are you sure you want to remove this bookmark?")) return;

    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);

      if (error) throw error;

      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.id !== bookmarkId)
      );
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark. Please try again.");
    }
  };

  const getStatusConfig = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading bookmarks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookmarks</h1>
        <p className="text-gray-600">
          Track your saved issues and manage your contribution progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusOptions.map(({ value, label, icon: Icon, color }) => {
          const count = bookmarks.filter((b) => b.status === value).length;
          const colorClasses = {
            gray: "bg-gray-100 text-gray-700",
            blue: "bg-blue-100 text-blue-700",
            yellow: "bg-yellow-100 text-yellow-700",
            green: "bg-green-100 text-green-700",
          };

          return (
            <div
              key={value}
              className={`p-4 rounded-xl ${colorClasses[color]}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Icon className="h-8 w-8 opacity-75" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by exploring issues and bookmarking the ones you're interested
            in.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            Explore Issues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => {
            const statusConfig = getStatusConfig(bookmark.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={bookmark.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-indigo-600">
                        {bookmark.repo_name}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {bookmark.language}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {bookmark.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Bookmarked on {formatDate(bookmark.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={bookmark.issue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                      title="View on GitHub"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>

                    <button
                      onClick={() => openDeleteDialog(bookmark)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`h-5 w-5 text-${statusConfig.color}-600`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Status:
                    </span>
                  </div>

                  <select
                    value={bookmark.status}
                    onChange={(e) => updateStatus(bookmark.id, e.target.value)}
                    disabled={updatingStatus === bookmark.id}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        loading={deleteDialog.loading}
        title="Remove Bookmark"
        message={`Are you sure you want to remove this bookmark? "${deleteDialog.bookmarkTitle}" will be permanently removed from your bookmarks.`}
      />
    </div>
  );
};

export default BookmarksPage;
