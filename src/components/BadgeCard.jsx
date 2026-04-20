import React from 'react';
import { Lock, Award, CheckCircle, Zap, Star, Trophy, Flame, Target, Crown, Sparkles, GitMerge } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

// Badge icon mapping for more exciting visuals
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

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
        earned
          ? `${rarityInfo.bgColor} ${rarityInfo.borderColor} hover:scale-105 hover:shadow-lg`
          : 'bg-[#0B0C10] border-white/5 opacity-50 hover:opacity-70'
      }`}
    >
      {/* Animated Glow Effect for Earned Badges */}
      {earned && (
        <>
          <div className={`absolute inset-0 rounded-xl ${rarityInfo.bgColor} opacity-50 blur-xl animate-pulse`} />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </>
      )}

      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor} z-10`}>
        {rarityInfo.label}
      </div>

      {/* Badge Icon with Animation */}
      <div className="relative mb-3 z-10">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
          earned ? `${rarityInfo.bgColor} group-hover:scale-110 group-hover:rotate-12` : 'bg-white/5'
        }`}>
          {earned ? (
            <>
              <BadgeIcon className={`w-8 h-8 ${rarityInfo.color} transition-transform group-hover:scale-125`} />
              {/* Sparkle effects for legendary badges */}
              {badge.rarity === 'legendary' && (
                <>
                  <Sparkles className="absolute top-0 right-0 w-4 h-4 text-yellow-400 animate-ping" />
                  <Sparkles className="absolute bottom-0 left-0 w-3 h-3 text-yellow-400 animate-ping" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </>
          ) : (
            <Lock className="w-8 h-8 text-gray-600" />
          )}
        </div>
        
        {earned && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#15161E] animate-bounce">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Floating particles for epic/legendary */}
        {earned && (badge.rarity === 'epic' || badge.rarity === 'legendary') && (
          <>
            <div className={`absolute top-0 left-0 w-1 h-1 ${rarityInfo.color} rounded-full animate-float-particle-1`} />
            <div className={`absolute top-2 right-2 w-1.5 h-1.5 ${rarityInfo.color} rounded-full animate-float-particle-2`} />
            <div className={`absolute bottom-2 left-2 w-1 h-1 ${rarityInfo.color} rounded-full animate-float-particle-3`} />
          </>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center relative z-10">
        <h3 className={`font-semibold mb-1 transition-colors ${earned ? 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400' : 'text-gray-500'}`}>
          {badge.name}
        </h3>
        <p className={`text-xs ${earned ? 'text-gray-400' : 'text-gray-600'}`}>
          {badge.description}
        </p>
        
        {earned && badge.earnedAt && (
          <p className="text-[10px] text-gray-500 mt-2">
            🎉 {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Shine Effect on Hover */}
      {earned && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-full group-hover:translate-x-full duration-1000" />
      )}
    </div>
  );
};

export default BadgeCard;
