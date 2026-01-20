import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0B0C10] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
              FirstIssue.dev
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-8 text-sm text-gray-500">
          <Link to="/support" className="hover:text-white transition-colors">
            Support
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
        
        <div className="text-sm text-gray-600">
          © {new Date().getFullYear()} FirstIssue.dev. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
