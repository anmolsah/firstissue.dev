import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ComparisonSection from "../components/ComparisonSection";
import TimelineFeatures from "../components/TimelineFeatures";
import {
  ArrowRight,
  Github,
  Search,
  Zap,
  Shield,
  Users,
  Code2,
  Database,
  Layout,
  Star,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            animateCount();
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById("user-count-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible]);

  const animateCount = () => {
    const target = 200;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setUserCount(target);
        clearInterval(timer);
      } else {
        setUserCount(Math.floor(current));
      }
    }, duration / steps);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#EEEEEE] overflow-hidden relative">
      {/* Vercel Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none vercel-grid" />
      
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[20%] w-[60%] h-[40%] bg-blue-600/10 rounded-full blur-[130px] opacity-75" />
        <div className="absolute top-[10%] right-[10%] w-[35%] h-[35%] bg-purple-600/5 rounded-full blur-[110px] opacity-50" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Vercel Announcement Pill */}
          <Link
            to="/docs/getting-started/platform-guide#proof-of-work-pow-attestations"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 mb-8 text-[11px] sm:text-xs font-medium text-zinc-400 bg-white/[0.03] border border-zinc-800/80 rounded-full hover:border-zinc-700 hover:text-white transition-all duration-300 select-none max-w-[95%] sm:max-w-none mx-auto"
          >
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20 flex-shrink-0">NEW</span>
            <span className="truncate sm:whitespace-normal text-left">Introducing Cryptographic Proof of Work Attestations</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
          </Link>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Ship your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
              first contribution
            </span>
            <br />
            <span>today.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
            The premium platform for developers to find, track, and conquer
            open-source issues at world-class companies.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-16">
            <Link
              to={user ? "/explore" : "/login"}
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded transition-all duration-200 text-center flex items-center justify-center gap-1.5"
            >
              Join the movement
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-zinc-800 hover:bg-white/[0.04] text-white hover:border-zinc-700 font-semibold text-xs rounded transition-all duration-200 text-center"
            >
              Explore issues
            </Link>
          </div>

          {/* Trusted By */}
          <div className="mb-20">
            <p className="text-[9px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-6">
              trusted by developers at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-35 hover:opacity-75 transition-opacity duration-300">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-tight">
                <Github className="w-4 h-4" /> GitHub
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-tight">
                <Zap className="w-4 h-4" /> Vercel
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-tight">
                <Database className="w-4 h-4" /> Supabase
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-tight">
                <Layout className="w-4 h-4" /> Linear
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-tight">
                <Code2 className="w-4 h-4" /> Prisma
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-lg blur opacity-15" />
          <div className="relative bg-[#0d0e12] rounded-lg border border-zinc-800/80 p-1.5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center gap-1.5 mb-2.5 px-3 py-1">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="ml-auto px-3 py-0.5 bg-white/[0.03] border border-zinc-800/60 rounded-full text-[9px] text-zinc-500 font-mono">
                firstissue.dev
              </div>
            </div>

            {/* Video Demo */}
            <div className="rounded border border-zinc-900 overflow-hidden bg-[#0B0C10]">
              <video
                src="https://res.cloudinary.com/dl3czd3ib/video/upload/f_auto,q_auto/v1768837375/firstissue.dev_f8gqfj.mp4"
                alt="FirstIssue.dev Dashboard Demo"
                className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <TimelineFeatures />

      {/* User Count Section */}
      <section id="user-count-section" className="py-16 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-900/60">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h3 className="text-5xl sm:text-6xl font-black text-white mb-2 tracking-tighter">
              {userCount}+
            </h3>
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-2">
              Active Developers
            </p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Building their open source portfolio and making real codebase impact.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <ComparisonSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-900/60">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.01] border border-zinc-800/80 rounded-xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 relative z-10">
              Ready to build the future?
            </h2>
            <p className="text-sm text-zinc-400 mb-8 max-w-lg mx-auto relative z-10 leading-relaxed">
              Join thousands of world-class developers making an impact on the
              projects that power the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center relative z-10">
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-black rounded font-semibold text-xs hover:bg-zinc-200 transition-all duration-200"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
