import React, { useState } from 'react';
import type { LegalDocument, ComparisonResult } from '../types/legal';
import { compareDocuments } from '../services/aiService';
import { GitCompare, PlusCircle, MinusCircle, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

interface CompareTabProps {
  documents: LegalDocument[];
  activeDocument: LegalDocument | null;
  apiKey?: string;
}

export const CompareTab: React.FC<CompareTabProps> = ({
  documents,
  activeDocument,
  apiKey
}) => {
  const [doc1Id, setDoc1Id] = useState<string>(activeDocument?.id || documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState<string>(
    documents.find(d => d.id !== activeDocument?.id)?.id || documents[1]?.id || ''
  );
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async () => {
    const d1 = documents.find(d => d.id === doc1Id);
    const d2 = documents.find(d => d.id === doc2Id);

    if (!d1 || !d2) return;

    setIsComparing(true);
    try {
      const res = await compareDocuments(d1, d2, apiKey);
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Document Selector Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
        <div className="flex items-center space-x-2.5">
          <GitCompare className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">Multi-Document Contract Comparison Engine</h3>
        </div>
        <p className="text-xs text-slate-400">
          Select two legal documents to analyze clause additions, deletions, shifted risk obligations, and strategic differences side-by-side.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end pt-2">
          {/* Doc 1 Select */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Base Document 1 (e.g. Standard Contract)</label>
            <select
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          {/* VS badge */}
          <div className="hidden lg:flex items-center justify-center pb-2">
            <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-extrabold text-blue-400 flex items-center justify-center">
              VS
            </span>
          </div>

          {/* Doc 2 Select */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Comparison Document 2 (e.g. Counterparty Redline / Revision)</label>
            <select
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={isComparing || !doc1Id || !doc2Id || doc1Id === doc2Id}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
        >
          {isComparing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Comparing Document Differences with GenAI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run Side-by-Side Comparative Analysis</span>
            </>
          )}
        </button>

        {doc1Id === doc2Id && (
          <p className="text-[11px] text-amber-400 text-center">
            * Please select two different documents to perform comparative diff analysis.
          </p>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Summary Banner & Strategic Recommendation */}
          <div className="glass-panel p-6 rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/20 via-slate-900 to-indigo-950/20 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
              <Sparkles className="w-5 h-5" />
              <span>Comparison Executive Summary</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {comparison.comparisonSummary}
            </p>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Overall Recommendation:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{comparison.overallRecommendation}</p>
            </div>
          </div>

          {/* Modified Clauses Diff Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-blue-400" />
              <span>Modified Clauses & Risk Delta ({comparison.modifiedClauses.length})</span>
            </h4>

            {comparison.modifiedClauses.map((clause, idx) => (
              <div key={idx} className="glass-panel rounded-2xl border border-slate-700/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">{clause.section}: {clause.title}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    clause.riskDelta === 'increased'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : clause.riskDelta === 'reduced'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    Risk {clause.riskDelta}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <strong>Key Difference:</strong> {clause.differenceSummary}
                </p>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{comparison.doc1Title}</span>
                    <p className="text-slate-300 font-serif italic text-[11px]">"{clause.doc1Text}"</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{comparison.doc2Title}</span>
                    <p className="text-slate-300 font-serif italic text-[11px]">"{clause.doc2Text}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Added & Removed Clauses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Added Clauses */}
            <div className="glass-panel p-5 rounded-2xl border border-red-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
                <PlusCircle className="w-4 h-4" />
                <span>Clauses Added in Document 2 ({comparison.addedClauses.length})</span>
              </div>
              <div className="space-y-2">
                {comparison.addedClauses.map((added, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-red-500/20 text-xs space-y-1">
                    <div className="font-bold text-red-300">{added.section}: {added.title}</div>
                    <p className="text-slate-300 leading-normal text-[11px]">{added.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Removed Clauses */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <MinusCircle className="w-4 h-4" />
                <span>Clauses Removed / Excluded in Document 2 ({comparison.removedClauses.length})</span>
              </div>
              <div className="space-y-2">
                {comparison.removedClauses.map((removed, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 text-xs space-y-1">
                    <div className="font-bold text-amber-300">{removed.section}: {removed.title}</div>
                    <p className="text-slate-300 leading-normal text-[11px]">{removed.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
