import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ChevronDown, ChevronRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [contentMode, setContentMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Check if user already completed onboarding
  useEffect(() => {
    async function checkOnboardingStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate('/home');
          return;
        }
      }
      
      setCheckingStatus(false);
    }

    checkOnboardingStatus();
  }, [navigate]);

  // Interest categories tailored by mode
  const interestsByMode = {
    researcher: {
      "Computer Science": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Natural Language Processing",
        "Reinforcement Learning",
        "Algorithms & Data Structures",
        "Distributed Systems",
        "Quantum Computing"
      ],
      "Physics & Mathematics": [
        "Quantum Physics",
        "Theoretical Physics",
        "Applied Mathematics",
        "Statistical Mechanics",
        "Topology",
        "Number Theory"
      ],
      "Biology & Medicine": [
        "Genomics",
        "Neuroscience",
        "Bioinformatics",
        "Drug Discovery",
        "Synthetic Biology",
        "Immunology"
      ],
      "Engineering": [
        "Robotics",
        "Materials Science",
        "Nanotechnology",
        "Aerospace Engineering",
        "Chemical Engineering",
        "Electrical Engineering"
      ],
      "Social Sciences": [
        "Economics",
        "Psychology Research",
        "Sociology",
        "Political Science",
        "Behavioral Science"
      ]
    },
    hobbyist: {
      "Web Development": [
        "React",
        "Vue.js",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Node.js",
        "GraphQL",
        "Full Stack"
      ],
      "Mobile Development": [
        "React Native",
        "Flutter",
        "iOS Development",
        "Android Development",
        "SwiftUI",
        "Kotlin"
      ],
      "Backend & DevOps": [
        "Python",
        "Go",
        "Rust",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "AWS",
        "Microservices"
      ],
      "Data & AI": [
        "Data Science",
        "Machine Learning",
        "PyTorch",
        "TensorFlow",
        "Data Visualization",
        "SQL"
      ],
      "Design & Creative": [
        "UI/UX Design",
        "Figma",
        "3D Modeling",
        "Animation",
        "Creative Coding",
        "Web Design"
      ],
      "Other Tech": [
        "Game Development",
        "IoT",
        "Blockchain Development",
        "Open Source",
        "Linux",
        "Cybersecurity"
      ]
    },
    trend_watcher: {
      "AI & Tech": [
        "Artificial Intelligence",
        "ChatGPT & LLMs",
        "AI Ethics",
        "AI Startups",
        "Tech Acquisitions",
        "Big Tech News"
      ],
      "Crypto & Web3": [
        "Bitcoin",
        "Ethereum",
        "DeFi",
        "NFTs",
        "Blockchain",
        "Crypto Regulations"
      ],
      "Startups & Business": [
        "Startup Funding",
        "Y Combinator",
        "Tech IPOs",
        "Unicorn Startups",
        "Venture Capital",
        "Tech Layoffs"
      ],
      "Industry Trends": [
        "Cloud Computing",
        "5G Technology",
        "Electric Vehicles",
        "Space Tech",
        "Quantum Computing",
        "Metaverse"
      ],
      "Policy & Society": [
        "Tech Regulations",
        "Privacy Laws",
        "Antitrust",
        "Climate Tech",
        "Digital Rights",
        "AI Governance"
      ],
      "Consumer Tech": [
        "Smartphones",
        "Wearables",
        "Gaming Consoles",
        "Smart Home",
        "VR/AR",
        "Tech Reviews"
      ]
    }
  };

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('users')
        .update({
          content_mode: contentMode,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const interestsToInsert = selectedInterests.map(interest => ({
        user_id: user.id,
        interest_name: interest
      }));

      const { error: interestsError } = await supabase
        .from('user_interests')
        .insert(interestsToInsert);

      if (interestsError) throw interestsError;

      navigate('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center">
        <div className="text-xl text-[#352414]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Step 1: Select Content Mode */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-[#3A2E22] mb-4">
              Choose your content mode
            </h2>
            <p className="text-[#5C4633] mb-6">
              This determines what type of content you'll see
            </p>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => setContentMode("researcher")}
                className={`w-full p-5 rounded-lg border-2 text-left transition ${
                  contentMode === "researcher"
                    ? "border-[#8B5E3C] bg-[#F3E5D8]"
                    : "border-[#C6B29A] hover:border-[#8B5E3C]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">📚</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#3A2E22]">
                      Researcher Mode
                    </h3>
                    <p className="text-sm text-[#5C4633]">
                      Research papers, ArXiv, academic publications, scientific journals
                    </p>
                  </div>
                  {contentMode === "researcher" && (
                    <span className="text-[#8B5E3C]">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setContentMode("hobbyist")}
                className={`w-full p-5 rounded-lg border-2 text-left transition ${
                  contentMode === "hobbyist"
                    ? "border-[#8B5E3C] bg-[#F3E5D8]"
                    : "border-[#C6B29A] hover:border-[#8B5E3C]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">✍️</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#3A2E22]">
                      Hobbyist Mode
                    </h3>
                    <p className="text-sm text-[#5C4633]">
                      Blogs, tutorials, Medium articles, dev.to, hands-on guides
                    </p>
                  </div>
                  {contentMode === "hobbyist" && (
                    <span className="text-[#8B5E3C]">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setContentMode("trend_watcher")}
                className={`w-full p-5 rounded-lg border-2 text-left transition ${
                  contentMode === "trend_watcher"
                    ? "border-[#8B5E3C] bg-[#F3E5D8]"
                    : "border-[#C6B29A] hover:border-[#8B5E3C]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">📰</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#3A2E22]">
                      Trend Watcher Mode
                    </h3>
                    <p className="text-sm text-[#5C4633]">
                      Tech news, TechCrunch, The Verge, Wired, industry trends
                    </p>
                  </div>
                  {contentMode === "trend_watcher" && (
                    <span className="text-[#8B5E3C]">✓</span>
                  )}
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!contentMode}
              className="w-full py-3 bg-[#8B5E3C] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6E472F]"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Interests with Categories */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-[#3A2E22] mb-4">
              What are you interested in?
            </h2>
            <p className="text-[#5C4633] mb-6">
              Select at least 3 topics to personalize your feed
            </p>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {Object.entries(interestsByMode[contentMode] || {}).map(([category, interests]) => (
                <div key={category} className="border border-[#C6B29A] rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 flex items-center justify-between bg-[#F3E5D8] hover:bg-[#E7D0C5] transition"
                  >
                    <span className="font-semibold text-[#3A2E22]">{category}</span>
                    {expandedCategories.includes(category) ? (
                      <ChevronDown className="w-5 h-5 text-[#5C4633]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#5C4633]" />
                    )}
                  </button>

                  {/* Category Content */}
                  {expandedCategories.includes(category) && (
                    <div className="p-4 flex flex-wrap gap-2 bg-white">
                      {interests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-2 rounded-full border-2 transition text-sm ${
                            selectedInterests.includes(interest)
                              ? "bg-[#8B5E3C] text-white border-[#8B5E3C]"
                              : "bg-white text-[#3A2E22] border-[#C6B29A] hover:border-[#8B5E3C]"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedInterests([]);
                  setExpandedCategories([]);
                }}
                className="flex-1 py-3 border-2 border-[#C6B29A] text-[#3A2E22] rounded-lg font-semibold hover:bg-[#F3E5D8]"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={selectedInterests.length < 3 || loading}
                className="flex-1 py-3 bg-[#8B5E3C] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6E472F]"
              >
                {loading ? "Saving..." : `Complete (${selectedInterests.length}/3 minimum)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
