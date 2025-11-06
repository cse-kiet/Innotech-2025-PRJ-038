import { Paper } from '../types';

const API_BASE_URL = 'http://export.arxiv.org/api/query';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ArxivService {
  private requestCount = 0;

  private async makeRequest(url: string): Promise<string> {
    await delay(3000);

    console.log(`📡 ArXiv Request ${++this.requestCount}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status}`);
    }

    return response.text();
  }

  private parseArxivXML(xml: string): Paper[] {
    const papers: Paper[] = [];
    
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    
    console.log(`   Found ${entries.length} entries in response`);

    entries.forEach((entry, index) => {
      try {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
        const publishedMatch = entry.match(/<published>(\d{4}-\d{2}-\d{2})/);
        const authorMatches = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g) || [];
        const idMatch = entry.match(/<id>http:\/\/arxiv\.org\/abs\/([\w./-]+)<\/id>/);

        if (titleMatch && idMatch) {
          const arxivId = idMatch[1];
          const authors = authorMatches.map(match => {
            const nameMatch = match.match(/<name>(.*?)<\/name>/);
            return {
              authorId: '',
              name: nameMatch ? nameMatch[1].trim() : 'Unknown'
            };
          });

          papers.push({
            paperId: arxivId,
            title: titleMatch[1].trim().replace(/\n/g, ' '),
            abstract: summaryMatch ? summaryMatch[1].trim().replace(/\n/g, ' ') : null,
            year: publishedMatch ? parseInt(publishedMatch[1].split('-')[0]) : null,
            authors: authors,
            url: `https://arxiv.org/abs/${arxivId}`,
            citationCount: 0,
            publicationDate: publishedMatch ? publishedMatch[1] : null
          });
        }
      } catch (error) {
        console.error(`   Error parsing entry ${index}:`, error);
      }
    });

    console.log(`   Successfully parsed ${papers.length} papers`);
    return papers;
  }

  async searchPapers(query: string, limit: number = 10): Promise<Paper[]> {
    try {
      // Verified working ArXiv categories
      const categoryMap: { [key: string]: string } = {
        // Computer Science
        'Machine Learning': 'cat:cs.LG',
        'Deep Learning': 'cat:cs.LG',
        'Computer Vision': 'cat:cs.CV',
        'Natural Language Processing': 'cat:cs.CL',
        'Reinforcement Learning': 'cat:cs.LG',
        'Algorithms & Data Structures': 'cat:cs.DS',
        'Distributed Systems': 'cat:cs.DC',
        
        // Quantum
        'Quantum Computing': 'cat:quant-ph',
        'Quantum Physics': 'cat:quant-ph',
        
        // Physics & Math
        'Theoretical Physics': 'cat:gr-qc',  // General Relativity and Quantum Cosmology
        'Applied Mathematics': 'cat:math.AP',
        'Statistical Mechanics': 'cat:cond-mat.stat-mech',
        'Topology': 'cat:math.AT',
        'Number Theory': 'cat:math.NT',
        
        // Biology
        'Genomics': 'cat:q-bio.GN',
        'Neuroscience': 'cat:q-bio.NC',
        'Bioinformatics': 'cat:q-bio.QM',
        'Drug Discovery': 'cat:q-bio.BM',
        'Synthetic Biology': 'cat:q-bio.MN',
        'Immunology': 'cat:q-bio.CB',
        
        // Engineering
        'Robotics': 'cat:cs.RO',
        'Materials Science': 'cat:cond-mat.mtrl-sci',
        'Nanotechnology': 'cat:cond-mat.mes-hall',
        'Aerospace Engineering': 'cat:physics.app-ph',
        'Chemical Engineering': 'cat:physics.chem-ph',
        'Electrical Engineering': 'cat:eess.SY',
        
        // Economics & Social Sciences
        'Economics': 'cat:econ.GN',
        'Psychology Research': 'cat:q-bio.NC',
        'Sociology': 'cat:physics.soc-ph',
        'Political Science': 'cat:physics.soc-ph',
        'Behavioral Science': 'cat:q-bio.NC',
      };

      const searchQuery = categoryMap[query] || `all:"${query}"`;
      
      const maxResults = limit * 3;
      
      const url = `${API_BASE_URL}?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

      console.log(`   Query: ${searchQuery}`);
      
      const xml = await this.makeRequest(url);
      let papers = this.parseArxivXML(xml);
      
      const uniquePapers = Array.from(new Map(papers.map(p => [p.url, p])).values());
      
      uniquePapers.sort((a, b) => {
        const dateA = new Date(a.publicationDate || '1970-01-01').getTime();
        const dateB = new Date(b.publicationDate || '1970-01-01').getTime();
        return dateB - dateA;
      });
      
      return uniquePapers.slice(0, limit);
      
    } catch (error) {
      console.error(`   ❌ Error:`, error);
      return [];
    }
  }

  async getLatestPapers(query: string, limit: number = 10): Promise<Paper[]> {
    return this.searchPapers(query, limit);
  }
}
