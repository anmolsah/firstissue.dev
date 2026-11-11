import React from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  FileText,
  ListChecks,
  FileCode2,
  MessageSquarePlus,
  ScanLine,
  ShieldCheck,
  Copy,
  ArrowRight,
  Check,
} from "lucide-react";

const MockSection = ({ icon, title, action, children }) => (
  <div className="px-4 py-3.5 bg-[#0B0C0E]">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        {React.createElement(icon, { className: "w-3.5 h-3.5 text-[#DAFA9C]" })}
        <span className="text-xs font-semibold font-mono uppercase tracking-wider text-[#F4F4F0]">
          {title}
        </span>
      </div>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

const KIT_BENEFITS = [
  {
    icon: FileText,
    title: "Plain-English summary",
    desc: "What the maintainer expects without wading through long issue threads.",
  },
  {
    icon: ListChecks,
    title: "Exact setup commands",
    desc: "Extracted from the repository's README and CONTRIBUTING docs.",
  },
  {
    icon: FileCode2,
    title: "Candidate source files",
    desc: "Likely modules and test paths to inspect before you write a line.",
  },
  {
    icon: MessageSquarePlus,
    title: "Claim comment & PR draft",
    desc: "Concise phrasing tailored to the repo's contribution template.",
  },
  {
    icon: ScanLine,
    title: "Pre-submit diff review",
    desc: "Paste your `git diff` to spot formatting, test, or edge-case gaps first.",
  },
];

const ContributionKitShowcase = () => {
  return (
    <section
      id="contribution-kit-showcase"
      className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#22242A] bg-[#0F0F0F] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F4F0] mb-3 leading-tight text-balance">
            Turn any &ldquo;good first issue&rdquo; into a clear checklist.
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADB6] leading-relaxed max-w-[62ch] text-pretty">
            Finding an open ticket is only half the hurdle. Each Contribution Kit maps local setup steps, candidate files, and PR checks before you fork.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
            {KIT_BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-[4px] bg-[#141518] border border-[#2B2E36] flex items-center justify-center shrink-0 text-[#DAFA9C]">
                  <b.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#F4F4F0]">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#A8ADB6] leading-relaxed mt-0.5 text-pretty">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] font-semibold text-xs sm:text-sm rounded-[4px] transition-colors min-h-[44px]"
              >
                <Wrench className="w-4 h-4" />
                <span>Generate a Contribution Kit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-[#8C929C] font-mono">
                1 free kit / month · unlimited for Supporters
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-[#141518] rounded-[4px] border border-[#2B2E36] overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-4 border-b border-[#22242A] bg-[#17181B]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Wrench className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F4F4F0]">
                      Contribution Kit · Sample Inspection
                    </div>
                    <div className="text-xs text-[#8C929C] truncate font-mono">
                      facebook/react · #28901 — Docs: clarify useEffect cleanup
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#22242A]">
                <MockSection icon={FileText} title="What this issue wants">
                  <p className="text-xs text-[#A8ADB6] leading-relaxed">
                    The docs example for{" "}
                    <code className="px-1.5 py-0.5 bg-[#17181B] rounded-[4px] text-xs text-[#DAFA9C] font-mono">
                      useEffect
                    </code>{" "}
                    cleanup is ambiguous about re-runs. Update it with a clearer subscribe/unsubscribe timer pattern.
                  </p>
                </MockSection>

                <MockSection icon={ListChecks} title="Setup steps">
                  <ol className="space-y-1.5">
                    {[
                      "gh repo fork facebook/react --clone",
                      "yarn install && yarn build",
                      "git checkout -b docs/useeffect-cleanup",
                    ].map((step, i) => (
                      <li
                        key={step}
                        className="flex items-center gap-2.5 text-xs text-[#F4F4F0]"
                      >
                        <span className="shrink-0 font-mono text-xs text-[#DAFA9C] tabular-nums">
                          {i + 1}.
                        </span>
                        <span className="font-mono break-all">{step}</span>
                      </li>
                    ))}
                  </ol>
                </MockSection>

                <MockSection icon={FileCode2} title="Candidate files">
                  <div className="text-xs">
                    <code className="px-2 py-0.5 bg-[#17181B] rounded-[4px] text-xs text-[#DAFA9C] font-mono">
                      packages/react-dom/docs/hooks-effect.md
                    </code>
                    <p className="text-[#A8ADB6] mt-1.5 leading-relaxed">
                      Markdown section holding the effect cleanup snippet.
                    </p>
                  </div>
                </MockSection>

                <MockSection
                  icon={MessageSquarePlus}
                  title="Claim comment"
                  action={
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-[#A8ADB6]">
                      <Copy className="w-3 h-3" />
                      Copy
                    </span>
                  }
                >
                  <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                    &ldquo;Hi, I&apos;d like to clarify the cleanup timing section with a concise subscribe/unsubscribe example. Opening a PR&nbsp;soon.&rdquo;
                  </p>
                </MockSection>

                <MockSection icon={ScanLine} title="Pre-submit review">
                  <div className="flex items-center gap-2 py-1 text-[#34D399]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold">
                      Likely to be accepted
                    </span>
                    <Check className="w-3.5 h-3.5 ml-auto shrink-0" />
                  </div>
                </MockSection>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributionKitShowcase;
