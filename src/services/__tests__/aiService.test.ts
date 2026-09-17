import { describe, it, expect } from 'vitest';
import { analyzeDocument, chatWithDocument, generateLawyerBrief, compareDocuments } from '../aiService';
import type { LegalDocument } from '../../types/legal';

const sampleDoc: LegalDocument = {
  id: 'test-doc-1',
  title: 'Commercial Master Lease Agreement',
  type: 'contract',
  fileName: 'lease.txt',
  content: `SECTION 1. RENT AND FEES
Tenant shall pay monthly base rent of $12,500 on or before the 1st of each calendar month. Late payments incur a 5% monthly fee.

SECTION 2. INDEMNIFICATION AND GUARANTEE
Tenant and Tenant's Officer personally guarantee and indemnify Landlord against all losses, damages, and legal expenses without cap.

SECTION 3. AUTOMATIC RENEWAL
This Agreement shall automatically renew for additional 5-year terms unless Tenant provides written notice at least 120 days prior to expiration.`,
  uploadDate: '2026-09-01',
  wordCount: 85,
};

const sampleDoc2: LegalDocument = {
  id: 'test-doc-2',
  title: 'Commercial Lease Revised Draft',
  type: 'contract',
  fileName: 'lease_revised.txt',
  content: `SECTION 1. RENT AND FEES
Tenant shall pay monthly base rent of $10,000 on or before the 5th of each calendar month.

SECTION 2. INDEMNIFICATION
Tenant liability is capped at 3 months base rent. Personal officer guarantee is excluded.`,
  uploadDate: '2026-09-02',
  wordCount: 45,
};

describe('aiService (Local Intelligence Parser Fallbacks)', () => {
  describe('analyzeDocument', () => {
    it('analyzes document text and returns structured analysis object', async () => {
      const result = await analyzeDocument(sampleDoc.content, sampleDoc.title);
      expect(result).toBeDefined();
      expect(result.executiveSummary).toBeTruthy();
      expect(result.overallRiskLevel).toBe('high');
      expect(result.clauses.length).toBeGreaterThan(0);
    });

    it('identifies high risk indemnification and automatic renewal clauses', async () => {
      const result = await analyzeDocument(sampleDoc.content, sampleDoc.title);
      const highRiskClauses = result.clauses.filter(c => c.riskLevel === 'high');
      expect(highRiskClauses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('chatWithDocument', () => {
    it('answers queries about termination with citations', async () => {
      const res = await chatWithDocument(sampleDoc, [], 'Can I terminate early?');
      expect(res.text).toBeTruthy();
      expect(Array.isArray(res.citations)).toBe(true);
    });
  });

  describe('generateLawyerBrief', () => {
    it('generates attorney consultation brief with critical questions', async () => {
      const brief = await generateLawyerBrief(sampleDoc);
      expect(brief.documentTitle).toBe(sampleDoc.title);
      expect(brief.criticalQuestions.length).toBeGreaterThan(0);
      expect(brief.recommendedAmendments.length).toBeGreaterThan(0);
    });
  });

  describe('compareDocuments', () => {
    it('compares two legal documents side-by-side', async () => {
      const comp = await compareDocuments(sampleDoc, sampleDoc2);
      expect(comp.doc1Id).toBe(sampleDoc.id);
      expect(comp.doc2Id).toBe(sampleDoc2.id);
      expect(comp.comparisonSummary).toBeTruthy();
    });
  });
});
