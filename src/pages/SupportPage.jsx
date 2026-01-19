import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Coffee,
  Pizza,
  Copy,
  CheckCircle,
  MessageSquare,
  Mail,
  Github,
  Twitter,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Command,
} from "lucide-react";
import toast from "react-hot-toast";
import QR from "../assets/qrcode.jpg";
import Footer from "../components/Footer";

const SupportPage = () => {
  const [qrError, setQrError] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("UPI ID copied successfully!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to copy UPI ID"));
  };

  const supportTiers = [
    {
      icon: Coffee,
      title: "Coffee",
      amount: "₹99",
      description: "Buy us a coffee to keep the dev energy flowing",
      color: "blue",
      popular: false,
    },
    {
      icon: Pizza,
      title: "Lunch",
      amount: "₹199",
      description: "Fuel a full day of feature development",
      color: "amber",
      popular: true,
    },
    {
      icon: Heart,
      title: "Champion",
      amount: "₹299",
      description: "Become a champion supporter of open source",
      color: "emerald",
      popular: false,
    },
  ];

  const benefits = [
    { icon: Zap, text: "Priority feature requests" },
    { icon: Shield, text: "Early access to new tools" },
    { icon: Users, text: "Recognition in our community" },
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
            <Link to="/getting-started" className="hover:text-white transition-colors">Docs</Link>
            <Link to="/support" className="text-white">Support</Link>
          </nav>
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm font-medium mb-8">
            <Heart className="w-4 h-4 fill-current" />
            Support Open Source Development
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Help us keep FirstIssue.dev
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              free and growing
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Your contribution directly supports the continuous development of tools 
            that help developers make their first open source contributions.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Tiers */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {supportTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative p-6 bg-[#12131a] border rounded-2xl hover:border-white/20 transition-all hover:-translate-y-1 ${
                  tier.popular ? "border-blue-500/50" : "border-[#1e1f2e]"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  tier.color === 'blue' ? 'bg-blue-500/10' :
                  tier.color === 'amber' ? 'bg-amber-500/10' :
                  'bg-emerald-500/10'
                }`}>
                  <tier.icon className={`w-7 h-7 ${
                    tier.color === 'blue' ? 'text-blue-400' :
                    tier.color === 'amber' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{tier.title}</h3>
                <p className="text-3xl font-bold text-white mb-3">{tier.amount}</p>
                <p className="text-sm text-gray-500 mb-6">{tier.description}</p>
                <button className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  tier.popular
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-[#1e1f2e] text-white hover:bg-[#2a2b4e]"
                }`}>
                  Support
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Payment Section */}
      <section className="py-12 px-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#12131a] border border-[#1e1f2e] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Pay via UPI
            </h2>

            {/* QR Code */}
            <div className="bg-[#0a0a0f] rounded-xl p-6 mb-6">
              {qrError ? (
                <div className="w-48 h-48 mx-auto rounded-xl bg-[#1e1f2e] flex items-center justify-center flex-col">
                  <div className="text-5xl mb-3 opacity-50">📱</div>
                  <p className="text-sm text-gray-400">QR Unavailable</p>
                </div>
              ) : (
                <img
                  src={QR}
                  alt="UPI QR Code"
                  className="w-48 h-48 mx-auto rounded-xl"
                  onError={() => setQrError(true)}
                />
              )}
            </div>

            {/* UPI ID */}
            <div
              onClick={() => copyToClipboard("8250676762@ybl")}
              className="bg-[#0a0a0f] border border-[#1e1f2e] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-colors group"
            >
              <code className="text-lg font-mono text-white font-medium">
                8250676762@ybl
              </code>
              <div className="flex items-center gap-2">
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm text-gray-500 group-hover:text-blue-400 transition-colors">
                      Copy
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Help */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Other Ways to Support</h2>
          <p className="text-gray-400 mb-8">
            Not able to contribute financially? Here are other ways you can help us grow!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/firstissue/firstissue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#12131a] border border-[#1e1f2e] rounded-xl hover:border-white/20 transition-all group"
            >
              <Github className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Star on GitHub</h3>
              <p className="text-sm text-gray-500">Help us reach more developers</p>
            </a>

            <a
              href="https://twitter.com/share?text=Check%20out%20FirstIssue.dev%20-%20a%20great%20platform%20for%20finding%20beginner-friendly%20open%20source%20issues!"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#12131a] border border-[#1e1f2e] rounded-xl hover:border-white/20 transition-all group"
            >
              <Twitter className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Share on Twitter</h3>
              <p className="text-sm text-gray-500">Spread the word</p>
            </a>

            <a
              href="mailto:support@firstissue.dev?subject=Feedback"
              className="p-6 bg-[#12131a] border border-[#1e1f2e] rounded-xl hover:border-white/20 transition-all group"
            >
              <Mail className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Send Feedback</h3>
              <p className="text-sm text-gray-500">Help us improve</p>
            </a>
          </div>
        </div>
      </section>

      {/* Thank You */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-500">
            Built with <span className="text-pink-400">❤️</span> for the developer community
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SupportPage;
