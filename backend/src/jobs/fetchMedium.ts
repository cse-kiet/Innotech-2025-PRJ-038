import { MediumRssService } from '../services/mediumRss';
import { supabase } from '../services/supabase';

const mediumService = new MediumRssService();

export class MediumFetchJob {
  async fetchAndSaveMediumArticles(hoursOld: number = 2) {
    try {
      console.log(`🚀 Starting Medium article fetch (${hoursOld} hours old)...`);
      
      const articles = await mediumService.fetchAllTags(hoursOld);
      
      console.log(`📰 Fetched ${articles.length} articles total`);

      if (articles.length === 0) {
        console.log('⚠️  No articles found');
        return;
      }

      // Prepare articles for insertion
      const articlesToInsert = articles.map(article => ({
        content_type: 'hobby_article',
        title: article.title,
        url: article.link,
        description: article.description,
        authors_list: [article.author],
        tags: article.categories || [],
        scraped_at: new Date().toISOString()
      }));

      console.log('📝 Checking for duplicates...');

      // Check which URLs already exist
      const urls = articlesToInsert.map(a => a.url);
      const { data: existingArticles, error: checkError } = await supabase
        .from('content')
        .select('url')
        .in('url', urls);

      if (checkError) {
        console.error('❌ Error checking duplicates:', checkError);
        return;
      }

      const existingUrls = new Set(existingArticles?.map(a => a.url) || []);
      const newArticles = articlesToInsert.filter(a => !existingUrls.has(a.url));

      console.log(`📊 ${existingArticles?.length || 0} duplicates found, ${newArticles.length} new articles to insert`);

      if (newArticles.length === 0) {
        console.log('✅ All articles already in database');
        return;
      }

      // Insert only new articles
      const { error, data } = await supabase
        .from('content')
        .insert(newArticles);

      if (error) {
        console.error('❌ Database error:', error.message);
        return;
      }

      console.log(`✅ Saved ${newArticles.length} new articles to database`);

    } catch (error) {
      console.error('❌ Error fetching Medium articles:', error);
    }
  }
}
