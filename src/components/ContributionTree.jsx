import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  ExternalLink,
  Sprout,
  ArrowRight,
  GitPullRequest,
  Calendar,
  Award
} from "lucide-react";
import contributorsData from "../data/contributors.json";

const ContributionTree = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [hoveredContributor, setHoveredContributor] = useState(null);

  // Filtered contributors based on search
  const filteredContributors = useMemo(() => {
    if (!searchTerm.trim()) return contributorsData;
    const term = searchTerm.toLowerCase();
    return contributorsData.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.github.toLowerCase().includes(term) ||
        (c.message && c.message.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  // Position nodes strategically across the canopy branches
  // Coordinates are defined in percentage [x, y] on a 100x100 canvas
  const nodePositions = useMemo(() => {
    return [
      { id: "1", x: 50, y: 78, branch: "root" },      // Anmol Sah (Maintainer / Trunk)
      { id: "2", x: 30, y: 60, branch: "left-low" },  // Alex Rivera
      { id: "3", x: 70, y: 58, branch: "right-low" }, // Sarah Chen
      { id: "4", x: 20, y: 40, branch: "left-mid" },  // David Kim
      { id: "5", x: 50, y: 48, branch: "center-mid" },// Elena Rostova
      { id: "6", x: 80, y: 42, branch: "right-mid" }, // Marcus Johnson
      { id: "7", x: 35, y: 24, branch: "left-top" },  // Priya Patel
      { id: "8", x: 65, y: 22, branch: "right-top" }, // Liam Wilson
    ];
  }, []);

  // Map contributors to their branch position
  const positionedContributors = useMemo(() => {
    return contributorsData.map((contributor, index) => {
      const pos = nodePositions[index] || {
        x: 25 + (index * 13) % 55,
        y: 20 + (index * 17) % 50,
        branch: "leaf"
      };
      return {
        ...contributor,
        x: pos.x,
        y: pos.y,
        isHighlighted: filteredContributors.some((fc) => fc.id === contributor.id),
      };
    });
  }, [nodePositions, filteredContributors]);

  const activeContributor = hoveredContributor || selectedContributor;

  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-900/80 bg-[#0B0C10] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] left-[20%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[350px] bg-purple-500/5 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full select-none">
            <Sprout className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>COMMUNITY ECOSYSTEM</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            The Living{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Contribution Tree
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Every leaf represents a developer who made their very first contribution.
            Hover over any avatar to read their story, or plant your own leaf today!
          </p>
        </div>

        {/* Toolbar: Search & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/80 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or @github..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0B0C10]/80 border border-zinc-700/60 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Quick Info & CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs text-zinc-400 px-3 py-1.5 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-white">{contributorsData.length}</span> Leaves Planted
            </div>

            <Link
              to="/contribution-book"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-lg shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all duration-200"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Plant Your Leaf</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* The Tree Interactive Visualization Canvas */}
        <div className="relative w-full bg-[#0d0f14] rounded-2xl border border-zinc-800/90 shadow-2xl p-4 sm:p-8 min-h-[580px] flex items-center justify-center overflow-hidden">
          {/* Vercel-like grid texture on canvas */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:28px_28px] opacity-70 pointer-events-none" />

          {/* SVG Tree Trunk & Glowing Branches */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Branch Gradients */}
              <linearGradient id="treeBranchGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>

              <filter id="branchBloom" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Tree Root & Trunk Base */}
            <path
              d="M 47 100 C 47 90, 48 85, 50 78 C 52 85, 53 90, 53 100 Z"
              fill="#1e293b"
              opacity="0.8"
            />
            
            {/* Organic Branches */}
            {/* Trunk line */}
            <path
              d="M 50 82 Q 50 65 50 48"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
              filter="url(#branchBloom)"
            />

            {/* Lower Left Branch */}
            <path
              d="M 50 72 Q 40 68 30 60"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.6"
              strokeDasharray="1.5 0.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Lower Right Branch */}
            <path
              d="M 50 70 Q 60 66 70 58"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.6"
              strokeDasharray="1.5 0.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mid Left Branch */}
            <path
              d="M 50 58 Q 32 52 20 40"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mid Right Branch */}
            <path
              d="M 50 56 Q 68 50 80 42"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Upper Left Branch */}
            <path
              d="M 50 48 Q 42 34 35 24"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Upper Right Branch */}
            <path
              d="M 50 48 Q 58 32 65 22"
              stroke="url(#treeBranchGlow)"
              strokeWidth="0.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Render Contributor Leaf Nodes */}
          <div className="absolute inset-0 w-full h-full">
            {positionedContributors.map((c, index) => {
              const isMatch = c.isHighlighted;
              const isMaintainer = c.role === "Maintainer";

              return (
                <motion.div
                  key={c.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isMatch ? (activeContributor?.id === c.id ? 1.2 : 1) : 0.45,
                    opacity: isMatch ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredContributor(c)}
                  onMouseLeave={() => setHoveredContributor(null)}
                  onClick={() => setSelectedContributor(selectedContributor?.id === c.id ? null : c)}
                >
                  {/* Glowing halo when hovered or searched */}
                  <div
                    className={`absolute -inset-2 rounded-full transition-all duration-300 ${
                      activeContributor?.id === c.id
                        ? "bg-emerald-400/40 blur-md opacity-100 scale-125"
                        : "bg-transparent opacity-0 group-hover:bg-emerald-500/20 group-hover:opacity-100 group-hover:blur-sm"
                    }`}
                  />

                  {/* Avatar Node Container */}
                  <div
                    className={`relative rounded-full p-0.5 transition-all duration-300 shadow-xl ${
                      isMaintainer
                        ? "bg-gradient-to-tr from-amber-400 via-emerald-400 to-cyan-400 ring-2 ring-emerald-400/50"
                        : "bg-gradient-to-tr from-emerald-500 to-teal-300 ring-1 ring-emerald-500/30 group-hover:ring-emerald-400"
                    } ${
                      activeContributor?.id === c.id ? "scale-110 ring-4 ring-emerald-400" : ""
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover bg-zinc-900"
                      onError={(e) => {
                        e.target.src = `https://avatar.vercel.sh/${c.github}`;
                      }}
                    />

                    {/* Small Leaf/Crown Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-[#0B0C10] border border-emerald-500/40 rounded-full p-0.5 text-emerald-400 shadow-sm">
                      {isMaintainer ? (
                        <Award className="w-2.5 h-2.5 text-amber-400" />
                      ) : (
                        <Sprout className="w-2.5 h-2.5 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {/* Floating Label on mobile/desktop hover */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 rounded-full shadow-lg">
                      @{c.github}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contributor Detail Card Modal / Popover */}
          <AnimatePresence>
            {activeContributor && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 bg-[#12141a]/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-4 shadow-2xl z-30"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={activeContributor.avatar}
                    alt={activeContributor.name}
                    className="w-12 h-12 rounded-full object-cover border border-emerald-500/40 bg-zinc-800"
                    onError={(e) => {
                      e.target.src = `https://avatar.vercel.sh/${activeContributor.github}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">
                        {activeContributor.name}
                      </h4>
                      {activeContributor.role === "Maintainer" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full">
                          Maintainer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400 font-mono">
                      @{activeContributor.github}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>Planted on {activeContributor.joinedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Message Bubble */}
                {activeContributor.message && (
                  <div className="bg-zinc-900/80 rounded-lg p-2.5 border border-zinc-800/80 text-xs text-zinc-300 mb-3 italic leading-relaxed">
                    "{activeContributor.message}"
                  </div>
                )}

                {/* Action Links */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <a
                    href={`https://github.com/${activeContributor.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    <span>View GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Link
                    to="/contribution-book"
                    className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Join Tree</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instruction hint when no node is hovered */}
          {!activeContributor && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-60">
              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hover over any leaf or search above to view details</span>
              </p>
            </div>
          )}
        </div>

        {/* Tree Roots Banner / Call To Action */}
        <div className="mt-8 bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-cyan-950/20 rounded-xl p-6 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Ready to make your mark on FirstIssue.dev?
              </h4>
              <p className="text-xs text-zinc-400">
                Follow our 5-minute Contribution Book to fork, edit, and plant your leaf on this tree.
              </p>
            </div>
          </div>

          <Link
            to="/contribution-book"
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Open Contribution Book</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContributionTree;
