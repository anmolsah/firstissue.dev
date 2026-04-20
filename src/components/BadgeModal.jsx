<<<<<<< HEAD
import React, { useState } from 'react';
import { X, Award, Calendar, CheckCircle, Lock, ExternalLink, Share2 } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';
import BadgeImage from './BadgeImage';
import BadgeShareModal from './BadgeShareModal';

const BadgeModal = ({ badge, earned, onClose, username }) => {
  const [showShareModal, setShowShareModal] = useState(false);

=======
import React from 'react';
import { X, Award, Calendar, CheckCircle, Lock, ExternalLink } from 'lucide-react';
import { getBadgeRarityInfo } from '../utils/badgeSystem';

const BadgeModal = ({ badge, earned, onClose }) => {
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
  if (!badge) return null;

  const rarityInfo = getBadgeRarityInfo(badge.rarity);

  return (
<<<<<<< HEAD
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-[#15161E] rounded-2xl border border-white/10 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Badge Image */}
          <div className={`relative p-8 ${rarityInfo.bgColor} border-b border-white/5`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            
            {/* Badge Image */}
            <div className="relative flex justify-center">
              <BadgeImage badge={badge} size="medium" showDetails={false} />
            </div>

            {/* Rarity Badge */}
            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {rarityInfo.label}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className={`text-2xl font-bold mb-2 ${earned ? 'text-white' : 'text-gray-400'}`}>
              {badge.name}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {badge.description}
            </p>

            {/* Criteria */}
            <div className="bg-[#0B0C10] rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">How to Earn</h3>
              <p className="text-sm text-gray-400">
                {badge.criteria.narrative}
              </p>
            </div>

            {/* Earned Info */}
            {earned && badge.earnedAt && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-400">Badge Earned</p>
                  <p className="text-xs text-gray-400">
                    {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {earned && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Badge
                </button>
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#15161E] rounded-2xl border border-white/10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Gradient */}
        <div className={`relative p-8 ${rarityInfo.bgColor} border-b border-white/5`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          
          {/* Badge Icon */}
          <div className="relative">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              earned ? rarityInfo.bgColor : 'bg-white/5'
            } border-4 ${earned ? rarityInfo.borderColor : 'border-white/10'}`}>
              {earned ? (
                <Award className={`w-12 h-12 ${rarityInfo.color}`} />
              ) : (
                <Lock className="w-12 h-12 text-gray-600" />
              )}
            </div>
            
            {earned && (
              <div className="absolute bottom-0 right-1/2 translate-x-12 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#15161E]">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Rarity Badge */}
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${rarityInfo.bgColor} ${rarityInfo.color} border ${rarityInfo.borderColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {rarityInfo.label}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-2 ${earned ? 'text-white' : 'text-gray-400'}`}>
            {badge.name}
          </h2>
          
          <p className="text-gray-400 mb-6">
            {badge.description}
          </p>

          {/* Criteria */}
          <div className="bg-[#0B0C10] rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">How to Earn</h3>
            <p className="text-sm text-gray-400">
              {badge.criteria.narrative}
            </p>
          </div>

          {/* Earned Info */}
          {earned && badge.earnedAt && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-400">Badge Earned</p>
                <p className="text-xs text-gray-400">
                  {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Issuer Info */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-gray-500 mb-2">Issued by</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{badge.issuer.name}</p>
                <p className="text-xs text-gray-500">{badge.issuer.url}</p>
              </div>
              {earned && (
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
                <a
                  href={`/badges/verify/${badge.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
<<<<<<< HEAD
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0B0C10] border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verify
                </a>
              </div>
            )}

            {/* Issuer Info */}
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-gray-500 mb-2">Issued by</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{badge.issuer.name}</p>
                  <p className="text-xs text-gray-500">{badge.issuer.url}</p>
                </div>
              </div>
            </div>

            {/* Open Badges Standard */}
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <p className="text-[10px] text-gray-500 text-center">
                This badge follows the{' '}
                <a
                  href="https://openbadges.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Mozilla Open Badges Standard
                </a>
              </p>
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
=======
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Verify
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Open Badges Standard */}
          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <p className="text-[10px] text-gray-500 text-center">
              This badge follows the{' '}
              <a
                href="https://openbadges.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Mozilla Open Badges Standard
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
>>>>>>> 0624f08f37a63f872bec951b3769297d3ceba375
  );
};

export default BadgeModal;
