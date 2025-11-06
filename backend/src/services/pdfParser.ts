import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

export class PDFParserService {
  // Clean text of problematic Unicode sequences
  private cleanText(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // Remove control characters
      .replace(/\\/g, '\\\\')  // Escape backslashes
      .replace(/"/g, '\\"')    // Escape quotes
      .substring(0, 1000000);  // Limit to 1MB
  }

  async extractTextFromUrl(pdfUrl: string): Promise<string> {
    try {
      console.log(`   📄 Downloading PDF...`);
      
      // Fetch PDF as ArrayBuffer
      const response = await fetch(pdfUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      console.log(`   📖 Parsing PDF...`);
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
      }).promise;
      
      let fullText = '';
      const numPages = pdf.numPages;
      
      // Extract text from each page
      for (let i = 1; i <= Math.min(numPages, 20); i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ');
          
          fullText += pageText + '\n';
        } catch (pageError) {
          console.log(`   ⚠️  Skipping page ${i}`);
        }
      }
      
      // Clean the text
      fullText = this.cleanText(fullText);
      
      console.log(`   ✅ Extracted ${fullText.length} characters from ${Math.min(numPages, 20)} pages`);
      return fullText;
      
    } catch (error) {
      console.error(`   ❌ Error parsing PDF:`, error);
      return '';
    }
  }

  // Extract first N characters (summary)
  extractSummary(text: string, maxChars: number = 3000): string {
    if (!text) return '';
    
    let cleaned = text
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned.substring(0, maxChars);
  }

  // Extract key sections
  extractSections(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    
    const sectionPatterns = {
      'abstract': /abstract[\s\n]+([\s\S]*?)(?=introduction|1\.|$)/i,
      'introduction': /introduction[\s\n]+([\s\S]*?)(?=related work|background|2\.|$)/i,
      'conclusion': /conclusion[\s\n]+([\s\S]*?)(?=references|$)/i,
    };
    
    for (const [name, pattern] of Object.entries(sectionPatterns)) {
      const match = text.match(pattern);
      if (match) {
        sections[name] = match[1].trim().substring(0, 1000);
      }
    }
    
    return sections;
  }
}
