import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Sprout,
  Search,
  ExternalLink,
  ArrowRight,
  Network,
  Calendar,
  Terminal,
  Grid,
  X
} from "lucide-react";
import contributorsData from "../data/contributors.json";

const ContributionTree = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [viewMode, setViewMode] = useState("tree"); // 'tree' | 'grid'
  const [activeContributor, setActiveContributor] = useState(null);

  // Group contributors dynamically into structured branches so it scales seamlessly
  const branches = useMemo(() => {
    return [
      {
        id: "core",
        name: "main / trunk",
        tag: "CORE",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        lineColor: "#f59e0b",
        contributors: contributorsData.filter((c) => c.role === "Maintainer" || c.branch === "root"),
      },
      {
        id: "alpha",
        name: "feature/genesis-leaves",
        tag: "GENESIS",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        lineColor: "#10b981",
        contributors: contributorsData.filter(
          (c) => c.role !== "Maintainer" && (c.branch === "left" || c.id === "2" || c.id === "4" || c.id === "7")
        ),
      },
      {
        id: "beta",
        name: "community/canopy-cohort",
        tag: "CANOPY",
        color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        lineColor: "#06b6d4",
        contributors: contributorsData.filter(
          (c) => c.role !== "Maintainer" && (c.branch === "right" || c.branch === "center" || c.id === "3" || c.id === "5" || c.id === "6" || c.id === "8")
        ),
      },
    ];
  }, []);

  // Filtered contributors based on search term & selected branch tab
  const filteredContributors = useMemo(() => {
    let list = contributorsData;
    if (selectedBranch !== "all") {
      const targetBranch = branches.find((b) => b.id === selectedBranch);
      list = targetBranch ? targetBranch.contributors : list;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.github.toLowerCase().includes(term) ||
          (c.message && c.message.toLowerCase().includes(term))
      );
    }
    return list;
  }, [searchTerm, selectedBranch, branches]);

  return (
    <section className="relative z-10 py-16 sm:py-24 px-3.5 sm:px-6 lg:px-8 border-t border-zinc-900/80 bg-[#0B0C10] overflow-hidden">
      {/* Background Architectural Grid & Subtle Ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:28px_28px] sm:bg-[size:40px_40px]" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] h-[300px] sm:h-[350px] bg-emerald-500/[0.03] rounded-full blur-[120px] sm:blur-[160px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[300px] bg-cyan-500/[0.02] rounded-full blur-[100px] sm:blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 mb-3 sm:mb-4 text-[9px] sm:text-[10px] font-bold font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full select-none uppercase max-w-[95%] truncate">
            <GitBranch className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">COMMUNITY GIT DAG &middot; LIVING ECOSYSTEM</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
            The Contribution{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Tree
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto px-1">
            A living graph of developers who merged their first pull request into FirstIssue.dev.
            Every commit expands the canopy, connects to core branches, and verifies your open source record.
          </p>
        </div>

        {/* Control Bar: Filters, Search, View Mode */}
        <div className="bg-[#0f1117]/90 border border-zinc-800/80 rounded-xl p-2.5 sm:p-3.5 mb-6 sm:mb-8 shadow-xl backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          {/* Branch Filter Tabs (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none -mx-0.5 px-0.5">
            <button
              onClick={() => setSelectedBranch("all")}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium font-mono transition-all whitespace-nowrap flex-shrink-0 ${
                selectedBranch === "all"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              All Branches ({contributorsData.length})
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium font-mono transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                  selectedBranch === b.id
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.lineColor }} />
                <span>{b.name}</span>
                <span className="text-[10px] text-zinc-500">({b.contributors.length})</span>
              </button>
            ))}
          </div>

          {/* Search & View Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search contributor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B0C10] border border-zinc-700/60 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/70 transition-all font-mono"
              />
            </div>

            {/* View Switcher (Tree vs Grid) */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setViewMode("tree")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "tree" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Branch Graph View"
              >
                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "grid" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Dense Canopy Grid View"
              >
                <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* CTA Button (Visible on tablet & desktop) */}
            <Link
              to="/contribution-book"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all duration-200 shadow-sm flex-shrink-0"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Plant Leaf</span>
            </Link>
          </div>
        </div>

        {/* Tree Container Canvas */}
        <div className="relative w-full bg-[#0d0f14] rounded-xl sm:rounded-2xl border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-zinc-800/70 bg-zinc-950/70 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-800" />
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-zinc-500 ml-1.5 truncate">
                git tree --graph --oneline
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono flex-shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>{filteredContributors.length} leaves</span>
              </span>
            </div>
          </div>

          {/* VIEW MODE 1: MODERN ARCHITECTURAL BRANCH GRAPH */}
          {viewMode === "tree" && (
            <div className="p-3.5 sm:p-6 lg:p-10 min-h-[420px] sm:min-h-[520px] relative">
              {/* Branch Timeline Rail */}
              <div className="space-y-8 sm:space-y-12 relative">
                {branches.map((branch) => {
                  const branchContributors = branch.contributors.filter((c) =>
                    filteredContributors.some((fc) => fc.id === c.id)
                  );

                  if (selectedBranch !== "all" && selectedBranch !== branch.id) return null;
                  if (branchContributors.length === 0) return null;

                  return (
                    <div key={branch.id} className="relative pl-5 sm:pl-9 lg:pl-10">
                      {/* Vertical branch rail line */}
                      <div
                        className="absolute left-1.5 sm:left-3 top-2.5 bottom-0 w-0.5"
                        style={{
                          background: `linear-gradient(to bottom, ${branch.lineColor}99, ${branch.lineColor}22)`,
                        }}
                      />

                      {/* Branch Header Node */}
                      <div className="flex items-center gap-2 sm:gap-3 mb-3.5 sm:mb-5">
                        <div
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center -ml-7 sm:-ml-11 lg:-ml-12 bg-[#0d0f14] border-2 z-10 flex-shrink-0"
                          style={{ borderColor: branch.lineColor }}
                        >
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: branch.lineColor }} />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="font-mono text-[11px] sm:text-xs font-bold text-white tracking-wide truncate">
                            {branch.name}
                          </span>
                          <span
                            className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border flex-shrink-0 ${branch.color}`}
                          >
                            {branch.tag}
                          </span>
                        </div>
                      </div>

                      {/* Contributor Cards Grid on this branch */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                        {branchContributors.map((c) => {
                          const isSelected = activeContributor?.id === c.id;
                          return (
                            <motion.div
                              key={c.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => setActiveContributor(isSelected ? null : c)}
                              className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? "bg-zinc-800/90 border-emerald-400 ring-1 ring-emerald-400/40 shadow-lg shadow-emerald-950/30"
                                  : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 sm:gap-3">
                                {/* Contributor Avatar with status indicator */}
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={c.avatar}
                                    alt={c.name}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-zinc-800 border border-zinc-700/80 group-hover:border-emerald-400/60 transition-colors"
                                    onError={(e) => {
                                      e.target.src = `https://avatar.vercel.sh/${c.github}`;
                                    }}
                                  />
                                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#0d0f14] rounded-full p-0.5">
                                    <div
                                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                                      style={{ backgroundColor: branch.lineColor }}
                                    />
                                  </div>
                                </div>

                                {/* Contributor Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                      {c.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
                                      #{c.id.padStart(3, "0")}
                                    </span>
                                  </div>

                                  <div className="text-[11px] font-mono text-zinc-400 truncate">
                                    @{c.github}
                                  </div>

                                  {c.message && (
                                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1 sm:mt-1.5 italic">
                                      "{c.message}"
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-500">
                                    <span className="flex items-center gap-1 truncate">
                                      <Calendar className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                      <span className="truncate">{c.joinedAt}</span>
                                    </span>
                                    <span className="text-emerald-400 group-hover:underline flex items-center gap-0.5 flex-shrink-0">
                                      Inspect
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: DENSE SCALABLE CANOPY WALL */}
          {viewMode === "grid" && (
            <div className="p-3.5 sm:p-6 lg:p-8 min-h-[350px] sm:min-h-[400px]">
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {filteredContributors.map((c) => {
                  const isSelected = activeContributor?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveContributor(isSelected ? null : c)}
                      className={`group p-2 sm:p-2.5 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-zinc-800 border-emerald-400 ring-1 ring-emerald-400 shadow-md"
                          : "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      <div className="relative inline-block mx-auto mb-1.5 sm:mb-2">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover mx-auto border border-zinc-700 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = `https://avatar.vercel.sh/${c.github}`;
                          }}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-[#0B0C10]" />
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">{c.name}</div>
                      <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 truncate">@{c.github}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Contributor Inspection Drawer / HUD */}
          <AnimatePresence>
            {activeContributor && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="border-t border-zinc-800 bg-[#0d0f14]/98 p-4 sm:p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                    <img
                      src={activeContributor.avatar}
                      alt={activeContributor.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-emerald-400/80 bg-zinc-900 shadow-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src = `https://avatar.vercel.sh/${activeContributor.github}`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {activeContributor.name}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {activeContributor.role || "Contributor"}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-zinc-500">
                          #LEAF-{activeContributor.id.padStart(4, "0")}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">
                        @{activeContributor.github}
                      </div>
                      <p className="text-xs text-zinc-300 italic mt-1 sm:mt-1.5 line-clamp-2 sm:line-clamp-none max-w-xl">
                        "{activeContributor.message || "Planted on FirstIssue.dev"}"
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons in HUD */}
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80 flex-shrink-0">
                    <a
                      href={`https://github.com/${activeContributor.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>GitHub Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setActiveContributor(null)}
                      className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800/50 flex items-center gap-1"
                      title="Close drawer"
                    >
                      <X className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Close</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scalable Community Growth Callout (Bottom banner) */}
        <div className="mt-6 sm:mt-8 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate">
                Join the Tree via GitHub PR
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 sm:line-clamp-none">
                Fork the repo, append your profile block to <code className="text-zinc-300 font-mono">contributors.json</code>, and your leaf joins the graph instantly.
              </p>
            </div>
          </div>

          <Link
            to="/contribution-book"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
          >
            <span>Read Contribution Book</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContributionTree;
