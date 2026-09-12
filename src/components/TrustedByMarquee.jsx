import React, { useState } from "react";
import { GraduationCap, Building2, Sparkles } from "lucide-react";

// Top Leading Companies
const COMPANIES = [
  {
    name: "GitHub",
    type: "Company",
    logo: "https://cdn.simpleicons.org/github/white",
    fallbackColor: "from-zinc-700 to-zinc-900",
  },
  {
    name: "Google",
    type: "Company",
    logo: "/logos/google.svg",
    fallbackColor: "from-blue-600 to-red-600",
  },
  {
    name: "Microsoft",
    type: "Company",
    logo: "/logos/microsoft.svg",
    fallbackColor: "from-blue-500 to-amber-500",
  },
  {
    name: "Meta",
    type: "Company",
    logo: "/logos/meta.svg",
    fallbackColor: "from-blue-600 to-indigo-700",
  },
  {
    name: "Amazon",
    type: "Company",
    logo: "/logos/amazon.svg",
    fallbackColor: "from-amber-600 to-zinc-900",
  },
  {
    name: "Vercel",
    type: "Company",
    logo: "https://cdn.simpleicons.org/vercel/white",
    fallbackColor: "from-zinc-200 to-zinc-800",
  },
  {
    name: "Supabase",
    type: "Company",
    logo: "https://cdn.simpleicons.org/supabase",
    fallbackColor: "from-emerald-500 to-emerald-800",
  },
  {
    name: "Stripe",
    type: "Company",
    logo: "https://cdn.simpleicons.org/stripe/white",
    fallbackColor: "from-indigo-600 to-purple-800",
  },
  {
    name: "Linear",
    type: "Company",
    logo: "https://cdn.simpleicons.org/linear/white",
    fallbackColor: "from-indigo-500 to-zinc-900",
  },
  {
    name: "Docker",
    type: "Company",
    logo: "https://cdn.simpleicons.org/docker/2496ED",
    fallbackColor: "from-sky-500 to-blue-700",
  },
  {
    name: "Postman",
    type: "Company",
    logo: "https://cdn.simpleicons.org/postman/FF6C37",
    fallbackColor: "from-orange-500 to-orange-700",
  },
  {
    name: "Netflix",
    type: "Company",
    logo: "https://cdn.simpleicons.org/netflix/E50914",
    fallbackColor: "from-red-600 to-zinc-950",
  },
];

// Top Renowned Universities & Engineering Institutions
// Logos fetched via Google's S2 Favicon API from each university's official domain —
// CDN-backed, reliable, and always returns the official icon.
const universityLogo = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const UNIVERSITIES = [
  {
    name: "IIT Bombay",
    subtitle: "Mumbai",
    type: "IIT",
    logo: universityLogo("iitb.ac.in"),
    fallbackInitials: "IITB",
  },
  {
    name: "IIT Delhi",
    subtitle: "New Delhi",
    type: "IIT",
    logo: universityLogo("iitd.ac.in"),
    fallbackInitials: "IITD",
  },
  {
    name: "Stanford University",
    subtitle: "Stanford, California",
    type: "University",
    logo: universityLogo("stanford.edu"),
    fallbackInitials: "SU",
  },
  {
    name: "IIT Madras",
    subtitle: "Chennai",
    type: "IIT",
    logo: universityLogo("iitm.ac.in"),
    fallbackInitials: "IITM",
  },
  {
    name: "MIT",
    subtitle: "Cambridge, Massachusetts",
    type: "University",
    logo: universityLogo("mit.edu"),
    fallbackInitials: "MIT",
  },
  {
    name: "NIT Trichy",
    subtitle: "Tiruchirappalli",
    type: "NIT",
    logo: universityLogo("nitt.edu"),
    fallbackInitials: "NITT",
  },
  {
    name: "Harvard University",
    subtitle: "Cambridge, Massachusetts",
    type: "University",
    logo: universityLogo("harvard.edu"),
    fallbackInitials: "HU",
  },
  {
    name: "IIT Roorkee",
    subtitle: "Roorkee",
    type: "IIT",
    logo: universityLogo("iitr.ac.in"),
    fallbackInitials: "IITR",
  },
  {
    name: "BITS Pilani",
    subtitle: "Pilani, Rajasthan",
    type: "Institute",
    logo: universityLogo("bits-pilani.ac.in"),
    fallbackInitials: "BITS",
  },
  {
    name: "UC Berkeley",
    subtitle: "Berkeley, California",
    type: "University",
    logo: universityLogo("berkeley.edu"),
    fallbackInitials: "UCB",
  },
  {
    name: "Oxford University",
    subtitle: "Oxford, UK",
    type: "University",
    logo: universityLogo("ox.ac.uk"),
    fallbackInitials: "OX",
  },
  {
    name: "Cambridge University",
    subtitle: "Cambridge, UK",
    type: "University",
    logo: universityLogo("cam.ac.uk"),
    fallbackInitials: "CAM",
  },
];

const LogoCard = ({ item, isUniversity = false }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative flex items-center gap-3 px-4 py-2.5 mx-2 bg-white/[0.02] hover:bg-white/[0.06] border border-zinc-800/80 hover:border-zinc-700/90 rounded-xl transition-all duration-300 select-none shadow-sm flex-shrink-0 cursor-default">
      {/* Logo container with fallback */}
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-center p-1 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
        {!imageError ? (
          <img
            src={item.logo}
            alt={`${item.name} logo`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
          />
        ) : (
          <div className="text-[10px] font-mono font-bold text-zinc-300">
            {item.fallbackInitials || item.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors tracking-tight whitespace-nowrap">
          {item.name}
        </span>
        {item.subtitle && (
          <span className="text-[9px] text-zinc-500 font-mono line-clamp-1">
            {item.subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

const TrustedByMarquee = () => {
  return (
    <div className="mb-20 overflow-hidden relative">
      {/* Header Label */}
      <div className="text-center mb-6">
        <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 tracking-[0.25em] uppercase flex items-center justify-center gap-2">
          <span>TRUSTED BY DEVELOPERS &amp; STUDENTS FROM</span>
        </p>
      </div>

      {/* Marquee Track 1: Tech Companies (Slides Left) */}
      <div className="relative w-full overflow-hidden marquee-mask py-2">
        <div className="animate-marquee-left pause-hover">
          {/* Double array to create seamless loop */}
          {[...COMPANIES, ...COMPANIES].map((company, index) => (
            <LogoCard key={`comp-${index}`} item={company} />
          ))}
        </div>
      </div>

      {/* Marquee Track 2: Universities & IITs/NITs (Slides Right) */}
      <div className="relative w-full overflow-hidden marquee-mask py-2 mt-1">
        <div className="animate-marquee-right pause-hover">
          {/* Double array to create seamless loop */}
          {[...UNIVERSITIES, ...UNIVERSITIES].map((uni, index) => (
            <LogoCard key={`uni-${index}`} item={uni} isUniversity={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedByMarquee;
