import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const ImpactMakerBadge = ({ earned = false, onClick, variant = "card" }) => {
  const check1Ref = useRef(null);
  const check2Ref = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const crownRef = useRef(null);
  const sparklesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    // Set check lengths
    const checks = [check1Ref.current, check2Ref.current].filter(Boolean);
    checks.forEach(check => {
      try {
        const length = check.getTotalLength();
        gsap.set(check, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Draw checkmarks sequentially
    tl.to(checks, {
      strokeDashoffset: 0,
      duration: 1.0,
      stagger: 0.2
    });

    // Zoom crown
    tl.fromTo(crownRef.current,
      { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" },
      "-=0.4"
    );

    // Spin orbits
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 25,
      repeat: -1,
      ease: "none"
    });

    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 15,
      repeat: -1,
      ease: "none"
    });

    // Pulse sparkles
    sparklesRef.current.forEach((s, idx) => {
      if (s) {
        gsap.to(s, {
          opacity: 0.2,
          scale: 0.8,
          duration: 0.8 + idx * 0.3,
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.25)]"
        >
          <defs>
            <linearGradient id="impactCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="impactBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <radialGradient id="impactGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="impactBlur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#impactGlow)" />

          {/* Rotating Outer Hexagon */}
          <polygon
            ref={outerRingRef}
            points="100,12 176,56 176,144 100,188 24,144 24,56"
            fill="none"
            stroke="url(#impactCyan)"
            strokeWidth="2"
            strokeDasharray="8 10"
            strokeOpacity="0.6"
          />

          {/* Rotating Inner segmented orbit */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#impactBlue)"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.5"
            />
          </g>

          {/* Shield Base */}
          <polygon
            points="100,32 158,62 158,138 100,168 42,138 42,62"
            fill="#0F1B1F"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,40 150,66 150,134 100,160 50,134 50,66"
            fill="none"
            stroke="url(#impactCyan)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Sparkles */}
          <g>
            <circle ref={el => sparklesRef.current[0] = el} cx="65" cy="55" r="2" fill="#22D3EE" opacity="0.6" />
            <circle ref={el => sparklesRef.current[1] = el} cx="135" cy="55" r="2.5" fill="#22D3EE" opacity="0.4" />
          </g>

          {/* Double Checkmark design */}
          {/* Checkmark 1 (Lower Left) */}
          <path
            ref={check1Ref}
            d="M 68 105 L 82 119 L 110 89"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          {/* Checkmark 2 (Upper Right / Foreground) */}
          <path
            ref={check2Ref}
            d="M 85 97 L 98 111 L 132 75"
            fill="none"
            stroke="url(#impactCyan)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#impactBlur)"
          />

          {/* Crown */}
          <path
            ref={crownRef}
            d="M 88 44 L 92 50 L 100 40 L 108 50 L 112 44 L 106 54 L 94 54 Z"
            fill="url(#impactCyan)"
            stroke="#0891B2"
            strokeWidth="1"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <path d="M 68 105 L 82 119 L 110 89 M 85 97 L 98 111 L 132 75" fill="none" stroke="#64748B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Impact Maker">
      {renderContent()}
    </BadgeContainer>
  );
};

export default ImpactMakerBadge;
