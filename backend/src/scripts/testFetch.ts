import dotenv from 'dotenv';
dotenv.config();

import { PaperFetchJob } from '../jobs/fetchPapers';

async function test() {
  console.log('🧪 Testing Semantic Scholar API...\n');
  
  const job = new PaperFetchJob();
  
  // Fetch papers for all interests
  await job.fetchPapersForAllInterests();
  
  console.log('\n✅ Test complete! Check your Supabase content table.');
  process.exit(0);
}

test().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
