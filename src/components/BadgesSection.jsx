import React, { useState, useEffect, useMemo } from 'react';
import { Award, TrendingUp, Lock, ChevronRight } from 'lucide-react';
import BadgeCard from './BadgeCard';
import BadgeModal from './BadgeModal';
import { BADGE_DEFINITIONS, checkEarnedBadges, getNextBadgeToUnlock } from '../utils/badgeSystem';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'earned', label: 'Earned' },
  { key: 'locked', label: 'Locked' },
];

const BadgesSection = ({ stats, contributions = [], attestations = [], username }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (stats) {
      const badges = checkEarnedBadges(stats, contributions, attestations);
      setEarnedBadges(badges);
    }
  }, [stats, contributions, attestations]);

  const allBadges = useMemo(() => Object.values(BADGE_DEFINITIONS), []);
  const earnedBadgeIds = useMemo(() => earnedBadges.map(b => b.id), [earnedBadges]);

  const badgesWithStatus = useMemo(() =>
    allBadges.map(badge => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge.id),
      earnedAt: earnedBadges.find(b => b.id === badge.id)?.earnedAt
    })),
    [allBadges, earnedBadgeIds, earnedBadges]
  );

  // Filtered badges
  const filteredBadges = useMemo(() => {
    switch (activeFilter) {
      case 'earned':
        return badgesWithStatus.filter(b => b.earned);
      case 'locked':
        return badgesWithStatus.filter(b => !b.earned);
      default:
        // Show earned first, then locked
        return [
          ...badgesWithStatus.filter(b => b.earned),
          ...badgesWithStatus.filter(b => !b.earned)
        ];
    }
  }, [badgesWithStatus, activeFilter]);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Next badge to unlock
  const nextBadge = useMemo(
    () => stats ? getNextBadgeToUnlock(stats, contributions, attestations) : null,
    [stats, contributions, attestations]
  );

  return (
    <div className="bg-zinc-950/25 rounded-lg border border-zinc-800/60 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-400">
              <Award className="w-5 h-5 text-amber-400/90" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Achievements</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {earnedCount} of {totalCount} badges earned
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="3.5"
                fill="none"
                className="text-zinc-900"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="3.5"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPercentage / 100)}`}
                className="text-amber-500/80 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-white">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Next badge to unlock */}
        {nextBadge && earnedCount < totalCount && (
          <button
            onClick={() => handleBadgeClick({ ...nextBadge, earned: false })}
            className="mt-4 w-full flex items-center gap-3 p-3 bg-zinc-950/40 rounded border border-zinc-800/80 hover:border-zinc-700 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Next badge</p>
              <p className="text-xs text-zinc-300 font-semibold truncate mt-0.5">{nextBadge.name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-650 group-hover:text-white transition-colors flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-3.5 pb-1 flex gap-1 border-b border-zinc-800/40">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all'
            ? totalCount
            : tab.key === 'earned'
              ? earnedCount
              : totalCount - earnedCount;
          const isActive = activeFilter === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white/[0.04] text-white border border-zinc-800/80'
                  : 'text-zinc-500 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 font-mono ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Badge Grid */}
      <div className="p-5 pt-3">
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={badge.earned}
                onClick={() => handleBadgeClick(badge)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-center">
              {activeFilter === 'earned' ? (
                <Award className="w-5 h-5 text-zinc-650" />
              ) : (
                <Lock className="w-5 h-5 text-zinc-650" />
              )}
            </div>
            <p className="text-xs text-zinc-550">
              {activeFilter === 'earned'
                ? 'No badges earned yet. Start contributing!'
                : 'All badges have been unlocked! 🎉'}
            </p>
          </div>
        )}
      </div>

      {/* Empty State for no contributions */}
      {earnedCount === 0 && activeFilter === 'all' && (
        <div className="px-5 pb-5">
          <div className="p-4 bg-zinc-950/20 rounded border border-zinc-800/60 text-center">
            <Award className="w-6 h-6 text-amber-500/60 mx-auto mb-2" />
            <h4 className="text-white font-bold mb-0.5 text-xs uppercase tracking-wider">Start Your Journey</h4>
            <p className="text-[10px] text-zinc-500">
              Make your first contribution to unlock your first badge!
            </p>
          </div>
        </div>
      )}

      {/* Badge Modal */}
      {showModal && selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          earned={selectedBadge.earned}
          username={username}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default BadgesSection;
