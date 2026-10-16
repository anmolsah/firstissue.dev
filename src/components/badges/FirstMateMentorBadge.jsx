import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import BadgeContainer from "./BadgeContainer";

const FirstMateMentorBadge = ({ earned = false, onClick, variant = "card" }) => {
  const brainRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const coreRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    if (!earned) return;

    // Draw the neural network circuits
    try {
      if (brainRef.current) {
        const length = brainRef.current.getTotalLength();
        gsap.set(brainRef.current, { strokeDasharray: length, strokeDashoffset: length });
      }
    } catch (e) {
      console.warn("Could not calculate neural path length", e);
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1. Draw circuit/brain outline
    if (brainRef.current) {
      tl.to(brainRef.current, {
        strokeDashoffset: 0,
        duration: 1.1,
      });
    }

    // 2. Pulse and scale up central AI core
    if (coreRef.current) {
      tl.fromTo(
        coreRef.current,
        { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)" },
        "-=0.5"
      );
    }

    // 3. Continuous rotation for cyber orbital rings
    if (outerRingRef.current) {
      gsap.to(outerRingRef.current, {
        rotation: 360,
        transformOrigin: "50% 50%",
        duration: 22,
        repeat: -1,
        ease: "none",
      });
    }

    if (innerRingRef.current) {
      gsap.to(innerRingRef.current, {
        rotation: -360,
        transformOrigin: "50% 50%",
        duration: 15,
        repeat: -1,
        ease: "none",
      });
    }

    // 4. Subtle continuous pulsing for neural nodes
    nodesRef.current.forEach((node, idx) => {
      if (node) {
        gsap.to(node, {
          scale: 1.4,
          opacity: 0.9,
          duration: 0.9 + idx * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "50% 50%",
        });
      }
    });
  }, [earned]);

  const renderContent = () => (
    <div className={`relative ${variant === "raw" ? "w-full h-full" : "w-28 h-28"} flex items-center justify-center`}>
      {earned ? (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_16px_rgba(168,85,247,0.35)]"
        >
          <defs>
            <linearGradient id="aiIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>

            <linearGradient id="aiCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="50%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="aiCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>

            <radialGradient id="aiGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B0C10" stopOpacity="0" />
            </radialGradient>

            <filter id="aiNeonBlur">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Backdrop Glow */}
          <circle cx="100" cy="100" r="82" fill="url(#aiGlow)" />

          {/* Outer Dashed Orbit */}
          <g ref={outerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#aiIndigo)"
              strokeWidth="2"
              strokeDasharray="12 8"
              strokeOpacity="0.75"
            />
            <circle cx="100" cy="15" r="3.5" fill="#38BDF8" />
            <circle cx="100" cy="185" r="3.5" fill="#C084FC" />
          </g>

          {/* Inner Counter-Rotating Ring */}
          <g ref={innerRingRef}>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="url(#aiCyan)"
              strokeWidth="1.5"
              strokeDasharray="36 18"
              strokeOpacity="0.45"
            />
            <circle cx="28" cy="100" r="2.5" fill="#A855F7" />
            <circle cx="172" cy="100" r="2.5" fill="#38BDF8" />
          </g>

          {/* Shield Base (Hexagonal Cyber-Plate) */}
          <polygon
            points="100,34 156,66 156,134 100,166 44,134 44,66"
            fill="#10111A"
            stroke="#1E2033"
            strokeWidth="3"
          />
          <polygon
            points="100,41 149,69 149,131 100,159 51,131 51,69"
            fill="none"
            stroke="url(#aiIndigo)"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          {/* Neural Synapse Pathways / Brain Circuit Shape */}
          <path
            ref={brainRef}
            d="M 72 82 Q 80 62 100 62 Q 120 62 128 82 Q 138 98 126 116 Q 116 128 100 138 Q 84 128 74 116 Q 62 98 72 82 Z"
            fill="none"
            stroke="url(#aiCyan)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#aiNeonBlur)"
          />

          {/* Central Neural Stem / Spark */}
          <g ref={coreRef}>
            <circle cx="100" cy="98" r="14" fill="url(#aiCore)" opacity="0.9" />
            {/* Spark of Wisdom Star at center */}
            <path
              d="M 100 86 L 103 95 L 112 98 L 103 101 L 100 110 L 97 101 L 88 98 L 97 95 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Neural Network Circuit Connectors & Nodes */}
          <line x1="84" y1="88" x2="100" y2="98" stroke="#A5B4FC" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="116" y1="88" x2="100" y2="98" stroke="#A5B4FC" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="100" y1="98" x2="86" y2="114" stroke="#A5B4FC" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="100" y1="98" x2="114" y2="114" stroke="#A5B4FC" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Glowing Neural Synapse Nodes */}
          <circle
            ref={(el) => { nodesRef.current[0] = el; }}
            cx="84"
            cy="88"
            r="3.5"
            fill="#38BDF8"
          />
          <circle
            ref={(el) => { nodesRef.current[1] = el; }}
            cx="116"
            cy="88"
            r="3.5"
            fill="#38BDF8"
          />
          <circle
            ref={(el) => { nodesRef.current[2] = el; }}
            cx="86"
            cy="114"
            r="3"
            fill="#C084FC"
          />
          <circle
            ref={(el) => { nodesRef.current[3] = el; }}
            cx="114"
            cy="114"
            r="3"
            fill="#C084FC"
          />
          <circle
            ref={(el) => { nodesRef.current[4] = el; }}
            cx="100"
            cy="70"
            r="3"
            fill="#E0E7FF"
          />
        </svg>
      ) : (
        /* Locked State */
        <div className="w-24 h-24 rounded-full bg-[#0A0B10]/25 border border-white/[0.03] flex items-center justify-center relative group-hover:bg-white/[0.02] transition-all duration-300">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20 filter grayscale">
            <polygon points="100,34 156,66 156,134 100,166 44,134 44,66" fill="#181A24" stroke="#33374E" strokeWidth="3" />
            <path d="M 72 82 Q 80 62 100 62 Q 120 62 128 82 Q 138 98 126 116 Q 116 128 100 138 Q 84 128 74 116 Q 62 98 72 82 Z" fill="none" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#0b0c10]/90 border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Lock className="w-4 h-4 text-zinc-500" />
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
    <BadgeContainer earned={earned} onClick={onClick} title="FirstMate Mentor">
      {renderContent()}
    </BadgeContainer>
  );
};

export default FirstMateMentorBadge;
