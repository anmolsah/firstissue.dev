import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Code, Star, Github, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

const getLanguageIcon = () => Code;
const MetalCard = ({ attestation, showActions = true }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-15 to +15 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = -((y - centerY) / centerY) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardRef.current || isExporting) return;
    
    try {
      // 1. Reset 3D rotation via React state so Framer Motion applies flat transform
      setIsExporting(true);
      setIsHovered(false);
      setRotation({ x: 0, y: 0 });
      
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

  // Determine card style based on score
  let cardTheme = "from-zinc-800 to-zinc-950 border-zinc-700/50 shadow-zinc-900/50 text-zinc-100";
  let sheenColor = "rgba(255, 255, 255, 0.1)";
  
  if (score >= 80) {
    // Legendary / Gold
    cardTheme = "from-yellow-900 to-zinc-950 border-yellow-700/50 shadow-yellow-900/50 text-yellow-100";
    sheenColor = "rgba(253, 224, 71, 0.2)";
  } else if (score >= 50) {
    // Epic / Emerald
    cardTheme = "from-emerald-900 to-zinc-950 border-emerald-700/50 shadow-emerald-900/50 text-emerald-100";
    sheenColor = "rgba(52, 211, 153, 0.2)";
  } else if (score >= 25) {
    // Rare / Blue
    cardTheme = "from-blue-900 to-zinc-950 border-blue-700/50 shadow-blue-900/50 text-blue-100";
    sheenColor = "rgba(96, 165, 250, 0.2)";
  }

  return (
    <div className="perspective-1000 w-full h-full min-h-[220px]">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: isHovered ? rotation.x : 0,
          rotateY: isHovered ? rotation.y : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5
        }}
        className={`relative w-full h-full rounded-2xl overflow-hidden cursor-pointer
          border shadow-xl backdrop-blur-sm bg-gradient-to-br ${cardTheme}
          transform-gpu preserve-3d transition-shadow duration-300
          ${isHovered ? 'shadow-2xl z-10' : ''}`}
        style={{
          boxShadow: isHovered ? `0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px ${sheenColor}` : `0 10px 30px -15px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Metallic Sheen Effect */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-20"
          animate={{
            background: isHovered 
              ? `radial-gradient(circle at ${50 + rotation.y * 3}% ${50 + rotation.x * 3}%, ${sheenColor} 0%, transparent 50%)`
              : `radial-gradient(circle at 50% 0%, ${sheenColor} 0%, transparent 60%)`
          }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Scanline pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz4KPC9zdmc+')] mix-blend-overlay pointer-events-none z-10"></div>

        {/* Card Content */}
        <div className="relative z-30 p-5 flex flex-col h-full transform-gpu translate-z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
                FirstIssue.dev
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                  <LangIcon className="w-3 h-3 text-white/80" />
                </div>
                <span className="text-xs font-semibold opacity-80 truncate max-w-[150px]">{attestation.repo_name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold tracking-wide">VERIFIED</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 mb-4">
            <h3 className="font-medium text-lg leading-tight mb-2 line-clamp-2">
              <span className="opacity-60 mr-2">#{attestation.pr_number}</span>
              {attestation.pr_title}
            </h3>
            
            <div className="flex gap-4 mt-3 opacity-80 text-sm">
              <div className="flex items-center gap-1.5" title="Impact Score">
                <Star className="w-4 h-4" />
                <span className="font-semibold">{score}</span>
              </div>
              {attestation.primary_language && (
                <div className="flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  <span className="text-xs">{attestation.primary_language}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Cryptographic Stamp */}
          <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-end bg-black/20 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Attestation Hash</span>
              <span className="text-xs font-mono font-medium tracking-wider flex items-center gap-1">
                <Github className="w-3 h-3 opacity-50" />
                {shortHash}
              </span>
            </div>
            
            {showActions && (
            <div data-export-hide className={`flex items-center gap-2 z-40 ${isExporting ? 'hidden' : ''}`}>
              <button 
                onClick={handleDownload}
                title="Download as Image"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors flex items-center justify-center border border-white/5 hover:border-emerald-500/30"
              >
                <Download className="w-4 h-4 opacity-70 hover:opacity-100" />
              </button>
              
              <a 
                href={`https://github.com/${attestation.repo_name}/pull/${attestation.pr_number}`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View on GitHub"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5"
              >
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetalCard;
