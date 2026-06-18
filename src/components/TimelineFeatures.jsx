import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import {
  Zap,
  Shield,
  Users,
  Star,
  ArrowRight,
  Github,
  CheckCircle,
  Code2,
  Database,
  Layout,
  Globe,
  Sparkles,
  Trophy,
} from "lucide-react";

// Individual Timeline Row Item Component
const FeatureCard = ({ index, accent, title, description, icon: Icon, badge, visual, link, linkText, onClick, className = "" }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const isPoW = index === 1; // index 1 is Proof of Work

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white/[0.02] border border-zinc-800/60 hover:border-zinc-700/80 rounded-xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${isPoW ? 'min-h-[420px]' : 'min-h-[380px]'} group ${className}`}
    >
      {/* Decorative subtle background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

      {/* Text Area */}
      <div className="relative z-10 flex-shrink-0 mb-4 select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors duration-200">
            <Icon className="w-4 h-4" />
          </div>
          {badge && (
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border border-zinc-700/50">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-zinc-400 text-xs leading-relaxed">
          {description}
        </p>
      </div>

      {/* Visualizer Container */}
      <div className="relative w-full flex-grow flex items-center justify-center min-h-[160px] rounded-lg overflow-hidden bg-black/10 border border-zinc-900/60 p-2 mt-auto">
        {React.cloneElement(visual, { active: isInView })}
      </div>

      {/* Action Link */}
      {(link || onClick) && (
        <div className="mt-4 relative z-10 text-left">
          {onClick ? (
            <button
              onClick={onClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
            >
              {linkText || "Learn more"}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <Link
              to={link}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              {linkText || "Learn more"}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
};

// --- VISUALIZERS ---

// Visualizer 1: AI Match Flow
const AIMatchVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[220px]">
      {/* Aspect Ratio Box to keep layout pixel-perfect */}
      <div className="relative w-[300px] h-[220px] flex-shrink-0 scale-90 sm:scale-100 transition-transform origin-center">
        {/* Connecting Wires */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 300 220" fill="none">
          {/* Wire from Profile to AI */}
          <motion.path
            d="M 60 45 Q 150 25 150 100"
            stroke="url(#aiWireGrad1)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            animate={active ? { strokeDashoffset: [-20, 0] } : {}}
            transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
          />
          {/* Wire from AI to Issues */}
          <motion.path
            d="M 150 100 Q 150 180 240 180"
            stroke="url(#aiWireGrad2)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            animate={active ? { strokeDashoffset: [-20, 0] } : {}}
            transition={{ repeat: Infinity, ease: "linear", duration: 2, delay: 0.5 }}
          />
          {/* Wire from AI to Secondary Issue */}
          <motion.path
            d="M 150 100 Q 210 80 240 90"
            stroke="url(#aiWireGrad2)"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={active ? { strokeDashoffset: [-20, 0] } : {}}
            transition={{ repeat: Infinity, ease: "linear", duration: 2.5, delay: 0.3 }}
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="aiWireGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="aiWireGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Animated Particles */}
          {active && (
            <>
              <circle r="3" fill="#3b82f6">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 60 45 Q 150 25 150 100" />
              </circle>
              <circle r="3" fill="#8b5cf6">
                <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s" path="M 150 100 Q 150 180 240 180" />
              </circle>
              <circle r="2" fill="#06b6d4">
                <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.8s" path="M 150 100 Q 210 80 240 90" />
              </circle>
            </>
          )}
        </svg>

        {/* Node 1: GitHub Profile (Center at 60, 45) */}
        <div 
          className="absolute bg-[#0B0C10] rounded-xl p-2.5 border border-white/5 w-[130px] animate-float-slow text-left"
          style={{ left: "0px", top: "15px" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Github className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[9px] font-bold text-white">Your Stack</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[7px] text-gray-400 w-8 truncate">JS/TS</span>
              <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={active ? { width: "85%" } : { width: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-yellow-500/50 rounded-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] text-gray-400 w-8 truncate">React</span>
              <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={active ? { width: "65%" } : { width: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-blue-500/50 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Node 2: AI Brain - Center (Center at 150, 100) */}
        <div 
          className="absolute bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-1.5 border border-blue-500/20 w-[90px] text-center animate-pulse-subtle"
          style={{ left: "105px", top: "72px" }}
        >
          <div className="w-6 h-6 rounded-lg bg-blue-500/25 flex items-center justify-center mx-auto mb-1">
            <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
          </div>
          <span className="text-[8px] font-black text-blue-300 uppercase tracking-wider block">MATCHING</span>
        </div>

        {/* Node 3: Issues - Right (Center at 240, 180) */}
        <div 
          className="absolute bg-[#0B0C10] rounded-xl p-2 border border-green-500/10 w-[120px] animate-float-slow-delay text-left"
          style={{ left: "180px", top: "150px" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="px-1 py-0.2 rounded bg-green-500/20 text-[7px] font-bold text-green-400">92%</div>
            <span className="text-[8px] text-white truncate font-medium">Fix auth middleware</span>
          </div>
          <div className="flex gap-1">
            <span className="text-[6px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400">React</span>
            <span className="text-[6px] px-1 py-0.2 rounded bg-yellow-500/10 text-yellow-400">Node</span>
          </div>
        </div>

        {/* Node 4: Secondary Issue - Right (Center at 240, 90) */}
        <div 
          className="absolute bg-[#0B0C10]/60 rounded-xl p-2 border border-white/5 w-[110px] opacity-60 text-left"
          style={{ left: "185px", top: "65px" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="px-1 py-0.2 rounded bg-white/10 text-[7px] text-gray-400">45%</div>
            <span className="text-[8px] text-gray-400 truncate">Fix CSS margins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Visualizer 2: Proof of Work Card
const ProofOfWorkVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[200px]" style={{ perspective: "800px" }}>
      {/* 3D Floating Metal Card */}
      <motion.div
        animate={
          active
            ? {
                rotateY: [-8, 8, -8],
                rotateX: [6, -6, 6],
                y: [0, -6, 0],
              }
            : { rotateY: -8, rotateX: 6, y: 0 }
        }
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="w-[250px] h-[175px] rounded-2xl bg-gradient-to-br from-amber-950 via-zinc-900 to-zinc-950 border border-amber-500/30 p-4 shadow-[0_20px_40px_-15px_rgba(234,179,8,0.25)] text-yellow-100 flex flex-col justify-between relative overflow-hidden"
      >
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz4KPC9zdmc+')] mix-blend-overlay pointer-events-none z-10"></div>

        {/* Dynamic Sheen sweeping */}
        <motion.div
          animate={
            active
              ? {
                  left: ["-100%", "200%"],
                }
              : { left: "-100%" }
          }
          transition={{
            repeat: Infinity,
            repeatDelay: 3,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="absolute top-0 w-[40%] h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-[-30deg] pointer-events-none z-20"
        />

        {/* Card Attestation Details */}
        <div className="relative z-30 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                FirstIssue.dev
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Code2 className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[8px] font-semibold text-amber-100/90 truncate max-w-[100px]">
                  facebook/react
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 scale-90">
              <CheckCircle className="w-2 h-2" />
              <span className="text-[7px] font-extrabold tracking-widest">VERIFIED</span>
            </div>
          </div>

          <div className="my-1">
            <h4 className="font-semibold text-[10px] leading-snug line-clamp-2 text-yellow-50/90">
              <span className="opacity-65 mr-1 text-amber-500 font-mono">#24089</span>
              Implement Concurrent Mode Suspense lifecycle hooks
            </h4>
            <div className="flex gap-2 mt-1 text-[8px] text-amber-200/80 font-medium">
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400/20" />
                <span>98 Impact Score</span>
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-white/5 flex justify-between items-center text-[7px] font-mono text-amber-200/40">
            <div className="flex flex-col">
              <span className="uppercase tracking-widest scale-90 origin-left">ATTESTATION HASH</span>
              <span className="tracking-wider mt-0.5 text-amber-200/60">0x8fa4...7640</span>
            </div>
            <div className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans font-bold scale-90 origin-right">
              Gold Mint
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Visualizer 3: Open Source Hackathons Card Deck
const HackathonVisualizer = ({ active }) => {
  const hackathons = [
    {
      title: "GitAI Builders 2026",
      organizer: "GitHub & OpenAI",
      prize: "$15,000",
      daysLeft: "Starts in 3 days",
      badgeColor: "bg-emerald-500/10 text-emerald-450 border-emerald-500/20",
    },
    {
      title: "SustainOS Hack",
      organizer: "OS Foundation",
      prize: "$8,000",
      daysLeft: "Starts in 12 days",
      badgeColor: "bg-blue-500/10 text-blue-450 border-blue-500/20",
    },
    {
      title: "OpenWeb Global 2026",
      organizer: "Mozilla",
      prize: "$10,000",
      daysLeft: "Starts in 24 days",
      badgeColor: "bg-purple-500/10 text-purple-450 border-purple-500/20",
    },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % hackathons.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between min-h-[190px] bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden select-none">
      {/* Title bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider font-mono">OS Hackathons</span>
        <span className="text-[9px] text-zinc-550 font-bold flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          UPCOMING
        </span>
      </div>

      {/* Cards Deck Container */}
      <div className="relative flex-grow flex items-center justify-center py-4">
        {hackathons.map((hack, idx) => {
          const position = (idx - activeIndex + hackathons.length) % hackathons.length;
          
          let cardStyle = {};
          if (position === 0) {
            cardStyle = {
              transform: "scale(1) translateY(0px) translateZ(0)",
              opacity: 1,
              zIndex: 3,
            };
          } else if (position === 1) {
            cardStyle = {
              transform: "scale(0.85) translateY(-10px) translateZ(-10px)",
              opacity: 0.35,
              zIndex: 2,
            };
          } else {
            cardStyle = {
              transform: "scale(0.7) translateY(-20px) translateZ(-20px)",
              opacity: 0,
              zIndex: 1,
              pointerEvents: "none",
            };
          }

          return (
            <motion.div
              key={idx}
              animate={cardStyle}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute w-44 bg-zinc-950/95 border border-zinc-800 rounded-lg p-3 shadow-2xl flex flex-col justify-between h-28"
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[8px] text-zinc-500 font-bold font-mono truncate max-w-[90px]">{hack.organizer}</span>
                  <span className={`text-[8px] px-1.5 py-0.2 rounded border font-mono font-bold scale-90 ${hack.badgeColor}`}>
                    {hack.prize}
                  </span>
                </div>
                <h4 className="text-[10px] font-bold text-white leading-tight mb-1 truncate text-left">{hack.title}</h4>
              </div>

              <div className="flex justify-between items-center text-[8px] text-zinc-400 border-t border-zinc-900 pt-2 font-mono">
                <span>{hack.daysLeft}</span>
                <span className="text-zinc-500 hover:text-white transition-colors cursor-pointer">Register &gt;</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination indicators */}
      <div className="flex justify-center gap-1.5 pt-2 border-t border-white/5">
        {hackathons.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === idx ? "bg-pink-500 w-3" : "bg-zinc-850"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Visualizer 4: Curated Curation Feeds
const CuratedVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative min-h-[220px] bg-black/10 rounded-xl p-3 overflow-hidden flex flex-col justify-between">
      {/* Laser Curation Sweep overlay */}
      {active && (
        <motion.div
          animate={{
            top: ["0%", "100%", "0%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_8px_rgba(74,222,128,0.8)] z-20 pointer-events-none"
        />
      )}

      {/* Issues Queue */}
      <div className="space-y-3.5 z-10 w-full relative">
        {/* Card 1: Verified */}
        <div className="bg-[#0B0C10] rounded-xl p-2.5 border border-white/5 animate-pulse-emerald-border relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <img src="https://github.com/vercel.png" alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-bold text-white tracking-wide">vercel/next.js</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[7px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-0.5 border border-emerald-500/20 scale-90">
              ✓ Verified
            </span>
          </div>
          <div className="text-[9.5px] font-semibold text-gray-200 text-left mb-1 truncate">
            Optimize streaming SSR hydration lifecycle
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-500 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400/20" /> 116k
            </span>
            <span className="px-1 py-0.2 rounded bg-emerald-500/10 text-[7px] font-bold text-emerald-300">
              High Impact (+45 pts)
            </span>
          </div>
        </div>

        {/* Card 2: Spam Rejected */}
        <div className="bg-[#0B0C10]/40 rounded-xl p-2.5 border border-red-500/10 opacity-30 relative overflow-hidden animate-reject-shake">
          {/* Strike-through line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/30 -translate-y-1/2 rotate-1" />

          {/* Stamp Pop */}
          {active && (
            <motion.span
              initial={{ scale: 3, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: -10 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className="px-1.5 py-0.5 rounded bg-red-500/20 text-[7.5px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 rotate-[-10deg] absolute right-3 top-3.5 z-20 shadow-lg"
            >
              Spam Blocked
            </motion.span>
          )}

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-medium text-gray-500 line-through">spammer/docs-repo</span>
            </div>
          </div>
          <div className="text-[9.5px] font-medium text-gray-500 line-through text-left truncate">
            Fix typo in README: change "teh" to "the"
          </div>
        </div>
      </div>
    </div>
  );
};

// Visualizer 5: AI RAG Copilot
const AICopilotVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[220px]">
      {/* Aspect Ratio Box to keep layout pixel-perfect */}
      <div className="relative w-[300px] h-[220px] flex-shrink-0 scale-90 sm:scale-100 transition-transform origin-center flex flex-col justify-between p-2">
        {/* User Query (Top Left) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-2.5 max-w-[180px] self-start text-left z-10"
        >
          <p className="text-[9px] text-blue-300 font-medium">How do I fix a merge conflict?</p>
        </motion.div>

        {/* AI Sparkle Vector Link (Middle) */}
        <div className="absolute top-[90px] left-[135px] z-20">
          <motion.div
            animate={active ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-[#00ADB5]/15 border border-[#00ADB5]/30 flex items-center justify-center text-[#00ADB5] shadow-[0_0_15px_rgba(0,173,181,0.2)]"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
          </motion.div>
        </div>

        {/* Connecting Lines / Wires */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 300 220" fill="none">
          <motion.path
            d="M 60 70 Q 150 90 150 106"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={active ? { strokeDashoffset: [-20, 0] } : {}}
            transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
            className="opacity-40"
          />
          <motion.path
            d="M 150 106 Q 150 120 220 135"
            stroke="#00ADB5"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={active ? { strokeDashoffset: [-20, 0] } : {}}
            transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
            className="opacity-40"
          />
        </svg>

        {/* AI Response (Bottom Right) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-[#1a1f26] border border-white/5 rounded-xl p-2.5 max-w-[200px] self-end text-left shadow-xl z-10"
        >
          <p className="text-[8px] text-gray-300 leading-normal mb-1.5">
            Run <code className="text-[#00ADB5] font-mono bg-[#222831] px-1 rounded">git rebase main</code> to integrate recent changes...
          </p>
          <div className="flex gap-1 items-center bg-[#00ADB5]/5 border border-[#00ADB5]/10 rounded px-1.5 py-0.5 w-max">
            <span className="text-[6px] text-[#00ADB5] font-semibold">Source: Troubleshooting</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- MAIN FEATURES GRID SECTION ---
const TimelineFeatures = () => {
  // Features list
  const features = [
    {
      accent: "blue",
      title: "AI-Driven Smart Matching",
      description:
        "We analyze your GitHub history to recommend issues that perfectly match your tech stack and experience level.",
      icon: Zap,
      visual: <AIMatchVisualizer />,
      link: "/explore",
      linkText: "Find your match",
    },
    {
      accent: "purple",
      title: "Proof of Work",
      description:
        "Build a verifiable on-chain resume of your contributions. No more resume padding, just cryptographically signed badges of achievement.",
      icon: Shield,
      visual: <ProofOfWorkVisualizer />,
      link: "/profile",
      linkText: "View achievements",
    },
    {
      accent: "pink",
      title: "Open Source Hackathons",
      description:
        "Find upcoming open source hackathons, form teams, build high-impact projects, and compete to win prizes.",
      icon: Trophy,
      badge: "Upcoming",
      visual: <HackathonVisualizer />,
      link: "/explore",
      linkText: "Find upcoming events",
    },
    {
      accent: "emerald",
      title: "Curated Top Tier",
      description:
        "Only high-quality issues from verified companies. No 'good-first-issue' spam or stale tickets — just real, high-impact contributions.",
      icon: Star,
      visual: <CuratedVisualizer />,
      link: "/explore",
      linkText: "Browse top issues",
    },
    {
      accent: "cyan",
      title: "FirstMate",
      description:
        "An intelligent chat companion to guide you through git commands, documentation, codebase setup, and contribution hurdles in real-time.",
      icon: Sparkles,
      visual: <AICopilotVisualizer />,
      link: "/firstmate",
      linkText: "Ask questions",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-900/60">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Scale your impact.
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            A minimalist workspace built to match you with top-tier issues and prove your contribution credentials.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => {
            // Card 2 (index 1: Proof of Work) is our hero feature, spans 2 columns
            const colSpan = idx === 1 ? "md:col-span-2" : "md:col-span-1";
            return (
              <FeatureCard
                key={idx}
                index={idx}
                accent={feature.accent}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                badge={feature.badge}
                visual={feature.visual}
                link={feature.link}
                linkText={feature.linkText}
                onClick={feature.onClick}
                className={colSpan}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TimelineFeatures;
