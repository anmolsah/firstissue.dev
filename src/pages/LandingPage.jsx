import React from "react";
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
import demoVideo from "../assets/video01.gif";

const LandingPage = () => {
  const { user } = useAuth();

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
            Ship your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">first contribution</span>
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
              <div className="flex items-center gap-2 text-xl font-bold font-mono hover:text-[#00ADB5] transition-colors"><Github className="w-6 h-6" /> GitHub</div>
              <div className="flex items-center gap-2 text-xl font-bold font-sans hover:text-[#00ADB5] transition-colors"><Zap className="w-6 h-6" /> Vercel</div>
              <div className="flex items-center gap-2 text-xl font-bold hover:text-[#00ADB5] transition-colors"><Database className="w-6 h-6" /> Supabase</div>
              <div className="flex items-center gap-2 text-xl font-bold hover:text-[#00ADB5] transition-colors"><Layout className="w-6 h-6" /> Linear</div>
              <div className="flex items-center gap-2 text-xl font-bold font-serif hover:text-[#00ADB5] transition-colors"><Code2 className="w-6 h-6" /> Prisma</div>
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
              <img 
                src={demoVideo} 
                alt="FirstIssue.dev Dashboard Demo" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: AI Match - Large */}
            <div className="lg:col-span-2 bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Zap className="w-32 h-32 text-blue-500" />
               </div>
              <div className="relative z-10 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI-Driven Smart Matching</h3>
                <p className="text-gray-400 max-w-md">
                  We analyze your GitHub history to recommend issues that perfectly match your tech stack and experience level.
                </p>
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
              <h3 className="text-xl font-bold text-white mb-4">Proof of Work</h3>
              <p className="text-gray-400 text-sm">
                Build a verifiable on-chain resume of your contributions. No more resume padding.
              </p>
              <div className="mt-6 flex items-center gap-2">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#15161E]" />)}
                 </div>
                 <span className="text-xs text-gray-500">+1.2k achievers</span>
              </div>
            </div>

            {/* Feature 3: Real-time Collab */}
            <div className="bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-pink-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Real-time Collab</h3>
              <p className="text-gray-400 text-sm">
                Live code sessions with maintainers and teammates built directly into the platform.
              </p>
            </div>

            {/* Feature 4: Curated Top Tier - Large */}
            <div className="lg:col-span-2 bg-[#15161E] rounded-3xl p-8 border border-white/5 hover:border-green-500/30 transition-all group">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-6">
                        <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Curated Top Tier</h3>
                    <p className="text-gray-400">
                        Only high-quality issues from verified companies. No "good-first-issue" spam, just real impact.
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
                           <div className="px-2 py-1 rounded bg-blue-500/20 text-[10px] text-blue-400">Buy Now?</div>
                      </div>
                      <div className="bg-[#0B0C10] p-4 rounded-xl border border-white/5 flex items-center gap-4 opacity-50">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                           <div className="flex-1">
                              <div className="h-2 w-24 bg-white/20 rounded mb-1" />
                              <div className="h-1.5 w-20 bg-white/10 rounded" />
                          </div>
                          <div className="px-2 py-1 rounded bg-purple-500/20 text-[10px] text-purple-400">Urgent</div>
                      </div>
                  </div>
              </div>
            </div>
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
                     Join thousands of world-class developers making an impact on the projects that power the world.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                    <Link
                    to="/signup"
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
