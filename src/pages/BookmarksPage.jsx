import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks, useRemoveBookmark } from "../hooks/queries/useBookmarks";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import AppSidebar from "../components/AppSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import BrandMark from "../components/BrandMark";
import {
  Search,
  Bookmark,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { withUTM, extractRepo } from "../utils/utm";
import { trackIssueClick } from "../utils/analytics";

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
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Saved today";
    if (diffDays === 1) return "Saved yesterday";
    if (diffDays < 7) return `Saved ${diffDays}d ago`;
    if (diffDays < 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `Saved ${weeks}w ago`;
    }
    return `Saved ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

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

  const totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookmarks = filteredBookmarks.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const getItemTypeBadge = (bookmark) => {
    const isIssue = bookmark.issue_url && bookmark.issue_url.includes("/issues");
    if (isIssue) {
      return {
        text: "ISSUE",
        classes: "bg-[#DAFA9C]/10 text-[#DAFA9C] border-[#DAFA9C]/30",
      };
    }
    return {
      text: "REPO",
      classes: "bg-[#17181B] text-[#A8ADB6] border-[#2B2E36]",
    };
  };

  if (loading) {
    return (
      <div className="flex bg-[#0F0F0F] min-h-screen items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#DAFA9C] animate-spin" />
        <span className="ml-3 text-[#A8ADB6] text-xs font-mono">Loading saved items...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0F0F0F] min-h-screen text-[#F4F4F0] font-sans">
      <AppSidebar />

      <main className="flex-1 lg:ml-64 min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-[#22242A] bg-[#0F0F0F]/95 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <Link
              to="/"
              className="lg:hidden shrink-0"
              aria-label="FirstIssue.dev home"
            >
              <BrandMark size="sm" />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C929C] pointer-events-none" />
              <input
                type="text"
                aria-label="Search saved bookmarks"
                placeholder="Search saved issues or repositories..."
                className="w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] py-2 pl-9 pr-4 text-xs text-[#F4F4F0] focus:outline-none focus:border-[#DAFA9C] transition-colors placeholder:text-[#8C929C]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-[#22242A] shrink-0">
            <span className="hidden sm:inline text-xs font-medium text-[#A8ADB6] truncate max-w-[140px]">
              {user?.user_metadata?.full_name ||
                user?.email?.split("@")[0] ||
                "Developer"}
            </span>
            <div className="w-8 h-8 rounded-[4px] border border-[#2B2E36] overflow-hidden shrink-0 bg-[#141518]">
              <img
                src={
                  user?.user_metadata?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.email || "User"}`
                }
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F4F0]">
                  Saved Queue
                </h1>
                <span className="px-2 py-0.5 bg-[#17181B] border border-[#2B2E36] text-[#A8ADB6] text-[11px] font-mono rounded-[4px] font-semibold uppercase tracking-wider tabular-nums">
                  {bookmarks.length} saved
                </span>
              </div>
              <p className="text-xs text-[#8C929C]">
                Shortlisted issues and repositories ready for your next pull request.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] text-xs font-medium rounded-[4px] hover:text-[#F4F4F0] hover:border-[#3A3E48] hover:bg-[#17181B] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8C929C]" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Filter saved items"
            className="flex items-center gap-6 border-b border-[#22242A] mb-6"
          >
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
            <div className="text-center py-14 bg-[#141518] rounded-[4px] border border-[#2B2E36] p-8">
              <div className="w-10 h-10 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center mx-auto mb-3 text-[#8C929C]">
                <Bookmark className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-[#F4F4F0] mb-1">
                No saved items found
              </h2>
              <p className="text-xs text-[#8C929C] mb-5 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search query or switching tabs."
                  : "Browse verified open-source issues and save targets you want to tackle next."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-xs font-semibold rounded-[4px] transition-colors cursor-pointer"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <div className="bg-[#141518] rounded-[4px] border border-[#2B2E36] divide-y divide-[#22242A] overflow-hidden">
              {paginatedBookmarks.map((bookmark) => {
                const badge = getItemTypeBadge(bookmark);
                return (
                  <div
                    key={bookmark.id}
                    className="flex items-center gap-4 p-4 hover:bg-[#17181B] transition-colors"
                  >
                    {/* Monogram Icon */}
                    <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-mono font-bold text-[#A8ADB6]">
                        {bookmark.repo_name
                          ?.split("/")[0]
                          ?.substring(0, 2)
                          .toUpperCase() || "GH"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <a
                          href={withUTM(bookmark.issue_url, {
                            medium: "bookmarks",
                            content: "title_link",
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackIssueClick({
                              issueUrl: bookmark.issue_url,
                              source: "bookmarks",
                              repo: extractRepo(bookmark.issue_url),
                              action: "title_link",
                            })
                          }
                          className="text-sm text-[#F4F4F0] font-semibold truncate hover:text-[#DAFA9C] transition-colors"
                        >
                          {bookmark.title}
                        </a>
                        <span
                          className={`px-1.5 py-0.5 text-[11px] font-mono font-semibold tracking-wider rounded-[4px] border uppercase shrink-0 ${badge.classes}`}
                        >
                          {badge.text}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C929C] font-mono truncate">
                        <span className="text-[#A8ADB6]">
                          {bookmark.repo_name}
                        </span>
                        {bookmark.language && (
                          <span> · {bookmark.language}</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <span className="text-xs text-[#8C929C] font-mono hidden sm:block tabular-nums">
                        {formatTimeAgo(bookmark.created_at)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={withUTM(bookmark.issue_url, {
                            medium: "bookmarks",
                            content: "external_icon",
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${bookmark.title} on GitHub`}
                          className="p-2 text-[#8C929C] hover:text-[#DAFA9C] hover:bg-[#1C1E23] border border-transparent hover:border-[#2B2E36] rounded-[4px] transition-colors"
                          onClick={() =>
                            trackIssueClick({
                              issueUrl: bookmark.issue_url,
                              source: "bookmarks",
                              repo: extractRepo(bookmark.issue_url),
                              action: "external_link",
                            })
                          }
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          aria-label={`Remove ${bookmark.title} from bookmarks`}
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              bookmarkId: bookmark.id,
                              bookmarkTitle: bookmark.title,
                              loading: false,
                            })
                          }
                          className="p-2 text-[#8C929C] hover:text-[#F87171] hover:bg-[#F87171]/10 border border-transparent hover:border-[#F87171]/30 rounded-[4px] transition-colors cursor-pointer"
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
              <p className="text-xs text-[#8C929C] font-mono tabular-nums">
                Showing{" "}
                {Math.min(
                  (safePage - 1) * itemsPerPage + 1,
                  filteredBookmarks.length,
                )}{" "}
                –{" "}
                {Math.min(safePage * itemsPerPage, filteredBookmarks.length)}{" "}
                of {filteredBookmarks.length} saved
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] text-xs font-medium rounded-[4px] hover:text-[#F4F4F0] hover:border-[#3A3E48] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] text-xs font-medium rounded-[4px] hover:text-[#F4F4F0] hover:border-[#3A3E48] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`pb-3 text-xs font-mono font-semibold tracking-wider uppercase transition-colors border-b-2 -mb-[1px] cursor-pointer ${
      active
        ? "border-[#DAFA9C] text-[#F4F4F0]"
        : "border-transparent text-[#8C929C] hover:text-[#F4F4F0]"
    }`}
  >
    {label}
  </button>
);

export default BookmarksPage;
