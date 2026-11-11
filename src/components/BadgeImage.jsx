import React from 'react';
import { Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, Award, Brain } from 'lucide-react';
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

const RARITY_STYLES = {
  common: {
    bg: 'bg-[#17181B]',
    border: 'border-[#3A3E48]',
    text: 'text-[#A8ADB6]',
  },
  uncommon: {
    bg: 'bg-[#141518]',
    border: 'border-[#34D399]',
    text: 'text-[#34D399]',
  },
  rare: {
    bg: 'bg-[#141518]',
    border: 'border-sky-400',
    text: 'text-sky-400',
  },
  epic: {
    bg: 'bg-[#141518]',
    border: 'border-orange-400',
    text: 'text-orange-400',
  },
  legendary: {
    bg: 'bg-[#141518]',
    border: 'border-[#F59E0B]',
    text: 'text-[#F59E0B]',
  },
};

const BadgeImage = ({ badge, size = 'large', showDetails = true, disableBlur = false, showEarned = true }) => {
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;
  const colors = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
  };

  const iconSizes = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} relative`} id={`badge-${badge.id}`}>
      <div className="w-full h-full relative">
        {!disableBlur && (
          <div
            className="hidden"
            aria-hidden="true"
          />
        )}

        {badge.id === 'first-contribution' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <FirstContributionBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'first-merge' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <FirstMergeBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'contributor-5' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <ActiveContributorBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'contributor-10' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <DedicatedContributorBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'contributor-25' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <ProlificContributorBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'contributor-50' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <EliteContributorBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'contributor-100' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <CenturionBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'merge-master-5' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <MergeMasterBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'early-adopter' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <EarlyAdopterBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'merge-master-10' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <MergeChampionBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'merge-master-25' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <MergeLegendBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'streak-7' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <WeekWarriorBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'streak-30' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <MonthMasterBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'perfect-score' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <PerfectScoreBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'pow-1' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <VerifiedContributorBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'pow-10' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <ImpactMakerBadge earned={true} variant="raw" />
          </div>
        ) : badge.id === 'firstmate-mentor' ? (
          <div className="w-full h-full flex items-center justify-center scale-125">
            <FirstMateMentorBadge earned={true} variant="raw" />
          </div>
        ) : (
          <div className={`relative w-full h-full rounded-full ${colors.bg} border-4 ${colors.border} shadow-xl flex items-center justify-center overflow-hidden`}>
            <BadgeIcon className={`${iconSizes[size]} text-[#F4F4F0]`} />
          </div>
        )}

        {showDetails && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full text-center">
            <h3 className="text-[#F4F4F0] font-semibold text-base mb-0.5">
              {badge.name}
            </h3>
            <p className={`text-xs font-mono uppercase tracking-wider ${colors.text}`}>
              {badge.rarity}
            </p>
          </div>
        )}
      </div>

      {showEarned && badge.earnedAt && (
        <div className="absolute -top-2 -right-2 bg-[#34D399] text-[#0F0F0F] text-xs font-mono font-semibold px-2.5 py-0.5 rounded-[4px] border border-[#0F0F0F]">
          Earned
        </div>
      )}
    </div>
  );
};

export default BadgeImage;
