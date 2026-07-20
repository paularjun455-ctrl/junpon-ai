import React from 'react';
import { ArrowLeft, Heart, Download } from 'lucide-react';
import { Generation } from '../types';

interface FavoritesViewProps {
  generations: Generation[];
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
}

export default function FavoritesView({ generations, onToggleFavorite, onBack }: FavoritesViewProps) {
  const [proxiedImageIds, setProxiedImageIds] = React.useState<Record<string, boolean>>({});
  const favorites = generations.filter((g) => g.favorite);

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

  const handleDownload = async (url: string, promptText: string) => {
    try {
      const downloadUrl = getProxyUrl(url);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${promptText.slice(0, 20).replace(/\s+/g, '_')}_favorite.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              My Favorites
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Your Starred Designs</p>
          </div>
        </div>
      </div>

      {/* Grid displays favorite assets */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center text-xl mb-4 shadow-sm">
              ♥
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No favorites yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mt-1 leading-normal">
              Tap the heart icon on any generated AI artwork to save it in your favorites drawer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {favorites.map((gen) => (
              <div
                key={gen.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-sm aspect-square overflow-hidden hover:shadow-md transition-all"
              >
                <img
                  src={proxiedImageIds[gen.id] ? getProxyUrl(gen.url) : getDisplayUrl(gen.url)}
                  alt={gen.prompt}
                  onError={() => {
                    if (!proxiedImageIds[gen.id]) {
                      setProxiedImageIds(prev => ({ ...prev, [gen.id]: true }));
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Styled Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-350 p-3 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {gen.style}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(gen.id)}
                      className="p-1.5 rounded-xl bg-rose-600 text-white shadow-sm transition-all hover:scale-115 active:scale-95"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] text-white/90 line-clamp-2 leading-relaxed">
                      {gen.prompt}
                    </p>
                    <button
                      onClick={() => handleDownload(gen.url, gen.prompt)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 mt-2 transition-all border border-white/10"
                    >
                      <Download className="w-3 h-3" />
                      Save File
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
