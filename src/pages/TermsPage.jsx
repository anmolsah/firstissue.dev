import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  ExternalLink,
  Clock,
  Printer,
  Mail,
  Layers,
  Code2,
  AlertTriangle,
  ChevronRight,
  GitPullRequest,
} from "lucide-react";
import Footer from "../components/Footer";
import BrandMark from "../components/BrandMark";

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
    <div className="min-h-screen bg-[#0F0F0F] text-[#A8ADB6] font-sans">
      {/* Top App Bar */}
      <header className="border-b border-[#22242A] bg-[#0F0F0F] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:opacity-90 transition-opacity shrink-0" aria-label="FirstIssue.dev home">
              <BrandMark size="sm" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors text-xs sm:text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <span className="hidden sm:inline-block w-px h-4 bg-[#22242A]" />

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8C929C] font-mono">
              <span>Legal</span>
              <span>/</span>
              <span className="text-[#F4F4F0]">Terms of Service</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-[#141518] border border-[#2B2E36] rounded-[4px] p-0.5 text-xs font-mono">
              <Link
                to="/privacy"
                className="px-2.5 py-1 rounded-[2px] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors"
              >
                Privacy
              </Link>
              <span className="px-2.5 py-1 rounded-[2px] bg-[#DAFA9C]/15 text-[#DAFA9C] font-semibold border border-[#DAFA9C]/35">
                Terms
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print terms of service"
              title="Print or save as PDF"
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] hover:border-[#3A3E48] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Document Hero */}
        <div className="max-w-3xl mb-12 sm:mb-14">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F4F4F0] tracking-tight mb-4 leading-tight text-balance">
            Terms of Service
          </h1>

          <p className="text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] mb-6 text-pretty">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding electronic agreement governing your access to and use of FirstIssue.dev, our open-source issue discoverability services, community contribution verification, and associated tools.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8C929C] border-t border-[#22242A] pt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#DAFA9C]" />
              <span>Effective Date: June 2026</span>
            </div>
            <span>·</span>
            <span>Version: 2.4</span>
            <span>·</span>
            <span>Est. Reading Time: ~7 minutes</span>
          </div>
        </div>

        {/* Executive Summary */}
        <section aria-label="Terms highlights summary" className="mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C929C] font-mono mb-4">
            Key Highlights (At a Glance)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <Code2 className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">
                  Empowering Developers
                </h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                FirstIssue.dev helps lower the barrier to open-source engineering for students and new contributors worldwide.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <GitPullRequest className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">
                  You Own Your Code
                </h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                We claim zero ownership over your pull requests or source code. Contributions follow the upstream repository&apos;s OSS license.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">
                  Responsible Usage
                </h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                Automated crawling that floods GitHub APIs or disrupts service availability is strictly prohibited under fair use.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">
                  &quot;As Is&quot; Service
                </h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                We aggregate public repositories in good faith. We cannot guarantee issue acceptance, response times, or maintainer decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Two-Column Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="rounded-[4px] border border-[#2B2E36] bg-[#141518] p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#22242A]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F4F0] flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#DAFA9C]" />
                  Table of Contents
                </span>
                <span className="text-xs font-mono text-[#8C929C]">14 Sections</span>
              </div>

              <nav aria-label="Terms of service sections" className="space-y-1 text-xs font-mono">
                {TOC_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-[4px] border transition-colors flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? "bg-[#17181B] text-[#DAFA9C] border-[#DAFA9C]/40 font-semibold"
                          : "text-[#A8ADB6] border-transparent hover:text-[#F4F4F0] hover:bg-[#17181B]/60"
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform shrink-0 ${
                          isActive
                            ? "opacity-100 translate-x-0.5 text-[#DAFA9C]"
                            : "opacity-0 group-hover:opacity-60"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-[#22242A] text-xs font-mono text-[#8C929C] space-y-2">
                <p>Questions about these terms?</p>
                <a
                  href="mailto:support@firstissue.dev"
                  className="inline-flex items-center gap-1.5 text-[#DAFA9C] hover:underline"
                >
                  <Mail className="w-3 h-3" />
                  <span>support@firstissue.dev</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Document Content Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Section 1 */}
            <section
              id="acceptance"
              className="scroll-mt-24 pt-10 first:pt-0 border-t border-[#22242A] first:border-t-0"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Acceptance of Terms &amp; Electronic Agreement
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  By accessing, browsing, creating an account on, or interacting with{" "}
                  <strong className="text-[#F4F4F0]">FirstIssue.dev</strong> (the &quot;Service&quot; or &quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <p>
                  If you do not agree to these Terms in their entirety, you are strictly prohibited from accessing or using the Service. These Terms apply to all visitors, registered contributors, and organizations utilizing FirstIssue.dev.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="eligibility"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Eligibility &amp; Legal Capacity
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  You represent and warrant that you are at least{" "}
                  <strong className="text-[#F4F4F0]">13 years of age</strong> (or 16 years of age in applicable jurisdictions such as the European Economic Area). Individuals under the required age may not register for an account or transmit personal data to the Service.
                </p>
                <p>
                  If you are entering into these Terms on behalf of a company, educational institution, or legal entity, you represent and warrant that you possess the necessary authority to legally bind that entity to these provisions.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="services-overview"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Scope of the Service &amp; Features
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[56ch] text-pretty">
                <p className="max-w-[54ch]">
                  FirstIssue.dev provides discovery tools, curated filters, AI-assisted issue briefs (FirstMate), and community visualization canvases (The Contribution Tree) to help software developers locate open-source contribution opportunities across GitHub.
                </p>
                <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-sm space-y-2">
                  <div className="font-bold text-[#F4F4F0]">Platform Scope Boundaries:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#A8ADB6] leading-relaxed">
                    <li>
                      FirstIssue.dev is an aggregator and facilitator; we do not own, maintain, or control third-party open-source repositories indexed on the platform.
                    </li>
                    <li>
                      The acceptance, review, merging, or rejection of pull requests is solely at the discretion of individual project maintainers.
                    </li>
                    <li>
                      FirstIssue.dev does not guarantee that any indexed issue remains unassigned or that maintainers will respond.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section
              id="user-accounts"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Accounts &amp; GitHub Authentication
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  To save bookmarks, customize filters, or display your contributions, you must authenticate through GitHub OAuth.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-[15px] ml-1">
                  <li>
                    <strong className="text-[#F4F4F0]">Account Security:</strong> You are solely responsible for maintaining the security of your GitHub credentials and for any activity conducted through your authenticated session.
                  </li>
                  <li>
                    <strong className="text-[#F4F4F0]">Accuracy:</strong> You agree not to impersonate another developer, organization, or GitHub handle.
                  </li>
                  <li>
                    <strong className="text-[#F4F4F0]">Notification:</strong> You must promptly notify us if you suspect unauthorized access or security compromises relating to your session.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section
              id="acceptable-use"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Acceptable Use Policy &amp; Prohibited Conduct
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] mb-4 text-pretty">
                You agree to use FirstIssue.dev only for lawful, professional, and constructive software development purposes. You shall not:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-w-[56ch]">
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="font-bold text-[#F4F4F0] mb-1">No Malicious Abuse</h3>
                  <p className="text-[#A8ADB6] leading-relaxed">
                    Attempt to disrupt, overwhelm, or launch Denial-of-Service (DDoS) attacks against FirstIssue.dev infrastructure.
                  </p>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="font-bold text-[#F4F4F0] mb-1">No Aggressive Scraping</h3>
                  <p className="text-[#A8ADB6] leading-relaxed">
                    Deploy automated bots or scrapers that exceed reasonable limits or trigger GitHub API rate-limiting blocks.
                  </p>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="font-bold text-[#F4F4F0] mb-1">No Vulnerability Exploits</h3>
                  <p className="text-[#A8ADB6] leading-relaxed">
                    Probe, scan, or attack database endpoints or authentication tokens without authorized consent.
                  </p>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="font-bold text-[#F4F4F0] mb-1">No Community Harassment</h3>
                  <p className="text-[#A8ADB6] leading-relaxed">
                    Post abusive comments, spam issue maintainers, or submit fraudulent pull requests to game verification records.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section
              id="intellectual-property"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Intellectual Property &amp; Open Source Licensing
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  <strong className="text-[#F4F4F0]">Platform Property:</strong> FirstIssue.dev, its brand marks, logos, original software code, user interface designs, and interactive components are the property of FirstIssue.dev and its creators.
                </p>
                <p>
                  <strong className="text-[#F4F4F0]">Third-Party Open Source Code:</strong> All source code, issue titles, issue descriptions, and pull requests indexed from GitHub are governed by the respective open-source licenses (e.g., MIT, Apache 2.0, GPL, BSD) designated by their respective repository owners. FirstIssue.dev asserts no copyright ownership over any third-party code.
                </p>
                <p>
                  <strong className="text-[#F4F4F0]">Community Tree Submissions:</strong> By submitting a pull request to be featured on the Contribution Tree, you grant FirstIssue.dev a non-exclusive, worldwide, royalty-free license to display your public GitHub username, avatar, PR title, and SHA-256 verification digest on the public feed.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section
              id="third-party-github"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                GitHub API Terms &amp; Third-Party Services
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  FirstIssue.dev operates independently and is neither endorsed, sponsored, nor affiliated with GitHub, Inc. or Microsoft Corporation.
                </p>
                <p>
                  Our services utilize the official GitHub REST and GraphQL APIs strictly adhering to the{" "}
                  <a
                    href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#DAFA9C] hover:underline inline-flex items-center gap-1 font-mono text-xs"
                  >
                    GitHub Terms of Service
                    <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and GitHub Acceptable Use Policies. By using FirstIssue.dev, you also agree to comply with all applicable GitHub platform rules.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section
              id="disclaimers"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Disclaimers of Warranties (&quot;As Is&quot;)
              </h2>

              <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-xs sm:text-sm font-mono text-[#F4F4F0]/90 leading-relaxed uppercase max-w-[56ch]">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. FIRSTISSUE.DEV DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, BUG-FREE, SECURE, OR ACCURATE.
              </div>
            </section>

            {/* Section 9 */}
            <section
              id="liability"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Limitation of Liability
              </h2>

              <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-xs sm:text-sm font-mono text-[#F4F4F0]/90 leading-relaxed uppercase max-w-[56ch]">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FIRSTISSUE.DEV, ITS FOUNDERS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, CODE CORRUPTION, OR OTHER INTANGIBLE LOSSES ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR INABILITY TO ACCESS THE SERVICE.
              </div>
            </section>

            {/* Section 10 */}
            <section
              id="indemnification"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                User Indemnification
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                You agree to defend, indemnify, and hold harmless FirstIssue.dev, its creators, operators, and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or legal fees arising out of or relating to your violation of these Terms or your misuse of the Service.
              </p>
            </section>

            {/* Section 11 */}
            <section
              id="termination"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Suspension &amp; Account Termination
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  We reserve the right, in our sole discretion, to suspend, limit, or terminate your account and bar access to the Service at any time, without prior notice, if you breach these Terms, engage in scraping abuse, or act in a manner detrimental to the platform or other developers.
                </p>
                <p>
                  You may terminate your account at any time by disconnecting your GitHub OAuth connection and requesting profile data removal via{" "}
                  <code className="text-[#DAFA9C] font-mono text-xs">support@firstissue.dev</code>.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section
              id="governing-law"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Governing Law &amp; Dispute Resolution
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  These Terms shall be governed by and construed in accordance with the substantive laws of applicable international commerce, without giving effect to any conflict of law principles.
                </p>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to these Terms shall first be resolved through good-faith informal negotiations between the parties before initiating formal legal proceedings.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section
              id="modifications"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Modifications to Service &amp; Terms
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                We reserve the right to modify or replace these Terms at our discretion. Material changes will be indicated by updating the &quot;Effective Date&quot; at the top of this document. Continued use of FirstIssue.dev following notice of changes constitutes your acceptance of the revised Terms.
              </p>
            </section>

            {/* Section 14 */}
            <section
              id="contact"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Contact &amp; Legal Notices
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[56ch] text-pretty">
                <p className="max-w-[54ch]">
                  For questions, legal inquiries, copyright notices (DMCA), or clarifications regarding these Terms of Service, please contact our team directly:
                </p>

                <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F0] mb-1">
                      Legal Counsel &amp; Operations
                    </h3>
                    <p className="text-xs text-[#8C929C] font-mono">
                      Direct email contact:
                    </p>
                    <a
                      href="mailto:support@firstissue.dev"
                      className="text-xs font-mono font-bold text-[#DAFA9C] hover:underline flex items-center gap-1.5 mt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      support@firstissue.dev
                    </a>
                  </div>

                  <Link
                    to="/privacy"
                    className="px-4 py-2 rounded-[4px] bg-[#17181B] hover:border-[#3A3E48] text-[#F4F4F0] text-xs font-mono font-medium border border-[#2B2E36] transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Read Privacy Policy</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#DAFA9C]" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
