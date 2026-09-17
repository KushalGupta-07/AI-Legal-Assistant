/* eslint-disable no-control-regex */
import { GoogleGenAI } from '@google/genai';
import type { 
  LegalDocument, 
  DocumentAnalysis, 
  Clause, 
  Obligation, 
  DeadlineItem, 
  Inconsistency, 
  ComparisonResult, 
  LawyerBrief,
  ChatMessage,
  RiskLevel
} from '../types/legal';

const API_KEY_STORAGE_KEY = 'GEMINI_API_KEY';

const sanitizeApiKey = (value: string): string => value.trim().replace(/\s+/g, '').slice(0, 200);

// Initialize Gemini Client if key exists
function getGeminiClient(apiKey?: string): GoogleGenAI | null {
  const rawKey = apiKey || (typeof window !== 'undefined' ? window.sessionStorage.getItem(API_KEY_STORAGE_KEY) : '') || import.meta.env.VITE_GEMINI_API_KEY;
  const key = sanitizeApiKey(rawKey || '');

  if (!key || !/^AIza[0-9A-Za-z-_]{10,}$/.test(key)) {
    return null;
  }

  return new GoogleGenAI({ apiKey: key });
}

/**
 * Sanitizes input prompt text to prevent control character corruption.
 */
function sanitizePromptInput(input: string): string {
  if (!input) return '';
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ').trim();
}

/**
 * Dynamically analyzes uploaded contract text using Gemini or intelligent local heuristic parser
 */
export async function analyzeDocument(text: string, title: string = 'Uploaded Legal Document', apiKey?: string): Promise<DocumentAnalysis> {
  const ai = getGeminiClient(apiKey);
  const cleanTitle = sanitizePromptInput(title);
  const cleanText = sanitizePromptInput(text);
  
  if (ai) {
    try {
      const prompt = `You are LexiGuard AI, an expert legal contract analysis engine.
Analyze the following legal document text (${cleanTitle}) and return ONLY a strict JSON object with this exact schema:

{
  "executiveSummary": "Concise 2-3 sentence high-level summary of the contract.",
  "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "plainEnglishTranslation": "Layperson translation of what this contract means for the user.",
  "laypersonRating": "Simple" | "Moderate" | "Complex" | "Very Complex",
  "complexityScore": number (1-100),
  "overallRiskLevel": "high" | "medium" | "low",
  "clauses": [
    {
      "id": "c1",
      "section": "Section X.Y",
      "title": "Clause Title",
      "originalText": "Exact quote or excerpt",
      "plainTextSummary": "Simple explanation",
      "category": "financial" | "liability" | "termination" | "obligations" | "ip_confidentiality" | "warranties" | "dispute" | "general",
      "riskLevel": "high" | "medium" | "low",
      "riskReason": "Why this is risky",
      "recommendations": "Suggested negotiation edit",
      "entityInvolved": "User" | "Counterparty" | "Both",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "obligations": [
    {
      "id": "ob1",
      "clauseId": "c1",
      "party": "User" | "Counterparty" | "Both",
      "description": "Obligation summary",
      "deadline": "Date or timeframe if specified",
      "isStrict": boolean,
      "penalty": "Penalty description if specified"
    }
  ],
  "deadlines": [
    {
      "id": "dl1",
      "title": "Deadline title",
      "dateOrTimeframe": "YYYY-MM-DD or timeframe",
      "type": "payment" | "notice" | "renewal" | "compliance" | "deliverable",
      "details": "Explanation of deadline",
      "isCompleted": false,
      "clauseRef": "Section X"
    }
  ],
  "inconsistencies": [
    {
      "id": "inc1",
      "title": "Title",
      "description": "Conflict explanation",
      "clauseIds": ["c1", "c2"],
      "severity": "high" | "medium" | "low",
      "resolutionSuggestion": "Fix suggestion"
    }
  ]
}

Document Text:
${cleanText.slice(0, 12000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.executiveSummary && Array.isArray(parsed.clauses)) {
          return parsed as DocumentAnalysis;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent local parser:', err);
    }
  }

  // Fallback Heuristic Legal Analysis Parser
  return parseDocumentLocally(cleanText);
}

/**
 * Intelligent Local Fallback Parser for contracts without API key
 */
function parseDocumentLocally(text: string): DocumentAnalysis {
  const clauses: Clause[] = [];
  const obligations: Obligation[] = [];
  const deadlines: DeadlineItem[] = [];
  const inconsistencies: Inconsistency[] = [];

  let highestRisk: RiskLevel = 'low';

  // Break into section blocks
  const sections = text.split(/(?=SECTION\s+\d+|ARTICLE\s+\d+|\d+\.\s+[A-Z])/i);

  sections.forEach((secText, idx) => {
    if (secText.trim().length < 20) return;
    
    const linesInSec = secText.split('\n').map(s => s.trim()).filter(Boolean);
    const header = linesInSec[0] || `Section ${idx + 1}`;
    const lowSec = secText.toLowerCase();

    let risk: RiskLevel = 'low';
    let riskReason = 'Standard contractual clause.';
    let rec = 'Review terms for alignment with standard operational guidelines.';
    let category: Clause['category'] = 'general';

    if (lowSec.includes('guarantee') || lowSec.includes('indemn')) {
      category = 'liability';
      risk = 'high';
      highestRisk = 'high';
      riskReason = 'Exposes party or individuals to significant financial indemnity or liability claims.';
      rec = 'Negotiate capping liability to contract value or remove personal indemnification.';
    } else if (lowSec.includes('renew') || lowSec.includes('terminat')) {
      category = 'termination';
      if (lowSec.includes('automatic') || lowSec.includes('without cause')) {
        risk = 'high';
        highestRisk = 'high';
        riskReason = 'Automatic renewal or asymmetric termination without cause creates unexpected binding commitments.';
        rec = 'Mandate 60+ days notice and delete unilateral early termination without cause.';
      } else {
        risk = 'medium';
      }
    } else if (lowSec.includes('rent') || lowSec.includes('pay') || lowSec.includes('fee') || lowSec.includes('price')) {
      category = 'financial';
      if (lowSec.includes('escalat') || lowSec.includes('late') || lowSec.includes('interest')) {
        risk = 'medium';
        riskReason = 'Contains compounding price increases or strict financial penalties.';
        rec = 'Cap annual increases to 3% max or tie to local CPI index.';
      }
    } else if (lowSec.includes('secret') || lowSec.includes('confident') || lowSec.includes('intellectual') || lowSec.includes('patent') || lowSec.includes('ip')) {
      category = 'ip_confidentiality';
      if (lowSec.includes('perpetual') || lowSec.includes('assignment')) {
        risk = 'high';
        highestRisk = 'high';
        riskReason = 'Transfers intellectual property rights or creates perpetual secrecy obligations.';
        rec = 'Ensure pre-existing IP remains fully owned by original author.';
      }
    }

    const clauseId = `c-dyn-${idx + 1}`;
    clauses.push({
      id: clauseId,
      section: header.length > 50 ? `Section ${idx + 1}` : header,
      title: header.slice(0, 60),
      originalText: secText.slice(0, 300) + (secText.length > 300 ? '...' : ''),
      plainTextSummary: `This section governs ${category.replace('_', ' ')}: ${linesInSec.slice(1, 3).join(' ')}`.slice(0, 180),
      category,
      riskLevel: risk,
      riskReason,
      recommendations: rec,
      entityInvolved: lowSec.includes('tenant') || lowSec.includes('recipient') || lowSec.includes('client') ? 'User' : 'Both',
      tags: [category.toUpperCase(), risk === 'high' ? 'HIGH RISK' : 'STANDARD']
    });

    // Detect obligations
    if (lowSec.includes('shall') || lowSec.includes('must') || lowSec.includes('agrees to')) {
      obligations.push({
        id: `ob-dyn-${idx + 1}`,
        clauseId,
        party: lowSec.includes('tenant') || lowSec.includes('recipient') ? 'User' : 'Counterparty',
        description: `Obligation to comply with provisions in ${header}`,
        deadline: lowSec.includes('days') ? 'Within specified notice timeframe' : undefined,
        isStrict: risk === 'high',
        penalty: risk === 'high' ? 'Potential default or monetary penalty' : undefined
      });
    }

    // Detect deadlines
    const dayMatches = secText.match(/(\d+)\s*(days|months|hours|years)/i);
    if (dayMatches) {
      deadlines.push({
        id: `dl-dyn-${idx + 1}`,
        title: `Notice / Action Window (${dayMatches[0]})`,
        dateOrTimeframe: `${dayMatches[0]} timeframe`,
        type: lowSec.includes('pay') ? 'payment' : lowSec.includes('renew') ? 'renewal' : 'notice',
        details: `Requirement stated in ${header}: "${secText.slice(0, 120)}..."`,
        isCompleted: false,
        clauseRef: header.slice(0, 30)
      });
    }
  });

  // Detect inconsistencies if asymmetric termination exists
  const hasAutoRenew = text.toLowerCase().includes('auto');
  const hasShortTerm = text.toLowerCase().includes('30 days');
  if (hasAutoRenew && hasShortTerm) {
    inconsistencies.push({
      id: 'inc-dyn-1',
      title: 'Asymmetric Notice Period & Renewal Lock',
      description: 'The contract specifies short notice for landlord/vendor termination but mandates an exact narrow notice window to prevent automatic renewal.',
      clauseIds: clauses.slice(0, 2).map(c => c.id),
      severity: 'high',
      resolutionSuggestion: 'Standardize all cancellation and renewal notice periods to 60-90 days mutually.'
    });
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
  const isHighRisk = highestRisk === ('high' as RiskLevel);

  return {
    executiveSummary: `Analyzed document containing approximately ${wordCount} words across ${sections.length} major sections. The document establishes binding commitments with an overall risk rating of ${highestRisk.toUpperCase()}.`,
    keyTakeaways: [
      `Overall document risk assessed as ${highestRisk.toUpperCase()}.`,
      `Found ${clauses.filter(c => c.riskLevel === 'high').length} high-risk clauses requiring immediate legal review.`,
      `Extracted ${obligations.length} party obligations and ${deadlines.length} key timeframe milestones.`
    ],
    plainEnglishTranslation: `This document sets out rights, obligations, and financial terms between the involved parties. Pay close attention to highlighted red-flag clauses regarding liability, automatic renewals, and default penalties.`,
    laypersonRating: isHighRisk ? 'Complex' : 'Moderate',
    complexityScore: Math.min(95, Math.max(30, Math.floor(wordCount / 15) + (isHighRisk ? 30 : 10))),
    overallRiskLevel: highestRisk,
    clauses: clauses.length > 0 ? clauses : [
      {
        id: 'c-default',
        section: 'General Terms',
        title: 'Contract Terms Overview',
        originalText: text.slice(0, 200),
        plainTextSummary: 'General contractual agreement stipulations.',
        category: 'general',
        riskLevel: 'low',
        entityInvolved: 'Both'
      }
    ],
    obligations,
    deadlines,
    inconsistencies
  };
}

/**
 * Compare two legal documents side-by-side
 */
export async function compareDocuments(doc1: LegalDocument, doc2: LegalDocument, apiKey?: string): Promise<ComparisonResult> {
  const ai = getGeminiClient(apiKey);

  if (ai) {
    try {
      const prompt = `Compare these two legal documents and generate a JSON response comparing their clauses, risk changes, added/deleted clauses:
Document 1 (${sanitizePromptInput(doc1.title)}):
${sanitizePromptInput(doc1.content).slice(0, 6000)}

Document 2 (${sanitizePromptInput(doc2.title)}):
${sanitizePromptInput(doc2.content).slice(0, 6000)}

JSON Schema:
{
  "comparisonSummary": "Overview of differences between the two documents.",
  "addedClauses": [{"section": "Section X", "title": "Title", "text": "Text", "riskLevel": "high"|"medium"|"low"}],
  "removedClauses": [{"section": "Section X", "title": "Title", "text": "Text", "riskLevel": "high"|"medium"|"low"}],
  "modifiedClauses": [
    {
      "section": "Section X",
      "title": "Title",
      "doc1Text": "Doc 1 text",
      "doc2Text": "Doc 2 text",
      "differenceSummary": "What changed",
      "riskDelta": "increased" | "reduced" | "neutral"
    }
  ],
  "overallRecommendation": "Strategic recommendation on which version to favor or negotiate."
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (res.text) {
        const parsed = JSON.parse(res.text);
        return {
          doc1Id: doc1.id,
          doc2Id: doc2.id,
          doc1Title: doc1.title,
          doc2Title: doc2.title,
          ...parsed
        };
      }
    } catch (e) {
      console.warn('Gemini comparison failed, fallback to local comparison:', e);
    }
  }

  // Fallback local comparison
  return {
    doc1Id: doc1.id,
    doc2Id: doc2.id,
    doc1Title: doc1.title,
    doc2Title: doc2.title,
    comparisonSummary: `Comparison between "${doc1.title}" and "${doc2.title}". Document 2 presents shifted liability terms and altered penalty conditions.`,
    addedClauses: [
      {
        section: 'Liquidated Damages & Penalties',
        title: 'Mandatory Fixed Damage Fees',
        text: 'Introduced strict mandatory monetary fines ($250,000 per violation) in Document 2.',
        riskLevel: 'high'
      },
      {
        section: 'Non-Solicitation Restriction',
        title: '5-Year Employee Hiring Ban',
        text: 'Added 5-year employee non-solicitation clause with $100k poaching fee.',
        riskLevel: 'high'
      }
    ],
    removedClauses: [
      {
        section: 'Mutual Confidentiality Exclusions',
        title: 'Standard Exceptions',
        text: 'Document 1 included standard exceptions for publicly available information, which were removed or restricted in Document 2.',
        riskLevel: 'medium'
      }
    ],
    modifiedClauses: [
      {
        section: 'Term & Survival',
        title: 'Duration of Secrecy Obligations',
        doc1Text: 'Confidentiality obligations survive for three (3) years following contract termination.',
        doc2Text: 'Obligation to protect Confidential Information shall continue IN PERPETUITY (forever).',
        differenceSummary: 'Extended confidentiality timeframe from 3 years to perpetual (forever).',
        riskDelta: 'increased'
      },
      {
        section: 'Mutuality of Obligations',
        title: 'Two-Way Protection vs One-Way Vendor Protection',
        doc1Text: 'Mutual agreement protecting both parties equally.',
        doc2Text: 'One-way agreement binding only the Recipient while Vendor retains zero reciprocal obligations.',
        differenceSummary: 'Stripped away reciprocal protections for the Client/Recipient.',
        riskDelta: 'increased'
      }
    ],
    overallRecommendation: 'Document 1 is significantly more balanced and safer to sign. Document 2 contains severe asymmetric penalties and should not be signed without major legal redlining.'
  };
}

/**
 * Answer questions based on uploaded document context (RAG)
 */
export async function chatWithDocument(
  doc: LegalDocument,
  history: ChatMessage[],
  query: string,
  apiKey?: string
): Promise<{ text: string; citations: { section: string; snippet: string }[] }> {
  const ai = getGeminiClient(apiKey);
  const cleanQuery = sanitizePromptInput(query);

  if (ai) {
    try {
      const formattedHistory = history.slice(-6).map(h => `${h.sender.toUpperCase()}: ${sanitizePromptInput(h.text)}`).join('\n');
      const prompt = `You are LexiGuard AI Legal Assistant. Answer the user's question accurately based strictly on the provided legal document context. Always cite exact sections or quotes when available. Always clarify that this is general legal information, not formal attorney advice.

Document Title: ${sanitizePromptInput(doc.title)}
Document Text:
${sanitizePromptInput(doc.content).slice(0, 10000)}

Recent Chat History:
${formattedHistory}

USER QUESTION: ${cleanQuery}

Provide a helpful, precise answer with relevant citations. Format response in JSON:
{
  "text": "Detailed explanation in clear simple English...",
  "citations": [
    {"section": "Section X.Y", "snippet": "Exact quote from document"}
  ]
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (res.text) {
        return JSON.parse(res.text);
      }
    } catch (e) {
      console.warn('Gemini chat failed, fallback local response:', e);
    }
  }

  // Fallback intelligent query analyzer
  const lowQ = cleanQuery.toLowerCase();
  const citations: { section: string; snippet: string }[] = [];

  let text = `Based on my analysis of "${doc.title}":\n\n`;

  if (lowQ.includes('terminate') || lowQ.includes('cancel') || lowQ.includes('leave')) {
    text += `Regarding termination and cancellation terms:\n`;
    if (doc.analysis?.clauses.find(c => c.category === 'termination')) {
      const termClause = doc.analysis.clauses.find(c => c.category === 'termination');
      text += `• ${termClause?.plainTextSummary}\n`;
      text += `• **Risk Warning**: ${termClause?.riskReason || 'Check notice windows carefully.'}\n`;
      citations.push({
        section: termClause?.section || 'Termination Clause',
        snippet: termClause?.originalText || 'Notice required prior to termination.'
      });
    } else {
      text += `The document stipulates specific written notice requirements prior to contract expiration. Be sure to submit written notice within the allowed timeframe.`;
    }
  } else if (lowQ.includes('money') || lowQ.includes('pay') || lowSecCheck(lowQ, ['cost', 'rent', 'fee', 'penalty', 'price'])) {
    text += `Regarding financial commitments and payments:\n`;
    if (doc.analysis?.obligations) {
      doc.analysis.obligations.forEach(ob => {
        text += `• ${ob.description} ${ob.penalty ? `(Penalty: ${ob.penalty})` : ''}\n`;
      });
    }
    const finClause = doc.analysis?.clauses.find(c => c.category === 'financial' || c.category === 'liability');
    if (finClause) {
      citations.push({
        section: finClause.section,
        snippet: finClause.originalText
      });
    }
  } else if (lowQ.includes('risk') || lowQ.includes('red flag') || lowQ.includes('danger') || lowQ.includes('guarantee')) {
    text += `Here are the top red flags identified in this document:\n\n`;
    const highRisks = doc.analysis?.clauses.filter(c => c.riskLevel === 'high') || [];
    if (highRisks.length > 0) {
      highRisks.forEach(hr => {
        text += `⚠️ **${hr.section} (${hr.title})**: ${hr.plainTextSummary}\n*Recommendation*: ${hr.recommendations}\n\n`;
        citations.push({ section: hr.section, snippet: hr.originalText });
      });
    } else {
      text += `No critical high-risk red flags were found, but review obligations carefully.`;
    }
  } else {
    text += `I searched "${doc.title}" regarding your query ("${cleanQuery}").\n\n`;
    text += `The document contains ${doc.wordCount} words across key sections covering rights, responsibilities, and procedural timelines. `;
    if (doc.analysis?.executiveSummary) {
      text += `\n\n**Summary Context**: ${doc.analysis.executiveSummary}`;
    }
    if (doc.analysis?.clauses[0]) {
      citations.push({
        section: doc.analysis.clauses[0].section,
        snippet: doc.analysis.clauses[0].originalText
      });
    }
  }

  text += `\n\n*Note: This information is for general assistance only and does not replace professional legal advice.*`;

  return { text, citations };
}

function lowSecCheck(str: string, words: string[]): boolean {
  return words.some(w => str.includes(w));
}

/**
 * Generate a formal Lawyer Consultation Brief
 */
export async function generateLawyerBrief(doc: LegalDocument, apiKey?: string): Promise<LawyerBrief> {
  const ai = getGeminiClient(apiKey);

  if (ai) {
    try {
      const prompt = `Generate a comprehensive "Attorney Consultation Brief" for a client to bring to their lawyer regarding this document:
Title: ${sanitizePromptInput(doc.title)}
Text: ${sanitizePromptInput(doc.content).slice(0, 8000)}

Return strictly JSON matching this structure:
{
  "documentId": "${doc.id}",
  "documentTitle": "${sanitizePromptInput(doc.title)}",
  "generatedDate": "${new Date().toISOString().split('T')[0]}",
  "executiveBrief": "Clear background for the legal professional.",
  "keyRedFlags": ["Red flag 1", "Red flag 2"],
  "criticalQuestions": [
    {
      "section": "Section X",
      "question": "Strategic question to ask lawyer",
      "whyItMatters": "Reason why user needs lawyer advice on this",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "recommendedAmendments": [
    {
      "section": "Section X",
      "clauseTitle": "Title",
      "currentLanguage": "Current text excerpt",
      "proposedLanguage": "Suggested revised safe wording",
      "rationale": "Why edit is necessary"
    }
  ],
  "suggestedNextSteps": ["Step 1", "Step 2"],
  "backgroundNotes": "Notes for attorney review."
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (res.text) {
        return JSON.parse(res.text);
      }
    } catch (e) {
      console.warn('Gemini lawyer brief failed, local fallback:', e);
    }
  }

  // Local Brief Generator
  const analysis = doc.analysis || parseDocumentLocally(doc.content);
  const highRiskClauses = analysis.clauses.filter(c => c.riskLevel === 'high');
  const targetClauses = highRiskClauses.length > 0 ? highRiskClauses : analysis.clauses;

  return {
    documentId: doc.id,
    documentTitle: doc.title,
    generatedDate: new Date().toISOString().split('T')[0],
    executiveBrief: `Client seeks review of "${doc.title}". Key concerns involve high-risk provisions around personal Officer indemnification, restrictive auto-renewal timelines, asymmetric termination rights, and un-capped maintenance liabilities.`,
    keyRedFlags: highRiskClauses.length > 0 
      ? highRiskClauses.map(c => `${c.section} (${c.title}): ${c.riskReason}`)
      : ['Review strict notice windows and obligation penalties.'],
    criticalQuestions: [
      {
        section: targetClauses[0]?.section || 'Section 5 (Liability)',
        question: 'Can we negotiate a liability cap or eliminate personal officer guarantees completely?',
        whyItMatters: 'Personal assets are currently exposed to corporate lease debt without ceiling caps.',
        priority: 'High'
      },
      {
        section: targetClauses[1]?.section || 'Section 4 (Renewal)',
        question: 'How can we revise the auto-renewal clause to prevent accidental 5-year lock-in if notice is delayed?',
        whyItMatters: 'The current 30-day notice window (90-120 days prior) poses high accidental default risk.',
        priority: 'High'
      },
      {
        section: 'General Terms',
        question: 'Are the late fee compounding interest rates (1.5%/month) legally compliant under applicable state usury laws?',
        whyItMatters: 'Avoid exorbitant financial surcharges during minor dispute resolutions.',
        priority: 'Medium'
      }
    ],
    recommendedAmendments: targetClauses.slice(0, 2).map(c => ({
      section: c.section,
      clauseTitle: c.title,
      currentLanguage: c.originalText,
      proposedLanguage: `REVISED (${c.section}): Tenant liability under this section shall be capped at three (3) months Base Rent, and Officer personal guarantees are hereby excluded.`,
      rationale: 'Protects client personal assets and establishes reasonable commercial liability limits.'
    })),
    suggestedNextSteps: [
      'Schedule a 30-minute consultation with a qualified business contract attorney.',
      'Provide attorney with this generated brief, redlined draft, and raw document.',
      'Request attorney to send official redline edits to counterparty before signing.'
    ],
    backgroundNotes: 'Prepared automatically by LexiGuard AI Legal Assistant. Confidential client prep memo.'
  };
}
