import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks, useRemoveBookmark } from "../hooks/queries/useBookmarks";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import AppSidebar from "../components/AppSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import {
  Search,
  Compass,
  Bookmark,
  User,
  Settings,
  Plus,
  Bell,
  Command,
  ExternalLink,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const BookmarksPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: bookmarks = [], isLoading: loading } = useBookmarks(user?.id);
  const removeBookmarkMutation = useRemoveBookmark(user?.id);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    bookmarkId: null,
    bookmarkTitle: "",
    loading: false,
  });

  const itemsPerPage = 4;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, authLoading, navigate]);

  const deleteBookmark = async (bookmarkId) => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await removeBookmarkMutation.mutateAsync(bookmarkId);

      setDeleteDialog({
        isOpen: false,
        bookmarkId: null,
        bookmarkTitle: "",
        loading: false,
      });
    } catch (err) {
      console.error("Error deleting bookmark:", err);
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `Saved ${diffDays} days ago`;
    if (diffDays < 30)
      return `Saved ${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
    return `Saved ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  // Filter and sort
  const filteredBookmarks = bookmarks
    .filter((b) => {
      if (activeTab === "issues") {
        return b.issue_url && b.issue_url.includes("/issues");
      }
      if (activeTab === "repositories") {
        return !b.issue_url || !b.issue_url.includes("/issues");
      }
      return true;
    })
    .filter((b) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          b.title?.toLowerCase().includes(q) ||
          b.repo_name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);
  const paginatedBookmarks = filteredBookmarks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getLabelBadge = (bookmark) => {
    // Mock logic - in real app, check actual labels
    const labels = [
      {
        match: "urgent",
        text: "URGENT",
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      },
      {
        match: "good first issue",
        text: "GOOD FIRST ISSUE",
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
      {
        match: "feature",
        text: "FEATURE",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
    ];
    // Simple random assignment for demo
    const idx = bookmark.id?.charCodeAt(0) % labels.length || 0;
    return labels[idx];
  };

  if (loading) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="ml-3 text-zinc-400 text-sm">Loading bookmarks...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex flex-1 items-center max-w-xl relative">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search your bookmarks..."
              className="w-full bg-zinc-950/40 border border-zinc-800/80 rounded-md py-1.5 pl-9 pr-4 text-xs text-zinc-350 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-650"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/60">
              <span className="text-xs font-semibold text-zinc-400">
                {user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "alex_dev"}
              </span>
              <div className="w-8 h-8 rounded-full border border-zinc-800 overflow-hidden flex-shrink-0">
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.email || "User"}`
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Your Bookmarks
                </h1>
                <span className="px-2 py-0.5 border border-zinc-800/80 text-zinc-400 text-[10px] font-mono rounded font-semibold uppercase tracking-wider">
                  {bookmarks.length} saved
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Manage your saved open-source opportunities
              </p>
            </div>
            <button 
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/40 border border-zinc-800/85 text-zinc-300 text-xs font-semibold rounded hover:text-white hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-800/60 mb-6">
            <TabButton
              label="All Items"
              active={activeTab === "all"}
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
            />
            <TabButton
              label="Issues"
              active={activeTab === "issues"}
              onClick={() => {
                setActiveTab("issues");
                setCurrentPage(1);
              }}
            />
            <TabButton
              label="Repositories"
              active={activeTab === "repositories"}
              onClick={() => {
                setActiveTab("repositories");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Bookmarks List */}
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950/25 rounded-lg border border-zinc-800/60 p-8">
              <Bookmark className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">
                No bookmarks found
              </h3>
              <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
                {searchQuery
                  ? "Try a different search term"
                  : "Start by exploring issues and bookmarking the ones you like"}
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded transition-all"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <div className="bg-zinc-950/25 rounded-lg border border-zinc-800/60 overflow-hidden">
              {paginatedBookmarks.map((bookmark, index) => {
                const badge = getLabelBadge(bookmark);
                return (
                  <div
                    key={bookmark.id}
                    className={`flex items-center gap-4 p-4 hover:bg-white/[0.01] transition-colors ${
                      index !== paginatedBookmarks.length - 1
                        ? "border-b border-zinc-850/40"
                        : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800/65 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {bookmark.repo_name
                          ?.split("/")[0]
                          ?.substring(0, 2)
                          .toUpperCase() || "GH"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm text-zinc-150 font-semibold truncate hover:text-white transition-colors">
                          {bookmark.title}
                        </h4>
                        {badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded border uppercase ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        <span className="text-zinc-400">
                          {bookmark.repo_name}
                        </span>
                        {bookmark.language && (
                          <span> • {bookmark.language}</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500 font-mono hidden sm:block">
                        {formatTimeAgo(bookmark.created_at)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={bookmark.issue_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredBookmarks.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-zinc-550 font-mono">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredBookmarks.length,
                )}{" "}
                -{" "}
                {Math.min(currentPage * itemsPerPage, filteredBookmarks.length)}{" "}
                of {filteredBookmarks.length} bookmarks
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center px-3 py-1.5 bg-zinc-950/40 border border-zinc-800/80 text-zinc-350 text-xs font-semibold rounded hover:text-white hover:border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="flex items-center justify-center px-3 py-1.5 bg-zinc-950/40 border border-zinc-800/80 text-zinc-350 text-xs font-semibold rounded hover:text-white hover:border-zinc-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

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

/* --- Sub Components --- */

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-3 text-xs font-semibold tracking-wider uppercase transition-all border-b-2 -mb-[2px] ${
      active
        ? "border-white text-white"
        : "border-transparent text-zinc-400 hover:text-zinc-200"
    }`}
  >
    {label}
  </button>
);

export default BookmarksPage;
