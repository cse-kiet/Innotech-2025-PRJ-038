import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ThumbsUp,
  Share2,
  Bookmark,
  Sparkles,
  MessageCircle,
  Download,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { getFirstTagImage } from '../services/tagImageMapper';

const PaperCard = ({
  id,
  title,
  description,
  text_summary,
  authors_list,
  publication_date,
  tags,
  url,
  pdf_url,
  citations_count,
}) => {
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [saved, setSaved] = useState(false);
  const tagImage = getFirstTagImage(tags);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const primaryTag = tags && tags.length > 0 ? tags[0] : 'Research';
  const authors = authors_list && authors_list.length > 0 
    ? authors_list.slice(0, 2).join(', ') + (authors_list.length > 2 ? ` +${authors_list.length - 2}` : '')
    : 'Unknown';

  const handleCardClick = () => {
    navigate(`/paper/${id}`);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  return (
    <article 
      onClick={handleCardClick}
      className="bg-[#fffaf3] border border-[#e5d3b3] rounded-2xl overflow-hidden shadow-md transition hover:shadow-lg hover:-translate-y-1 duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8e9d2] text-sm text-[#4a3c28]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6B29A] to-[#8B6F47] flex items-center justify-center text-white font-bold text-lg">
            📄
          </div>
          <div>
            <p className="font-semibold text-[#3b2f20]">ArXiv</p>
            <p className="text-xs text-[#4a3c28b3]">{formatDate(publication_date)}</p>
          </div>
        </div>
        <span className="text-xs font-medium bg-[#f8f1e4] px-2 py-1 rounded-full">
          {primaryTag}
        </span>
      </div>

      {/* hero image from tag mapper */}
      <div className="relative w-full h-56 md:h-48 lg:h-44 overflow-hidden bg-gray-200 group-hover:scale-105 transition">
        <img 
          src={tagImage.image}
          alt={primaryTag}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* content */}
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl font-semibold text-[#3b2f20] mb-2 leading-snug line-clamp-2 hover:text-[#8B6F47] transition">
          {title}
        </h3>

        <p className="text-sm text-[#4a3c28b3] mb-2">
          <span className="font-medium">By:</span> {authors}
        </p>

        <p className="text-sm md:text-base text-[#4a3c28b3] mb-3 line-clamp-3 flex-1">
          {description || text_summary || 'Abstract not available'}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {tags && tags.slice(0, 3).map((tag) => {
            const img = getFirstTagImage([tag]);
            return (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: img.bgColor,
                  color: img.color
                }}
              >
                {tag.substring(0, 16)}
              </span>
            );
          })}
        </div>

        {/* AI summary toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSummary(!showSummary);
          }}
          className="flex items-center gap-2 bg-[#e5d3b3] hover:bg-[#d6be9a] text-[#3b2f20] px-3 py-1 rounded-full text-sm font-medium transition mb-3 w-fit"
        >
          <Sparkles size={14} />
          <span className="hidden md:inline">
            {showSummary ? 'Hide Summary' : 'Show Summary'}
          </span>
          <span className="md:hidden">{showSummary ? 'Hide' : 'Summary'}</span>
        </button>

        {showSummary && (
          <div className="mt-2 p-3 bg-[#f8f1e4] border border-[#e5d3b3] rounded-lg text-sm text-[#3b2f20] mb-3">
            <strong>📖 Abstract:</strong> {text_summary || description || 'Not available'}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-auto flex items-center justify-between text-xs text-[#4a3c28b3] mb-3">
          <span> {citations_count || 0} citations</span>
          <span>📄 Research Paper</span>
        </div>

        {/* action bar */}
        <div className="flex items-center justify-between border-t border-[#e5d3b3] pt-3">
          <div className="flex gap-3 md:gap-6 items-center">
            <button
              onClick={(e) => {
                handleActionClick(e);
                setUpvoted(!upvoted);
              }}
              className={`flex items-center gap-2 transition ${
                upvoted ? 'text-[#6b8cff]' : 'text-[#4a3c28b3] hover:text-[#3b2f20]'
              }`}
              title="Upvote"
            >
              <ThumbsUp size={18} />
              <span className="hidden md:inline text-xs">
                {upvoted ? 'Upvoted' : ''}
              </span>
            </button>

            <button
              onClick={handleActionClick}
              className="flex items-center gap-2 text-[#4a3c28b3] hover:text-[#3b2f20] transition"
              title="Comments"
            >
              <MessageCircle size={18} />
            </button>

            <button
              onClick={handleActionClick}
              className="flex items-center gap-2 text-[#4a3c28b3] hover:text-[#3b2f20] transition"
              title="Share"
            >
              <Share2 size={18} />
            </button>
          </div>

          <div className="flex gap-2 md:gap-3 items-center">
            {/* Read Full Paper Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/paper/${id}`);
              }}
              className="flex items-center gap-1 text-[#6b8cff] hover:text-[#5a7ae8] transition text-sm font-medium"
              title="Read Full Paper"
            >
              <BookOpen size={18} />
              <span className="hidden md:inline">Read</span>
            </button>

            <button
              onClick={(e) => {
                handleActionClick(e);
                setSaved(!saved);
              }}
              className={`flex items-center gap-2 transition ${
                saved ? 'text-[#d18b2a]' : 'text-[#4a3c28b3] hover:text-[#3b2f20]'
              }`}
              title="Save"
            >
              <Bookmark size={18} />
            </button>

            {pdf_url && (
              <a
                href={pdf_url}
                onClick={handleActionClick}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#4a3c28b3] hover:text-[#3b2f20] transition"
                title="Download PDF"
              >
                <Download size={18} />
              </a>
            )}

            {url && (
              <a
                href={url}
                onClick={handleActionClick}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#4a3c28b3] hover:text-[#3b2f20] transition"
                title="Open on ArXiv"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PaperCard;
