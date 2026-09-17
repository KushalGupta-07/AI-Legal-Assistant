import React, { useState } from 'react';
import type { LegalDocument, Clause } from './types/legal';
import { SAMPLE_DOCUMENTS } from './services/sampleDocuments';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { FormattedDocumentReader } from './components/FormattedDocumentReader';
import { SummaryTab } from './components/SummaryTab';
import { RiskMatrixTab } from './components/RiskMatrixTab';
import { CompareTab } from './components/CompareTab';
import { ChatTab } from './components/ChatTab';
import { ChecklistTab } from './components/ChecklistTab';
import { LawyerPrepTab } from './components/LawyerPrepTab';

import { Sparkles, AlertTriangle, GitCompare, MessageSquare, CheckSquare, Briefcase, FileText, Plus, Columns, Maximize2 } from 'lucide-react';

interface TabItem {
  id: 'summary' | 'risk' | 'compare' | 'chat' | 'checklist' | 'lawyer';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
}

export function App() {
  const [documents, setDocuments] = useState<LegalDocument[]>(SAMPLE_DOCUMENTS);
  const [activeDocId, setActiveDocId] = useState<string>(SAMPLE_DOCUMENTS[0].id);
  const [activeTab, setActiveTab] = useState<'summary' | 'risk' | 'compare' | 'chat' | 'checklist' | 'lawyer'>('summary');
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('GEMINI_API_KEY') || '');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [highlightedClauseId, setHighlightedClauseId] = useState<string | null>(null);

  const activeDocument = documents.find(d => d.id === activeDocId) || documents[0] || null;

  const handleDocumentAdded = (newDoc: LegalDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('GEMINI_API_KEY', key);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
  };

  const handleSelectClause = (clause: Clause) => {
    setHighlightedClauseId(clause.id);
    setActiveTab('risk');
  };

  const tabs: TabItem[] = [
    { id: 'summary', label: '1. Plain Summary', icon: Sparkles, badge: activeDocument?.analysis?.laypersonRating },
    { id: 'risk', label: '2. Clause & Risk Matrix', icon: AlertTriangle, count: activeDocument?.analysis?.clauses.filter(c => c.riskLevel === 'high').length },
    { id: 'compare', label: '3. Compare Contracts', icon: GitCompare },
    { id: 'chat', label: '4. AI Legal Chat RAG', icon: MessageSquare },
    { id: 'checklist', label: '5. Action Checklist', icon: CheckSquare, count: activeDocument?.analysis?.deadlines.length },
    { id: 'lawyer', label: '6. Lawyer Consultation Brief', icon: Briefcase }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-navy-950 text-slate-100' : 'light bg-slate-50 text-slate-900'}`}>
      {/* Top Sticky Navbar */}
      <Navbar
        documents={documents}
        activeDocument={activeDocument}
        onSelectDocument={(doc) => setActiveDocId(doc.id)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenViewer={() => setIsViewerOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Prominent Legal Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Active Document Overview Card */}
        {activeDocument && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-slate-100 truncate max-w-md md:max-w-xl">
                    {activeDocument.title}
                  </h1>
                  {activeDocument.analysis?.overallRiskLevel === 'high' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                      High Risk Flagged
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Standard Terms
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded: {activeDocument.uploadDate} • {activeDocument.wordCount} words • {activeDocument.analysis?.clauses.length || 0} extracted clauses
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Split View Toggle */}
              <button
                onClick={() => setIsSplitView(!isSplitView)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
                  isSplitView
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toggle Side-by-Side Split View"
              >
                {isSplitView ? <Columns className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSplitView ? 'Split View Active' : 'Full Tab View'}</span>
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1 shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Another</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Workspace Layout */}
        <div className={isSplitView && activeDocument ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'block'}>
          {/* Left Column: Human-Readable Document Reader (When Split View is Enabled) */}
          {isSplitView && activeDocument && (
            <div className="lg:col-span-5 h-[78vh] sticky top-24">
              <FormattedDocumentReader
                document={activeDocument}
                highlightedClauseId={highlightedClauseId}
                onSelectClause={handleSelectClause}
              />
            </div>
          )}

          {/* Right Column / Full Width: Analysis Tabs */}
          <div className={isSplitView && activeDocument ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
            {activeTab === 'summary' && activeDocument && (
              <SummaryTab
                document={activeDocument}
                onNavigateToRisk={() => setActiveTab('risk')}
                onNavigateToPrep={() => setActiveTab('lawyer')}
              />
            )}

            {activeTab === 'risk' && activeDocument && (
              <RiskMatrixTab document={activeDocument} />
            )}

            {activeTab === 'compare' && (
              <CompareTab
                documents={documents}
                activeDocument={activeDocument}
                apiKey={apiKey}
              />
            )}

            {activeTab === 'chat' && activeDocument && (
              <ChatTab
                document={activeDocument}
                apiKey={apiKey}
                onOpenViewer={() => setIsViewerOpen(true)}
              />
            )}

            {activeTab === 'checklist' && activeDocument && (
              <ChecklistTab document={activeDocument} />
            )}

            {activeTab === 'lawyer' && activeDocument && (
              <LawyerPrepTab document={activeDocument} apiKey={apiKey} />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAdded={handleDocumentAdded}
        apiKey={apiKey}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={activeDocument}
      />
    </div>
  );
}

export default App;
