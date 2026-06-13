import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const ProlificContributorBadge = ({ earned = false, onClick, variant = "card" }) => {
  const numberRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const leftBracketRef = useRef(null);
  const rightBracketRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    // Draw bracket lines
    const brackets = [leftBracketRef.current, rightBracketRef.current].filter(Boolean);
    brackets.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Draw bracket lines
    tl.to(brackets, {
      strokeDashoffset: 0,
      duration: 1.0,
      stagger: 0.15
    });

    // Scale and bounce number "25"
    tl.fromTo(numberRef.current,
      { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.8)" },
      "-=0.5"
    );

    // Continuous animations
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

    // Sparkles pulsing
    particlesRef.current.forEach((p, idx) => {
      if (p) {
        gsap.to(p, {
          y: "-=6",
          opacity: 0.3,
          duration: 1.0 + idx * 0.4,
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(244,63,94,0.25)]"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FECDD3" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
            <radialGradient id="pinkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="pinkBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#pinkGlow)" />

          {/* Rotating Outer Hexagonal Orbit */}
          <g ref={outerRingRef}>
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              fill="none"
              stroke="url(#pinkGradient)"
              strokeWidth="1.5"
              strokeDasharray="8 10"
              strokeOpacity="0.5"
            />
            <circle cx="100" cy="10" r="3" fill="#FB7185" />
            <circle cx="178" cy="55" r="3" fill="#FB7185" />
            <circle cx="178" cy="145" r="3" fill="#FB7185" />
            <circle cx="100" cy="190" r="3" fill="#FB7185" />
            <circle cx="22" cy="145" r="3" fill="#FB7185" />
            <circle cx="22" cy="55" r="3" fill="#FB7185" />
          </g>

          {/* Rotating Inner Orbit Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#neonPink)"
              strokeWidth="2"
              strokeDasharray="30 40"
              strokeOpacity="0.6"
            />
          </g>

          {/* Shield Base */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#1E1114"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#pinkGradient)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Floating Sparkles */}
          <g>
            <circle ref={el => particlesRef.current[0] = el} cx="68" cy="62" r="2" fill="#FECDD3" opacity="0.6" />
            <circle ref={el => particlesRef.current[1] = el} cx="132" cy="62" r="2.5" fill="#FECDD3" opacity="0.4" />
            <circle ref={el => particlesRef.current[2] = el} cx="72" cy="138" r="2.5" fill="#FECDD3" opacity="0.5" />
            <circle ref={el => particlesRef.current[3] = el} cx="128" cy="138" r="2" fill="#FECDD3" opacity="0.6" />
          </g>

          {/* Code Brackets */}
          <path
            ref={leftBracketRef}
            d="M 78 82 L 64 100 L 78 118"
            fill="none"
            stroke="url(#neonPink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={rightBracketRef}
            d="M 122 82 L 136 100 L 122 118"
            fill="none"
            stroke="url(#neonPink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Big central achievement number "25" */}
          <g ref={numberRef}>
            <text
              x="100"
              y="114"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="44"
              fontWeight="900"
              fill="url(#pinkGradient)"
              textAnchor="middle"
              filter="url(#pinkBlur)"
            >
              25
            </text>
            <text
              x="100"
              y="114"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="44"
              fontWeight="900"
              fill="url(#neonPink)"
              textAnchor="middle"
            >
              25
            </text>
          </g>
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 78 82 L 64 100 L 78 118 M 122 82 L 136 100 L 122 118" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <text x="100" y="114" fontFamily="sans-serif" fontSize="44" fontWeight="900" fill="#64748B" textAnchor="middle">25</text>
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
    <BadgeContainer earned={earned} onClick={onClick} title="Prolific Contributor">
      {renderContent()}
    </BadgeContainer>
  );
};

export default ProlificContributorBadge;
