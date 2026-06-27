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

const ProgressTimer = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  
  const statuses = [
    "Scanning your GitHub repositories...",
    "Analyzing tech stack and expertise...",
    "Searching for diverse issues...",
    "Filtering for quality and freshness...",
    "Generating personalized matches...",
    "Finalizing your AI-curated list...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 98) return 98;
        const diff = Math.random() * 5;
        return Math.min(oldProgress + diff, 98);
      });
    }, 300);

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4 border border-white/5 relative">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[length:200%_100%] animate-shimmer transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-purple-300/80 uppercase tracking-widest min-w-[200px]">
            {statuses[statusIndex]}
          </span>
        </div>
        <span className="text-xl font-black text-white italic tracking-tighter">
          {Math.floor(progress)}%
        </span>
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
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
        {/* Abstract Neural Scanner */}
        <div className="relative mb-12">
          {/* Main Ring */}
          <div className="w-32 h-32 rounded-full border-2 border-white/5 relative flex items-center justify-center">
            {/* Spinning Scanner Line */}
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500/50 animate-spin" style={{ animationDuration: '2s' }} />
            
            {/* Inner Glowing Core */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-white/10 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]">
              <BrainCircuit className="w-10 h-10 text-purple-400/80" />
            </div>

            {/* Orbiting particles (simplified) */}
            <div className="absolute -inset-4 border border-white/5 rounded-full animate-reverse-spin" style={{ animationDuration: '4s' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
          </div>
          
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10" />
        </div>

        <div className="text-center mb-10 space-y-3">
          <h3 className="text-xl font-bold text-white tracking-tight">AI Matching in Progress</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Comparing your GitHub contributions against thousands of open issues to find the perfect fit.
          </p>
        </div>

        <ProgressTimer />
      </div>
    );
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
