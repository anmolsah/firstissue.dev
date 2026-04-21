import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";

const SupportPage = () => {
  const { user } = useAuth();
  const { isSupporter, supporterData, loading: supporterLoading } = useSupporter();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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
      title: "AI-Powered Issue Matching",
      description: "OpenRouter AI analyzes your GitHub profile to recommend issues that match your exact tech stack and experience level.",
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      description: "Get curated issue suggestions based on your top languages, repo topics, and contribution history.",
    },
    {
      icon: Zap,
      title: "Smart Difficulty Scoring",
      description: "AI evaluates issue complexity and matches it to your experience level — no more wasted time on mismatched issues.",
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get priority access to new features and direct support from the FirstIssue.dev team.",
    },
  ];

  const faqs = [
    {
      q: "What do I get as a Supporter?",
      a: "You unlock AI-Powered Smart Matching on the Explore page, which uses OpenRouter AI to analyze your GitHub profile and recommend issues that perfectly match your skills. You also get priority support and early access to new features.",
    },
    {
      q: "How does the AI matching work?",
      a: "We fetch your public GitHub repos to identify your top languages, frameworks, and topics. Then our AI (powered by OpenRouter) scores open issues against your profile to find the best matches — ranked by relevance, difficulty, and recency.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time. You'll keep access until the end of your current billing period.",
    },
    {
      q: "Is FirstIssue.dev still free?",
      a: "Absolutely! The core platform — exploring issues, bookmarking, status tracking, badges — is and always will be 100% free. Smart Matching is a premium add-on for supporters.",
    },
    {
      q: "What payment methods are accepted?",
      a: "We use Dodo Payments which supports all major credit/debit cards. Payments are processed securely.",
    },
  ];

  const planFeatures = [
    "AI-Powered Smart Issue Matching",
    "Personalized tech stack analysis",
    "Smart difficulty scoring",
    "Priority feature requests",
    "Early access to new tools",
    "Supporter badge on profile",
    "Direct team support",
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FirstIssue.dev</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link to="/support" className="text-white font-medium">Support</Link>
          </nav>
          {user ? (
            <Link to="/profile" className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Open Source Matching
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
              Open Source Match
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Our AI analyzes your GitHub profile to recommend issues that
            perfectly match your tech stack and experience level.
          </p>

          {/* Already a supporter */}
          {isSupporter ? (
            <div className="inline-flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">You're a Supporter!</span>
              </div>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 px-6 py-3 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                Go to Smart Match
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 disabled:opacity-50 cursor-pointer"
              >
                {checkoutLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Crown className="w-5 h-5" />
                )}
                {checkoutLoading ? "Processing..." : "Become a Supporter — $9/mo"}
              </button>
              <p className="text-sm text-gray-500">Cancel anytime · Secure checkout</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How Smart Matching Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Three simple steps to find your perfect open source contribution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Code2,
                title: "We Analyze Your Profile",
                description: "Our system scans your GitHub repos to identify your top languages, frameworks, and experience level.",
                color: "purple",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Finds Matches",
                description: "OpenRouter AI scores every candidate issue against your unique developer profile for relevance.",
                color: "blue",
              },
              {
                step: "03",
                icon: Target,
                title: "You Contribute",
                description: "Browse AI-ranked recommendations, find your perfect match, and make your next open source contribution.",
                color: "emerald",
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-[#12131a] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all h-full">
                  <div className="text-5xl font-bold text-white/5 mb-4">{item.step}</div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    item.color === "purple" ? "bg-purple-500/10" :
                    item.color === "blue" ? "bg-blue-500/10" :
                    "bg-emerald-500/10"
                  }`}>
                    <item.icon className={`w-6 h-6 ${
                      item.color === "purple" ? "text-purple-400" :
                      item.color === "blue" ? "text-blue-400" :
                      "text-emerald-400"
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-purple-600/3 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What You Unlock</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything included in your Supporter subscription.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-5 p-6 bg-[#12131a] border border-white/5 rounded-xl hover:border-purple-500/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 px-6" id="pricing">
        <div className="max-w-md mx-auto">
          <div className="relative bg-[#12131a] border border-purple-500/20 rounded-2xl overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-[80px] pointer-events-none" />

            <div className="relative p-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-semibold mb-6">
                <Crown className="w-3.5 h-3.5" />
                SUPPORTER
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-white">$9</span>
                <span className="text-lg text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-8">Billed monthly. Cancel anytime.</p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {planFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isSupporter ? (
                <div className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-semibold">
                  <Check className="w-5 h-5" />
                  Active Supporter
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Unlock className="w-5 h-5" />
                  )}
                  {checkoutLoading ? "Processing..." : "Get Started"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Free vs Supporter */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Free vs Supporter</h2>

          <div className="bg-[#12131a] border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-0">
              {/* Header */}
              <div className="p-4 border-b border-white/5" />
              <div className="p-4 border-b border-white/5 text-center">
                <span className="text-sm font-semibold text-gray-400">Free</span>
              </div>
              <div className="p-4 border-b border-white/5 text-center bg-purple-500/5">
                <span className="text-sm font-semibold text-purple-400">Supporter</span>
              </div>

              {/* Rows */}
              {[
                { feature: "Browse Issues", free: true, supporter: true },
                { feature: "Bookmarks & Status", free: true, supporter: true },
                { feature: "Contribution Badges", free: true, supporter: true },
                { feature: "Smart AI Matching", free: false, supporter: true },
                { feature: "Tech Stack Analysis", free: false, supporter: true },
                { feature: "Priority Support", free: false, supporter: true },
                { feature: "Early Feature Access", free: false, supporter: true },
              ].map((row, i) => (
                <React.Fragment key={i}>
                  <div className="p-4 border-b border-white/5">
                    <span className="text-sm text-gray-300">{row.feature}</span>
                  </div>
                  <div className="p-4 border-b border-white/5 text-center">
                    {row.free ? (
                      <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600 mx-auto" />
                    )}
                  </div>
                  <div className="p-4 border-b border-white/5 text-center bg-purple-500/5">
                    <Check className="w-5 h-5 text-purple-400 mx-auto" />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#12131a] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Ways to Help */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Other Ways to Support</h2>
          <p className="text-gray-500 mb-8 text-sm">
            You can also help FirstIssue.dev grow without a subscription.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/anmolsah/firstissue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#12131a] border border-white/5 rounded-xl hover:border-white/20 transition-all"
            >
              <Github className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Star on GitHub</h3>
              <p className="text-xs text-gray-500">Help us reach more developers</p>
            </a>

            <a
              href="https://twitter.com/share?text=Check%20out%20FirstIssue.dev%20-%20a%20great%20platform%20for%20finding%20beginner-friendly%20open%20source%20issues!"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#12131a] border border-white/5 rounded-xl hover:border-white/20 transition-all"
            >
              <Twitter className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Share on Twitter</h3>
              <p className="text-xs text-gray-500">Spread the word</p>
            </a>

            <a
              href="mailto:annifind010@gmail.com?subject=Feedback"
              className="p-6 bg-[#12131a] border border-white/5 rounded-xl hover:border-white/20 transition-all"
            >
              <Mail className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Send Feedback</h3>
              <p className="text-xs text-gray-500">Help us improve</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Built with <span className="text-pink-400">❤️</span> for the developer community
          </p>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
