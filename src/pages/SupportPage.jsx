import React from "react";
import { Heart, Coffee, Pizza, Gift } from "lucide-react";
import toast from "react-hot-toast";

const SupportPage = () => {
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("✅ UPI ID copied to clipboard!");
      })
      .catch(() => {
        toast.error("❌ Failed to copy UPI ID");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Support this Project ❤️
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            If you've found this tool helpful, you can support me by scanning
            the UPI QR code or sending a tip to my UPI ID 🙏
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <img
              src="/your-qr-code.png"
              alt="UPI QR Code"
              className="w-48 h-48 mx-auto rounded-xl shadow-md"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />

            <div className="w-48 h-48 mx-auto rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 items-center justify-center flex-col hidden">
              <div className="text-6xl mb-2">📱</div>
              <p className="text-sm text-gray-600 font-medium">QR Code</p>
              <p className="text-xs text-gray-500">Placeholder</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-lg">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">UPI ID:</p>
              <div
                className="bg-white px-4 py-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group"
                onClick={() => copyToClipboard("annicode@okaxis")}
              >
                <code className="text-lg font-mono text-indigo-600 font-semibold">
                  annicode@okaxis
                </code>
                <p className="text-xs text-gray-500 mt-1 group-hover:text-indigo-600 transition-colors">
                  Click to copy
                </p>
              </div>
            </div>

            <div className="border-t border-indigo-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Suggested tips:
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  <Coffee className="h-4 w-4" />
                  ₹29
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  <Pizza className="h-4 w-4" />
                  ₹49
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  <Heart className="h-4 w-4" />
                  ₹99
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Thank You!</span>
          </div>
          <p className="text-sm text-green-700">
            Your support helps me continue building useful tools for the
            developer community. Every contribution, no matter how small, is
            deeply appreciated! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
