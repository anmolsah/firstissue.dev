import React from 'react';
import { Lock, Award, CheckCircle } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

const BadgeCard = ({ badge, earned = false, onClick }) => {
  const rarityInfo = getBadgeRarityInfo(badge.rarity);

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
        earned
          ? `${rarityInfo.bgColor} ${rarityInfo.borderColor} hover:scale-105`
          : 'bg-[#0B0C10] border-white/5 opacity-50 hover:opacity-70'
      }`}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
        {rarityInfo.label}
      </div>

      {/* Badge Icon */}
      <div className="relative mb-3">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
          earned ? rarityInfo.bgColor : 'bg-white/5'
        }`}>
          {earned ? (
            <Award className={`w-8 h-8 ${rarityInfo.color}`} />
          ) : (
            <Lock className="w-8 h-8 text-gray-600" />
          )}
        </div>
        
        {earned && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#15161E]">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className={`font-semibold mb-1 ${earned ? 'text-white' : 'text-gray-500'}`}>
          {badge.name}
        </h3>
        <p className={`text-xs ${earned ? 'text-gray-400' : 'text-gray-600'}`}>
          {badge.description}
        </p>
        
        {earned && badge.earnedAt && (
          <p className="text-[10px] text-gray-500 mt-2">
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Hover Effect */}
      {earned && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );
};

export default BadgeCard;
