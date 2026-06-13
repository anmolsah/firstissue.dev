import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const FirstContributionBadge = ({ earned = false, onClick, variant = "card" }) => {
  const starRef = useRef(null);
  const bracketLeftRef = useRef(null);
  const bracketRightRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const sparklesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    // Initialize path lengths for drawing animation
    const paths = [bracketLeftRef.current, bracketRightRef.current, starRef.current].filter(Boolean);
    paths.forEach(path => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      } catch (e) {
        console.warn("Could not get path length", e);
      }
    });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1. Draw paths
    tl.to([bracketLeftRef.current, bracketRightRef.current], {
      strokeDashoffset: 0,
      duration: 1.0,
      stagger: 0.15
    });

    tl.to(starRef.current, {
      strokeDashoffset: 0,
      duration: 1.2,
    }, "-=0.6");

    // 2. Scale up core
    tl.fromTo([starRef.current, bracketLeftRef.current, bracketRightRef.current], 
      { scale: 0.8, transformOrigin: "50% 50%" },
      { scale: 1, duration: 0.6, ease: "back.out(1.5)" },
      "-=0.4"
    );

    // 3. Continuous rotation of outer ring
    gsap.to(outerRingRef.current, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 25,
      repeat: -1,
      ease: "none"
    });

    // 4. Subtle reverse rotation of inner ring
    gsap.to(innerRingRef.current, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 15,
      repeat: -1,
      ease: "none"
    });

    // 5. Sparkles pulsing
    sparklesRef.current.forEach((sparkle, idx) => {
      if (sparkle) {
        gsap.to(sparkle, {
          opacity: 0.8,
          scale: 1.4,
          duration: 1 + idx * 0.4,
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.25)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FF6F00" />
            </linearGradient>
            <linearGradient id="neonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <radialGradient id="glowBackdrop" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#glowBackdrop)" />

          {/* Rotating Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#neonBlue)"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="15" r="3.5" fill="#60A5FA" />
            <circle cx="100" cy="185" r="3.5" fill="#60A5FA" />
          </g>

          {/* Rotating Inner Segmented Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#neonPurple)"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.5"
            />
          </g>

          {/* Solid Base Shield */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#11121F"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#neonBlue)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Sparkles / Little Stars */}
          <g>
            <polygon
              ref={el => sparklesRef.current[0] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#60A5FA"
              transform="translate(-35, -20) scale(0.6)"
              transform-origin="65 45"
              opacity="0.3"
            />
            <polygon
              ref={el => sparklesRef.current[1] = el}
              points="100,55 102,63 110,65 102,67 100,75 98,67 90,65 98,63"
              fill="#A78BFA"
              transform="translate(35, 30) scale(0.6)"
              transform-origin="135 95"
              opacity="0.3"
            />
          </g>

          {/* Code Brackets (Left "<" and Right ">") */}
          <path
            ref={bracketLeftRef}
            d="M 73 80 L 55 100 L 73 120"
            fill="none"
            stroke="url(#neonPurple)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={bracketRightRef}
            d="M 127 80 L 145 100 L 127 120"
            fill="none"
            stroke="url(#neonPurple)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Central Star */}
          <polygon
            ref={starRef}
            points="100,70 109,90 130,93 115,108 119,130 100,119 81,130 85,108 70,93 91,90"
            fill="url(#goldGradient)"
            stroke="#FFD54F"
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>
      ) : (
        // Locked State SVG (looks like the outline shield with a padlock)
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 73 80 L 55 100 L 73 120 M 127 80 L 145 100 L 127 120" fill="none" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <polygon points="100,70 109,90 130,93 115,108 119,130 100,119 81,130 85,108 70,93 91,90" fill="#475569" stroke="#64748B" strokeWidth="2" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="First Contribution">
      {renderContent()}
    </BadgeContainer>
  );
};

export default FirstContributionBadge;
