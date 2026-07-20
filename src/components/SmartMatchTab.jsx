import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupporter } from '../contexts/SupporterContext';
import { useSmartMatch } from '../hooks/useSmartMatch';
import { useRateLimiter } from '../hooks/useRateLimiter';
import {
  Sparkles,
  Lock,
  Loader2,
  ExternalLink,
  RefreshCw,
  Star,
  Bookmark,
  BookmarkCheck,
  Zap,
  Target,
  ArrowRight,
  Crown,
  AlertCircle,
  Clock,
  BrainCircuit,
  ShieldAlert,
  Tag,
} from 'lucide-react';

const LABEL_OPTIONS = [
  { id: 'good first issue', label: 'Good First Issue', color: 'emerald' },
  { id: 'help wanted', label: 'Help Wanted', color: 'blue' },
  { id: 'beginner', label: 'Beginner', color: 'purple' },
  { id: 'easy', label: 'Easy', color: 'green' },
  { id: 'starter', label: 'Starter', color: 'cyan' },
  { id: 'documentation', label: 'Documentation', color: 'yellow' },
];

const DEFAULT_LABELS = ['good first issue', 'help wanted'];

// Get/set label preferences from localStorage
const getStoredLabels = () => {
  try {
    const stored = localStorage.getItem('smartmatch_labels');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_LABELS;
};

const setStoredLabels = (labels) => {
  try {
    localStorage.setItem('smartmatch_labels', JSON.stringify(labels));
  } catch {}
};

const SmartMatchLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [prevStatusIndex, setPrevStatusIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const statuses = [
    { text: "Scanning your repositories", icon: "📡" },
    { text: "Mapping your tech stack", icon: "🧬" },
    { text: "Analyzing contribution patterns", icon: "📊" },
    { text: "Searching open issues", icon: "🔍" },
    { text: "Scoring match quality", icon: "⚡" },
    { text: "Curating your results", icon: "✨" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 98) return 98;
        // Slow down as we approach higher values for realism
        const remaining = 98 - old;
        const diff = Math.random() * Math.min(remaining * 0.08, 4) + 0.3;
        return Math.min(old + diff, 98);
      });
    }, 250);

    const statusTimer = setInterval(() => {
      setPrevStatusIndex((prev) => prev);
      setIsTransitioning(true);
      setTimeout(() => {
        setStatusIndex((prev) => {
          setPrevStatusIndex(prev);
          return (prev + 1) % statuses.length;
        });
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  const progressPercent = Math.floor(progress);

  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[480px] relative overflow-hidden select-none">
      {/* ─── Background ambient effects ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-600/[0.05] rounded-full blur-[100px] sm-loading-float" />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-violet-500/[0.04] rounded-full blur-[80px] sm-loading-float-delayed" />
      </div>

      {/* ─── Floating particles ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full sm-loading-particle"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: i % 2 === 0
                ? 'rgba(168, 85, 247, 0.4)'
                : 'rgba(96, 165, 250, 0.4)',
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Neural Core Visualization ─── */}
      <div className="relative mb-14">
        {/* Outermost ring – slow orbit */}
        <div className="w-44 h-44 rounded-full flex items-center justify-center relative">
          {/* Outer ring track */}
          <div className="absolute inset-0 rounded-full border border-white/[0.04]" />

          {/* Orbiting dot 1 – outer */}
          <div className="absolute inset-0 sm-loading-orbit" style={{ animationDuration: '6s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_12px_4px_rgba(168,85,247,0.5)]" />
          </div>

          {/* Orbiting dot 2 – outer, opposite */}
          <div className="absolute inset-0 sm-loading-orbit" style={{ animationDuration: '6s', animationDelay: '-3s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/70 shadow-[0_0_10px_3px_rgba(96,165,250,0.4)]" />
          </div>

          {/* Middle ring */}
          <div className="w-32 h-32 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />

            {/* Orbiting dot – middle */}
            <div className="absolute inset-0 sm-loading-orbit-reverse" style={{ animationDuration: '4s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_3px_rgba(196,167,255,0.4)]" />
            </div>

            {/* Scanning arc – middle ring */}
            <div className="absolute inset-0 sm-loading-orbit" style={{ animationDuration: '3s' }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
                <defs>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(168,85,247,0)" />
                    <stop offset="100%" stopColor="rgba(168,85,247,0.5)" />
                  </linearGradient>
                </defs>
                <circle cx="64" cy="64" r="62" fill="none" stroke="url(#arcGrad)" strokeWidth="1.5" strokeDasharray="60 330" strokeLinecap="round" />
              </svg>
            </div>

            {/* Inner core */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/25 via-blue-600/15 to-violet-600/25 flex items-center justify-center border border-white/10 relative sm-loading-core-pulse">
              {/* Core glow ring */}
              <div className="absolute inset-0 rounded-full shadow-[0_0_50px_-5px_rgba(168,85,247,0.3),inset_0_0_20px_-5px_rgba(168,85,247,0.15)]" />

              {/* Brain icon */}
              <BrainCircuit className="w-9 h-9 text-purple-300/90 relative z-10" />

              {/* Inner sparkle effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent sm-loading-shine" />
              </div>
            </div>
          </div>
        </div>

        {/* Data stream lines (decorative) */}
        <div className="absolute top-1/2 -left-8 w-6 h-px sm-loading-data-stream" style={{ animationDelay: '0s' }}>
          <div className="h-full bg-gradient-to-r from-transparent to-purple-500/30" />
        </div>
        <div className="absolute top-1/2 -right-8 w-6 h-px sm-loading-data-stream" style={{ animationDelay: '1.5s' }}>
          <div className="h-full bg-gradient-to-l from-transparent to-blue-500/30" />
        </div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-6 sm-loading-data-stream-v" style={{ animationDelay: '0.7s' }}>
          <div className="w-full h-full bg-gradient-to-b from-transparent to-violet-500/30" />
        </div>
      </div>

      {/* ─── Text Content ─── */}
      <div className="text-center mb-10 space-y-3 relative z-10">
        <h3 className="text-[22px] font-bold text-white tracking-tight">
          AI Matching in Progress
        </h3>
        <p className="text-zinc-400 text-sm max-w-[320px] mx-auto leading-relaxed">
          Comparing your GitHub contributions against thousands of open issues to find the perfect fit.
        </p>
      </div>

      {/* ─── Premium Progress Section ─── */}
      <div className="w-full max-w-md mx-auto relative z-10 px-4">
        {/* Progress bar container */}
        <div className="relative mb-5">
          {/* Track */}
          <div className="w-full h-[6px] rounded-full bg-white/[0.04] border border-white/[0.04] overflow-hidden backdrop-blur-sm">
            {/* Fill */}
            <div
              className="h-full rounded-full relative transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #6366f1, #3b82f6, #6366f1, #7c3aed)',
                backgroundSize: '200% 100%',
                animation: 'sm-loading-gradient-shift 3s ease infinite',
              }}
            >
              {/* Moving highlight on the fill */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    animation: 'sm-loading-bar-shine 2s ease-in-out infinite',
                  }}
                />
              </div>
              {/* Glow at the leading edge */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-400/40 blur-[6px]" />
            </div>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between">
          {/* Animated status text with crossfade */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
            <div className="relative h-5 flex-1 overflow-hidden">
              <div
                className="absolute inset-0 flex items-center gap-2 transition-all duration-300"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(-8px)' : 'translateY(0)',
                }}
              >
                <span className="text-base leading-none">{statuses[statusIndex].icon}</span>
                <span className="text-[11px] font-semibold text-zinc-400 tracking-wide truncate">
                  {statuses[statusIndex].text}
                </span>
              </div>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-baseline gap-0.5 tabular-nums">
            <span
              className="text-2xl font-black tracking-tighter"
              style={{
                background: 'linear-gradient(135deg, #e9d5ff, #c4b5fd, #93c5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {progressPercent}
            </span>
            <span className="text-xs font-bold text-zinc-500">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Label preference selector component
const LabelPreferences = ({ selectedLabels, onToggle }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LABEL_OPTIONS.map((opt) => {
        const isSelected = selectedLabels.includes(opt.id);
        const colorMap = {
          emerald: isSelected ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-750',
          blue: isSelected ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-750',
          purple: isSelected ? 'bg-purple-500/5 text-purple-300 border-purple-500/20' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-750',
          green: isSelected ? 'bg-green-500/5 text-green-300 border-green-500/20' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-750',
          cyan: isSelected ? 'bg-cyan-500/5 text-cyan-300 border-cyan-500/20' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-750',
          yellow: isSelected ? 'bg-yellow-500/5 text-yellow-300 border-yellow-500/20' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:border-zinc-750',
        };

        return (
          <button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-all cursor-pointer ${colorMap[opt.color]}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const SmartMatchTab = ({ username, token, userId, bookmarkedIssues, onToggleBookmark }) => {
  const navigate = useNavigate();
  const { isSupporter, loading: supporterLoading } = useSupporter();
  const [preferredLabels, setPreferredLabels] = useState(getStoredLabels);
  
  const { matches, userProfile, loading, error, fetchMatches, refresh, lastAnalyzedAt, isCached, limited, totalAvailable } = useSmartMatch(
    username,
    token,
    { userId, preferredLabels }
  );
  
  const { isRateLimited, remainingCooldown, checkRateLimit, recordAttempt } = useRateLimiter({
    maxAttempts: 2,
    windowMs: 5 * 60 * 1000,   // 5-minute window
    cooldownMs: 60 * 1000,      // 60-second cooldown
  });

  const handleLabelToggle = (labelId) => {
    setPreferredLabels(prev => {
      let next;
      if (prev.includes(labelId)) {
        next = prev.filter(l => l !== labelId);
        // Don't allow empty — keep at least one
        if (next.length === 0) return prev;
      } else {
        next = [...prev, labelId];
      }
      setStoredLabels(next);
      return next;
    });
  };

  const handleRefresh = () => {
    if (!checkRateLimit()) return;
    recordAttempt();
    refresh();
  };

  const handleAnalyze = () => {
    if (!checkRateLimit()) return;
    recordAttempt();
    refresh();
  };

  useEffect(() => {
    if (isSupporter && username && !isCached && !loading) {
      fetchMatches();
    }
  }, [isSupporter, username]);

  // Format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // ── Free preview intro for non-supporters (before their first run) ──
  // Everyone gets a taste of Smart Match: we run the AI and reveal their top 2
  // matches free. Supporters skip this (they auto-load the full list); free
  // users who already ran fall through to the results + upgrade card below.
  if (!supporterLoading && !isSupporter && (!matches || matches.length === 0) && !loading) {
    return (
      <div className="relative py-8">
        <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-8 max-w-md mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-950/25 flex items-center justify-center border border-purple-500/30 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
            Try AI Smart Matching — Free
          </h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            We'll analyze your GitHub profile, tech stack, and experience level and surface your{' '}
            <span className="text-white font-semibold">top 2 matched issues</span> — on us.
            Supporters unlock the full AI-ranked list and unlimited re-analysis.
          </p>

          <div className="space-y-2.5 mb-6 text-left">
            {[
              'AI-analyzed tech stack matching',
              'Personalized difficulty scoring',
              'Specific "why this match" reasoning',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          {isRateLimited ? (
            <div className="inline-flex items-center gap-2 text-amber-400 text-sm mb-1">
              <ShieldAlert className="w-4 h-4" />
              Try again in {remainingCooldown}s
            </div>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Get my 2 free matches
            </button>
          )}

          <button
            onClick={() => navigate('/support')}
            className="mt-3 block w-full text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            or unlock unlimited matches — $9/mo
          </button>
        </div>
      </div>
    );
  }

  // ── Loading State ──
  if (loading && (!matches || matches.length === 0)) {
    return <SmartMatchLoadingScreen />;
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">{error}</p>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#15161E] border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Results ──
  return (
    <div>
      {/* Profile Summary + Label Preferences + Re-analyze */}
      {userProfile && (
        <div className="bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/60 flex items-center justify-center flex-shrink-0 text-purple-400">
                <Target className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-white">Your Tech Profile</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {userProfile.techStack && userProfile.techStack.length > 0 ? (
                    userProfile.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-350 border border-zinc-800"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    userProfile.topLanguages.map((lang) => (
                      <span
                        key={lang.language}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-350 border border-zinc-800"
                      >
                        {lang.language}
                      </span>
                    ))
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-350 border border-zinc-800">
                    {userProfile.experienceLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-zinc-800/60 sm:border-0">
              {/* Cache info */}
              {lastAnalyzedAt && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-550">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(lastAnalyzedAt)}
                </span>
              )}
              {/* Re-analyze button */}
              {isRateLimited ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-amber-500 border border-amber-500/20 rounded">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Wait {remainingCooldown}s
                </div>
              ) : (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-black hover:bg-zinc-200 border border-zinc-800 rounded transition-colors cursor-pointer disabled:opacity-50"
                  title="Re-analyze your profile and find new matches"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Analyzing...' : 'Re-analyze'}
                </button>
              )}
            </div>
          </div>

          {/* Label Preferences */}
          <div className="mt-3 pt-3 border-t border-zinc-800/60">
            <div className="flex items-center gap-2 mb-2 select-none">
              <Tag className="w-3 h-3 text-zinc-500" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Issue Labels</span>
            </div>
            <LabelPreferences
              selectedLabels={preferredLabels}
              onToggle={handleLabelToggle}
            />
          </div>
        </div>
      )}

      {/* Matched Issues Grid */}
      {matches && matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {matches.map((issue) => (
            <SmartMatchCard
              key={issue.id}
              issue={issue}
              isBookmarked={bookmarkedIssues?.has(issue.url)}
              onToggleBookmark={() => onToggleBookmark?.(issue)}
            />
          ))}
          {/* Free preview: lock the remaining matches behind an upgrade. */}
          {limited && (
            <UpgradeMatchCard
              moreCount={totalAvailable ? Math.max(totalAvailable - matches.length, 0) : null}
              onUpgrade={() => navigate('/support')}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <Sparkles className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No matches yet</h3>
          <p className="text-sm text-gray-500 mb-6">Click the button below to analyze your profile and find matching issues.</p>
          {isRateLimited && (
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-4">
              <ShieldAlert className="w-4 h-4" />
              Rate limited — try again in {remainingCooldown}s
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading || isRateLimited}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRateLimited ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Analyzing...' : isRateLimited ? `Wait ${remainingCooldown}s` : 'Analyze My Profile'}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Smart Match Issue Card ──
const SmartMatchCard = ({ issue, isBookmarked, onToggleBookmark }) => {
  const matchPercentage = Math.round((issue.matchScore || 0) * 100);

  // Color-code match scores
  const getScoreColor = (pct) => {
    if (pct >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/25' };
    if (pct >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/25' };
    return { text: 'text-zinc-400', bg: 'bg-white/5', border: 'border-zinc-800' };
  };

  const scoreColor = getScoreColor(matchPercentage);

  // Format freshness
  const getFreshness = () => {
    if (issue.created_days_ago != null) {
      if (issue.created_days_ago === 0) return 'Today';
      if (issue.created_days_ago === 1) return '1d ago';
      return `${issue.created_days_ago}d ago`;
    }
    if (issue.created_at) {
      const days = Math.floor((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return '1d ago';
      return `${days}d ago`;
    }
    return null;
  };

  const freshness = getFreshness();

  return (
    <div className="group flex flex-col h-full bg-zinc-950/25 border border-zinc-800/60 rounded-xl p-6 transition-all duration-300 hover:border-zinc-750 hover:bg-white/[0.01]">
      {/* Card Header: AI Match & Bookmark */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1.5">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded ${scoreColor.bg} border ${scoreColor.border} w-fit`}>
            <BrainCircuit className={`w-3.5 h-3.5 ${scoreColor.text}`} />
            <span className="text-[10px] font-bold text-white tracking-wider uppercase">AI Match</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className={`text-[10px] font-bold font-mono ${scoreColor.text}`}>{matchPercentage}%</span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark?.();
          }}
          className={`p-1.5 rounded transition-all duration-200 ${
            isBookmarked
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Repo Metadata */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800/60 flex items-center justify-center overflow-hidden">
          <img 
            src={`https://github.com/${issue.repo.split('/')[0]}.png`} 
            alt="" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <span className="text-xs font-mono font-medium text-zinc-400 truncate hover:text-white transition-colors">{issue.repo}</span>
        {/* Repo stars */}
        {issue.repo_stars != null && (
          <span className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-550 ml-auto">
            <Star className="w-3 h-3 text-zinc-650" />
            {issue.repo_stars >= 1000 ? `${(issue.repo_stars / 1000).toFixed(1)}k` : issue.repo_stars}
          </span>
        )}
        {/* Freshness */}
        {freshness && (
          <span className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-550">
            <Clock className="w-3 h-3" />
            {freshness}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-3 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-purple-400 transition-colors">
        <a href={issue.url} target="_blank" rel="noopener noreferrer">
          {issue.title}
        </a>
      </h3>

      {/* AI Insight Section */}
      {issue.matchReason && (
        <div className="mb-6 p-4 rounded-lg bg-white/[0.01] border border-zinc-800/60 relative overflow-hidden">
          <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Why this match?
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {issue.matchReason}
          </p>
          {/* Subtle gradient accent — color matches score */}
          <div className={`absolute top-0 left-0 w-1 h-full ${
            matchPercentage >= 80 ? 'bg-emerald-500/30' :
            matchPercentage >= 50 ? 'bg-amber-500/30' : 'bg-zinc-550/30'
          }`} />
        </div>
      )}

      {/* Tags & Actions */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/60">
        <div className="flex flex-wrap gap-1.5">
          {issue.labels?.slice(0, 2).map((label, i) => (
            <span
              key={i}
              className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.02] text-zinc-400 border border-zinc-800 uppercase tracking-wider font-semibold"
            >
              {label}
            </span>
          ))}
        </div>
        
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-purple-400 transition-colors group/link"
        >
          View Issue
          <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};

// ── Upgrade card shown after the free preview matches ──
const UpgradeMatchCard = ({ moreCount, onUpgrade }) => (
  <div className="relative flex flex-col items-center justify-center text-center h-full min-h-[280px] bg-zinc-950/25 border border-purple-500/20 rounded-xl p-6 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/5 pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-11 h-11 mb-4 rounded-xl bg-purple-950/40 flex items-center justify-center border border-purple-500/30 text-purple-300">
        <Lock className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">
        {moreCount ? `${moreCount}+ more matches` : 'More matches'} locked
      </h3>
      <p className="text-xs text-zinc-400 mb-5 leading-relaxed max-w-[210px]">
        You're seeing your top 2 free matches. Unlock the full AI-ranked list and unlimited re-analysis.
      </p>
      <button
        onClick={onUpgrade}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded font-semibold hover:bg-zinc-200 transition-all text-xs cursor-pointer"
      >
        <Crown className="w-4 h-4" />
        Become a Supporter — $9/mo
      </button>
    </div>
  </div>
);

export default SmartMatchTab;
