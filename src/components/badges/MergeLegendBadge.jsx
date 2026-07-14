import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const MergeLegendBadge = ({ earned = false, onClick, variant = "card" }) => {
  const mergeArrowRef = useRef(null);
  const branchLeftRef = useRef(null);
  const branchRightRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const sparklesRef = useRef([]);
  const crownRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    // Initialize path lengths for drawing animation
    const paths = [mergeArrowRef.current, branchLeftRef.current, branchRightRef.current, crownRef.current].filter(Boolean);
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1. Draw branches converging
    tl.to([branchLeftRef.current, branchRightRef.current], {
      strokeDashoffset: 0,
      duration: 1.0,
      stagger: 0.15
    });

    // 2. Draw merge arrow
    tl.to(mergeArrowRef.current, {
      strokeDashoffset: 0,
      duration: 0.8,
    }, "-=0.4");

    // 3. Draw crown
    tl.to(crownRef.current, {
      strokeDashoffset: 0,
      duration: 0.8,
    }, "-=0.3");

    // 4. Scale up core
    tl.fromTo([mergeArrowRef.current, branchLeftRef.current, branchRightRef.current],
      { scale: 0.85, transformOrigin: "50% 50%" },
      { scale: 1, duration: 0.5, ease: "back.out(1.5)" },
      "-=0.3"
    );

    // 5. Continuous rotation of outer ring
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 24,
      repeat: -1,
      ease: "none"
    });

    // 6. Subtle reverse rotation of inner ring
    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 16,
      repeat: -1,
      ease: "none"
    });

    // 7. Sparkles pulsing
    sparklesRef.current.forEach((sparkle, idx) => {
      if (sparkle) {
        gsap.to(sparkle, {
          opacity: 0.85,
          scale: 1.35,
          duration: 1.1 + idx * 0.35,
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
          className="w-full h-full drop-shadow-[0_0_18px_rgba(16,185,129,0.3)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="mergeLegendEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="mergeLegendGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
            <linearGradient id="mergeLegendTeal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
            <radialGradient id="mergeLegendGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#065F46" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="mergeLegendBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="82" fill="url(#mergeLegendGlow)" />

          {/* Rotating Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="url(#mergeLegendEmerald)"
              strokeWidth="2"
              strokeDasharray="7 7"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="14" r="3.5" fill="#6EE7B7" />
            <circle cx="100" cy="186" r="3.5" fill="#6EE7B7" />
            <circle cx="14" cy="100" r="2.5" fill="#10B981" />
            <circle cx="186" cy="100" r="2.5" fill="#10B981" />
          </g>

          {/* Rotating Inner Segmented Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#mergeLegendTeal)"
              strokeWidth="1.5"
              strokeDasharray="30 20"
              strokeOpacity="0.45"
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
            stroke="url(#mergeLegendEmerald)"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Left Branch */}
          <path
            ref={branchLeftRef}
            d="M 65 70 C 65 70, 70 85, 85 95 L 100 105"
            fill="none"
            stroke="url(#mergeLegendEmerald)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Branch */}
          <path
            ref={branchRightRef}
            d="M 135 70 C 135 70, 130 85, 115 95 L 100 105"
            fill="none"
            stroke="url(#mergeLegendEmerald)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Merge Arrow — pointing down from confluence */}
          <path
            ref={mergeArrowRef}
            d="M 100 105 L 100 140 M 90 130 L 100 140 L 110 130"
            fill="none"
            stroke="url(#mergeLegendGold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#mergeLegendBlur)"
          />

          {/* Branch nodes */}
          <circle cx="65" cy="70" r="5" fill="#6EE7B7" opacity="0.9" />
          <circle cx="135" cy="70" r="5" fill="#6EE7B7" opacity="0.9" />
          <circle cx="100" cy="105" r="6" fill="url(#mergeLegendGold)" filter="url(#mergeLegendBlur)" />

          {/* Crown above confluence */}
          <path
            ref={crownRef}
            d="M 82 60 L 88 48 L 94 56 L 100 44 L 106 56 L 112 48 L 118 60"
            fill="none"
            stroke="url(#mergeLegendGold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#mergeLegendBlur)"
          />

          {/* "25" Text */}
          <text
            x="100"
            y="88"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="url(#mergeLegendGold)"
            fontSize="16"
            fontWeight="bold"
            fontFamily="monospace"
            opacity="0.8"
          >
            25
          </text>

          {/* Sparkles */}
          <g>
            <polygon
              ref={el => sparklesRef.current[0] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#6EE7B7"
              transform="translate(-38, -22) scale(0.5)"
              transformOrigin="62 43"
              opacity="0.3"
            />
            <polygon
              ref={el => sparklesRef.current[1] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#FFE082"
              transform="translate(38, 32) scale(0.5)"
              transformOrigin="138 97"
              opacity="0.3"
            />
            <polygon
              ref={el => sparklesRef.current[2] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#5EEAD4"
              transform="translate(-25, 38) scale(0.4)"
              transformOrigin="75 103"
              opacity="0.2"
            />
          </g>
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 65 70 C 65 70, 70 85, 85 95 L 100 105" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <path d="M 135 70 C 135 70, 130 85, 115 95 L 100 105" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <path d="M 100 105 L 100 140 M 90 130 L 100 140 L 110 130" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Merge Legend">
      {renderContent()}
    </BadgeContainer>
  );
};

export default MergeLegendBadge;
