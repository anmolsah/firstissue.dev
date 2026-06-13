import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const PerfectScoreBadge = ({ earned = false, onClick, variant = "card" }) => {
  const checkRef = useRef(null);
  const targetRingRef = useRef(null);
  const crownRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const sparklesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    // Path drawing for the checkmark
    try {
      const length = checkRef.current.getTotalLength();
      gsap.set(checkRef.current, { strokeDasharray: length, strokeDashoffset: length });
    } catch (e) {
      console.warn("Could not get path length", e);
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Zoom target ring
    tl.fromTo(targetRingRef.current,
      { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" }
    );

    // Draw checkmark
    tl.to(checkRef.current, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.3");

    // Scale crown
    tl.fromTo(crownRef.current,
      { scale: 0, y: -10, opacity: 0, transformOrigin: "50% 50%" },
      { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(2)" },
      "-=0.5"
    );

    // Continuous animations
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
    sparklesRef.current.forEach((sparkle, idx) => {
      if (sparkle) {
        gsap.to(sparkle, {
          opacity: 0.3,
          scale: 1.2,
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(234,179,8,0.25)]"
        >
          <defs>
            <linearGradient id="goldSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FACC15" />
              <stop offset="80%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </linearGradient>
            <linearGradient id="goldNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
            <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="goldBlur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="80" fill="url(#goldGlow)" />

          {/* Rotating Outer Hex Ring */}
          <g ref={outerRingRef}>
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              fill="none"
              stroke="url(#goldSealGrad)"
              strokeWidth="2"
              strokeDasharray="10 12"
              strokeOpacity="0.6"
            />
            <circle cx="100" cy="10" r="3.5" fill="#FACC15" />
            <circle cx="100" cy="190" r="3.5" fill="#FACC15" />
          </g>

          {/* Rotating Inner Orbit Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="url(#goldNeon)"
              strokeWidth="1.5"
              strokeDasharray="50 30"
              strokeOpacity="0.4"
            />
          </g>

          {/* Base Shield */}
          <polygon
            points="100,32 158,62 158,138 100,168 42,138 42,62"
            fill="#1A180F"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,40 150,66 150,134 100,160 50,134 50,66"
            fill="none"
            stroke="url(#goldSealGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Rising Sparks */}
          <g>
            <circle ref={el => sparklesRef.current[0] = el} cx="70" cy="130" r="2" fill="#FEF08A" opacity="0.6" />
            <circle ref={el => sparklesRef.current[1] = el} cx="130" cy="130" r="2.5" fill="#FEF08A" opacity="0.4" />
            <circle ref={el => sparklesRef.current[2] = el} cx="65" cy="80" r="2" fill="#FEF08A" opacity="0.5" />
            <circle ref={el => sparklesRef.current[3] = el} cx="135" cy="80" r="3" fill="#FEF08A" opacity="0.6" />
          </g>

          {/* Target / Goal circle inside */}
          <circle
            ref={targetRingRef}
            cx="100"
            cy="104"
            r="38"
            fill="none"
            stroke="url(#goldSealGrad)"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeOpacity="0.7"
          />

          {/* Glowing center Star/Bullseye background */}
          <circle
            cx="100"
            cy="104"
            r="28"
            fill="#292518"
            stroke="url(#goldNeon)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Giant perfect checkmark */}
          <path
            ref={checkRef}
            d="M 82 104 L 94 116 L 122 86"
            fill="none"
            stroke="url(#goldNeon)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#goldBlur)"
          />

          {/* Master Golden Crown at the top */}
          <path
            ref={crownRef}
            d="M 85 45 L 90 52 L 100 42 L 110 52 L 115 45 L 110 58 L 90 58 Z"
            fill="url(#goldNeon)"
            stroke="#EAB308"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Locked State
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/20 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <circle cx="100" cy="104" r="38" fill="none" stroke="#64748B" strokeWidth="3" strokeDasharray="8 8" />
            <path d="M 82 104 L 94 116 L 122 86" fill="none" stroke="#64748B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Perfect Score">
      {renderContent()}
    </BadgeContainer>
  );
};

export default PerfectScoreBadge;
