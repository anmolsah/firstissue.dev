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

const BadgesSection = ({ stats, contributions = [], username }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (stats) {
      const badges = checkEarnedBadges(stats, contributions);
      setEarnedBadges(badges);
    }
  }, [stats, contributions]);

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
    () => stats ? getNextBadgeToUnlock(stats, contributions) : null,
    [stats, contributions]
  );

  return (
    <div className="bg-[#15161E] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
              <p className="text-sm text-gray-500">
                {earnedCount} of {totalCount} badges earned
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28" cy="28" r="24"
                stroke="currentColor" strokeWidth="3" fill="none"
                className="text-white/5"
              />
              <circle
                cx="28" cy="28" r="24"
                stroke="currentColor" strokeWidth="3" fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPercentage / 100)}`}
                className="text-amber-400 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Next badge to unlock */}
        {nextBadge && earnedCount < totalCount && (
          <button
            onClick={() => handleBadgeClick({ ...nextBadge, earned: false })}
            className="mt-4 w-full flex items-center gap-3 p-3 bg-[#0B0C10] rounded-lg border border-white/5 hover:border-white/10 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs text-gray-500">Next badge</p>
              <p className="text-sm text-gray-300 font-medium truncate">{nextBadge.name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-5 sm:px-6 pt-4 pb-2 flex gap-1">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all'
            ? totalCount
            : tab.key === 'earned'
              ? earnedCount
              : totalCount - earnedCount;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${activeFilter === tab.key ? 'text-gray-300' : 'text-gray-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Badge Grid */}
      <div className="p-5 sm:p-6 pt-3">
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
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              {activeFilter === 'earned' ? (
                <Award className="w-6 h-6 text-gray-600" />
              ) : (
                <Lock className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {activeFilter === 'earned'
                ? 'No badges earned yet. Start contributing!'
                : 'All badges have been unlocked! 🎉'}
            </p>
          </div>
        )}
      </div>

      {/* Empty State for no contributions */}
      {earnedCount === 0 && activeFilter === 'all' && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="p-5 bg-gradient-to-br from-amber-500/5 to-transparent rounded-xl border border-amber-500/10 text-center">
            <Award className="w-8 h-8 text-amber-400/60 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-1 text-sm">Start Your Journey</h4>
            <p className="text-xs text-gray-500">
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
