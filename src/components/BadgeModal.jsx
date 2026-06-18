import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, CheckCircle, Lock, Share2, Award, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, ExternalLink } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';
import BadgeShareModal from './BadgeShareModal';
import FirstContributionBadge from './badges/FirstContributionBadge';
import FirstMergeBadge from './badges/FirstMergeBadge';
import ActiveContributorBadge from './badges/ActiveContributorBadge';
import DedicatedContributorBadge from './badges/DedicatedContributorBadge';
import ProlificContributorBadge from './badges/ProlificContributorBadge';
import EliteContributorBadge from './badges/EliteContributorBadge';
import MergeMasterBadge from './badges/MergeMasterBadge';
import EarlyAdopterBadge from './badges/EarlyAdopterBadge';
import MergeChampionBadge from './badges/MergeChampionBadge';
import WeekWarriorBadge from './badges/WeekWarriorBadge';
import MonthMasterBadge from './badges/MonthMasterBadge';
import PerfectScoreBadge from './badges/PerfectScoreBadge';
import VerifiedContributorBadge from './badges/VerifiedContributorBadge';
import ImpactMakerBadge from './badges/ImpactMakerBadge';

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

// Rarity gradient configs for the large showcase icon
const RARITY_GRADIENTS = {
  common: {
    ring: 'from-gray-400 to-gray-600',
    glow: 'shadow-[0_0_60px_rgba(156,163,175,0.2)]',
    bg: 'from-gray-500/20 to-gray-600/10',
  },
  uncommon: {
    ring: 'from-green-400 to-emerald-600',
    glow: 'shadow-[0_0_60px_rgba(34,197,94,0.25)]',
    bg: 'from-green-500/20 to-emerald-600/10',
  },
  rare: {
    ring: 'from-blue-400 to-indigo-600',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.3)]',
    bg: 'from-blue-500/20 to-indigo-600/10',
  },
  epic: {
    ring: 'from-purple-400 to-violet-600',
    glow: 'shadow-[0_0_60px_rgba(168,85,247,0.35)]',
    bg: 'from-purple-500/20 to-violet-600/10',
  },
  legendary: {
    ring: 'from-amber-300 via-yellow-400 to-orange-500',
    glow: 'shadow-[0_0_80px_rgba(245,158,11,0.4)]',
    bg: 'from-amber-500/20 to-yellow-600/10',
  }
};

const BadgeModal = ({ badge, earned, onClose, username }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;
  const gradients = RARITY_GRADIENTS[badge.rarity] || RARITY_GRADIENTS.common;

  // Close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  // Keyboard escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!badge) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isClosing ? 'animate-badge-modal-out' : 'animate-badge-modal-backdrop'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${badge.name} badge details`}
      >
        {/* Modal Content */}
        <div
          className={`relative w-full max-w-md bg-zinc-950 rounded-lg border border-zinc-800/80 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl ${
            isClosing ? 'animate-badge-modal-out' : 'animate-badge-modal-in'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Badge Showcase Area ── */}
          <div className="relative pt-10 pb-8 px-6 flex flex-col items-center">
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${gradients.bg} to-transparent opacity-60`} />

            {/* Large badge icon with rarity ring */}
            <div className="relative z-10 animate-badge-float">
              {/* Glow ring */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradients.ring} blur-xl opacity-30 animate-badge-glow`} />

              {/* Main icon circle */}
              <div className={`relative w-28 h-28 sm:w-30 sm:h-30 rounded-full flex items-center justify-center ${gradients.glow}`}>
                {/* Gradient border ring */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradients.ring} p-[2px]`}>
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                    {earned ? (
                      badge.id === 'first-contribution' ? (
                        <FirstContributionBadge earned={earned} variant="raw" />
                      ) : badge.id === 'first-merge' ? (
                        <FirstMergeBadge earned={earned} variant="raw" />
                      ) : badge.id === 'contributor-5' ? (
                        <ActiveContributorBadge earned={earned} variant="raw" />
                      ) : badge.id === 'contributor-10' ? (
                        <DedicatedContributorBadge earned={earned} variant="raw" />
                      ) : badge.id === 'contributor-25' ? (
                        <ProlificContributorBadge earned={earned} variant="raw" />
                      ) : badge.id === 'contributor-50' ? (
                        <EliteContributorBadge earned={earned} variant="raw" />
                      ) : badge.id === 'merge-master-5' ? (
                        <MergeMasterBadge earned={earned} variant="raw" />
                      ) : badge.id === 'early-adopter' ? (
                        <EarlyAdopterBadge earned={earned} variant="raw" />
                      ) : badge.id === 'merge-master-10' ? (
                        <MergeChampionBadge earned={earned} variant="raw" />
                      ) : badge.id === 'streak-7' ? (
                        <WeekWarriorBadge earned={earned} variant="raw" />
                      ) : badge.id === 'streak-30' ? (
                        <MonthMasterBadge earned={earned} variant="raw" />
                      ) : badge.id === 'perfect-score' ? (
                        <PerfectScoreBadge earned={earned} variant="raw" />
                      ) : badge.id === 'pow-1' ? (
                        <VerifiedContributorBadge earned={earned} variant="raw" />
                      ) : badge.id === 'pow-10' ? (
                        <ImpactMakerBadge earned={earned} variant="raw" />
                      ) : (
                        <BadgeIcon className={`w-11 h-11 ${rarityInfo.color}`} />
                      )
                    ) : (
                      <Lock className="w-10 h-10 text-zinc-600" />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Badge Name */}
            <h2 className={`relative z-10 mt-5 text-xl sm:text-2xl font-bold text-center tracking-tight ${
              earned ? 'text-white' : 'text-zinc-500'
            }`}>
              {badge.name}
            </h2>

            {/* Rarity Pill */}
            <div className={`relative z-10 mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-current ${earned ? 'animate-badge-glow' : ''}`} />
              {rarityInfo.label}
            </div>
          </div>

          {/* ── Content Area ── */}
          <div className="px-6 pb-6 space-y-4">
            {/* Description */}
            <p className="text-xs text-zinc-400 text-center leading-relaxed">
              {badge.description}
            </p>

            {/* How to Earn */}
            <div className="bg-zinc-900/30 rounded border border-zinc-800/60 p-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                How to Earn
              </h3>
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  earned ? 'bg-emerald-500/20' : 'bg-zinc-800'
                }`}>
                  {earned ? (
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  )}
                </div>
                <p className={`text-xs ${earned ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {badge.criteria.narrative}
                </p>
              </div>
            </div>

            {/* Earned Date */}
            {earned && badge.earnedAt && (
              <div className="flex items-center gap-3 p-3 bg-emerald-950/10 border border-emerald-900/30 rounded">
                <Calendar className="w-4 h-4 text-emerald-450 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider">Earned</p>
                  <p className="text-xs text-zinc-450 mt-0.5">
                    {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Not earned hint */}
            {!earned && (
              <div className="flex items-center gap-3 p-3 bg-zinc-950/20 border border-zinc-850/60 rounded">
                <Lock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                <p className="text-xs text-zinc-550">
                  Keep contributing to unlock this badge!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {earned && (
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Badge
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-zinc-650 uppercase font-bold tracking-wider">Issued by</p>
                <p className="text-xs text-zinc-500 font-medium">{badge.issuer.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <BadgeShareModal
          badge={badge}
          username={username}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default BadgeModal;
