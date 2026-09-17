import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Search, FileText, AlignLeft } from 'lucide-react';
import type { LegalDocument } from '../types/legal';
import { sanitizeToHumanReadableText } from '../services/pdfService';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  // Ensure content is sanitized into clean human readable text
  const cleanContent = sanitizeToHumanReadableText(document.content);
  const paragraphs = cleanContent.split('\n\n').filter(Boolean);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="viewer-modal-title" className="text-base font-bold text-slate-100">{document.title}</h3>
              <p className="text-xs text-slate-400">
                Human-Readable Source Viewer • {document.fileName} ({document.wordCount} words)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Copy all document text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Clean Text' : 'Copy All Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close document viewer modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search document text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1"
              aria-label="Search document text"
            />
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <AlignLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>{paragraphs.length} Formatted Paragraphs</span>
          </div>
        </div>

        {/* Human Readable Document Content View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40 selection:bg-blue-500 selection:text-white font-serif text-sm leading-relaxed text-slate-200">
          {paragraphs.map((para, idx) => {
            const isHeader = /^SECTION\s+\d+|^ARTICLE\s+\d+|^\d+\.\s+[A-Z]/i.test(para.trim());
            const isMatch = searchTerm.trim().length > 1 && para.toLowerCase().includes(searchTerm.toLowerCase());

            if (searchTerm && !isMatch) return null;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl transition ${
                  isMatch ? 'bg-amber-500/20 text-amber-200 font-semibold border border-amber-500/40' : ''
                } ${
                  isHeader
                    ? 'font-sans font-bold text-blue-400 text-base mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/60'
                    : 'bg-slate-900/30 border border-slate-800/40'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-500 mb-1 select-none">Paragraph {idx + 1}</div>
                <div>{para}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
