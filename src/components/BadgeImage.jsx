import React from 'react';
import { Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, Award } from 'lucide-react';

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

// Rarity color schemes
const RARITY_COLORS = {
  common: {
    bg: 'from-gray-600 to-gray-700',
    border: 'border-gray-500',
    glow: 'shadow-gray-500/50'
  },
  uncommon: {
    bg: 'from-green-600 to-green-700',
    border: 'border-green-500',
    glow: 'shadow-green-500/50'
  },
  rare: {
    bg: 'from-blue-600 to-blue-700',
    border: 'border-blue-500',
    glow: 'shadow-blue-500/50'
  },
  epic: {
    bg: 'from-purple-600 to-purple-700',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/50'
  },
  legendary: {
    bg: 'from-amber-500 via-yellow-500 to-amber-600',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-500/50'
  }
};

const BadgeImage = ({ badge, size = 'large', showDetails = true }) => {
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;
  const colors = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;
  
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  const iconSizes = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} relative`} id={`badge-${badge.id}`}>
      {/* Badge Container */}
      <div className="w-full h-full relative">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-full blur-2xl opacity-50 ${colors.glow}`} />
        
        {/* Main Badge Circle */}
        <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${colors.bg} border-4 ${colors.border} shadow-2xl ${colors.glow} flex items-center justify-center overflow-hidden`}>
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
          
          {/* Legendary Sparkles */}
          {badge.rarity === 'legendary' && (
            <>
              <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          
          {/* Icon */}
          <BadgeIcon className={`${iconSizes[size]} text-white drop-shadow-lg`} />
          
          {/* Rarity Ring */}
          <div className={`absolute inset-0 rounded-full border-2 ${colors.border} opacity-50`} />
        </div>

        {/* Badge Details */}
        {showDetails && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-full text-center">
            <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
              {badge.name}
            </h3>
            <p className={`text-xs font-semibold uppercase tracking-wider ${colors.border.replace('border-', 'text-')}`}>
              {badge.rarity}
            </p>
          </div>
        )}
      </div>

      {/* Earned Date Badge */}
      {badge.earnedAt && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
          ✓ Earned
        </div>
      )}
    </div>
  );
};

export default BadgeImage;
