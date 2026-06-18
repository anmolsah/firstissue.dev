import React from "react";
import { Link } from "react-router-dom";
import { Github, Star } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0B0C10] border-t border-zinc-800/60 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs font-bold tracking-tight text-white hover:opacity-85">
              FirstIssue.dev
            </Link>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-6 text-zinc-500">
              <Link to="/explore" className="hover:text-white transition-colors">
                Explore
              </Link>
              <Link to="/firstmate" className="hover:text-white transition-colors">
                FirstMate
              </Link>
              <Link to="/docs" className="hover:text-white transition-colors">
                Docs
              </Link>
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
          </div>

          <div className="text-zinc-600">
            © {new Date().getFullYear()} FirstIssue.dev. All rights reserved.
          </div>
        </div>

        {/* GitHub Star Section */}
        <div className="flex justify-center sm:justify-end pt-6 border-t border-zinc-800/40">
          <a
            href="https://github.com/anmolsah/firstissue.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/40 border border-zinc-800/60 rounded text-zinc-400 hover:text-white transition-all group scale-95"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="text-xs">Star on GitHub</span>
            <Star className="w-3.5 h-3.5 group-hover:text-yellow-400 transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
