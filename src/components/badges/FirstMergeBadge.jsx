import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const FirstMergeBadge = ({ earned = false, onClick, variant = "card" }) => {
  const branchPath1Ref = useRef(null);
  const branchPath2Ref = useRef(null);
  const mergeNodeRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    // Path drawing
    const paths = [branchPath1Ref.current, branchPath2Ref.current].filter(Boolean);
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Draw branch lines
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.2
    });

    // Animate merge node appearing
    tl.fromTo(mergeNodeRef.current,
      { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" },
      "-=0.4"
    );

    // Continuous animations
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
    <div className="relative w-28 h-28 flex items-center justify-center">
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        >
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="neonEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="neonMint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="emeraldBlur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#emeraldGlow)" />

          {/* Rotating Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#neonEmerald)"
              strokeWidth="2"
              strokeDasharray="8 6"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="15" r="3.5" fill="#34D399" />
            <circle cx="100" cy="185" r="3.5" fill="#34D399" />
          </g>

          {/* Rotating Inner Segmented Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#neonMint)"
              strokeWidth="1.5"
              strokeDasharray="30 15"
              strokeOpacity="0.4"
            />
          </g>

          {/* Shield Base */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#111A1E"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#neonEmerald)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Git Merge Branch Lines */}
          <path
            ref={branchPath1Ref}
            d="M 85 65 L 85 135"
            fill="none"
            stroke="#34D399"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            ref={branchPath2Ref}
            d="M 125 75 C 125 95, 85 95, 85 115"
            fill="none"
            stroke="url(#neonMint)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Git Branch Nodes */}
          <circle cx="85" cy="70" r="5" fill="#111A1E" stroke="#34D399" strokeWidth="3" />
          <circle cx="125" cy="75" r="5" fill="#111A1E" stroke="#6EE7B7" strokeWidth="3" />
          <circle cx="85" cy="130" r="5" fill="#111A1E" stroke="#34D399" strokeWidth="3" />

          {/* Glowing central merge node */}
          <circle
            ref={mergeNodeRef}
            cx="85"
            cy="110"
            r="10"
            fill="url(#emeraldGradient)"
            stroke="#A7F3D0"
            strokeWidth="2.5"
            filter="url(#emeraldBlur)"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 85 65 L 85 135 M 125 75 C 125 95, 85 95, 85 115" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <circle cx="85" cy="70" r="5" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
            <circle cx="125" cy="75" r="5" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
            <circle cx="85" cy="130" r="5" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="First Merge">
      {renderContent()}
    </BadgeContainer>
  );
};

export default FirstMergeBadge;
