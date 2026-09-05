import React, { useState } from "react";
import { GraduationCap, Building2, Sparkles } from "lucide-react";

// Top Global & Indian Tech Companies
const COMPANIES = [
  {
    name: "GitHub",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/github/white",
    fallbackColor: "from-zinc-700 to-zinc-900",
  },
  {
    name: "Google",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/google",
    fallbackColor: "from-blue-600 to-red-600",
  },
  {
    name: "Microsoft",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/microsoft",
    fallbackColor: "from-blue-500 to-amber-500",
  },
  {
    name: "Meta",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/meta/white",
    fallbackColor: "from-blue-600 to-indigo-700",
  },
  {
    name: "Amazon",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/amazon/white",
    fallbackColor: "from-amber-600 to-zinc-900",
  },
  {
    name: "Vercel",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/vercel/white",
    fallbackColor: "from-zinc-200 to-zinc-800",
  },
  {
    name: "Supabase",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/supabase",
    fallbackColor: "from-emerald-500 to-emerald-800",
  },
  {
    name: "Stripe",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/stripe/white",
    fallbackColor: "from-indigo-600 to-purple-800",
  },
  {
    name: "Linear",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/linear/white",
    fallbackColor: "from-indigo-500 to-zinc-900",
  },
  {
    name: "Docker",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/docker/2496ED",
    fallbackColor: "from-sky-500 to-blue-700",
  },
  {
    name: "Postman",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/postman/FF6C37",
    fallbackColor: "from-orange-500 to-orange-700",
  },
  {
    name: "Netflix",
    type: "Company",
    tag: "TECH",
    logo: "https://cdn.simpleicons.org/netflix/E50914",
    fallbackColor: "from-red-600 to-zinc-950",
  },
];

// Top Global Universities & Renowned Indian Institutions (IITs, NITs, BITS)
const UNIVERSITIES = [
  {
    name: "IIT Bombay",
    subtitle: "Indian Institute of Technology",
    type: "IIT",
    tag: "INDIA",
    logo: "https://upload.wikimedia.org/wikipedia/de/5/58/IIT_Bombay_Logo.svg",
    fallbackInitials: "IITB",
  },
  {
    name: "IIT Delhi",
    subtitle: "Indian Institute of Technology",
    type: "IIT",
    tag: "INDIA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg/200px-Indian_Institute_of_Technology_Delhi_Logo.svg.png",
    fallbackInitials: "IITD",
  },
  {
    name: "Stanford University",
    subtitle: "California, USA",
    type: "University",
    tag: "GLOBAL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/200px-Seal_of_Leland_Stanford_Junior_University.svg.png",
    fallbackInitials: "SU",
  },
  {
    name: "IIT Madras",
    subtitle: "Indian Institute of Technology",
    type: "IIT",
    tag: "INDIA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/200px-IIT_Madras_Logo.svg.png",
    fallbackInitials: "IITM",
  },
  {
    name: "MIT",
    subtitle: "Massachusetts Institute of Tech",
    type: "University",
    tag: "GLOBAL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
    fallbackInitials: "MIT",
  },
  {
    name: "NIT Trichy",
    subtitle: "National Institute of Technology",
    type: "NIT",
    tag: "INDIA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/NIT_Trichy_logo.png/200px-NIT_Trichy_logo.png",
    fallbackInitials: "NITT",
  },
  {
    name: "Harvard University",
    subtitle: "Cambridge, USA",
    type: "University",
    tag: "GLOBAL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png",
    fallbackInitials: "HU",
  },
  {
    name: "IIT Roorkee",
    subtitle: "Indian Institute of Technology",
    type: "IIT",
    tag: "INDIA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/dc/Indian_Institute_of_Technology_Roorkee_logo.png/200px-Indian_Institute_of_Technology_Roorkee_logo.png",
    fallbackInitials: "IITR",
  },
  {
    name: "BITS Pilani",
    subtitle: "Birla Institute of Technology",
    type: "Institute",
    tag: "INDIA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/200px-BITS_Pilani-Logo.svg.png",
    fallbackInitials: "BITS",
  },
  {
    name: "UC Berkeley",
    subtitle: "University of California",
    type: "University",
    tag: "GLOBAL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seal_of_University_of_California%2C_Berkeley.svg/200px-Seal_of_University_of_California%2C_Berkeley.svg.png",
    fallbackInitials: "UCB",
  },
  {
    name: "Oxford University",
    subtitle: "Oxford, UK",
    type: "University",
    tag: "GLOBAL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/200px-Oxford-University-Circlet.svg.png",
    fallbackInitials: "OX",
  },
  {
    name: "Cambridge University",
    subtitle: "Cambridge, UK",
    type: "University",
    tag: "GLOBAL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg/200px-Coat_of_Arms_of_the_University_of_Cambridge.svg.png",
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

      {/* Title & Tag */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors tracking-tight whitespace-nowrap">
            {item.name}
          </span>
          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 uppercase">
            {item.tag}
          </span>
        </div>
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
