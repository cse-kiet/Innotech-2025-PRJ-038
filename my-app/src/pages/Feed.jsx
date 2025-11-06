import React, { useState } from "react";
import FeedCard from "../components/FeedCard";
import { Sparkles, Award, BarChart2 } from "lucide-react";

const Feed = () => {
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [pollVoted, setPollVoted] = useState(false);
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(3);

  const handleQuizAnswer = () => {
    if (!quizAnswered) {
      setXp(xp + 20);
      setQuizAnswered(true);
    }
  };

  const handlePollVote = () => {
    if (!pollVoted) setPollVoted(true);
  };

  // 📰 Tech Feed demo data
  const demoFeeds = [
    {
      title: "AI Revolutionizes Healthcare Diagnostics",
      topic: "AI & Health",
      time: "2h ago",
      source: "TechCrunch",
      image:
        "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1000&q=80",
      description:
        "AI improves diagnostic accuracy and patient outcomes through predictive analytics and deep learning.",
    },
    {
      title: "Neural Chips Power Edge AI",
      topic: "AI Hardware",
      time: "5h ago",
      source: "NVIDIA",
      image:
        "https://images.unsplash.com/photo-1581092334504-9e31f0b37a4e?auto=format&fit=crop&w=1000&q=80",
      description:
        "Low-power neural chips are redefining the edge AI experience for IoT and embedded systems.",
    },
    {
      title: "AI Ethics Debate Heats Up Globally",
      topic: "AI Policy",
      time: "1d ago",
      source: "MIT Tech Review",
      image:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1000&q=80",
      description:
        "Experts discuss transparency, bias, and global frameworks to ensure responsible AI development.",
    },
  ];

  const sources = [
    {
      name: "TechCrunch",
      logo: "https://www.oii.ox.ac.uk/wp-content/uploads/2023/08/986342-scaled.webp",
      link: "https://techcrunch.com",
      desc: "Breaking tech and startup news from Silicon Valley.",
    },
    {
      name: "CoinDesk",
      logo: "https://th.bing.com/th/id/OIP.EH5bPOmNgmmuIUoIa1wd9wHaFj?w=242&h=180&c=7&r=0&o=7&pid=1.7",
      link: "https://www.coindesk.com",
      desc: "Blockchain and crypto analysis.",
    },
    {
      name: "MIT Tech Review",
      logo: "https://th.bing.com/th?q=MIT+Logo+Transparent+PNG&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock",
      link: "https://www.technologyreview.com",
      desc: "In-depth research and tech innovation stories.",
    },
    {
      name: "arXiv",
      logo: "https://tse2.mm.bing.net/th/id/OIP.MDRJQ-QkTqZYDXAOw4Q59QHaEK?w=960&h=540&rs=1&pid=ImgDetMain",
      link: "https://arxiv.org",
      desc: "Open-access research papers in AI, ML, and CS.",
    },
    {
      name: "HackerNews",
      logo: "https://th.bing.com/th/id/OIP.EH5bPOmNgmmuIUoIa1wd9wHaFj?w=242&h=180&c=7&r=0&o=7&pid=1.7",
      link: "https://news.ycombinator.com",
      desc: "Tech community-driven discussions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3E5D8] text-[#4a3c28] px-4 md:px-8 py-10">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#3b2f20]">
        🔍 Insight Feed
      </h1>

      {/* Quiz Section */}
      <section className="bg-[#f8f1e4] border border-[#e5d3b3] rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-semibold mb-3">🏆 Quiz of the Day</h2>
        <p className="text-[#4a3c28b3] mb-4">
          Which company released the world’s first AI-powered GPU architecture?
        </p>
        <div className="flex gap-3 flex-wrap">
          {["Intel", "AMD", "NVIDIA", "IBM"].map((opt) => (
            <button
              key={opt}
              onClick={handleQuizAnswer}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                quizAnswered && opt === "NVIDIA"
                  ? "bg-green-200 text-green-800"
                  : "bg-[#e5d3b3] hover:bg-[#d6be9a]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {quizAnswered && (
          <p className="mt-3 text-sm text-green-700 font-medium">
            ✅ Correct! NVIDIA introduced CUDA and AI GPUs.
          </p>
        )}
      </section>

      {/* Expert Corner */}
      <section className="bg-[#fffaf3] border border-[#e5d3b3] rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="text-[#b89f8a]" /> Expert Corner
        </h2>
        <blockquote className="italic text-[#3b2f20] border-l-4 border-[#d6be9a] pl-4 mb-2">
          “AI is not replacing humans — it’s augmenting what we can achieve.”
        </blockquote>
        <p className="text-sm text-[#4a3c28b3]">
          — Andrew Ng, Founder of DeepLearning.AI
        </p>
      </section>

      {/* AI Summary */}
      <section className="bg-[#f8e9d2] border border-[#e5d3b3] rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="text-[#b89f8a]" /> AI Insight Summary
        </h2>
        <p className="text-sm text-[#4a3c28b3]">
          🤖 AI has dominated tech research this week, focusing on efficient
          transformer architectures, generative design, and AI safety frameworks.
        </p>
      </section>

      {/* Sources */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-[#3b2f20]">
          🔗 Top Sources
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((src) => (
            <a
              href={src.link}
              key={src.name}
              target="_blank"
              rel="noreferrer"
              className="bg-[#fffaf3] border border-[#e5d3b3] rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition"
            >
              <img
                src={src.logo}
                alt={src.name}
                className="w-12 h-12 object-contain rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-[#3b2f20]">{src.name}</h3>
                <p className="text-sm text-[#4a3c28b3]">{src.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Feed Cards */}
      <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {demoFeeds.map((feed, index) => (
          <FeedCard key={index} {...feed} />
        ))}
      </div>

      {/* Poll */}
      <section className="bg-[#fffaf3] border border-[#e5d3b3] rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-3">🗳️ Poll of the Week</h2>
        <p className="mb-4 text-[#4a3c28b3]">
          Do you trust AI-generated news summaries?
        </p>
        <div className="flex gap-3 flex-wrap">
          {["Yes", "No", "Maybe"].map((opt) => (
            <button
              key={opt}
              onClick={handlePollVote}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                pollVoted
                  ? "bg-green-100 text-green-700"
                  : "bg-[#e5d3b3] hover:bg-[#d6be9a]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {pollVoted && (
          <p className="mt-3 text-sm text-green-700 font-medium">
            ✅ Thanks for voting! You earned +10 XP.
          </p>
        )}
      </section>

      {/* Leaderboard */}
      <section className="bg-[#f8e9d2] border border-[#e5d3b3] rounded-2xl p-6 mb-10 text-center">
        <h2 className="text-xl font-semibold mb-2 flex justify-center items-center gap-2">
          <BarChart2 className="text-[#b89f8a]" /> Your Progress
        </h2>
        <p className="text-sm text-[#4a3c28b3] mb-1">
          XP: <span className="font-bold text-[#3b2f20]">{xp}</span>
        </p>
        <p className="text-sm text-[#4a3c28b3]">
          Daily Streak: <span className="font-bold text-[#3b2f20]">{streak} 🔥</span>
        </p>
      </section>

      {/* Tech Digest */}
      <section className="bg-[#fffaf3] border border-[#e5d3b3] rounded-2xl p-6 text-center">
        <h2 className="text-xl font-semibold mb-3">🗂️ Weekly Tech Digest</h2>
        <p className="text-sm text-[#4a3c28b3] mb-4">
          Explore the best stories and research highlights from this week.
        </p>
        <button className="bg-[#C6B29A] hover:bg-[#B89F8A] text-[#3b2f20] font-semibold px-6 py-2 rounded-full shadow-sm transition">
          View Archive
        </button>
      </section>
    </div>
  );
};

export default Feed;
