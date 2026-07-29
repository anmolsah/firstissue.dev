import React from "react";
import { Link } from "react-router-dom";
import {
  Wrench, Sparkles, FileText, ListChecks, FileCode2, MessageSquarePlus,
  ScanLine, ShieldCheck, Copy, ArrowRight, Check,
} from "lucide-react";

// A mono-header card, visually identical to the real ContributionKitModal
// sections — but this is a static marketing mockup, not live data.
const MockSection = ({ icon, title, action, children }) => (
  <div className="border border-zinc-800/60 rounded-lg bg-zinc-950/40 overflow-hidden">
    <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800/60 bg-zinc-950/60">
      <div className="flex items-center gap-2">
        {React.createElement(icon, { className: "w-3 h-3 text-zinc-400" })}
        <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-zinc-300">{title}</span>
      </div>
      {action}
    </div>
    <div className="p-3.5">{children}</div>
  </div>
);

const KIT_BENEFITS = [
  { icon: FileText, title: "Plain-English brief", desc: "What the issue is actually asking for, decoded." },
  { icon: ListChecks, title: "Exact setup steps", desc: "Pulled from the repo's README & CONTRIBUTING." },
  { icon: FileCode2, title: "Files to touch", desc: "A best-guess map of where the change lives." },
  { icon: MessageSquarePlus, title: "Claim comment & PR template", desc: "Drafted in the maintainer's expected tone." },
  { icon: ScanLine, title: "Pre-submit review", desc: "Paste your diff — catch rejections before you open the PR." },
];

const ContributionKitShowcase = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-zinc-900/60">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            From <span className="text-zinc-500">"good first issue"</span> to merged PR
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            The hardest part isn't finding an issue — it's knowing how to start. One click turns any issue into a
            step-by-step starter kit, so you open a pull request with confidence instead of closing the tab.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left — benefits */}
          <div className="space-y-5 order-2 lg:order-1">
            {KIT_BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800/70 flex items-center justify-center flex-shrink-0 text-zinc-300">
                  <b.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">{b.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded transition-all duration-200"
              >
                <Wrench className="w-3.5 h-3.5" />
                Try the Contribution Kit
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-zinc-500 font-mono">1 free kit / month · unlimited for supporters</span>
            </div>
          </div>

          {/* Right — kit mockup */}
          <div className="order-1 lg:order-2 relative group">
            <div className="absolute -inset-px bg-gradient-to-b from-purple-500/15 to-transparent rounded-2xl blur opacity-40" />
            <div className="relative bg-[#0d0e12] rounded-2xl border border-zinc-800/80 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Modal-style header */}
              <div className="flex items-center justify-between gap-3 p-4 border-b border-zinc-800/60 bg-zinc-950/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex-shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Contribution Kit
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate font-mono">facebook/react · #28901 — Docs: clarify useEffect cleanup</div>
                  </div>
                </div>
              </div>

              {/* Modal-style body */}
              <div className="p-4 space-y-3 max-h-[460px] overflow-hidden relative">
                <MockSection icon={FileText} title="What this issue wants">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    The docs example for <code className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-purple-300 font-mono">useEffect</code> cleanup
                    is ambiguous about when the function re-runs. Rewrite it with a clearer subscribe/unsubscribe example.
                  </p>
                </MockSection>

                <MockSection icon={ListChecks} title="Setup steps">
                  <ol className="space-y-1.5">
                    {[
                      "gh repo fork facebook/react --clone",
                      "yarn install && yarn build",
                      "git checkout -b docs/useeffect-cleanup",
                    ].map((step, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-zinc-300">
                        <span className="flex-shrink-0 w-3.5 h-3.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] font-bold text-zinc-400 flex items-center justify-center mt-0.5">{i + 1}</span>
                        <span className="font-mono">{step}</span>
                      </li>
                    ))}
                  </ol>
                </MockSection>

                <MockSection icon={FileCode2} title="Files you'll likely touch">
                  <div className="text-[11px]">
                    <code className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-purple-300 font-mono">packages/react-dom/docs/hooks-effect.md</code>
                    <p className="text-zinc-400 mt-1 leading-relaxed">Probably where the cleanup example is documented.</p>
                  </div>
                </MockSection>

                <MockSection
                  icon={MessageSquarePlus}
                  title="Claim comment"
                  action={<span className="inline-flex items-center gap-1 text-[9px] font-semibold text-zinc-400"><Copy className="w-2.5 h-2.5" />Copy</span>}
                >
                  <p className="text-[11px] text-zinc-300 leading-relaxed italic">
                    "Hi! I'd like to take this one — I'll clarify the cleanup timing with a subscribe/unsubscribe example. Opening a PR shortly."
                  </p>
                </MockSection>

                <MockSection icon={ScanLine} title="Pre-submit review">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-emerald-900/40 bg-emerald-950/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-400">Likely to be accepted</span>
                    <Check className="w-3 h-3 text-emerald-400 ml-auto" />
                  </div>
                </MockSection>

                {/* Fade the bottom so it reads as a scrollable panel */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0e12] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributionKitShowcase;
