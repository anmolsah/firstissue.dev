import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, CheckCircle, Lock, Share2, Award, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, ExternalLink } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';
import BadgeShareModal from './BadgeShareModal';

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
          className={`relative w-full max-w-md bg-[#12131a] rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl ${
            isClosing ? 'animate-badge-modal-out' : 'animate-badge-modal-in'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
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
              <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center ${gradients.glow}`}>
                {/* Gradient border ring */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradients.ring} p-[3px]`}>
                  <div className="w-full h-full rounded-full bg-[#12131a] flex items-center justify-center">
                    {earned ? (
                      <BadgeIcon className={`w-12 h-12 sm:w-14 sm:h-14 ${rarityInfo.color}`} />
                    ) : (
                      <Lock className="w-12 h-12 sm:w-14 sm:h-14 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Earned checkmark */}
              {earned && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-3 border-[#12131a] shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Badge Name */}
            <h2 className={`relative z-10 mt-5 text-2xl sm:text-3xl font-bold text-center ${
              earned ? 'text-white' : 'text-gray-400'
            }`}>
              {badge.name}
            </h2>

            {/* Rarity Pill */}
            <div className={`relative z-10 mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
              <span className={`w-2 h-2 rounded-full bg-current ${earned ? 'animate-badge-glow' : ''}`} />
              {rarityInfo.label}
            </div>
          </div>

          {/* ── Content Area ── */}
          <div className="px-6 pb-6 space-y-4">
            {/* Description */}
            <p className="text-sm text-gray-400 text-center leading-relaxed">
              {badge.description}
            </p>

            {/* How to Earn */}
            <div className="bg-[#0B0C10] rounded-xl p-4 border border-white/5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                How to Earn
              </h3>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  earned ? 'bg-emerald-500/20' : 'bg-white/5'
                }`}>
                  {earned ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                  )}
                </div>
                <p className={`text-sm ${earned ? 'text-gray-300' : 'text-gray-500'}`}>
                  {badge.criteria.narrative}
                </p>
              </div>
            </div>

            {/* Earned Date */}
            {earned && badge.earnedAt && (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-emerald-400 font-medium">Earned</p>
                  <p className="text-xs text-gray-400">
                    {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Not earned hint */}
            {!earned && (
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  Keep contributing to unlock this badge!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {earned && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-600">Issued by</p>
                <p className="text-xs text-gray-400">{badge.issuer.name}</p>
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
