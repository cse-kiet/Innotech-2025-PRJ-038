import React from "react";

const Discover = () => {
  const sections = [
    {
      title: "🚀 Trending Tech Topics",
      items: ["AI & ML", "Blockchain", "Quantum Computing", "Green Energy", "Space Tech", "Cybersecurity"],
    },
    {
      title: "🧠 Research & Innovations",
      items: [
        "MIT’s breakthrough in Quantum AI",
        "NASA’s AI-driven space exploration",
        "OpenAI’s new model release",
        "NVIDIA unveils next-gen GPUs",
      ],
    },
    {
      title: "🛠️ Tool of the Week",
      items: ["Runway ML – AI video creation made simple"],
    },
    {
      title: "💡 Featured Startups",
      items: ["Anthropic", "Cohere", "Perplexity AI", "Mistral AI", "xAI"],
    },
    {
      title: "🎯 Hackathons & Challenges",
      items: ["Smart India Hackathon", "Kaggle Competitions", "Google AI Hackathons"],
    },
    {
      title: "🎙️ Expert Talks",
      items: ["Lex Fridman Podcast", "MIT AI Podcast", "Google I/O Sessions"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1EDE3] text-[#4a3c28] px-6 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">🌐 Discover</h1>
      <div className="max-w-6xl mx-auto space-y-10">
        {sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {section.items.map((item, i) => (
                <li key={i} className="bg-[#F7F4EC] p-3 rounded-xl hover:bg-[#EDE8DC] transition cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
