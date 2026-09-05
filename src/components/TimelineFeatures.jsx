import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Zap,
  Shield,
  Star,
  ArrowRight,
  Github,
  CheckCircle,
  Code2,
  Sparkles,
  Trophy,
  GitPullRequest,
  Terminal,
  Filter,
  Check,
  ExternalLink,
  Flame,
} from "lucide-react";

// Accent styling mappings to give each card subtle, premium ambient lighting
const ACCENT_STYLES = {
  blue: {
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]",
    borderHover: "group-hover:border-blue-500/30",
    iconColor: "group-hover:text-blue-400",
    iconBg: "group-hover:bg-blue-500/10 group-hover:border-blue-500/25",
    topGradient: "from-blue-500/20 via-transparent to-transparent",
  },
  amber: {
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]",
    borderHover: "group-hover:border-amber-500/30",
    iconColor: "group-hover:text-amber-400",
    iconBg: "group-hover:bg-amber-500/10 group-hover:border-amber-500/25",
    topGradient: "from-amber-500/20 via-transparent to-transparent",
  },
  purple: {
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]",
    borderHover: "group-hover:border-amber-500/30",
    iconColor: "group-hover:text-amber-400",
    iconBg: "group-hover:bg-amber-500/10 group-hover:border-amber-500/25",
    topGradient: "from-amber-500/20 via-transparent to-transparent",
  },
  pink: {
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.2)]",
    borderHover: "group-hover:border-rose-500/30",
    iconColor: "group-hover:text-rose-400",
    iconBg: "group-hover:bg-rose-500/10 group-hover:border-rose-500/25",
    topGradient: "from-rose-500/20 via-transparent to-transparent",
  },
  emerald: {
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]",
    borderHover: "group-hover:border-emerald-500/30",
    iconColor: "group-hover:text-emerald-400",
    iconBg: "group-hover:bg-emerald-500/10 group-hover:border-emerald-500/25",
    topGradient: "from-emerald-500/20 via-transparent to-transparent",
  },
  cyan: {
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)]",
    borderHover: "group-hover:border-cyan-500/30",
    iconColor: "group-hover:text-cyan-400",
    iconBg: "group-hover:bg-cyan-500/10 group-hover:border-cyan-500/25",
    topGradient: "from-cyan-500/20 via-transparent to-transparent",
  },
};

// Modern Bento Grid Card Component
const FeatureCard = ({
  index,
  accent = "blue",
  title,
  description,
  icon: Icon,
  badge,
  visual,
  link,
  linkText,
  onClick,
  className = "",
}) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const isPoW = index === 1; // index 1 is Proof of Work (2-column hero card)
  const isExternal = link && link.startsWith("http");
  const style = ACCENT_STYLES[accent] || ACCENT_STYLES.blue;

  const handleCardClick = (e) => {
    if (e.target.closest("a") || e.target.closest("button")) {
      return;
    }
    if (isExternal) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#0c0d12]/90 hover:bg-[#10121a]/95 backdrop-blur-xl border border-white/[0.08] ${style.borderHover} transition-all duration-300 p-6 sm:p-7 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${style.glow} ${isPoW ? "min-h-[440px]" : "min-h-[410px]"} ${className} ${isExternal || onClick ? "cursor-pointer" : ""}`}
    >
      {/* Top Hairline Light Reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Subtle Ambient Radial Glow on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${style.topGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
      />

      {/* Card Header & Description */}
      <div className="relative z-10 flex-shrink-0 mb-4 select-none">
        <div className="flex items-center justify-between mb-3.5">
          <div
            className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 transition-all duration-300 ${style.iconColor} ${style.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {badge ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-white/[0.04] border border-white/[0.08] text-zinc-400">
              {badge}
            </span>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-zinc-100 transition-colors flex items-center gap-2">
          {title}
        </h3>
        <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Visualizer Container Frame */}
      <div className="relative w-full flex-grow flex items-center justify-center min-h-[195px] rounded-xl overflow-hidden bg-gradient-to-b from-[#08090d] to-[#0b0c11] border border-white/[0.05] p-3 group-hover:border-white/[0.1] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] my-2">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        {React.cloneElement(visual, { active: isInView })}
      </div>

      {/* Action Footer */}
      {(link || onClick) && (
        <div className="mt-3 relative z-10 text-left pt-2 border-t border-white/[0.04]">
          {onClick ? (
            <button
              onClick={onClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 outline-none group-hover:text-white"
            >
              <span>{linkText || "Explore feature"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>
          ) : isExternal ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors group-hover:text-white"
            >
              <span>{linkText || "Explore feature"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </a>
          ) : (
            <Link
              to={link}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors group-hover:text-white"
            >
              <span>{linkText || "Explore feature"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// VISUALIZER 1: AI Match Flow (Standard Dev Matching Engine)
// ============================================================================
const AIMatchVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex flex-col justify-between p-1 select-none">
      {/* Top: Developer Profile Node */}
      <div className="bg-[#11131a]/95 border border-white/[0.08] rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Github className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white tracking-tight leading-none">
                alex.dev
              </div>
              <div className="text-[8px] text-zinc-500 font-mono">
                Full-Stack Contributor
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            SYNCED
          </span>
        </div>

        {/* Skill affinity bars */}
        <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-white/[0.04]">
          <div>
            <div className="flex justify-between text-[8px] text-zinc-400 mb-1">
              <span>TypeScript</span>
              <span className="text-blue-400 font-mono">94%</span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={active ? { width: "94%" } : { width: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[8px] text-zinc-400 mb-1">
              <span>React / Next.js</span>
              <span className="text-cyan-400 font-mono">88%</span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={active ? { width: "88%" } : { width: 0 }}
                transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle AI Router Beam */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="relative z-10 px-3 py-1 rounded-full bg-[#0e1017] border border-blue-500/30 flex items-center gap-1.5 shadow-lg shadow-blue-500/10">
          <Zap className="w-2.5 h-2.5 text-blue-400 animate-pulse" />
          <span className="text-[8.5px] font-mono font-bold text-blue-300 tracking-wider">
            AI EMBEDDINGS MATCH
          </span>
        </div>
      </div>

      {/* Bottom: Recommended Issue Match */}
      <div className="bg-[#11131a]/95 border border-emerald-500/30 rounded-xl p-3 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold text-white tracking-tight">
              vercel/next.js
            </span>
            <span className="text-[8px] font-mono text-zinc-500">#49210</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            98% MATCH
          </span>
        </div>
        <div className="text-[9.5px] font-medium text-zinc-200 line-clamp-1 mb-2 text-left">
          Fix hydration mismatch in streaming SSR suspense
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-[7.5px] font-mono text-blue-400 border border-blue-500/20">
            TypeScript
          </span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[7.5px] font-mono text-emerald-400 border border-emerald-500/20">
            +50 Impact
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VISUALIZER 2: Proof of Work Card (Obsidian & Titanium 3D Cryptographic Card)
// ============================================================================
const ProofOfWorkVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex flex-col md:flex-row items-center justify-between gap-4 p-2 select-none">
      {/* 3D Titanium MetalCard */}
      <div className="relative flex-1 w-full max-w-[340px] flex items-center justify-center py-2">
        <motion.div
          animate={
            active
              ? {
                  rotateY: [-4, 4, -4],
                  rotateX: [3, -3, 3],
                  y: [0, -4, 0],
                }
              : { rotateY: 0, rotateX: 0, y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
          }}
          className="w-full rounded-2xl bg-gradient-to-br from-[#181510] via-[#101015] to-[#0a0a0e] border border-amber-500/40 p-4 sm:p-5 shadow-[0_20px_40px_-15px_rgba(245,158,11,0.25)] relative overflow-hidden text-left"
        >
          {/* Micro scanlines effect */}
          <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:100%_4px] pointer-events-none z-10" />

          {/* Sweeping Metallic Foil Sheen */}
          <motion.div
            animate={
              active
                ? {
                    left: ["-120%", "220%"],
                  }
                : { left: "-120%" }
            }
            transition={{
              repeat: Infinity,
              repeatDelay: 3.5,
              duration: 1.8,
              ease: "easeInOut",
            }}
            className="absolute top-0 w-[45%] h-full bg-gradient-to-r from-transparent via-amber-300/15 to-transparent skew-x-[-25deg] pointer-events-none z-20"
          />

          {/* Card Top: Brand & Verified Status */}
          <div className="relative z-30 flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono text-[9px] font-black">
                FI
              </div>
              <span className="text-[11px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500">
                FIRSTISSUE // PoW
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[8px] font-mono font-bold tracking-wider">
              <CheckCircle className="w-2.5 h-2.5" />
              VERIFIED PR
            </div>
          </div>

          {/* Card Mid: Repository and Merged Issue Title */}
          <div className="relative z-30 mb-3">
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-amber-200 mb-1">
              <Code2 className="w-3 h-3 text-amber-400" />
              <span>facebook/react</span>
              <span className="text-zinc-500 font-mono">#24089</span>
            </div>
            <h4 className="text-[11px] font-semibold text-zinc-100 leading-snug line-clamp-2">
              Implement Concurrent Mode Suspense lifecycle hooks
            </h4>
          </div>

          {/* Card Metrics Grid */}
          <div className="relative z-30 grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-black/40 border border-white/[0.05] mb-3">
            <div>
              <div className="text-[7.5px] text-zinc-500 uppercase font-mono">
                Diff
              </div>
              <div className="text-[9.5px] font-bold text-emerald-400 font-mono">
                +1,420 / -180
              </div>
            </div>
            <div>
              <div className="text-[7.5px] text-zinc-500 uppercase font-mono">
                Impact
              </div>
              <div className="text-[9.5px] font-bold text-amber-300 font-mono flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400/40" />
                98 / 100
              </div>
            </div>
            <div>
              <div className="text-[7.5px] text-zinc-500 uppercase font-mono">
                Tier
              </div>
              <div className="text-[9.5px] font-bold text-amber-400 font-mono">
                Gold Mint
              </div>
            </div>
          </div>

          {/* Card Footer: Attestation Hash */}
          <div className="relative z-30 flex items-center justify-between text-[7.5px] font-mono text-zinc-400 pt-1 border-t border-white/[0.05]">
            <span className="tracking-wider">HASH: 0x8fa4b9...7640</span>
            <span className="text-amber-400/80">ETHEREUM L2 MINT</span>
          </div>
        </motion.div>
      </div>

      {/* On-Chain Verification Pipeline (Right side telemetry on desktop) */}
      <div className="w-full md:w-[220px] flex flex-col justify-center space-y-2 p-3 rounded-xl bg-black/30 border border-white/[0.06] text-left">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Verification Engine
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="space-y-1.5 text-[8.5px] font-mono">
          <div className="flex items-start gap-1.5 text-zinc-300">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>GitHub PR merged &amp; signed</span>
          </div>
          <div className="flex items-start gap-1.5 text-zinc-300">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Codebase diff analyzed</span>
          </div>
          <div className="flex items-start gap-1.5 text-zinc-300">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Impact scored (98/100)</span>
          </div>
          <div className="flex items-start gap-1.5 text-amber-400">
            <Check className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>Soulbound badge minted</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-zinc-500">
          <span>Latency: 14ms</span>
          <span className="text-emerald-400">100% On-Chain</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VISUALIZER 3: Open Source Hackathons (Live Competition Arena)
// ============================================================================
const HackathonVisualizer = ({ active }) => {
  const hackathons = [
    {
      title: "GitAI Builders 2026",
      organizer: "GitHub & OpenAI",
      prize: "$25,000",
      status: "Starts in 3 days",
      badge: "AI & OPEN SOURCE",
      teams: "148 Teams",
    },
    {
      title: "SustainOS Global",
      organizer: "Linux Foundation",
      prize: "$15,000",
      status: "Starts in 10 days",
      badge: "INFRASTRUCTURE",
      teams: "92 Teams",
    },
    {
      title: "OpenWeb World Sprint",
      organizer: "Mozilla & W3C",
      prize: "$10,000",
      status: "Starts in 22 days",
      badge: "WEB STANDARDS",
      teams: "64 Teams",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % hackathons.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [active, hackathons.length]);

  const current = hackathons[activeIndex];

  return (
    <div className="w-full h-full flex flex-col justify-between p-1 select-none text-left">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            CONTRIBLY ARENA
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
          {current.badge}
        </span>
      </div>

      {/* Featured Hackathon Card */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="my-2 bg-[#11131a]/95 border border-white/[0.08] rounded-xl p-3.5 shadow-lg relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <span className="text-[8px] font-mono text-zinc-400">
              {current.organizer}
            </span>
            <h4 className="text-[11px] font-bold text-white tracking-tight">
              {current.title}
            </h4>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-zinc-500 font-mono">PRIZE POOL</div>
            <div className="text-[12px] font-black text-rose-400 font-mono">
              {current.prize}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/[0.04] text-[8px] font-mono text-zinc-400">
          <span className="text-emerald-400">{current.status}</span>
          <span className="text-zinc-500">{current.teams}</span>
        </div>
      </motion.div>

      {/* Navigation Indicators */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        <span className="text-[8px] font-mono text-zinc-500">
          3 Featured Contests
        </span>
        <div className="flex items-center gap-1.5">
          {hackathons.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="p-1 -m-1 inline-flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer appearance-none"
              aria-label={`Go to hackathon ${idx + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-3.5 h-1 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    : "w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VISUALIZER 4: Curated Curation Feeds (Verification & Spam Quarantine)
// ============================================================================
const CuratedVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex flex-col justify-between p-1 select-none text-left">
      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            ISSUE SANITIZATION
          </span>
        </div>
        <span className="text-[8px] font-mono text-emerald-400">
          99.4% Signal
        </span>
      </div>

      {/* Issues Queue */}
      <div className="space-y-2 my-auto relative">
        {/* Radar sweep indicator */}
        {active && (
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute -left-1 w-full h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)] z-20 pointer-events-none"
          />
        )}

        {/* Card 1: Verified Tier-1 Issue */}
        <div className="bg-[#11131a]/95 rounded-xl p-2.5 border border-emerald-500/30 shadow-md relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src="https://cdn.simpleicons.org/vercel/white"
                  alt="vercel"
                  className="w-2.5 h-2.5 object-contain"
                />
              </div>
              <span className="text-[9px] font-bold text-white tracking-tight">
                vercel/next.js
              </span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-[7.5px] font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
              <Check className="w-2 h-2" /> VERIFIED TIER 1
            </span>
          </div>
          <div className="text-[9.5px] font-medium text-zinc-200 truncate mb-1">
            Optimize streaming SSR hydration lifecycle
          </div>
          <div className="flex items-center gap-2 text-[8px] text-zinc-400 font-mono">
            <span className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400/30" />
              118k
            </span>
            <span className="text-emerald-400">+45 Impact pts</span>
          </div>
        </div>

        {/* Card 2: Filtered / Quarantined Spam */}
        <div className="bg-[#0e0f14]/80 rounded-xl p-2.5 border border-white/[0.05] opacity-50 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-medium text-zinc-500 line-through">
              spam-bot/repo
            </span>
            <span className="px-1.5 py-0.2 rounded text-[7.5px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              QUARANTINED
            </span>
          </div>
          <div className="text-[9px] font-medium text-zinc-500 line-through truncate">
            Fix typo in README: "teh" to "the"
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-zinc-500">
        <span>No Stale Tickets</span>
        <span className="text-zinc-400">Zero Hacktoberfest Spam</span>
      </div>
    </div>
  );
};

// ============================================================================
// VISUALIZER 5: AI RAG Copilot (FirstMate Interactive Terminal Dialogue)
// ============================================================================
const AICopilotVisualizer = ({ active }) => {
  return (
    <div className="w-full h-full relative flex flex-col justify-between p-1 select-none text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            FIRSTMATE COPILOT
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
          AI AGENT READY
        </span>
      </div>

      {/* Chat Thread */}
      <div className="space-y-2 my-auto">
        {/* User Bubble */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2 max-w-[85%]">
          <div className="text-[7.5px] font-mono text-zinc-400 mb-0.5">
            You (Contributor)
          </div>
          <div className="text-[9px] text-zinc-200">
            How do I rebase my branch on upstream main?
          </div>
        </div>

        {/* AI Answer with Code Snippet */}
        <div className="bg-[#11131a]/95 border border-cyan-500/30 rounded-xl p-2.5 shadow-md">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[8px] font-mono font-bold text-cyan-400">
              FirstMate
            </span>
            <span className="text-[7px] font-mono text-zinc-500">
              • Verified Docs
            </span>
          </div>

          <div className="bg-black/60 rounded-lg p-2 font-mono text-[8px] text-cyan-300 border border-white/[0.04] mb-1.5 leading-relaxed">
            <div className="text-zinc-500"># Fetch &amp; rebase</div>
            <div>git fetch upstream</div>
            <div>git rebase upstream/main</div>
          </div>

          <div className="text-[7.5px] font-mono text-zinc-400 flex items-center gap-1">
            <Check className="w-2.5 h-2.5 text-emerald-400" />
            <span>Source: Advanced Git Workflows</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[8px] font-mono text-zinc-500">
        <span>Instant Codebase Answers</span>
        <span className="text-cyan-400">Press / to chat</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN FEATURES GRID SECTION
// ============================================================================
const TimelineFeatures = () => {
  const features = [
    {
      accent: "blue",
      title: "AI-Driven Smart Matching",
      description:
        "We analyze your GitHub activity and repository history to match you with open source issues that fit your exact tech stack.",
      icon: Zap,
      visual: <AIMatchVisualizer />,
      link: "/explore",
      linkText: "Find your match",
    },
    {
      accent: "amber",
      title: "Proof of Work Attestations",
      description:
        "Build a verifiable cryptographic portfolio of your merged pull requests. No resume padding — just tamper-proof on-chain badges.",
      icon: Shield,
      visual: <ProofOfWorkVisualizer />,
      link: "/profile",
      linkText: "View achievements",
    },
    {
      accent: "pink",
      title: "Open Source Hackathons",
      description:
        "Discover upcoming open source hackathons, collaborate with high-performing builders, and compete for real cash prizes.",
      icon: Trophy,
      visual: <HackathonVisualizer />,
      link: "https://contribly.firstissue.dev/",
      linkText: "Browse hackathons",
    },
    {
      accent: "emerald",
      title: "Curated Top Tier Issues",
      description:
        "High-signal issues filtered from verified enterprise repositories. Zero spam, stale tickets, or dead PRs.",
      icon: Star,
      visual: <CuratedVisualizer />,
      link: "/explore",
      linkText: "Browse top issues",
    },
    {
      accent: "cyan",
      title: "FirstMate AI Copilot",
      description:
        "An intelligent companion that guides you through git rebase hurdles, codebase architecture, and contribution guidelines.",
      icon: Sparkles,
      visual: <AICopilotVisualizer />,
      link: "/firstmate",
      linkText: "Ask questions",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-900/60">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-zinc-400 mb-4 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CONTRIBUTOR WORKSPACE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Scale your{" "}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              impact.
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            A high-performance workspace designed to match you with top-tier issues,
            accelerate setup, and prove your engineering contributions.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => {
            // Card 1 (Proof of Work) is the hero feature spanning 2 columns
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
