import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const VerifiedContributorBadge = ({ earned = false, onClick, variant = "card" }) => {
  const checkRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    try {
      const length = checkRef.current.getTotalLength();
      gsap.set(checkRef.current, { strokeDasharray: length, strokeDashoffset: length });
    } catch (e) {
      console.warn("Could not get path length", e);
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Draw check
    tl.to(checkRef.current, {
      strokeDashoffset: 0,
      duration: 1.0
    });

    // Spin rings
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 20,
      repeat: -1,
      ease: "none"
    });

    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 12,
      repeat: -1,
      ease: "none"
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
            <linearGradient id="powEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="powMint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <radialGradient id="powGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="powBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#powGlow)" />

          {/* Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#powEmerald)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="16" r="3.5" fill="#34D399" />
            <circle cx="100" cy="184" r="3.5" fill="#34D399" />
          </g>

          {/* Inner Segmented Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#A7F3D0"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.4"
            />
          </g>

          {/* Shield Base */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#111E18"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#powEmerald)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Shield Badge Attestation Icon (glowing checkmark inside a badge/ribbon framework) */}
          <path
            ref={checkRef}
            d="M 80 102 L 94 116 L 124 84"
            fill="none"
            stroke="url(#powMint)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#powBlur)"
          />

          {/* Tiny Ribbon details at bottom of check */}
          <path
            d="M 94 116 L 94 135"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 80 102 L 94 116 L 124 84" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Verified Contributor">
      {renderContent()}
    </BadgeContainer>
  );
};

export default VerifiedContributorBadge;
