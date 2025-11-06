import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Newspaper, ExternalLink, Calendar, User } from 'lucide-react';

const HobbyistMode = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('Technology');
  const [filteredArticles, setFilteredArticles] = useState([]);

  const tags = [
    'Technology', 'Programming', 'Web Development', 'Machine Learning',
    'Startup', 'Design', 'Business', 'Data Science'
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/medium/latest');
      const data = await response.json();
      setArticles(data.articles || []);
      setFilteredArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    const filtered = articles.filter(article =>
      article.categories?.includes(tag)
    );
    setFilteredArticles(filtered.length > 0 ? filtered : articles);
  };

  const handleArticleClick = (article) => {
    sessionStorage.setItem(`article-${article.id}`, JSON.stringify(article));
    navigate(`/article/${article.id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4"></div>
          <p className="text-[#4a3c28]">Loading Medium articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E5D8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B6F47] to-[#6B5335] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper size={32} />
            <h1 className="text-4xl md:text-5xl font-bold">Hobbyist Mode</h1>
          </div>
          <p className="text-orange-100">Discover interesting Medium articles</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tag Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#3b2f20] mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedTag === tag
                    ? 'bg-[#d18b2a] text-white'
                    : 'bg-white text-[#4a3c28] border border-[#e5d3b3] hover:border-[#d18b2a]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <article
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group"
            >
              {article.thumbnail && (
                <div className="relative h-40 overflow-hidden bg-gray-200">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-[#3b2f20] mb-2 line-clamp-2 group-hover:text-[#d18b2a]">
                  {article.title}
                </h3>

                <p className="text-sm text-[#4a3c28b3] mb-3 line-clamp-2">
                  {article.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#4a3c28b3] mb-3 pb-3 border-b border-[#e5d3b3]">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span className="truncate">{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(article.pubDate)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.categories?.slice(0, 2).map(cat => (
                    <span
                      key={cat}
                      className="text-xs bg-[#f0e6d8] px-2 py-1 rounded-full text-[#765a3f]"
                    >
                      #{cat.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>

                {/* Read More Link */}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 text-[#d18b2a] hover:text-[#c17a1f] font-medium text-sm transition"
                >
                  Read on Medium
                  <ExternalLink size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#4a3c28b3]">No articles found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HobbyistMode;