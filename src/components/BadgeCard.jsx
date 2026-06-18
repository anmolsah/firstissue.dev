import { Lock, CheckCircle, Award, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';
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

const BadgeCard = ({ badge, earned = false, onClick }) => {
  if (badge.id === 'first-contribution') {
    return <FirstContributionBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'first-merge') {
    return <FirstMergeBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'contributor-5') {
    return <ActiveContributorBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'contributor-10') {
    return <DedicatedContributorBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'contributor-25') {
    return <ProlificContributorBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'contributor-50') {
    return <EliteContributorBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'merge-master-5') {
    return <MergeMasterBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'early-adopter') {
    return <EarlyAdopterBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'merge-master-10') {
    return <MergeChampionBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'streak-7') {
    return <WeekWarriorBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'streak-30') {
    return <MonthMasterBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'perfect-score') {
    return <PerfectScoreBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'pow-1') {
    return <VerifiedContributorBadge earned={earned} onClick={onClick} />;
  }
  if (badge.id === 'pow-10') {
    return <ImpactMakerBadge earned={earned} onClick={onClick} />;
  }

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
      className={`relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer group text-left w-full ${
        earned
          ? `bg-zinc-950/20 ${rarityInfo.borderColor || 'border-zinc-800/60'} hover:border-zinc-700/80 ${rarityGlow[badge.rarity] || ''}`
          : 'bg-zinc-950/10 border-zinc-900/60 hover:border-zinc-850/60'
      }`}
      aria-label={`${badge.name} badge — ${earned ? 'Earned' : 'Locked'}`}
    >
      {/* Badge Icon Container */}
      <div className="relative mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-105 ${
            earned
              ? `${rarityInfo.bgColor} ${rarityAccent[badge.rarity] || 'ring-gray-500/30'}`
              : 'bg-zinc-900/50 ring-zinc-800/40'
          }`}
        >
          {earned ? (
            <BadgeIcon className={`w-5 h-5 ${rarityInfo.color}`} />
          ) : (
            <Lock className="w-4 h-4 text-zinc-550" />
          )}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center w-full min-w-0">
        <h3
          className={`text-[11px] font-bold mb-0.5 truncate uppercase tracking-wider ${
            earned ? 'text-white' : 'text-zinc-500'
          }`}
        >
          {badge.name}
        </h3>

        {/* Rarity dot */}
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span
            className={`w-1 h-1 rounded-full ${
              earned
                ? rarityInfo.color.replace('text-', 'bg-')
                : 'bg-zinc-750'
            }`}
          />
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${earned ? rarityInfo.color : 'text-zinc-600'}`}>
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
