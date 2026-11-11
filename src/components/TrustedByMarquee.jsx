import React, { useState } from "react";

const COMPANIES = [
  {
    name: "GitHub",
    type: "Company",
    logo: "https://cdn.simpleicons.org/github/white",
  },
  {
    name: "Google",
    type: "Company",
    logo: "/logos/google.svg",
  },
  {
    name: "Microsoft",
    type: "Company",
    logo: "/logos/microsoft.svg",
  },
  {
    name: "Meta",
    type: "Company",
    logo: "/logos/meta.svg",
  },
  {
    name: "Amazon",
    type: "Company",
    logo: "/logos/amazon.svg",
  },
  {
    name: "Vercel",
    type: "Company",
    logo: "https://cdn.simpleicons.org/vercel/white",
  },
  {
    name: "Supabase",
    type: "Company",
    logo: "https://cdn.simpleicons.org/supabase",
  },
  {
    name: "Stripe",
    type: "Company",
    logo: "https://cdn.simpleicons.org/stripe/white",
  },
  {
    name: "Linear",
    type: "Company",
    logo: "https://cdn.simpleicons.org/linear/white",
  },
  {
    name: "Docker",
    type: "Company",
    logo: "https://cdn.simpleicons.org/docker/2496ED",
  },
  {
    name: "Postman",
    type: "Company",
    logo: "https://cdn.simpleicons.org/postman/FF6C37",
  },
  {
    name: "Netflix",
    type: "Company",
    logo: "https://cdn.simpleicons.org/netflix/E50914",
  },
];

const universityLogo = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

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

const LogoCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mr-3 bg-[#141518] border border-[#22242A] hover:border-[#3A3E48] rounded-[4px] transition-colors select-none shrink-0">
      <div className="w-6 h-6 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center justify-center p-1 shrink-0 overflow-hidden">
        {!imageError ? (
          <img
            src={item.logo}
            alt={`${item.name} logo`}
            loading="eager"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs font-mono font-semibold text-[#A8ADB6]">
            {item.fallbackInitials || item.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-[#F4F4F0] tracking-tight whitespace-nowrap">
          {item.name}
        </span>
        {item.subtitle && (
          <span className="text-xs text-[#8C929C] font-mono whitespace-nowrap">
            {item.subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

const TrustedByMarquee = () => {
  return (
    <section
      aria-label="Organizations and universities represented by contributors"
      className="py-10 border-y border-[#22242A] bg-[#0F0F0F] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <p className="text-xs font-mono font-medium text-[#8C929C] tracking-wider uppercase text-center">
          Used by students and contributors across
        </p>
      </div>

      <div className="relative w-full overflow-hidden marquee-mask py-1">
        <div className="animate-marquee-left pause-hover">
          {[...COMPANIES, ...COMPANIES].map((company, idx) => (
            <div key={`comp-${idx}`} aria-hidden={idx >= COMPANIES.length}>
              <LogoCard item={company} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden marquee-mask py-1 mt-2">
        <div className="animate-marquee-right pause-hover">
          {[...UNIVERSITIES, ...UNIVERSITIES].map((uni, idx) => (
            <div key={`uni-${idx}`} aria-hidden={idx >= UNIVERSITIES.length}>
              <LogoCard item={uni} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedByMarquee;
