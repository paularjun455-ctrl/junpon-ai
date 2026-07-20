import React, { useState } from 'react';
import { ArrowLeft, Search, Grid } from 'lucide-react';
import { Route } from '../types';
import { TOOLS } from '../data';

interface SearchViewProps {
  onNavigate: (route: Route) => void;
  onPreFillChatPrompt?: (prompt: string) => void;
  onBack: () => void;
}

export default function SearchView({ onNavigate, onPreFillChatPrompt, onBack }: SearchViewProps) {
  const [query, setQuery] = useState('');

  const filteredTools = TOOLS.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.sub.toLowerCase().includes(query.toLowerCase())
  );

  const handleToolClick = (tool: typeof TOOLS[0]) => {
    if (tool.route === 'chat') {
      let initialPrompt = '';
      if (tool.title === 'PDF Summarizer') {
        initialPrompt = 'Summarize the core points of this document: ';
      } else if (tool.title === 'AI Writer') {
        initialPrompt = 'Write a comprehensive blog post about: ';
      } else if (tool.title === 'Translate') {
        initialPrompt = 'Translate the following text into Bengali (or any other language): ';
      } else if (tool.title === 'Voice Assistant') {
        initialPrompt = 'Start a conversation: ';
      } else if (tool.title === 'AI Code Maker') {
        initialPrompt = 'Write a TypeScript function that does: ';
      }

      if (initialPrompt && onPreFillChatPrompt) {
        onPreFillChatPrompt(initialPrompt);
      }
    }
    onNavigate(tool.route as Route);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black transition-colors duration-300">
      {/* Top Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-900 bg-black/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-neutral-350 hover:bg-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-serif font-semibold text-neutral-100 leading-tight">
              All AI Tools
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Browse All Services</p>
          </div>
        </div>
      </div>

      {/* Live Search Input Bar */}
      <div className="p-4 border-b border-neutral-900 bg-black">
        <div className="flex items-center gap-2.5 bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#20C997]/10 focus-within:border-[#20C997]/50 transition-all">
          <Search className="w-4 h-4 text-neutral-550" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search power tools..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-neutral-200 placeholder-neutral-550 font-sans"
          />
        </div>
      </div>

      {/* Catalog Grid View */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-12">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center h-full">
            <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-900 text-neutral-500 flex items-center justify-center text-xl mb-4">
              <Grid className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif text-neutral-300">No tools matched</h3>
            <p className="text-xs text-neutral-500 max-w-[200px] mt-1 font-sans">
              Try searching simple keywords like "writer", "image", "code", or "edit".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredTools.map((t, idx) => (
              <button
                key={idx}
                onClick={() => handleToolClick(t)}
                className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl flex flex-col gap-3 text-left hover:border-[#20C997]/30 transition-all shadow-sm group active:scale-95 duration-200"
              >
                <div
                  className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm"
                >
                  {t.icon}
                </div>
                <div>
                  <div className="text-[11.5px] font-bold text-neutral-200 leading-tight">
                    {t.title}
                  </div>
                  <div className="text-[9.5px] text-neutral-500 leading-normal mt-0.5 truncate max-w-full font-sans">
                    {t.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
