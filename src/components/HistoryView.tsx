import React from 'react';
import { ArrowLeft, Trash2, Heart, Clock, Copy, Check } from 'lucide-react';
import { Generation } from '../types';

interface HistoryViewProps {
  generations: Generation[];
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onBack: () => void;
}

export default function HistoryView({
  generations,
  onToggleFavorite,
  onClearHistory,
  onBack,
}: HistoryViewProps) {
  const [proxiedImageIds, setProxiedImageIds] = React.useState<Record<string, boolean>>({});
  const [copiedPromptId, setCopiedPromptId] = React.useState<string | null>(null);

  const copyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 1500);
  };

  const getDisplayUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/api/proxy-image')) {
      try {
        const urlParams = new URL(url, window.location.origin || 'http://localhost:3000');
        const rawUrl = urlParams.searchParams.get('url');
        if (rawUrl) return rawUrl;
      } catch (e) {
        // fallback
      }
    }
    return url;
  };

  const getProxyUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/api/proxy-image')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
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
              Creation History
            </h2>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">Your Generated Records</p>
          </div>
        </div>

        {generations.length > 0 && (
          <button
            onClick={onClearHistory}
            className="p-2 rounded-xl text-neutral-500 hover:text-rose-450 hover:bg-rose-500/10 transition-all"
            title="Clear history log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* History Stream List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center h-full">
            <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-900 text-neutral-500 flex items-center justify-center text-xl mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif text-neutral-300">No records found</h3>
            <p className="text-xs text-neutral-500 max-w-[200px] mt-1 leading-normal font-sans">
              Images generated via the Image Generator will automatically be cataloged here.
            </p>
          </div>
        ) : (
          generations.map((g) => (
            <div
              key={g.id}
              className="bg-neutral-950 border border-neutral-900 p-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:border-[#20C997]/20 transition-colors"
            >
              <img
                src={proxiedImageIds[g.id] ? getProxyUrl(g.url) : getDisplayUrl(g.url)}
                alt={g.prompt}
                onError={() => {
                  if (!proxiedImageIds[g.id]) {
                    setProxiedImageIds(prev => ({ ...prev, [g.id]: true }));
                  }
                }}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-neutral-900 border border-neutral-800"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-sans font-medium text-neutral-200 truncate">
                  {g.prompt}
                </div>
                <div className="text-[9px] text-neutral-500 font-mono mt-1 flex items-center gap-2">
                  <span>Style: {g.style}</span>
                  <span className="w-1 h-1 bg-neutral-800 rounded-full"></span>
                  <span>{g.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyPrompt(g.prompt, g.id)}
                  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 transition-all"
                  title="Copy Prompt"
                >
                  {copiedPromptId === g.id ? (
                    <Check className="w-3.5 h-3.5 text-[#20C997]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onToggleFavorite(g.id)}
                  className={`p-2 rounded-lg transition-all ${
                    g.favorite ? 'text-rose-450 hover:bg-rose-500/10' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
