import express from 'express';

const router = express.Router();

// Proxy PDF endpoint
router.get('/proxy/:arxivId', async (req, res) => {
  try {
    const { arxivId } = req.params;
    
    // Construct ArXiv PDF URL
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    
    console.log(`🔄 Proxying PDF: ${pdfUrl}`);
    
    // Fetch from ArXiv
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`ArXiv returned ${response.status}`);
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Stream the PDF
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('PDF proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy PDF' });
  }
});

export default router;