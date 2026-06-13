import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const MergeChampionBadge = ({ earned = false, onClick, variant = "card" }) => {
  const trunkRef = useRef(null);
  const pathL1Ref = useRef(null);
  const pathL2Ref = useRef(null);
  const pathR1Ref = useRef(null);
  const pathR2Ref = useRef(null);
  const nodesRef = useRef(null);
  const crownRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    // Draw paths dynamically
    const paths = [
      trunkRef.current,
      pathL1Ref.current,
      pathL2Ref.current,
      pathR1Ref.current,
      pathR2Ref.current
    ].filter(Boolean);

    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Draw all paths in succession
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.4,
      stagger: 0.15
    });

    // Scale up node clusters and crown
    tl.fromTo([nodesRef.current, crownRef.current],
      { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" },
      "-=0.4"
    );

    // Continuous animations
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 26,
      repeat: -1,
      ease: "none"
    });

    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 16,
      repeat: -1,
      ease: "none"
    });

    // Shine stars
    starsRef.current.forEach((star, idx) => {
      if (star) {
        gsap.to(star, {
          scale: 1.2,
          opacity: 0.9,
          duration: 0.6 + idx * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    });
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        >
          <defs>
            <linearGradient id="emeraldChampionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="neonMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <radialGradient id="championGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="championBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#championGlow)" />

          {/* Rotating Outer Hex Ring */}
          <g ref={outerRingRef}>
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              fill="none"
              stroke="url(#emeraldChampionGrad)"
              strokeWidth="2"
              strokeDasharray="10 12"
              strokeOpacity="0.5"
            />
            {/* Outer Gems */}
            <circle cx="100" cy="10" r="3.5" fill="#FDE047" />
            <circle cx="100" cy="190" r="3.5" fill="#FDE047" />
          </g>

          {/* Rotating Inner Orbit Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="url(#neonMintGrad)"
              strokeWidth="1.5"
              strokeDasharray="50 30"
              strokeOpacity="0.4"
            />
          </g>

          {/* Base Shield */}
          <polygon
            points="100,32 158,62 158,138 100,168 42,138 42,62"
            fill="#0B1310"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,40 150,66 150,134 100,160 50,134 50,66"
            fill="none"
            stroke="url(#emeraldChampionGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Laurels / Leaves surrounding the merge tree */}
          <path
            d="M 52,110 C 45,90 52,70 65,65 M 148,110 C 155,90 148,70 135,65"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
          />

          {/* Git Merge Branch Lines - Grander 5-branch merge graph */}
          {/* Main Trunk */}
          <path
            ref={trunkRef}
            d="M 100 68 L 100 138"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Left Branch 1 (Outer) */}
          <path
            ref={pathL1Ref}
            d="M 68 75 C 68 100, 100 100, 100 125"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left Branch 2 (Inner) */}
          <path
            ref={pathL2Ref}
            d="M 84 82 C 84 95, 100 95, 100 108"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Right Branch 1 (Outer) */}
          <path
            ref={pathR1Ref}
            d="M 132 75 C 132 100, 100 100, 100 125"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Right Branch 2 (Inner) */}
          <path
            ref={pathR2Ref}
            d="M 116 82 C 116 95, 100 95, 100 108"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Achievement Stars */}
          <g>
            <path ref={el => starsRef.current[0] = el} d="M 58 135 L 60 138 L 63 135 L 60 132 Z" fill="#FDE047" opacity="0.6" />
            <path ref={el => starsRef.current[1] = el} d="M 142 135 L 144 138 L 147 135 L 144 132 Z" fill="#FDE047" opacity="0.6" />
          </g>

          {/* Tech Nodes */}
          <g ref={nodesRef}>
            <circle cx="100" cy="68" r="4.5" fill="#0B1310" stroke="#10B981" strokeWidth="2.5" />
            <circle cx="68" cy="75" r="4" fill="#0B1310" stroke="#34D399" strokeWidth="2.5" />
            <circle cx="84" cy="82" r="3.5" fill="#0B1310" stroke="#34D399" strokeWidth="2" />
            <circle cx="132" cy="75" r="4" fill="#0B1310" stroke="#34D399" strokeWidth="2.5" />
            <circle cx="116" cy="82" r="3.5" fill="#0B1310" stroke="#34D399" strokeWidth="2" />
            <circle cx="100" cy="132" r="4.5" fill="#0B1310" stroke="#10B981" strokeWidth="2.5" />

            {/* Glowing Master Merge Node */}
            <circle
              cx="100"
              cy="114"
              r="10"
              fill="url(#emeraldChampionGrad)"
              stroke="#A7F3D0"
              strokeWidth="2"
              filter="url(#championBlur)"
            />
          </g>

          {/* Grand Crown on top of the shield portal */}
          <path
            ref={crownRef}
            d="M 85 45 L 90 52 L 100 42 L 110 52 L 115 45 L 110 58 L 90 58 Z"
            fill="url(#goldHighlight)"
            stroke="#CA8A04"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <path d="M 100 68 L 100 138 M 68 75 C 68 100, 100 100, 100 125 M 84 82 C 84 95, 100 95, 100 108 M 132 75 C 132 100, 100 100, 100 125" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="68" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="68" cy="75" r="4" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="84" cy="82" r="3.5" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
            <circle cx="132" cy="75" r="4" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#0b0c10]/90 border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "raw") {
    return renderContent();
  }

  return (
    <BadgeContainer earned={earned} onClick={onClick} title="Merge Champion">
      {renderContent()}
    </BadgeContainer>
  );
};

export default MergeChampionBadge;
