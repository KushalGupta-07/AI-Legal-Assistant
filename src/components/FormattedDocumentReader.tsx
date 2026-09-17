import React, { useState } from 'react';
import type { LegalDocument, Clause } from '../types/legal';
import { Search, Copy, Check, FileText, Scale, Eye } from 'lucide-react';

interface FormattedDocumentReaderProps {
  document: LegalDocument;
  highlightedClauseId?: string | null;
  onSelectClause?: (clause: Clause) => void;
  className?: string;
}

export const FormattedDocumentReader: React.FC<FormattedDocumentReaderProps> = ({
  document,
  highlightedClauseId,
  onSelectClause,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paragraphs = document.content.split('\n\n').filter(Boolean);
  const clauses = document.analysis?.clauses || [];

  const getClauseForText = (text: string): Clause | undefined => {
    return clauses.find(c => 
      text.toLowerCase().includes(c.title.toLowerCase()) || 
      (c.section && text.toLowerCase().includes(c.section.toLowerCase())) ||
      text.includes(c.originalText.slice(0, 30))
    );
  };

  return (
    <div className={`glass-panel rounded-2xl border border-slate-700/80 flex flex-col h-full bg-slate-900/90 shadow-2xl overflow-hidden ${className}`}>
      {/* Reader Control Bar */}
      <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-slate-100 truncate">{document.title}</h3>
            <p className="text-[10px] text-slate-400">Human-Readable Formatted Document ({document.wordCount} words)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Font Size Toggle */}
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
            title="Toggle Text Size"
          >
            {fontSize === 'normal' ? 'A+' : 'A-'}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3.5 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center space-x-2">
        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Filter document text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-[10px] text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Formatted Content Viewport */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/30 selection:bg-blue-500 selection:text-white">
        {paragraphs.map((para, idx) => {
          const isSectionHeader = /^SECTION\s+\d+|^ARTICLE\s+\d+|^\d+\.\s+[A-Z]/i.test(para.trim());
          const matchingClause = getClauseForText(para);
          const isHighlighted = matchingClause && matchingClause.id === highlightedClauseId;
          const matchesSearch = searchTerm.trim().length > 1 && para.toLowerCase().includes(searchTerm.toLowerCase());

          if (searchTerm && !matchesSearch) return null;

          return (
            <div
              key={idx}
              className={`group relative p-3.5 rounded-xl transition border ${
                isHighlighted
                  ? 'bg-blue-900/30 border-blue-500/60 ring-2 ring-blue-500/30'
                  : matchingClause?.riskLevel === 'high'
                  ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/60'
                  : matchingClause?.riskLevel === 'medium'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : isSectionHeader
                  ? 'bg-slate-900/90 border-blue-500/30 mt-4'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Clause Risk Badge Callout */}
              {matchingClause && (
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold text-blue-300">{matchingClause.section}: {matchingClause.title}</span>
                  </div>
                  <button
                    onClick={() => onSelectClause && onSelectClause(matchingClause)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition flex items-center space-x-1 ${
                      matchingClause.riskLevel === 'high'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                        : matchingClause.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    <span>{matchingClause.riskLevel} risk</span>
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Paragraph Text */}
              <p
                className={`font-serif leading-relaxed text-slate-200 ${
                  fontSize === 'large' ? 'text-sm' : 'text-xs'
                } ${isSectionHeader ? 'font-sans font-extrabold text-blue-400 tracking-wide text-sm' : ''}`}
              >
                {para}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
