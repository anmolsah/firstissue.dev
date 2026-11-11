import React, { useState, useEffect, useMemo } from 'react';
import { Award, Lock, ChevronRight } from 'lucide-react';
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
  const earnedBadgeIds = useMemo(() => earnedBadges.map((b) => b.id), [earnedBadges]);

  const badgesWithStatus = useMemo(
    () =>
      allBadges.map((badge) => ({
        ...badge,
        earned: earnedBadgeIds.includes(badge.id),
        earnedAt: earnedBadges.find((b) => b.id === badge.id)?.earnedAt,
      })),
    [allBadges, earnedBadgeIds, earnedBadges]
  );

  const filteredBadges = useMemo(() => {
    switch (activeFilter) {
      case 'earned':
        return badgesWithStatus.filter((b) => b.earned);
      case 'locked':
        return badgesWithStatus.filter((b) => !b.earned);
      default:
        return [
          ...badgesWithStatus.filter((b) => b.earned),
          ...badgesWithStatus.filter((b) => !b.earned),
        ];
    }
  }, [badgesWithStatus, activeFilter]);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const nextBadge = useMemo(
    () => (stats ? getNextBadgeToUnlock(stats, contributions, attestations) : null),
    [stats, contributions, attestations]
  );

  return (
    <div className="bg-[#141518] rounded-[4px] border border-[#22242A] overflow-hidden">
      <div className="p-5 border-b border-[#22242A]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#17181B] border border-[#2B2E36] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#DAFA9C]" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold text-[#F4F4F0] uppercase tracking-wider">
                Achievements
              </h3>
              <p className="text-xs text-[#A8ADB6] mt-0.5 font-mono tabular-nums">
                {earnedCount} of {totalCount} badges earned
              </p>
            </div>
          </div>

          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#22242A"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#DAFA9C"
                strokeWidth="3.5"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPercentage / 100)}`}
                className="transition-all duration-700"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-mono font-semibold text-[#F4F4F0] tabular-nums">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {nextBadge && earnedCount < totalCount && (
          <button
            type="button"
            onClick={() => handleBadgeClick({ ...nextBadge, earned: false })}
            className="mt-4 w-full flex items-center gap-3 p-3 bg-[#0B0C0E] rounded-[4px] border border-[#22242A] hover:border-[#2B2E36] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[4px] bg-[#17181B] border border-[#2B2E36] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#8C929C]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[11px] text-[#8C929C] font-mono uppercase tracking-wider">
                Next Milestone
              </p>
              <p className="text-xs text-[#F4F4F0] font-semibold truncate mt-0.5">
                {nextBadge.name}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C929C] group-hover:text-[#DAFA9C] transition-colors shrink-0" />
          </button>
        )}
      </div>

      <div className="px-5 pt-3 pb-1 flex gap-1.5 border-b border-[#22242A] bg-[#0F0F0F]">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? totalCount
              : tab.key === 'earned'
              ? earnedCount
              : totalCount - earnedCount;
          const isActive = activeFilter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#17181B] text-[#F4F4F0] border border-[#2B2E36]'
                  : 'text-[#8C929C] hover:text-[#F4F4F0] border border-transparent'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 tabular-nums ${
                  isActive ? 'text-[#DAFA9C]' : 'text-[#8C929C]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
            <div className="w-10 h-10 mx-auto mb-3 rounded-[4px] bg-[#17181B] border border-[#2B2E36] flex items-center justify-center">
              {activeFilter === 'earned' ? (
                <Award className="w-5 h-5 text-[#8C929C]" />
              ) : (
                <Lock className="w-5 h-5 text-[#8C929C]" />
              )}
            </div>
            <p className="text-xs text-[#A8ADB6]">
              {activeFilter === 'earned'
                ? 'No badges earned yet. Submit a pull request to unlock your first milestone.'
                : 'All milestone badges unlocked.'}
            </p>
          </div>
        )}
      </div>

      {earnedCount === 0 && activeFilter === 'all' && (
        <div className="px-5 pb-5">
          <div className="p-4 bg-[#0B0C0E] rounded-[4px] border border-[#22242A] text-center">
            <Award className="w-5 h-5 text-[#DAFA9C] mx-auto mb-2" />
            <h4 className="text-[#F4F4F0] font-semibold mb-1 text-xs uppercase tracking-wider">
              First Milestone Waiting
            </h4>
            <p className="text-xs text-[#A8ADB6]">
              Start logging contributions to track verified achievements.
            </p>
          </div>
        </div>
      )}

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
