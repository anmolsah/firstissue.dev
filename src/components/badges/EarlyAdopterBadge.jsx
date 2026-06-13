import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const EarlyAdopterBadge = ({ earned = false, onClick, variant = "card" }) => {
  const portalRef = useRef(null);
  const rocketRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const sparklesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Scale up the cyber portal
    tl.fromTo(portalRef.current,
      { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" }
    );

    // Launch rocket from portal
    tl.fromTo(rocketRef.current,
      { y: 30, scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)" },
      "-=0.4"
    );

    // Continuous spin for rings
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 24,
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

    // Pulse sparkles
    sparklesRef.current.forEach((sparkle, idx) => {
      if (sparkle) {
        gsap.to(sparkle, {
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        >
          <defs>
            <linearGradient id="cyberCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="cyberIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0" />
              <stop offset="50%" stopColor="#F97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0B0C10" stopOpacity="0" />
            </radialGradient>
            <filter id="cyanBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Radial Portal Glow */}
          <circle cx="100" cy="100" r="75" fill="url(#portalGlow)" />

          {/* Outer Cyber Orbit Ring */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#cyberCyan)"
              strokeWidth="2"
              strokeDasharray="15 10 5 10"
              strokeOpacity="0.7"
            />
            {/* Tech Dots */}
            <circle cx="100" cy="15" r="3.5" fill="#22D3EE" />
            <circle cx="15" cy="100" r="3.5" fill="#22D3EE" />
            <circle cx="100" cy="185" r="3.5" fill="#22D3EE" />
            <circle cx="185" cy="100" r="3.5" fill="#22D3EE" />
          </g>

          {/* Inner Segmented Tech Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#cyberIndigo)"
              strokeWidth="1.5"
              strokeDasharray="40 25 15 25"
              strokeOpacity="0.5"
            />
          </g>

          {/* Shield Portal Base */}
          <polygon
            ref={portalRef}
            points="100,35 150,60 150,140 100,165 50,140 50,60"
            fill="#0F172A"
            stroke="url(#cyberCyan)"
            strokeWidth="2.5"
            filter="url(#cyanBlur)"
          />

          {/* Sparkles / Cyber Stars */}
          <g>
            <path ref={el => sparklesRef.current[0] = el} d="M 68 55 L 70 58 L 73 55 L 70 52 Z" fill="#22D3EE" />
            <path ref={el => sparklesRef.current[1] = el} d="M 132 55 L 134 58 L 137 55 L 134 52 Z" fill="#22D3EE" />
            <path ref={el => sparklesRef.current[2] = el} d="M 60 120 L 62 123 L 65 120 L 62 117 Z" fill="#818CF8" />
            <path ref={el => sparklesRef.current[3] = el} d="M 140 120 L 142 123 L 145 120 L 142 117 Z" fill="#818CF8" />
          </g>

          {/* Rocket Ship Design */}
          <g ref={rocketRef}>
            {/* Rocket Tail Flame */}
            <path
              d="M 92 125 L 100 155 L 108 125 Z"
              fill="url(#flameGrad)"
            />
            <path
              d="M 95 125 L 100 145 L 105 125 Z"
              fill="#FBBF24"
            />

            {/* Wings */}
            <path
              d="M 75 120 C 75 120, 80 125, 90 120 L 90 95 Z"
              fill="url(#cyberIndigo)"
              stroke="url(#cyberCyan)"
              strokeWidth="1"
            />
            <path
              d="M 125 120 C 125 120, 120 125, 110 120 L 110 95 Z"
              fill="url(#cyberIndigo)"
              stroke="url(#cyberCyan)"
              strokeWidth="1"
            />

            {/* Rocket Body */}
            <path
              d="M 90 120 L 90 85 C 90 65, 100 50, 100 50 C 100 50, 110 65, 110 85 L 110 120 Z"
              fill="url(#rocketGrad)"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Window */}
            <circle
              cx="100"
              cy="85"
              r="6"
              fill="#0F172A"
              stroke="url(#cyberCyan)"
              strokeWidth="1.5"
            />
            <circle
              cx="98"
              cy="83"
              r="1.5"
              fill="#FFFFFF"
              opacity="0.8"
            />

            {/* Nose Cone Trim */}
            <path
              d="M 93 70 C 97 60, 100 52, 100 52 C 100 52, 103 60, 107 70 Z"
              fill="url(#cyberCyan)"
            />
          </g>
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 150,60 150,140 100,165 50,140 50,60" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
            <path d="M 90 120 L 90 85 C 90 65, 100 50, 100 50 C 100 50, 110 65, 110 85 L 110 120 Z" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <circle cx="100" cy="85" r="6" fill="#1E293B" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Early Adopter">
      {renderContent()}
    </BadgeContainer>
  );
};

export default EarlyAdopterBadge;
