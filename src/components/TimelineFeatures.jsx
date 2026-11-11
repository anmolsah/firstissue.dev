import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Zap,
  Shield,
  Star,
  ArrowRight,
  Github,
  CheckCircle,
  Code2,
  Terminal,
  Filter,
  Check,
  Briefcase,
} from "lucide-react";

const FeatureCard = ({
  index,
  title,
  description,
  icon,
  badge,
  visual,
  link,
  linkText,
  className = "",
}) => {
  const Icon = icon;
  const isPoW = index === 1;
  const isExternal = link && link.startsWith("http");

  return (
    <article
      className={`group flex flex-col justify-between rounded-[4px] bg-[#141518] border border-[#22242A] hover:border-[#3A3E48] transition-colors overflow-hidden ${
        isPoW ? "min-h-[420px]" : "min-h-[400px]"
      } ${className}`}
    >
      <div className="shrink-0 p-6 pb-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon className="w-4 h-4 text-[#DAFA9C] shrink-0" />
            <h3 className="text-lg font-semibold text-[#F4F4F0] tracking-tight truncate">
              {title}
            </h3>
          </div>
          {badge && (
            <span className="px-2 py-0.5 rounded-[4px] text-xs font-mono uppercase tracking-wider bg-[#17181B] text-[#F59E0B] border border-[#F59E0B]/30 shrink-0">
              {badge}
            </span>
          )}
        </div>

        <p className="text-[#A8ADB6] text-xs sm:text-[13px] leading-relaxed text-pretty">
          {description}
        </p>
      </div>

      <div className="relative w-full grow flex items-center justify-center min-h-[200px] bg-[#0B0C0E] border-t border-[#22242A] px-5 py-4">
        {visual}
      </div>

      {(link || linkText) && (
        <div className="px-6 py-3.5 border-t border-[#22242A] text-left bg-[#141518]">
          {linkText?.toLowerCase().includes("coming soon") ? (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
              <span>Coming soon</span>
            </div>
          ) : isExternal ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DAFA9C] hover:text-[#C7F275] transition-colors"
            >
              <span>{linkText || "Explore feature"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <Link
              to={link}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DAFA9C] hover:text-[#C7F275] transition-colors"
            >
              <span>{linkText || "Explore feature"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </article>
  );
};

const AIMatchVisualizer = () => {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 select-none">
      <div className="pb-3 border-b border-[#22242A]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-[#DAFA9C] shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#F4F4F0] leading-none">
                alex.dev
              </div>
              <div className="text-xs text-[#8C929C] font-mono mt-0.5">
                Full-Stack Contributor
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-[4px] text-xs font-mono bg-[#17181B] text-[#DAFA9C]">
            SYNCED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#22242A]/70">
          <div>
            <div className="flex justify-between text-xs font-mono text-[#A8ADB6] mb-1">
              <span>TypeScript</span>
              <span className="text-[#DAFA9C] tabular-nums">94%</span>
            </div>
            <div className="h-1 bg-[#17181B] overflow-hidden">
              <div className="h-full bg-[#DAFA9C]" style={{ width: "94%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono text-[#A8ADB6] mb-1">
              <span>React / Next.js</span>
              <span className="text-[#34D399] tabular-nums">88%</span>
            </div>
            <div className="h-1 bg-[#17181B] overflow-hidden">
              <div className="h-full bg-[#34D399]" style={{ width: "88%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <span className="text-xs font-mono text-[#A8ADB6] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#DAFA9C]" />
          Stack Vector Match
        </span>
      </div>

      <div className="pt-3 border-t border-[#22242A]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-[#F4F4F0]">
              vercel/next.js
            </span>
            <span className="text-xs font-mono text-[#8C929C]">#49210</span>
          </div>
          <span className="text-xs font-mono text-[#34D399] tabular-nums font-semibold">
            98% FIT
          </span>
        </div>
        <p className="text-xs text-[#A8ADB6] line-clamp-1 mb-2 text-left">
          Fix hydration mismatch in streaming SSR suspense
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#A8ADB6]">TypeScript</span>
          <span className="text-[#3A3E48]">·</span>
          <span className="text-[#34D399] tabular-nums">+50 Impact</span>
        </div>
      </div>
    </div>
  );
};

const ProofOfWorkVisualizer = () => {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-4 select-none text-left">
      <div className="md:col-span-7 flex flex-col justify-between md:pr-4 md:border-r border-[#22242A]">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-[#22242A] mb-3">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#DAFA9C]">
              FIRSTISSUE // PoW
            </span>
            <span className="inline-flex items-center gap-1 text-[#34D399] text-xs font-mono font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              VERIFIED PR
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#F4F4F0] mb-1">
            <Code2 className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>facebook/react</span>
            <span className="text-[#8C929C]">#24089</span>
          </div>
          <p className="text-sm font-semibold text-[#F4F4F0] leading-snug mb-3 text-pretty">
            Implement Concurrent Mode Suspense lifecycle&nbsp;hooks
          </p>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#141518] border-y border-[#22242A] mb-3">
            <div>
              <div className="text-xs text-[#8C929C] font-mono">DIFF</div>
              <div className="text-xs font-semibold text-[#34D399] font-mono tabular-nums">
                +142 / -18
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8C929C] font-mono">SCORE</div>
              <div className="text-xs font-semibold text-[#F59E0B] font-mono tabular-nums">
                98 / 100
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8C929C] font-mono">TIER</div>
              <div className="text-xs font-semibold text-[#F4F4F0] font-mono">
                High Impact
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB6] tabular-nums">
            <span>SHA-256: 8fa4b9...7640</span>
            <span className="text-[#34D399]">GitHub + Supabase</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-5 flex flex-col justify-between space-y-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#22242A]">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#22242A] mb-3">
            <span className="text-xs font-mono font-semibold text-[#F4F4F0] uppercase tracking-wider">
              Verification
            </span>
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-start gap-2 text-[#F4F4F0]">
              <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
              <span>GitHub PR state = merged</span>
            </div>
            <div className="flex items-start gap-2 text-[#F4F4F0]">
              <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
              <span>Authorship &amp; diff verified</span>
            </div>
            <div className="flex items-start gap-2 text-[#F4F4F0]">
              <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
              <span>Impact scored (98/100)</span>
            </div>
            <div className="flex items-start gap-2 text-[#DAFA9C]">
              <Check className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0 mt-0.5" />
              <span>SHA-256 card generated</span>
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#22242A] flex items-center justify-between text-xs font-mono text-[#8C929C]">
          <span>PDF &amp; PNG export</span>
          <span className="text-[#34D399]">Verified</span>
        </div>
      </div>
    </div>
  );
};

const StartupHiringVisualizer = ({ active = true }) => {
  const hiringRoles = [
    {
      company: "Stack AI",
      stage: "YC Backed",
      title: "Founding Full-Stack Engineer",
      comp: "$90k - $140k · Remote",
      badge: "PR MATCH",
      matchReason: "12 merged PRs in React & TypeScript",
      matchScore: "96% Fit",
      turnaround: "5-7d loop",
      tags: ["React", "Node.js", "TypeScript"],
    },
    {
      company: "Smallest AI",
      stage: "Audio Infra",
      title: "Systems Performance Engineer",
      comp: "$100k - $160k · Remote",
      badge: "HIGH SIGNAL",
      matchReason: "Rust & WebAssembly open-source work",
      matchScore: "98% Fit",
      turnaround: "Direct intro",
      tags: ["Rust", "Wasm", "Systems"],
    },
    {
      company: "Supabase Ecosystem",
      stage: "Developer Tools",
      title: "CLI & Database Engineer",
      comp: "$110k - $150k · Remote",
      badge: "VERIFIED",
      matchReason: "Go & PostgreSQL merged PR history",
      matchScore: "94% Fit",
      turnaround: "Work-sample first",
      tags: ["Go", "Postgres", "Docker"],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % hiringRoles.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [active, hiringRoles.length]);

  const current = hiringRoles[activeIndex];

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 select-none text-left">
      <div className="flex items-center justify-between pb-2 border-b border-[#22242A]">
        <span className="text-xs font-mono uppercase tracking-wider text-[#A8ADB6]">
          Talent Waitlist Preview
        </span>
        <span className="text-xs font-mono text-[#DAFA9C] font-semibold">
          {current.badge}
        </span>
      </div>

      <Motion.div
        key={activeIndex}
        initial={{ opacity: 0.4, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="py-2"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-mono font-semibold text-[#DAFA9C]">
                {current.company}
              </span>
              <span className="text-xs font-mono text-[#8C929C]">
                · {current.stage}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#F4F4F0]">
              {current.title}
            </p>
          </div>
          <span className="text-xs font-mono text-[#F4F4F0] tabular-nums text-right">
            {current.comp}
          </span>
        </div>

        <div className="py-1.5 px-2.5 bg-[#141518] border-y border-[#22242A] flex items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[#A8ADB6] truncate">{current.matchReason}</span>
          <span className="text-[#34D399] font-semibold shrink-0 tabular-nums">
            {current.matchScore}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#A8ADB6]">
            {current.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <span className="text-[#8C929C]">{current.turnaround}</span>
        </div>
      </Motion.div>

      <div className="flex items-center justify-between pt-2 border-t border-[#22242A]">
        <span className="text-xs font-mono text-[#8C929C]">
          Verified code over keywords
        </span>
        <div className="flex items-center gap-1.5">
          {hiringRoles.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="p-1 cursor-pointer"
              aria-label={`Show role preview ${idx + 1}`}
            >
              <span
                className={`block h-1.5 rounded-[2px] transition-all ${
                  activeIndex === idx
                    ? "w-4 bg-[#DAFA9C]"
                    : "w-1.5 bg-[#2B2E36] hover:bg-[#3A3E48]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CuratedVisualizer = () => {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 select-none text-left">
      <div className="flex items-center justify-between pb-2 border-b border-[#22242A]">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#34D399]" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F4F4F0]">
            Issue Sanitization
          </span>
        </div>
        <span className="text-xs font-mono text-[#34D399] tabular-nums">
          Zero stale tickets
        </span>
      </div>

      <div className="divide-y divide-[#22242A] my-auto">
        <div className="py-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-semibold text-[#F4F4F0]">
              vercel/next.js
            </span>
            <span className="text-xs font-mono text-[#34D399] font-semibold">
              ACTIVE ISSUE
            </span>
          </div>
          <div className="text-xs text-[#F4F4F0] truncate mb-1.5">
            Optimize streaming SSR hydration lifecycle
          </div>
          <div className="flex items-center gap-3 text-xs text-[#A8ADB6] font-mono tabular-nums">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#F59E0B]" />
              118k
            </span>
            <span className="text-[#34D399]">Updated recently</span>
          </div>
        </div>

        <div className="py-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-[#A8ADB6] line-through">
              spam-bot/repo
            </span>
            <span className="text-xs font-mono text-[#F87171]">
              FILTERED OUT
            </span>
          </div>
          <div className="text-xs text-[#A8ADB6] line-through truncate">
            Fix typo in README
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#22242A] flex items-center justify-between text-xs font-mono text-[#8C929C]">
        <span>Maintainer activity checked</span>
        <span className="text-[#A8ADB6]">Unclaimed only</span>
      </div>
    </div>
  );
};

const AICopilotVisualizer = () => {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 select-none text-left">
      <div className="flex items-center justify-between pb-2 border-b border-[#22242A]">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#DAFA9C]" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F4F4F0]">
            FirstMate Assistant
          </span>
        </div>
        <span className="text-xs font-mono text-[#34D399] font-semibold">
          READY
        </span>
      </div>

      <div className="divide-y divide-[#22242A] my-auto">
        <div className="pb-2.5">
          <div className="text-xs font-mono text-[#8C929C] mb-0.5">
            Contributor
          </div>
          <div className="text-xs text-[#F4F4F0]">
            How do I rebase my branch onto upstream main?
          </div>
        </div>

        <div className="pt-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-mono font-semibold text-[#DAFA9C]">
              FirstMate
            </span>
            <span className="text-xs font-mono text-[#8C929C]">
              · Docs &amp; Workflow
            </span>
          </div>

          <div className="bg-[#141518] p-2.5 font-mono text-xs text-[#F4F4F0] mb-1.5 leading-relaxed">
            <div className="text-[#8C929C]"># Sync &amp; rebase</div>
            <div>git fetch upstream</div>
            <div>git rebase upstream/main</div>
          </div>

          <div className="text-xs font-mono text-[#A8ADB6] flex items-center gap-1">
            <Check className="w-3 h-3 text-[#34D399]" />
            <span>Guide: Git Rebasing &amp; PR Hygiene</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#22242A] flex items-center justify-between text-xs font-mono text-[#8C929C]">
        <span>Repository &amp; git help</span>
        <span className="text-[#DAFA9C]">Ask any workflow question</span>
      </div>
    </div>
  );
};

const TimelineFeatures = () => {
  const features = [
    {
      title: "Stack-Matched Issue Discovery",
      description:
        "Analyzes your GitHub repositories and tech stack to surface good first issues aligned with languages you already write.",
      icon: Zap,
      visual: <AIMatchVisualizer />,
      link: "/explore",
      linkText: "Open SmartMatch",
    },
    {
      title: "Proof of Work Attestations",
      description:
        "Build a verifiable engineering record of merged pull requests synced directly from GitHub APIs with SHA-256 verification hashes.",
      icon: Shield,
      visual: <ProofOfWorkVisualizer />,
      link: "/profile",
      linkText: "View Proof of Work",
    },
    {
      badge: "Coming Soon",
      title: "Startup Talent & Hiring",
      description:
        "Opt into recruiter discovery via your merged open-source pull requests rather than unverified keyword resumes.",
      icon: Briefcase,
      visual: <StartupHiringVisualizer active={true} />,
      linkText: "Coming soon",
    },
    {
      title: "Curated Active Repositories",
      description:
        "High-signal issues filtered from maintained open-source projects—excluding stale tickets, spam, and already-claimed threads.",
      icon: Star,
      visual: <CuratedVisualizer />,
      link: "/explore",
      linkText: "Browse top issues",
    },
    {
      title: "FirstMate Git & Repo Assistant",
      description:
        "Get step-by-step answers for git rebasing, codebase navigation, and repository conventions without losing context.",
      icon: Terminal,
      visual: <AICopilotVisualizer />,
      link: "/firstmate",
      linkText: "Open FirstMate",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#22242A] bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F4F0] mb-3 text-balance">
            Everything needed to go from issue lookup to merged PR.
          </h2>
          <p className="text-[#A8ADB6] text-sm sm:text-base leading-relaxed max-w-[60ch] text-pretty">
            Filter active beginner tickets, spin up local environments with
            repo-specific kits, and verify merged contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, idx) => {
            const colSpan = idx === 1 ? "md:col-span-2" : "md:col-span-1";
            return (
              <FeatureCard
                key={feature.title}
                index={idx}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                badge={feature.badge}
                visual={feature.visual}
                link={feature.link}
                linkText={feature.linkText}
                className={colSpan}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TimelineFeatures;
