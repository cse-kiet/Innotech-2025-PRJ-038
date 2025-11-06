// ⚠️ MUST be first - before any other imports!
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authMiddleware, AuthRequest } from './middleware/auth';
import { supabase } from './services/supabase';
import { PaperFetchJob } from './jobs/fetchPapers';
import { ContentParserJob } from './jobs/parseContent';
import pdfRouter from './routes/pdf';
import aiRouter from './routes/ai';
import mediumRouter from './routes/medium';
import { MediumFetchJob } from './jobs/fetchMedium';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - MUST be before routes
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

const paperFetchJob = new PaperFetchJob();
const contentParserJob = new ContentParserJob();
const mediumFetchJob = new MediumFetchJob();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    env: process.env.NODE_ENV || 'development'
  });
});

// Protected route example
app.post('/api/protected', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ message: 'Success', user: req.user });
});

// Fetch papers from ArXiv
app.post('/api/fetch-papers', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Paper fetch started in background' });
    console.log('🚀 Fetch triggered!');
    
    paperFetchJob.fetchPapersForAllInterests().catch(console.error);
  } catch (error) {
    console.error('❌ Error triggering paper fetch:', error);
    res.status(500).json({ error: 'Failed to start fetch' });
  }
});

// Parse PDFs and extract text
app.post('/api/parse-papers', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'PDF parsing started in background' });
    console.log('🚀 Parse triggered!');
    
    contentParserJob.parseUnparsedPapers().catch(console.error);
  } catch (error) {
    console.error('❌ Error triggering parse:', error);
    res.status(500).json({ error: 'Failed to start parsing' });
  }
});

// Parse ALL papers (batch mode)
app.post('/api/parse-all-papers', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Batch PDF parsing started in background' });
    console.log('🚀 Batch parse triggered!');
    
    contentParserJob.parseAllPapers().catch(console.error);
  } catch (error) {
    console.error('❌ Error triggering batch parse:', error);
    res.status(500).json({ error: 'Failed to start batch parsing' });
  }
});

// Parse specific paper
app.post('/api/parse-paper/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    res.json({ message: `Parsing paper ${id}` });
    
    contentParserJob.parsePaperById(id).catch(console.error);
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse paper' });
  }
});

// Get parsing status
app.get('/api/parse-status', async (req: Request, res: Response) => {
  try {
    const status = await contentParserJob.getParseStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Get detailed parsing status
app.get('/api/parse-details', async (req: Request, res: Response) => {
  try {
    const { data: unparsed } = await supabase
      .from('content')
      .select('id, title, arxiv_id')
      .eq('content_type', 'research_paper')
      .is('full_text', null)
      .limit(20);

    const { data: recent } = await supabase
      .from('content')
      .select('id, title, parsed_at')
      .eq('content_type', 'research_paper')
      .not('parsed_at', 'is', null)
      .order('parsed_at', { ascending: false })
      .limit(10);

    res.json({
      remaining: unparsed || [],
      recent_parsed: recent || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get details' });
  }
});

// Fetch Medium articles
app.post('/api/fetch-medium', async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Medium article fetch started in background' });
    console.log('🚀 Medium fetch triggered!');
    
    mediumFetchJob.fetchAndSaveMediumArticles().catch(console.error);
  } catch (error) {
    console.error('❌ Error triggering medium fetch:', error);
    res.status(500).json({ error: 'Failed to start fetch' });
  }
});

// API Routes
app.use('/api/pdf', pdfRouter);
app.use('/api/ai', aiRouter);
app.use('/api/medium', mediumRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    type: err.type || 'Unknown',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 ArXiv + PDF Parsing active`);
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`📧 Resend Email: ${process.env.RESEND_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log('='.repeat(50) + '\n');
});

export default app;
