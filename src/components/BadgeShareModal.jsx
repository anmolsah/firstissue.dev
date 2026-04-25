import React, { useState, useRef } from 'react';
import { X, Download, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { TwitterShareButton, LinkedinShareButton, FacebookShareButton } from 'react-share';
import html2canvas from 'html2canvas';
import { fixOklchInElement } from '../utils/canvasHelper';
import BadgeImage from './BadgeImage';

const BadgeShareModal = ({ badge, onClose, username }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const badgeRef = useRef(null);

  const shareUrl = `https://firstissue.dev/badges/${badge.id}`;
  const shareTitle = `I just earned the "${badge.name}" badge on FirstIssue.dev! 🎉`;
  const shareDescription = `${badge.description} - Join me in contributing to open source!`;

  // Download badge as image
  const downloadBadge = async () => {
    if (downloading) return;
    setDownloading(true);
    setIsCapturing(true);
    
    try {
      const element = document.getElementById(`badge-share-${badge.id}`);
      if (!element) {
        throw new Error('Badge element not found');
      }

      // Wait for React to re-render without blur
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        backgroundColor: '#0B0C10',
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById(`badge-share-${badge.id}`);
          if (el) fixOklchInElement(el);
        }
      });
      
      const link = document.createElement('a');
      link.download = `firstissue-${badge.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading badge:', error);
      alert('Failed to download badge image. Please try again.');
    } finally {
      setDownloading(false);
      setIsCapturing(false);
    }
  };

  // Copy badge URL
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate shields.io style badge URL
  const getShieldsIOBadge = () => {
    const label = encodeURIComponent('FirstIssue.dev');
    const message = encodeURIComponent(badge.name);
    const color = {
      common: '808080',
      uncommon: '10B981',
      rare: '3B82F6',
      epic: 'A855F7',
      legendary: 'F59E0B'
    }[badge.rarity] || '808080';
    
    return `https://img.shields.io/badge/${label}-${message}-${color}?style=for-the-badge&logo=github`;
  };

  // Copy shields.io markdown
  const copyShieldsMarkdown = () => {
    const markdown = `[![${badge.name}](${getShieldsIOBadge()})](https://firstissue.dev)`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#15161E] rounded-2xl border border-white/10 overflow-hidden my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Share Your Achievement</h2>
              <p className="text-sm text-gray-400">Show off your {badge.name} badge!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Badge Preview */}
          <div className="bg-[#0B0C10] rounded-xl p-8 mb-6 flex justify-center" id={`badge-share-${badge.id}`}>
            <div className="text-center">
              <BadgeImage badge={badge} size="large" showDetails={true} disableBlur={isCapturing} />
              <div className="mt-16 pt-4 border-t border-white/5">
                <p className="text-gray-400 text-sm mb-1">Earned by</p>
                <p className="text-white font-semibold">@{username}</p>
                <p className="text-gray-500 text-xs mt-2">FirstIssue.dev</p>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Share on Social Media</h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
              <TwitterShareButton
                url={shareUrl}
                title={shareTitle}
                hashtags={['OpenSource', 'FirstIssueDev', 'Coding']}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 p-3 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 rounded-lg hover:bg-[#1DA1F2]/20 transition-colors cursor-pointer">
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                  <span className="text-sm font-medium text-white">Twitter</span>
                </div>
              </TwitterShareButton>

              <LinkedinShareButton
                url={shareUrl}
                title={shareTitle}
                summary={shareDescription}
                source="FirstIssue.dev"
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 p-3 bg-[#0A66C2]/10 border border-[#0A66C2]/20 rounded-lg hover:bg-[#0A66C2]/20 transition-colors cursor-pointer">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                  <span className="text-sm font-medium text-white">LinkedIn</span>
                </div>
              </LinkedinShareButton>

              <FacebookShareButton
                url={shareUrl}
                quote={shareTitle}
                hashtag="#OpenSource"
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 p-3 bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-lg hover:bg-[#1877F2]/20 transition-colors cursor-pointer">
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                  <span className="text-sm font-medium text-white">Facebook</span>
                </div>
              </FacebookShareButton>
            </div>
          </div>

          {/* Shields.io Badge */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Add to GitHub README</h3>
            <div className="bg-[#0B0C10] rounded-lg p-4 border border-white/5">
              <img 
                src={getShieldsIOBadge()} 
                alt={badge.name}
                className="mb-3"
              />
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
                  {`[![${badge.name}](${getShieldsIOBadge()})](https://firstissue.dev)`}
                </code>
                <button
                  onClick={copyShieldsMarkdown}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadBadge}
              disabled={downloading}
              className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Downloading...' : 'Download Image'}
            </button>

            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeShareModal;
