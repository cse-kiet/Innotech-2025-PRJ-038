import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Users, 
  Calendar,
  Tag,
  Bookmark,
  Share2,
  ThumbsUp,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  Send,
  MessageCircle,
  Loader
} from 'lucide-react';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('abstract');
  const [upvoted, setUpvoted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  
  // AI Summary states
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // FAQ Chatbot states
  const [faqMessages, setFaqMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! 👋 I\'m your research paper assistant. Ask me any questions about this paper and I\'ll help you understand it better!'
    }
  ]);
  const [faqInput, setFaqInput] = useState('');
  const [faqLoading, setFaqLoading] = useState(false);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchPaperDetails();
  }, [id]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setPaper(data);
    } catch (error) {
      console.error('Error fetching paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAiSummary = async () => {
    if (!paper?.full_text) {
      setSummaryError('No paper text available to summarize');
      return;
    }

    try {
      setSummaryLoading(true);
      setSummaryError('');
      setAiSummary('');

      const response = await fetch('http://localhost:3000/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullText: paper.full_text,
          systemPrompt: systemPrompt || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setAiSummary(data.summary);
      setShowPromptEditor(false);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'Failed to generate summary');
      console.error('Summary generation error:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const askFaq = async () => {
    if (!faqInput.trim()) return;

    try {
      // Add user message
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: faqInput
      };
      setFaqMessages(prev => [...prev, userMessage]);
      setFaqInput('');
      setFaqLoading(true);

      // Call AI to answer question about paper
      const response = await fetch('http://localhost:3000/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: faqInput,
          paperContent: paper.full_text || paper.description,
          paperTitle: paper.title,
          authors: paper.authors_list?.join(', ') || 'Unknown'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();

      // Add bot response
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProxiedPdfUrl = () => {
    if (!paper.arxiv_id) return paper.pdf_url;
    return `http://localhost:3000/api/pdf/proxy/${paper.arxiv_id}`;
  };

  const renderSummary = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('##')) {
        return (
          <h3 key={idx} className="text-xl font-bold text-[#3b2f20] mt-6 mb-3">
            {line.replace(/^##\s*/, '')}
          </h3>
        );
      }
      if (line.startsWith('-') || line.startsWith('•')) {
        return (
          <li key={idx} className="text-[#4a3c28] ml-6 mb-2">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      return (
        <p key={idx} className="text-[#4a3c28] mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4"></div>
          <p className="text-[#4a3c28]">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <p className="text-[#4a3c28] mb-4">Paper not found</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-[#C6B29A] hover:bg-[#B89F8A] text-white px-6 py-2 rounded-full"
          >
            Go Back Home
          </button>
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
                href={paper.pdf_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#C6B29A] hover:bg-[#B89F8A] text-white px-3 md:px-4 py-2 rounded-full transition"
              >
                <Download size={18} />
                <span className="hidden md:inline">Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Content - Main Paper Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Metadata */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-4xl font-bold text-[#3b2f20] mb-4 leading-tight">
              {paper.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[#4a3c28b3] text-sm md:text-base mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>
                  {paper.authors_list && paper.authors_list.length > 0
                    ? paper.authors_list.slice(0, 3).join(', ') +
                      (paper.authors_list.length > 3 ? ` +${paper.authors_list.length - 3}` : '')
                    : 'Unknown Authors'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(paper.publication_date)}</span>
              </div>

              {paper.citations_count > 0 && (
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>{paper.citations_count} citations</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {paper.tags && paper.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-[#f0e6d8] px-3 py-1 rounded-full text-xs md:text-sm text-[#765a3f]"
                >
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>

            {/* External Links */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#e5d3b3]">
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#4a3c28] hover:text-[#3b2f20] text-sm transition"
              >
                <ExternalLink size={16} />
                View on ArXiv
              </a>
              <button className="flex items-center gap-2 text-[#4a3c28] hover:text-[#3b2f20] text-sm transition">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex flex-wrap border-b border-[#e5d3b3] bg-[#f8f1e4]">
              <button
                onClick={() => setActiveTab('abstract')}
                className={`flex-1 min-w-[100px] px-4 py-4 font-semibold transition text-sm md:text-base ${
                  activeTab === 'abstract'
                    ? 'bg-white text-[#3b2f20] border-b-2 border-[#C6B29A]'
                    : 'text-[#4a3c28b3] hover:bg-white hover:bg-opacity-50'
                }`}
              >
                📋 Abstract
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex-1 min-w-[100px] px-4 py-4 font-semibold transition text-sm md:text-base ${
                  activeTab === 'pdf'
                    ? 'bg-white text-[#3b2f20] border-b-2 border-[#C6B29A]'
                    : 'text-[#4a3c28b3] hover:bg-white hover:bg-opacity-50'
                }`}
              >
                📄 PDF Viewer
              </button>

              {paper.full_text && (
                <button
                  onClick={() => setActiveTab('ai-summary')}
                  className={`flex-1 min-w-[100px] px-4 py-4 font-semibold transition text-sm md:text-base flex items-center justify-center gap-2 ${
                    activeTab === 'ai-summary'
                      ? 'bg-white text-[#3b2f20] border-b-2 border-[#C6B29A]'
                      : 'text-[#4a3c28b3] hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>AI Summary</span>
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="bg-white">
              {/* Abstract Tab */}
              {activeTab === 'abstract' && (
                <div className="p-6 md:p-8 min-h-[600px]">
                  <h2 className="text-2xl font-bold text-[#3b2f20] mb-6">Abstract</h2>
                  <p className="text-[#4a3c28] leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                    {paper.description || paper.text_summary || 'No abstract available'}
                  </p>
                </div>
              )}

              {/* PDF Viewer Tab */}
              {activeTab === 'pdf' && (
                <div className="relative bg-gray-100" style={{ height: '900px' }}>
                  {pdfError && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                        <p className="text-red-700 font-semibold mb-2">PDF Viewer Error</p>
                        <p className="text-red-600 text-sm mb-4">{pdfError}</p>
                        <a
                          href={paper.pdf_url}
                          download
                          className="inline-flex items-center gap-2 bg-[#C6B29A] hover:bg-[#B89F8A] text-white px-6 py-2 rounded-full transition font-medium"
                        >
                          <Download size={18} />
                          Download Instead
                        </a>
                      </div>
                    </div>
                  )}

                  {!pdfError && (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={getProxiedPdfUrl()}
                        plugins={[defaultLayoutPluginInstance]}
                        onError={(error) => {
                          console.error('PDF error:', error);
                          setPdfError(error.message || 'Failed to load PDF');
                        }}
                      />
                    </Worker>
                  )}
                </div>
              )}

              {/* AI Summary Tab */}
              {activeTab === 'ai-summary' && paper.full_text && (
                <div className="p-6 md:p-8 min-h-[600px]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#3b2f20] flex items-center gap-2">
                      <Sparkles size={28} className="text-[#d18b2a]" />
                      AI Summary
                    </h2>
                    
                    <button
                      onClick={() => setShowPromptEditor(!showPromptEditor)}
                      className="text-sm text-[#4a3c28] hover:text-[#3b2f20] underline"
                    >
                      {showPromptEditor ? 'Hide' : 'Custom'} Prompt
                    </button>
                  </div>

                  {/* Custom Prompt Editor */}
                  {showPromptEditor && (
                    <div className="mb-6 p-4 bg-[#f8f1e4] border border-[#e5d3b3] rounded-lg">
                      <label className="block text-sm font-semibold text-[#3b2f20] mb-2">
                        System Prompt (Optional)
                      </label>
                      <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Enter custom system prompt for summarization..."
                        className="w-full px-4 py-2 border border-[#e5d3b3] rounded-lg text-sm text-[#4a3c28] focus:outline-none focus:ring-2 focus:ring-[#C6B29A]"
                        rows={4}
                      />
                      <p className="text-xs text-[#4a3c28b3] mt-2">
                        Leave empty to use default summarization style
                      </p>
                    </div>
                  )}

                  {/* Summary Content */}
                  {aiSummary ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-[#4a3c28b3]">Generated by Gemini AI</p>
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-4 py-2 bg-[#f0e6d8] hover:bg-[#e5d3b3] text-[#3b2f20] rounded-lg transition text-sm"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-[#f8f1e4] border border-[#e5d3b3] rounded-lg p-6">
                        <ul className="space-y-0">
                          {renderSummary(aiSummary)}
                        </ul>
                      </div>

                      <button
                        onClick={generateAiSummary}
                        disabled={summaryLoading}
                        className="w-full bg-[#C6B29A] hover:bg-[#B89F8A] disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
                      >
                        {summaryLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Regenerate
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <button
                        onClick={generateAiSummary}
                        disabled={summaryLoading}
                        className="inline-flex items-center gap-2 bg-[#d18b2a] hover:bg-[#c17a1f] disabled:bg-gray-300 text-white px-8 py-3 rounded-lg transition font-semibold"
                      >
                        {summaryLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={20} />
                            Generate AI Summary
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {summaryError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                      <p className="font-semibold mb-2">Error</p>
                      <p className="text-sm">{summaryError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - FAQ Chatbot */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[800px] sticky top-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#d18b2a] to-[#c17a1f] p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={20} />
                <h3 className="font-bold text-lg">Paper Q&A</h3>
              </div>
              <p className="text-xs text-orange-100">Ask questions about this paper</p>
            </div>

            {/* Messages Container */}
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
                  placeholder="Ask about this paper..."
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
                💡 Ask: methodology, findings, implications, limitations, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;