import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Lock } from 'lucide-react';
import BadgeCard from './BadgeCard';
import BadgeModal from './BadgeModal';
import { BADGE_DEFINITIONS, checkEarnedBadges } from '../utils/badgeSystem';

const BadgesSection = ({ stats, contributions = [], username }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (stats) {
      const badges = checkEarnedBadges(stats, contributions);
      setEarnedBadges(badges);
    }
  }, [stats, contributions]);

  const allBadges = Object.values(BADGE_DEFINITIONS);
  const earnedBadgeIds = earnedBadges.map(b => b.id);
  
  const badgesWithStatus = allBadges.map(badge => ({
    ...badge,
    earned: earnedBadgeIds.includes(badge.id),
    earnedAt: earnedBadges.find(b => b.id === badge.id)?.earnedAt
  }));

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="bg-[#15161E] rounded-xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        
        {/* Progress Circle */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-white/5"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
              className="text-amber-400 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{completionPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0B0C10] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <p className="text-xl font-bold text-white">{earnedCount}</p>
          </div>
          <p className="text-[10px] text-gray-500">Earned</p>
        </div>
        
        <div className="bg-[#0B0C10] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="w-4 h-4 text-gray-500" />
            <p className="text-xl font-bold text-white">{totalCount - earnedCount}</p>
          </div>
          <p className="text-[10px] text-gray-500">Locked</p>
        </div>
        
        <div className="bg-[#0B0C10] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <p className="text-xl font-bold text-white">{completionPercentage}%</p>
          </div>
          <p className="text-[10px] text-gray-500">Complete</p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badgesWithStatus.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={badge.earned}
            onClick={() => handleBadgeClick(badge)}
          />
        ))}
      </div>

      {/* Empty State */}
      {earnedCount === 0 && (
        <div className="mt-6 p-6 bg-[#0B0C10] rounded-xl border border-white/5 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Award className="w-8 h-8 text-gray-600" />
          </div>
          <h4 className="text-white font-semibold mb-2">Start Your Journey</h4>
          <p className="text-sm text-gray-500 mb-4">
            Make your first contribution to unlock your first badge!
          </p>
        </div>
      )}

      {/* Badge Modal */}
      {showModal && selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          earned={selectedBadge.earned}
<<<<<<< HEAD
          username={username}
=======
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default BadgesSection;
