import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const MonthMasterBadge = ({ earned = false, onClick, variant = "card" }) => {
  const mainFlameRef = useRef(null);
  const leftFlameRef = useRef(null);
  const rightFlameRef = useRef(null);
  const textRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Roar up the flames
    tl.fromTo([mainFlameRef.current, leftFlameRef.current, rightFlameRef.current],
      { scale: 0, opacity: 0, transformOrigin: "50% 85%" },
      { scale: 1, opacity: 1, duration: 0.9, stagger: 0.1, ease: "back.out(1.8)" }
    );

    // Zoom in the "30" text
    tl.fromTo(textRef.current,
      { scale: 0.3, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.4"
    );

    // Continuous spin for rings
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

    // Flickering flames
    gsap.to(mainFlameRef.current, {
      scaleY: 1.12,
      scaleX: 0.96,
      duration: 0.75,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to([leftFlameRef.current, rightFlameRef.current], {
      scaleY: 1.16,
      scaleX: 0.93,
      duration: 0.65,
      repeat: -1,
      yoyo: true,
      stagger: 0.15,
      ease: "sine.inOut"
    });

    // Floating particles
    particlesRef.current.forEach((p, idx) => {
      if (p) {
        gsap.to(p, {
          y: "-=10",
          x: "+=" + (idx % 2 === 0 ? 3 : -3),
          opacity: 0.2,
          duration: 1.2 + idx * 0.3,
          repeat: -1,
          ease: "power1.inOut"
        });
      }
    });
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_18px_rgba(249,115,22,0.3)]"
        >
          <defs>
            <linearGradient id="monthFireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="40%" stopColor="#F97316" />
              <stop offset="80%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <linearGradient id="monthGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <radialGradient id="monthGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="monthBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#monthGlow)" />

          {/* Rotating Outer Hex Orbit */}
          <g ref={outerRingRef}>
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              fill="none"
              stroke="url(#monthGoldGrad)"
              strokeWidth="2.0"
              strokeDasharray="12 10"
              strokeOpacity="0.6"
            />
            {/* Tech Dots */}
            <circle cx="100" cy="10" r="3.5" fill="#F59E0B" />
            <circle cx="178" cy="55" r="3" fill="#F59E0B" />
            <circle cx="178" cy="145" r="3" fill="#F59E0B" />
            <circle cx="100" cy="190" r="3.5" fill="#F59E0B" />
            <circle cx="22" cy="145" r="3" fill="#F59E0B" />
            <circle cx="22" cy="55" r="3" fill="#F59E0B" />
          </g>

          {/* Rotating Inner Segmented Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="#FED7AA"
              strokeWidth="1.5"
              strokeDasharray="30 25 15 25"
              strokeOpacity="0.5"
            />
          </g>

          {/* Solid Shield Base */}
          <polygon
            points="100,32 158,62 158,138 100,168 42,138 42,62"
            fill="#1E140F"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,40 150,66 150,134 100,160 50,134 50,66"
            fill="none"
            stroke="url(#monthGoldGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Rising Sparks */}
          <g>
            <circle ref={el => particlesRef.current[0] = el} cx="70" cy="130" r="2" fill="#FDBA74" opacity="0.6" />
            <circle ref={el => particlesRef.current[1] = el} cx="130" cy="130" r="2.5" fill="#FDBA74" opacity="0.4" />
            <circle ref={el => particlesRef.current[2] = el} cx="75" cy="80" r="2" fill="#FEF08A" opacity="0.5" />
            <circle ref={el => particlesRef.current[3] = el} cx="125" cy="80" r="3" fill="#FEF08A" opacity="0.6" />
          </g>

          {/* Triple Roaring Flames */}
          {/* Left Wing Flame */}
          <path
            ref={leftFlameRef}
            d="M 85 130 C 70 130 65 105 78 90 C 70 100 75 115 82 105 C 75 85 90 70 90 70 C 90 70 100 88 95 108 C 100 118 105 105 98 92 C 105 108 100 130 85 130 Z"
            fill="url(#monthFireGrad)"
            opacity="0.85"
          />
          {/* Right Wing Flame */}
          <path
            ref={rightFlameRef}
            d="M 115 130 C 100 130 95 108 102 92 C 95 105 100 118 105 108 C 100 88 110 70 110 70 C 110 70 125 85 118 105 C 125 115 130 100 122 90 C 135 105 130 130 115 130 Z"
            fill="url(#monthFireGrad)"
            opacity="0.85"
          />
          {/* Center Main Flame */}
          <path
            ref={mainFlameRef}
            d="M 100 135 C 72 135 68 105 82 82 C 68 98 78 118 88 102 C 78 75 100 42 100 42 C 100 42 122 75 112 102 C 122 118 132 98 118 82 C 132 105 128 135 100 135 Z"
            fill="url(#monthFireGrad)"
            filter="url(#monthBlur)"
          />

          {/* Golden calendar fire crown */}
          <path
            d="M 88 44 L 92 50 L 100 40 L 108 50 L 112 44 L 106 54 L 94 54 Z"
            fill="url(#monthGoldGrad)"
          />

          {/* Number "30" on top of the flame */}
          <g ref={textRef}>
            <text
              x="100"
              y="114"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="32"
              fontWeight="950"
              fill="#0A0B10"
              textAnchor="middle"
              opacity="0.85"
            >
              30
            </text>
          </g>
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <path d="M 100 135 C 72 135 68 105 82 82 C 78 75 100 42 100 42 C 100 42 122 75 112 102 C 128 135 100 135 Z" fill="#475569" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Month Master">
      {renderContent()}
    </BadgeContainer>
  );
};

export default MonthMasterBadge;
