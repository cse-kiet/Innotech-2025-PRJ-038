import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaHome, FaNewspaper, FaRobot } from "react-icons/fa";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const COLORS = {
    navbar: "#E7C3A0",
    accent: "#6B4E3D",
    black: "#060605ff",
    dustStorm: "#E4D5C9",
    parchment: "#F3E5D8",
    vanilla: "#D8C7B6",
  };

  const links = [
    { path: "/home", name: "Home", icon: <FaHome /> },
    { path: "/aidigest", name: "AI Digest", icon: <FaNewspaper /> },
  ];

  return (
    <nav
      className="flex justify-between items-center px-6 py-4 shadow-md sticky top-0 z-50"
      style={{
        backgroundColor: COLORS.navbar,
      }}
    >
      {/* Brand / Logo */}
      <div
        onClick={() => navigate("/")}
        className="text-3xl md:text-4xl font-extrabold cursor-pointer tracking-wide select-none"
        style={{
          color: COLORS.black,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        INSIGHTS
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-6 text-lg font-bold">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 transition-all duration-300 ${
              location.pathname === link.path
                ? "text-[#6B4E3D] border-b-4 border-[#6B4E3D]"
                : "text-gray-700 hover:text-[#6B4E3D]"
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </div>

      {/* Profile + AI Assistant + Dropdown */}
      <div className="relative flex items-center gap-4">
        {/* AI Assistant Icon */}
        <FaRobot
          className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform duration-300"
          style={{ color: COLORS.accent }}
          onClick={() => navigate("/aiassistant")}
          title="AI Assistant"
        />

        {/* Profile Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer border border-[#C6B29A]"
          onClick={() => navigate("/profile")}
        />

        {/* Dropdown Arrow */}
        <button
          onClick={toggleDropdown}
          className="focus:outline-none"
          aria-label="Profile options"
        >
          <FaChevronDown className="text-[#6B4E3D]" />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-44 w-56 rounded-xl shadow-lg border border-[#D8C7B6] bg-[#F3E5D8]">
            <ul className="py-2">
              <li
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/login");
                }}
                className="px-5 py-2 hover:bg-[#E4D5C9] cursor-pointer text-[#6B4E3D]"
              >
                Switch Account
              </li>
              <li
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/signup");
                }}
                className="px-5 py-2 hover:bg-[#E4D5C9] cursor-pointer text-[#6B4E3D]"
              >
                Create New Account
              </li>
              <li
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/");
                  alert("Logged out successfully!");
                }}
                className="px-5 py-2 hover:bg-[#E4D5C9] cursor-pointer text-red-600 font-semibold"
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;