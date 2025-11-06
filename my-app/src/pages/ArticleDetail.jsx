import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  ExternalLink,
  Clock,
  User,
  Tag,
  MessageCircle,
  Send,
  Loader
} from 'lucide-react';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // FAQ Chatbot states
  const [faqMessages, setFaqMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! 👋 I\'m your article assistant. Ask me any questions about this article and I\'ll help you understand it better!'
    }
  ]);
  const [faqInput, setFaqInput] = useState('');
  const [faqLoading, setFaqLoading] = useState(false);

  useEffect(() => {
    // Get article from sessionStorage (passed from list)
    const stored = sessionStorage.getItem(`article-${id}`);
    if (stored) {
      try {
        setArticle(JSON.parse(stored));
        setLoading(false);
      } catch (error) {
        console.error('Error parsing article:', error);
        setLoading(false);
      }
    }
  }, [id]);

  const askFaq = async () => {
    if (!faqInput.trim()) return;

    try {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: faqInput
      };
      setFaqMessages(prev => [...prev, userMessage]);
      setFaqInput('');
      setFaqLoading(true);

      // Use description/content for the AI to analyze
      const contentToAnalyze = article.content || article.description || article.text_summary || '';

      const response = await fetch('http://localhost:3000/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: faqInput,
          paperContent: contentToAnalyze,
          paperTitle: article.title,
          authors: article.author || article.authors_list?.join(', ') || 'Unknown'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.answer
      };
      setFaqMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('FAQ error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I couldn\'t process your question. Please try again.',
        isError: true
      };
      setFaqMessages(prev => [...prev, errorMessage]);
    } finally {
      setFaqLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4"></div>
          <p className="text-[#4a3c28]">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E5D8]">
      {/* Header */}
      <div className="bg-[#E7D0C5] border-b border-[#D8C7B6] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#4a3c28] hover:text-[#3b2f20] transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden md:inline">Back</span>
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setUpvoted(!upvoted)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full transition ${
                  upvoted 
                    ? 'bg-[#6b8cff] text-white' 
                    : 'bg-white text-[#4a3c28] hover:bg-[#f8f1e4]'
                }`}
                title="Upvote"
              >
                <ThumbsUp size={18} />
              </button>

              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full transition ${
                  saved 
                    ? 'bg-[#d18b2a] text-white' 
                    : 'bg-white text-[#4a3c28] hover:bg-[#f8f1e4]'
                }`}
                title="Save"
              >
                <Bookmark size={18} />
              </button>

              <a
                href={article.url || article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#C6B29A] hover:bg-[#B89F8A] text-white px-3 md:px-4 py-2 rounded-full transition"
              >
                <ExternalLink size={18} />
                <span className="hidden md:inline">Read Original</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {article.thumbnail && (
              <img 
                src={article.thumbnail} 
                alt={article.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#3b2f20] mb-4 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[#4a3c28b3] text-sm mb-6 pb-6 border-b border-[#e5d3b3]">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="font-medium">{article.author || article.authors_list?.[0] || 'Unknown'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatDate(article.pubDate || article.publication_date || new Date().toISOString())}</span>
                </div>

                {article.categories && article.categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    <span>{article.categories[0]}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(article.categories || article.tags || []).map((cat) => (
                  <span
                    key={cat}
                    className="bg-[#f0e6d8] px-3 py-1 rounded-full text-xs md:text-sm text-[#765a3f]"
                  >
                    #{cat.toLowerCase().replace(/\s+/g, '')}
                  </span>
                ))}
              </div>

              {/* Article Content */}
              <div className="prose prose-sm md:prose max-w-none">
                <div
                  className="text-[#4a3c28] leading-relaxed text-base whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: (article.content || article.description || '')
                      .substring(0, 5000)
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  }}
                />
              </div>

              {(article.content?.length || 0) > 5000 && (
                <div className="mt-6 p-4 bg-[#f8f1e4] border border-[#e5d3b3] rounded-lg text-center">
                  <p className="text-sm text-[#4a3c28b3] mb-3">
                    This is a preview. Read the full article on the original site.
                  </p>
                  <a
                    href={article.url || article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#C6B29A] hover:bg-[#B89F8A] text-white px-6 py-2 rounded-lg transition font-medium"
                  >
                    <ExternalLink size={16} />
                    Read Full Article
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Q&A */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[800px] sticky top-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#d18b2a] to-[#c17a1f] p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={20} />
                <h3 className="font-bold text-lg">Article Q&A</h3>
              </div>
              <p className="text-xs text-orange-100">Ask about this article</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f1e4]">
              {faqMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-[#C6B29A] text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-red-100 text-red-700 rounded-bl-none'
                        : 'bg-white text-[#4a3c28] border border-[#e5d3b3] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {faqLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-[#4a3c28] border border-[#e5d3b3] px-4 py-2 rounded-lg rounded-bl-none text-sm">
                    <Loader size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[#e5d3b3] p-4 bg-white space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={faqInput}
                  onChange={(e) => setFaqInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askFaq()}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border border-[#e5d3b3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6B29A]"
                  disabled={faqLoading}
                />
                <button
                  onClick={askFaq}
                  disabled={faqLoading || !faqInput.trim()}
                  className="bg-[#d18b2a] hover:bg-[#c17a1f] disabled:bg-gray-300 text-white p-2 rounded-lg transition"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-[#4a3c28b3]">
                💡 Ask: summary, key insights, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
