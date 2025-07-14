import React from "react";
import { Github, Linkedin } from "lucide-react";
import logo from "../assets/logo01.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>© {new Date().getFullYear()}</span>
          <Link
            to="/"
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <img className="w-6 h-6" src={logo} alt="FirstIssue.dev logo" />
            <span className="text-base font-semibold">FirstIssue.dev</span>
          </Link>
          <span>— Made with 💙 by Anmol</span>
        </div>

        
        <div className="flex gap-5">
          <a
            href="https://github.com/anmolsah"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/anmol-sah-551083238/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
