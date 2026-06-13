import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const BadgeContainer = ({ children, earned = false, onClick, title }) => {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    if (!containerRef.current || !earned) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Normalize coordinates to [-0.5, 0.5]
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: earned ? rotateX : 0,
        rotateY: earned ? rotateY : 0,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-center w-full group overflow-hidden ${
        earned
          ? "bg-[#12131C] border-[#3B82F6]/30 hover:border-[#3B82F6]/60 shadow-[0_0_20px_rgba(59,130,246,0.05)] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          : "bg-[#0b0c10]/40 border-white/[0.02] opacity-50 hover:opacity-75"
      }`}
      aria-label={`${title} badge — ${earned ? 'Earned' : 'Locked'}`}
    >
      {/* 3D Content wrapper */}
      <div 
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} 
        className="w-full flex flex-col items-center"
      >
        {children}
      </div>

      {/* Glossy Sheen Overlay */}
      {earned && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 70%)",
            backgroundSize: "200% 200%",
            animation: hovered ? "shimmer 1.5s infinite linear" : "none",
          }}
        />
      )}

      {/* Custom keyframes injection */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.button>
  );
};

export default BadgeContainer;
