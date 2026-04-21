import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
    const target = 150;
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
    <div className="min-h-screen bg-[#0B0C10] text-[#EEEEEE] overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* New Feature Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-8 animate-fade-in hover:bg-blue-500/20 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            NOW ROLLING BETA V2.0
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
            Ship your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              first contribution
            </span>
            <br />
            <span className="text-white">today.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The premium platform for developers to find, track, and conquer
            open-source issues at world-class companies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link
              to={user ? "/explore" : "/login"}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-lg hover:shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:-translate-y-1"
            >
              Join the movement
              <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Explore issues
            </Link>
          </div>

          {/* Trusted By */}
          <div className="mb-24">
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-8">
              TRUSTED BY CONTRIBUTORS AT
            </p>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Using text/icons placeholders for logos as per plan */}
              <div className="flex items-center gap-2 text-xl font-bold font-mono hover:text-[#00ADB5] transition-colors">
                <Github className="w-6 h-6" /> GitHub
              </div>
              <div className="flex items-center gap-2 text-xl font-bold font-sans hover:text-[#00ADB5] transition-colors">
                <Zap className="w-6 h-6" /> Vercel
              </div>
              <div className="flex items-center gap-2 text-xl font-bold hover:text-[#00ADB5] transition-colors">
                <Database className="w-6 h-6" /> Supabase
              </div>
              <div className="flex items-center gap-2 text-xl font-bold hover:text-[#00ADB5] transition-colors">
                <Layout className="w-6 h-6" /> Linear
              </div>
              <div className="flex items-center gap-2 text-xl font-bold font-serif hover:text-[#00ADB5] transition-colors">
                <Code2 className="w-6 h-6" /> Prisma
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#1a1b26] rounded-xl border border-white/10 p-2 sm:p-4 shadow-2xl overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="ml-auto px-3 py-1 bg-white/5 rounded-full text-[10px] text-gray-400 font-mono">
                dashboard.firstissue.dev
              </div>
            </div>

            {/* Video/GIF Demo */}
            <div className="rounded-lg overflow-hidden bg-[#0B0C10]">
              <video
                src="https://res.cloudinary.com/dl3czd3ib/video/upload/f_auto,q_auto/v1768837375/firstissue.dev_f8gqfj.mp4"
                alt="FirstIssue.dev Dashboard Demo"
                className="w-full h-auto object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: AI Match - Large — With animated flow */}
            <div className="lg:col-span-2 bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Text */}
                <div className="flex-1 relative z-10 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    AI-Driven Smart Matching
                  </h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    We analyze your GitHub history to recommend issues that
                    perfectly match your tech stack and experience level.
                  </p>
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right: Animated visualization */}
                <div className="flex-1 relative">
                  {/* Connecting wires */}
                  <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 300 220" fill="none">
                    {/* Wire from Profile to AI */}
                    <path d="M 60 50 Q 150 30 150 110" stroke="url(#wireGrad1)" strokeWidth="1.5" strokeDasharray="6 4" className="animate-wire-flow" />
                    {/* Wire from AI to Issues */}
                    <path d="M 150 110 Q 150 180 240 180" stroke="url(#wireGrad2)" strokeWidth="1.5" strokeDasharray="6 4" className="animate-wire-flow-delay" />
                    {/* Wire from AI to Score */}
                    <path d="M 150 110 Q 200 90 240 100" stroke="url(#wireGrad2)" strokeWidth="1" strokeDasharray="4 4" className="animate-wire-flow-delay2" />
                    {/* Gradient defs */}
                    <defs>
                      <linearGradient id="wireGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="wireGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    {/* Animated dot on wire 1 */}
                    <circle r="3" fill="#3b82f6">
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 60 50 Q 150 30 150 110" />
                    </circle>
                    {/* Animated dot on wire 2 */}
                    <circle r="3" fill="#8b5cf6">
                      <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M 150 110 Q 150 180 240 180" />
                    </circle>
                    {/* Animated dot on wire 3 */}
                    <circle r="2.5" fill="#06b6d4">
                      <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M 150 110 Q 200 90 240 100" />
                    </circle>
                  </svg>

                  <div className="relative z-10 space-y-2">
                    {/* Node 1: GitHub Profile */}
                    <div className="bg-[#0B0C10] rounded-xl p-3 border border-white/5 w-40 animate-float-slow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <Github className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white">Your Profile</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          <span className="text-[9px] text-gray-400">JavaScript</span>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-yellow-500/40 rounded-full animate-bar-fill" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span className="text-[9px] text-gray-400">TypeScript</span>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-blue-500/40 rounded-full animate-bar-fill-delay" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-[9px] text-gray-400">Python</span>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[40%] bg-green-500/40 rounded-full animate-bar-fill-delay2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Node 2: AI Brain — centered */}
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-3 border border-blue-500/20 w-28 text-center animate-pulse-subtle">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-1">
                          <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                        </div>
                        <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">AI Scoring</span>
                      </div>
                    </div>

                    {/* Node 3: Matched Issues — right aligned */}
                    <div className="flex justify-end gap-2">
                      <div className="bg-[#0B0C10] rounded-xl p-2.5 border border-green-500/10 w-36 animate-float-slow-delay">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="px-1.5 py-0.5 rounded bg-green-500/20 text-[8px] font-bold text-green-400">92%</div>
                          <span className="text-[9px] text-white truncate">Fix auth middleware</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">React</span>
                          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Node.js</span>
                        </div>
                      </div>
                      <div className="bg-[#0B0C10] rounded-xl p-2.5 border border-blue-500/10 w-28 opacity-70 animate-float-slow-delay2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[8px] font-bold text-blue-400">78%</div>
                          <span className="text-[9px] text-white truncate">Add dark mode</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">CSS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Proof of Work */}
            <div className="bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                <Shield className="w-24 h-24 text-purple-500" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Proof of Work
              </h3>
              <p className="text-gray-400 text-sm">
                Build a verifiable on-chain resume of your contributions. No
                more resume padding.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="flex items-center">
                  <img
                    className="w-7.5 rounded-full border-3 border-white"
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50"
                    alt="userImage1"
                  />
                  <img
                    className="w-7.5 rounded-full border-3 border-white -translate-x-2"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50"
                    alt="userImage2"
                  />
                  <img
                    className="w-7.5 rounded-full border-3 border-white -translate-x-4"
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop"
                    alt="userImage3"
                  />
                </div>
                <span className="text-xs text-gray-500">+1.2k achievers</span>
              </div>
            </div>

            {/* Feature 3: Real-time Collab */}
            <div className="bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-pink-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Real-time Collab
              </h3>
              <p className="text-gray-400 text-sm">
                Live code sessions with maintainers and teammates built directly
                into the platform.
              </p>
            </div>

            {/* Feature 4: Curated Top Tier - Large */}
            <div className="lg:col-span-2 bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-green-500/30 transition-all group">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-6">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Curated Top Tier
                  </h3>
                  <p className="text-gray-400">
                    Only high-quality issues from verified companies. No
                    "good-first-issue" spam, just real impact.
                  </p>
                </div>

                {/* Mock Cards */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="bg-[#0B0C10] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div className="flex-1">
                      <div className="h-2 w-32 bg-white/20 rounded mb-1" />
                      <div className="h-1.5 w-16 bg-white/10 rounded" />
                    </div>
                    <div className="px-2 py-1 rounded bg-blue-500/20 text-[10px] text-blue-400">
                      Buy Now?
                    </div>
                  </div>
                  <div className="bg-[#0B0C10] p-4 rounded-xl border border-white/5 flex items-center gap-4 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-white/20 rounded mb-1" />
                      <div className="h-1.5 w-20 bg-white/10 rounded" />
                    </div>
                    <div className="px-2 py-1 rounded bg-purple-500/20 text-[10px] text-purple-400">
                      Urgent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Count Section */}
      <section id="user-count-section" className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-6xl sm:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4">
              {userCount}+
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Active Developers
            </p>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Building their open source portfolio and making real impact
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-b from-[#1a1b26] to-[#0B0C10] rounded-3xl p-12 sm:p-20 text-center border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 relative z-10">
              Ready to build the future?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of world-class developers making an impact on the
              projects that power the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors shadow-lg hover:shadow-blue-500/25"
              >
                Get Started Now
              </Link>
              {/* <a
                    href="#"
                    className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-semibold hover:bg-white/5 transition-colors"
                    >
                    Talk to Sales
                    </a> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
