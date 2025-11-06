import Parser from 'rss-parser';
import axios from 'axios';

const parser = new Parser();

export interface MediumArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  author: string;
  description: string;
  content: string;
  categories: string[];
  thumbnail?: string;
  quality_score?: number;
}

export class MediumRssService {
  private feedUrls = {
    'Technology': 'https://medium.com/feed/tag/technology',
    'Programming': 'https://medium.com/feed/tag/programming',
    'Web Development': 'https://medium.com/feed/tag/web-development',
    'Machine Learning': 'https://medium.com/feed/tag/machine-learning',
    'Startup': 'https://medium.com/feed/tag/startup',
    'Design': 'https://medium.com/feed/tag/design',
    'Business': 'https://medium.com/feed/tag/business',
    'Data Science': 'https://medium.com/feed/tag/data-science',
  };

  // Spam detection keywords
  private spamKeywords = [
    'شماره', // Persian numbers
    'خاله', // Persian
    'click here', 'tap here',
    'buy now', 'order now',
    'free money', 'easy money',
    'call now', 'dm me',
    'contact', 'whatsapp',
    'discount code', 'promo code',
    'limited offer',
    'crypto', 'bitcoin', 'nft', // Usually spam
    'forex', 'trading bot',
  ];

  private isSpam(article: MediumArticle): boolean {
    const text = `${article.title} ${article.description} ${article.author}`.toLowerCase();
    
    // Check for spam keywords
    for (const keyword of this.spamKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        console.log(`🚨 Spam detected (${keyword}): ${article.title}`);
        return true;
      }
    }

    // Check for very short titles/descriptions (likely spam)
    if (article.title.length < 10 || article.description.length < 20) {
      console.log(`🚨 Spam detected (too short): ${article.title}`);
      return true;
    }

    // Check for repeated characters (spam pattern)
    if (/(.)\1{5,}/.test(article.title)) {
      console.log(`🚨 Spam detected (repeated chars): ${article.title}`);
      return true;
    }

    // Check for all caps (likely spam)
    if (article.title === article.title.toUpperCase() && article.title.length > 20) {
      console.log(`🚨 Spam detected (all caps): ${article.title}`);
      return true;
    }

    return false;
  }

  private calculateQualityScore(article: MediumArticle): number {
    let score = 100;

    // Penalize short content
    if (article.description.length < 50) score -= 20;
    if (article.content.length < 100) score -= 20;

    // Reward longer, detailed content
    if (article.description.length > 200) score += 10;
    if (article.content.length > 500) score += 15;

    // Penalize missing author info
    if (article.author === 'Unknown') score -= 10;

    // Reward articles with thumbnails (usually higher quality)
    if (article.thumbnail) score += 5;

    return Math.max(0, score);
  }

  async fetchArticlesByTag(tag: string, limit: number = 10, hoursOld: number = 0): Promise<MediumArticle[]> {
    try {
      const feedUrl = this.feedUrls[tag as keyof typeof this.feedUrls] || 
                      `https://medium.com/feed/tag/${tag.toLowerCase()}`;
      
      console.log(`📰 Fetching Medium articles for tag: ${tag} (${hoursOld} hours old)`);
      
      const feed = await parser.parseURL(feedUrl);
      
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - hoursOld * 60 * 60 * 1000);

      let articles: MediumArticle[] = (feed.items || [])
        .map((item, idx) => ({
          id: item.guid || `medium-${Date.now()}-${idx}`,
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          author: item.creator || item.author || 'Unknown',
          description: item.contentSnippet || item.summary || '',
          content: item.content || item.description || '',
          categories: item.categories || [tag],
          thumbnail: this.extractThumbnail(item.content || item.description || '')
        }))
        // Filter by time
        .filter(article => {
          const articleTime = new Date(article.pubDate);
          return articleTime >= cutoffTime;
        })
        // Filter spam
        .filter(article => !this.isSpam(article))
        // Add quality score
        .map(article => ({
          ...article,
          quality_score: this.calculateQualityScore(article)
        }))
        // Sort by quality
        .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
        // Limit results
        .slice(0, limit);

      console.log(`✅ Fetched ${articles.length} quality articles from ${tag} (filtered ${(feed.items || []).length - articles.length} spam)`);
      return articles;

    } catch (error) {
      console.error(`❌ Error fetching Medium RSS for ${tag}:`, error);
      return [];
    }
  }

  private extractThumbnail(html: string): string | undefined {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = html.match(imgRegex);
    return match ? match[1] : undefined;
  }

  async fetchAllTags(hoursOld: number = 0): Promise<MediumArticle[]> {
    const allArticles: MediumArticle[] = [];
    
    for (const [tag] of Object.entries(this.feedUrls)) {
      const articles = await this.fetchArticlesByTag(tag, 5, hoursOld);
      allArticles.push(...articles);
    }
    
    return allArticles.sort((a, b) => 
      (b.quality_score || 0) - (a.quality_score || 0)
    );
  }
}
