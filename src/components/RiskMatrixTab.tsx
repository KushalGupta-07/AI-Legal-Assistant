import React, { useState } from 'react';
import type { LegalDocument, RiskLevel } from '../types/legal';
import { AlertTriangle, Filter, ChevronRight, Scale, Lightbulb, AlertOctagon } from 'lucide-react';

interface RiskMatrixTabProps {
  document: LegalDocument;
}

export const RiskMatrixTab: React.FC<RiskMatrixTabProps> = ({ document }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);

  const analysis = document.analysis;
  if (!analysis) return null;

  const clauses = analysis.clauses || [];

  const filteredClauses = clauses.filter(clause => {
    const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || clause.riskLevel === selectedRisk;
    return matchesCategory && matchesRisk;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">High Risk</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">Medium Risk</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Standard</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Clause Risk Matrix</span>
          <span className="text-xs text-slate-400">({filteredClauses.length} clauses matched)</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="financial">Financial & Escalations</option>
            <option value="liability">Liability & Indemnity</option>
            <option value="termination">Termination & Renewals</option>
            <option value="obligations">Operational Obligations</option>
            <option value="ip_confidentiality">IP & Secrecy</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk Red Flags Only</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk Standard</option>
          </select>
        </div>
      </div>

      {/* Inconsistencies & Conflict Warning Box */}
      {analysis.inconsistencies && analysis.inconsistencies.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/30 via-slate-900 to-red-950/30 space-y-3">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <span>Detected Contractual Inconsistencies & Contradictions ({analysis.inconsistencies.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.inconsistencies.map((inc) => (
              <div key={inc.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-300">{inc.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 uppercase">
                    {inc.severity} Conflict
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">{inc.description}</p>
                <div className="pt-1 text-[11px] text-amber-300 flex items-start space-x-1">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span><strong>Fix Suggestion:</strong> {inc.resolutionSuggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clause Matrix List */}
      <div className="space-y-4">
        {filteredClauses.map((clause) => {
          const isExpanded = activeClauseId === clause.id;
          return (
            <div
              key={clause.id}
              className={`glass-panel rounded-2xl border transition overflow-hidden ${
                clause.riskLevel === 'high'
                  ? 'border-red-500/30 bg-red-950/5'
                  : clause.riskLevel === 'medium'
                  ? 'border-amber-500/30 bg-amber-950/5'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              {/* Clause Header Bar */}
              <div
                onClick={() => setActiveClauseId(isExpanded ? null : clause.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2 rounded-xl ${
                    clause.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-blue-400'
                  }`}>
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-400 font-mono">{clause.section}</span>
                      <span className="text-sm font-bold text-slate-100">{clause.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{clause.plainTextSummary}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getRiskBadge(clause.riskLevel)}
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className={`px-5 pb-5 pt-2 border-t border-slate-800/60 grid grid-cols-1 lg:grid-cols-2 gap-4 ${isExpanded ? 'block' : 'hidden'}`}>
                {/* Left: Original Contract Excerpt */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Original Text Excerpt</span>
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-serif text-xs text-slate-300 italic leading-relaxed">
                    "{clause.originalText}"
                  </div>
                </div>

                {/* Right: Plain Language & Risk Analysis */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Plain English Explanation</span>
                    <p className="text-xs text-slate-200 mt-1 leading-normal bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      {clause.plainTextSummary}
                    </p>
                  </div>

                  {clause.riskReason && (
                    <div>
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Why This Is Risky</span>
                      </span>
                      <p className="text-xs text-red-200/90 mt-1 leading-normal bg-red-950/30 p-2.5 rounded-xl border border-red-500/20">
                        {clause.riskReason}
                      </p>
                    </div>
                  )}

                  {clause.recommendations && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Suggested Negotiation Counter-Offer</span>
                      </span>
                      <p className="text-xs text-emerald-200/90 mt-1 leading-normal bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                        {clause.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
