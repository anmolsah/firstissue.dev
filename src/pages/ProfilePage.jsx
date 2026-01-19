import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  User,
  Bookmark,
  Star,
  CheckCircle,
  Compass,
  FileText,
  Plus,
  GitMerge,
  MessageSquare,
  Command,
  Bell,
  Github,
  MapPin,
  Building,
  Link as LinkIcon,
  Calendar,
  Loader2,
  LogOut,
  TrendingUp,
  BookOpen,
} from "lucide-react";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  
  // GitHub Data
  const [githubProfile, setGithubProfile] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [contributionData, setContributionData] = useState([]);
  const [languageStats, setLanguageStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchBookmarks(),
        fetchGitHubProfile(),
        fetchGitHubRepos(),
        fetchGitHubEvents(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id);
    if (!error) setBookmarks(data || []);
  };

  const getGitHubUsername = () => {
    return user?.user_metadata?.user_name || 
           user?.user_metadata?.preferred_username ||
           user?.identities?.[0]?.identity_data?.user_name;
  };

  const fetchGitHubProfile = async () => {
    const username = getGitHubUsername();
    if (!username) return;
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(import.meta.env.VITE_GITHUB_TOKEN && {
            Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGithubProfile(data);
      }
    } catch (error) {
      console.error("Error fetching GitHub profile:", error);
    }
  };

  const fetchGitHubRepos = async () => {
    const username = getGitHubUsername();
    if (!username) return;
    
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            }),
          },
        }
      );
      if (response.ok) {
        const repos = await response.json();
        setGithubRepos(repos);
        
        // Calculate language stats
        const languages = {};
        repos.forEach((repo) => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });
        const sortedLangs = Object.entries(languages)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }));
        setLanguageStats(sortedLangs);
        
        // Generate contribution data from repos (simplified)
        generateContributionData(repos);
      }
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
    }
  };

  const fetchGitHubEvents = async () => {
    const username = getGitHubUsername();
    if (!username) return;
    
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/events?per_page=10`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
            }),
          },
        }
      );
      if (response.ok) {
        const events = await response.json();
        const formatted = events.slice(0, 5).map((event) => ({
          id: event.id,
          type: event.type,
          repo: event.repo?.name || "unknown",
          time: formatTimeAgo(event.created_at),
          payload: event.payload,
        }));
        setRecentActivity(formatted);
      }
    } catch (error) {
      console.error("Error fetching GitHub events:", error);
    }
  };

  const generateContributionData = (repos) => {
    // Generate a mock heatmap based on repo update times
    // In a real app, you'd use the GitHub GraphQL API for actual contribution data
    const weeks = 52;
    const days = 7;
    const data = [];
    
    // Create activity map from repo push dates
    const activityMap = new Map();
    repos.forEach((repo) => {
      if (repo.pushed_at) {
        const date = new Date(repo.pushed_at);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        activityMap.set(key, (activityMap.get(key) || 0) + 1);
      }
    });
    
    const now = new Date();
    for (let w = weeks - 1; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < days; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const count = activityMap.get(key) || 0;
        let level = 0;
        if (count > 0) level = 1;
        if (count > 2) level = 2;
        if (count > 4) level = 3;
        if (count > 6) level = 4;
        // Add some randomness for demo
        if (Math.random() > 0.7) level = Math.min(level + 1, 4);
        week.push(level);
      }
      data.push(week);
    }
    setContributionData(data);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getEventDescription = (event) => {
    switch (event.type) {
      case "PushEvent":
        return `Pushed to ${event.repo}`;
      case "PullRequestEvent":
        return `${event.payload?.action || 'Updated'} PR in ${event.repo}`;
      case "IssuesEvent":
        return `${event.payload?.action || 'Updated'} issue in ${event.repo}`;
      case "CreateEvent":
        return `Created ${event.payload?.ref_type || 'repository'} in ${event.repo}`;
      case "WatchEvent":
        return `Starred ${event.repo}`;
      case "ForkEvent":
        return `Forked ${event.repo}`;
      case "IssueCommentEvent":
        return `Commented on ${event.repo}`;
      default:
        return `Activity in ${event.repo}`;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "PushEvent":
      case "PullRequestEvent":
        return <GitMerge className="w-4 h-4" />;
      case "IssueCommentEvent":
        return <MessageSquare className="w-4 h-4" />;
      case "WatchEvent":
        return <Star className="w-4 h-4" />;
      case "ForkEvent":
      case "CreateEvent":
        return <Plus className="w-4 h-4" />;
      default:
        return <Github className="w-4 h-4" />;
    }
  };

  const stats = {
    issuesSolved: bookmarks.filter((b) => b.status === "done").length,
    bookmarksCount: bookmarks.length,
    publicRepos: githubProfile?.public_repos || 0,
    followers: githubProfile?.followers || 0,
    following: githubProfile?.following || 0,
    totalStars: githubRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20 overflow-y-auto">
        <div className="p-6">
          {/* Profile Card */}
          <div className="bg-[#15161E] rounded-xl p-5 border border-white/5 mb-6">
            <div className="w-16 h-16 rounded-lg overflow-hidden mb-4">
              <img
                src={githubProfile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {githubProfile?.name || user?.user_metadata?.full_name || getGitHubUsername() || "User"}
            </h2>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {githubProfile?.bio || "Open source enthusiast"}
            </p>
            
            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {languageStats.slice(0, 3).map((lang) => (
                <span
                  key={lang.name}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30"
                >
                  {lang.name.toUpperCase()}
                </span>
              ))}
            </div>
            
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm">
              Edit Profile
            </button>
          </div>

          {/* Stats Cards */}
          <div className="space-y-3 mb-6">
            <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Issues Solved</p>
                <p className="text-2xl font-bold text-white">{stats.issuesSolved}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bookmarks</p>
                <p className="text-2xl font-bold text-white">{stats.bookmarksCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="bg-[#15161E] rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Stars Earned</p>
                <p className="text-2xl font-bold text-white">{stats.totalStars}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem icon={Compass} label="Explore" active={activeNav === 'explore'} onClick={() => navigate('/explore')} />
            <NavItem icon={FileText} label="Saved" active={activeNav === 'saved'} onClick={() => navigate('/bookmarks')} />
            <NavItem icon={TrendingUp} label="Status" active={activeNav === 'status'} onClick={() => navigate('/status')} />
            <NavItem icon={BookOpen} label="Docs" active={activeNav === 'docs'} onClick={() => navigate('/getting-started')} />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FirstIssue.dev</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{githubProfile?.name || getGitHubUsername()}</p>
                <p className="text-xs text-gray-500">@{getGitHubUsername()}</p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <img src={githubProfile?.avatar_url || user?.user_metadata?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Developer Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {githubProfile?.name?.split(' ')[0] || getGitHubUsername()}. 
                {githubProfile?.public_repos && ` You have ${githubProfile.public_repos} public repositories.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={githubProfile?.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#15161E] border border-white/10 text-gray-300 rounded-lg hover:text-white hover:border-white/20 transition-colors"
              >
                <Github className="w-4 h-4" />
                View GitHub
              </a>
              <button
                onClick={() => navigate('/explore')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Find Issues
              </button>
            </div>
          </div>

          {/* GitHub Info Card */}
          {githubProfile && (
            <div className="bg-[#15161E] rounded-xl p-6 border border-white/5 mb-8">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                {githubProfile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {githubProfile.location}
                  </div>
                )}
                {githubProfile.company && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {githubProfile.company}
                  </div>
                )}
                {githubProfile.blog && (
                  <a href={githubProfile.blog.startsWith('http') ? githubProfile.blog : `https://${githubProfile.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                    <LinkIcon className="w-4 h-4" />
                    {githubProfile.blog}
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(githubProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                <div>
                  <span className="text-xl font-bold text-white">{stats.publicRepos}</span>
                  <span className="text-sm text-gray-500 ml-2">Repositories</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">{stats.followers}</span>
                  <span className="text-sm text-gray-500 ml-2">Followers</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">{stats.following}</span>
                  <span className="text-sm text-gray-500 ml-2">Following</span>
                </div>
              </div>
            </div>
          )}

          {/* Contribution Heatmap */}
          <div className="bg-[#15161E] rounded-xl p-6 border border-white/5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contribution Activity</h3>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>Less</span>
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 rounded-sm bg-[#1a1b26]" />
                  <div className="w-3 h-3 rounded-sm bg-blue-900/50" />
                  <div className="w-3 h-3 rounded-sm bg-blue-700/70" />
                  <div className="w-3 h-3 rounded-sm bg-blue-500" />
                </div>
                <span>More</span>
              </div>
            </div>
            <ContributionHeatmap data={contributionData} />
            <div className="flex justify-between text-[10px] text-gray-600 mt-4">
              {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Languages */}
            <div className="bg-[#15161E] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6">Top Languages</h3>
              <div className="space-y-4">
                {languageStats.map((lang, index) => (
                  <div key={lang.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-emerald-500' :
                        index === 2 ? 'bg-amber-500' :
                        index === 3 ? 'bg-purple-500' :
                        index === 4 ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-white font-medium">{lang.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-[#222831] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-emerald-500' :
                            index === 2 ? 'bg-amber-500' :
                            index === 3 ? 'bg-purple-500' :
                            index === 4 ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${(lang.count / languageStats[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{lang.count}</span>
                    </div>
                  </div>
                ))}
                {languageStats.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No repositories found</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#15161E] rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      {getEventIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{getEventDescription(activity)}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4" />
            <span>v2.4.0-stable • system status: <span className="text-emerald-400">online</span></span>
          </div>
          <div className="flex items-center gap-6 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-400">DOCUMENTATION</a>
            <a href="#" className="hover:text-gray-400">COMMUNITY</a>
            <a href="#" className="hover:text-gray-400">API</a>
            <a href="#" className="hover:text-gray-400">PRIVACY</a>
          </div>
        </footer>
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

const ContributionHeatmap = ({ data }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 0: return "bg-[#1a1b26]";
      case 1: return "bg-blue-900/40";
      case 2: return "bg-blue-700/60";
      case 3: return "bg-blue-500/80";
      case 4: return "bg-blue-400";
      default: return "bg-[#1a1b26]";
    }
  };

  if (!data || data.length === 0) {
    // Fallback random data
    return (
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {Array.from({ length: 52 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${getLevelColor(Math.floor(Math.random() * 5))}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-2">
      {data.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-[3px]">
          {week.map((level, dayIndex) => (
            <div
              key={dayIndex}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;
