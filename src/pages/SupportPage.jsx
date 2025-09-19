import React, { useState } from "react"; // 1. Import useState
import { Heart, Coffee, Pizza, Copy } from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // Pro-tip: Make sure <Toaster /> is in your root component
import QR from "../assets/qrcode.jpg";

const SupportPage = () => {
  // 2. Add state to track if the QR image fails to load
  const [qrError, setQrError] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("UPI ID copied successfully!", {
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #475569",
          },
        });
      })
      .catch(() => {
        toast.error("Failed to copy UPI ID", {
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #475569",
          },
        });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative max-w-2xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-600 via-orange-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
              Support Development
            </span>
            <br />
            <span className="text-white">& Fuel Innovation</span>
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed max-w-lg mx-auto">
            Your contribution directly supports the continuous development of
            tools that empower developers worldwide.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* QR Code Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Scan & Contribute
            </h2>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-slate-900/50 rounded-2xl p-8 border border-slate-700/50">
                {/* 3. Conditionally render the image or the fallback div */}
                {qrError ? (
                  <div className="w-64 h-64 mx-auto rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center flex-col">
                    <div className="text-7xl mb-4 opacity-50">📱</div>
                    <p className="text-lg text-gray-300 font-semibold">
                      QR Code Unavailable
                    </p>
                    <p className="text-sm text-gray-500">Please use UPI ID</p>
                  </div>
                ) : (
                  <img
                    src={QR}
                    alt="UPI QR Code"
                    className="w-64 h-64 mx-auto rounded-xl shadow-2xl"
                    onError={() => setQrError(true)} // 4. On error, update the state
                  />
                )}
              </div>
            </div>
          </div>

          {/* UPI ID Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white text-center mb-4">
              Or Pay via UPI ID
            </h3>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div
                className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-600 rounded-xl p-4 cursor-pointer hover:bg-slate-800/80 transition-all duration-300 group"
                onClick={() => copyToClipboard("8250676762@ybl")}
              >
                <div className="flex items-center justify-between">
                  <code className="text-xl font-mono text-white font-bold tracking-wider">
                    8250676762@ybl
                  </code>
                  <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      Click to copy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Amounts */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white text-center mb-4">
              Quick Support Options
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <Coffee className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">₹99</p>
                <p className="text-sm text-orange-300">Coffee</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <Pizza className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">₹199</p>
                <p className="text-sm text-yellow-300">Lunch</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">₹299</p>
                <p className="text-sm text-pink-300">Champion</p>
              </div>
            </div>
          </div>

          {/* I removed the "Thank You" message from the main card as it feels more like a post-donation message, but you can add it back if you like! */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Built with ❤️ for the developer community
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
