import React, { useState } from 'react';
import { X, Download, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { TwitterShareButton, LinkedinShareButton, FacebookShareButton } from 'react-share';
import { toPng } from 'html-to-image';
import BadgeImage from './BadgeImage';

const BadgeShareModal = ({ badge, onClose, username }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [readmeFormat, setReadmeFormat] = useState('markdown'); // 'markdown' | 'html' | 'shields'
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const shareUrl = `https://firstissue.dev/badges/${badge.id}`;
  const shareTitle = `I just earned the "${badge.name}" badge on FirstIssue.dev! 🎉`;
  const shareDescription = `${badge.description} - Join me in contributing to open source!`;

  // Public animated SVG URL for GitHub README embed (absolute URL)
  const animatedBadgeUrl = `https://firstissue.dev/badges/${badge.id}.svg`;
  // Relative URL for live preview in the modal
  const previewBadgeUrl = `/badges/${badge.id}.svg`;

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
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

  // Get current snippet text based on active format
  const getSnippetText = () => {
    if (readmeFormat === 'markdown') {
      return `[![${badge.name}](${animatedBadgeUrl})](${shareUrl})`;
    }
    if (readmeFormat === 'html') {
      return `<a href="${shareUrl}"><img src="${animatedBadgeUrl}" alt="${badge.name}" width="150" /></a>`;
    }
    return `[![${badge.name}](${getShieldsIOBadge()})](${shareUrl})`;
  };

  // Copy README snippet
  const copyReadmeSnippet = () => {
    navigator.clipboard.writeText(getSnippetText());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

          {/* Add to GitHub README Section */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Add to GitHub README</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Animated
                </span>
              </div>
              {/* Format selector buttons */}
              <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setReadmeFormat('markdown')}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    readmeFormat === 'markdown'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setReadmeFormat('html')}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    readmeFormat === 'html'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setReadmeFormat('shields')}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    readmeFormat === 'shields'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Shields.io
                </button>
              </div>
            </div>

            <div className="bg-[#0B0C10] rounded border border-zinc-800/80 p-3.5 flex flex-col items-center gap-3">
              {/* Live Preview Container */}
              <div className="w-full flex flex-col items-center justify-center py-2 bg-zinc-950/60 rounded border border-zinc-850/60 relative overflow-hidden">
                {readmeFormat === 'shields' ? (
                  <img
                    src={getShieldsIOBadge()}
                    alt={badge.name}
                    className="h-6 my-2 shadow-sm"
                  />
                ) : (
                  <div className="relative flex flex-col items-center">
                    <img
                      src={previewBadgeUrl}
                      alt={badge.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-transform duration-300 hover:scale-105"
                    />
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Continuous SVG Animation
                    </div>
                  </div>
                )}
              </div>

              {/* Code Snippet and Copy Button */}
              <div className="flex items-center gap-2 w-full">
                <code className="flex-1 text-[10px] text-zinc-300 bg-black/40 px-2.5 py-2 rounded border border-zinc-850 overflow-x-auto font-mono whitespace-nowrap">
                  {getSnippetText()}
                </code>
                <button
                  type="button"
                  onClick={copyReadmeSnippet}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
                  title="Copy snippet for GitHub README"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 text-left w-full">
                {readmeFormat === 'shields'
                  ? 'Classic static Shields.io pill badge.'
                  : 'Renders the live animated achievement badge with orbital rotation and glow directly in your GitHub profile or repository README.'}
              </p>
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
              {copiedLink ? (
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
