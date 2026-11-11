import React from "react";

const BadgeContainer = ({ children, earned = false, onClick, title }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-[4px] border transition-colors cursor-pointer text-center w-full group overflow-hidden ${
        earned
          ? "bg-[#141518] border-[#2B2E36] hover:border-[#DAFA9C]/60"
          : "bg-[#0B0C0E] border-[#22242A] opacity-60 hover:opacity-85 hover:border-[#2B2E36]"
      }`}
      aria-label={`${title} badge — ${earned ? "Earned" : "Locked"}`}
    >
      <div className="w-full flex flex-col items-center">
        {children}
      </div>
    </button>
  );
};

export default BadgeContainer;
