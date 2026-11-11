import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ComparisonSection from "../components/ComparisonSection";
import TimelineFeatures from "../components/TimelineFeatures";
import ContributionKitShowcase from "../components/ContributionKitShowcase";
import ContributionTree from "../components/ContributionTree";
import TrustedByMarquee from "../components/TrustedByMarquee";
import { ArrowRight, Check, Copy, ExternalLink, Terminal } from "lucide-react";

const DISPATCH_QUEUE = [
  {
    id: "react-31402",
    repo: "facebook/react",
    issueNum: "#31402",
    title: "Restore keyboard focus trap in strict Suspense test",
    stack: "TypeScript",
    status: "READY",
    estTime: "EST. 45 MIN",
    summary:
      "Plain summary: add a regression unit test asserting keyboard focus stays inside the dialog node when an inner async child suspends twice.",
    commands: [
      "git clone --depth=1 https://github.com/facebook/react",
      "yarn install --frozen-lockfile",
      "yarn test ReactSuspense-test.js",
    ],
    files: [
      "packages/react-reconciler/src/ReactFiberCommitWork.js",
      "packages/react-dom/src/__tests__/ReactSuspense-test.js",
    ],
  },
  {
    id: "fastapi-12894",
    repo: "tiangolo/fastapi",
    issueNum: "#12894",
    title: "Clarify async dependency cleanup docs example",
    stack: "Python",
    status: "READY",
    estTime: "EST. 30 MIN",
    summary:
      "Plain summary: update the yield-dependency teardown snippet under Advanced Dependencies to pass pytest strict async fixture checks.",
    commands: [
      "git clone --depth=1 https://github.com/tiangolo/fastapi",
      "pip install -e .[dev]",
      "pytest tests/test_tutorial/test_dependencies/",
    ],
    files: [
      "docs/en/docs/tutorial/dependencies/dependencies-with-yield.md",
      "docs_src/dependencies/tutorial008_an_py39.py",
    ],
  },
  {
    id: "nextjs-71920",
    repo: "vercel/next.js",
    issueNum: "#71920",
    title: "Handle empty locale segment in static export check",
    stack: "TypeScript",
    status: "READY",
    estTime: "EST. 60 MIN",
    summary:
      "Plain summary: guard against an empty string in normalized locale prefixes before running static HTML path resolution.",
    commands: [
      "git clone --depth=1 https://github.com/vercel/next.js",
      "pnpm install --frozen-lockfile",
      "pnpm test-unit test/unit/normalize-locale-path.test.ts",
    ],
    files: [
      "packages/next/src/shared/lib/i18n/normalize-locale-path.ts",
      "test/unit/normalize-locale-path.test.ts",
    ],
  },
  {
    id: "tailwind-15038",
    repo: "tailwindlabs/tailwindcss",
    issueNum: "#15038",
    title: "Fix focus-visible variant order in container plugin",
    stack: "Rust / TS",
    status: "CLAIMED",
    estTime: "EST. 50 MIN",
    summary:
      "Plain summary: align variant sorting weights so focus-visible rules consistently emit after hover utilities inside @container blocks.",
    commands: [
      "git clone --depth=1 https://github.com/tailwindlabs/tailwindcss",
      "pnpm install",
      "pnpm --filter tailwindcss test variant-order",
    ],
    files: [
      "packages/tailwindcss/src/variants.ts",
      "packages/tailwindcss/src/variants.test.ts",
    ],
  },
  {
    id: "supabase-30118",
    repo: "supabase/supabase",
    issueNum: "#30118",
    title: "Add CLI validation hint for missing local studio port",
    stack: "Go / TS",
    status: "READY",
    estTime: "EST. 35 MIN",
    summary:
      "Plain summary: print an actionable warning and fallback port suggestion when Docker binds an occupied local studio port.",
    commands: [
      "git clone --depth=1 https://github.com/supabase/cli",
      "go test ./internal/start/...",
      "go run . start --help",
    ],
    files: [
      "internal/start/start.go",
      "internal/start/start_test.go",
    ],
  },
];

const LandingPage = () => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(DISPATCH_QUEUE[0].id);
  const [copiedCmds, setCopiedCmds] = useState(false);

  const selectedDispatch =
    DISPATCH_QUEUE.find((item) => item.id === selectedId) || DISPATCH_QUEUE[0];

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(selectedDispatch.commands.join("\n"));
    setCopiedCmds(true);
    setTimeout(() => setCopiedCmds(false), 1800);
  };

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] overflow-x-hidden">
      {/* Hero + Live Merge Dispatch Board */}
      <section className="pt-[88px] sm:pt-[96px] pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Asymmetric Editorial Grid (7 / 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
            <div className="lg:col-span-7">
              <h1 className="text-[clamp(2.25rem,4.5vw,3.875rem)] font-bold tracking-[-0.035em] leading-[1.02] text-[#F4F4F0] text-balance">
                Ship your first merged open-source pull request.
              </h1>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <p className="text-base sm:text-[17px] leading-[1.5] text-[#A8ADB6] max-w-[60ch] text-pretty">
                Curated active GitHub issues vetted for starter clarity, paired
                with setup commands, likely files, and verified PR credentials.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/explore"
                  className="px-5 py-3 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-sm font-semibold rounded-[4px] transition-colors inline-flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <span>Browse 1,420 Ready Issues</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#contribution-kit-showcase"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("contribution-kit-showcase")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-3 bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] hover:border-[#3A3E48] text-[#F4F4F0] text-sm font-medium rounded-[4px] transition-colors text-center inline-flex items-center justify-center min-h-[44px]"
                >
                  Inspect Contribution Kit
                </a>
              </div>

              <div className="font-mono text-xs text-[#8C929C] flex flex-wrap gap-x-6 gap-y-2 tabular-nums">
                <span>
                  <strong className="text-[#F4F4F0] font-medium">1,420</strong>{" "}
                  active beginner issues
                </span>
                <span>
                  <strong className="text-[#F4F4F0] font-medium">
                    GitHub API
                  </strong>{" "}
                  verified PR records
                </span>
                <span>
                  <strong className="text-[#F4F4F0] font-medium">$0</strong>{" "}
                  core · $9/mo Supporter
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Dispatch Queue + Kit Inspector */}
          <div
            className="bg-[#141518] border border-[#2B2E36] rounded-[4px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
            role="region"
            aria-label="Interactive issue dispatch queue"
          >
            {/* Left Queue (7 cols) */}
            <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#2B2E36] flex flex-col">
              <div className="hidden sm:grid sm:grid-cols-12 px-5 py-3 border-b border-[#2B2E36] bg-[#17181B] font-mono text-xs text-[#8C929C] uppercase tracking-wider">
                <span className="col-span-3">Repository</span>
                <span className="col-span-5">Issue Brief</span>
                <span className="col-span-2">Stack</span>
                <span className="col-span-2 text-right">Dispatch</span>
              </div>

              <div className="divide-y divide-[#22242A]">
                {DISPATCH_QUEUE.map((row) => {
                  const active = row.id === selectedDispatch.id;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      aria-pressed={active}
                      className={`w-full text-left px-4 sm:px-5 py-3.5 transition-colors cursor-pointer grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-3 items-center ${
                        active
                          ? "bg-[#1C1E23]"
                          : "bg-transparent hover:bg-[#17181B]"
                      }`}
                    >
                      <span className="sm:col-span-3 font-mono text-xs text-[#F4F4F0] flex items-center gap-2 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            active ? "bg-[#DAFA9C]" : "bg-[#3A3E48]"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{row.repo}</span>
                      </span>

                      <span className="sm:col-span-5 text-sm text-[#F4F4F0] sm:truncate min-w-0">
                        <span className="font-mono text-xs text-[#8C929C] mr-1.5 tabular-nums">
                          {row.issueNum}
                        </span>
                        {row.title}
                      </span>

                      <span className="hidden sm:block sm:col-span-2 font-mono text-xs text-[#A8ADB6]">
                        {row.stack}
                      </span>

                      <span className="sm:col-span-2 flex sm:justify-end">
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded-[4px] border tabular-nums ${
                            row.status === "READY"
                              ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                              : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                          }`}
                        >
                          {row.status}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Kit Inspector (5 cols) */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-4 bg-[#17181B]">
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-[#22242A]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Terminal className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                    <h2 className="text-sm font-semibold text-[#F4F4F0] truncate">
                      Contribution Kit · {selectedDispatch.repo}{" "}
                      {selectedDispatch.issueNum}
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#DAFA9C] tabular-nums shrink-0">
                    {selectedDispatch.estTime}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[#A8ADB6] max-w-[60ch] text-pretty">
                  {selectedDispatch.summary}
                </p>

                <div className="bg-[#0B0C0E] border-y border-[#22242A] -mx-5 sm:-mx-6 overflow-hidden">
                  <div className="flex items-center justify-between px-5 sm:px-6 py-2 border-b border-[#22242A] bg-[#141518]">
                    <span className="font-mono text-xs text-[#8C929C] uppercase tracking-wider">
                      Setup Commands
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCommands}
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors cursor-pointer"
                    >
                      {copiedCmds ? (
                        <>
                          <Check className="w-3 h-3 text-[#34D399]" />
                          <span className="text-[#34D399]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="px-5 sm:px-6 py-3.5 font-mono text-xs leading-relaxed text-[#F4F4F0] overflow-x-auto">
                    <code>{selectedDispatch.commands.join("\n")}</code>
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <p className="font-mono text-xs text-[#8C929C] uppercase tracking-wider">
                    Candidate Files
                  </p>
                  <div className="flex flex-col gap-1 font-mono text-xs text-[#DAFA9C]">
                    {selectedDispatch.files.map((file) => (
                      <span key={file} className="truncate" title={file}>
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#22242A] flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-[#8C929C]">
                  Click a row to swap kit preview
                </span>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DAFA9C] hover:text-[#C7F275] transition-colors shrink-0"
                >
                  <span>Open full queue</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <TrustedByMarquee />

      {/* Product Walkthrough Clip */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#22242A]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F4F0] text-balance">
                From issue triage to merged PR verification.
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-mono text-[#A8ADB6] hover:text-[#DAFA9C] transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <span>Launch live workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-[4px] border border-[#2B2E36] overflow-hidden bg-[#0B0C0E]">
            <video
              src="https://res.cloudinary.com/dl3czd3ib/video/upload/f_auto,q_auto/v1768837375/firstissue.dev_f8gqfj.mp4"
              aria-label="FirstIssue.dev Workspace Walkthrough"
              className="w-full h-auto object-cover block"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      {/* Core Feature Modules */}
      <TimelineFeatures />

      {/* Contribution Kit Deep Dive */}
      <ContributionKitShowcase />

      {/* Interactive Community Contribution Tree */}
      <ContributionTree />

      {/* Contributor Telemetry Ledger */}
      <section
        id="user-count-section"
        className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[#22242A] bg-[#0F0F0F]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F4F0] text-balance">
              Built for student and early-career contributors shipping public code.
            </h2>
            <p className="text-sm text-[#A8ADB6] max-w-[55ch] leading-relaxed text-pretty">
              Active tickets stay verified against GitHub GraphQL and REST endpoints so your effort goes into code review, not dead threads.
            </p>
          </div>

          <div className="lg:col-span-7 border border-[#2B2E36] bg-[#141518] rounded-[4px] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#22242A]">
            <div className="p-5">
              <p className="font-mono text-xl font-bold tabular-nums text-[#F4F4F0]">
                2,000+
              </p>
              <p className="text-xs text-[#A8ADB6] mt-1 leading-relaxed text-pretty">
                Active student and early-career open-source contributors
              </p>
            </div>
            <div className="p-5">
              <p className="font-mono text-xl font-bold tabular-nums text-[#DAFA9C]">
                1,420
              </p>
              <p className="text-xs text-[#A8ADB6] mt-1 leading-relaxed text-pretty">
                Unclaimed beginner issues indexed with setup hints
              </p>
            </div>
            <div className="p-5">
              <p className="font-mono text-xl font-bold tabular-nums text-[#34D399]">
                SHA-256
              </p>
              <p className="text-xs text-[#A8ADB6] mt-1 leading-relaxed text-pretty">
                GitHub PR state verification &amp; exportable PDF / PNG proof
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Comparison */}
      <ComparisonSection />

      {/* Final Conversion CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#22242A] bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto bg-[#141518] border border-[#2B2E36] rounded-[4px] p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F4F0] text-balance">
              Open your first verified pull request this week.
            </h2>
            <p className="text-sm sm:text-base text-[#A8ADB6] max-w-[58ch] leading-relaxed text-pretty">
              Core issue discovery, bookmarking, status tracking, and GitHub-verified PR cards stay $0.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-1">
              <Link
                to={user ? "/explore" : "/login"}
                className="px-6 py-3 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>{user ? "Open Workspace" : "Sign in with GitHub"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[#22242A] pt-6 lg:pt-0 lg:pl-8 font-mono text-xs space-y-3 text-[#A8ADB6]">
            <div className="flex items-start justify-between gap-4 pb-2.5 border-b border-[#22242A]">
              <span className="text-[#8C929C]">1. Pick ticket</span>
              <span className="text-[#F4F4F0] text-right">
                Filter unclaimed starter issues
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 pb-2.5 border-b border-[#22242A]">
              <span className="text-[#8C929C]">2. Local kit</span>
              <span className="text-[#DAFA9C] text-right">
                Copy setup &amp; candidate files
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[#8C929C]">3. Ship &amp; prove</span>
              <span className="text-[#34D399] text-right">
                Sync merged PR digest
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
