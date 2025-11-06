import { supabase } from '../lib/supabaseClient.js';

export async function getUserMode(userId) {
  try {
    const { data, error } = await supabase
      .from('user_interests')
      .select('interest_name')
      .eq('user_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return 'research'; // Default mode
    }

    // Check if user has hobby-related interests
    const hobbyKeywords = ['hobby', 'blog', 'article', 'medium', 'reading', 'lifestyle', 'creative'];
    const hasHobbyInterests = data.some(item =>
      hobbyKeywords.some(keyword =>
        item.interest_name?.toLowerCase().includes(keyword)
      )
    );

    // If user has both research and hobby interests, ask them
    // For now, if they have hobby interests, show hobbyist mode
    return hasHobbyInterests ? 'hobbyist' : 'research';

  } catch (error) {
    console.error('Error detecting user mode:', error);
    return 'research'; // Default to research on error
  }
}
