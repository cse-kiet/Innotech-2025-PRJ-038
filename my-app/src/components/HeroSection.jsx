import React, { useState } from "react";
import { Bell, Search, Filter, ChevronDown } from "lucide-react";

const HeroSection = () => {
  const [selectedSort, setSelectedSort] = useState("Relevance");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const COLORS = {
    rodeoDust: "#C6B29A",
    vanilla: "#D8C7B6",
    dustStorm: "#E4D5C9",
    parchment: "#F3E5D8",
    bone: "#E7D0C5",
    accent: "#4A3C28",
  };

  const sortOptions = ["Relevance", "Upload date", "View count", "Rating"];
  const categories = [
    "All",
    "AI",
    "Blockchain",
    "Cybersecurity",
    "Automobile",
    "Robotics",
    "Hardware",
    "Cryptocurrency",
    "HealthTech",
    "EdTech",
    "Startups",
    "Innovation",
  ];

  return (
    <section
      className="py-10 px-6 md:px-16"
      style={{ backgroundColor: COLORS.parchment, color: COLORS.accent }}
    >
      <div
        className="max-w-6xl mx-auto flex flex-col gap-6 rounded-3xl shadow-lg p-8"
        style={{
          backgroundColor: COLORS.bone,
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header + Greeting + Notification */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Hello, Aakash 👋
          </h1>
          <p className="text-lg text-[#5b4b3a] leading-relaxed">
            You haven’t explored today’s insights — let’s catch up!  
            Here’s what’s new in AI, blockchain, and beyond.
          </p>

          <div
            className="flex items-center gap-3 bg-[#F9F6F2] border border-[#E4D5C9] px-4 py-3 rounded-xl shadow-sm mt-2"
          >
            <Bell className="text-[#4a3c28]" />
            <span className="text-sm font-medium">
              <b>3 new AI breakthroughs</b> were added this morning — explore them now!
            </span>
          </div>
        </div>

        {/* Unified Filter + Search Bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-[#F9F6F2] border border-[#E4D5C9] rounded-2xl px-5 py-4 shadow-sm"
        >
          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-full px-4 py-2 w-full md:w-2/4 border border-[#E4D5C9] shadow-sm">
            <Search className="text-[#4a3c28] mr-2" />
            <input
              type="text"
              placeholder="Search topics, trends, or papers..."
              className="w-full outline-none bg-transparent text-[#4a3c28]"
            />
          </div>

          {/* Filter + Sort + Category */}
          <div className="flex flex-wrap md:flex-nowrap gap-3 justify-center md:justify-end w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none bg-white border border-[#E4D5C9] rounded-full px-5 py-2 pr-8 text-[#4a3c28] font-medium shadow-sm focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4a3c28]"
                size={18}
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-[#E4D5C9] rounded-full px-5 py-2 pr-8 text-[#4a3c28] font-medium shadow-sm focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4a3c28]"
                size={18}
              />
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 bg-[#C6B29A] hover:bg-[#BCA189] text-white px-5 py-2 rounded-full font-semibold transition">
              <Filter size={18} /> Apply
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
