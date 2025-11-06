import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';
import { supabase } from '../services/supabase';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

interface SummarizeRequest {
  fullText: string;
  systemPrompt?: string;
}

// Summarize paper with Gemini
router.post('/summarize', async (req, res) => {
  try {
    const { fullText, systemPrompt } = req.body as SummarizeRequest;

    if (!fullText || fullText.trim().length === 0) {
      return res.status(400).json({ error: 'Full text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found');
      return res.status(500).json({ 
        error: 'Gemini API key not configured'
      });
    }

    console.log('✅ GEMINI_API_KEY found, initializing...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const defaultPrompt = `You are an expert research paper analyzer. Provide a clear, well-structured summary of the research paper below.

Format the response EXACTLY as follows (use these exact section headers):

## Executive Summary
[1-2 sentences capturing the main contribution]

## Research Question & Objectives
[What problem does this paper solve? What are the main goals?]

## Methodology
[Bullet points of key methods, frameworks, or approaches used]
- Point 1
- Point 2
- Point 3

## Key Findings & Results
[Main results and achievements - bullet points]
- Finding 1
- Finding 2
- Finding 3

## Implications & Significance
[Why does this matter? What are the practical applications?]

## Limitations & Future Work
[Any acknowledged limitations or areas for further research]

Keep language clear and accessible. Avoid overly technical jargon. Be concise but informative.`;

    const prompt = `${systemPrompt || defaultPrompt}

---

PAPER CONTENT:
${fullText.substring(0, 15000)}`;

    console.log('🤖 Calling Gemini 2.0 Flash API for summarization...');

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log('✅ Gemini summary generated successfully');

    res.json({ 
      summary,
      model: 'gemini-2.0-flash',
      tokens: result.response.usageMetadata
    });

  } catch (error) {
    console.error('❌ AI summarization error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate summary',
      type: error instanceof Error ? error.name : 'Unknown'
    });
  }
});

// Answer questions about paper
router.post('/ask', async (req, res) => {
  try {
    const { question, paperContent, paperTitle, authors } = req.body;

    if (!question || !paperContent) {
      return res.status(400).json({ error: 'Question and paper content required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert research assistant. Answer the following question about this research paper based on its content.

Paper Title: ${paperTitle}
Authors: ${authors}

Question: ${question}

Paper Content (first 10000 chars):
${paperContent.substring(0, 10000)}

Provide a clear, concise answer in 2-3 sentences. If the answer isn't in the paper, say so and ask them to check the full paper.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });

  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to answer question'
    });
  }
});

// Send AI Digest Email
router.post('/send-digest', async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ error: 'Email and userId required' });
    }

    console.log(`📧 Generating AI digest for ${email}...`);

    // Fetch user's saved content
    const { data: savedContent, error: fetchError } = await supabase
      .from('content')
      .select('title, description, tags, url')
      .limit(20);

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      throw fetchError;
    }

    if (!savedContent || savedContent.length === 0) {
      return res.status(400).json({ 
        error: 'No saved content found. Save some papers first!'
      });
    }

    // Format content for AI processing
    const contentSummary = savedContent
      .map((item, idx) => `${idx + 1}. Title: ${item.title}\n   Tags: ${item.tags?.join(', ')}\n   URL: ${item.url}`)
      .join('\n\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Generate digest with Gemini
    const digestPrompt = `You are an AI assistant helping users digest research papers and articles. Generate a comprehensive email digest.

User's saved content (${savedContent.length} items):
${contentSummary}

Please generate an engaging digest that:
1. Summarizes the key themes across these papers/articles
2. Identifies important connections and insights
3. Highlights the most significant findings (3-5 key points)
4. Provides 2-3 actionable recommendations for further reading
5. Uses clear, accessible language suitable for email

Format as plain text with clear sections. Include:
- Key themes section
- Top insights (numbered list)
- Recommendations
- A closing

Keep it to about 800-1000 words. Make it engaging but professional.`;

    console.log('🤖 Generating digest with Gemini...');

    const result = await model.generateContent(digestPrompt);
    const digestText = result.response.text();

    console.log(`✅ Digest generated successfully (${digestText.length} chars)`);

    // Create HTML email
    const digestHtml = `
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(to right, #d18b2a, #c17a1f); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; background: #f9f6f3; }
    .footer { padding: 20px; background: #f0f0f0; text-align: center; font-size: 12px; color: #666; }
    a { color: #d18b2a; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your INSIGHTS AI Digest</h1>
      <p>Personalized insights from your saved content</p>
    </div>
    
    <div class="content">
      <p>Hello,</p>
      <p>Here's your personalized AI-generated digest from <strong>${savedContent.length} saved items</strong>:</p>
      
      <div style="white-space: pre-wrap; background: white; padding: 20px; border-left: 4px solid #d18b2a; margin: 20px 0;">
${digestText}
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 2px solid #e5d3b3;">
      
      <p><strong>Continue Exploring:</strong></p>
      <ul>
        <li>Save more papers related to your interests</li>
        <li>Request a new digest tomorrow for fresh insights</li>
        <li>Visit <a href="http://localhost:5173/home">INSIGHTS Dashboard</a> to manage your content</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>This digest was automatically generated by INSIGHTS AI.</p>
      <p>Next digest available: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      <p><a href="http://localhost:5173/home">View on INSIGHTS →</a></p>
      <p style="margin-top: 10px; color: #999;">© 2025 INSIGHTS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY not configured, skipping email send');
      return res.json({
        success: true,
        message: 'Digest generated (email not sent - API not configured)',
        email,
        itemsIncluded: savedContent.length,
        preview: digestText.substring(0, 200)
      });
    }

    // Send email with Resend
    console.log(`📬 Sending digest email to ${email}...`);

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@insights.com',
      to: email,
      subject: `Your INSIGHTS AI Digest - ${new Date().toLocaleDateString()}`,
      html: digestHtml,
    });

    if (emailResponse.error) {
      console.error('❌ Email send error:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log(`✅ Email sent successfully! ID: ${emailResponse.data?.id}`);

    res.json({
      success: true,
      message: 'Digest sent successfully to your email',
      email,
      itemsIncluded: savedContent.length,
      emailId: emailResponse.data?.id,
      preview: digestText.substring(0, 300)
    });

  } catch (error) {
    console.error('❌ Error sending digest:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send digest',
      type: error instanceof Error ? error.name : 'Unknown'
    });
  }
});

export default router;
