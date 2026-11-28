import React from "react";
import {
  normalizeLinkedInUrl,
  normalizeTwitterUrl,
  formatLinkedInDisplay,
  formatTwitterDisplay,
} from "../utils/socialLinks";

/**
 * Official LinkedIn "in" rounded-square brand mark (#0A66C2 with crisp white glyph).
 */
export const LinkedInOfficialLogo = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path
      fill="#FFFFFF"
      d="M7.12 9.48H4.24V19.2H7.12V9.48ZM5.68 4.8C4.74 4.8 4 5.55 4 6.48C4 7.41 4.74 8.16 5.68 8.16C6.61 8.16 7.36 7.41 7.36 6.48C7.36 5.55 6.61 4.8 5.68 4.8ZM19.84 13.56C19.84 10.94 18.44 9.24 16.03 9.24C14.72 9.24 13.91 9.95 13.52 10.56V9.48H10.76C10.8 10.32 10.76 19.2 10.76 19.2H13.64V13.77C13.64 13.48 13.66 13.19 13.75 12.98C13.99 12.4 14.52 11.8 15.42 11.8C16.58 11.8 17.04 12.69 17.04 13.99V19.2H19.84V13.56Z"
    />
  </svg>
);

/**
 * Official X (formerly Twitter) brand mark inside a crisp dark tile.
 */
export const XTwitterOfficialLogo = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="4" fill="#000000" stroke="#2B2E36" strokeWidth="1" />
    <path
      fill="#FFFFFF"
      d="M16.98 5.25H19.46L14.04 11.45L20.42 19.88H15.43L11.52 14.77L7.05 19.88H4.56L10.36 13.25L4.24 5.25H9.36L12.89 9.92L16.98 5.25ZM16.11 18.4H17.48L8.61 6.66H7.13L16.11 18.4Z"
    />
  </svg>
);

/**
 * Renders clickable official-logo badges for LinkedIn and X (Twitter)
 * only when the user has configured them.
 */
export const ProfileSocialBadges = ({
  linkedinUrl,
  twitterUrl,
  showHandles = true,
  size = "sm",
}) => {
  const validLinkedIn = normalizeLinkedInUrl(linkedinUrl);
  const validTwitter = normalizeTwitterUrl(twitterUrl);

  if (!validLinkedIn && !validTwitter) return null;

  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const pillClasses =
    size === "md"
      ? "inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] hover:border-[#3A3E48] text-xs font-mono text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors"
      : "inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] hover:border-[#3A3E48] text-xs text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors";

  return (
    <>
      {validLinkedIn && (
        <a
          href={validLinkedIn}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
          title={`LinkedIn (${formatLinkedInDisplay(validLinkedIn)})`}
          className={pillClasses}
        >
          <LinkedInOfficialLogo className={`${iconSize} shrink-0`} />
          <span className="truncate max-w-[160px]">
            {showHandles ? formatLinkedInDisplay(validLinkedIn) : "LinkedIn"}
          </span>
        </a>
      )}
      {validTwitter && (
        <a
          href={validTwitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter) profile"
          title={`X / Twitter (${formatTwitterDisplay(validTwitter)})`}
          className={pillClasses}
        >
          <XTwitterOfficialLogo className={`${iconSize} shrink-0`} />
          <span className="truncate max-w-[150px]">
            {showHandles ? formatTwitterDisplay(validTwitter) : "X"}
          </span>
        </a>
      )}
    </>
  );
};
