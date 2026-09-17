import React, { useState, useEffect, useRef } from 'react';
import { X, Key, CheckCircle2, Cpu, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevApiKey, setPrevApiKey] = useState(apiKey);

  if (apiKey !== prevApiKey) {
    setPrevApiKey(apiKey);
    setInputKey(apiKey);
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus input on open
    setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Close API Key modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 id="api-key-modal-title" className="text-lg font-bold text-slate-100">Google Gemini API Key</h3>
            <p className="text-xs text-slate-400">Connect your Google Gemini API for live GenAI analysis</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="gemini-api-key-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              API Key (stored locally in browser storage)
            </label>
            <div className="relative">
              <input
                id="gemini-api-key-input"
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center space-x-2 font-semibold text-slate-200">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Model Config: Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              When an API key is present, document analysis, Q&A citations, and attorney briefs use live Gemini Generative AI. Without a key, the system runs on our built-in offline legal intelligence engine.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 underline focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
            >
              <span>Get Free Gemini API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-red-400 underline focus-visible:ring-2 focus-visible:ring-red-500 rounded"
              >
                Clear Key
              </button>
            )}
          </div>

          <div className="pt-3 flex items-center space-x-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save API Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
