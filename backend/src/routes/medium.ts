import express from 'express';
import { MediumRssService } from '../services/mediumRss';
import { supabase } from '../services/supabase';

const router = express.Router();
const mediumService = new MediumRssService();

// Get articles by tag with optional hours filter
router.get('/articles/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const hoursOld = parseInt(req.query.hoursOld as string) || 0;

    const articles = await mediumService.fetchArticlesByTag(tag, limit, hoursOld);
    
    res.json({
      tag,
      hoursOld,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error('Error fetching Medium articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get all latest articles with optional hours filter
router.get('/latest', async (req, res) => {
  try {
    const hoursOld = parseInt(req.query.hoursOld as string) || 0;
    const articles = await mediumService.fetchAllTags(hoursOld);
    
    res.json({
      hoursOld,
      count: articles.length,
      articles: articles.slice(0, 50)
    });
  } catch (error) {
    console.error('Error fetching latest Medium articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

export default router;
