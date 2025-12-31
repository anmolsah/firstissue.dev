import React from "react";
import { Github, Linkedin } from "lucide-react";
import logo from "../assets/logo01.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-[#222831] border-t border-[#393E46] py-6">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-[#EEEEEE]/60">
          <span>© {new Date().getFullYear()}</span>
          <Link
            to="/"
            className="flex items-center space-x-2 text-[#00ADB5] hover:text-[#00d4de] transition-colors"
          >
            {/* <img className="w-6 h-6" src={logo} alt="FirstIssue.dev logo" /> */}
            <span className="text-base font-semibold text-[#EEEEEE]">
              FirstIssue.dev
            </span>
          </Link>
          <span>
            — Made with <span className="text-[#00ADB5]">❤️</span> by Anmol
          </span>
        </div>

        <div className="flex gap-5">
          <a
            href="https://github.com/anmolsah"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EEEEEE]/60 hover:text-[#00ADB5] transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/anmol-sah-551083238/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EEEEEE]/60 hover:text-[#00ADB5] transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
