import React from "react";
import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <main className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] flex items-center justify-center px-4 pt-[68px]">
      <div className="max-w-md w-full bg-[#141518] border border-[#2B2E36] rounded-[4px] p-8 text-center">
        <p className="font-mono text-xs text-[#F87171] mb-4 tabular-nums">
          ERR 404 · Route not found
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-[#F4F4F0] mb-3 text-balance">
          Page not found
        </h1>
        <p className="text-sm text-[#A8ADB6] mb-7 leading-relaxed text-pretty">
          The page you requested does not exist or may have moved to a new workspace route.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-sm font-semibold transition-colors w-full sm:w-auto justify-center min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17181B] border border-[#2B2E36] hover:border-[#3A3E48] text-[#F4F4F0] rounded-[4px] text-sm font-medium transition-colors w-full sm:w-auto justify-center min-h-[44px]"
          >
            <Search className="w-4 h-4 text-[#A8ADB6]" />
            Explore Issues
          </Link>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-[#8C929C] hover:text-[#F4F4F0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to previous page
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
