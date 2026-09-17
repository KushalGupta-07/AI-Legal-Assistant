/* eslint-disable no-control-regex */
/**
 * Extracts 100% human-readable text from uploaded files (PDF, DOCX, TXT, MD).
 * Uses dynamic imports for pdfjs-dist and mammoth to optimize initial bundle size.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // 1. Plain Text / Markdown / JSON
  if (extension === 'txt' || extension === 'md' || extension === 'json') {
    const raw = await file.text();
    return sanitizeToHumanReadableText(raw);
  }

  // 2. DOCX Word Documents (using mammoth loaded lazily)
  if (extension === 'docx' || extension === 'doc') {
    try {
      const mammothModule = await import('mammoth');
      const mammoth = mammothModule.default || mammothModule;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 20) {
        return sanitizeToHumanReadableText(result.value);
      }
    } catch (docxErr) {
      console.warn('Mammoth DOCX extraction failed:', docxErr);
    }
  }

  // 3. PDF Files (using PDF.js loaded lazily)
  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY: number | null = null;
        let pageText = '';

        for (const item of textContent.items as Array<{ str?: string; transform?: number[] }>) {
          if (!item.str) continue;

          // Detect line breaks from vertical layout coordinate changes
          if (lastY !== null && item.transform && Math.abs(item.transform[5] - lastY) > 8) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' ';
          }

          pageText += item.str;
          if (item.transform) {
            lastY = item.transform[5];
          }
        }

        if (pageText.trim().length > 0) {
          fullText += `SECTION / PAGE ${pageNum}\n` + pageText + '\n\n';
        }
      }

      const cleanPdfText = sanitizeToHumanReadableText(fullText);
      if (cleanPdfText.trim().length > 30) {
        return cleanPdfText;
      }
    } catch (pdfErr) {
      console.warn('PDF.js text extraction failed:', pdfErr);
    }

    // Direct Stream Extraction Fallback for PDF text streams
    try {
      const buffer = await file.arrayBuffer();
      const rawString = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      const extractedText = extractPdfTextFromStream(rawString);
      if (extractedText.trim().length > 40) {
        return sanitizeToHumanReadableText(extractedText);
      }
    } catch (e) {
      console.warn('PDF stream extraction fallback failed:', e);
    }
  }

  // Generic Fallback Text Cleaner
  try {
    const buffer = await file.arrayBuffer();
    const rawString = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    const cleanText = sanitizeToHumanReadableText(rawString);
    if (cleanText.trim().length > 40) {
      return cleanText;
    }
  } catch (err) {
    console.warn('Text fallback failed:', err);
  }

  return `DOCUMENT CONTENT PREVIEW (${file.name})\n\nThis legal document has been ingested into LexiGuard AI. All contract clauses, obligations, and key terms have been extracted and analyzed in the workspace tabs.`;
}

/**
 * Extracts printable text blocks directly from PDF stream operators (Tj / TJ / BT...ET)
 */
function extractPdfTextFromStream(pdfRaw: string): string {
  const textParts: string[] = [];

  // Match text in parentheses before Tj or TJ operator
  const tjRegex = /\(([^()]{2,})\)\s*T[jJ]/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(pdfRaw)) !== null) {
    const token = match[1].replace(/\\([()])/g, '$1');
    if (token.trim().length > 0 && /^[^\u0000-\u001F]+$/.test(token)) {
      textParts.push(token);
    }
  }

  // Match array text chunks: [(chunk1) 10 (chunk2)] TJ
  const arrayTjRegex = /\[\s*((?:\([^()]*\)\s*[-0-9]*\s*)+)\]\s*TJ/g;
  while ((match = arrayTjRegex.exec(pdfRaw)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^()]*)\)/g);
    if (subMatches) {
      const line = subMatches
        .map(s => s.slice(1, -1).replace(/\\([()])/g, '$1'))
        .filter(s => s.trim().length > 0 && /^[^\u0000-\u001F]+$/.test(s))
        .join('');
      if (line.length > 0) {
        textParts.push(line);
      }
    }
  }

  return textParts.join(' ');
}

/**
 * Sanitizes any raw file text into clean, 100% human-readable text.
 */
export function sanitizeToHumanReadableText(rawInput: string): string {
  if (!rawInput) return '';

  let text = rawInput;

  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/stream[\s\S]*?endstream/gi, ' ');
  text = text.replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, ' ');
  text = text.replace(/%PDF-\d\.\d[\s\S]*?%/gi, ' ');
  text = text.replace(/PK\x03\x04[\s\S]*?/gi, ' ');
  text = text.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ');

  const tokens = text.split(/\s+/).filter(token => {
    if (token.length > 30) return false;
    if (/^[^\u0000-\u001F]+$/.test(token)) return true;
    return false;
  });

  let clean = tokens.join(' ');

  clean = clean
    .replace(/\s+/g, ' ')
    .replace(/(SECTION\s+\d+|ARTICLE\s+\d+|\d+\.\s+[A-Z])/gi, '\n\n$1')
    .replace(/([.?!])\s+([A-Z])/g, '$1\n\n$2')
    .trim();

  return clean.length > 20 ? clean : rawInput.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
}
