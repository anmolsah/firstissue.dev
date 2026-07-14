import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const CenturionBadge = ({ earned = false, onClick, variant = "card" }) => {
  const swordRef = useRef(null);
  const shieldRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const sparklesRef = useRef([]);
  const laurelLeftRef = useRef(null);
  const laurelRightRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    // Initialize path lengths for drawing animation
    const paths = [swordRef.current, shieldRef.current, laurelLeftRef.current, laurelRightRef.current].filter(Boolean);
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1. Draw laurel wreath
    tl.to([laurelLeftRef.current, laurelRightRef.current], {
      strokeDashoffset: 0,
      duration: 1.2,
      stagger: 0.2
    });

    // 2. Draw shield
    tl.to(shieldRef.current, {
      strokeDashoffset: 0,
      duration: 0.8,
    }, "-=0.6");

    // 3. Draw sword
    tl.to(swordRef.current, {
      strokeDashoffset: 0,
      duration: 1.0,
    }, "-=0.4");

    // 4. Scale up core elements
    tl.fromTo([swordRef.current, shieldRef.current],
      { scale: 0.85, transformOrigin: "50% 50%" },
      { scale: 1, duration: 0.5, ease: "back.out(1.5)" },
      "-=0.3"
    );

    // 5. Continuous rotation of outer ring
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 28,
      repeat: -1,
      ease: "none"
    });

    // 6. Subtle reverse rotation of inner ring
    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 18,
      repeat: -1,
      ease: "none"
    });

    // 7. Sparkles pulsing
    sparklesRef.current.forEach((sparkle, idx) => {
      if (sparkle) {
        gsap.to(sparkle, {
          opacity: 0.9,
          scale: 1.3,
          duration: 1.2 + idx * 0.3,
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
          className="w-full h-full drop-shadow-[0_0_18px_rgba(220,38,38,0.3)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="centurionGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>
            <linearGradient id="centurionRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="centurionCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
            <radialGradient id="centurionGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#991B1B" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="centurionBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="82" fill="url(#centurionGlow)" />

          {/* Rotating Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="url(#centurionGold)"
              strokeWidth="2"
              strokeDasharray="8 6"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="14" r="3.5" fill="#FFD700" />
            <circle cx="100" cy="186" r="3.5" fill="#FFD700" />
          </g>

          {/* Rotating Inner Segmented Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#centurionRed)"
              strokeWidth="1.5"
              strokeDasharray="35 18"
              strokeOpacity="0.5"
            />
          </g>

          {/* Shield Base — hexagonal */}
          <polygon
            points="100,32 158,62 158,138 100,168 42,138 42,62"
            fill="#11121F"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,40 150,66 150,134 100,160 50,134 50,66"
            fill="none"
            stroke="url(#centurionRed)"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Laurel Wreath — Left */}
          <path
            ref={laurelLeftRef}
            d="M 56 120 C 52 110, 50 98, 52 86 C 54 78, 58 72, 64 68 C 58 78, 56 90, 58 102"
            fill="none"
            stroke="url(#centurionGold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Laurel Wreath — Right */}
          <path
            ref={laurelRightRef}
            d="M 144 120 C 148 110, 150 98, 148 86 C 146 78, 142 72, 136 68 C 142 78, 144 90, 142 102"
            fill="none"
            stroke="url(#centurionGold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Shield Emblem */}
          <path
            ref={shieldRef}
            d="M 100 60 L 125 75 L 125 110 L 100 130 L 75 110 L 75 75 Z"
            fill="none"
            stroke="url(#centurionCrimson)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Shield Inner Fill */}
          <path
            d="M 100 65 L 121 77 L 121 108 L 100 125 L 79 108 L 79 77 Z"
            fill="url(#centurionRed)"
            opacity="0.2"
          />

          {/* Sword — vertical through shield */}
          <path
            ref={swordRef}
            d="M 100 50 L 100 140 M 90 62 L 110 62"
            fill="none"
            stroke="url(#centurionGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#centurionBlur)"
          />

          {/* "100" Text */}
          <text
            x="100"
            y="102"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="url(#centurionGold)"
            fontSize="22"
            fontWeight="bold"
            fontFamily="monospace"
            filter="url(#centurionBlur)"
          >
            100
          </text>

          {/* Sparkles */}
          <g>
            <polygon
              ref={el => sparklesRef.current[0] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#FFD700"
              transform="translate(-42, -18) scale(0.5)"
              transformOrigin="58 47"
              opacity="0.3"
            />
            <polygon
              ref={el => sparklesRef.current[1] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#FF4444"
              transform="translate(42, 28) scale(0.5)"
              transformOrigin="142 93"
              opacity="0.3"
            />
            <polygon
              ref={el => sparklesRef.current[2] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#FFD700"
              transform="translate(20, -35) scale(0.4)"
              transformOrigin="120 30"
              opacity="0.2"
            />
          </g>
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 100 60 L 125 75 L 125 110 L 100 130 L 75 110 L 75 75 Z" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 100 50 L 100 140 M 90 62 L 110 62" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Centurion">
      {renderContent()}
    </BadgeContainer>
  );
};

export default CenturionBadge;
