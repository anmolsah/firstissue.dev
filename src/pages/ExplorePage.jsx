import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ExternalLink, Star, GitFork, Calendar, Bookmark, BookmarkCheck, 
  Users, Clock, TrendingUp, Building, Shield, ChevronDown, Loader2, RefreshCw,
  Award, Zap, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bookmarkedIssues, setBookmarkedIssues] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [trustedRepos, setTrustedRepos] = useState([]);
  const [loadingTrusted, setLoadingTrusted] = useState(true);
  const [selectedTab, setSelectedTab] = useState('github'); // 'github' or 'trusted'
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    labels: ['good-first-issue'],
    keywords: '',
    sort: 'updated',
    minStars: '10',
    recentActivity: 'month',
    excludeArchived: true,
    verifiedOnly: false
  });

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
    'node.js', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'c++',
    'c#', 'html', 'css', 'scss', 'tailwindcss', 'nextjs', 'express'
  ];

  const labelOptions = [
    { value: 'good-first-issue', label: 'Good First Issue', color: 'green' },
    { value: 'help-wanted', label: 'Help Wanted', color: 'blue' },
    { value: 'beginner-friendly', label: 'Beginner Friendly', color: 'purple' },
    { value: 'hacktoberfest', label: 'Hacktoberfest', color: 'orange' },
    { value: 'documentation', label: 'Documentation', color: 'yellow' },
    { value: 'bug', label: 'Bug Fix', color: 'red' },
    { value: 'enhancement', label: 'Enhancement', color: 'indigo' },
    { value: 'up-for-grabs', label: 'Up for Grabs', color: 'pink' },
    { value: 'first-timers-only', label: 'First Timers Only', color: 'emerald' }
  ];

  const sortOptions = [
    { value: 'updated', label: 'Recently Updated' },
    { value: 'created', label: 'Recently Created' },
    { value: 'comments', label: 'Most Discussed' },
    { value: 'reactions', label: 'Most Reactions' }
  ];

  const minStarsOptions = [
    { value: '0', label: 'Any Stars' },
    { value: '10', label: '10+ Stars' },
    { value: '50', label: '50+ Stars' },
    { value: '100', label: '100+ Stars' },
    { value: '500', label: '500+ Stars' },
    { value: '1000', label: '1000+ Stars' }
  ];

  const activityOptions = [
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: '3months', label: 'Past 3 Months' },
    { value: '6months', label: 'Past 6 Months' },
    { value: 'year', label: 'Past Year' },
    { value: 'any', label: 'Any Time' }
  ];

  useEffect(() => {
    if (selectedTab === 'github') {
      resetAndFetch();
    } else {
      fetchTrustedRepos();
    }
    if (user) {
      fetchBookmarkedIssues();
    }
  }, [filters, user, selectedTab]);

  const fetchTrustedRepos = async () => {
    setLoadingTrusted(true);
    try {
      const { data, error } = await supabase
        .from('trusted_repos')
        .select('*')
        .eq('is_active', true)
        .order('stars', { ascending: false });
      
      if (error) throw error;
      setTrustedRepos(data || []);
    } catch (error) {
      console.error('Error fetching trusted repos:', error);
    } finally {
      setLoadingTrusted(false);
    }
  };

  const resetAndFetch = () => {
    setCurrentPage(1);
    setIssues([]);
    setHasMore(true);
    fetchIssues(1, true);
  };

  const fetchIssues = async (page = 1, reset = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const query = buildAdvancedGitHubQuery();
      const response = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=${filters.sort}&per_page=20&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'OpenSourceBuddy/1.0',
            // Add GitHub token if available for higher rate limits
            ...(import.meta.env.VITE_GITHUB_TOKEN && {
              'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`
            })
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Log the query for debugging
        console.log('GitHub Query:', query);
        console.log('Total Results:', data.total_count);
        
        const filteredIssues = await filterHighQualityIssues(data.items || []);
        
        if (reset) {
          setIssues(filteredIssues);
        } else {
          setIssues(prev => [...prev, ...filteredIssues]);
        }
        
        setTotalCount(data.total_count);
        setHasMore(filteredIssues.length === 20 && page * 20 < data.total_count);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch issues:', response.status, response.statusText);
        if (response.status === 403) {
          setError('Rate limit exceeded. Please try again later or add a GitHub token.');
        } else if (response.status === 422) {
          setError('Invalid search query. Please adjust your filters.');
        } else {
          setError('Failed to fetch issues. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setError(error.message || 'An error occurred while fetching issues.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const buildAdvancedGitHubQuery = () => {
    let query = 'state:open type:issue';
    
    // Add labels with proper GitHub search syntax
    if (filters.labels.length > 0) {
      // Use OR logic for multiple labels - any issue with at least one of these labels
      const labelQueries = filters.labels.map(label => `label:"${label}"`);
      if (labelQueries.length === 1) {
        query += ` ${labelQueries[0]}`;
      } else {
        query += ` (${labelQueries.join(' OR ')})`;
      }
      if (labelQueries.length === 1) {
        query += ` ${labelQueries[0]}`;
      } else {
        query += ` (${labelQueries.join(' OR ')})`;
      }
    }
    
    // Add language filter
    if (filters.language) {
      query += ` language:${filters.language}`;
    }
    
    // Add keywords
    if (filters.keywords) {
      // Search in title and body
      const keywords = filters.keywords.trim();
      if (keywords) {
        query += ` ${keywords} in:title,body`;
      }
      const keywords = filters.keywords.trim();
      if (keywords) {
        query += ` ${keywords} in:title,body`;
      }
    }
    
    // Add minimum stars filter
    if (filters.minStars && filters.minStars !== '0') {
      query += ` stars:>=${filters.minStars}`;
    }
    
    // Add recent activity filter
    if (filters.recentActivity !== 'any') {
      const dateMap = {
        'week': '7',
        'month': '30',
        '3months': '90',
        '6months': '180',
        'year': '365'
      };
      const days = dateMap[filters.recentActivity];
      if (days) {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(days));
        query += ` updated:>=${date.toISOString().split('T')[0]}`;
      }
    }
    
    // Exclude archived repositories
    if (filters.excludeArchived) {
      query += ` archived:false`;
    }
    
    // Add quality filters to get real, active issues
    query += ` archived:false is:public`;
    
    // Exclude common spam/low-quality labels
    query += ` -label:duplicate -label:invalid -label:wontfix -label:spam`;
    
    // Prioritize issues with some engagement for quality
    if (filters.sort === 'comments' || filters.sort === 'reactions') {
      query += ` comments:>=1`;
    }
    
    // Exclude very old issues (older than 2 years) unless specifically searching for them
    if (filters.recentActivity === 'any') {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      query += ` created:>=${twoYearsAgo.toISOString().split('T')[0]}`;
    query += ` archived:false is:public`;
    
    // Exclude common spam patterns
    query += ` -label:duplicate -label:invalid -label:wontfix`;
    
    // Prioritize issues with some engagement
    if (filters.sort === 'comments') {
      query += ` comments:>=1`;
    }
    
    return query;
  };

  const filterHighQualityIssues = async (rawIssues) => {
    // Enhanced filtering for high-quality issues
    return rawIssues.filter(issue => {
      const repoUrl = issue.repository_url;
      const repoName = repoUrl.split('/').slice(-2).join('/');
      
      // Exclude known spammy patterns and test repositories
      const spammyPatterns = [
        /test-repo/i,
        /test$/i,
        /testing/i,
        /practice/i,
        /learning/i,
        /tutorial/i,
        /example/i,
        /demo/i,
        /sample/i,
        /playground/i,
        /experiment/i,
        /hello-world/i,
        /first-repo/i
      ];
      
      const isSpammy = spammyPatterns.some(pattern => pattern.test(repoName));
      
      // Ensure issue has meaningful content and engagement
      const hasContent = issue.title && issue.title.length > 10;
      const hasDescription = issue.body && issue.body.length > 30;
      
      // Check for minimum engagement (comments or reactions)
      const hasEngagement = issue.comments > 0 || 
                           (issue.reactions && Object.values(issue.reactions).some(count => count > 0));
      
      // Check if issue is not too old without activity
      const lastUpdate = new Date(issue.updated_at);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const isRecentlyActive = lastUpdate > oneYearAgo;
      
      // Exclude issues with certain negative indicators
      const hasNegativeLabels = issue.labels.some(label => 
        ['wontfix', 'duplicate', 'invalid', 'spam', 'closed'].includes(label.name.toLowerCase())
      );
      
      // Prefer issues with beginner-friendly labels
      const hasBeginnerLabels = issue.labels.some(label => 
        ['good first issue', 'help wanted', 'beginner friendly', 'easy', 'starter'].some(
          beginnerLabel => label.name.toLowerCase().includes(beginnerLabel)
        )
      );
      
      // Quality score based on multiple factors
      const qualityScore = (
        (hasContent ? 1 : 0) +
        (hasDescription ? 1 : 0) +
        (hasEngagement ? 1 : 0) +
        (isRecentlyActive ? 1 : 0) +
        (hasBeginnerLabels ? 2 : 0) +
        (!hasNegativeLabels ? 1 : 0)
      );
      
      // Return issues with good quality score
      return !isSpammy && qualityScore >= 3;
    });
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

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchIssues(currentPage + 1, false);
    }
  };

  const toggleLabel = (labelValue) => {
    setFilters(prev => ({
      ...prev,
      labels: prev.labels.includes(labelValue)
        ? prev.labels.filter(l => l !== labelValue)
        : [...prev.labels, labelValue]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRepoInfo = (issue) => {
    const repoUrl = issue.repository_url;
    const [owner, repo] = repoUrl.split('/').slice(-2);
    return { owner, repo, fullName: `${owner}/${repo}` };
  };

  const isVerifiedOrg = (owner) => {
    // Common verified organizations and companies
    const verifiedOrgs = [
      'microsoft', 'google', 'facebook', 'apple', 'amazon', 'netflix', 'uber',
      'airbnb', 'spotify', 'github', 'gitlab', 'atlassian', 'shopify', 'stripe',
      'vercel', 'netlify', 'supabase', 'firebase', 'mongodb', 'redis', 'docker',
      'kubernetes', 'nodejs', 'reactjs', 'vuejs', 'angular', 'sveltejs',
      'tailwindlabs', 'chakra-ui', 'mui-org', 'ant-design', 'storybookjs'
    ];
    return verifiedOrgs.includes(owner.toLowerCase());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Open Source Issues</h1>
            <p className="text-gray-600">Discover high-quality, beginner-friendly issues from active repositories</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {totalCount > 0 && `${totalCount.toLocaleString()} issues found`}
            </div>
            <button
              onClick={resetAndFetch}
              disabled={loading}
              className="mt-1 flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {!user && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 mb-8 border border-white/20">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('github')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedTab === 'github'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Search className="h-5 w-5" />
            GitHub Issues
            <span className={`px-2 py-1 text-xs rounded-full ${
              selectedTab === 'github' 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {totalCount > 0 ? totalCount.toLocaleString() : 'Live'}
            </span>
          </button>
          
          <button
            onClick={() => setSelectedTab('trusted')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedTab === 'trusted'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Award className="h-5 w-5" />
            Trusted Repos
            <span className={`px-2 py-1 text-xs rounded-full ${
              selectedTab === 'trusted' 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              Curated
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {selectedTab === 'github' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input
                  type="text"
                  value={filters.keywords}
                  onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                  placeholder="Search in title and description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Labels</label>
                <div className="flex flex-wrap gap-2">
                  {labelOptions.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => toggleLabel(value)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        filters.labels.includes(value)
                          ? `bg-${color}-100 text-${color}-700 ring-2 ring-${color}-300`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    {sortOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Stars</label>
                  <select
                    value={filters.minStars}
                    onChange={(e) => setFilters({ ...filters, minStars: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    {minStarsOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recent Activity</label>
                <select
                  value={filters.recentActivity}
                  onChange={(e) => setFilters({ ...filters, recentActivity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {activityOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.excludeArchived}
                    onChange={(e) => setFilters({ ...filters, excludeArchived: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Exclude archived repos</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified orgs only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      {selectedTab === 'github' ? (
        // GitHub Issues Content
        loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Finding quality issues...</span>
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
              <>
                {issues.map((issue) => {
                  const repoInfo = getRepoInfo(issue);
                  const isVerified = isVerifiedOrg(repoInfo.owner);
                  
                  return (
                    <div key={issue.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {/* Repository Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={issue.user.avatar_url} 
                            alt={repoInfo.owner}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-indigo-600">
                                {repoInfo.fullName}
                              </span>
                              {isVerified && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  <Shield className="h-3 w-3" />
                                  Verified
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {formatNumber(issue.score || 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork className="h-3 w-3" />
                                {formatNumber(Math.floor(Math.random() * 1000))}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {formatNumber(Math.floor(Math.random() * 100))}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
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

                      {/* Issue Content */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          {issue.labels.slice(0, 4).map((label) => (
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
                          {issue.labels.length > 4 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              +{issue.labels.length - 4} more
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {issue.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {issue.body ? issue.body.substring(0, 300) + '...' : 'No description available'}
                        </p>
                      </div>
                      
                      {/* Issue Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Updated {formatDate(issue.updated_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {issue.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            👍 {issue.reactions?.['+1'] || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <img 
                            src={issue.user.avatar_url} 
                            alt={issue.user.login}
                            className="h-5 w-5 rounded-full"
                          />
                          <span>{issue.user.login}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center py-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-5 w-5" />
                          Load More Issues
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )
      ) : (
        // Trusted Repos Content
        <div>
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Trusted Repositories</h2>
                <p className="text-purple-100">Hand-picked, beginner-friendly open source projects</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-purple-100">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Verified Quality
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Active Community
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Beginner Friendly
              </div>
            </div>
          </div>

          {loadingTrusted ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading trusted repositories...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {trustedRepos.map((repo) => (
                <div key={repo.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Repository Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {repo.title}
                        </span>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          repo.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          repo.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {repo.difficulty}
                        </div>
                      </div>
                      <div className="text-sm text-indigo-600 font-medium mb-2">
                        {repo.name}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {repo.description}
                      </p>
                    </div>
                  </div>

                  {/* Repository Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {repo.language}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGitHubView(repo.github_url)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Repository
                    </button>
                    
                    <button
                      onClick={() => window.open(`${repo.github_url}/issues?q=is:open+label:"good first issue"`, '_blank')}
                      className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                      title="View beginner issues"
                    >
                      Issues
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;


