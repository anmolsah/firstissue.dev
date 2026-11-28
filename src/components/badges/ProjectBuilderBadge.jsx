import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const ProjectBuilderBadge = ({ earned = false, onClick, variant = "card" }) => {
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const coreRef = useRef(null);

  useEffect(() => {
    if (!earned) return;

    const anims = [];
    if (outerRingRef.current) {
      anims.push(
        gsap.to(outerRingRef.current, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 24,
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
          duration: 16,
          repeat: -1,
          ease: "none",
        })
      );
    }
    if (coreRef.current) {
      anims.push(
        gsap.to(coreRef.current, {
          y: -3,
          duration: 2.2,
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
          className="w-full h-full drop-shadow-[0_0_15px_rgba(218,250,156,0.22)]"
        >
          <defs>
            <linearGradient id="projBuilderLime" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DAFA9C" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="projBuilderEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <radialGradient id="projBuilderGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#12131C" stopOpacity="0" />
            </radialGradient>
            <filter id="projBuilderBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r="80" fill="url(#projBuilderGlow)" />

          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="url(#projBuilderLime)"
              strokeWidth="2"
              strokeDasharray="10 8"
              strokeOpacity="0.65"
            />
            <circle cx="100" cy="16" r="3.5" fill="#DAFA9C" />
            <circle cx="100" cy="184" r="3.5" fill="#34D399" />
          </g>

          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="71"
              fill="none"
              stroke="url(#projBuilderEmerald)"
              strokeWidth="1.5"
              strokeDasharray="36 18"
              strokeOpacity="0.5"
            />
          </g>

          <polygon
            points="100,34 156,66 156,134 100,166 44,134 44,66"
            fill="#101915"
            stroke="#1E293B"
            strokeWidth="3.5"
          />
          <polygon
            points="100,41 149,69 149,131 100,159 51,131 51,69"
            fill="none"
            stroke="url(#projBuilderLime)"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          {/* Live App Window + Launch Arrow */}
          <g ref={coreRef} filter="url(#projBuilderBlur)">
            <rect
              x="66"
              y="72"
              width="68"
              height="54"
              rx="6"
              fill="#0B130F"
              stroke="url(#projBuilderLime)"
              strokeWidth="3"
            />
            <line x1="66" y1="86" x2="134" y2="86" stroke="#34D399" strokeWidth="2" strokeOpacity="0.7" />
            <circle cx="75" cy="79" r="2.3" fill="#DAFA9C" />
            <circle cx="83" cy="79" r="2.3" fill="#34D399" />
            <path
              d="M 88 113 L 109 94 M 96 94 L 109 94 L 109 107"
              fill="none"
              stroke="#DAFA9C"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      ) : (
        <div className="w-24 h-24 rounded-full bg-[#0B0C0E]/70 border border-[#22242A] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,34 156,66 156,134 100,166 44,134 44,66" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            <rect x="66" y="72" width="68" height="54" rx="6" fill="none" stroke="#64748B" strokeWidth="3" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="Project Builder">
      {renderContent()}
    </BadgeContainer>
  );
};

export default ProjectBuilderBadge;
