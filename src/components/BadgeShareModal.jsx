import React, { useState, useRef } from 'react';
import { X, Download, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { TwitterShareButton, LinkedinShareButton, FacebookShareButton } from 'react-share';
import { toPng } from 'html-to-image';
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

      const dataUrl = await toPng(element, {
        backgroundColor: '#0B0C10',
        pixelRatio: 3, 
      });
      
      const link = document.createElement('a');
      link.download = `firstissue-${badge.id}.png`;
      link.href = dataUrl;
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
  };  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-950 rounded-lg border border-zinc-800/80 overflow-hidden my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-5 border-b border-zinc-800/60 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-805 flex items-center justify-center text-zinc-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Share Your Achievement</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Show off your {badge.name} badge!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Badge Preview */}
          <div className="bg-[#0B0C10] rounded border border-zinc-800/60 p-6 mb-5 flex justify-center" id={`badge-share-${badge.id}`}>
            <div className="text-center">
              <BadgeImage badge={badge} size="large" showDetails={true} disableBlur={isCapturing} showEarned={false} />
              <div className="mt-12 pt-3 border-t border-zinc-800/40">
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Earned by</p>
                <p className="text-sm font-semibold text-white">@{username}</p>
                <p className="text-zinc-650 text-[10px] uppercase font-bold tracking-wider mt-1.5">FirstIssue.dev</p>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="mb-5">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Share on Social Media</h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
              <TwitterShareButton
                url={shareUrl}
                title={shareTitle}
                hashtags={['OpenSource', 'FirstIssueDev', 'Coding']}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-855 border border-zinc-800/80 rounded transition-colors cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white">
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  <span>Twitter</span>
                </div>
              </TwitterShareButton>

              <LinkedinShareButton
                url={shareUrl}
                title={shareTitle}
                summary={shareDescription}
                source="FirstIssue.dev"
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-855 border border-zinc-800/80 rounded transition-colors cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white">
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </div>
              </LinkedinShareButton>

              <FacebookShareButton
                url={shareUrl}
                quote={shareTitle}
                hashtag="#OpenSource"
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-855 border border-zinc-800/80 rounded transition-colors cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white">
                  <Facebook className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </div>
              </FacebookShareButton>
            </div>
          </div>

          {/* Shields.io Badge */}
          <div className="mb-5">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Add to GitHub README</h3>
            <div className="bg-[#0B0C10] rounded border border-zinc-800/60 p-3 flex flex-col items-start gap-2.5">
              <img 
                src={getShieldsIOBadge()} 
                alt={badge.name}
                className="h-5"
              />
              <div className="flex items-center gap-2 w-full">
                <code className="flex-1 text-[10px] text-zinc-400 bg-black/30 px-2 py-1.5 rounded overflow-x-auto font-mono">
                  {`[![${badge.name}](${getShieldsIOBadge()})](https://firstissue.dev)`}
                </code>
                <button
                  onClick={copyShieldsMarkdown}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadBadge}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Downloading...' : 'Download Image'}
            </button>

            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-colors animate-fade-in"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
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
