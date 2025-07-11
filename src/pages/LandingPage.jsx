import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, Github, Search, Bookmark, BarChart3, Users, Star, GitPullRequest, Target } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    activeUsers: 0,
    completedContributions: 0,
    popularLanguages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total bookmarks
      const { count: totalBookmarks } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true });

      // Fetch total manual contributions
      const { count: totalManualContributions } = await supabase
        .from('manual_contributions')
        .select('*', { count: 'exact', head: true });

      // Fetch unique users (active contributors)
      const [bookmarkUsersResult, manualUsersResult] = await Promise.all([
        supabase
          .from('bookmarks')
          .select('user_id'),
        supabase
          .from('manual_contributions')
          .select('user_id')
      ]);
      
      // Combine unique users from both tables
      const allUsers = new Set([
        ...(bookmarkUsersResult.data?.map(u => u.user_id) || []),
        ...(manualUsersResult.data?.map(u => u.user_id) || [])
      ]);
      const activeUsers = allUsers.size;

      // Fetch completed contributions from bookmarks
      const { count: completedBookmarks } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done');

      // Fetch completed manual contributions
      const { count: completedManualContributions } = await supabase
        .from('manual_contributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const totalCompletedContributions = (completedBookmarks || 0) + (completedManualContributions || 0);

      // Fetch unique languages
      const [bookmarkLanguagesResult, manualReposResult] = await Promise.all([
        supabase
          .from('bookmarks')
          .select('language'),
        supabase
          .from('manual_contributions')
          .select('repository_name')
      ]);
      
      // Extract languages from bookmarks
      const bookmarkLanguages = new Set(bookmarkLanguagesResult.data?.map(l => l.language) || []);
      
      // Extract unique repositories from manual contributions
      const manualRepos = new Set(manualReposResult.data?.map(r => r.repository_name) || []);
      
      // Combine for total coverage (languages + unique repos)
      const totalCoverage = bookmarkLanguages.size + manualRepos.size;

      setStats({
        totalBookmarks: (totalBookmarks || 0) + (totalManualContributions || 0),
        activeUsers: activeUsers || 0,
        completedContributions: totalCompletedContributions,
        popularLanguages: totalCoverage
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values if error occurs
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Discover Issues',
      description: 'Find beginner-friendly GitHub issues filtered by language, labels, and keywords'
    },
    {
      icon: Bookmark,
      title: 'Bookmark & Track',
      description: 'Save interesting issues and track your progress from start to completion'
    },
    {
      icon: BarChart3,
      title: 'Progress Dashboard',
      description: 'Visualize your open source contribution journey with detailed analytics'
    },
    {
      icon: Target,
      title: 'Manual Tracker',
      description: 'Add and track contributions made outside the platform to get a complete view'
    },
    {
      icon: Users,
      title: 'Community Focus',
      description: 'Connect with beginner-friendly projects and welcoming maintainers'
    }
  ];

  const dynamicStats = [
    { 
      icon: Bookmark, 
      value: loading ? '...' : `${stats.totalBookmarks.toLocaleString()}+`, 
      label: 'Issues Bookmarked' 
    },
    { 
      icon: Users, 
      value: loading ? '...' : `${stats.activeUsers.toLocaleString()}+`, 
      label: 'Active Contributors' 
    },
    { 
      icon: GitPullRequest, 
      value: loading ? '...' : `${stats.completedContributions.toLocaleString()}+`, 
      label: 'Contributions Made' 
    },
    { 
      icon: Star, 
      value: loading ? '...' : `${stats.popularLanguages.toLocaleString()}+`, 
      label: 'Languages Covered' 
    }
  ];

  return (
    <div className="min-h-screen">
      
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
            <Github className="h-4 w-4 mr-2" />
            Your Gateway to Open Source Contributions
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-8 leading-tight">
            Find Your First
            <br />
            <span className="text-gray-900">Open Source</span>
            <br />
            Contribution
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover beginner-friendly GitHub issues, track your progress, and start your open source journey with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={user ? "/explore" : "/signup"}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              {user ? "Explore Issues" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/explore"
              className="px-8 py-4 border-2 border-indigo-200 text-indigo-600 rounded-xl font-semibold text-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
            >
              Browse Issues
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-gray-600">
              Real-time statistics from our platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Start Contributing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and guidance you need to make your first open source contribution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Open Source Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have made their first contributions with Open Source Buddy.
          </p>
          <Link
            to={user ? "/explore" : "/signup"}
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {user ? "Start Exploring" : "Join Now - It's Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;