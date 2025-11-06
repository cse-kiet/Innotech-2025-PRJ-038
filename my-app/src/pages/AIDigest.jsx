import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AIDigest = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user email from auth
      setUserEmail(user.email || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
      setStatus('error');
      setMessage('Failed to load user information');
    }
  };

  const handleSendDigest = async () => {
    if (!userEmail) {
      setStatus('error');
      setMessage('Email not found. Please update your profile.');
      return;
    }

    try {
      setSending(true);
      setStatus(null);
      setMessage('');

      // Call backend API to generate and send digest
      const response = await fetch('http://localhost:3000/api/ai/send-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          userId: (await supabase.auth.getUser()).data.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send digest');
      }

      const data = await response.json();

      setStatus('success');
      setMessage(`AI-generated digest sent successfully to ${userEmail}!`);
      console.log('Digest response:', data);
    } catch (error) {
      console.error('Error sending digest:', error);
      setStatus('error');
      setMessage('Failed to send digest. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4"></div>
          <p className="text-[#4a3c28]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E5D8] px-4 md:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3b2f20] mb-3">
            AI Digest
          </h1>
          <p className="text-[#4a3c28b3] text-lg">
            Get a personalized AI-generated digest of your saved content
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-[#e5d3b3]">
          {/* Illustration/Icon Area */}
          <div className="bg-gradient-to-r from-[#C6B29A] to-[#8B6F47] h-48 flex items-center justify-center">
            <Mail size={80} className="text-white opacity-30" />
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12">
            {/* How it Works */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-[#3b2f20] mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#d18b2a] text-white font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-[#3b2f20]">Click Send Digest</p>
                    <p className="text-sm text-[#4a3c28b3]">
                      Our AI analyzes your saved papers, articles, and interests
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#d18b2a] text-white font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-[#3b2f20]">AI Generation</p>
                    <p className="text-sm text-[#4a3c28b3]">
                      We generate a personalized summary tailored to your interests
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#d18b2a] text-white font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-[#3b2f20]">Email Delivery</p>
                    <p className="text-sm text-[#4a3c28b3]">
                      Receive the digest directly in your inbox for easy reading
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Email Display */}
            <div className="bg-[#f8f1e4] rounded-xl p-4 mb-8">
              <p className="text-sm text-[#4a3c28b3] mb-2">📬 Email Address</p>
              <p className="text-lg font-semibold text-[#3b2f20]">{userEmail}</p>
              <p className="text-xs text-[#4a3c28b3] mt-2">
                The digest will be sent to this email address
              </p>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-8 flex gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">{message}</p>
                  <p className="text-sm text-green-700 mt-1">
                    Check your email inbox (and spam folder) for the digest
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-8 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">{message}</p>
                </div>
              </div>
            )}

            {/* Features List */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-[#3b2f20] mb-4">What's Included</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-[#d18b2a] font-bold">✓</span>
                  <span className="text-[#4a3c28]">Summary of your saved research papers and articles</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d18b2a] font-bold">✓</span>
                  <span className="text-[#4a3c28]">AI-generated insights based on your interests</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d18b2a] font-bold">✓</span>
                  <span className="text-[#4a3c28]">Key takeaways and connections between topics</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d18b2a] font-bold">✓</span>
                  <span className="text-[#4a3c28]">Personalized recommendations for new content</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#d18b2a] font-bold">✓</span>
                  <span className="text-[#4a3c28]">Links to full articles for deeper reading</span>
                </li>
              </ul>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendDigest}
              disabled={sending}
              className="w-full bg-gradient-to-r from-[#d18b2a] to-[#c17a1f] hover:from-[#c17a1f] hover:to-[#b06918] disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg"
            >
              {sending ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Generating & Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send AI Digest to My Email
                </>
              )}
            </button>

            {/* Frequency Note */}
            <p className="text-center text-sm text-[#4a3c28b3] mt-6">
              💡 You can request a new digest once per day
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-[#e5d3b3]">
          <h3 className="text-2xl font-bold text-[#3b2f20] mb-6">FAQ</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-[#3b2f20] mb-2">How is the digest generated?</h4>
              <p className="text-[#4a3c28b3]">
                Our AI analyzes all your saved content (papers, articles, etc.), identifies key themes and insights, and generates a personalized summary that connects related topics and highlights important findings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#3b2f20] mb-2">How often can I request a digest?</h4>
              <p className="text-[#4a3c28b3]">
                You can request a new digest once per day. This helps us manage our AI resources efficiently while keeping your digest fresh and relevant.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#3b2f20] mb-2">What if I don't receive the email?</h4>
              <p className="text-[#4a3c28b3]">
                Check your spam or promotions folder first. If you still don't find it, try requesting the digest again. Make sure your email address is correct in your profile.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#3b2f20] mb-2">Can I customize the digest?</h4>
              <p className="text-[#4a3c28b3]">
                The digest is automatically tailored based on your interests and saved content. You can influence the digest by saving more content related to your preferred topics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDigest;
