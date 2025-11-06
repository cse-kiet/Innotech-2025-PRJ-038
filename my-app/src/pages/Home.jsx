import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PaperCard from '../components/PaperCard';

const Home = () => {
  const navigate = useNavigate();
  const [userMode, setUserMode] = useState('research');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userInterests, setUserInterests] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (initialized && userInterests.length > 0) {
      console.log('Fetching with interests:', userInterests);
      fetchContent();
    }
  }, [initialized, userInterests]);

  const initializeUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUserId(user.id);

      const { data: userData } = await supabase
        .from('users')
        .select('content_mode')
        .eq('id', user.id)
        .single();

      if (userData?.content_mode) {
        const appMode = userData.content_mode === 'hobbyist' ? 'hobbyist' : 'research';
        setUserMode(appMode);
      }

      const { data: interests } = await supabase
        .from('user_interests')
        .select('interest_name')
        .eq('user_id', user.id);

      if (interests && interests.length > 0) {
        const interestNames = interests.map(i => i.interest_name);
        console.log('📌 User Interests:', interestNames);
        setUserInterests(interestNames);
      }

      setInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error initializing user:', error);
      setInitialized(true);
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);

      const contentType = userMode === 'hobbyist' ? 'hobby_article' : 'research_paper';

      let query = supabase
        .from('content')
        .select('*')
        .eq('content_type', contentType)
        .order(userMode === 'hobbyist' ? 'scraped_at' : 'created_at', { ascending: false });

      const { data, error } = await query.limit(300); // Increased from 200

      if (error) throw error;

      const matchStats = {};
      userInterests.forEach(interest => {
        matchStats[interest] = [];
      });

      // Filter: Check if ANY tag matches ANY interest
      const allMatches = data?.filter(article => {
        if (!article.tags || !Array.isArray(article.tags) || article.tags.length === 0) {
          return false;
        }

        let hasMatch = false;
        const matchedInterests = [];

        article.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase().trim();
          
          userInterests.forEach(interest => {
            const normalizedInterest = interest.toLowerCase().trim();
            
            if (normalizedTag === normalizedInterest || 
                normalizedTag.includes(normalizedInterest) || 
                normalizedInterest.includes(normalizedTag)) {
              hasMatch = true;
              if (!matchedInterests.includes(interest)) {
                matchedInterests.push(interest);
                matchStats[interest].push({
                  id: article.id,
                  title: article.title
                });
              }
            }
          });
        });

        if (hasMatch) {
          article.matchedInterests = matchedInterests;
        }

        return hasMatch;
      }) || [];

      // Balance results: Show ~5-7 papers per interest category
      const balancedContent = [];
      const papersPerInterest = Math.ceil(30 / userInterests.length); // 30 total papers

      // Sort by matched interests to balance
      const sorted = allMatches.sort((a, b) => {
        // Prioritize papers that match fewer interests (more unique)
        return a.matchedInterests.length - b.matchedInterests.length;
      });

      // Track which interests are represented
      const interestCounts = {};
      userInterests.forEach(i => interestCounts[i] = 0);

      sorted.forEach(article => {
        // Check if we can add more from any of this article's interests
        const canAdd = article.matchedInterests.some(
          interest => interestCounts[interest] < papersPerInterest
        );

        if (canAdd && balancedContent.length < 30) {
          balancedContent.push(article);
          article.matchedInterests.forEach(interest => {
            interestCounts[interest]++;
          });
        }
      });

      console.log(`\n📊 RESULTS:`);
      console.log(`Total filtered: ${allMatches.length}/${data?.length} articles`);
      console.log(`Showing: ${balancedContent.length} balanced articles`);
      console.log(`\n📊 Breakdown by interest:`);
      Object.entries(matchStats).forEach(([interest, papers]) => {
        console.log(`  ${interest}: ${papers.length} papers (showing ~${interestCounts[interest]})`);
      });

      setContent(balancedContent);
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E5D8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4"></div>
          <p className="text-[#4a3c28]">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E5D8]">
      <div className="bg-gradient-to-r from-[#8B6F47] to-[#6B5335] text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {userMode === 'hobbyist' ? '📰 Your Feed' : 'Your Feed'}
          </h1>
          <p className="text-orange-100">
            {userMode === 'hobbyist' 
              ? `For: ${userInterests.join(', ')}` 
              : `Exploring: ${userInterests.join(', ')}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              userMode === 'hobbyist' ? (
                <ArticleCard 
                  key={item.id} 
                  article={item} 
                  navigate={navigate} 
                />
              ) : (
                <PaperCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  text_summary={item.text_summary}
                  authors_list={item.authors_list}
                  publication_date={item.publication_date}
                  tags={item.tags}
                  url={item.url}
                  pdf_url={item.pdf_url}
                  citations_count={item.citations_count}
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#4a3c28b3] text-lg mb-2">
              No content found matching your interests.
            </p>
            <p className="text-[#4a3c28b3] text-sm">
              Interests: {userInterests.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ArticleCard = ({ article, navigate }) => {
  const handleClick = () => {
    sessionStorage.setItem(`article-${article.id}`, JSON.stringify(article));
    navigate(`/article/${article.id}`);
  };

  return (
    <article
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group"
    >
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#3b2f20] mb-2 line-clamp-2 group-hover:text-[#d18b2a]">
          {article.title}
        </h3>

        <p className="text-sm text-[#4a3c28b3] mb-3 line-clamp-2">
          {article.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#4a3c28b3] mb-3 pb-3 border-b border-[#e5d3b3]">
          <span className="font-medium">{article.authors_list?.[0]}</span>
          <span>•</span>
          <span>{new Date(article.scraped_at || article.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {article.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#f0e6d8] px-2 py-1 rounded-full text-[#765a3f]"
            >
              #{tag.toLowerCase().replace(/\s+/g, '')}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default Home;