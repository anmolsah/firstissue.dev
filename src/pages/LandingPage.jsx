import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  ArrowRight,
  Github,
  Search,
  Bookmark,
  BarChart3,
  Users,
  Star,
  GitPullRequest,
  Target,
  Sparkles,
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    activeUsers: 0,
    completedContributions: 0,
    popularLanguages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: totalBookmarks } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true });

      const { count: totalManualContributions } = await supabase
        .from("manual_contributions")
        .select("*", { count: "exact", head: true });

      const [bookmarkUsersResult, manualUsersResult] = await Promise.all([
        supabase.from("bookmarks").select("user_id"),
        supabase.from("manual_contributions").select("user_id"),
      ]);

      const allUsers = new Set([
        ...(bookmarkUsersResult.data?.map((u) => u.user_id) || []),
        ...(manualUsersResult.data?.map((u) => u.user_id) || []),
      ]);
      const activeUsers = allUsers.size;

      const { count: completedBookmarks } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("status", "done");

      const { count: completedManualContributions } = await supabase
        .from("manual_contributions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const totalCompletedContributions =
        (completedBookmarks || 0) + (completedManualContributions || 0);

      const [bookmarkLanguagesResult, manualReposResult] = await Promise.all([
        supabase.from("bookmarks").select("language"),
        supabase.from("manual_contributions").select("repository_name"),
      ]);

      const bookmarkLanguages = new Set(
        bookmarkLanguagesResult.data?.map((l) => l.language) || []
      );
      const manualRepos = new Set(
        manualReposResult.data?.map((r) => r.repository_name) || []
      );
      const totalCoverage = bookmarkLanguages.size + manualRepos.size;

      setStats({
        totalBookmarks: (totalBookmarks || 0) + (totalManualContributions || 0),
        activeUsers: activeUsers || 0,
        completedContributions: totalCompletedContributions,
        popularLanguages: totalCoverage,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "Discover Issues",
      description:
        "Find beginner-friendly GitHub issues filtered by language, labels, and keywords",
    },
    {
      icon: Bookmark,
      title: "Bookmark & Track",
      description:
        "Save interesting issues and track your progress from start to completion",
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description:
        "Visualize your open source contribution journey with detailed analytics",
    },
    {
      icon: Target,
      title: "Manual Tracker",
      description:
        "Add and track contributions made outside the platform for a complete view",
    },
    {
      icon: Users,
      title: "Community Focus",
      description:
        "Connect with beginner-friendly projects and welcoming maintainers",
    },
  ];

  const dynamicStats = [
    {
      icon: Bookmark,
      value: loading ? "..." : `${stats.totalBookmarks.toLocaleString()}+`,
      label: "Issues Bookmarked",
    },
    {
      icon: Users,
      value: loading ? "..." : `${stats.activeUsers.toLocaleString()}+`,
      label: "Active Contributors",
    },
    {
      icon: GitPullRequest,
      value: loading
        ? "..."
        : `${stats.completedContributions.toLocaleString()}+`,
      label: "Contributions Made",
    },
    {
      icon: Star,
      value: loading ? "..." : `${stats.popularLanguages.toLocaleString()}+`,
      label: "Languages Covered",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00ADB5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00ADB5]/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-[#00ADB5]/20 text-[#00ADB5] rounded-full text-sm font-medium mb-8 border border-[#00ADB5]/30">
            <Sparkles className="h-4 w-4 mr-2" />
            Your Gateway to Open Source Contributions
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-[#00ADB5]">Find Your First</span>
            <br />
            <span className="text-[#EEEEEE]">Open Source</span>
            <br />
            <span className="text-[#EEEEEE]">Contribution</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#EEEEEE]/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover beginner-friendly GitHub issues, track your progress, and
            start your open source journey with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={user ? "/explore" : "/signup"}
              className="group px-8 py-4 bg-[#00ADB5] text-[#222831] rounded-xl font-semibold text-lg hover:bg-[#00d4de] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#00ADB5]/25 flex items-center"
            >
              {user ? "Explore Issues" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/getting-started"
              className="px-8 py-4 border border-[#393E46] text-[#EEEEEE] rounded-xl font-semibold text-lg hover:border-[#00ADB5] hover:text-[#00ADB5] transition-all duration-300 flex items-center"
            >
              <Github className="mr-2 h-5 w-5" />
              Learn to Contribute
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#393E46]/30 backdrop-blur-sm border-y border-[#393E46]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-[#EEEEEE]/60">
              Real-time statistics from our platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ADB5]/20 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-[#00ADB5]/30 transition-all duration-300 border border-[#00ADB5]/30">
                  <stat.icon className="h-8 w-8 text-[#00ADB5]" />
                </div>
                <div className="text-3xl font-bold text-[#EEEEEE] mb-2">
                  {stat.value}
                </div>
                <div className="text-[#EEEEEE]/60 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#EEEEEE] mb-4">
              Everything You Need to Start Contributing
            </h2>
            <p className="text-xl text-[#EEEEEE]/60 max-w-2xl mx-auto">
              Our platform provides all the tools and guidance you need to make
              your first open source contribution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-[#393E46]/50 backdrop-blur-sm rounded-2xl border border-[#393E46] hover:border-[#00ADB5]/50 hover:shadow-xl hover:shadow-[#00ADB5]/10 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00ADB5]/20 rounded-xl mb-6 group-hover:scale-110 group-hover:bg-[#00ADB5]/30 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-[#00ADB5]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EEEEEE] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#EEEEEE]/60 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#00ADB5]/20 to-[#393E46]/50 rounded-3xl p-12 text-center border border-[#00ADB5]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ADB5]/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-[#EEEEEE] mb-6">
                Ready to Start Your Open Source Journey?
              </h2>
              <p className="text-xl text-[#EEEEEE]/70 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who have made their first
                contributions with FirstIssue.dev.
              </p>
              <Link
                to={user ? "/explore" : "/signup"}
                className="inline-flex items-center px-8 py-4 bg-[#00ADB5] text-[#222831] rounded-xl font-semibold text-lg hover:bg-[#00d4de] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#00ADB5]/25"
              >
                {user ? "Start Exploring" : "Join Now - It's Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
