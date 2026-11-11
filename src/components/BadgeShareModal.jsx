import React, { useState } from 'react';
import { X, Download, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { TwitterShareButton, LinkedinShareButton, FacebookShareButton } from 'react-share';
import { toPng } from 'html-to-image';
import BadgeImage from './BadgeImage';

const BadgeShareModal = ({ badge, onClose, username }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [readmeFormat, setReadmeFormat] = useState('markdown');
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const shareUrl = `https://firstissue.dev/badges/${badge.id}`;
  const shareTitle = `Earned the "${badge.name}" badge on FirstIssue.dev`;
  const shareDescription = `${badge.description} - Verified open-source milestone on FirstIssue.dev.`;

  const animatedBadgeUrl = `https://firstissue.dev/badges/${badge.id}.svg`;
  const previewBadgeUrl = `/badges/${badge.id}.svg`;

  const downloadBadge = async () => {
    if (downloading) return;
    setDownloading(true);
    setIsCapturing(true);

    try {
      const element = document.getElementById(`badge-share-${badge.id}`);
      if (!element) {
        throw new Error('Badge element not found');
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(element, {
        backgroundColor: '#0F0F0F',
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

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getShieldsIOBadge = () => {
    const label = encodeURIComponent('FirstIssue.dev');
    const message = encodeURIComponent(badge.name);
    const color =
      {
        common: '8C929C',
        uncommon: '34D399',
        rare: '38BDF8',
        epic: 'F97316',
        legendary: 'F59E0B',
      }[badge.rarity] || '8C929C';

    return `https://img.shields.io/badge/${label}-${message}-${color}?style=for-the-badge&logo=github`;
  };

  const getSnippetText = () => {
    if (readmeFormat === 'markdown') {
      return `[![${badge.name}](${animatedBadgeUrl})](${shareUrl})`;
    }
    if (readmeFormat === 'html') {
      return `<a href="${shareUrl}"><img src="${animatedBadgeUrl}" alt="${badge.name}" width="150" /></a>`;
    }
    return `[![${badge.name}](${getShieldsIOBadge()})](${shareUrl})`;
  };

  const copyReadmeSnippet = () => {
    navigator.clipboard.writeText(getSnippetText());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-badge-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[#141518] rounded-[4px] border border-[#2B2E36] overflow-hidden my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close share dialog"
          className="absolute top-4 right-4 p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 border-b border-[#22242A] bg-[#0F0F0F]">
          <div className="flex items-center gap-3 pr-8">
            <div className="w-8 h-8 rounded-[4px] bg-[#17181B] border border-[#2B2E36] flex items-center justify-center text-[#DAFA9C]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="share-badge-modal-title"
                className="text-xs font-mono font-semibold text-[#F4F4F0] uppercase tracking-wider"
              >
                Share Milestone Badge
              </h2>
              <p className="text-xs text-[#A8ADB6] mt-0.5">
                {badge.name} — @{username}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div
            className="bg-[#0F0F0F] rounded-[4px] border border-[#22242A] p-6 flex justify-center"
            id={`badge-share-${badge.id}`}
          >
            <div className="text-center">
              <BadgeImage
                badge={badge}
                size="large"
                showDetails={true}
                disableBlur={isCapturing}
                showEarned={false}
              />
              <div className="mt-12 pt-3 border-t border-[#22242A]">
                <p className="text-[#8C929C] text-[11px] font-mono uppercase tracking-wider mb-0.5">
                  Earned by
                </p>
                <p className="text-sm font-semibold text-[#F4F4F0]">@{username}</p>
                <p className="text-[#DAFA9C] text-[11px] font-mono uppercase tracking-wider mt-1">
                  FirstIssue.dev
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono text-[#A8ADB6] uppercase tracking-wider mb-2.5">
              Share to Social
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <TwitterShareButton
                url={shareUrl}
                title={shareTitle}
                hashtags={['OpenSource', 'FirstIssueDev', 'GitHub']}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] rounded-[4px] transition-colors cursor-pointer text-xs font-semibold text-[#F4F4F0]">
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  <span>X / Twitter</span>
                </div>
              </TwitterShareButton>

              <LinkedinShareButton
                url={shareUrl}
                title={shareTitle}
                summary={shareDescription}
                source="FirstIssue.dev"
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] rounded-[4px] transition-colors cursor-pointer text-xs font-semibold text-[#F4F4F0]">
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
                <div className="flex items-center justify-center gap-2 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] rounded-[4px] transition-colors cursor-pointer text-xs font-semibold text-[#F4F4F0]">
                  <Facebook className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </div>
              </FacebookShareButton>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono text-[#A8ADB6] uppercase tracking-wider">
                  GitHub README Embed
                </h3>
                <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30">
                  SVG
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#0B0C0E] p-0.5 rounded-[4px] border border-[#2B2E36]">
                {['markdown', 'html', 'shields'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setReadmeFormat(fmt)}
                    className={`px-2 py-1 text-xs font-mono rounded-[4px] transition-colors capitalize ${
                      readmeFormat === fmt
                        ? 'bg-[#1C1E23] text-[#DAFA9C]'
                        : 'text-[#8C929C] hover:text-[#F4F4F0]'
                    }`}
                  >
                    {fmt === 'html' ? 'HTML' : fmt === 'shields' ? 'Shields' : 'Markdown'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0B0C0E] rounded-[4px] border border-[#22242A] p-3.5 flex flex-col items-center gap-3">
              <div className="w-full flex flex-col items-center justify-center py-2.5 bg-[#0F0F0F] rounded-[4px] border border-[#22242A]">
                {readmeFormat === 'shields' ? (
                  <img src={getShieldsIOBadge()} alt={badge.name} className="h-6 my-1" />
                ) : (
                  <img
                    src={previewBadgeUrl}
                    alt={badge.name}
                    className="w-24 h-24 sm:w-28 sm:h-28"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 w-full">
                <code className="flex-1 text-xs text-[#F4F4F0] bg-[#141518] px-2.5 py-2 rounded-[4px] border border-[#22242A] overflow-x-auto font-mono whitespace-nowrap">
                  {getSnippetText()}
                </code>
                <button
                  type="button"
                  onClick={copyReadmeSnippet}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#17181B] hover:bg-[#1C1E23] border border-[#2B2E36] hover:border-[#DAFA9C] text-[#DAFA9C] rounded-[4px] text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  title="Copy snippet for GitHub README"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={downloadBadge}
              disabled={downloading}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#F4F4F0] rounded-[4px] text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Rendering...' : 'Download PNG'}
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Link Copied
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  Copy URL
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
