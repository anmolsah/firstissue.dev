import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, CheckCircle, Lock, Share2, Award, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, Brain } from 'lucide-react';
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
import CenturionBadge from './badges/CenturionBadge';
import MergeLegendBadge from './badges/MergeLegendBadge';
import FirstMateMentorBadge from './badges/FirstMateMentorBadge';

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

const BadgeModal = ({ badge, earned, onClose, username }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!badge) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${badge.name} badge details`}
      >
        <div
          className="relative w-full max-w-md bg-[#141518] rounded-[4px] border border-[#2B2E36] overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors z-10"
            aria-label="Close badge details"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative pt-10 pb-6 px-6 flex flex-col items-center bg-[#0F0F0F] border-b border-[#22242A]">
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center bg-[#141518] border-2 ${rarityInfo.borderColor}`}>
              {earned ? (
                badge.id === 'first-contribution' ? <FirstContributionBadge earned={earned} variant="raw" /> :
                badge.id === 'first-merge' ? <FirstMergeBadge earned={earned} variant="raw" /> :
                badge.id === 'contributor-5' ? <ActiveContributorBadge earned={earned} variant="raw" /> :
                badge.id === 'contributor-10' ? <DedicatedContributorBadge earned={earned} variant="raw" /> :
                badge.id === 'contributor-25' ? <ProlificContributorBadge earned={earned} variant="raw" /> :
                badge.id === 'contributor-50' ? <EliteContributorBadge earned={earned} variant="raw" /> :
                badge.id === 'contributor-100' ? <CenturionBadge earned={earned} variant="raw" /> :
                badge.id === 'merge-master-5' ? <MergeMasterBadge earned={earned} variant="raw" /> :
                badge.id === 'early-adopter' ? <EarlyAdopterBadge earned={earned} variant="raw" /> :
                badge.id === 'merge-master-10' ? <MergeChampionBadge earned={earned} variant="raw" /> :
                badge.id === 'merge-master-25' ? <MergeLegendBadge earned={earned} variant="raw" /> :
                badge.id === 'streak-7' ? <WeekWarriorBadge earned={earned} variant="raw" /> :
                badge.id === 'streak-30' ? <MonthMasterBadge earned={earned} variant="raw" /> :
                badge.id === 'perfect-score' ? <PerfectScoreBadge earned={earned} variant="raw" /> :
                badge.id === 'pow-1' ? <VerifiedContributorBadge earned={earned} variant="raw" /> :
                badge.id === 'pow-10' ? <ImpactMakerBadge earned={earned} variant="raw" /> :
                badge.id === 'firstmate-mentor' ? <FirstMateMentorBadge earned={earned} variant="raw" /> :
                <BadgeIcon className={`w-10 h-10 ${rarityInfo.color}`} />
              ) : (
                <Lock className="w-9 h-9 text-[#8C929C]" />
              )}
            </div>

            <h2 className={`mt-5 text-xl font-semibold text-center tracking-tight ${
              earned ? 'text-[#F4F4F0]' : 'text-[#8C929C]'
            }`}>
              {badge.name}
            </h2>

            <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-xs font-mono uppercase tracking-wider ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
              {rarityInfo.label}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-[#A8ADB6] text-center leading-relaxed">
              {badge.description}
            </p>

            <div className="bg-[#0B0C0E] rounded-[4px] border border-[#22242A] p-4">
              <h3 className="text-xs font-mono text-[#8C929C] uppercase tracking-wider mb-2">
                Criteria
              </h3>
              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${
                  earned ? 'bg-[#34D399]/20' : 'bg-[#17181B]'
                }`}>
                  {earned ? (
                    <CheckCircle className="w-3 h-3 text-[#34D399]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8C929C]" />
                  )}
                </div>
                <p className={`text-xs ${earned ? 'text-[#F4F4F0]' : 'text-[#A8ADB6]'}`}>
                  {badge.criteria.narrative}
                </p>
              </div>
            </div>

            {earned && badge.earnedAt && (
              <div className="flex items-center gap-3 p-3 bg-[#34D399]/10 border border-[#34D399]/30 rounded-[4px]">
                <Calendar className="w-4 h-4 text-[#34D399] shrink-0" />
                <div>
                  <p className="text-xs font-mono text-[#34D399] uppercase tracking-wider">Earned</p>
                  <p className="text-xs text-[#F4F4F0] mt-0.5 tabular-nums">
                    {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {!earned && (
              <div className="flex items-center gap-3 p-3 bg-[#0B0C0E] border border-[#22242A] rounded-[4px]">
                <Lock className="w-3.5 h-3.5 text-[#8C929C] shrink-0" />
                <p className="text-xs text-[#8C929C]">
                  Complete the criteria above to unlock this badge.
                </p>
              </div>
            )}

            {earned && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Badge
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-[#22242A] flex items-center justify-between text-xs">
              <span className="text-[#8C929C] font-mono uppercase">Issuer</span>
              <span className="text-[#F4F4F0] font-medium">{badge.issuer.name}</span>
            </div>
          </div>
        </div>
      </div>

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
