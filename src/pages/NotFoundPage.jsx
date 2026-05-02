import React from "react";
import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 backdrop-blur-sm">
              <Search className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Page not found
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 px-6 py-3 bg-[#15161E] border border-white/10 text-gray-300 rounded-xl font-medium hover:text-white hover:border-white/20 transition-colors w-full sm:w-auto justify-center"
          >
            <Search className="w-4 h-4" />
            Explore Issues
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mx-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
