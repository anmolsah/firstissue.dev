import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ShieldCheck } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[90] animate-in-pop"
    >
      <div className="relative bg-[#17181B] border border-[#2B2E36] rounded-[4px] p-5 shadow-2xl">
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Close cookie banner"
          className="absolute top-3.5 right-3.5 p-1.5 text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pr-7 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F4F0]">
            <ShieldCheck className="w-4 h-4 text-[#DAFA9C] shrink-0" />
            <span>Session &amp; preferences cookies</span>
          </div>
          <p className="text-xs text-[#A8ADB6] leading-relaxed">
            We store essential session and filter preferences locally so you stay signed in. Read our{" "}
            <Link
              to="/privacy"
              className="text-[#DAFA9C] hover:text-[#C7F275] underline underline-offset-4 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 mt-4">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 px-3.5 py-2 rounded-[4px] bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] text-[#A8ADB6] hover:text-[#F4F4F0] text-xs font-medium transition-colors"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 px-4 py-2 rounded-[4px] bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-xs font-semibold transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
