import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePapers = (userId) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's interests
        const { data: interests, error: interestError } = await supabase
          .from('user_interests')
          .select('interest_name')
          .eq('user_id', userId);

        if (interestError) throw interestError;

        if (!interests || interests.length === 0) {
          setPapers([]);
          setLoading(false);
          return;
        }

        // Fetch ALL papers first
        const { data: allPapers, error: paperError } = await supabase
          .from('content')
          .select('*')
          .eq('content_type', 'research_paper')
          .order('publication_date', { ascending: false })
          .limit(100);

        if (paperError) throw paperError;

        // Filter papers that match user's interests
        const interestSet = new Set(interests.map(i => i.interest_name.toLowerCase()));
        
        const filteredPapers = (allPapers || []).filter(paper => {
          const paperTags = Array.isArray(paper.tags) ? paper.tags : [];
          
          // Check if any paper tag matches any user interest
          return paperTags.some(tag => {
            const tagLower = tag.toLowerCase();
            return Array.from(interestSet).some(interest => 
              tagLower.includes(interest.toLowerCase()) || 
              interest.toLowerCase().includes(tagLower)
            );
          });
        });

        setPapers(filteredPapers.slice(0, 50));
        
      } catch (err) {
        console.error('Error fetching papers:', err);
        setError(err?.message || 'Failed to fetch papers');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [userId]);

  return { papers, loading, error };
};
