import React, { useEffect, useState, useCallback } from 'react';
import { Award, X, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, Brain } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

const BADGE_ICONS = {
  'first-contribution': Star,
  'first-merge': GitMerge,
  'contributor-5': Target,
  'contributor-10': Zap,
  'contributor-25': Trophy,
  'contributor-50': Crown,
  'contributor-100': Crown,
  'merge-master-5': GitMerge,
  'merge-master-10': Trophy,
  'merge-master-25': Trophy,
  'streak-7': Flame,
  'streak-30': Flame,
  'perfect-score': Crown,
  'early-adopter': Sparkles,
  'firstmate-mentor': Brain,
};

const BadgeUnlockedNotification = ({ badge, onClose }) => {
  const [phase, setPhase] = useState('entering');
  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;

  const handleDismiss = useCallback(() => {
    setPhase('exiting');
    setTimeout(onClose, 250);
  }, [onClose]);

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), 50);
    const closeTimer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [handleDismiss]);

  const animClass =
    phase === 'entering'
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
      <div className="relative bg-[#17181B] border border-[#2B2E36] rounded-[4px] p-4 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#DAFA9C]" />

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-[#8C929C] hover:text-[#F4F4F0] transition-colors rounded-[4px] hover:bg-[#1C1E23]"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 rounded-[4px] flex items-center justify-center ${rarityInfo.bgColor} border ${rarityInfo.borderColor}`}
            >
              <BadgeIcon className={`w-6 h-6 ${rarityInfo.color}`} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-semibold text-[#DAFA9C] uppercase tracking-wider mb-0.5">
              Badge Unlocked
            </p>
            <h4 className="text-[#F4F4F0] font-semibold text-sm mb-0.5 truncate">
              {badge.name}
            </h4>
            <p className="text-xs text-[#A8ADB6] line-clamp-2">{badge.description}</p>

            <div
              className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-[4px] text-[11px] font-mono ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}
            >
              {rarityInfo.label}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22242A]">
          <div className="h-full bg-[#DAFA9C] animate-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default BadgeUnlockedNotification;
