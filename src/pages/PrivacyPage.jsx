import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  FileText,
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
              <span className="text-zinc-200">Privacy Policy</span>
            </div>
          </div>

          {/* Quick Legal Document Switcher & Print Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-[#00ADB5]/15 text-[#00ADB5] font-semibold border border-[#00ADB5]/30">
                Privacy
              </span>
              <Link
                to="/terms"
                className="px-2.5 py-1 rounded text-zinc-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
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
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6">
            At FirstIssue.dev, we believe in open-source transparency, data minimization, and developer autonomy.
            This Privacy Policy clearly articulates what data we collect, how we use it, our strict GitHub OAuth boundaries, and how you retain total control of your information.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 border-t border-zinc-900 pt-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Effective Date: June 2026</span>
            </div>
            <span>•</span>
            <span>Version: 2.4</span>
            <span>•</span>
            <span>Est. Reading Time: ~6 minutes</span>
          </div>
        </div>

        {/* Executive Summary / "At A Glance" Key Commitments Cards */}
        <div className="mb-14 p-5 sm:p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 shadow-xl">
          <div className="mb-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Key Privacy Commitments (At a Glance)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Zero Data Selling</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                We do not sell, monetize, or broker your personal information or browsing patterns to advertisers or data brokers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Minimal OAuth Scopes</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                We only request read-only profile access (<code className="text-zinc-200">read:user</code>, <code className="text-zinc-200">user:email</code>). We never access your private repositories.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Public APIs Only</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Our issue aggregation and community tree credentials verify only publicly accessible GitHub pull requests and metadata.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
              <div className="text-[#00ADB5] mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Full User Control</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                You have the right to inspect, export, or delete your account, bookmarks, and planted contribution credentials at any time.
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
                <span className="text-[10px] font-mono text-zinc-500">12 Sections</span>
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
                <p>Have questions about your data?</p>
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
            <section id="introduction" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Introduction &amp; Data Controller
                </h2>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <p>
                  This Privacy Policy describes the policies and practices of <strong className="text-zinc-200">FirstIssue.dev</strong> ("we", "our", or "us"), operated at <code className="text-zinc-300 font-mono">https://firstissue.dev</code>, regarding the collection, storage, transfer, and protection of information about visitors and registered developers ("you", "user").
                </p>
                <p>
                  FirstIssue.dev operates an open-source discoverability platform designed to lower the barrier of entry into open-source software by indexing beginner-friendly issues (e.g., <em>good first issue</em>, <em>help wanted</em>) and showcasing developer milestone PRs.
                </p>
                <p>
                  For the purposes of the European Union General Data Protection Regulation (GDPR), UK GDPR, and relevant data protection laws, FirstIssue.dev acts as the <strong className="text-zinc-200">Data Controller</strong> for personal data collected directly through our website and services.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="information-we-collect" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Information We Collect
                </h2>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                We strictly limit the data we collect to what is strictly necessary to deliver, personalize, and secure FirstIssue.dev:
              </p>

              <div className="space-y-4">
                {/* 2.A */}
                <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00ADB5]" />
                    <span>A. Information You Provide Directly</span>
                  </h3>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-zinc-400 space-y-1.5 leading-relaxed">
                    <li><strong className="text-zinc-300">Account Registration Data:</strong> When you sign up using GitHub, we store your GitHub handle, public display name, avatar URL, and verified primary email address.</li>
                    <li><strong className="text-zinc-300">User Preferences:</strong> Your saved issue bookmarks, language filter selections, difficulty preferences, and community tree interactions.</li>
                    <li><strong className="text-zinc-300">Direct Inquiries &amp; Support:</strong> If you submit bug reports, feature suggestions, or email us, we collect the correspondence, attachments, and return address.</li>
                  </ul>
                </div>

                {/* 2.B */}
                <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#00ADB5]" />
                    <span>B. Automatically Collected Technical &amp; Log Data</span>
                  </h3>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-zinc-400 space-y-1.5 leading-relaxed">
                    <li><strong className="text-zinc-300">Device &amp; Browser Metadata:</strong> Browser type and version, operating system, preferred language, and screen dimensions to render responsive canvas layouts.</li>
                    <li><strong className="text-zinc-300">Log File Telemetry:</strong> Standard hosting server logs including internet protocol (IP) address, referring/exit URLs, request timestamps, and response status codes. These are analyzed in aggregate to monitor platform uptime and prevent automated bot abuse.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: GitHub OAuth */}
            <section id="github-oauth" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  GitHub OAuth &amp; Permission Boundaries
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80 mb-6">
                <div className="flex items-center gap-2 text-[#00ADB5] font-mono text-xs font-bold mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PRINCIPLE OF LEAST PRIVILEGE</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  FirstIssue.dev operates with the lowest possible OAuth scopes required for authentication. We never inspect, read, clone, or modify private source code.
                </p>
              </div>

              {/* Scopes Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800 mb-6">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">OAuth Scope</th>
                      <th className="p-3">Permission Level</th>
                      <th className="p-3">Exact Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    <tr>
                      <td className="p-3 font-bold text-[#00ADB5]">read:user</td>
                      <td className="p-3 text-zinc-300">Read-Only</td>
                      <td className="p-3 font-sans text-zinc-400">Displaying your public username, avatar, and profile handle across FirstIssue.dev.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#00ADB5]">user:email</td>
                      <td className="p-3 text-zinc-300">Read-Only</td>
                      <td className="p-3 font-sans text-zinc-400">Verifying your primary GitHub email for account authentication and transactional alerts.</td>
                    </tr>
                    <tr className="bg-zinc-900/40">
                      <td className="p-3 font-bold text-zinc-400">repo / write</td>
                      <td className="p-3 text-zinc-400 font-bold">NEVER REQUESTED</td>
                      <td className="p-3 font-sans text-zinc-500">Zero access to private repositories, code, organization settings, or commit signing keys.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                You retain complete autonomy over OAuth tokens and can revoke FirstIssue.dev access at any time through your{" "}
                <a
                  href="https://github.com/settings/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ADB5] hover:underline inline-flex items-center gap-1 font-mono"
                >
                  GitHub Authorized OAuth Apps
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </section>

            {/* Section 4: Legal Bases */}
            <section id="legal-basis" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Legal Bases for Processing (GDPR &amp; CCPA)
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>Under Article 6 of the General Data Protection Regulation (GDPR), we process your personal data under the following legitimate legal bases:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                    <h4 className="font-bold text-white text-xs mb-1">1. Performance of a Contract</h4>
                    <p className="text-zinc-400 text-xs">Providing our issue search, account management, saved bookmarks, and contribution credentials as requested by you.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                    <h4 className="font-bold text-white text-xs mb-1">2. Legitimate Interests</h4>
                    <p className="text-zinc-400 text-xs">Protecting against malicious traffic, bot scraping, and DDoS attempts, ensuring platform uptime, and improving user experience.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                    <h4 className="font-bold text-white text-xs mb-1">3. Explicit Consent</h4>
                    <p className="text-zinc-400 text-xs">When you opt-in to plant your PR on the live Contribution Tree or accept optional preferences.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                    <h4 className="font-bold text-white text-xs mb-1">4. Legal Compliance</h4>
                    <p className="text-zinc-400 text-xs">Adhering to mandatory legal obligations, lawful government or judicial requests, and fraud prevention regulations.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: How We Use Information */}
            <section id="how-we-use-information" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  How We Use Your Information
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>We process collected data solely for specific, legitimate, and transparent purposes:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00ADB5] shrink-0 mt-0.5" />
                    <span><strong>Platform Core Operations:</strong> Authenticating user sessions, syncing bookmarks across devices, and maintaining user preferences.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00ADB5] shrink-0 mt-0.5" />
                    <span><strong>Community Tree Verification:</strong> Verifying merged PRs via public GitHub endpoints to generate verifiable cryptographic contribution credentials.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00ADB5] shrink-0 mt-0.5" />
                    <span><strong>Communication:</strong> Replying to direct technical support requests, issue feedback, and critical account security updates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00ADB5] shrink-0 mt-0.5" />
                    <span><strong>Abuse Prevention &amp; Security:</strong> Detecting rate-limit violations, automated scrapers, and malicious intrusion attempts.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6: Subprocessors */}
            <section id="subprocessors" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Subprocessors &amp; Third Parties
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                We partner with select, enterprise-grade cloud providers to host, secure, and deliver FirstIssue.dev. Each vendor is bound by strict Data Processing Agreements (DPAs):
              </p>

              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Partner / Subprocessor</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Data Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    <tr>
                      <td className="p-3 font-bold text-white">Supabase, Inc.</td>
                      <td className="p-3 font-sans text-zinc-400">PostgreSQL Cloud Database, Auth &amp; Row-Level Security</td>
                      <td className="p-3">United States / Global</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Vercel Inc.</td>
                      <td className="p-3 font-sans text-zinc-400">Edge Network, Static Asset Hosting &amp; Serverless CDN</td>
                      <td className="p-3">Global Anycast CDN</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">GitHub, Inc.</td>
                      <td className="p-3 font-sans text-zinc-400">OAuth Provider &amp; Public REST/GraphQL Issue API</td>
                      <td className="p-3">United States</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Cloudinary Ltd.</td>
                      <td className="p-3 font-sans text-zinc-400">Optimized Media Streaming &amp; Video CDN</td>
                      <td className="p-3">United States / Global</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7: Cookies */}
            <section id="cookies-tracking" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Cookies &amp; Local Storage
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  FirstIssue.dev uses cookies and browser local storage strictly for core functionalities:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                    <h4 className="font-bold text-white text-xs mb-1">Strictly Necessary Cookies</h4>
                    <p className="text-zinc-400 text-xs">Used to remember your logged-in Supabase session and cryptographic verification tokens. These cannot be disabled as the site cannot function without them.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                    <h4 className="font-bold text-white text-xs mb-1">Preference Storage</h4>
                    <p className="text-zinc-400 text-xs">Client-side storage used to remember your filter selections (e.g. favorite programming languages, dark mode, dismissed banners).</p>
                  </div>
                </div>
                <p>
                  You can control or erase cookies via your web browser settings. Disabling essential session cookies will prevent login capabilities.
                </p>
              </div>
            </section>

            {/* Section 8: Retention */}
            <section id="data-retention" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  08
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Data Retention &amp; Deletion
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  We retain personal data only for as long as your account remains active or as needed to provide our services:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-1">
                  <li><strong className="text-zinc-300">Active Accounts:</strong> User profile data and bookmarks are maintained until you choose to delete your account.</li>
                  <li><strong className="text-zinc-300">Server Logs:</strong> Temporary diagnostic server logs are purged automatically after 30 days.</li>
                  <li><strong className="text-zinc-300">Account Deletion Workflow:</strong> You can request immediate, permanent deletion of your profile and data by emailing <code className="text-zinc-200">annifind010@gmail.com</code>. Upon receipt, all associated database records are irreversibly removed within 14 business days.</li>
                </ul>
              </div>
            </section>

            {/* Section 9: Data Rights */}
            <section id="data-rights" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  09
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Your Data Protection Rights (GDPR &amp; CCPA)
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                Regardless of your geographic location, FirstIssue.dev affords all developers comprehensive data protection rights:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="text-xs font-bold text-white mb-1">Right to Access</h4>
                  <p className="text-[11px] text-zinc-400">Request a full copy of all personal records and metadata we hold about you.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="text-xs font-bold text-white mb-1">Right to Erasure ("To Be Forgotten")</h4>
                  <p className="text-[11px] text-zinc-400">Request permanent deletion of your account and associated database entities.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="text-xs font-bold text-white mb-1">Right to Rectification</h4>
                  <p className="text-[11px] text-zinc-400">Request corrections to any inaccurate, outdated, or incomplete data.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0C10]/60 border border-zinc-800/80">
                  <h4 className="text-xs font-bold text-white mb-1">Right to Data Portability</h4>
                  <p className="text-[11px] text-zinc-400">Receive your data in a structured, machine-readable JSON format.</p>
                </div>
              </div>
            </section>

            {/* Section 10: Security */}
            <section id="security" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  10
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Security &amp; Encryption
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  We implement robust technical and organizational security controls designed to safeguard your data from unauthorized access, alteration, or disclosure:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-1">
                  <li><strong className="text-zinc-300">Encryption in Transit:</strong> 100% of website traffic and API communications are encrypted via modern Transport Layer Security (TLS 1.3).</li>
                  <li><strong className="text-zinc-300">Row-Level Security (RLS):</strong> Our database utilizes strict PostgreSQL Row-Level Security policies ensuring users can only read and modify their own records.</li>
                  <li><strong className="text-zinc-300">Cryptographic Integrity:</strong> Contribution Tree leaves are hashed and verified against public GitHub pull request commits to ensure cryptographic authenticity.</li>
                </ul>
              </div>
            </section>

            {/* Section 11: Children's Privacy */}
            <section id="childrens-privacy" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  11
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Children's Privacy (COPPA Compliance)
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                FirstIssue.dev does not knowingly solicit or collect personally identifiable information from children under the age of 13. If you believe that a minor under 13 has registered or provided personal data on our site, please notify us immediately at <code className="text-zinc-200 font-mono">annifind010@gmail.com</code>, and we will promptly purge such records.
              </p>
            </section>

            {/* Section 12: Updates & Contact */}
            <section id="updates-contact" className="scroll-mt-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/60 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-zinc-300">
                  12
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Policy Updates &amp; Contact Information
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                <p>
                  We may periodically revise this Privacy Policy to reflect platform enhancements, legal amendments, or changes in data protection standards. When updates occur, the "Effective Date" at the top of this document will be revised accordingly.
                </p>

                <div className="p-4 rounded-xl bg-[#0B0C10]/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Data Privacy Officer &amp; Support</h4>
                    <p className="text-xs text-zinc-400 font-mono">Direct email contact for all privacy inquiries:</p>
                    <a
                      href="mailto:annifind010@gmail.com"
                      className="text-xs font-mono font-bold text-[#00ADB5] hover:underline flex items-center gap-1.5 mt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      annifind010@gmail.com
                    </a>
                  </div>

                  <Link
                    to="/terms"
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono font-medium border border-zinc-800 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Read Terms of Service</span>
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

export default PrivacyPage;
