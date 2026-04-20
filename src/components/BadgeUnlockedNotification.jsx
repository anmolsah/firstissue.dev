import React, { useEffect, useState } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

const BadgeUnlockedNotification = ({ badge, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const rarityInfo = getBadgeRarityInfo(badge.rarity);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="relative bg-[#15161E] border border-white/10 rounded-xl p-4 shadow-2xl max-w-sm overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 animate-pulse" />
        
        {/* Sparkles */}
        <div className="absolute top-2 left-2">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>
        <div className="absolute bottom-2 right-2">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative flex items-start gap-4">
          {/* Badge Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${rarityInfo.bgColor} border-2 ${rarityInfo.borderColor} animate-bounce`}>
            <Award className={`w-8 h-8 ${rarityInfo.color}`} />
          </div>

          {/* Text */}
          <div className="flex-1 pt-1">
            <p className="text-xs font-semibold text-amber-400 mb-1">
              🎉 Badge Unlocked!
            </p>
            <h4 className="text-white font-bold mb-1">{badge.name}</h4>
            <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
              {rarityInfo.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeUnlockedNotification;
