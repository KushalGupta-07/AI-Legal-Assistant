import React, { useState } from 'react';
import { AlertTriangle, X, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1 flex items-center justify-between text-[11px] text-amber-300/80">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Notice: General Legal Information & AI Assistance — Not Professional Legal Advice.</span>
        </div>
        <button 
          onClick={() => setDismissed(false)}
          className="underline text-amber-400 hover:text-amber-200"
        >
          View Full Disclaimer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 lg:px-8 py-2.5 flex items-center justify-between text-xs text-amber-200 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <p className="leading-tight">
          <strong className="text-amber-300 font-semibold">Important Legal Notice:</strong> LexiGuard AI provides automated document summarization, clause risk classification, and general information. This system does <span className="underline decoration-amber-400 font-bold">NOT</span> constitute formal attorney-client legal advice or representation. Consult a licensed legal professional before executing binding legal agreements.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-amber-400 hover:text-amber-200 rounded-lg hover:bg-amber-500/10 transition ml-4 flex-shrink-0"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
