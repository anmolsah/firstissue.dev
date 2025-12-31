import React, { useState } from "react";
import { Heart, Coffee, Pizza, Copy } from "lucide-react";
import toast from "react-hot-toast";
import QR from "../assets/qrcode.jpg";

const SupportPage = () => {
  const [qrError, setQrError] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("UPI ID copied successfully!"))
      .catch(() => toast.error("Failed to copy UPI ID"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="relative max-w-2xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-[#00ADB5]/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-[#00ADB5]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-[#00ADB5]/30">
              <Heart className="h-12 w-12 text-[#00ADB5]" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-[#EEEEEE] mb-6">
            <span className="text-[#00ADB5]">Support Development</span>
            <br />
            <span className="text-[#EEEEEE]">& Fuel Innovation</span>
          </h1>

          <p className="text-xl text-[#EEEEEE]/60 leading-relaxed max-w-lg mx-auto">
            Your contribution directly supports the continuous development of
            tools that empower developers worldwide.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#393E46]/50 backdrop-blur-xl border border-[#393E46] rounded-3xl p-8 shadow-2xl">
          {/* QR Code Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#EEEEEE] text-center mb-6">
              Scan & Contribute
            </h2>
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#00ADB5]/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#222831] rounded-2xl p-8 border border-[#393E46]">
                {qrError ? (
                  <div className="w-64 h-64 mx-auto rounded-xl bg-[#393E46] border border-[#EEEEEE]/10 flex items-center justify-center flex-col">
                    <div className="text-7xl mb-4 opacity-50">📱</div>
                    <p className="text-lg text-[#EEEEEE] font-semibold">
                      QR Code Unavailable
                    </p>
                    <p className="text-sm text-[#EEEEEE]/50">
                      Please use UPI ID
                    </p>
                  </div>
                ) : (
                  <img
                    src={QR}
                    alt="UPI QR Code"
                    className="w-64 h-64 mx-auto rounded-xl shadow-2xl"
                    onError={() => setQrError(true)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* UPI ID Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#EEEEEE] text-center mb-4">
              Or Pay via UPI ID
            </h3>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-[#00ADB5]/30 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div
                className="relative bg-[#222831] backdrop-blur-sm border border-[#393E46] rounded-xl p-4 cursor-pointer hover:border-[#00ADB5]/50 transition-all duration-300 group"
                onClick={() => copyToClipboard("8250676762@ybl")}
              >
                <div className="flex items-center justify-between">
                  <code className="text-xl font-mono text-[#EEEEEE] font-bold tracking-wider">
                    8250676762@ybl
                  </code>
                  <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-[#EEEEEE]/40 group-hover:text-[#00ADB5] transition-colors" />
                    <span className="text-sm text-[#EEEEEE]/40 group-hover:text-[#00ADB5] transition-colors">
                      Click to copy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Amounts */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-[#EEEEEE] text-center mb-4">
              Quick Support Options
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#00ADB5]/10 border border-[#00ADB5]/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <Coffee className="h-8 w-8 text-[#00ADB5] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#EEEEEE]">₹99</p>
                <p className="text-sm text-[#00ADB5]">Coffee</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <Pizza className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#EEEEEE]">₹199</p>
                <p className="text-sm text-amber-400">Lunch</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <Heart className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#EEEEEE]">₹299</p>
                <p className="text-sm text-emerald-400">Champion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#EEEEEE]/40 text-sm">
            Built with <span className="text-[#00ADB5]">❤️</span> for the
            developer community
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
