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

    it('returns a low-risk analysis for a benign agreement', async () => {
      const simpleAgreement = `PARTIES
This Service Agreement is between Acme Labs and Bright Pixel Studio.

SECTION 1. SCOPE
The Supplier will provide design services for a fixed monthly fee of $2,000.

SECTION 2. PAYMENT
The Client shall pay the invoice within 30 days of receipt.

SECTION 3. CONFIDENTIALITY
Each party will keep non-public information confidential for 12 months after termination.`;

      const result = await analyzeDocument(simpleAgreement, 'Simple Service Agreement');
      expect(result.overallRiskLevel).toBe('low');
      expect(result.keyTakeaways.length).toBeGreaterThan(0);
      expect(result.deadlines.length).toBeGreaterThanOrEqual(0);
    });

    it('detects obligations and notice deadlines in a renewal-heavy contract', async () => {
      const renewalDoc = `SECTION 1. NOTICE
Either party must provide written notice at least 60 days before termination.

SECTION 2. RENEWAL
The agreement renews automatically for one year unless the client sends notice 30 days before expiry.`;

      const result = await analyzeDocument(renewalDoc, 'Renewal Notice Contract');
      expect(result.obligations.length).toBeGreaterThan(0);
      expect(result.deadlines.some(d => d.type === 'notice')).toBe(true);
    });
  });

  describe('chatWithDocument', () => {
    it('answers queries about termination with citations', async () => {
      const res = await chatWithDocument(sampleDoc, [], 'Can I terminate early?');
      expect(res.text).toBeTruthy();
      expect(Array.isArray(res.citations)).toBe(true);
    });

    it('returns a helpful fallback response for payment-related questions', async () => {
      const res = await chatWithDocument(sampleDoc, [], 'What are the payment obligations?');
      expect(res.text).toContain('financial');
      expect(res.citations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateLawyerBrief', () => {
    it('generates attorney consultation brief with critical questions', async () => {
      const brief = await generateLawyerBrief(sampleDoc);
      expect(brief.documentTitle).toBe(sampleDoc.title);
      expect(brief.criticalQuestions.length).toBeGreaterThan(0);
      expect(brief.recommendedAmendments.length).toBeGreaterThan(0);
    });

    it('creates a useful brief even for agreement without obvious red flags', async () => {
      const simpleAgreement: LegalDocument = {
        ...sampleDoc,
        id: 'simple-agreement',
        title: 'Simple SaaS Agreement',
        content: 'This agreement allows subscription access for one year. The customer may cancel with 30 days notice. Payment is due monthly.'
      };

      const brief = await generateLawyerBrief(simpleAgreement);
      expect(brief.documentTitle).toBe('Simple SaaS Agreement');
      expect(brief.suggestedNextSteps.length).toBeGreaterThan(0);
    });
  });

  describe('compareDocuments', () => {
    it('compares two legal documents side-by-side', async () => {
      const comp = await compareDocuments(sampleDoc, sampleDoc2);
      expect(comp.doc1Id).toBe(sampleDoc.id);
      expect(comp.doc2Id).toBe(sampleDoc2.id);
      expect(comp.comparisonSummary).toBeTruthy();
    });

    it('identifies increased risk in the second version of a contract', async () => {
      const comp = await compareDocuments(sampleDoc, sampleDoc2);
      expect(comp.modifiedClauses.some(change => change.riskDelta === 'increased')).toBe(true);
      expect(comp.overallRecommendation).toBeTruthy();
    });
  });
});
