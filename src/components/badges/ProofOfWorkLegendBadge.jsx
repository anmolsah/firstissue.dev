import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const ProofOfWorkLegendBadge = ({ earned = false, onClick, variant = "card" }) => {
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const crownRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    const anims = [];
    if (outerRingRef.current) {
      anims.push(
        gsap.to(outerRingRef.current, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 20,
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
          duration: 13,
          repeat: -1,
          ease: "none",
        })
      );
    }
    if (crownRef.current) {
      anims.push(
        gsap.fromTo(
          crownRef.current,
          { scale: 0.9, opacity: 0.8, transformOrigin: "50% 50%" },
          { scale: 1.06, opacity: 1, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" }
        )
      );
    }

    return () => anims.forEach((a) => a.kill());
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(251,146,60,0.28)]"
        >
          <defs>
            <linearGradient id="pow20Gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="pow20Emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <radialGradient id="pow20Glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB923C" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="pow20Blur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r="82" fill="url(#pow20Glow)" />

          <g ref={outerRingRef}>
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              fill="none"
              stroke="url(#pow20Gold)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeOpacity="0.7"
            />
            <circle cx="100" cy="10" r="3.5" fill="#FDE68A" />
            <circle cx="100" cy="190" r="3.5" fill="#FB923C" />
          </g>

          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#pow20Emerald)"
              strokeWidth="1.5"
              strokeDasharray="40 20"
              strokeOpacity="0.55"
            />
          </g>

          <polygon
            points="100,32 158,62 158,138 100,168 42,138 42,62"
            fill="#1B130E"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,40 150,66 150,134 100,160 50,134 50,66"
            fill="none"
            stroke="url(#pow20Gold)"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          {/* Crown */}
          <path
            ref={crownRef}
            d="M 85 52 L 90 60 L 100 48 L 110 60 L 115 52 L 109 65 L 91 65 Z"
            fill="url(#pow20Gold)"
            stroke="#EA580C"
            strokeWidth="1"
          />

          {/* 20 Verified Shield Mark */}
          <text
            x="100"
            y="112"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="44"
            fontWeight="900"
            fill="url(#pow20Gold)"
            textAnchor="middle"
            filter="url(#pow20Blur)"
          >
            20
          </text>
          <path
            d="M 80 128 L 94 140 L 122 118"
            fill="none"
            stroke="url(#pow20Emerald)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div className="w-24 h-24 rounded-full bg-[#0B0C0E]/70 border border-[#22242A] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,32 158,62 158,138 100,168 42,138 42,62" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <path d="M 80 128 L 94 140 L 122 118" fill="none" stroke="#64748B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Proof of Work Legend">
      {renderContent()}
    </BadgeContainer>
  );
};

export default ProofOfWorkLegendBadge;
