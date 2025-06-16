import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, PlayCircle, AlertCircle, ExternalLink, TrendingUp } from 'lucide-react';

const StatusPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: null, color: 'gray' },
    { value: 'saved', label: 'Saved', icon: Clock, color: 'gray' },
    { value: 'applied', label: 'Applied', icon: AlertCircle, color: 'blue' },
    { value: 'working_on', label: 'Working On', icon: PlayCircle, color: 'yellow' },
    { value: 'done', label: 'Done', icon: CheckCircle, color: 'green' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookmarks = () => {
    if (selectedStatus === 'all') return bookmarks;
    return bookmarks.filter(bookmark => bookmark.status === selectedStatus);
  };

  const getStatusStats = () => {
    const stats = {};
    statusOptions.slice(1).forEach(status => {
      stats[status.value] = bookmarks.filter(b => b.status === status.value).length;
    });
    return stats;
  };

  const getProgressPercentage = () => {
    if (bookmarks.length === 0) return 0;
    const doneCount = bookmarks.filter(b => b.status === 'done').length;
    return Math.round((doneCount / bookmarks.length) * 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusConfig = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[1];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading status...</span>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();
  const filteredBookmarks = getFilteredBookmarks();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracker</h1>
        <p className="text-gray-600">Monitor your open source contribution journey</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
            <p className="text-indigo-100">
              {stats.done} out of {bookmarks.length} issues completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{progressPercentage}%</div>
            <div className="flex items-center text-indigo-100">
              <TrendingUp className="h-4 w-4 mr-1" />
              Complete
            </div>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusOptions.slice(1).map(({ value, label, icon: Icon, color }) => {
          const count = stats[value];
          const colorClasses = {
            gray: 'bg-gray-100 text-gray-700 border-gray-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            green: 'bg-green-100 text-green-700 border-green-200'
          };
          
          return (
            <div 
              key={value} 
              className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${colorClasses[color]} ${
                selectedStatus === value ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => setSelectedStatus(selectedStatus === value ? 'all' : value)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-6 w-6" />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-sm font-medium">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 mb-8 border border-white/20">
        <div className="flex flex-wrap gap-1">
          {statusOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedStatus === value
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
              {value !== 'all' && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedStatus === value 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stats[value] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedStatus === 'all' ? 'No bookmarks yet' : `No ${selectedStatus.replace('_', ' ')} issues`}
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus === 'all' 
              ? 'Start by exploring issues and bookmarking the ones you\'re interested in.' 
              : `You don't have any issues with ${selectedStatus.replace('_', ' ')} status yet.`
            }
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            Explore Issues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => {
            const statusConfig = getStatusConfig(bookmark.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={bookmark.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-indigo-600">
                        {bookmark.repo_name}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {bookmark.language}
                      </span>
                      <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-700' :
                        statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {bookmark.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Bookmarked on {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                  
                  <a
                    href={bookmark.issue_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors ml-4"
                    title="View on GitHub"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusPage;