import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code, Star, Github, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

const getLanguageIcon = () => Code;
const MetalCard = ({ attestation, showActions = true }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardRef.current || isExporting) return;
    
    try {
      // 1. Reset hover state
      setIsExporting(true);
      setIsHovered(false);
      
      // 2. Wait for Framer Motion to settle to the flat orientation and React to hide buttons
      await new Promise(r => setTimeout(r, 350));

      // 3. Find and hide the action buttons container via DOM (belt-and-suspenders with isExporting)
      const actionsEl = cardRef.current.querySelector('[data-export-hide]');
      if (actionsEl) actionsEl.style.display = 'none';

      const dataUrl = await toPng(cardRef.current, { 
        quality: 1.0,
        pixelRatio: 4, // Premium 4x resolution for crisp exports
        skipFonts: false,
        cacheBust: true,
        style: {
          transform: 'none', // Ensure no residual 3D transform in the capture
        },
      });
      
      // 4. Restore action buttons visibility
      if (actionsEl) actionsEl.style.display = '';
      setIsExporting(false);

      const link = document.createElement('a');
      link.download = `${attestation.repo_name.replace('/', '-')}-pow.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      // Restore state on failure
      const actionsEl = cardRef.current?.querySelector('[data-export-hide]');
      if (actionsEl) actionsEl.style.display = '';
      setIsExporting(false);
    }
  };

  const LangIcon = getLanguageIcon(attestation.primary_language);
  const shortHash = attestation.tx_hash ? `${attestation.tx_hash.substring(0, 6)}...${attestation.tx_hash.substring(attestation.tx_hash.length - 4)}` : 'Minting...';
  const score = attestation.impact_score || 0;

  // ── Premium tier system based on impact score ──
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
          <div className="mb-4">
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              FirstIssue.dev
            </span>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                <LangIcon className="w-3 h-3 text-white/80" />
              </div>
              <span className="text-xs font-semibold text-white/70 truncate max-w-[150px]">{attestation.repo_name}</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 mb-3">
            <h3 className="font-semibold text-[17px] leading-snug mb-2 line-clamp-2 text-white">
              <span className="opacity-50 mr-1.5 font-mono">#{attestation.pr_number}</span>
              {attestation.pr_title}
            </h3>

            {/* Impact meter */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/45 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Verified Impact
                </span>
                <span className="text-xs font-bold font-mono" style={{ color: tier.accent }}>
                  {score}<span className="text-white/35">/100</span>
                </span>
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
              {attestation.primary_language && (
                <div className="flex items-center gap-1.5 mt-2.5 text-white/55">
                  <Code className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{attestation.primary_language}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Cryptographic Stamp */}
          <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-end bg-black/25 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono opacity-45 uppercase tracking-[0.2em]">Attestation Hash</span>
              <span className="text-xs font-mono font-medium tracking-wider flex items-center gap-1.5 text-white/85">
                <Github className="w-3 h-3 opacity-50" />
                {shortHash}
              </span>
            </div>

            <div data-export-hide className={`flex items-center gap-2 relative z-40 ${isExporting ? 'hidden' : ''}`}>
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
