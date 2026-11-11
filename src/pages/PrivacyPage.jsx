import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ExternalLink,
  Clock,
  Printer,
  Mail,
  Layers,
  Globe,
  Server,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import Footer from "../components/Footer";
import BrandMark from "../components/BrandMark";

const TOC_SECTIONS = [
  { id: "introduction", title: "1. Introduction & Controller" },
  { id: "information-we-collect", title: "2. Information We Collect" },
  { id: "github-oauth", title: "3. GitHub OAuth & Permissions" },
  { id: "legal-basis", title: "4. Legal Bases for Processing" },
  { id: "how-we-use-information", title: "5. How We Use Information" },
  { id: "subprocessors", title: "6. Subprocessors & Third Parties" },
  { id: "cookies-tracking", title: "7. Cookies & Local Storage" },
  { id: "data-retention", title: "8. Retention & Deletion" },
  { id: "data-rights", title: "9. Your Data Protection Rights" },
  { id: "security", title: "10. Security & Encryption" },
  { id: "childrens-privacy", title: "11. Children's Privacy" },
  { id: "updates-contact", title: "12. Policy Updates & Contact" },
];

const PrivacyPage = () => {
  const [activeSection, setActiveSection] = useState("introduction");

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
              <span className="text-[#F4F4F0]">Privacy Policy</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-[#141518] border border-[#2B2E36] rounded-[4px] p-0.5 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-[2px] bg-[#DAFA9C]/15 text-[#DAFA9C] font-semibold border border-[#DAFA9C]/35">
                Privacy
              </span>
              <Link
                to="/terms"
                className="px-2.5 py-1 rounded-[2px] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors"
              >
                Terms
              </Link>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print privacy policy"
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
            Privacy Policy
          </h1>

          <p className="text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] mb-6 text-pretty">
            At FirstIssue.dev, we believe in open-source transparency, data minimization, and developer autonomy.
            This Privacy Policy clearly articulates what data we collect, how we use it, our strict GitHub OAuth boundaries, and how you retain total control of your information.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8C929C] border-t border-[#22242A] pt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#DAFA9C]" />
              <span>Effective Date: June 2026</span>
            </div>
            <span>·</span>
            <span>Version: 2.4</span>
            <span>·</span>
            <span>Est. Reading Time: ~6 minutes</span>
          </div>
        </div>

        {/* Executive Summary */}
        <section aria-label="Privacy commitments summary" className="mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C929C] font-mono mb-4">
            Key Privacy Commitments (At a Glance)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">Zero Data Selling</h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                We do not sell, monetize, or broker your personal information or browsing patterns to advertisers or data brokers.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">Minimal OAuth Scopes</h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                We only request read-only profile access (<code className="text-[#F4F4F0]">read:user</code>,{" "}
                <code className="text-[#F4F4F0]">user:email</code>). We never access your private repositories.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">Public APIs Only</h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                Our issue aggregation and community tree credentials verify only publicly accessible GitHub pull requests and metadata.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
              <div className="flex items-center gap-2 mb-1.5">
                <UserCheck className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                <h3 className="text-xs font-bold text-[#F4F4F0]">Full User Control</h3>
              </div>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                You have the right to inspect, export, or delete your account, bookmarks, and contribution records at any time.
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
                <span className="text-xs font-mono text-[#8C929C]">12 Sections</span>
              </div>

              <nav aria-label="Privacy policy sections" className="space-y-1 text-xs font-mono">
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
                <p>Have questions about your data?</p>
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
              id="introduction"
              className="scroll-mt-24 pt-10 first:pt-0 border-t border-[#22242A] first:border-t-0"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Introduction &amp; Data Controller
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  This Privacy Policy describes the policies and practices of{" "}
                  <strong className="text-[#F4F4F0]">FirstIssue.dev</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operated at{" "}
                  <code className="text-[#F4F4F0] font-mono text-sm">https://firstissue.dev</code>, regarding the collection, storage, transfer, and protection of information about visitors and registered developers (&quot;you&quot;, &quot;user&quot;).
                </p>
                <p>
                  FirstIssue.dev operates an open-source discoverability platform designed to lower the barrier of entry into open-source software by indexing beginner-friendly issues (e.g., <em>good first issue</em>, <em>help wanted</em>) and showcasing developer milestone PRs.
                </p>
                <p>
                  For the purposes of the European Union General Data Protection Regulation (GDPR), UK GDPR, and relevant data protection laws, FirstIssue.dev acts as the{" "}
                  <strong className="text-[#F4F4F0]">Data Controller</strong> for personal data collected directly through our website and services.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="information-we-collect"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Information We Collect
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] mb-6 text-pretty">
                We strictly limit the data we collect to what is strictly necessary to deliver, personalize, and secure FirstIssue.dev:
              </p>

              <div className="space-y-4 max-w-[56ch]">
                <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="text-sm font-bold text-[#F4F4F0] mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                    <span>A. Information You Provide Directly</span>
                  </h3>
                  <ul className="list-disc list-inside text-sm text-[#A8ADB6] space-y-1.5 leading-relaxed max-w-[52ch] text-pretty">
                    <li>
                      <strong className="text-[#F4F4F0]">Account Registration Data:</strong> When you sign up using GitHub, we store your GitHub handle, public display name, avatar URL, and verified primary email address.
                    </li>
                    <li>
                      <strong className="text-[#F4F4F0]">User Preferences:</strong> Your saved issue bookmarks, language filter selections, difficulty preferences, and community tree interactions.
                    </li>
                    <li>
                      <strong className="text-[#F4F4F0]">Direct Inquiries &amp; Support:</strong> If you submit bug reports, feature suggestions, or email us, we collect the correspondence, attachments, and return address.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="text-sm font-bold text-[#F4F4F0] mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                    <span>B. Automatically Collected Technical &amp; Log Data</span>
                  </h3>
                  <ul className="list-disc list-inside text-sm text-[#A8ADB6] space-y-1.5 leading-relaxed max-w-[52ch] text-pretty">
                    <li>
                      <strong className="text-[#F4F4F0]">Device &amp; Browser Metadata:</strong> Browser type and version, operating system, preferred language, and screen dimensions to render responsive layouts.
                    </li>
                    <li>
                      <strong className="text-[#F4F4F0]">Log File Telemetry:</strong> Standard hosting server logs including internet protocol (IP) address, referring/exit URLs, request timestamps, and response status codes, analyzed in aggregate to monitor uptime and prevent automated abuse.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="github-oauth"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                GitHub OAuth &amp; Permission Boundaries
              </h2>

              <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] mb-6 max-w-[56ch]">
                <div className="flex items-center gap-2 text-[#DAFA9C] font-mono text-xs font-bold mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PRINCIPLE OF LEAST PRIVILEGE</span>
                </div>
                <p className="text-sm text-[#F4F4F0]/90 leading-relaxed text-pretty">
                  FirstIssue.dev operates with the lowest possible OAuth scopes required for authentication. We never inspect, read, clone, or modify private source code.
                </p>
              </div>

              <div className="overflow-x-auto rounded-[4px] border border-[#2B2E36] bg-[#141518] mb-6 max-w-[56ch]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0B0C0E] text-[#8C929C] uppercase tracking-wider text-xs border-b border-[#22242A]">
                    <tr>
                      <th className="p-3">OAuth Scope</th>
                      <th className="p-3">Permission Level</th>
                      <th className="p-3">Exact Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22242A] text-[#A8ADB6]">
                    <tr>
                      <td className="p-3 font-bold text-[#DAFA9C]">read:user</td>
                      <td className="p-3 text-[#F4F4F0]">Read-Only</td>
                      <td className="p-3 font-sans">
                        Displaying your public username, avatar, and profile handle across FirstIssue.dev.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#DAFA9C]">user:email</td>
                      <td className="p-3 text-[#F4F4F0]">Read-Only</td>
                      <td className="p-3 font-sans">
                        Verifying your primary GitHub email for account authentication and transactional alerts.
                      </td>
                    </tr>
                    <tr className="bg-[#0B0C0E]/60">
                      <td className="p-3 font-bold text-[#A8ADB6]">repo / write</td>
                      <td className="p-3 text-[#F87171] font-bold">NEVER REQUESTED</td>
                      <td className="p-3 font-sans text-[#8C929C]">
                        Zero access to private repositories, code, organization settings, or commit signing keys.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                You retain complete autonomy over OAuth tokens and can revoke FirstIssue.dev access at any time through your{" "}
                <a
                  href="https://github.com/settings/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#DAFA9C] hover:underline inline-flex items-center gap-1 font-mono text-xs"
                >
                  GitHub Authorized OAuth Apps
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            </section>

            {/* Section 4 */}
            <section
              id="legal-basis"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Legal Bases for Processing (GDPR &amp; CCPA)
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[56ch] text-pretty">
                <p className="max-w-[54ch]">
                  Under Article 6 of the General Data Protection Regulation (GDPR), we process your personal data under the following legitimate legal bases:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                    <h3 className="font-bold text-[#F4F4F0] text-xs mb-1">
                      1. Performance of a Contract
                    </h3>
                    <p className="text-[#A8ADB6] text-xs leading-relaxed">
                      Providing issue search, account management, saved bookmarks, and contribution records requested by you.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                    <h3 className="font-bold text-[#F4F4F0] text-xs mb-1">
                      2. Legitimate Interests
                    </h3>
                    <p className="text-[#A8ADB6] text-xs leading-relaxed">
                      Protecting against malicious traffic, bot scraping, and DDoS attempts while ensuring platform uptime.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                    <h3 className="font-bold text-[#F4F4F0] text-xs mb-1">
                      3. Explicit Consent
                    </h3>
                    <p className="text-[#A8ADB6] text-xs leading-relaxed">
                      When you opt in to plant your PR on the live Contribution Tree or accept optional preferences.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                    <h3 className="font-bold text-[#F4F4F0] text-xs mb-1">
                      4. Legal Compliance
                    </h3>
                    <p className="text-[#A8ADB6] text-xs leading-relaxed">
                      Adhering to mandatory legal obligations, lawful judicial requests, and fraud prevention rules.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section
              id="how-we-use-information"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                How We Use Your Information
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  We process collected data solely for specific, legitimate, and transparent purposes:
                </p>
                <ul className="space-y-2.5 text-sm sm:text-[15px]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#DAFA9C] shrink-0 mt-1" />
                    <span>
                      <strong className="text-[#F4F4F0]">Platform Core Operations:</strong> Authenticating user sessions, syncing bookmarks across devices, and maintaining user preferences.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#DAFA9C] shrink-0 mt-1" />
                    <span>
                      <strong className="text-[#F4F4F0]">Community Tree Verification:</strong> Verifying merged PRs via public GitHub endpoints to generate signed SHA-256 contribution records.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#DAFA9C] shrink-0 mt-1" />
                    <span>
                      <strong className="text-[#F4F4F0]">Communication:</strong> Replying to direct technical support requests, issue feedback, and critical account security updates.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#DAFA9C] shrink-0 mt-1" />
                    <span>
                      <strong className="text-[#F4F4F0]">Abuse Prevention &amp; Security:</strong> Detecting rate-limit violations, automated scrapers, and malicious intrusion attempts.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section
              id="subprocessors"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Subprocessors &amp; Third Parties
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] mb-4 text-pretty">
                We partner with select, enterprise-grade cloud providers to host, secure, and deliver FirstIssue.dev. Each vendor is bound by strict Data Processing Agreements (DPAs):
              </p>

              <div className="overflow-x-auto rounded-[4px] border border-[#2B2E36] bg-[#141518] max-w-[56ch]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0B0C0E] text-[#8C929C] uppercase tracking-wider text-xs border-b border-[#22242A]">
                    <tr>
                      <th className="p-3">Partner / Subprocessor</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Data Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22242A] text-[#A8ADB6]">
                    <tr>
                      <td className="p-3 font-bold text-[#F4F4F0]">Supabase, Inc.</td>
                      <td className="p-3 font-sans">
                        PostgreSQL Cloud Database, Auth &amp; Row-Level Security
                      </td>
                      <td className="p-3">United States / Global</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#F4F4F0]">Vercel Inc.</td>
                      <td className="p-3 font-sans">
                        Edge Network, Static Asset Hosting &amp; Serverless CDN
                      </td>
                      <td className="p-3">Global Anycast CDN</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#F4F4F0]">GitHub, Inc.</td>
                      <td className="p-3 font-sans">
                        OAuth Provider &amp; Public REST/GraphQL Issue API
                      </td>
                      <td className="p-3">United States</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#F4F4F0]">Cloudinary Ltd.</td>
                      <td className="p-3 font-sans">
                        Optimized Media Streaming &amp; Video CDN
                      </td>
                      <td className="p-3">United States / Global</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7 */}
            <section
              id="cookies-tracking"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Cookies &amp; Local Storage
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[56ch] text-pretty">
                <p className="max-w-[54ch]">
                  FirstIssue.dev uses cookies and browser local storage strictly for core functionalities:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                    <h3 className="font-bold text-[#F4F4F0] text-xs mb-1">
                      Strictly Necessary Cookies
                    </h3>
                    <p className="text-[#A8ADB6] text-xs leading-relaxed">
                      Used to maintain your authenticated Supabase session and verification tokens. These are required for sign-in functionality.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                    <h3 className="font-bold text-[#F4F4F0] text-xs mb-1">
                      Preference Storage
                    </h3>
                    <p className="text-[#A8ADB6] text-xs leading-relaxed">
                      Client-side storage used to remember your filter selections, language tags, and dismissed interface banners.
                    </p>
                  </div>
                </div>
                <p className="max-w-[54ch]">
                  You can control or erase cookies via your web browser settings. Disabling essential session cookies will prevent login capabilities.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section
              id="data-retention"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Data Retention &amp; Deletion
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  We retain personal data only for as long as your account remains active or as needed to provide our services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-[15px] ml-1">
                  <li>
                    <strong className="text-[#F4F4F0]">Active Accounts:</strong> User profile data and bookmarks are maintained until you choose to delete your account.
                  </li>
                  <li>
                    <strong className="text-[#F4F4F0]">Server Logs:</strong> Temporary diagnostic server logs are purged automatically after 30 days.
                  </li>
                  <li>
                    <strong className="text-[#F4F4F0]">Account Deletion Workflow:</strong> You can request immediate, permanent deletion of your profile and data by emailing{" "}
                    <code className="text-[#DAFA9C] font-mono text-xs">support@firstissue.dev</code>. Associated database records are permanently removed within 14 business days.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section
              id="data-rights"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Your Data Protection Rights (GDPR &amp; CCPA)
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] mb-4 text-pretty">
                Regardless of your geographic location, FirstIssue.dev affords all developers comprehensive data protection rights:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[56ch]">
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="text-xs font-bold text-[#F4F4F0] mb-1">Right to Access</h3>
                  <p className="text-xs text-[#A8ADB6] leading-relaxed">
                    Request a full copy of all personal records and metadata we hold about you.
                  </p>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="text-xs font-bold text-[#F4F4F0] mb-1">
                    Right to Erasure (&quot;To Be Forgotten&quot;)
                  </h3>
                  <p className="text-xs text-[#A8ADB6] leading-relaxed">
                    Request permanent deletion of your account and associated database entities.
                  </p>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="text-xs font-bold text-[#F4F4F0] mb-1">Right to Rectification</h3>
                  <p className="text-xs text-[#A8ADB6] leading-relaxed">
                    Request corrections to any inaccurate, outdated, or incomplete data.
                  </p>
                </div>
                <div className="p-3.5 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                  <h3 className="text-xs font-bold text-[#F4F4F0] mb-1">
                    Right to Data Portability
                  </h3>
                  <p className="text-xs text-[#A8ADB6] leading-relaxed">
                    Receive your data in a structured, machine-readable JSON format.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section
              id="security"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Security &amp; Encryption
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                <p>
                  We implement robust technical and organizational security controls designed to safeguard your data from unauthorized access, alteration, or disclosure:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-[15px] ml-1">
                  <li>
                    <strong className="text-[#F4F4F0]">Encryption in Transit:</strong> 100% of website traffic and API communications are encrypted via modern Transport Layer Security (TLS 1.3).
                  </li>
                  <li>
                    <strong className="text-[#F4F4F0]">Row-Level Security (RLS):</strong> Our database utilizes strict PostgreSQL Row-Level Security policies ensuring users can only read and modify their own records.
                  </li>
                  <li>
                    <strong className="text-[#F4F4F0]">Cryptographic Integrity:</strong> Proof of Work records and Contribution Tree entries are hashed via SHA-256 and verified against public GitHub pull request metadata.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 11 */}
            <section
              id="childrens-privacy"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Children&apos;s Privacy (COPPA Compliance)
              </h2>

              <p className="text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[54ch] text-pretty">
                FirstIssue.dev does not knowingly solicit or collect personally identifiable information from children under the age of 13. If you believe that a minor under 13 has registered or provided personal data on our site, please notify us immediately at{" "}
                <code className="text-[#DAFA9C] font-mono text-xs">support@firstissue.dev</code>, and we will promptly purge such records.
              </p>
            </section>

            {/* Section 12 */}
            <section
              id="updates-contact"
              className="scroll-mt-24 pt-10 border-t border-[#22242A]"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight mb-4 text-balance">
                Policy Updates &amp; Contact Information
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#A8ADB6] leading-[1.7] max-w-[56ch] text-pretty">
                <p className="max-w-[54ch]">
                  We may periodically revise this Privacy Policy to reflect platform enhancements, legal amendments, or changes in data protection standards. When updates occur, the &quot;Effective Date&quot; at the top of this document will be revised accordingly.
                </p>

                <div className="p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F0] mb-1">
                      Data Privacy Officer &amp; Support
                    </h3>
                    <p className="text-xs text-[#8C929C] font-mono">
                      Direct email contact for all privacy inquiries:
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
                    to="/terms"
                    className="px-4 py-2 rounded-[4px] bg-[#17181B] hover:border-[#3A3E48] text-[#F4F4F0] text-xs font-mono font-medium border border-[#2B2E36] transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Read Terms of Service</span>
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

export default PrivacyPage;
