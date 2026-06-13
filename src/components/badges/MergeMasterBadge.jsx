import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const MergeMasterBadge = ({ earned = false, onClick, variant = "card" }) => {
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const nodeRef = useRef(null);
  const crownRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    // Path drawing
    const paths = [line1Ref.current, line2Ref.current, line3Ref.current].filter(Boolean);
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Draw lines
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.15
    });

    // Scale up node & crown
    tl.fromTo([nodeRef.current, crownRef.current],
      { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" },
      "-=0.4"
    );

    // Continuous rotations
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 22,
      repeat: -1,
      ease: "none"
    });

    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 14,
      repeat: -1,
      ease: "none"
    });
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(52,211,153,0.25)]"
        >
          <defs>
            <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <linearGradient id="neonMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <radialGradient id="mintGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="mintBlur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#mintGlow)" />

          {/* Rotating Outer Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#mintGrad)"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="15" r="3.5" fill="#34D399" />
            <circle cx="100" cy="185" r="3.5" fill="#34D399" />
          </g>

          {/* Rotating Inner Orbit */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#neonMintGrad)"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.5"
            />
          </g>

          {/* Solid Base Shield */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#111E18"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#mintGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Multi-Branch Git Merge Graph */}
          {/* Main trunk */}
          <path
            ref={line1Ref}
            d="M 100 70 L 100 135"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Left branch */}
          <path
            ref={line2Ref}
            d="M 75 75 C 75 95, 100 95, 100 115"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right branch */}
          <path
            ref={line3Ref}
            d="M 125 75 C 125 95, 100 95, 100 115"
            fill="none"
            stroke="url(#neonMintGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Nodes */}
          <circle cx="100" cy="70" r="4.5" fill="#111E18" stroke="#10B981" strokeWidth="2.5" />
          <circle cx="75" cy="75" r="4" fill="#111E18" stroke="#34D399" strokeWidth="2.5" />
          <circle cx="125" cy="75" r="4" fill="#111E18" stroke="#34D399" strokeWidth="2.5" />
          <circle cx="100" cy="130" r="4.5" fill="#111E18" stroke="#10B981" strokeWidth="2.5" />

          {/* Glowing central merge node */}
          <circle
            ref={nodeRef}
            cx="100"
            cy="108"
            r="9"
            fill="url(#mintGrad)"
            stroke="#A7F3D0"
            strokeWidth="2"
            filter="url(#mintBlur)"
          />

          {/* Master Crown at the top of shield */}
          <path
            ref={crownRef}
            d="M 88 50 L 92 56 L 100 48 L 108 56 L 112 50 L 108 60 L 92 60 Z"
            fill="url(#neonMintGrad)"
            stroke="#10B981"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 100 70 L 100 135 M 75 75 C 75 95, 100 95, 100 115 M 125 75 C 125 95, 100 95, 100 115" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="100" cy="70" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="75" cy="75" r="4" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="125" cy="75" r="4" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Merge Master">
      {renderContent()}
    </BadgeContainer>
  );
};

export default MergeMasterBadge;
