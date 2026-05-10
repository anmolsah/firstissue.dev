import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupporter } from '../contexts/SupporterContext';
import { useSmartMatch } from '../hooks/useSmartMatch';
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
} from 'lucide-react';

const ProgressTimer = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  
  const statuses = [
    "Scanning your GitHub repositories...",
    "Analyzing tech stack and expertise...",
    "Evaluating issue difficulty levels...",
    "Mapping repositories to your profile...",
    "Generating personalized matches...",
    "Finalizing your AI-curated list..."
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

const SmartMatchTab = ({ username, token, bookmarkedIssues, onToggleBookmark }) => {
  const navigate = useNavigate();
  const { isSupporter, loading: supporterLoading } = useSupporter();
  const { matches, userProfile, loading, error, fetchMatches, refresh, lastAnalyzedAt, isCached } = useSmartMatch(username, token);

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

  // ── Locked State for non-supporters ──
  if (!supporterLoading && !isSupporter) {
    return (
      <div className="relative">
        {/* Blurred preview */}
        <div className="filter blur-sm pointer-events-none opacity-40">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#15161E] border border-white/5 rounded-xl p-6 h-[200px]">
                <div className="w-3/4 h-5 bg-white/5 rounded mb-3" />
                <div className="w-full h-3 bg-white/5 rounded mb-2" />
                <div className="w-2/3 h-3 bg-white/5 rounded mb-6" />
                <div className="flex gap-2">
                  <div className="w-16 h-5 bg-purple-500/10 rounded-full" />
                  <div className="w-20 h-5 bg-blue-500/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#12131a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              AI Smart Matching
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Get personalized issue recommendations powered by AI that analyzes your GitHub profile,
              tech stack, and experience level.
            </p>

            <div className="space-y-3 mb-6 text-left">
              {[
                'AI-analyzed tech stack matching',
                'Personalized difficulty scoring',
                'Smart issue recommendations',
                'Priority support',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/support')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              <Crown className="w-5 h-5" />
              Become a Supporter — $9/mo
            </button>
          </div>
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
      {/* Profile Summary + Re-analyze */}
      {userProfile && (
        <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/10 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">Your Tech Profile</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {userProfile.topLanguages.map((lang) => (
                    <span
                      key={lang.language}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {lang.language}
                    </span>
                  ))}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {userProfile.experienceLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
              {/* Cache info */}
              {lastAnalyzedAt && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(lastAnalyzedAt)}
                </span>
              )}
              {/* Re-analyze button */}
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 hover:text-purple-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Re-analyze your profile and find new matches"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyzing...' : 'Re-analyze'}
              </button>
            </div>
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
        </div>
      ) : (
        <div className="text-center py-20">
          <Sparkles className="w-12 h-12 text-purple-400/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No matches yet</h3>
          <p className="text-sm text-gray-500 mb-6">Click the button below to analyze your profile and find matching issues.</p>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Analyzing...' : 'Analyze My Profile'}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Smart Match Issue Card ──
const SmartMatchCard = ({ issue, isBookmarked, onToggleBookmark }) => {
  const matchPercentage = Math.round((issue.matchScore || 0) * 100);

  return (
    <div className="group flex flex-col h-full bg-[#0B0C10] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {/* Card Header: AI Match & Bookmark */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 w-fit">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">AI Match</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[11px] font-bold text-purple-400">{matchPercentage}%</span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark?.();
          }}
          className={`p-2 rounded-xl transition-all duration-200 ${
            isBookmarked
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      {/* Repo Metadata */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
          <img 
            src={`https://github.com/${issue.repo.split('/')[0]}.png`} 
            alt="" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 truncate">{issue.repo}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-4 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-purple-400 transition-colors">
        <a href={issue.url} target="_blank" rel="noopener noreferrer">
          {issue.title}
        </a>
      </h3>

      {/* AI Insight Section */}
      {issue.matchReason && (
        <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Why this match?
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            {issue.matchReason}
          </p>
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/30" />
        </div>
      )}

      {/* Tags & Actions */}
      <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
        <div className="flex flex-wrap gap-2">
          {issue.labels?.slice(0, 2).map((label, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10 uppercase tracking-tighter"
            >
              {label}
            </span>
          ))}
        </div>
        
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-white hover:text-purple-400 transition-colors group/link"
        >
          View Issue
          <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default SmartMatchTab;
