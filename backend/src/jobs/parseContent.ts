import { PDFParserService } from '../services/pdfParser';
import { supabase } from '../services/supabase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ContentParserJob {
  private pdfParser: PDFParserService;

  constructor() {
    this.pdfParser = new PDFParserService();
  }

  async parseUnparsedPapers(): Promise<void> {
    console.log('🔄 Starting PDF parsing job...');

    const { data: papers, error } = await supabase
      .from('content')
      .select('id, arxiv_id, pdf_url, title')
      .eq('content_type', 'research_paper')
      .is('full_text', null)
      .limit(5);

    if (error || !papers || papers.length === 0) {
      console.log('✅ All papers already parsed or none found');
      return;
    }

    console.log(`📚 Found ${papers.length} papers to parse\n`);

    for (const paper of papers) {
      try {
        console.log(`📖 Parsing: ${paper.title}`);
        
        if (!paper.pdf_url) {
          console.log(`⚠️  No PDF URL\n`);
          continue;
        }

        const fullText = await this.pdfParser.extractTextFromUrl(paper.pdf_url);
        
        if (!fullText) {
          console.log(`⚠️  No text extracted\n`);
          continue;
        }

        const summary = this.pdfParser.extractSummary(fullText, 2000);
        const sections = this.pdfParser.extractSections(fullText);

        const { error: updateError } = await supabase
          .from('content')
          .update({
            full_text: fullText,
            text_summary: summary,
            sections: sections,
            parsed_at: new Date().toISOString()
          })
          .eq('id', paper.id);

        if (updateError) {
          console.error(`❌ Error updating:`, updateError.message);
        } else {
          console.log(`✅ Parsed and stored\n`);
        }

        await delay(2000);

      } catch (error) {
        console.error(`❌ Error:`, error);
      }
    }

    console.log('='.repeat(50));
    console.log('✅ PDF parsing batch complete');
    console.log('='.repeat(50));
  }

  // NEW: Parse ALL papers in batches
  async parseAllPapers(): Promise<void> {
    console.log('🔄 Starting FULL PDF parsing job (all papers)...');
    console.log('⏳ This will take a while - processing in batches\n');

    let totalProcessed = 0;
    let batchNumber = 1;

    while (true) {
      console.log(`\n📦 Processing batch ${batchNumber}...`);

      const { data: papers, error } = await supabase
        .from('content')
        .select('id, arxiv_id, pdf_url, title')
        .eq('content_type', 'research_paper')
        .is('full_text', null)
        .limit(10);  // Process 10 at a time

      if (error || !papers || papers.length === 0) {
        console.log('✅ All papers have been parsed!');
        break;
      }

      console.log(`📚 Parsing ${papers.length} papers in batch ${batchNumber}`);

      for (const paper of papers) {
        try {
          console.log(`  📖 [${totalProcessed + 1}] ${paper.title.substring(0, 60)}...`);
          
          if (!paper.pdf_url) {
            console.log(`    ⚠️  No PDF URL`);
            continue;
          }

          const fullText = await this.pdfParser.extractTextFromUrl(paper.pdf_url);
          
          if (!fullText) {
            console.log(`    ⚠️  No text extracted`);
            continue;
          }

          const summary = this.pdfParser.extractSummary(fullText, 2000);
          const sections = this.pdfParser.extractSections(fullText);

          const { error: updateError } = await supabase
            .from('content')
            .update({
              full_text: fullText,
              text_summary: summary,
              sections: sections,
              parsed_at: new Date().toISOString()
            })
            .eq('id', paper.id);

          if (updateError) {
            console.error(`    ❌ Error:`, updateError.message);
          } else {
            console.log(`    ✅ Parsed`);
            totalProcessed++;
          }

          await delay(2000);

        } catch (error) {
          console.error(`    ❌ Error:`, error);
        }
      }

      batchNumber++;
      
      // Show progress
      console.log(`\n📊 Progress: ${totalProcessed} papers parsed so far...`);
      await delay(1000);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ COMPLETE: ${totalProcessed} papers fully parsed`);
    console.log('='.repeat(50));
  }

  async parsePaperById(paperId: string): Promise<void> {
    const { data: paper, error } = await supabase
      .from('content')
      .select('id, pdf_url, title')
      .eq('id', paperId)
      .single();

    if (error || !paper) {
      console.error('Paper not found');
      return;
    }

    if (!paper.pdf_url) {
      console.error('No PDF URL');
      return;
    }

    const fullText = await this.pdfParser.extractTextFromUrl(paper.pdf_url);
    const summary = this.pdfParser.extractSummary(fullText, 2000);
    const sections = this.pdfParser.extractSections(fullText);

    await supabase
      .from('content')
      .update({
        full_text: fullText,
        text_summary: summary,
        sections: sections,
        parsed_at: new Date().toISOString()
      })
      .eq('id', paper.id);

    console.log('✅ Paper parsed');
  }

  // NEW: Get parsing status
  async getParseStatus(): Promise<any> {
    const { data: total } = await supabase
      .from('content')
      .select('id', { count: 'exact' })
      .eq('content_type', 'research_paper');

    const { data: parsed } = await supabase
      .from('content')
      .select('id', { count: 'exact' })
      .eq('content_type', 'research_paper')
      .not('full_text', 'is', null);

    const { data: unparsed } = await supabase
      .from('content')
      .select('id', { count: 'exact' })
      .eq('content_type', 'research_paper')
      .is('full_text', null);

    return {
      total: total?.length || 0,
      parsed: parsed?.length || 0,
      unparsed: unparsed?.length || 0,
      percentage: ((parsed?.length || 0) / (total?.length || 1) * 100).toFixed(1)
    };
  }
}
