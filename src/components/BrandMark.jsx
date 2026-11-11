import React from "react";

const SIZE_MAP = {
  xs: 18,
  sm: 22,
  md: 24,
  lg: 30,
};

const TEXT_SIZE_MAP = {
  xs: "text-sm",
  sm: "text-[15px]",
  md: "text-base",
  lg: "text-xl",
};

const resolveSize = (size) => {
  if (typeof size === "number") return size;
  return SIZE_MAP[size] || 24;
};

const BrandMark = ({ size = 24, className = "" }) => {
  const px = resolveSize(size);
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <rect width="32" height="32" rx="6" fill="#141518" />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="5"
        stroke="#2B2E36"
        strokeWidth="1.5"
      />
      <path
        d="M9.5 8.5V23.5M9.5 16H17.5"
        stroke="#F4F4F0"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
      <circle
        cx="9.5"
        cy="8.5"
        r="2.2"
        fill="#141518"
        stroke="#F4F4F0"
        strokeWidth="2"
      />
      <circle
        cx="9.5"
        cy="23.5"
        r="2.2"
        fill="#141518"
        stroke="#F4F4F0"
        strokeWidth="2"
      />
      <rect x="18" y="13" width="6" height="6" rx="1" fill="#DAFA9C" />
    </svg>
  );
};

export const BrandLogo = ({ size = 24, showWordmark = true, className = "" }) => {
  const textSize =
    typeof size === "string" && TEXT_SIZE_MAP[size]
      ? TEXT_SIZE_MAP[size]
      : "text-base";

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandMark size={size} />
      {showWordmark && (
        <span className={`font-semibold tracking-tight text-[#F4F4F0] ${textSize}`}>
          FirstIssue.dev
        </span>
      )}
    </span>
  );
};

export default BrandMark;
