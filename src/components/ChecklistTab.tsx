import React, { useState } from 'react';
import type { LegalDocument, DeadlineItem } from '../types/legal';
import { CheckSquare, Clock, Download, Check, Copy } from 'lucide-react';

interface ChecklistTabProps {
  document: LegalDocument;
}

export const ChecklistTab: React.FC<ChecklistTabProps> = ({ document }) => {
  const analysis = document.analysis;

  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(analysis?.deadlines || []);
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  const toggleComplete = (id: string) => {
    setDeadlines(prev =>
      prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item)
    );
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deadlines, null, 2));
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${document.title}_Checklist.json`);
    window.document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyMarkdown = () => {
    let md = `# Actionable Checklist - ${document.title}\n\n`;
    deadlines.forEach(item => {
      md += `- [${item.isCompleted ? 'x' : ' '}] **${item.title}** (${item.dateOrTimeframe})\n  - Type: ${item.type.toUpperCase()}\n  - Details: ${item.details}\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Actionable Compliance & Deadline Checklist</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auto-extracted operational obligations, strict notice windows, and critical payment timelines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Progress Summary Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            {deadlines.filter(d => d.isCompleted).length}/{deadlines.length}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Compliance Progress Tracker</div>
            <div className="text-[11px] text-slate-400">
              {deadlines.length > 0
                ? `${Math.round((deadlines.filter(d => d.isCompleted).length / deadlines.length) * 100)}% of action items marked completed`
                : 'No explicit deadlines detected.'}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Checklist Items */}
      <div className="space-y-3">
        {deadlines.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleComplete(item.id)}
            className={`glass-panel p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-4 ${
              item.isCompleted
                ? 'border-slate-800 bg-slate-900/30 opacity-60'
                : item.type === 'notice' || item.type === 'payment'
                ? 'border-amber-500/30 bg-slate-900/80 hover:border-amber-500/60'
                : 'border-slate-700/80 bg-slate-900/80 hover:border-blue-500/50'
            }`}
          >
            {/* Custom Checkbox */}
            <div className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center transition flex-shrink-0 ${
              item.isCompleted
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'border-slate-600 bg-slate-950 text-transparent hover:border-emerald-500'
            }`}>
              <Check className="w-4 h-4 stroke-[3]" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {item.title}
                  </span>
                  {item.clauseRef && (
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {item.clauseRef}
                    </span>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.type === 'notice'
                    ? 'bg-red-500/20 text-red-400'
                    : item.type === 'payment'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.type}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-normal">{item.details}</p>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span><strong>Target Date/Window:</strong> {item.dateOrTimeframe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
