import React, { useEffect } from 'react';
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
} from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Analyzing Your Profile</h3>
        <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
          AI is scanning your GitHub repos, languages, and contribution history to find perfect matches...
        </p>
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
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

  const getMatchColor = (score) => {
    if (score >= 0.8) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 0.6) return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (score >= 0.4) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' };
  };

  const colors = getMatchColor(issue.matchScore);

  return (
    <div className="bg-[#15161E] border border-white/5 rounded-xl p-6 hover:border-purple-500/20 transition-all duration-300 group flex flex-col h-full relative">
      {/* Match Score Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
          <Sparkles className="w-3 h-3" />
          {matchPercentage}% Match
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark?.();
          }}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-transparent text-gray-600 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Repo */}
      <a
        href={issue.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-purple-400 font-mono transition-colors mb-2"
      >
        {issue.repo}
      </a>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-100 mb-2 leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
        <a href={issue.url} target="_blank" rel="noopener noreferrer">
          {issue.title}
        </a>
      </h3>

      {/* AI Reason */}
      {issue.matchReason && (
        <p className="text-xs text-purple-300/70 mb-3 italic line-clamp-2 flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {issue.matchReason}
        </p>
      )}

      {/* Labels */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-white/5">
        {issue.labels?.slice(0, 3).map((label, i) => (
          <span
            key={i}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5"
          >
            {label.length > 18 ? label.substring(0, 18) + '...' : label}
          </span>
        ))}
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-gray-500 hover:text-purple-400 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default SmartMatchTab;
