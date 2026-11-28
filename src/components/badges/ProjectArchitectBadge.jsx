import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const ProjectArchitectBadge = ({ earned = false, onClick, variant = "card" }) => {
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    const anims = [];
    if (outerRingRef.current) {
      anims.push(
        gsap.to(outerRingRef.current, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 22,
          repeat: -1,
          ease: "none",
        })
      );
    }
    if (innerRingRef.current) {
      anims.push(
        gsap.to(innerRingRef.current, {
          rotation: -360,
          transformOrigin: "50% 50%",
          duration: 14,
          repeat: -1,
          ease: "none",
        })
      );
    }
    if (pulseRef.current) {
      anims.push(
        gsap.to(pulseRef.current, {
          scale: 1.06,
          transformOrigin: "50% 50%",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    }

    return () => anims.forEach((a) => a.kill());
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        >
          <defs>
            <linearGradient id="projArchGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="projArchSky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <radialGradient id="projArchGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="projArchBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r="82" fill="url(#projArchGlow)" />

          <g ref={outerRingRef}>
            <polygon
              points="100,12 176,56 176,144 100,188 24,144 24,56"
              fill="none"
              stroke="url(#projArchGold)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeOpacity="0.65"
            />
            <circle cx="100" cy="12" r="3.5" fill="#FDE68A" />
            <circle cx="100" cy="188" r="3.5" fill="#F59E0B" />
          </g>

          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#projArchSky)"
              strokeWidth="1.5"
              strokeDasharray="34 20"
              strokeOpacity="0.55"
            />
          </g>

          <polygon
            points="100,32 158,64 158,136 100,168 42,136 42,64"
            fill="#1A1510"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,40 150,68 150,132 100,160 50,132 50,68"
            fill="none"
            stroke="url(#projArchGold)"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          {/* Stacked Architecture Layers + 5 */}
          <g ref={pulseRef}>
            <polygon
              points="100,60 134,76 100,92 66,76"
              fill="none"
              stroke="url(#projArchSky)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polyline
              points="66,92 100,108 134,92"
              fill="none"
              stroke="url(#projArchGold)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="100"
              y="142"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="34"
              fontWeight="900"
              fill="url(#projArchGold)"
              textAnchor="middle"
              filter="url(#projArchBlur)"
            >
              5
            </text>
          </g>
        </svg>
      ) : (
        <div className="w-24 h-24 rounded-full bg-[#0B0C0E]/70 border border-[#22242A] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,64 158,136 100,168 42,136 42,64" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <polygon points="100,60 134,76 100,92 66,76" fill="none" stroke="#64748B" strokeWidth="3" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#141518] border border-[#2B2E36] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "raw") return renderContent();

  return (
    <BadgeContainer earned={earned} onClick={onClick} title="Project Architect">
      {renderContent()}
    </BadgeContainer>
  );
};

export default ProjectArchitectBadge;
