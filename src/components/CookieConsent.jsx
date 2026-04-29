import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie, ShieldCheck } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to make it feel more natural
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
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="max-w-4xl mx-auto">
        <div className="relative group">
          {/* Backdrop Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ADB5]/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative bg-[#1a1a24]/90 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
            {/* Icon and Text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 rounded-xl bg-[#00ADB5]/10 border border-[#00ADB5]/20 hidden md:block">
                <Cookie className="w-6 h-6 text-[#00ADB5]" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-lg font-semibold text-white flex items-center justify-center md:justify-start gap-2">
                  We use cookies <ShieldCheck className="w-4 h-4 text-[#00ADB5]" />
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  By clicking "Accept", you agree to our use of cookies. For more details, see our{" "}
                  <Link 
                    to="/privacy" 
                    className="text-[#00ADB5] hover:text-[#00c2cb] underline underline-offset-4 decoration-[#00ADB5]/30 hover:decoration-[#00ADB5] transition-all"
                  >
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-[#00ADB5] text-[#222831] text-sm font-bold hover:bg-[#00c2cb] transition-all shadow-[0_0_20px_rgba(0,173,181,0.3)] hover:shadow-[0_0_25px_rgba(0,173,181,0.5)] active:scale-95 whitespace-nowrap"
              >
                Accept All
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
