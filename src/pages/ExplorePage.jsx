import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Compass,
  Bookmark,
  BookmarkCheck,
  Bell,
  Star,
  ChevronDown,
  Command,
  Loader2,
  ExternalLink,
  TrendingUp,
  User,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(now - date) / 36e5;
  if (diffHours < 24) return `${Math.ceil(diffHours)}h ago`;
  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays}d ago`;
};

const ExplorePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookmarkedIssues, setBookmarkedIssues] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all");
  
  // Sidebar State
  const [activeSidebarItem, setActiveSidebarItem] = useState("explore");

  // Filters State
  const [filters, setFilters] = useState({
    language: "",
    labels: ["good first issue"],
    keywords: "",
    sort: "updated",
    minStars: "10",
  });

  const languages = [
    { name: "TypeScript", color: "blue" },
    { name: "JavaScript", color: "yellow" },
    { name: "Python", color: "blue" },
    { name: "Go", color: "cyan" },
    { name: "Rust", color: "orange" },
    { name: "Java", color: "red" },
    { name: "C++", color: "blue" },
    { name: "C#", color: "purple" },
    { name: "PHP", color: "indigo" },
    { name: "Swift", color: "orange" },
    { name: "Ruby", color: "red" },
    { name: "Kotlin", color: "purple" },
    { name: "Dart", color: "blue" },
  ];

  const labelOptions = [
    { id: "good first issue", label: "Good First Issue", color: "emerald" },
    { id: "help wanted", label: "Help Wanted", color: "blue" },
    { id: "beginner friendly", label: "Beginner Friendly", color: "purple" },
    { id: "hacktoberfest", label: "Hacktoberfest", color: "orange" },
    { id: "documentation", label: "Documentation", color: "yellow" },
    { id: "bug", label: "Bug Fix", color: "red" },
  ];

  /* --- Fetch Logic --- */
  useEffect(() => {
    resetAndFetch();
    if (user) fetchBookmarkedIssues();
  }, [filters, selectedTab, user]);

  const resetAndFetch = () => {
    setCurrentPage(1);
    setIssues([]);
    setHasMore(true);
    fetchIssues(1, true);
  };

  const fetchIssues = async (page = 1, reset = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const query = buildQuery();
      const response = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(
          query
        )}&sort=${filters.sort}&per_page=12&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "OpenSourceBuddy/1.0",
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            }),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const filteredIssues = data.items || [];
        
        if (reset) setIssues(filteredIssues);
        else setIssues((prev) => [...prev, ...filteredIssues]);
        
        setTotalCount(data.total_count);
        setHasMore(filteredIssues.length === 12 && page * 12 < data.total_count);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const buildQuery = () => {
    let query = "state:open type:issue is:public -label:duplicate -label:invalid -label:wontfix";
    
    if (filters.labels.length > 0) {
      filters.labels.forEach(label => query += ` label:"${label}"`);
    }
    if (filters.language) query += ` language:${filters.language}`;
    if (filters.keywords) query += ` ${filters.keywords}`;
    if (filters.minStars && filters.minStars !== "0") query += ` stars:>=${filters.minStars}`;

    return query;
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchIssues(currentPage + 1, false);
  };

  /* --- Bookmark Logic (from previous code) --- */
  const fetchBookmarkedIssues = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("issue_url")
        .eq("user_id", user.id);
      if (error) throw error;
      setBookmarkedIssues(new Set(data.map((b) => b.issue_url)));
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleBookmark = async (issue) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isBookmarked = bookmarkedIssues.has(issue.html_url);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("issue_url", issue.html_url);
        if (error) throw error;
        setBookmarkedIssues((prev) => {
          const newSet = new Set(prev);
          newSet.delete(issue.html_url);
          return newSet;
        });
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          title: issue.title,
          issue_url: issue.html_url,
          repo_name: issue.repository_url.split("/").slice(-2).join("/"),
          language: filters.language || "unknown",
          status: "saved",
        });
        if (error) throw error;
        setBookmarkedIssues((prev) => new Set([...prev, issue.html_url]));
      }
    } catch (error) {
      console.error("Error managing bookmark:", error);
    }
  };

  /* --- Render --- */
  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      
      {/* Sidebar - Fixed Width with Scrolling */}
      <aside className="w-64 border-r border-white/5 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20 overflow-y-auto">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 text-white mb-10 hover:opacity-80 transition-opacity">
            {/* <div className="bg-blue-600 p-2 rounded-lg">
               <Command className="w-5 h-5" />
            </div> */}
            <span className="font-bold text-lg tracking-tight">FirstIssue.dev</span>
          </Link>

          <nav className="space-y-1">
            <NavItem 
              icon={Compass} 
              label="Explore Issues" 
              active={activeSidebarItem === 'explore'} 
              onClick={() => setActiveSidebarItem('explore')} 
            />
            <NavItem 
              icon={Bookmark} 
              label="Saved" 
              active={activeSidebarItem === 'saved'} 
              onClick={() => navigate('/bookmarks')} 
            />
            <NavItem 
              icon={TrendingUp} 
              label="Status" 
              active={activeSidebarItem === 'status'} 
              onClick={() => navigate('/status')} 
            />
            <NavItem 
              icon={User} 
              label="Profile" 
              active={activeSidebarItem === 'profile'} 
              onClick={() => navigate('/profile')} 
            />
          </nav>
        </div>

        <div className="px-6 py-4 mt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Languages</p>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button
                key={lang.name}
                onClick={() => setFilters(prev => ({...prev, language: prev.language === lang.name.toLowerCase() ? "" : lang.name.toLowerCase()}))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filters.language === lang.name.toLowerCase() 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-transparent border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full bg-${lang.color}-500`} />
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Labels</p>
          <div className="space-y-2">
             {labelOptions.map(opt => (
               <label key={opt.id} className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  <div className={`w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center ${filters.labels.includes(opt.id) ? "border-blue-500" : ""}`}>
                      {filters.labels.includes(opt.id) && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={filters.labels.includes(opt.id)}
                    onChange={() => {
                        setFilters(prev => ({
                          ...prev, 
                          labels: prev.labels.includes(opt.id) 
                            ? prev.labels.filter(l => l !== opt.id) 
                            : [...prev.labels, opt.id]
                        }))
                    }}
                  />
                  {opt.label}
               </label>
             ))}
          </div>
        </div>
        
        {/* Project Stars Slider Mockup */}
         <div className="px-6 py-4 mt-auto mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Project Stars</p>
            <input type="range" min="0" max="10000" className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-[10px] text-gray-500 mt-2">
               <span>0</span>
               <span>100k+</span>
            </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex flex-1 items-center max-w-xl relative">
             <Search className="absolute left-3 w-4 h-4 text-gray-500" />
             <input 
               type="text" 
               placeholder="Search repositories, issues or topics..." 
               className="w-full bg-[#15161E] border border-white/5 rounded-lg py-2 pl-10 pr-12 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
               value={filters.keywords}
               onChange={(e) => setFilters(prev => ({...prev, keywords: e.target.value}))}
             />
             <div className="absolute right-3 flex items-center gap-1 border border-white/10 rounded px-1.5 py-0.5">
                <Command className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] text-gray-500">K</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <button className="text-gray-400 hover:text-white transition-colors relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0C10]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user ? (user.user_metadata?.full_name || "User") : "Guest"}</p>
                  <p className="text-xs text-gray-500">Lvl 4 Contributor</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                  <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'Guest'}`} alt="Avatar" className="w-full h-full rounded-full bg-[#0B0C10]" />
               </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
           <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Explore Issues</h1>
              <p className="text-gray-400">Curated open-source opportunities tailored to your skills.</p>
           </div>
           
           {/* Filters Bar Row */}
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="bg-[#15161E] p-1 rounded-lg inline-flex border border-white/5">
                 <TabButton label="All Issues" active={selectedTab === 'all'} onClick={() => setSelectedTab('all')} />
                 <TabButton label="Trending" active={selectedTab === 'trending'} onClick={() => setSelectedTab('trending')} />
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setFilters(prev => ({...prev, sort: prev.sort === 'updated' ? 'created' : 'updated'}))}
                  className="flex items-center gap-2 px-3 py-2 bg-[#15161E] border border-white/5 rounded-lg text-sm text-gray-300 hover:text-white hover:border-white/10 transition-colors"
                 > 
                   {filters.sort === 'updated' ? 'Recently Updated' : 'Recently Created'} <ChevronDown className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Issues Grid */}
           {loading && issues.length === 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <IssueSkeleton key={i} />)}
             </div>
           ) : (
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {issues.map(issue => (
                   <IssueCard 
                     key={issue.id} 
                     issue={issue} 
                     isBookmarked={bookmarkedIssues.has(issue.html_url)}
                     onToggleBookmark={() => handleBookmark(issue)}
                   />
                 ))}
               </div>
               
               {issues.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No issues found</h3>
                        <p className="text-gray-500">Try adjusting your filters to find more results.</p>
                        <button onClick={resetAndFetch} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">Clear Filters</button>
                    </div>
               )}

               {hasMore && issues.length > 0 && (
                   <div className="flex justify-center mt-12 pb-12">
                      <button 
                        onClick={loadMore} 
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-6 py-3 bg-[#15161E] border border-white/10 text-white rounded-full hover:bg-white/5 transition-all disabled:opacity-50"
                      >
                         {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                         {loadingMore ? "Loading..." : "Load More Issues"}
                      </button>
                   </div>
               )}
             </>
           )}
           
           <div className="fixed bottom-6 right-6 flex gap-2">
              <div className="bg-[#15161E] border border-white/10 rounded-full px-4 py-2 text-xs font-mono text-gray-500 flex items-center gap-2">
                  <span className="font-bold text-gray-400">QUICK MENU</span>
                  <kbd className="bg-white/10 px-1.5 rounded text-gray-300">⌘</kbd>
                  <kbd className="bg-white/10 px-1.5 rounded text-gray-300">K</kbd>
              </div>
              <button onClick={() => navigate('/submit')} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2 font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">+</div>
                  Submit Issue
              </button>
           </div>
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
      ? "bg-blue-600/10 text-blue-500" 
      : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-blue-500" : "text-gray-500 group-hover:text-white"}`} />
    {label}
  </button>
);

const TabButton = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            active 
            ? "bg-[#222831] text-white shadow-sm" 
            : "text-gray-400 hover:text-gray-200"
        }`}
    >
        {label}
    </button>
);

const IssueCard = ({ issue, isBookmarked, onToggleBookmark }) => {
    const repoName = issue.repository_url.split('/').slice(-2).join('/');
    const timeAgo = formatTimeAgo(issue.created_at);
    
    return (
        <div className="bg-[#15161E] border border-white/5 rounded-xl p-6 hover:border-gray-500/30 transition-all duration-300 group flex flex-col h-full relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#222831] flex items-center justify-center border border-white/5">
                         <img src={issue.user.avatar_url} alt="Repo" className="w-6 h-6 rounded-sm opacity-80" />
                    </div>
                    <div>
                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-400 font-mono transition-colors">
                            {repoName}
                        </a>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                            <Star className="w-3 h-3 text-gray-600" />
                            <span>{issue.score ? Math.floor(issue.score) : '—'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="text-[10px] text-gray-500">{timeAgo}</div>
                   <button 
                      onClick={(e) => {
                        e.preventDefault();
                        onToggleBookmark();
                      }}
                      className={`p-1.5 rounded-full transition-all ${isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-transparent text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}
                   >
                      {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                   </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-100 mb-3 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
               <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                {issue.title}
               </a>
            </h3>

            <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-1">
                {issue.body ? issue.body.substring(0, 150) + "..." : "No description provided."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                    {issue.labels.slice(0, 2).map((label) => (
                      <Badge key={label.id} label={label.name.toUpperCase()} color={label.color} />
                    ))}
                </div>
                <a 
                  href={issue.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};

const Badge = ({ label, color }) => {
    return (
        <span 
          className="text-[10px] font-bold px-2 py-1 rounded border"
          style={{
            backgroundColor: color ? `#${color}20` : 'rgba(107, 114, 128, 0.1)',
            color: color ? `#${color}` : '#9ca3af',
            borderColor: color ? `#${color}30` : 'rgba(107, 114, 128, 0.2)',
          }}
        >
            {label.length > 15 ? label.substring(0, 15) + '...' : label}
        </span>
    );
};

const IssueSkeleton = () => (
    <div className="bg-[#15161E] border border-white/5 rounded-xl p-6 h-[300px] animate-pulse">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-white/5" />
            <div className="space-y-2">
                <div className="w-24 h-3 bg-white/5 rounded" />
                <div className="w-12 h-2 bg-white/5 rounded" />
            </div>
        </div>
        <div className="w-full h-6 bg-white/5 rounded mb-4" />
        <div className="w-2/3 h-6 bg-white/5 rounded mb-8" />
        <div className="space-y-2">
            <div className="w-full h-3 bg-white/5 rounded" />
            <div className="w-full h-3 bg-white/5 rounded" />
            <div className="w-3/4 h-3 bg-white/5 rounded" />
        </div>
    </div>
);

// Helper for 'RefreshCw' used in Load More
const RefreshCw = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </svg>
);

export default ExplorePage;
