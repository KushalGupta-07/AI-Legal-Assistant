import React, { useState, useEffect } from 'react';
import { Scale, Upload, Key, Sun, Moon, FileText, ChevronDown, Search } from 'lucide-react';
import type { LegalDocument } from '../types/legal';

interface NavbarProps {
  documents: LegalDocument[];
  activeDocument: LegalDocument | null;
  onSelectDocument: (doc: LegalDocument) => void;
  onOpenUpload: () => void;
  onOpenApiKey: () => void;
  onOpenViewer: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onOpenUpload,
  onOpenApiKey,
  onOpenViewer,
  isDarkMode,
  onToggleTheme,
  hasApiKey
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [docSearch, setDocSearch] = useState('');

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(docSearch.toLowerCase()));

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/60 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-2xl">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 blur opacity-30 group-hover:opacity-60 transition duration-300 -z-10" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-amber-300 bg-clip-text text-transparent">
              LexiGuard AI
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/40">
              GenAI Assistant
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Complex legal docs simplified into layperson intelligence
          </p>
        </div>
      </div>

      {/* Active Document Selector & Controls */}
      <div className="flex items-center space-x-3">
        {/* Document Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2 cursor-pointer transition shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="Select loaded document"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <div className="text-left max-w-[140px] sm:max-w-[200px] truncate">
              <div className="text-xs font-bold text-slate-100 truncate">
                {activeDocument ? activeDocument.title : 'Select Document'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <span>{activeDocument ? `${activeDocument.wordCount} words` : 'No document selected'}</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              role="menu"
              aria-orientation="vertical"
              aria-label="Loaded contract list"
            >
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Loaded Contracts ({documents.length})
                </span>
              </div>

              {/* Document Search Filter */}
              <div className="my-2 px-2 py-1.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-200 outline-none"
                  aria-label="Filter documents by title"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 my-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    role="menuitem"
                    onClick={() => {
                      onSelectDocument(doc);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      activeDocument?.id === doc.id
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate pr-2">{doc.title}</span>
                    {doc.analysis?.overallRiskLevel === 'high' ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" title="High Risk Flagged" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-2.5 mt-2">
                <button
                  onClick={() => {
                    onOpenUpload();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center justify-center space-x-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/30 transition focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Contract</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Document Source button */}
        {activeDocument && (
          <button
            onClick={onOpenViewer}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition flex items-center space-x-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-500"
            title="View Formatted Source Text"
            aria-label="View formatted document source text"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">View Source</span>
          </button>
        )}

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Upload contract"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Contract</span>
        </button>

        {/* Gemini API Key button */}
        <button
          onClick={onOpenApiKey}
          className={`p-2 rounded-xl border transition flex items-center space-x-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            hasApiKey
              ? 'badge-glow-low text-emerald-300 hover:bg-emerald-500/30'
              : 'badge-glow-medium text-amber-300 hover:bg-amber-500/30'
          }`}
          title={hasApiKey ? 'Gemini Live AI Active' : 'Configure Gemini API Key'}
          aria-label={hasApiKey ? 'Gemini Live AI Active' : 'Configure Gemini API Key'}
        >
          <Key className="w-4 h-4" />
          <span className="hidden lg:inline">{hasApiKey ? 'Gemini Live AI' : 'Set Gemini Key'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition focus-visible:ring-2 focus-visible:ring-blue-500"
          title="Toggle Dark/Light Mode"
          aria-label="Toggle dark and light theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>
      </div>
    </header>
  );
};
