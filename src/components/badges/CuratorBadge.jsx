import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const CuratorBadge = ({ earned = false, onClick, variant = "card" }) => {
  const bookmarkRef = useRef(null);
  const gemRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    // Draw bookmark outline
    try {
      const length = bookmarkRef.current.getTotalLength();
      gsap.set(bookmarkRef.current, { strokeDasharray: length, strokeDashoffset: length });
    } catch (e) {
      console.warn("Could not get path length", e);
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Slide/drop bookmark down
    tl.to(bookmarkRef.current, {
      strokeDashoffset: 0,
      duration: 1.0
    });

    // Scale up glowing gem
    tl.fromTo(gemRef.current,
      { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" },
      "-=0.4"
    );

    // Continuous spin for orbits
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

    // Pulse the glowing gem
    gsap.to(gemRef.current, {
      scale: 1.25,
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.25)]"
        >
          <defs>
            <linearGradient id="bookmarkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="curatorPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <radialGradient id="bookmarkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="bookmarkBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#bookmarkGlow)" />

          {/* Rotating Outer Ring */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#bookmarkBlue)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="16" r="3" fill="#60A5FA" />
            <circle cx="100" cy="184" r="3" fill="#60A5FA" />
          </g>

          {/* Rotating Inner Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#curatorPurple)"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.4"
            />
          </g>

          {/* Shield Base */}
          <polygon
            points="100,35 155,65 155,135 100,165 45,135 45,65"
            fill="#10151E"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <polygon
            points="100,42 148,68 148,132 100,158 52,132 52,68"
            fill="none"
            stroke="url(#bookmarkBlue)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Large Bookmark Ribbon in Center */}
          <path
            ref={bookmarkRef}
            d="M 82 50 L 118 50 L 118 135 L 100 120 L 82 135 Z"
            fill="none"
            stroke="url(#bookmarkBlue)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Bookmark Ribbon color */}
          <path
            d="M 86 54 L 114 54 L 114 125 L 100 114 L 86 125 Z"
            fill="url(#curatorPurple)"
            opacity="0.3"
          />

          {/* Glowing central Gem / Star on the ribbon */}
          <path
            ref={gemRef}
            d="M 100 70 L 105 80 L 115 80 L 107 88 L 110 98 L 100 90 L 90 98 L 93 88 L 85 80 L 95 80 Z"
            fill="url(#gemGrad)"
            stroke="#FFFFFF"
            strokeWidth="1"
            filter="url(#bookmarkBlur)"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,35 155,65 155,135 100,165 45,135 45,65" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            <path d="M 82 50 L 118 50 L 118 135 L 100 120 L 82 135 Z" fill="none" stroke="#64748B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Curator">
      {renderContent()}
    </BadgeContainer>
  );
};

export default CuratorBadge;
