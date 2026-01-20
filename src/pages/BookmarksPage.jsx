import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
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
} from "lucide-react";

const BookmarksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("bookmarks");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    bookmarkId: null,
    bookmarkTitle: "",
    loading: false,
  });

  const itemsPerPage = 4;

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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `Saved ${diffDays} days ago`;
    if (diffDays < 30) return `Saved ${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
    return `Saved ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  // Filter and paginate
  const filteredBookmarks = bookmarks.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.title?.toLowerCase().includes(q) || b.repo_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);
  const paginatedBookmarks = filteredBookmarks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getLabelBadge = (bookmark) => {
    // Mock logic - in real app, check actual labels
    const labels = [
      { match: "urgent", text: "URGENT", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { match: "good first issue", text: "GOOD FIRST ISSUE", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      { match: "feature", text: "FEATURE", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ];
    // Simple random assignment for demo
    const idx = bookmark.id?.charCodeAt(0) % labels.length || 0;
    return labels[idx];
  };

  if (loading) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading bookmarks...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* Left Sidebar */}
      <aside className="w-56 border-r border-white/5 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-10">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Command className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">FirstIssue.dev</span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={Compass} label="Explore" active={activeNav === 'explore'} onClick={() => navigate('/explore')} />
            <NavItem icon={Bookmark} label="Bookmarks" active={activeNav === 'bookmarks'} onClick={() => setActiveNav('bookmarks')} />
            <NavItem icon={User} label="Profile" active={activeNav === 'profile'} onClick={() => navigate('/profile')} />
            <NavItem icon={Settings} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
          </nav>
        </div>

        {/* New Issue Button */}
        <div className="mt-auto p-4">
          <button
            onClick={() => navigate('/explore')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Issue
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex flex-1 items-center max-w-xl relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search your bookmarks..."
              className="w-full bg-[#15161E] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <span className="text-sm text-gray-400">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'alex_dev'}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'User'}`} alt="Avatar" className="w-full h-full rounded-full bg-[#0B0C10]" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">Your Bookmarks</h1>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm font-medium rounded-full">
                  {bookmarks.length} SAVED
                </span>
              </div>
              <p className="text-gray-400">Managing your saved open-source opportunities</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#15161E] border border-white/10 text-gray-300 rounded-lg hover:text-white hover:border-white/20 transition-colors">
              <Filter className="w-4 h-4" />
              Sort by Date
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-white/5 mb-6">
            <TabButton label="All Items" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
            <TabButton label="Issues" active={activeTab === 'issues'} onClick={() => setActiveTab('issues')} />
            <TabButton label="Repositories" active={activeTab === 'repositories'} onClick={() => setActiveTab('repositories')} />
          </div>

          {/* Bookmarks List */}
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-[#15161E] rounded-xl border border-white/5">
              <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No bookmarks found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? "Try a different search term" : "Start by exploring issues and bookmarking the ones you like"}
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <div className="bg-[#15161E] rounded-xl border border-white/5 overflow-hidden">
              {paginatedBookmarks.map((bookmark, index) => {
                const badge = getLabelBadge(bookmark);
                return (
                  <div
                    key={bookmark.id}
                    className={`flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors ${
                      index !== paginatedBookmarks.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {bookmark.repo_name?.split('/')[0]?.substring(0, 2).toUpperCase() || 'GH'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium truncate">{bookmark.title}</h4>
                        {badge && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${badge.color}`}>
                            {badge.text}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        <span className="text-gray-400">{bookmark.repo_name}</span>
                        {bookmark.language && (
                          <span> • {bookmark.language}</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 hidden sm:block">
                        {formatTimeAgo(bookmark.created_at)}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={bookmark.issue_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
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
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <p className="text-sm text-gray-500">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBookmarks.length)} - {Math.min(currentPage * itemsPerPage, filteredBookmarks.length)} of {filteredBookmarks.length} bookmarks
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#15161E] border border-white/10 text-gray-400 rounded-lg hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-[#15161E] border border-white/10 text-gray-400 rounded-lg hover:text-white hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-3 text-sm font-medium transition-all border-b-2 ${
      active
        ? "border-blue-500 text-blue-400"
        : "border-transparent text-gray-500 hover:text-gray-300"
    }`}
  >
    {label}
  </button>
);

export default BookmarksPage;
