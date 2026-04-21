import React, { useEffect, useState, useCallback } from 'react';
import { Award, X, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge } from 'lucide-react';
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

const BadgeUnlockedNotification = ({ badge, onClose }) => {
  const [phase, setPhase] = useState('entering'); // 'entering' | 'visible' | 'exiting'
  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;

  const handleDismiss = useCallback(() => {
    setPhase('exiting');
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setPhase('visible'), 50);

    // Auto close after 6 seconds
    const closeTimer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [handleDismiss]);

  const animClass = phase === 'entering'
    ? 'translate-x-full opacity-0 scale-95'
    : phase === 'exiting'
      ? 'animate-notification-out'
      : 'animate-notification-in';

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full ${animClass}`}
      role="alert"
      aria-live="polite"
    >
      <div className="relative bg-[#1a1b26] border border-white/10 rounded-xl p-4 shadow-2xl overflow-hidden">
        {/* Subtle rarity glow along top edge */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
          badge.rarity === 'legendary' ? 'from-amber-400 via-yellow-400 to-orange-400' :
          badge.rarity === 'epic' ? 'from-purple-400 via-violet-400 to-purple-400' :
          badge.rarity === 'rare' ? 'from-blue-400 via-indigo-400 to-blue-400' :
          badge.rarity === 'uncommon' ? 'from-green-400 via-emerald-400 to-green-400' :
          'from-gray-400 via-gray-300 to-gray-400'
        }`} />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors rounded-md hover:bg-white/5"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          {/* Badge Icon */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${rarityInfo.bgColor} border ${rarityInfo.borderColor}`}>
              <BadgeIcon className={`w-7 h-7 ${rarityInfo.color}`} />
            </div>
            {/* Small checkmark */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#1a1b26]">
              <span className="text-white text-[10px]">✓</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs font-bold text-amber-400 mb-1">
              🎉 Badge Unlocked!
            </p>
            <h4 className="text-white font-semibold text-sm mb-0.5 truncate">{badge.name}</h4>
            <p className="text-xs text-gray-400 line-clamp-2">{badge.description}</p>

            {/* Rarity */}
            <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {rarityInfo.label}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default BadgeUnlockedNotification;
