import React from "react";
import { Link } from "react-router-dom";
import { Github, Star } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0B0C10] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
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

        {/* GitHub Star Section */}
        <div className="flex justify-center pt-6 border-t border-white/5">
          <a
            href="https://github.com/anmolsah/firstissue.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#12131a] border border-[#1e1f2e] rounded-lg text-gray-300 hover:text-white hover:border-blue-500/50 transition-all group"
          >
            <Github className="w-4 h-4" />
            <span className="text-sm font-medium">Star on GitHub</span>
            <Star className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
