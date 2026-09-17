import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';
import type { LegalDocument } from '../types/legal';
import { SAMPLE_DOCUMENTS } from '../services/sampleDocuments';
import { extractTextFromFile } from '../services/pdfService';
import { analyzeDocument } from '../services/aiService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: LegalDocument) => void;
  apiKey?: string;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAdded,
  apiKey
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File "${file.name}" exceeds the 25MB maximum size limit.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 20) {
        throw new Error('Unable to extract readable text content from file.');
      }

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const analysis = await analyzeDocument(text, file.name, apiKey);

      const newDoc: LegalDocument = {
        id: `uploaded-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        type: 'contract',
        fileName: file.name,
        content: text,
        uploadDate: new Date().toISOString().split('T')[0],
        wordCount,
        analysis
      };

      onDocumentAdded(newDoc);
      setIsProcessing(false);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to parse document. Please check file format.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSelectPreset = (sampleDoc: LegalDocument) => {
    onDocumentAdded(sampleDoc);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Close document upload modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 id="upload-modal-title" className="text-lg font-bold text-slate-100">Upload Legal Document</h3>
            <p className="text-xs text-slate-400">Upload your PDF, DOCX, or TXT contracts, or select a pre-loaded sample dataset</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer relative mb-6 ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.txt,.docx,.md,.json"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isProcessing}
            aria-label="Choose file to upload"
          />
          {isProcessing ? (
            <div className="py-4 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-blue-400">Analyzing Document with GenAI Engine...</p>
              <p className="text-xs text-slate-400">Extracting clauses, risk factors, deadlines, and key terms</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-blue-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Drop your contract file here, or <span className="text-blue-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT, MD (Max 25MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Or Select a Sample Real-World Contract (Instant Test)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectPreset(sample)}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 text-left transition group focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between">
                  <FileText className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  {sample.analysis?.overallRiskLevel === 'high' ? (
                    <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      High Risk
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Standard
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-2 line-clamp-2">
                  {sample.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {sample.wordCount} words • Preset
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
