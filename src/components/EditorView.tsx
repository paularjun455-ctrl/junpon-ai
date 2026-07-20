import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';

interface EditorViewProps {
  onBack: () => void;
}

const PRESETS = [
  { name: 'Beach Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Neon City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cozy Cabin', url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80' },
];

const FILTERS = [
  { key: 'none', label: 'Original', style: '' },
  { key: 'grayscale(1)', label: 'Grayscale', style: 'grayscale(1)' },
  { key: 'sepia(1)', label: 'Sepia', style: 'sepia(1)' },
  { key: 'brightness(1.35) saturate(1.4)', label: 'Vivid', style: 'brightness(1.35) saturate(1.4)' },
  { key: 'blur(3px)', label: 'Soft Blur', style: 'blur(3px)' },
  { key: 'contrast(1.45)', label: 'Contrast', style: 'contrast(1.45)' },
  { key: 'invert(1)', label: 'Invert', style: 'invert(1)' },
  { key: 'hue-rotate(180deg)', label: 'Cosmic', style: 'hue-rotate(180deg)' },
];

export default function EditorView({ onBack }: EditorViewProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(PRESETS[0].url);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setSelectedFilter('none');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!imageSrc || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Build the canvas at high original resolution
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply exact filter to the canvas context
    const activeFilter = FILTERS.find((f) => f.key === selectedFilter);
    ctx.filter = activeFilter ? activeFilter.style : 'none';

    // Draw and download
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const downloadUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `junpon_edited_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Photo Filter Editor
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Real-time Visual Filters</p>
          </div>
        </div>
      </div>

      {/* Editor Canvas Canvas View */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col items-center justify-center space-y-4">
        {imageSrc ? (
          <div className="relative w-full max-w-[280px] aspect-[3/4] bg-slate-200 dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-lg border-2 border-slate-250 dark:border-slate-800/80 flex items-center justify-center group">
            {/* Direct CSS visual filter preview */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Editor preview"
              className="max-w-full max-h-full object-contain rounded-2xl transition-all duration-300"
              style={{
                filter: FILTERS.find((f) => f.key === selectedFilter)?.style || 'none',
              }}
              crossOrigin="anonymous"
            />
            {/* Secret canvas for offline rendering */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="w-full max-w-[280px] aspect-[3/4] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900">
            <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-950/20 text-violet-500 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Image Uploaded</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
              Select a stock sample preset or upload a custom snapshot from your device.
            </p>
          </div>
        )}

        {/* Preset sample toggles */}
        <div className="w-full max-w-[290px] space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Try stock preset</span>
          </div>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setImageSrc(p.url);
                  setSelectedFilter('none');
                }}
                className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-xl border text-center transition-all ${
                  imageSrc === p.url
                    ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Filter sliders / buttons */}
      {imageSrc && (
        <div className="border-t border-slate-100 dark:border-slate-900 bg-white/90 dark:bg-slate-900/90 pt-3 pb-2 select-none">
          <div className="flex gap-2.5 overflow-x-auto px-5 pb-1 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`flex flex-col items-center gap-1 py-2.5 px-3 rounded-2xl border text-center min-w-[72px] transition-all cursor-pointer ${
                  selectedFilter === f.key
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">✨</span>
                <span className="text-[10px] font-bold leading-none">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor control buttons */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-900 p-4 flex gap-2.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Upload className="w-4 h-4" />
          Change Photo
        </button>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-violet-500/10"
          >
            <Download className="w-4 h-4" />
            Save Filtered
          </button>
        )}
      </div>
    </div>
  );
}
