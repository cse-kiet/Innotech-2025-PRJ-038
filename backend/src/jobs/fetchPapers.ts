import { ArxivService } from '../services/arxiv';
import { supabase } from '../services/supabase';
import { Paper } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class PaperFetchJob {
  private arxiv: ArxivService;
  private interestsByMode = {
    researcher: {
      "Computer Science": [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Natural Language Processing",
        "Reinforcement Learning",
        "Algorithms & Data Structures",
        "Distributed Systems",
        "Quantum Computing"
      ],
      "Physics & Mathematics": [
        "Quantum Physics",
        "Theoretical Physics",
        "Applied Mathematics",
        "Statistical Mechanics",
        "Topology",
        "Number Theory"
      ],
      "Biology & Medicine": [
        "Genomics",
        "Neuroscience",
        "Bioinformatics",
        "Drug Discovery",
        "Synthetic Biology",
        "Immunology"
      ],
      "Engineering": [
        "Robotics",
        "Materials Science",
        "Nanotechnology",
        "Aerospace Engineering",
        "Chemical Engineering",
        "Electrical Engineering"
      ],
      "Social Sciences": [
        "Economics",
        "Psychology Research",
        "Sociology",
        "Political Science",
        "Behavioral Science"
      ]
    }
  };

  constructor() {
    this.arxiv = new ArxivService();
  }

  async fetchPapersForAllInterests(): Promise<void> {
    console.log('🚀 Fetch triggered!');
    console.log('🔄 Starting ArXiv paper fetch job...\n');

    const allInterests = Object.values(this.interestsByMode.researcher).flat();
    console.log(`📚 Fetching 10 latest papers for ${allInterests.length} interests\n`);

    let totalSaved = 0;

    for (const interest of allInterests) {
      try {
        console.log(`📖 Fetching latest: ${interest}`);
        
        const papers = await this.arxiv.getLatestPapers(interest, 10);
        
        if (papers.length === 0) {
          console.log(`⚠️  No papers found\n`);
          continue;
        }

        // Check which papers already exist
        const existingUrls = new Set<string>();
        for (const paper of papers) {
          const { data: existing } = await supabase
            .from('content')
            .select('id, tags')
            .eq('url', paper.url)
            .eq('content_type', 'research_paper')
            .single();

          if (existing) {
            existingUrls.add(paper.url);

            // Add interest tag if not already present
            if (!existing.tags.includes(interest)) {
              const updatedTags = [...existing.tags, interest];
              await supabase
                .from('content')
                .update({ tags: updatedTags })
                .eq('id', existing.id);
              
              console.log(`   📌 Added tag to existing paper`);
            }
          }
        }

        // Insert only new papers
        const newPapers = papers.filter(p => !existingUrls.has(p.url));

        if (newPapers.length > 0) {
          const papersToInsert = newPapers.map((paper: Paper) => ({
            content_type: 'research_paper',
            title: paper.title,
            url: paper.url,
            description: paper.abstract,
            authors_list: paper.authors.map(a => a.name),
            tags: [interest],
            arxiv_id: paper.paperId,
            pdf_url: `https://arxiv.org/pdf/${paper.paperId}.pdf`,
            publication_date: paper.publicationDate,
            citations_count: paper.citationCount,
            scraped_at: new Date().toISOString()
          }));

          const { error } = await supabase
            .from('content')
            .insert(papersToInsert);

          if (error) {
            console.error(`   ❌ Error:`, error.message);
          } else {
            totalSaved += newPapers.length;
            console.log(`✅ Saved ${newPapers.length} new papers`);
          }
        } else {
          console.log(`✅ All papers already exist (tags added)`);
        }

        console.log();
        await delay(1000);

      } catch (error) {
        console.error(`❌ Error:`, error);
      }
    }

    console.log('='.repeat(50));
    console.log(`📊 Total: ${totalSaved} new papers added`);
    console.log('⏰ All papers sorted by latest submission date');
    console.log('='.repeat(50));
  }
}