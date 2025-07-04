import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Github, Calendar, Award, Target, TrendingUp, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStats = () => {
    const total = bookmarks.length;
    const done = bookmarks.filter(b => b.status === 'done').length;
    const workingOn = bookmarks.filter(b => b.status === 'working_on').length;
    const applied = bookmarks.filter(b => b.status === 'applied').length;
    
    return { total, done, workingOn, applied };
  };

  const getJoinDate = () => {
    if (!user?.created_at) return 'Unknown';
    const date = new Date(user.created_at);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getLanguageStats = () => {
    const languages = {};
    bookmarks.forEach(bookmark => {
      const lang = bookmark.language || 'unknown';
      languages[lang] = (languages[lang] || 0) + 1;
    });
    
    return Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const languageStats = getLanguageStats();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and view your contribution statistics</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-600 text-sm">Open Source Contributor</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-5 w-5" />
                <span className="text-sm">{user?.email}</span>
              </div>
              
              {user?.user_metadata?.provider === 'github' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Github className="h-5 w-5" />
                  <span className="text-sm">
                    {user?.user_metadata?.user_name || 'GitHub User'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Joined {getJoinDate()}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contribution Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              Contribution Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 mb-1">{stats.total}</div>
                <div className="text-sm text-indigo-700 font-medium">Total Bookmarks</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.done}</div>
                <div className="text-sm text-green-700 font-medium">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.workingOn}</div>
                <div className="text-sm text-yellow-700 font-medium">In Progress</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.applied}</div>
                <div className="text-sm text-blue-700 font-medium">Applied</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-indigo-600">
                  {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full h-2 transition-all duration-500"
                  style={{ 
                    width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Language Stats */}
          {languageStats.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Top Languages
              </h3>
              
              <div className="space-y-3">
                {languageStats.map(([language, count], index) => (
                  <div key={language} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-purple-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="font-medium text-gray-900 capitalize">{language}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-purple-500' :
                            index === 1 ? 'bg-blue-500' :
                            index === 2 ? 'bg-green-500' :
                            index === 3 ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/explore')}
                className="p-4 text-left bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                <h4 className="font-medium text-indigo-900 mb-1">Explore Issues</h4>
                <p className="text-sm text-indigo-700">Find new issues to contribute to</p>
              </button>
              
              <button
                onClick={() => navigate('/bookmarks')}
                className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <h4 className="font-medium text-purple-900 mb-1">View Bookmarks</h4>
                <p className="text-sm text-purple-700">Manage your saved issues</p>
              </button>
              
              <button
                onClick={() => navigate('/status')}
                className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <h4 className="font-medium text-green-900 mb-1">Track Progress</h4>
                <p className="text-sm text-green-700">Monitor your contributions</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;