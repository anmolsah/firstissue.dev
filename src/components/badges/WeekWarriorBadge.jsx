import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const WeekWarriorBadge = ({ earned = false, onClick, variant = "card" }) => {
  const flameRef = useRef(null);
  const textRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Scale up the flame
    tl.fromTo(flameRef.current,
      { scale: 0, opacity: 0, transformOrigin: "50% 80%" },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" }
    );

    // Fade in the "7" text
    tl.fromTo(textRef.current,
      { scale: 0.5, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );

    // Continuous spin for rings
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

    // Flickering/breathing flame animation
    gsap.to(flameRef.current, {
      scaleY: 1.15,
      scaleX: 0.95,
      transformOrigin: "50% 85%",
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(249,115,22,0.25)]"
        >
          <defs>
            <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="60%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
            <linearGradient id="orangeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="fireBlur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#fireGlow)" />

          {/* Rotating Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#orangeRingGrad)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="16" r="3" fill="#F97316" />
            <circle cx="100" cy="184" r="3" fill="#F97316" />
          </g>

          {/* Rotating Inner Orbit */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#FDBA74"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.4"
            />
          </g>

          {/* Shield Base */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#1A1310"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#orangeRingGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Roaring Flame shape */}
          <path
            ref={flameRef}
            d="M 100 135 C 75 135 70 105 85 85 C 70 100 80 120 90 105 C 80 80 100 50 100 50 C 100 50 120 80 110 105 C 120 120 130 100 115 85 C 130 105 125 135 100 135 Z"
            fill="url(#fireGrad)"
            filter="url(#fireBlur)"
          />

          {/* Number "7" on top of the flame */}
          <g ref={textRef}>
            <text
              x="100"
              y="114"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="34"
              fontWeight="900"
              fill="#0F172A"
              textAnchor="middle"
              opacity="0.8"
            >
              7
            </text>
          </g>
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 100 135 C 75 135 70 105 85 85 C 80 80 100 50 100 50 C 100 50 120 80 110 105 C 130 105 125 135 100 135 Z" fill="#475569" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Week Warrior">
      {renderContent()}
    </BadgeContainer>
  );
};

export default WeekWarriorBadge;
