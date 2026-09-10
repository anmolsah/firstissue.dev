import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code, Star, Github, Download, CheckCircle, ChevronDown, RefreshCw, FileDiff } from 'lucide-react';
import { toPng } from 'html-to-image';

const getLanguageIcon = () => Code;

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};

const MetalCard = ({ attestation, showActions = true, isOwner = false, onRegenerate }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardRef.current || isExporting) return;
    
    try {
      setIsExporting(true);
      setIsHovered(false);
      setIsDeepDiveOpen(false); // Close deep dive before exporting to keep the card compact
      
      await new Promise(r => setTimeout(r, 350));

      const actionsEl = cardRef.current.querySelector('[data-export-hide]');
      if (actionsEl) actionsEl.style.display = 'none';

      const dataUrl = await toPng(cardRef.current, { 
        quality: 1.0,
        pixelRatio: 4, 
        skipFonts: false,
        cacheBust: true,
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

  const LangIcon = getLanguageIcon(attestation.primary_language);
  const shortHash = attestation.tx_hash ? `${attestation.tx_hash.substring(0, 6)}...${attestation.tx_hash.substring(attestation.tx_hash.length - 4)}` : 'Minting...';
  const score = attestation.impact_score || 0;

  const TIERS = {
    legendary: {
      label: 'Legendary',
      gradient: 'from-amber-200/[0.12] via-zinc-900 to-black',
      accent: '#FBBF24',
      accentSoft: 'rgba(251, 191, 36, 0.18)',
      ring: 'rgba(251, 191, 36, 0.45)',
    },
    epic: {
      label: 'Epic',
      gradient: 'from-emerald-200/[0.10] via-zinc-900 to-black',
      accent: '#34D399',
      accentSoft: 'rgba(52, 211, 153, 0.16)',
      ring: 'rgba(52, 211, 153, 0.40)',
    },
    rare: {
      label: 'Rare',
      gradient: 'from-sky-200/[0.10] via-zinc-900 to-black',
      accent: '#38BDF8',
      accentSoft: 'rgba(56, 189, 248, 0.16)',
      ring: 'rgba(56, 189, 248, 0.40)',
    },
    standard: {
      label: 'Standard',
      gradient: 'from-zinc-400/[0.08] via-zinc-900 to-black',
      accent: '#D4D4D8',
      accentSoft: 'rgba(212, 212, 216, 0.12)',
      ring: 'rgba(212, 212, 216, 0.28)',
    },
  };

  const tierKey = score >= 80 ? 'legendary' : score >= 50 ? 'epic' : score >= 25 ? 'rare' : 'standard';
  const tier = TIERS[tierKey];
  const sheenColor = tier.accentSoft;
  const meterPct = Math.min(100, score);

  return (
    <div className="perspective-1000 w-full h-full min-h-[220px]">
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
        className={`group relative w-full h-full rounded-2xl overflow-hidden cursor-pointer
          border border-white/10 backdrop-blur-sm bg-gradient-to-br ${tier.gradient}
          transition-shadow duration-300`}
        style={{
          boxShadow: isHovered
            ? `0 24px 50px -12px rgba(0,0,0,0.65), 0 0 0 1px ${tier.ring}, inset 0 1px 1px rgba(255,255,255,0.12)`
            : `0 12px 32px -16px rgba(0,0,0,0.6), 0 0 0 1px ${tier.ring}`,
        }}
      >
        {/* Holographic foil */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.14]"
          animate={{
            background: `conic-gradient(from 130deg at 50% 50%, #ff0080, #7928ca, #00d4ff, #34d399, #fbbf24, #ff0080)`,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Engraved guilloché texture */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 28% -10%, #fff 0, #fff 0.5px, transparent 1.5px, transparent 7px)',
          }}
        />

        {/* Top glossy specular highlight */}
        <div className="absolute inset-x-0 top-0 h-1/3 pointer-events-none z-10 bg-gradient-to-b from-white/[0.14] to-transparent" />

        {/* Sheen */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          animate={{
            background: isHovered
              ? `radial-gradient(circle at 50% 50%, ${sheenColor} 0%, transparent 45%)`
              : `radial-gradient(circle at 50% 0%, ${sheenColor} 0%, transparent 55%)`
          }}
          transition={{ duration: 0.1 }}
        />

        {/* Gloss sweep on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.16) 50%, transparent 62%)',
            backgroundSize: '250% 100%',
          }}
          animate={{ backgroundPositionX: isHovered ? '-60%' : '160%' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />

        {/* Card Content */}
        <div className="relative z-30 p-5 flex flex-col h-full text-white">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 shrink-0 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                  <LangIcon className="w-3 h-3 text-white/80" />
                </div>
                <span className="text-sm font-semibold text-white/90 truncate">{attestation.repo_name}</span>
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              </div>
              {attestation.repo_stars > 0 && (
                <div className="flex items-center gap-1 mt-1.5 ml-1">
                  <Star className="w-3 h-3 text-amber-400/80" fill="currentColor" />
                  <span className="text-xs font-medium text-white/60">{formatNumber(attestation.repo_stars)}</span>
                </div>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 opacity-60">
              FirstIssue.dev
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 mb-3">
            {attestation.headline ? (
              <>
                <h3 className="font-bold text-xl leading-snug mb-2 text-white/95">
                  {attestation.headline}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-3">
                  {attestation.impact_summary}
                </p>
                {attestation.tech_stack && attestation.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {attestation.tech_stack.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-medium text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <h3 className="font-semibold text-[17px] leading-snug mb-2 line-clamp-2 text-white">
                <span className="opacity-50 mr-1.5 font-mono">#{attestation.pr_number}</span>
                {attestation.pr_title}
              </h3>
            )}

            {/* Expandable Deep Dive */}
            <AnimatePresence>
              {isDeepDiveOpen && attestation.headline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="pt-2 pb-4 border-t border-white/10">
                    {attestation.problem_solved && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Problem Solved</h4>
                        <p className="text-sm text-white/80">{attestation.problem_solved}</p>
                      </div>
                    )}
                    {attestation.technical_highlights && attestation.technical_highlights.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Technical Highlights</h4>
                        <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
                          {attestation.technical_highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Impact & Diff Strip */}
            <div className="mt-auto pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {(attestation.additions > 0 || attestation.deletions > 0) && (
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-emerald-400">+{attestation.additions}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-rose-400">-{attestation.deletions}</span>
                    </div>
                  )}
                  {attestation.changed_files > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-white/50">
                      <FileDiff className="w-3 h-3" />
                      {attestation.changed_files} files
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold font-mono" style={{ color: tier.accent }}>
                    {score}<span className="text-white/35">/100</span>
                  </span>
                </div>
              </div>
              
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${meterPct}%`,
                    background: `linear-gradient(90deg, ${tier.accent}99, ${tier.accent})`,
                    boxShadow: `0 0 8px ${tier.accentSoft}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer - Cryptographic Stamp */}
          <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-end bg-black/25 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div className="flex flex-col gap-2 cursor-pointer" onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}>
              <span className="text-[9px] font-mono opacity-45 uppercase tracking-[0.2em] flex items-center gap-1">
                Attestation Hash {attestation.headline && <ChevronDown className={`w-3 h-3 transition-transform ${isDeepDiveOpen ? 'rotate-180' : ''}`} />}
              </span>
              <span className="text-xs font-mono font-medium tracking-wider flex items-center gap-1.5 text-white/85">
                <Github className="w-3 h-3 opacity-50" />
                {shortHash}
              </span>
            </div>

            <div data-export-hide className={`flex items-center gap-2 relative z-40 ${isExporting ? 'hidden' : ''}`}>
              {showActions && isOwner && !attestation.headline && (
                <button
                  onClick={handleRegenerate}
                  title="Generate Quantified Impact Summary"
                  disabled={isRegenerating}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 transition-colors flex items-center justify-center border border-white/10 hover:border-purple-500/30 cursor-pointer disabled:opacity-50"
                  style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
                >
                  <RefreshCw className={`w-4 h-4 opacity-70 pointer-events-none ${isRegenerating ? 'animate-spin' : ''}`} />
                </button>
              )}
              {showActions && (
                <button
                  onClick={handleDownload}
                  title="Download as Image"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors flex items-center justify-center border border-white/10 hover:border-emerald-500/30 cursor-pointer"
                  style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
                >
                  <Download className="w-4 h-4 opacity-70 hover:opacity-100 pointer-events-none" />
                </button>
              )}
              <a
                href={`https://github.com/${attestation.repo_name}/pull/${attestation.pr_number}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View Pull Request on GitHub"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border border-white/10 cursor-pointer"
                style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
              >
                <ExternalLink className="w-4 h-4 opacity-70 pointer-events-none" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetalCard;
