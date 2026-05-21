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

const SupportPage = () => {
  const { user } = useAuth();
  const { isSupporter, loading: supporterLoading, refreshStatus } = useSupporter();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Handle return from successful payment
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && user && !isSupporter && !supporterLoading) {
      const activateSupporter = async () => {
        try {
          const { data: existing } = await supabase
            .from("supporters")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

          if (!existing) {
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
              console.error("Error activating supporter:", error);
            } else {
              toast.success("🎉 Welcome, Supporter! Smart Match and Unlimited Proof of Work are now unlocked.");
              refreshStatus();
            }
          } else {
            refreshStatus();
          }
        } catch (err) {
          console.error("Error in post-payment activation:", err);
        }
      };

      activateSupporter();
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
    <div className="min-h-screen bg-[#07080b] text-[#F3F4F6] relative overflow-x-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[80%] bg-purple-600/10 rounded-full blur-[130px] opacity-75" />
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[70%] bg-blue-600/10 rounded-full blur-[130px] opacity-50" />
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b border-zinc-800/80 bg-[#07080b]/75 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 group-hover:from-white group-hover:to-white transition-all duration-300">
              FirstIssue.dev
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/explore" className="text-zinc-400 hover:text-white transition-colors">Explore</Link>
            <Link to="/docs" className="text-zinc-400 hover:text-white transition-colors">Docs</Link>
            <Link to="/support" className="text-purple-400 font-medium">Support</Link>
          </nav>
          {user ? (
            <Link to="/profile" className="px-5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 hover:text-white rounded-full text-sm font-medium transition-all shadow-sm">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-purple-500/20">
              Get Started
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Crown className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Empower Open Source
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] text-white">
            Level Up Your <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
              Contribution Journey
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Support the platform and unlock AI Smart Matching along with unlimited verified Proof of Work credentials on your developer profile.
          </p>

          {isSupporter ? (
            <div className="inline-flex flex-col items-center gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-6 h-6" />
                Active Supporter Subscription
              </div>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                Explore Smart Matches
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Crown className="w-5 h-5" />
                  )}
                  {checkoutLoading ? "Preparing checkout..." : "Become a Supporter — $9/mo"}
                  {!checkoutLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500">Secure payments · Cancel anytime with 1-click</p>
            </div>
          )}
        </div>
      </section>

      {/* Premium Features & Proof of Work Spotlight */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Premium Supporter Privileges</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-base">Supercharge your open source profile with premium tools designed to help you stand out.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 hover:border-zinc-700/80 transition-all duration-300 group flex items-start gap-5 relative overflow-hidden backdrop-blur-sm"
              >
                {/* Visual hover background element */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                
                <div className={`w-12 h-12 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ${feature.accent}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                    {feature.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/35">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof of Work Section Details */}
      <section className="py-16 px-6 relative z-10 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-5xl mx-auto bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
          {/* Subtle light leak */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Feature Spotlight
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Prove Your Impact With <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  Proof of Work Attestations
                </span>
              </h2>

              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Resume padding is a massive issue. With Proof of Work, you can convert your merged Pull Requests into cryptographically verified credentials. We display these as premium 3D metal cards on your profile, proving your actual codebase contributions.
              </p>

              <div className="space-y-3">
                {[
                  "Verify and mint any merged GitHub PR into a card",
                  "Cryptographic verification stamps check integrity",
                  "Displays on your public portfolio page for recruiters",
                  "Free tier limit: 5 PRs. Supporter tier: Unlimited PRs"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-center">
              {/* Mock metal card preview */}
              <div className="relative group/card w-64 h-80 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 p-6 border border-zinc-700 shadow-2xl transition-all duration-500 hover:rotate-2 hover:scale-[1.03]">
                <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Proof of Work</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white leading-tight">feat: implement authentication logic</h4>
                      <p className="text-[11px] text-zinc-400">anmolsah/firstissue.dev</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>VERIFIED IMPACT</span>
                      <span className="text-emerald-400 font-bold">98/100</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[90%]" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-600">
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
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Compare Plans</h2>

          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-800/80">
                  <th className="p-5 text-sm font-bold text-zinc-400">Features</th>
                  <th className="p-5 text-sm font-bold text-zinc-400 text-center w-32">Free</th>
                  <th className="p-5 text-sm font-bold text-purple-400 text-center bg-purple-500/5 w-40">Supporter</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 text-sm text-zinc-300 font-medium">{row.feature}</td>
                    <td className="p-4 text-sm text-center">
                      {row.free === "Yes" ? (
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : row.free === "No" ? (
                        <Lock className="w-3.5 h-3.5 text-zinc-600 mx-auto" />
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold inline-block">
                          {row.free}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-center bg-purple-500/5">
                      {row.supporter === "Yes" ? (
                        <Check className="w-4 h-4 text-purple-400 mx-auto" />
                      ) : row.supporter === "Unlimited" ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold inline-block tracking-wide">
                          {row.supporter}
                        </span>
                      ) : (
                        <span className="text-zinc-300">{row.supporter}</span>
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
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">FAQ</h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white pr-4">{faq.q}</span>
                    <span className={`p-1.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Channels / Other Ways to Help */}
      <section className="py-16 px-6 relative z-10 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Other Ways to Help</h2>
            <p className="text-zinc-500 text-sm">You can support the FirstIssue.dev community in non-monetary ways too.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://github.com/anmolsah/firstissue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl hover:border-zinc-700/80 transition-all group flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Github className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Star on GitHub</h3>
              <p className="text-xs text-zinc-500">Help increase our visibility</p>
            </a>

            <a
              href="https://twitter.com/share?text=Check%20out%20FirstIssue.dev%20-%20a%20great%20platform%20for%20finding%20beginner-friendly%20open%20source%20issues!"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl hover:border-zinc-700/80 transition-all group flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Twitter className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Share on Twitter</h3>
              <p className="text-xs text-zinc-500">Share with other devs</p>
            </a>

            <a
              href="mailto:annifind010@gmail.com?subject=Feedback"
              className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl hover:border-zinc-700/80 transition-all group flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Send Feedback</h3>
              <p className="text-xs text-zinc-500">Tell us how to improve</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 relative z-10 border-t border-zinc-900/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} FirstIssue.dev. All rights reserved.
          </p>
          <p className="text-zinc-600 text-xs">
            Built for developers, by developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;

