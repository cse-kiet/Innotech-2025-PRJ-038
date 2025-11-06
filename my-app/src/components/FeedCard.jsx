import React, { useState } from "react";
import {
  ThumbsUp,
  Share2,
  Bookmark,
  Sparkles,
  MessageCircle,
  Download,
} from "lucide-react";

/**
 * FeedCard component
 * - shows source logo (uses provided logos)
 * - image has onError fallback
 * - responsive buttons: icons only on small, icon+label on md+
 */

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=Image+Not+Available";

const FeedCard = ({
  title = "Untitled",
  topic = "General",
  time = "Now",
  source = "Source",
  sourceLogo,
  image,
  description = "",
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [saved, setSaved] = useState(false);

  // helper for image fallback
  const onImgError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <article className="bg-[#fffaf3] border border-[#e5d3b3] rounded-2xl overflow-hidden shadow-md transition hover:shadow-lg hover:-translate-y-1 duration-300">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8e9d2] text-sm text-[#4a3c28]">
        <div className="flex items-center gap-3">
          <img
            src={sourceLogo || FALLBACK_IMAGE}
            alt={`${source} logo`}
            onError={onImgError}
            className="w-10 h-10 object-cover rounded-full border"
          />
          <div>
            <p className="font-semibold text-[#3b2f20]">{source}</p>
            <p className="text-xs text-[#4a3c28b3]">{time}</p>
          </div>
        </div>
        <span className="text-xs font-medium bg-[#f8f1e4] px-2 py-1 rounded-full">
          {topic}
        </span>
      </div>

      {/* hero image */}
      <div className="w-full h-56 md:h-48 lg:h-44 overflow-hidden">
        <img
          src={image || FALLBACK_IMAGE}
          alt={title}
          onError={onImgError}
          className="w-full h-full object-cover"
        />
      </div>

      {/* content */}
      <div className="p-4 md:p-5">
        <h3 className="text-lg md:text-xl font-semibold text-[#3b2f20] mb-2 leading-snug">
          {title}
        </h3>

        <p className="text-sm md:text-base text-[#4a3c28b3] mb-3 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center gap-3 mb-3">
          {/* small tag list — can be hashtags or quick links */}
          <span className="text-xs bg-[#f0e6d8] px-2 py-1 rounded-full text-[#765a3f]">#research</span>
          <span className="text-xs bg-[#f0e6d8] px-2 py-1 rounded-full text-[#765a3f]">#ai</span>
          <span className="text-xs bg-[#f0e6d8] px-2 py-1 rounded-full text-[#765a3f]">#ml</span>
        </div>

        {/* AI summary toggle */}
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-2 bg-[#e5d3b3] hover:bg-[#d6be9a] text-[#3b2f20] px-3 py-1 rounded-full text-sm font-medium transition mb-3"
        >
          <Sparkles size={14} />
          <span className="hidden md:inline">{showSummary ? "Hide AI Summary" : "Show AI Summary"}</span>
          <span className="md:hidden">{showSummary ? "Hide" : "Summary"}</span>
        </button>

        {showSummary && (
          <div className="mt-2 p-3 bg-[#f8f1e4] border border-[#e5d3b3] rounded-lg text-sm text-[#3b2f20]">
            <strong>🤖 AI Summary:</strong> Quick synthesized summary for the article that highlights the key findings and implications for practitioners and researchers.
          </div>
        )}

        {/* action bar */}
        <div className="flex items-center justify-between mt-4 border-t border-[#e5d3b3] pt-3">
          <div className="flex gap-3 md:gap-6 items-center">
            <button
              onClick={() => setUpvoted(!upvoted)}
              className={`flex items-center gap-2 ${upvoted ? "text-[#6b8cff]" : "text-[#4a3c28b3]"}`}
              title="Upvote"
            >
              <ThumbsUp size={18} />
              <span className="hidden md:inline">{upvoted ? "Upvoted" : ""}</span>
            </button>

            <button className="flex items-center gap-2 text-[#4a3c28b3]" title="Thoughts / Comment">
              <MessageCircle size={18} />
              <span className="hidden md:inline"></span>
            </button>

            <button className="flex items-center gap-2 text-[#4a3c28b3]" title="Share">
              <Share2 size={18} />
              <span className="hidden md:inline"></span>
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 ${saved ? "text-[#d18b2a]" : "text-[#4a3c28b3]"}`}
              title="Save"
            >
              <Bookmark size={18} />
              <span className="hidden md:inline">{saved ? "Saved" : ""}</span>
            </button>

            <button className="flex items-center gap-2 text-[#4a3c28b3]" title="Download">
              <Download size={18} />
              <span className="hidden md:inline"></span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default FeedCard;
