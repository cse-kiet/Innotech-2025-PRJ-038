import React from "react";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = ({ theme = "light" }) => {
  const isDark = theme === "dark";

  return (
    <footer
      className={`${
        isDark ? "bg-[#3A2E22] text-[#E79B54]" : "bg-[#E7C3A0] text-[#3A2E22]"
      } py-10 border-t border-[#C6B29A]/40`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-wide mb-2">INSIGHTS</h2>
          <p className="text-sm leading-relaxed max-w-xs">
            Discover, Learn, and Evolve — your personalized space for AI-powered
            news, knowledge, and research.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
          <a href="/home" className="hover:underline hover:text-[#5C4633]">
            Home
          </a>
          <a href="/discover" className="hover:underline hover:text-[#5C4633]">
            Discover
          </a>
          <a href="/feed" className="hover:underline hover:text-[#5C4633]">
            Feed
          </a>
          <a href="/aidigest" className="hover:underline hover:text-[#5C4633]">
            AI Digest
          </a>
          <a href="/about" className="hover:underline hover:text-[#5C4633]">
            About
          </a>
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-start md:items-end space-y-3">
          <h3 className="font-semibold text-lg">Connect</h3>
          <div className="flex space-x-5 text-xl">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#5C4633]"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#5C4633]"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#5C4633]"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-[#C6B29A]/40 mt-10 pt-6 text-center text-sm opacity-80">
        © {new Date().getFullYear()} <span className="font-semibold">INSIGHTS</span> — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
