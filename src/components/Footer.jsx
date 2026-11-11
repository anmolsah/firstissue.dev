import React from "react";
import { Link } from "react-router-dom";
import { Github, Star } from "lucide-react";
import { BrandLogo } from "./BrandMark";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0F0F0F] border-t border-[#22242A] py-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <BrandLogo size="sm" />
            </Link>
            <span className="text-[#2B2E36] hidden sm:inline" aria-hidden="true">
              /
            </span>
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-[#A8ADB6]">
              <Link to="/explore" className="hover:text-[#F4F4F0] transition-colors">
                Explore
              </Link>
              <Link to="/contribution-book" className="hover:text-[#F4F4F0] transition-colors">
                Contribution Book
              </Link>
              <Link to="/firstmate" className="hover:text-[#F4F4F0] transition-colors">
                FirstMate
              </Link>
              <Link to="/docs" className="hover:text-[#F4F4F0] transition-colors">
                Docs
              </Link>
              <Link to="/support" className="hover:text-[#F4F4F0] transition-colors">
                Support
              </Link>
              <Link to="/privacy" className="hover:text-[#F4F4F0] transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-[#F4F4F0] transition-colors">
                Terms
              </Link>
            </nav>
          </div>

          <a
            href="https://github.com/anmolsah/firstissue.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 rounded-[4px] text-[#F4F4F0] transition-colors group"
          >
            <Github className="w-3.5 h-3.5 text-[#A8ADB6] group-hover:text-[#F4F4F0] transition-colors" />
            <span className="text-xs font-medium">Star on GitHub</span>
            <Star className="w-3.5 h-3.5 text-[#8C929C] group-hover:text-[#DAFA9C] transition-colors" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-6 border-t border-[#22242A] text-xs text-[#8C929C]">
          <p className="font-mono text-pretty">
            GitHub REST/GraphQL issue indexing &amp; SHA-256 PR attestations
          </p>
          <p>© {new Date().getFullYear()} FirstIssue.dev</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
