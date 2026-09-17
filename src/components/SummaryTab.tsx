import React from 'react';
import type { LegalDocument } from '../types/legal';
import { Sparkles, AlertTriangle, FileCheck, HelpCircle, Layers, CheckCircle2, Zap, ShieldAlert } from 'lucide-react';

interface SummaryTabProps {
  document: LegalDocument;
  onNavigateToRisk: () => void;
  onNavigateToPrep: () => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  document,
  onNavigateToRisk,
  onNavigateToPrep
}) => {
  const analysis = document.analysis;

  if (!analysis) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No analysis available for this document.</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'badge-glow-high text-red-300';
      case 'medium': return 'badge-glow-medium text-amber-300';
      default: return 'badge-glow-low text-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Complexity Rating */}
        <div className="glass-card group h-full overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/60 p-4 shadow-[0_18px_30px_-20px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-[0_20px_35px_-18px_rgba(59,130,246,0.45)]">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-500/35 bg-gradient-to-br from-blue-500/20 to-blue-600/5 text-blue-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-10px_rgba(59,130,246,0.7)]">
              <Layers className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Complexity Rating</span>
              <div className="flex items-center space-x-2 text-base font-black text-slate-100">
                <span>{analysis.laypersonRating}</span>
                <span className="text-xs font-normal text-slate-400">({analysis.complexityScore}/100)</span>
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-800/90">
                <div
                  className={`h-full rounded-full ${
                    analysis.complexityScore > 75 ? 'bg-gradient-to-r from-amber-500 to-red-500' : analysis.complexityScore > 40 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  }`}
                  style={{ width: `${analysis.complexityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="glass-card group h-full overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/60 p-4 shadow-[0_18px_30px_-20px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-[0_20px_35px_-18px_rgba(239,68,68,0.35)]">
          <div className="flex items-center space-x-4">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border ${
              analysis.overallRiskLevel === 'high' ? 'border-red-500/40 bg-gradient-to-br from-red-500/25 to-red-600/5 text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-10px_rgba(239,68,68,0.6)]' : 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-10px_rgba(16,185,129,0.5)]'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Overall Risk Profile</span>
              <div className="mt-1.5 flex items-center space-x-2">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-black uppercase tracking-[0.12em] ${getRiskColor(analysis.overallRiskLevel)}`}>
                  {analysis.overallRiskLevel} Risk
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {analysis.clauses.filter(c => c.riskLevel === 'high').length} high-risk clauses found
              </p>
            </div>
          </div>
        </div>

        {/* Word Count & Profile */}
        <div className="glass-card group h-full overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/60 p-4 shadow-[0_18px_30px_-20px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-[0_20px_35px_-18px_rgba(99,102,241,0.35)]">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-500/35 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-10px_rgba(99,102,241,0.65)]">
              <FileCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Document Metrics</span>
              <div className="mt-1 text-base font-black text-slate-100">{document.wordCount} words</div>
              <p className="mt-0.5 text-[11px] text-slate-400">{analysis.clauses.length} extracted clauses</p>
            </div>
          </div>
        </div>

        {/* Lawyer Prep Action Box */}
        <div className="glass-card group h-full overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/55 via-indigo-950/50 to-slate-950/80 p-4 shadow-[0_18px_30px_-20px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/60 hover:shadow-[0_20px_35px_-18px_rgba(59,130,246,0.55)]">
          <div className="flex h-full flex-col justify-center space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">Lawyer Prep Memo</span>
            <button
              onClick={onNavigateToPrep}
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-[0_10px_18px_-10px_rgba(59,130,246,0.9)] transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_12px_24px_-12px_rgba(99,102,241,0.95)]"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Generate Attorney Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Executive Summary & Plain English Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100">Executive Summary</h3>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            {analysis.executiveSummary}
          </p>

          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Executive Takeaways</span>
            </h4>
            <div className="space-y-2">
              {analysis.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                  <span className="w-5 h-5 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plain-English Layperson Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-slate-900 to-amber-950/10 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-amber-500/20 pb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-amber-200">Plain English Breakdown ("What This Means for You")</h3>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs text-slate-200 leading-relaxed space-y-2 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Simplified Translation:</span>
            <p className="text-slate-300 leading-relaxed text-xs">{analysis.plainEnglishTranslation}</p>
          </div>

          {/* High-Risk Red Flag Alert Box */}
          {analysis.clauses.filter(c => c.riskLevel === 'high').length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2.5 shadow-lg">
              <div className="flex items-center space-x-2 text-red-400 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>Critical Red Flags Detected ({analysis.clauses.filter(c => c.riskLevel === 'high').length})</span>
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                This document contains <strong className="text-red-400 font-bold">{analysis.clauses.filter(c => c.riskLevel === 'high').length} severe high-risk clauses</strong> (e.g. personal officer guarantees, strict auto-renewals, or uncapped indemnities).
              </p>
              <button
                onClick={onNavigateToRisk}
                className="mt-1 text-xs font-bold text-red-400 hover:text-red-300 underline flex items-center space-x-1"
              >
                <span>Inspect Red Flag Clauses in Risk Matrix &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
