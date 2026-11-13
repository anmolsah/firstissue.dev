import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSupporter } from "../contexts/SupporterContext";
import { supabase } from "../lib/supabase";
import {
  Crown,
  Check,
  ArrowRight,
  Bot,
  Brain,
  ShieldCheck,
  ChevronDown,
  Github,
  Twitter,
  Mail,
  Loader2,
  Star,
  Code2,
  Lock,
  AlertCircle,
  CheckCircle,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import { FREE_DAILY_COPILOT_MESSAGES, FREE_MONTHLY_KITS } from "../lib/limits";

const SupportPage = () => {
  const { user } = useAuth();
  const { isSupporter, supporterData, loading: supporterLoading, refreshStatus } = useSupporter();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Handle return from successful payment
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && user && !isSupporter && !supporterLoading) {
      const waitForWebhookActivation = async () => {
        try {
          const maxAttempts = 8;
          const delayMs = 1000;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const { data: existing } = await supabase
              .from("supporters")
              .select("id, dodo_subscription_id")
              .eq("user_id", user.id)
              .eq("status", "active")
              .single();

            if (existing) {
              console.log(`Supporter record found on attempt ${attempt}`, existing);
              toast.success("Welcome, Supporter. Smart Match, unlimited Contribution Kits & Diff Review, unlimited FirstMate, and unlimited Proof of Work are unlocked.");
              refreshStatus();
              return;
            }

            if (attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, delayMs));
            }
          }

          console.warn("Webhook record not found after polling; awaiting webhook activation");
          toast.success(
            "Payment received. Activating Supporter benefits now — they will appear automatically.",
            { duration: 8000 }
          );
          refreshStatus();
        } catch (err) {
          console.error("Error in post-payment activation:", err);
        }
      };

      waitForWebhookActivation();
    }
  }, [searchParams, user, isSupporter, supporterLoading, refreshStatus]);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          returnUrl: window.location.origin + "/support?success=true",
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data?.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Smart Matching",
      description:
        "Analyzes your GitHub repositories and public activity to score and surface open-source issues matched to your actual stack.",
      accent: "#DAFA9C",
    },
    {
      icon: Wrench,
      title: "Unlimited Contribution Kits & Diff Review",
      description: `Core accounts include ${FREE_MONTHLY_KITS} Contribution Kit per month. Supporters generate unlimited repo setup kits and run pre-submit AI diff reviews before opening a PR.`,
      accent: "#F59E0B",
      badge: "INCLUDED",
    },
    {
      icon: ShieldCheck,
      title: "Unlimited Proof of Work",
      description:
        "Verify merged pull requests against GitHub APIs and generate unlimited SHA-256 attested cards on your public developer profile.",
      accent: "#34D399",
    },
    {
      icon: Bot,
      title: "Unlimited FirstMate Copilot",
      description: `Core accounts include ${FREE_DAILY_COPILOT_MESSAGES} FirstMate messages per day. Supporters ask unlimited questions on git workflows, failing tests, and PR reviews.`,
      accent: "#A8ADB6",
    },
  ];

  const faqs = [
    {
      q: "What benefits do I get as a Supporter?",
      a: `Full access to AI Smart Match, unlimited AI Contribution Kits and pre-submit PR diff reviews (Core accounts include ${FREE_MONTHLY_KITS} kit per month), unlimited FirstMate AI Copilot chat (Core accounts receive ${FREE_DAILY_COPILOT_MESSAGES} messages per day), and no 5-card limit on verified Proof of Work pull request attestations.`,
    },
    {
      q: "How does Proof of Work verify pull requests?",
      a: "When you verify a merged GitHub pull request, we fetch the PR diff stats and merge metadata directly via the GitHub API, score impact, and record a deterministic SHA-256 attestation digest in PostgreSQL alongside your exportable PNG and PDF dossier.",
    },
    {
      q: "What is included in the $0 Core tier?",
      a: `Core accounts can browse curated beginner-friendly issues, generate ${FREE_MONTHLY_KITS} AI Contribution Kit per month, bookmark and track PR statuses, verify up to 5 Proof of Work credentials, and send ${FREE_DAILY_COPILOT_MESSAGES} FirstMate messages per day (resetting at midnight UTC).`,
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. You can cancel in one click from your billing portal. Your Supporter access remains active until the end of the current monthly billing period.",
    },
    {
      q: "How are payments processed?",
      a: "Checkout and subscriptions are processed securely through Dodo Payments, supporting major debit and credit cards worldwide. Payment credentials are never stored on FirstIssue.dev servers.",
    },
  ];

  const comparisonRows = [
    { feature: "Curated issue dispatch queue", free: "Yes", supporter: "Yes" },
    { feature: "PR status & contribution tracker", free: "Yes", supporter: "Yes" },
    { feature: "AI Contribution Kits", free: `${FREE_MONTHLY_KITS}/month`, supporter: "Unlimited" },
    { feature: "Pre-submit PR diff review", free: "No", supporter: "Yes" },
    { feature: "Verified Proof of Work limit", free: "Up to 5", supporter: "Unlimited" },
    { feature: "FirstMate AI Copilot allowance", free: `${FREE_DAILY_COPILOT_MESSAGES}/day`, supporter: "Unlimited" },
    { feature: "AI Smart Matching by repo history", free: "No", supporter: "Yes" },
    { feature: "Tech stack & language fit scoring", free: "No", supporter: "Yes" },
    { feature: "Supporter badge on public profile", free: "No", supporter: "Yes" },
    { feature: "Direct maintainer priority support", free: "No", supporter: "Yes" },
  ];

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] pt-[96px] pb-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-14">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F4F4F0] mb-5 leading-[1.08] text-balance">
            Ship your first PR — and verify every merge after
          </h1>

          <p className="text-sm sm:text-base text-[#A8ADB6] mb-8 max-w-[62ch] mx-auto leading-relaxed text-pretty">
            Most contributors stall between picking an issue and opening a clean pull request. Supporter pairs repository-matched AI discovery with unlimited Contribution Kits, pre-submit PR diff reviews, unlimited FirstMate help, and unlimited SHA-256 Proof of Work credentials.
          </p>

          {isSupporter ? (
            <div className="inline-flex flex-col items-center gap-4 bg-[#141518] border border-[#2B2E36] rounded-[4px] p-6 max-w-md w-full">
              {supporterData?.status === "cancelled" ? (
                <>
                  <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-semibold font-mono uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Subscription Ending</span>
                  </div>
                  {supporterData?.expires_at && (
                    <p className="text-xs text-[#A8ADB6] font-mono tabular-nums">
                      Access remains active until{" "}
                      {new Date(supporterData.expires_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-[#34D399] text-xs font-semibold font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Active Supporter Subscription</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Open Smart Match Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer min-h-[44px]"
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4" />
                )}
                <span className="tabular-nums">
                  {checkoutLoading ? "Preparing checkout..." : "Become a Supporter — $9/mo"}
                </span>
                {!checkoutLoading && <ArrowRight className="w-4 h-4" />}
              </button>
              <p className="text-xs text-[#8C929C] font-mono">
                $0 Core plan remains free · Cancel anytime in 1 click
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#22242A]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#F4F4F0] text-balance">
                Built for shipping production PRs
              </h2>
            </div>
            <p className="text-sm text-[#A8ADB6] text-pretty">
              Four capabilities that close the gap between issue discovery and proof of merge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] p-5 transition-colors flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5" style={{ color: feature.accent }} />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[#F4F4F0] font-semibold text-sm">{feature.title}</h3>
                    {feature.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-[4px] border border-[#34D399]/30 bg-[#34D399]/10 text-[#34D399] font-mono font-medium uppercase tracking-wider">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#A8ADB6] leading-relaxed text-pretty">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof of Work Spotlight */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#22242A]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F4F4F0] leading-tight text-balance">
                Replace resume bullets with{" "}
                <span className="text-[#DAFA9C]">verified merge records</span>
              </h2>

              <p className="text-sm sm:text-base text-[#A8ADB6] max-w-[60ch] leading-relaxed text-pretty">
                Verify any merged GitHub pull request to generate a deterministic SHA-256 attestation record and exportable engineering dossier backed by GitHub PR metadata and PostgreSQL verification timestamps.
              </p>

              <ul className="space-y-2.5">
                {[
                  "Verify merged GitHub PRs with live diff stats and repository stars",
                  "SHA-256 attestation digest and impact breakdown per pull request",
                  "Shareable public profile and downloadable PDF résumé",
                  "Core tier: up to 5 PRs · Supporter tier: unlimited PRs",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#F4F4F0]">
                    <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span className="text-[#A8ADB6]">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clean Specimen Card mirroring MetalCard */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="w-full max-w-[276px] rounded-[4px] overflow-hidden border border-[#F59E0B]/45 bg-[#17181B]">
                <div className="h-[2px] w-full bg-[#F59E0B]" aria-hidden="true" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                      <span className="text-xs font-mono font-medium text-[#F4F4F0] truncate">
                        anmolsah/firstissue.dev
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm leading-snug text-[#F4F4F0] mb-3">
                      <span className="text-[#8C929C] font-mono mr-1.5 tabular-nums">#128</span>
                      feat: implement OAuth session validation and diff scoring
                    </h3>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#8C929C] flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#F59E0B]" fill="currentColor" />
                        Impact
                      </span>
                      <span className="text-xs font-semibold font-mono tabular-nums text-[#F59E0B]">
                        98<span className="text-[#8C929C]">/100</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-[2px] bg-[#0B0C0E] overflow-hidden">
                      <div className="h-full bg-[#F59E0B]" style={{ width: "98%" }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#22242A] bg-[#0B0C0E] -mx-5 -mb-5 px-5 py-3 flex flex-col gap-0.5">
                    <span className="text-xs font-mono text-[#8C929C] uppercase tracking-wider">
                      Attestation SHA-256
                    </span>
                    <span className="text-xs font-mono text-[#F4F4F0] flex items-center gap-1.5 tabular-nums">
                      <Github className="w-3.5 h-3.5 text-[#8C929C]" />
                      sha256:8f2a99...c4d1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Comparison Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-[#F4F4F0] text-center mb-6">
            Core ($0) vs Supporter ($9/mo)
          </h2>

          <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#22242A] bg-[#0B0C0E]">
                  <th className="p-4 text-xs font-mono uppercase tracking-wider text-[#8C929C]">
                    Capability
                  </th>
                  <th className="p-4 text-xs font-mono uppercase tracking-wider text-[#8C929C] text-center w-32 tabular-nums">
                    Core ($0)
                  </th>
                  <th className="p-4 text-xs font-mono uppercase tracking-wider text-[#DAFA9C] text-center bg-[#17181B] w-40 tabular-nums">
                    Supporter ($9/mo)
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#22242A] last:border-b-0">
                    <td className="p-3.5 text-sm text-[#F4F4F0] font-medium">{row.feature}</td>
                    <td className="p-3.5 text-xs text-center">
                      {row.free === "Yes" ? (
                        <Check className="w-4 h-4 text-[#A8ADB6] mx-auto" aria-label="Included" />
                      ) : row.free === "No" ? (
                        <Lock className="w-3.5 h-3.5 text-[#8C929C] mx-auto" aria-label="Not included" />
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-[4px] border border-[#2B2E36] text-[#A8ADB6] font-mono tabular-nums inline-block bg-[#0B0C0E]">
                          {row.free}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-center bg-[#17181B]">
                      {row.supporter === "Yes" ? (
                        <Check className="w-4 h-4 text-[#DAFA9C] mx-auto" aria-label="Included" />
                      ) : row.supporter === "Unlimited" ? (
                        <span className="text-xs px-2 py-0.5 rounded-[4px] border border-[#DAFA9C]/40 text-[#DAFA9C] font-semibold font-mono inline-block bg-[#0B0C0E]">
                          {row.supporter}
                        </span>
                      ) : (
                        <span className="text-[#F4F4F0] font-semibold font-mono text-xs tabular-nums">
                          {row.supporter}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-[#F4F4F0] text-center mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              const panelId = `support-faq-panel-${i}`;
              return (
                <div
                  key={i}
                  className="bg-[#141518] border border-[#2B2E36] rounded-[4px] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-[#17181B] transition-colors min-h-[44px]"
                  >
                    <span className="text-sm font-medium text-[#F4F4F0] pr-4">{faq.q}</span>
                    <span
                      className={`p-1 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] text-[#A8ADB6] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div id={panelId} className="px-4 pb-4 pt-3 border-t border-[#22242A]">
                      <p className="text-sm text-[#A8ADB6] leading-relaxed max-w-[52ch] text-pretty">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Non-monetary community support */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-[#22242A]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight text-[#F4F4F0] mb-1 text-balance">
              Other ways to help
            </h2>
            <p className="text-sm text-[#A8ADB6]">
              Support the open-source community without spending a cent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://github.com/anmolsah/firstissue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 rounded-[4px] transition-colors flex flex-col text-left"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Github className="w-4 h-4 text-[#F4F4F0] shrink-0" />
                <h3 className="text-sm font-semibold text-[#F4F4F0]">Star on GitHub</h3>
              </div>
              <p className="text-xs text-[#8C929C] font-mono">Help maintainers discover us</p>
            </a>

            <a
              href="https://twitter.com/share?text=Check%20out%20FirstIssue.dev%20-%20a%20great%20platform%20for%20finding%20beginner-friendly%20open%20source%20issues!"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 rounded-[4px] transition-colors flex flex-col text-left"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Twitter className="w-4 h-4 text-[#A8ADB6] shrink-0" />
                <h3 className="text-sm font-semibold text-[#F4F4F0]">Share on X</h3>
              </div>
              <p className="text-xs text-[#8C929C] font-mono">Share with student devs</p>
            </a>

            <a
              href="mailto:annifind010@gmail.com?subject=Feedback"
              className="p-5 bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 rounded-[4px] transition-colors flex flex-col text-left"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Mail className="w-4 h-4 text-[#34D399] shrink-0" />
                <h3 className="text-sm font-semibold text-[#F4F4F0]">Send Feedback</h3>
              </div>
              <p className="text-xs text-[#8C929C] font-mono">Report bugs or request repos</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SupportPage;
