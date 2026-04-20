import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Award, X, Sparkles, Star, Zap, Trophy, Flame, Target, Crown, GitMerge } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

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

const BadgeUnlockedNotification = ({ badge, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const rarityInfo = getBadgeRarityInfo(badge.rarity);
  const BadgeIcon = BADGE_ICONS[badge.id] || Award;
=======
import { Award, X, Sparkles } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

const BadgeUnlockedNotification = ({ badge, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const rarityInfo = getBadgeRarityInfo(badge.rarity);
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

<<<<<<< HEAD
    // Generate confetti
    const confettiArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2
    }));
    setConfetti(confettiArray);

    // Auto close after 6 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 6000);
=======
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
<<<<<<< HEAD
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-75'
      }`}
    >
      <div className="relative bg-gradient-to-br from-[#1a1b26] to-[#15161E] border-2 border-white/20 rounded-2xl p-5 shadow-2xl max-w-sm overflow-hidden">
        {/* Animated Background Glow */}
        <div className={`absolute inset-0 ${rarityInfo.bgColor} opacity-20 animate-pulse`} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        {/* Confetti */}
        {confetti.map((item) => (
          <div
            key={item.id}
            className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full animate-confetti"
            style={{
              left: `${item.left}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`
            }}
          />
        ))}

        {/* Sparkles */}
        <div className="absolute top-3 left-3 animate-ping">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="absolute top-5 right-5 animate-ping" style={{ animationDelay: '0.3s' }}>
          <Sparkles className="w-4 h-4 text-pink-400" />
        </div>
        <div className="absolute bottom-3 left-5 animate-ping" style={{ animationDelay: '0.6s' }}>
          <Star className="w-4 h-4 text-blue-400" />
=======
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
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
<<<<<<< HEAD
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white transition-colors bg-black/20 rounded-lg z-10"
=======
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative flex items-start gap-4">
<<<<<<< HEAD
          {/* Badge Icon with Glow */}
          <div className="relative">
            <div className={`absolute inset-0 ${rarityInfo.bgColor} blur-xl opacity-75 animate-pulse`} />
            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${rarityInfo.bgColor} border-2 ${rarityInfo.borderColor} animate-bounce shadow-lg`}>
              <BadgeIcon className={`w-10 h-10 ${rarityInfo.color}`} />
            </div>
            {/* Checkmark */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#15161E] shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
              <span className="text-white text-lg">✓</span>
            </div>
=======
          {/* Badge Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${rarityInfo.bgColor} border-2 ${rarityInfo.borderColor} animate-bounce`}>
            <Award className={`w-8 h-8 ${rarityInfo.color}`} />
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
          </div>

          {/* Text */}
          <div className="flex-1 pt-1">
<<<<<<< HEAD
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-pulse">
                🎉 BADGE UNLOCKED!
              </p>
            </div>
            <h4 className="text-white font-bold text-lg mb-1">{badge.name}</h4>
            <p className="text-sm text-gray-300 mb-3">{badge.description}</p>
            
            {/* Rarity Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${rarityInfo.bgColor} ${rarityInfo.color} border-2 ${rarityInfo.borderColor} shadow-lg`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {rarityInfo.label.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Progress Bar Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-bar" />
        </div>
=======
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
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
      </div>
    </div>
  );
};

export default BadgeUnlockedNotification;
