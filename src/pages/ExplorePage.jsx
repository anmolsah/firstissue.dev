import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ExternalLink, Star, GitFork, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedIssues, setBookmarkedIssues] = useState(new Set());
  const [filters, setFilters] = useState({
    language: '',
    label: 'good first issue',
    keywords: '',
    sort: 'updated'
  });

  const languages = [
    'javascript', 'python', 'java', 'typescript', 'react', 'vue', 'angular',
    'node.js', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'c++'
  ];

  const labels = [
    'good first issue', 'help wanted', 'beginner friendly', 'hacktoberfest',
    'documentation', 'bug', 'enhancement', 'up for grabs', 'gsoc', 'easy'
  ];

  useEffect(() => {
    fetchIssues();
    if (user) {
      fetchBookmarkedIssues();
    }
  }, [filters, user]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const query = buildGitHubQuery();
      const response = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=${filters.sort}&per_page=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        setIssues(data.items || []);
      } else {
        console.error('Failed to fetch issues');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkedIssues = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('issue_url')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const bookmarkedUrls = new Set(data.map(bookmark => bookmark.issue_url));
      setBookmarkedIssues(bookmarkedUrls);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const buildGitHubQuery = () => {
    let query = 'state:open type:issue';
    
    if (filters.label) {
      query += ` label:"${filters.label}"`;
    }
    
    if (filters.language) {
      query += ` language:${filters.language}`;
    }
    
    if (filters.keywords) {
      query += ` ${filters.keywords}`;
    }
    
    return query;
  };

  const handleGitHubView = (url) => {
    if (!user) {
      navigate('/login');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBookmark = async (issue) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isBookmarked = bookmarkedIssues.has(issue.html_url);
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_url', issue.html_url);
        
        if (error) throw error;
        
        setBookmarkedIssues(prev => {
          const newSet = new Set(prev);
          newSet.delete(issue.html_url);
          return newSet;
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            title: issue.title,
            issue_url: issue.html_url,
            repo_name: issue.repository_url.split('/').slice(-2).join('/'),
            language: filters.language || 'unknown',
            status: 'saved'
          });
        
        if (error) throw error;
        
        setBookmarkedIssues(prev => new Set([...prev, issue.html_url]));
      }
    } catch (error) {
      console.error('Error managing bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Open Source Issues</h1>
        <p className="text-gray-600">Discover beginner-friendly issues to start your contribution journey</p>
        {!user && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Please{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                sign in
              </button>{' '}
              to bookmark issues and view them on GitHub.
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
            <select
              value={filters.label}
              onChange={(e) => setFilters({ ...filters, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {labels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              placeholder="Search keywords..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="comments">Most Commented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading issues...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {issues.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">Try adjusting your filters to find more issues.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-indigo-600">
                        {issue.repository_url.split('/').slice(-2).join('/')}
                      </span>
                      {issue.labels.map((label) => (
                        <span
                          key={label.id}
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            color: `#${label.color}`
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {issue.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {issue.body ? issue.body.substring(0, 200) + '...' : 'No description available'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleBookmark(issue)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        user && bookmarkedIssues.has(issue.html_url)
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                      }`}
                      title={user ? (bookmarkedIssues.has(issue.html_url) ? 'Remove bookmark' : 'Bookmark issue') : 'Sign in to bookmark'}
                    >
                      {user && bookmarkedIssues.has(issue.html_url) ? 
                        <BookmarkCheck className="h-5 w-5" /> : 
                        <Bookmark className="h-5 w-5" />
                      }
                    </button>
                    
                    <button
                      onClick={() => handleGitHubView(issue.html_url)}
                      className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                      title={user ? "View on GitHub" : "Sign in to view on GitHub"}
                    >
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(issue.updated_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {issue.comments}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img 
                      src={issue.user.avatar_url} 
                      alt={issue.user.login}
                      className="h-6 w-6 rounded-full"
                    />
                    <span>{issue.user.login}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;