import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSupporter } from "../contexts/SupporterContext";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Crown,
  Check,
  ArrowRight,
  Zap,
  Target,
  Brain,
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Github,
  Twitter,
  Mail,
  Command,
  Loader2,
  Star,
  Users,
  Code2,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const SupportPage = () => {
  const { user } = useAuth();
  const { isSupporter, loading: supporterLoading, refreshStatus } = useSupporter();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setIsVisible(true);

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle return from successful payment
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && user && !isSupporter && !supporterLoading) {
      const waitForWebhookActivation = async () => {
        try {
          // Poll for the webhook-created supporter record.
          // The webhook should fire within a few seconds and create a full record
          // with dodo_subscription_id and dodo_customer_id.
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
              toast.success("🎉 Welcome, Supporter! Smart Match and Unlimited Proof of Work are now unlocked.");
              refreshStatus();
              return;
            }

            // Wait before next attempt
            if (attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, delayMs));
            }
          }

          // Fallback: if the webhook hasn't arrived after polling,
          // create a minimal record so the user gets access immediately.
          // The webhook will later fill in dodo_subscription_id and dodo_customer_id
          // via upsert on the user_id conflict.
          console.warn("Webhook record not found after polling, creating fallback supporter record");
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          const { error } = await supabase.from("supporters").upsert(
            {
              user_id: user.id,
              email: user.email,
              plan: "supporter",
              status: "active",
              amount_cents: 900,
              currency: "USD",
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          if (error) {
            console.error("Error activating supporter (fallback):", error);
          } else {
            toast.success("🎉 Welcome, Supporter! Smart Match and Unlimited Proof of Work are now unlocked.");
            refreshStatus();
          }
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          returnUrl: window.location.origin + "/support?success=true",
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
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
      description: "AI parses your GitHub profile and public contributions to match you with open source issues tailored to your exact skillset.",
      color: "from-blue-500/20 to-indigo-500/5",
      accent: "text-blue-400",
    },
    {
      icon: ShieldCheck,
      title: "Unlimited Proof of Work",
      description: "Verify and mint unlimited Pull Requests as cryptographically secured credentials on your public developer profile.",
      color: "from-emerald-500/20 to-teal-500/5",
      accent: "text-emerald-400",
      badge: "NEW",
    },
    {
      icon: Target,
      title: "Smart Difficulty Match",
      description: "Skip mismatched issues. Our scoring system accurately rates complexity against your level of expertise.",
      color: "from-purple-500/20 to-pink-500/5",
      accent: "text-purple-400",
    },
    {
      icon: Zap,
      title: "Priority Access",
      description: "Access new features first and get priority feedback from the engineering team.",
      color: "from-amber-500/20 to-orange-500/5",
      accent: "text-amber-400",
    },
  ];

  const faqs = [
    {
      q: "What benefits do I get as a Supporter?",
      a: "You get access to our AI-powered Smart Match system on the Explore page, and you lift the 5-mint limit on Proof of Work credentials, allowing you to build an unlimited cryptographic portfolio of your contributions.",
    },
    {
      q: "What is Proof of Work?",
      a: "Proof of Work lets you verify merged GitHub pull requests. We cryptographically sign the details and display a premium verification card on your public developer profile, proving you wrote and merged that code.",
    },
    {
      q: "Is there a limit on the Free tier?",
      a: "Yes. Free accounts can browse issues, bookmark them, and mint up to 5 Proof of Work credentials. Becoming a supporter removes this limit entirely, allowing unlimited verifications.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Absolutely. You can cancel with a single click. Your premium features will remain active until the end of your current monthly billing period.",
    },
    {
      q: "How are payments handled?",
      a: "All payments are handled securely using Dodo Payments. We support major credit/debit cards globally, and your details are never stored on our servers.",
    },
  ];

  const comparisonRows = [
    { feature: "Browse beginner issues", free: "Yes", supporter: "Yes" },
    { feature: "Bookmarks & Status Tracking", free: "Yes", supporter: "Yes" },
    { feature: "Verified Proof of Work limit", free: "Max 5", supporter: "Unlimited" },
    { feature: "AI Smart Matching", free: "No", supporter: "Yes" },
    { feature: "Tech stack & language fit", free: "No", supporter: "Yes" },
    { feature: "Premium Profile badge", free: "No", supporter: "Yes" },
    { feature: "Direct developer support", free: "No", supporter: "Yes" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F3F4F6] relative overflow-x-hidden font-sans selection:bg-zinc-800 selection:text-white pt-16">
      {/* Background Grid & Soothing Torchlight Mouse-Tracking Animation */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0B0C10]">
        {/* Soothing moving torchlight glow */}
        {isVisible && (
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle 320px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.035), transparent 80%)`,
            }}
          />
        )}
        {/* Torch illuminated grid */}
        {isVisible && (
          <div 
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
            }}
          />
        )}
      </div>

      {/* Responsive Global Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-zinc-800 text-zinc-400 text-[10px] font-mono bg-zinc-950 uppercase tracking-wider mb-6">
            <Crown className="w-3 h-3 text-zinc-450" />
            <span>Empower Open Source</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Level Up Your <br className="hidden sm:inline" />
            <span className="text-white">
              Contribution Journey
            </span>
          </h1>

          <p className="text-sm text-zinc-450 mb-8 max-w-xl mx-auto leading-relaxed">
            Support the platform and unlock AI Smart Matching along with unlimited verified Proof of Work credentials on your developer profile.
          </p>

          {isSupporter ? (
            <div className="inline-flex flex-col items-center gap-3 bg-zinc-950/20 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-center gap-2 text-emerald-450 text-xs font-bold font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Active Supporter Subscription</span>
              </div>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <span>Explore Smart Matches</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full px-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none">
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="group w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-zinc-200 text-black rounded-lg font-semibold text-xs sm:text-sm transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-4 h-4 text-black animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4 text-black" />
                  )}
                  <span>{checkoutLoading ? "Preparing checkout..." : "Become a Supporter — $9/mo"}</span>
                  {!checkoutLoading && <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-550 font-mono">Secure payments · Cancel anytime with 1-click</p>
            </div>
          )}
        </div>
      </section>

      {/* Premium Features & Proof of Work Spotlight */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Premium Supporter Privileges</h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">Supercharge your open source profile with premium tools designed to help you stand out.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-zinc-950/25 border border-zinc-800/60 rounded-lg p-6 hover:border-zinc-700 hover:bg-white/[0.01] transition-all duration-300 group flex items-start gap-4 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800/70 flex items-center justify-center flex-shrink-0 text-zinc-300">
                  <feature.icon className="w-5 h-5 text-zinc-300" />
                </div>
                
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                    {feature.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-800/30 bg-emerald-950/20 text-emerald-400 font-bold font-mono tracking-wider uppercase">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof of Work Section Details */}
      <section className="py-16 px-6 relative z-10 bg-gradient-to-b from-transparent via-zinc-950/5 to-transparent">
        <div className="max-w-4xl mx-auto bg-zinc-950/20 border border-zinc-800 rounded-lg p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-900/40 bg-emerald-950/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Feature Spotlight</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Prove Your Impact With <br className="hidden sm:inline" />
                <span className="text-emerald-400">
                  Proof of Work Attestations
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed">
                Resume padding is a massive issue. With Proof of Work, you can convert your merged Pull Requests into cryptographically verified credentials. We display these as premium 3D metal cards on your profile, proving your actual codebase contributions.
              </p>

              <div className="space-y-2.5">
                {[
                  "Verify and mint any merged GitHub PR into a card",
                  "Cryptographic verification stamps check integrity",
                  "Displays on your public portfolio page for recruiters",
                  "Free tier limit: 5 PRs. Supporter tier: Unlimited PRs"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-center">
              {/* Mock metal card preview */}
              <div className="relative group/card w-60 h-72 rounded-lg bg-zinc-950 p-5 border border-zinc-855 shadow-2xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.02]">
                <div className="absolute top-4 right-4 bg-emerald-950/20 border border-emerald-800/40 rounded p-1 text-emerald-450">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-550 font-bold font-mono">Proof of Work</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white tracking-tight leading-tight">feat: implement authentication logic</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">anmolsah/firstissue.dev</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-zinc-900 pt-3">
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                      <span>VERIFIED IMPACT</span>
                      <span className="text-emerald-400 font-bold font-mono">98/100</span>
                    </div>
                    <div className="w-full bg-zinc-900 border border-zinc-800/60 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[90%]" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-650 font-mono">
                      <span>ID: att_8f2a99...</span>
                      <span>MINTED ON-CHAIN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-8">Compare Plans</h2>

          <div className="bg-zinc-950/25 border border-zinc-800/60 rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-950/40">
                  <th className="p-4 text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">Features</th>
                  <th className="p-4 text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 text-center w-32">Free</th>
                  <th className="p-4 text-xs font-bold font-mono uppercase tracking-wider text-white text-center bg-zinc-900/40 w-40">Supporter</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-850/40 hover:bg-white/[0.005] transition-colors">
                    <td className="p-3.5 text-xs text-zinc-200 font-semibold">{row.feature}</td>
                    <td className="p-3.5 text-xs text-center">
                      {row.free === "Yes" ? (
                        <Check className="w-3.5 h-3.5 text-zinc-300 mx-auto" />
                      ) : row.free === "No" ? (
                        <Lock className="w-3 h-3 text-zinc-650 mx-auto" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-805 text-zinc-400 font-semibold font-mono inline-block bg-zinc-900/80">
                          {row.free}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-center bg-zinc-900/20">
                      {row.supporter === "Yes" ? (
                        <Check className="w-3.5 h-3.5 text-white mx-auto" />
                      ) : row.supporter === "Unlimited" ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-850 text-white font-bold font-mono inline-block bg-zinc-900">
                          {row.supporter}
                        </span>
                      ) : (
                        <span className="text-zinc-300 font-semibold font-mono text-xs">{row.supporter}</span>
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
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-zinc-950/25 border border-zinc-800/60 rounded-lg overflow-hidden hover:border-zinc-700 transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="text-xs font-semibold text-white pr-4">{faq.q}</span>
                    <span className={`p-1 rounded bg-zinc-905 border border-zinc-800 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-xs text-zinc-450 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Channels / Other Ways to Help */}
      <section className="py-12 px-6 relative z-10 border-t border-zinc-900/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">Other Ways to Help</h2>
            <p className="text-xs text-zinc-500">You can support the FirstIssue.dev community in non-monetary ways too.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://github.com/anmolsah/firstissue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-zinc-950/25 border border-zinc-800/60 hover:border-zinc-700 hover:bg-white/[0.01] rounded-lg transition-all group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-3 text-zinc-350">
                <Github className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xs font-bold text-white mb-0.5">Star on GitHub</h3>
              <p className="text-[10px] text-zinc-550 font-mono">Help increase our visibility</p>
            </a>

            <a
              href="https://twitter.com/share?text=Check%20out%20FirstIssue.dev%20-%20a%20great%20platform%20for%20finding%20beginner-friendly%20open%20source%20issues!"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 bg-zinc-950/25 border border-zinc-800/60 hover:border-zinc-700 hover:bg-white/[0.01] rounded-lg transition-all group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-3 text-zinc-350">
                <Twitter className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-0.5">Share on Twitter</h3>
              <p className="text-[10px] text-zinc-550 font-mono">Share with other devs</p>
            </a>

            <a
              href="mailto:annifind010@gmail.com?subject=Feedback"
              className="p-5 bg-zinc-950/25 border border-zinc-800/60 hover:border-zinc-700 hover:bg-white/[0.01] rounded-lg transition-all group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-3 text-zinc-350">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-0.5">Send Feedback</h3>
              <p className="text-[10px] text-zinc-550 font-mono">Tell us how to improve</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/40 bg-zinc-950/20 py-8 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-center">
          <p className="text-zinc-600 text-[10px] font-mono">
            © {new Date().getFullYear()} FirstIssue.dev. All rights reserved.
          </p>
          <p className="text-zinc-600 text-[10px] font-mono">
            Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;

