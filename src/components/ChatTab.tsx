import React, { useState, useRef, useEffect } from 'react';
import type { LegalDocument, ChatMessage } from '../types/legal';
import { chatWithDocument } from '../services/aiService';
import { Send, Sparkles, Bot, User, Bookmark, ExternalLink, RefreshCw } from 'lucide-react';

interface ChatTabProps {
  document: LegalDocument;
  apiKey?: string;
  onOpenViewer?: () => void;
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let messageCounter = 0;
function createUniqueId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}-${Date.now()}`;
}

export const ChatTab: React.FC<ChatTabProps> = ({ document, apiKey, onOpenViewer }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am LexiGuard AI. I am trained on "${document.title}". Ask me any question regarding terms, notice periods, financial obligations, or potential red flags!`,
      timestamp: getFormattedTime()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const smartPrompts = [
    'What are my main financial obligations?',
    'Can I terminate this agreement early?',
    'Are there any automatic renewal traps?',
    'What are the biggest red flag risks?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userTimestamp = getFormattedTime();
    const userMsg: ChatMessage = {
      id: createUniqueId('user'),
      sender: 'user',
      text: query,
      timestamp: userTimestamp
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await chatWithDocument(document, messages, query, apiKey);
      const botTimestamp = getFormattedTime();
      const botMsg: ChatMessage = {
        id: createUniqueId('bot'),
        sender: 'assistant',
        text: res.text,
        timestamp: botTimestamp,
        citations: res.citations
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[72vh] flex flex-col glass-panel rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-100">Document Assistant</span>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Context Loaded
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-sm">Grounded on: {document.title}</p>
          </div>
        </div>

        {onOpenViewer && (
          <button
            onClick={onOpenViewer}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="View original source document"
          >
            <span>View Original Document</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40"
        aria-live="polite"
        aria-label="Chat conversation log"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-slate-700'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-700/80 text-slate-200 shadow-md'
            }`}>
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5 mt-2">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    <Bookmark className="w-3 h-3" />
                    <span>Document Citation References ({msg.citations.length})</span>
                  </div>
                  {msg.citations.map((cit, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-amber-500/20 text-[11px] text-slate-300">
                      <span className="font-bold text-amber-300">{cit.section}:</span> "{cit.snippet}"
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-slate-400 text-right pt-1">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold p-2" aria-status="loading">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>LexiGuard AI searching document context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Smart Prompt Chips */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Suggested Questions:</span>
        {smartPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 flex-shrink-0 transition focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about this document (e.g., 'What is my notice deadline?')..."
          className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
          aria-label="Ask a question about the document"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition shadow-md shadow-blue-600/20 focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
