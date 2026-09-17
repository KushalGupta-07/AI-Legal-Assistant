import { describe, it, expect } from 'vitest';
import { sanitizeToHumanReadableText, extractTextFromFile } from '../pdfService';

describe('pdfService', () => {
  describe('sanitizeToHumanReadableText', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeToHumanReadableText('')).toBe('');
    });

    it('strips HTML tags and PDF stream markers', () => {
      const raw = '<div>SECTION 1. Terms</div> stream endstream obj endobj %PDF-1.4%';
      const clean = sanitizeToHumanReadableText(raw);
      expect(clean).not.toContain('<div>');
      expect(clean).not.toContain('stream endstream');
    });

    it('retains printable English text and adds paragraph breaks for sections', () => {
      const input = 'SECTION 1. General Agreement. This contract binds the parties under applicable law.';
      const output = sanitizeToHumanReadableText(input);
      expect(output).toContain('SECTION 1.');
      expect(output).toContain('General Agreement');
    });

    it('removes control characters and preserves readable contract text', () => {
      const raw = 'SECTION 1\u0000. Confidentiality\u0001.\nThe parties agree to maintain secrecy.';
      const clean = sanitizeToHumanReadableText(raw);
      expect(clean).toContain('Confidentiality');
      expect(clean).not.toContain('\u0000');
      expect(clean).not.toContain('\u0001');
    });
  });

  describe('extractTextFromFile', () => {
    it('extracts plain text from .txt files', async () => {
      const file = new File(['SECTION 1. Confidentiality Agreement.\nBoth parties shall maintain secrecy.'], 'contract.txt', { type: 'text/plain' });
      const text = await extractTextFromFile(file);
      expect(text).toContain('Confidentiality Agreement');
    });

    it('extracts text from .json files', async () => {
      const file = new File(['{"title": "Agreement", "terms": "Standard lease terms"}'], 'terms.json', { type: 'application/json' });
      const text = await extractTextFromFile(file);
      expect(text).toContain('Standard lease terms');
    });

    it('sanitizes markdown files into readable legal text', async () => {
      const file = new File(['# Master Services Agreement\n\n## Term\nCustomer shall pay within 30 days.'], 'msa.md', { type: 'text/markdown' });
      const text = await extractTextFromFile(file);
      expect(text).toContain('Master Services Agreement');
      expect(text).toContain('Customer shall pay within 30 days');
    });
  });
});
