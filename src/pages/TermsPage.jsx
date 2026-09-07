import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  FileText,
  CheckCircle2,
  ExternalLink,
  Clock,
  Printer,
  Mail,
  Layers,
  Scale,
  Code2,
  AlertTriangle,
  ChevronRight,
  GitPullRequest,
} from "lucide-react";
import Footer from "../components/Footer";

const TOC_SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "eligibility", title: "2. Eligibility & Capacity" },
  { id: "services-overview", title: "3. Scope of the Service" },
  { id: "user-accounts", title: "4. Accounts & Authentication" },
  { id: "acceptable-use", title: "5. Acceptable Use & Conduct" },
  { id: "intellectual-property", title: "6. Intellectual Property & OSS" },
  { id: "third-party-github", title: "7. GitHub API & Third Parties" },
  { id: "disclaimers", title: "8. Disclaimers of Warranties" },
  { id: "liability", title: "9. Limitation of Liability" },
  { id: "indemnification", title: "10. User Indemnification" },
  { id: "termination", title: "11. Suspension & Termination" },
  { id: "governing-law", title: "12. Governing Law & Disputes" },
  { id: "modifications", title: "13. Modifications to Terms" },
  { id: "contact", title: "14. Contact & Legal Notices" },
];

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  // Scrollspy to automatically highlight the current section in the Table of Contents
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = TOC_SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(TOC_SECTIONS[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(TOC_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-zinc-300 selection:bg-[#00ADB5]/20 selection:text-white">
      {/* Top Floating App Bar */}
      <header className="border-b border-zinc-800/80 bg-[#0B0C10]/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <span className="hidden sm:inline-block w-px h-4 bg-zinc-800" />

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <span className="text-zinc-500">Legal</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">Terms of Service</span>
            </div>
          </div>

          {/* Quick Legal Document Switcher & Print Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
              <Link
                to="/privacy"
                className="px-2.5 py-1 rounded text-zinc-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <span className="px-2.5 py-1 rounded bg-[#00ADB5]/15 text-[#00ADB5] font-semibold border border-[#00ADB5]/30">
                Terms
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              title="Print or save as PDF"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Document Hero */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Terms of Service
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6">
            These Terms of Service ("Terms") constitute a legally binding electronic agreement governing your access to and use of FirstIssue.dev, our open-source issue discoverability services, community tree credentials, and associated tools.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 border-t border-zinc-900 pt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Effective Date: June 2026</span>
            </div>
            <span>•</span>
            <span>Version: 2.4</span>
            <span>•</span>
            <span>Est. Reading Time: ~7 minutes</span>
          </div>
        </div>

        {/* Executive Summary / Key Highlights Cards */}
        <div className="mb-14 p-5 sm:p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 shadow-xl">
          <div className="mb-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Key Highlights (At a Glance)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Empowering Developers</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                FirstIssue.dev is a free community platform dedicated to lowering the open-source barrier of entry for engineers worldwide.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">You Own Your Code</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                We claim zero ownership over your pull requests or software code. All contributions adhere to the underlying project's OSS license.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Responsible Usage</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Automated crawling that floods GitHub APIs or disrupts service availability is strictly prohibited under our fair use policy.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">"As Is" Service</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                We aggregate public repositories in good faith. We cannot guarantee issue acceptance, response times, or maintainer decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Sticky TOC on Left, Document Body on Right */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          {/* Sticky Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="rounded-2xl border border-zinc-800/80 bg-[#0d0e14]/80 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#00ADB5]" />
                  Table of Contents
                </span>
                <span className="text-[10px] font-mono text-zinc-500">14 Sections</span>
              </div>

              <nav className="space-y-1 text-xs font-mono">
                {TOC_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? "bg-white/[0.04] text-white font-semibold border-l-2 border-[#00ADB5]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${
                          isActive ? "opacity-100 translate-x-0.5 text-[#00ADB5]" : "opacity-0 group-hover:opacity-50"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Help Box */}
              <div className="mt-6 pt-4 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500 space-y-2">
                <p>Questions about these terms?</p>
                <a
                  href="mailto:annifind010@gmail.com"
                  className="inline-flex items-center gap-1.5 text-[#00ADB5] hover:underline"
                >
                  <Mail className="w-3 h-3" />
                  <span>annifind010@gmail.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Document Content Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  1. Acceptance of Terms &amp; Electronic Agreement
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  By accessing, browsing, creating an account on, or interacting with <strong className="text-white">FirstIssue.dev</strong> (the "Service" or "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <p>
                  If you do not agree to these Terms in their entirety, you are strictly prohibited from accessing or using the Service. These Terms apply to all visitors, registered contributors, and organizations utilizing FirstIssue.dev.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  2. Eligibility &amp; Legal Capacity
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  You represent and warrant that you are at least <strong className="text-white">13 years of age</strong> (or 16 years of age in applicable jurisdictions such as the European Economic Area). Individuals under the required age may not register for an account or transmit personal data to the Service.
                </p>
                <p>
                  If you are entering into these Terms on behalf of a company, educational institution, or legal entity, you represent and warrant that you possess the necessary authority to legally bind that entity to these provisions.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="services-overview" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  3. Scope of the Service &amp; Features
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  FirstIssue.dev provides discovery tools, curated filters, AI-assisted issue summaries (FirstMate), and community visualization canvases (The Contribution Tree) to help software developers locate open-source contribution opportunities across GitHub.
                </p>
                <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80 text-xs space-y-2">
                  <div className="font-bold text-white">Platform Scope Boundaries:</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li>FirstIssue.dev is an aggregator and facilitator; we do not own, maintain, or control third-party open-source repositories indexed on the platform.</li>
                    <li>The acceptance, review, merging, or rejection of pull requests is solely at the discretion of individual project maintainers.</li>
                    <li>FirstIssue.dev does not guarantee that any indexed issue remains unassigned or that maintainers will respond.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="user-accounts" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  4. Accounts &amp; GitHub Authentication
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  To save bookmarks, customize filters, or display your contributions, you must authenticate through GitHub OAuth.
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm ml-1">
                  <li><strong className="text-white">Account Security:</strong> You are solely responsible for maintaining the security of your GitHub credentials and for any activity conducted through your authenticated session.</li>
                  <li><strong className="text-white">Accuracy:</strong> You agree not to impersonate another developer, organization, or GitHub handle.</li>
                  <li><strong className="text-white">Notification:</strong> You must promptly notify us if you suspect unauthorized access or security compromises relating to your session.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  5. Acceptable Use Policy &amp; Prohibited Conduct
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                You agree to use FirstIssue.dev only for lawful, professional, and constructive software development purposes. You shall not:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="font-bold text-zinc-200 mb-1">No Malicious Abuse</h4>
                  <p className="text-zinc-400">Attempt to disrupt, overwhelm, or launch Denial-of-Service (DDoS) attacks against FirstIssue.dev infrastructure.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="font-bold text-zinc-200 mb-1">No Aggressive Scraping</h4>
                  <p className="text-zinc-400">Deploy automated bots or scrapers that exceed reasonable limits or trigger GitHub API rate-limiting blocks.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="font-bold text-zinc-200 mb-1">No Vulnerability Exploits</h4>
                  <p className="text-zinc-400">Probe, scan, or reverse engineer database endpoints or authentication tokens without authorized consent.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="font-bold text-zinc-200 mb-1">No Community Harassment</h4>
                  <p className="text-zinc-400">Post abusive comments, spam issue maintainers, or submit fraudulent pull requests to game leaderboard credentials.</p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="intellectual-property" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  6. Intellectual Property &amp; Open Source Licensing
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  <strong className="text-white">Platform Property:</strong> FirstIssue.dev, its brand marks, logos, original software code, user interface designs, and interactive canvas components are the exclusive property of FirstIssue.dev and its creators.
                </p>
                <p>
                  <strong className="text-white">Third-Party Open Source Code:</strong> All source code, issue titles, issue descriptions, and pull requests indexed from GitHub are governed by the respective open-source licenses (e.g. MIT, Apache 2.0, GPL, BSD) designated by their respective repository owners. FirstIssue.dev asserts no copyright ownership over any third-party code.
                </p>
                <p>
                  <strong className="text-white">Community Tree Submissions:</strong> By submitting a pull request to be featured on the Contribution Tree canvas, you grant FirstIssue.dev a non-exclusive, worldwide, royalty-free license to display your public GitHub username, avatar, PR title, and cryptographic hash on the public canvas.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="third-party-github" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  7. GitHub API Terms &amp; Third-Party Services
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  FirstIssue.dev operates independently and is neither endorsed, sponsored, nor affiliated with GitHub, Inc. or Microsoft Corporation.
                </p>
                <p>
                  Our services utilize the official GitHub REST and GraphQL APIs strictly adhering to the{" "}
                  <a
                    href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00ADB5] hover:underline inline-flex items-center gap-1 font-mono text-xs"
                  >
                    GitHub Terms of Service
                    <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and GitHub Acceptable Use Policies. By using FirstIssue.dev, you also agree to comply with all applicable GitHub platform rules.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="disclaimers" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  08
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  8. Disclaimers of Warranties ("As Is")
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80 text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed uppercase">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. FIRSTISSUE.DEV DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, BUG-FREE, SECURE, OR ACCURATE.
              </div>
            </section>

            {/* Section 9 */}
            <section id="liability" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  09
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  9. Limitation of Liability
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80 text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FIRSTISSUE.DEV, ITS FOUNDERS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, CODE CORRUPTION, OR OTHER INTANGIBLE LOSSES ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR INABILITY TO ACCESS THE SERVICE.
              </div>
            </section>

            {/* Section 10 */}
            <section id="indemnification" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  10
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  10. User Indemnification
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                You agree to defend, indemnify, and hold harmless FirstIssue.dev, its creators, operators, and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or legal fees arising out of or relating to your violation of these Terms or your misuse of the Service.
              </p>
            </section>

            {/* Section 11 */}
            <section id="termination" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  11
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  11. Suspension &amp; Account Termination
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  We reserve the right, in our sole discretion, to suspend, limit, or terminate your account and bar access to the Service at any time, without prior notice, if you breach these Terms, engage in scraping abuse, or act in a manner detrimental to the platform or other developers.
                </p>
                <p>
                  You may terminate your account at any time by disconnecting your GitHub OAuth connection and requesting profile data removal via <code className="text-zinc-200 font-mono">annifind010@gmail.com</code>.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="governing-law" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  12
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  12. Governing Law &amp; Dispute Resolution
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  These Terms shall be governed by and construed in accordance with the substantive laws of applicable international commerce, without giving effect to any conflict of law principles.
                </p>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to these Terms shall first be resolved through good-faith informal negotiations between the parties before initiating formal legal proceedings.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section id="modifications" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  13
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  13. Modifications to Service &amp; Terms
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                We reserve the right to modify or replace these Terms at our discretion. Material changes will be indicated by updating the "Effective Date" at the top of this document. Continued use of FirstIssue.dev following notice of changes constitutes your acceptance of the revised Terms.
              </p>
            </section>

            {/* Section 14 */}
            <section id="contact" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  14
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  14. Contact &amp; Legal Notices
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  For questions, legal inquiries, copyright notices (DMCA), or clarifications regarding these Terms of Service, please contact our team directly:
                </p>

                <div className="p-4 rounded-xl bg-[#0B0C10]/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Legal Counsel &amp; Operations</h4>
                    <p className="text-xs text-zinc-400 font-mono">Direct email contact:</p>
                    <a
                      href="mailto:annifind010@gmail.com"
                      className="text-xs font-mono font-bold text-[#00ADB5] hover:underline flex items-center gap-1.5 mt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      annifind010@gmail.com
                    </a>
                  </div>

                  <Link
                    to="/privacy"
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono font-medium border border-zinc-800 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Read Privacy Policy</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsPage;
