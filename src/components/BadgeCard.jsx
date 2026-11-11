import { Lock, Award, Star, Zap, Trophy, Flame, Target, Crown, Sparkles, GitMerge, Brain } from 'lucide-react';
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

const BadgeCard = ({ badge, earned = false, onClick }) => {
  if (badge.id === 'first-contribution') return <FirstContributionBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'first-merge') return <FirstMergeBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'contributor-5') return <ActiveContributorBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'contributor-10') return <DedicatedContributorBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'contributor-25') return <ProlificContributorBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'contributor-50') return <EliteContributorBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'contributor-100') return <CenturionBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'merge-master-5') return <MergeMasterBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'early-adopter') return <EarlyAdopterBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'merge-master-10') return <MergeChampionBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'merge-master-25') return <MergeLegendBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'streak-7') return <WeekWarriorBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'streak-30') return <MonthMasterBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'perfect-score') return <PerfectScoreBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'pow-1') return <VerifiedContributorBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'pow-10') return <ImpactMakerBadge earned={earned} onClick={onClick} />;
  if (badge.id === 'firstmate-mentor') return <FirstMateMentorBadge earned={earned} onClick={onClick} />;

  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-[4px] border transition-colors cursor-pointer text-left w-full ${
        earned
          ? `bg-[#141518] ${rarityInfo.borderColor || 'border-[#2B2E36]'} hover:border-[#DAFA9C]/60`
          : 'bg-[#0B0C0E] border-[#22242A] hover:border-[#2B2E36]'
      }`}
      aria-label={`${badge.name} badge — ${earned ? 'Earned' : 'Locked'}`}
    >
      <div className="relative mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            earned
              ? `${rarityInfo.bgColor} ${rarityInfo.borderColor}`
              : 'bg-[#141518] border-[#22242A]'
          }`}
        >
          {earned ? (
            <BadgeIcon className={`w-5 h-5 ${rarityInfo.color}`} />
          ) : (
            <Lock className="w-4 h-4 text-[#8C929C]" />
          )}
        </div>
      </div>

      <div className="text-center w-full min-w-0">
        <h3
          className={`text-xs font-semibold mb-0.5 truncate ${
            earned ? 'text-[#F4F4F0]' : 'text-[#8C929C]'
          }`}
        >
          {badge.name}
        </h3>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider ${
              earned ? rarityInfo.color : 'text-[#8C929C]'
            }`}
          >
            {rarityInfo.label}
          </span>
        </div>
      </div>
    </button>
  );
};

export default BadgeCard;
