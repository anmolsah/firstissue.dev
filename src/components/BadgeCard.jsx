import React from 'react';
import { Lock, CheckCircle, Award, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

// Badge icon mapping
const BADGE_ICONS = {
  'first-contribution': Star,
  'first-merge': GitMerge,
  'contributor-5': Target,
  'contributor-10': Zap,
  'contributor-25': Trophy,
  'contributor-50': Crown,
  'merge-master-5': GitMerge,
  'merge-master-10': Trophy,
  'streak-7': Flame,
  'streak-30': Flame,
  'perfect-score': Crown,
  'early-adopter': Sparkles
};

const BadgeCard = ({ badge, earned = false, onClick }) => {
  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;

  // Rarity accent colors for the icon ring
  const rarityAccent = {
    common: 'ring-gray-500/30',
    uncommon: 'ring-green-500/40',
    rare: 'ring-blue-500/40',
    epic: 'ring-purple-500/40',
    legendary: 'ring-amber-400/50'
  };

  const rarityGlow = {
    common: '',
    uncommon: 'shadow-[0_0_15px_rgba(34,197,94,0.15)]',
    rare: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    epic: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    legendary: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]'
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer group text-left w-full ${
        earned
          ? `bg-[#15161E] ${rarityInfo.borderColor} hover:border-white/20 ${rarityGlow[badge.rarity] || ''}`
          : 'bg-[#0e0f15] border-white/[0.03] hover:border-white/10'
      }`}
      aria-label={`${badge.name} badge — ${earned ? 'Earned' : 'Locked'}`}
    >
      {/* Badge Icon Container */}
      <div className="relative mb-3">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center ring-2 transition-transform duration-200 group-hover:scale-105 ${
            earned
              ? `${rarityInfo.bgColor} ${rarityAccent[badge.rarity] || 'ring-gray-500/30'}`
              : 'bg-white/[0.03] ring-white/[0.05]'
          }`}
        >
          {earned ? (
            <BadgeIcon className={`w-6 h-6 ${rarityInfo.color}`} />
          ) : (
            <Lock className="w-5 h-5 text-gray-600" />
          )}
        </div>

        {/* Earned checkmark */}
        {earned && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#15161E]">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center w-full min-w-0">
        <h3
          className={`text-xs font-semibold mb-0.5 truncate ${
            earned ? 'text-white' : 'text-gray-500'
          }`}
        >
          {badge.name}
        </h3>

        {/* Rarity dot */}
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              earned
                ? rarityInfo.color.replace('text-', 'bg-')
                : 'bg-gray-700'
            }`}
          />
          <span className={`text-[10px] ${earned ? rarityInfo.color : 'text-gray-600'}`}>
            {rarityInfo.label}
          </span>
        </div>
      </div>

      {/* Subtle shine on hover for earned badges */}
      {earned && <div className="badge-card-shine" />}
    </button>
  );
};

export default BadgeCard;
