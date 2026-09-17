import React, { useState, useEffect } from 'react';
import type { LegalDocument, LawyerBrief } from '../types/legal';
import { generateLawyerBrief } from '../services/aiService';
import { Briefcase, Printer, Copy, Check, Sparkles, HelpCircle, FileText, ArrowRight, RefreshCw } from 'lucide-react';

interface LawyerPrepTabProps {
  document: LegalDocument;
  apiKey?: string;
}

export const LawyerPrepTab: React.FC<LawyerPrepTabProps> = ({ document, apiKey }) => {
  const [brief, setBrief] = useState<LawyerBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBrief = async () => {
      setLoading(true);
      try {
        const res = await generateLawyerBrief(document, apiKey);
        if (isMounted) setBrief(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBrief();
    return () => { isMounted = false; };
  }, [document.id, apiKey]);

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-200">Preparing Attorney Consultation Brief...</p>
        <p className="text-xs text-slate-400">Synthesizing red flags, targeted questions, and redline amendments</p>
      </div>
    );
  }

  if (!brief) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# LEGAL CONSULTATION BRIEF & ATTORNEY AGENDA\n`;
    md += `Document: ${brief.documentTitle}\nGenerated: ${brief.generatedDate}\n\n`;
    md += `## Executive Summary for Attorney\n${brief.executiveBrief}\n\n`;
    md += `## Strategic Questions to Ask Your Lawyer\n`;
    brief.criticalQuestions.forEach((q, idx) => {
      md += `${idx + 1}. [${q.priority} Priority] ${q.section}: ${q.question}\n   - Why it matters: ${q.whyItMatters}\n\n`;
    });
    md += `## Proposed Redline Amendments\n`;
    brief.recommendedAmendments.forEach((a, idx) => {
      md += `${idx + 1}. ${a.section} (${a.clauseTitle})\n   - Proposed Wording: ${a.proposedLanguage}\n   - Rationale: ${a.rationale}\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Attorney Consultation Prep & Brief Generator</h3>
            <p className="text-xs text-slate-400">Exportable executive memo for taking to a licensed legal professional</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Brief' : 'Copy Brief Markdown'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Attorney Memo</span>
          </button>
        </div>
      </div>

      {/* Printable Brief Document Container */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-700/80 bg-slate-900/90 space-y-6 shadow-2xl">
        {/* Memo Header */}
        <div className="border-b border-slate-700 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">CONFIDENTIAL CLIENT LEGAL PREP BRIEF</span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-1">{brief.documentTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Prepared on: {brief.generatedDate} • LexiGuard GenAI System</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            For Attorney Review
          </span>
        </div>

        {/* Executive Background for Attorney */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Executive Brief for Legal Counsel</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-sans">
            {brief.executiveBrief}
          </p>
        </div>

        {/* Strategic Questions to Ask Attorney */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Targeted Questions to Ask Your Legal Professional</span>
          </h4>

          <div className="space-y-2.5">
            {brief.criticalQuestions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">{q.section}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    q.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {q.priority} Priority
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-100">{q.question}</p>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Why it matters:</strong> {q.whyItMatters}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Proposed Redline Amendments */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Proposed Redline Wording Amendments</span>
          </h4>

          <div className="space-y-3">
            {brief.recommendedAmendments.map((a, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                <div className="text-xs font-bold text-emerald-300">{a.section}: {a.clauseTitle}</div>
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 font-mono">
                  {a.proposedLanguage}
                </div>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Rationale:</strong> {a.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Next Steps */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 space-y-2">
          <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span>Suggested Actionable Next Steps</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {brief.suggestedNextSteps.map((step, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="border-t border-slate-800 pt-4 text-[10px] text-slate-500 text-center leading-normal">
          DISCLAIMER: This consultation brief was generated automatically by LexiGuard AI for informational preparation purposes only. It does not replace independent legal advice from a qualified attorney licensed in your jurisdiction.
        </div>
      </div>
    </div>
  );
};
