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
  Search,
  Compass,
  Bookmark,
  User,
  Command,
  Bell,
  Plus,
  Loader2,
  ChevronDown,
} from "lucide-react";

const StatusPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("status");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const statusOptions = [
    { value: "all", label: "All Status", icon: null, color: "text-white", bg: "bg-blue-600" },
    { value: "saved", label: "Saved", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
    { value: "applied", label: "Applied", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/20" },
    { value: "working_on", label: "Working On", icon: PlayCircle, color: "text-purple-400", bg: "bg-purple-500/20" },
    { value: "done", label: "Done", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20" },
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

  // Update status in database
  const updateStatus = async (bookmarkId, newStatus) => {
    setUpdatingStatus(bookmarkId);
    try {
      const { error } = await supabase
        .from("bookmarks")
        .update({ status: newStatus })
        .eq("id", bookmarkId);
      if (error) throw error;
      
      // Update local state
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getFilteredBookmarks = () => {
    let filtered = selectedStatus === "all" ? bookmarks : bookmarks.filter((b) => b.status === selectedStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b) => 
        b.title?.toLowerCase().includes(q) || b.repo_name?.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const getStatusStats = () => {
    const stats = {};
    statusOptions.slice(1).forEach((s) => {
      stats[s.value] = bookmarks.filter((b) => b.status === s.value).length;
    });
    return stats;
  };

  const getProgressPercentage = () =>
    bookmarks.length === 0 ? 0 : Math.round((bookmarks.filter((b) => b.status === "done").length / bookmarks.length) * 100);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getStatusConfig = (status) =>
    statusOptions.find((o) => o.value === status) || statusOptions[1];

  if (loading) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading status...</span>
      </div>
    );
  }

  const stats = getStatusStats();
  const filteredBookmarks = getFilteredBookmarks();
  const progressPercentage = getProgressPercentage();

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
            <NavItem icon={Bookmark} label="Bookmarks" active={activeNav === 'bookmarks'} onClick={() => navigate('/bookmarks')} />
            <NavItem icon={TrendingUp} label="Status" active={activeNav === 'status'} onClick={() => setActiveNav('status')} />
            <NavItem icon={User} label="Profile" active={activeNav === 'profile'} onClick={() => navigate('/profile')} />
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
              placeholder="Search status..."
              className="w-full bg-[#15161E] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <span className="text-sm text-gray-400">{user?.user_metadata?.user_name || user?.email?.split('@')[0] || 'alex_dev'}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'User'}`} alt="Avatar" className="w-full h-full rounded-full bg-[#0B0C10]" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Progress Card */}
          <div className="bg-[#15161E] rounded-xl p-6 border border-white/5 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Progress</h2>
                <p className="text-gray-500">{stats.done || 0} out of {bookmarks.length} issues completed</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-cyan-400">{progressPercentage}%</div>
                <div className="flex items-center justify-end text-gray-500 text-sm gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Complete
                </div>
              </div>
            </div>
            <div className="w-full bg-[#222831] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {statusOptions.slice(1).map(({ value, label, icon: Icon, color }) => {
              const count = stats[value] || 0;
              return (
                <div
                  key={value}
                  className={`bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center gap-4 cursor-pointer hover:border-white/10 transition-colors ${
                    selectedStatus === value ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedStatus(selectedStatus === value ? "all" : value)}
                >
                  <div className={`w-10 h-10 rounded-lg ${
                    value === 'saved' ? 'bg-blue-500/20' :
                    value === 'applied' ? 'bg-amber-500/20' :
                    value === 'working_on' ? 'bg-purple-500/20' :
                    'bg-emerald-500/20'
                  } flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm">{label}</p>
                  </div>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {statusOptions.map(({ value, label, icon: Icon, color }) => {
              const count = value === 'all' ? bookmarks.length : stats[value] || 0;
              const isActive = selectedStatus === value;
              return (
                <button
                  key={value}
                  onClick={() => setSelectedStatus(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-[#15161E] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                  <span className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Issues List */}
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-[#15161E] rounded-xl border border-white/5">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {selectedStatus === "all" ? "No bookmarks yet" : `No ${selectedStatus.replace("_", " ")} issues`}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedStatus === "all"
                  ? "Start by exploring issues and bookmarking the ones you're interested in."
                  : `You don't have any issues with ${selectedStatus.replace("_", " ")} status yet.`}
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Explore Issues
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookmarks.map((bookmark) => {
                const statusConfig = getStatusConfig(bookmark.status);
                const StatusIcon = statusConfig.icon || Clock;
                return (
                  <div
                    key={bookmark.id}
                    className="bg-[#15161E] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                            {bookmark.repo_name}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-[#222831] text-gray-400 rounded border border-white/5">
                            {bookmark.language || "UNKNOWN"}
                          </span>
                          <div className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                        </div>
                        <h3 className="text-white font-medium mb-1 line-clamp-1">{bookmark.title}</h3>
                        <p className="text-xs text-gray-500">Bookmarked on {formatDate(bookmark.created_at)}</p>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={bookmark.status || "saved"}
                            onChange={(e) => updateStatus(bookmark.id, e.target.value)}
                            disabled={updatingStatus === bookmark.id}
                            className="appearance-none bg-[#222831] border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
                          >
                            {statusOptions.slice(1).map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        {/* External Link */}
                        <a
                          href={bookmark.issue_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
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

export default StatusPage;
