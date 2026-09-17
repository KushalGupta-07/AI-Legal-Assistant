export type RiskLevel = 'high' | 'medium' | 'low' | 'info';

export type ClauseCategory = 
  | 'financial'
  | 'liability'
  | 'termination'
  | 'obligations'
  | 'ip_confidentiality'
  | 'warranties'
  | 'dispute'
  | 'general';

export interface Clause {
  id: string;
  section: string;
  title: string;
  originalText: string;
  plainTextSummary: string;
  category: ClauseCategory;
  riskLevel: RiskLevel;
  riskReason?: string;
  recommendations?: string;
  entityInvolved?: 'User' | 'Counterparty' | 'Both';
  tags?: string[];
}

export interface Obligation {
  id: string;
  clauseId: string;
  party: 'User' | 'Counterparty' | 'Both';
  description: string;
  deadline?: string;
  isStrict: boolean;
  penalty?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  dateOrTimeframe: string;
  type: 'payment' | 'notice' | 'renewal' | 'compliance' | 'deliverable';
  details: string;
  isCompleted: boolean;
  clauseRef?: string;
}

export interface Inconsistency {
  id: string;
  title: string;
  description: string;
  clauseIds: string[];
  severity: 'high' | 'medium' | 'low';
  resolutionSuggestion: string;
}

export interface DocumentAnalysis {
  executiveSummary: string;
  keyTakeaways: string[];
  plainEnglishTranslation: string;
  laypersonRating: 'Simple' | 'Moderate' | 'Complex' | 'Very Complex';
  complexityScore: number; // 1-100
  overallRiskLevel: RiskLevel;
  clauses: Clause[];
  obligations: Obligation[];
  deadlines: DeadlineItem[];
  inconsistencies: Inconsistency[];
}

export interface LegalDocument {
  id: string;
  title: string;
  type: 'contract' | 'agreement' | 'policy' | 'notice' | 'custom';
  fileName: string;
  content: string;
  uploadDate: string;
  wordCount: number;
  analysis?: DocumentAnalysis;
}

export interface ModifiedClauseDiff {
  section: string;
  title: string;
  doc1Text: string;
  doc2Text: string;
  differenceSummary: string;
  riskDelta: 'increased' | 'reduced' | 'neutral';
}

export interface ComparisonResult {
  doc1Id: string;
  doc2Id: string;
  doc1Title: string;
  doc2Title: string;
  comparisonSummary: string;
  addedClauses: { section: string; title: string; text: string; riskLevel: RiskLevel }[];
  removedClauses: { section: string; title: string; text: string; riskLevel: RiskLevel }[];
  modifiedClauses: ModifiedClauseDiff[];
  overallRecommendation: string;
}

export interface AttorneyQuestion {
  section: string;
  question: string;
  whyItMatters: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface RecommendedAmendment {
  section: string;
  clauseTitle: string;
  currentLanguage: string;
  proposedLanguage: string;
  rationale: string;
}

export interface LawyerBrief {
  documentId: string;
  documentTitle: string;
  generatedDate: string;
  executiveBrief: string;
  keyRedFlags: string[];
  criticalQuestions: AttorneyQuestion[];
  recommendedAmendments: RecommendedAmendment[];
  suggestedNextSteps: string[];
  backgroundNotes: string;
}

export interface Citation {
  section: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Citation[];
}
