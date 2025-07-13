import React, { useState } from "react";
import { Heart, Coffee, Pizza, Gift, Copy, Check } from "lucide-react";
import QR from "../assets/qrcode.jpg";


const SupportPage = () => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        console.error("Failed to copy UPI ID");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-lg w-full">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs">💝</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent mb-4 leading-tight">
            Support this Project
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
            If you've found this tool helpful, consider supporting me with a small contribution 🙏
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/30 shadow-2xl mb-6 transform hover:scale-[1.02] transition-all duration-300">
          
          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner mb-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Scan QR Code to Pay
              </h2>
              <p className="text-sm text-gray-600 text-center">
                Use any UPI app to scan and pay
              </p>
            </div>
            
            <div className="flex justify-center mb-4">
               <img
              src={QR}
              alt="UPI QR Code"
              className="w-48 h-48 mx-auto rounded-xl shadow-md"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                UPI Payment Ready
              </div>
            </div>
          </div>

          {/* UPI ID Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-lg mb-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Or pay directly to UPI ID:
              </label>
              
              <div
                className="bg-white px-4 py-4 rounded-xl border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all duration-200 group relative"
                onClick={() => copyToClipboard("8250676762@ybl")}
              >
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono text-indigo-600 font-semibold flex-1">
                    8250676762@ybl
                  </code>
                  <div className="ml-3 flex items-center gap-2">
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 group-hover:text-indigo-600 transition-colors text-center">
                  {copied ? "Copied!" : "Click to copy UPI ID"}
                </p>
              </div>
            </div>

            {/* Suggested Tips */}
            <div className="border-t border-indigo-200 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                Suggested amounts:
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors cursor-pointer transform hover:scale-105">
                  <Coffee className="h-4 w-4" />
                  ₹99
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors cursor-pointer transform hover:scale-105">
                  <Pizza className="h-4 w-4" />
                  ₹199
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors cursor-pointer transform hover:scale-105">
                  <Heart className="h-4 w-4" />
                  ₹299
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="h-6 w-6 text-green-600" />
              <span className="font-bold text-lg text-green-800">Thank You!</span>
            </div>
            <p className="text-sm sm:text-base text-green-700 leading-relaxed">
              Your support helps me continue building useful tools for the developer community. Every contribution, no matter how small, is deeply appreciated! 
            </p>
            <div className="mt-3 flex justify-center gap-1">
              <span className="text-lg">🚀</span>
              <span className="text-lg">💻</span>
              <span className="text-lg">❤️</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 opacity-75">
          <p className="text-sm text-gray-500">
            Secure payments powered by UPI
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;