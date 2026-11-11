import React, { useRef, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Code,
  Star,
  Github,
  Download,
  CheckCircle,
  ChevronDown,
  RefreshCw,
  FileDiff,
} from 'lucide-react';
import { toPng } from 'html-to-image';

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

const MetalCard = ({ attestation, showActions = true, isOwner = false, onRegenerate }) => {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardRef.current || isExporting) return;

    try {
      setIsExporting(true);
      setIsDeepDiveOpen(false);

      await new Promise((r) => setTimeout(r, 250));

      const actionsEl = cardRef.current.querySelector('[data-export-hide]');
      if (actionsEl) actionsEl.style.display = 'none';

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 4,
        skipFonts: false,
        cacheBust: true,
        backgroundColor: '#0F0F0F',
        style: {
          transform: 'none',
        },
      });

      if (actionsEl) actionsEl.style.display = '';
      setIsExporting(false);

      const link = document.createElement('a');
      link.download = `${attestation.repo_name.replace('/', '-')}-pow.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      const actionsEl = cardRef.current?.querySelector('[data-export-hide]');
      if (actionsEl) actionsEl.style.display = '';
      setIsExporting(false);
    }
  };

  const handleRegenerate = async (e) => {
    e.stopPropagation();
    if (onRegenerate && !isRegenerating) {
      setIsRegenerating(true);
      try {
        await onRegenerate(attestation.id);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const shortHash = attestation.tx_hash
    ? `${attestation.tx_hash.substring(0, 8)}...${attestation.tx_hash.substring(
        attestation.tx_hash.length - 6
      )}`
    : 'Indexing...';
  const score = attestation.impact_score || 0;

  const TIERS = {
    legendary: {
      label: 'High Impact',
      accent: '#F59E0B',
      borderClass: 'border-[#F59E0B]/40 hover:border-[#F59E0B]/70',
    },
    epic: {
      label: 'Strong Impact',
      accent: '#DAFA9C',
      borderClass: 'border-[#DAFA9C]/40 hover:border-[#DAFA9C]/70',
    },
    rare: {
      label: 'Verified Merge',
      accent: '#34D399',
      borderClass: 'border-[#34D399]/35 hover:border-[#34D399]/65',
    },
    standard: {
      label: 'Merged PR',
      accent: '#A8ADB6',
      borderClass: 'border-[#2B2E36] hover:border-[#3A3E48]',
    },
  };

  const tierKey =
    score >= 80
      ? 'legendary'
      : score >= 50
      ? 'epic'
      : score >= 25
      ? 'rare'
      : 'standard';
  const tier = TIERS[tierKey];
  const meterPct = Math.min(100, score);

  return (
    <div className="w-full h-full min-h-[220px]">
      <div
        ref={cardRef}
        onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
        className={`group relative w-full h-full rounded-[4px] overflow-hidden cursor-pointer border bg-[#141518] transition-colors ${tier.borderClass}`}
        style={{
          backgroundImage:
            'linear-gradient(155deg, rgba(255,255,255,0.03) 0%, rgba(15,15,15,0.92) 52%, rgba(218,250,156,0.04) 100%)',
        }}
      >
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: tier.accent }}
          aria-hidden="true"
        />

        <div className="p-5 flex flex-col h-full text-[#F4F4F0]">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 shrink-0 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center justify-center">
                  <Code className="w-3.5 h-3.5 text-[#DAFA9C]" />
                </div>
                <span className="text-sm font-mono font-medium text-[#F4F4F0] truncate">
                  {attestation.repo_name}
                </span>
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-[#34D399]" />
              </div>
              {attestation.repo_stars > 0 && (
                <div className="flex items-center gap-1 mt-1.5 pl-8">
                  <Star className="w-3 h-3 text-[#F59E0B]" fill="currentColor" />
                  <span className="text-xs font-mono tabular-nums text-[#A8ADB6]">
                    {formatNumber(attestation.repo_stars)}
                  </span>
                </div>
              )}
            </div>
            <span className="shrink-0 text-xs font-mono text-[#8C929C]">
              FirstIssue.dev
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 mb-3">
            {attestation.headline ? (
              <>
                <h3 className="font-semibold text-base leading-snug mb-2 text-[#F4F4F0]">
                  {attestation.headline}
                </h3>
                <p className="text-xs text-[#A8ADB6] leading-relaxed mb-3 line-clamp-3">
                  {attestation.impact_summary}
                </p>
                {attestation.tech_stack && attestation.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {attestation.tech_stack.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] text-[11px] font-mono text-[#A8ADB6]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 text-[#F4F4F0]">
                <span className="text-[#8C929C] mr-1.5 font-mono tabular-nums">
                  #{attestation.pr_number}
                </span>
                {attestation.pr_title}
              </h3>
            )}

            <AnimatePresence>
              {isDeepDiveOpen && attestation.headline && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 overflow-hidden"
                >
                  <div className="pt-2.5 pb-2 border-t border-[#22242A]">
                    {attestation.problem_solved && (
                      <div className="mb-2.5">
                        <h4 className="text-[11px] font-mono text-[#8C929C] uppercase tracking-wider mb-1">
                          Problem Solved
                        </h4>
                        <p className="text-xs text-[#A8ADB6] leading-relaxed">
                          {attestation.problem_solved}
                        </p>
                      </div>
                    )}
                    {attestation.technical_highlights &&
                      attestation.technical_highlights.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-mono text-[#8C929C] uppercase tracking-wider mb-1">
                            Highlights
                          </h4>
                          <ul className="list-disc list-inside text-xs text-[#A8ADB6] space-y-1">
                            {attestation.technical_highlights.map((hl, i) => (
                              <li key={i}>{hl}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            <div className="mt-auto pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  {(attestation.additions > 0 || attestation.deletions > 0) && (
                    <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                      <span className="text-[#34D399]">+{attestation.additions}</span>
                      <span className="text-[#3A3E48]">/</span>
                      <span className="text-[#F87171]">-{attestation.deletions}</span>
                    </div>
                  )}
                  {attestation.changed_files > 0 && (
                    <div className="flex items-center gap-1 text-xs font-mono tabular-nums text-[#8C929C]">
                      <FileDiff className="w-3 h-3" />
                      {attestation.changed_files} files
                    </div>
                  )}
                </div>

                <span
                  className="text-xs font-semibold font-mono tabular-nums"
                  style={{ color: tier.accent }}
                >
                  {score}
                  <span className="text-[#8C929C]">/100</span>
                </span>
              </div>

              <div className="h-1.5 w-full rounded-[2px] bg-[#0B0C0E] overflow-hidden border border-[#22242A]">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${meterPct}%`,
                    backgroundColor: tier.accent,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer - SHA-256 Attestation Stamp */}
          <div className="mt-auto pt-3 border-t border-[#22242A] flex justify-between items-center bg-[#0B0C0E] -mx-5 -mb-5 px-5 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono text-[#8C929C] uppercase tracking-wider flex items-center gap-1">
                Attestation SHA-256
                {attestation.headline && (
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isDeepDiveOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </span>
              <span className="text-xs font-mono text-[#F4F4F0] flex items-center gap-1.5 tabular-nums">
                <Github className="w-3 h-3 text-[#8C929C]" />
                {shortHash}
              </span>
            </div>

            <div
              data-export-hide
              className={`flex items-center gap-1.5 relative z-10 ${
                isExporting ? 'hidden' : ''
              }`}
            >
              {showActions && isOwner && !attestation.headline && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  title="Generate impact summary"
                  aria-label="Generate quantified impact summary"
                  disabled={isRegenerating}
                  className="w-8 h-8 rounded-[4px] bg-[#141518] hover:bg-[#1C1E23] text-[#A8ADB6] hover:text-[#DAFA9C] border border-[#2B2E36] transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isRegenerating ? 'animate-spin' : ''
                    }`}
                  />
                </button>
              )}
              {showActions && (
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download PNG"
                  aria-label="Download Proof of Work card as PNG"
                  className="w-8 h-8 rounded-[4px] bg-[#141518] hover:bg-[#1C1E23] text-[#A8ADB6] hover:text-[#DAFA9C] border border-[#2B2E36] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
              <a
                href={`https://github.com/${attestation.repo_name}/pull/${attestation.pr_number}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View Pull Request on GitHub"
                aria-label="View Pull Request on GitHub"
                className="w-8 h-8 rounded-[4px] bg-[#141518] hover:bg-[#1C1E23] text-[#A8ADB6] hover:text-[#F4F4F0] border border-[#2B2E36] transition-colors flex items-center justify-center cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetalCard;
