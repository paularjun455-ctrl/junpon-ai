import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Heart, Download, RefreshCw, Layers, Upload, X, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { Generation, Route } from '../types';
import { IMAGE_STYLES } from '../data';

interface ImageGenViewProps {
  generations: Generation[];
  onAddGeneration: (gen: Generation) => void;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
}

const LOADING_STEPS = [
  'Initializing advanced neural passes...',
  'Analyzing reference image contours...',
  'Drafting subject structure and geometry...',
  'Blending color styles and color matching...',
  'Polishing detailed textures and ambient lighting...',
  'Upscaling to ultra-sharp 8K resolution...',
];

export default function ImageGenView({
  generations,
  onAddGeneration,
  onToggleFavorite,
  onBack,
}: ImageGenViewProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const copyPromptToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 1500);
  };

  // Mobile tap overlay toggle & image load error fallbacks
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, boolean>>({});
  const [proxiedImageIds, setProxiedImageIds] = useState<Record<string, boolean>>({});

  // Client-side robust image loading and auto-retry
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({});

  // Advanced Photo Blending Studio State
  const [selectedGenForRestyle, setSelectedGenForRestyle] = useState<Generation | null>(null);
  const [isRestyleModalOpen, setIsRestyleModalOpen] = useState(false);
  const [restyleBlendMode, setRestyleBlendMode] = useState<GlobalCompositeOperation>('overlay');
  const [restyleOpacity, setRestyleOpacity] = useState(0.65);
  const [restyleResult, setRestyleResult] = useState<string | null>(null);
  const [isRestyleLoading, setIsRestyleLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get proxy URL as a fallback if client direct-fetch is blocked
  const getProxyUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/api/proxy-image')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Helper to always load through our robust proxy to handle service-down states with beautiful fallback images
  const getDisplayUrl = (url: string) => {
    return getProxyUrl(url);
  };

  // Loop through loading reassuring messages during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      let stepIdx = 0;
      setLoadingStep(LOADING_STEPS[stepIdx]);
      interval = setInterval(() => {
        stepIdx = (stepIdx + 1) % LOADING_STEPS.length;
        setLoadingStep(LOADING_STEPS[stepIdx]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle live canvas photo-merging for user restyling
  useEffect(() => {
    if (!isRestyleModalOpen || !selectedGenForRestyle || !selectedGenForRestyle.sourceUrl) {
      setRestyleResult(null);
      return;
    }

    let isSubscribed = true;
    setIsRestyleLoading(true);

    const loadAndBlend = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');

        // Load user's original picture
        const imgBase = new Image();
        imgBase.crossOrigin = 'anonymous';

        // Load the AI-generated overlay (proxied to prevent CORS taint)
        const imgOverlay = new Image();
        imgOverlay.crossOrigin = 'anonymous';

        let loadedCount = 0;
        const checkLoaded = () => {
          loadedCount++;
          if (loadedCount === 2) {
            if (!isSubscribed) return;

            // Set high quality standard resolution
            canvas.width = 1024;
            canvas.height = 1024;

            // Draw user's original picture
            ctx.drawImage(imgBase, 0, 0, 1024, 1024);

            // Apply blend mode, transparency, and draw style artwork
            ctx.save();
            ctx.globalAlpha = restyleOpacity;
            ctx.globalCompositeOperation = restyleBlendMode;
            ctx.drawImage(imgOverlay, 0, 0, 1024, 1024);
            ctx.restore();

            const blendedUrl = canvas.toDataURL('image/jpeg', 0.95);
            setRestyleResult(blendedUrl);
            setIsRestyleLoading(false);
          }
        };

        imgBase.onload = checkLoaded;
        imgOverlay.onload = checkLoaded;
        
        imgBase.onerror = () => {
          console.error('Error loading base photo');
          if (isSubscribed) setIsRestyleLoading(false);
        };
        imgOverlay.onerror = () => {
          console.error('Error loading styled overlay');
          if (isSubscribed) setIsRestyleLoading(false);
        };

        imgBase.src = selectedGenForRestyle.sourceUrl!;
        let overlayUrl = selectedGenForRestyle.url;
        if (overlayUrl.includes('/api/proxy-image?url=')) {
          const parts = overlayUrl.split('?url=');
          if (parts[1]) {
            overlayUrl = decodeURIComponent(parts[1]);
          }
        }
        imgOverlay.src = `/api/proxy-image?url=${encodeURIComponent(overlayUrl)}`;
      } catch (err) {
        console.error('Canvas processing failed:', err);
        if (isSubscribed) setIsRestyleLoading(false);
      }
    };

    loadAndBlend();

    return () => {
      isSubscribed = false;
    };
  }, [isRestyleModalOpen, selectedGenForRestyle, restyleBlendMode, restyleOpacity]);

  const handleImageUpload = (file: File) => {
    if (!file) return;
    setUploadedImageMime(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isGenerating) return;

    setIsGenerating(true);
    setErrorText(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          style: selectedStyle,
          image: uploadedImage,
          mimeType: uploadedImageMime,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Image generation failed. Please try again.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      const newGen: Generation = {
        id: Math.random().toString(36).slice(2, 9),
        prompt: cleanPrompt,
        url: data.url,
        favorite: false,
        time: new Date().toLocaleDateString(),
        style: selectedStyle,
        sourceUrl: uploadedImage || undefined,
      };

      onAddGeneration(newGen);
      setPrompt('');
      // We don't automatically clear the uploaded photo so they can apply multiple styles to the same input if desired.
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorText(err.message || 'Could not generate image.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, promptText: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${promptText.slice(0, 20).replace(/\s+/g, '_')}_junpon_ai.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full overflow-hidden bg-black transition-colors duration-300 relative"
    >
      {/* Drag & Drop File Upload Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#20C997]/5 backdrop-blur-md border border-dashed border-[#20C997]/40 z-50 flex flex-col items-center justify-center pointer-events-none transition-all">
          <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-900 shadow-2xl flex flex-col items-center space-y-3 transform scale-105 transition-transform">
            <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 text-[#20C997] flex items-center justify-center text-3xl">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            <p className="text-sm font-serif text-neutral-100">Drop your picture here</p>
            <p className="text-xs text-neutral-500">to restyle and edit with Junpon AI</p>
          </div>
        </div>
      )}

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
              AI Image Generator
            </h2>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">Text-to-Image & Image-to-Image</p>
          </div>
        </div>
      </div>

      {/* Grid displays generations */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {generations.length === 0 && !isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-4 shadow-sm">
              🖼️
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Draft your dream visual
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px] mt-1 leading-normal mb-3">
              Type details or upload a photo to edit and restyle with AI!
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo to Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {/* Elegant live generation card directly in grid so user can see past work */}
            {isGenerating && (
              <div className="relative bg-gradient-to-br from-violet-50/40 to-indigo-50/40 dark:from-slate-900/60 dark:to-slate-950/60 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-900/40 aspect-square flex flex-col items-center justify-center p-3 text-center overflow-hidden animate-pulse shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10 pointer-events-none" />
                <div className="relative mb-2.5">
                  <div className="w-10 h-10 rounded-full border-3 border-violet-500/25 border-t-violet-600 animate-spin" />
                  <Sparkles className="w-4 h-4 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-[11px] font-black text-violet-600 dark:text-violet-400 tracking-tight uppercase">
                  Crafting Visual...
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-normal px-2 line-clamp-3 italic">
                  "{loadingStep}"
                </p>
              </div>
            )}

            {generations.map((gen) => {
              const isBroken = brokenImageIds[gen.id] || !gen.url || gen.url === '';
              const isActive = activeCardId === gen.id;
              const isLoaded = loadedImageIds[gen.id];
              const attempt = retryAttempts[gen.id] || 0;

              // Construct the image source with a query param cache buster if we are retrying
              const rawDisplayUrl = getDisplayUrl(gen.url);
              const finalSrc = rawDisplayUrl 
                ? rawDisplayUrl + (rawDisplayUrl.includes('?') ? '&' : '?') + `retry=${attempt}`
                : '';

              return (
                <div
                  key={gen.id}
                  onClick={() => setActiveCardId(isActive ? null : gen.id)}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm aspect-square overflow-hidden hover:shadow-md transition-all cursor-pointer"
                >
                  {isBroken ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-2">
                        <ImageIcon className="w-5 h-5 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase text-violet-400 tracking-wider">
                        Re-draft Style
                      </span>
                      <p className="text-[8px] text-slate-400 max-w-[120px] leading-normal mt-0.5 font-medium line-clamp-3 italic">
                        "{gen.prompt}"
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Premium elegant loading placeholder while image is being rendered/cached */}
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center select-none z-10 animate-pulse">
                          <div className="relative mb-2.5">
                            <div className="w-8 h-8 rounded-full border-2 border-violet-500/25 border-t-violet-500 animate-spin" />
                            <Sparkles className="w-3.5 h-3.5 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <span className="text-[9px] font-black text-violet-400 tracking-wider uppercase animate-pulse">
                            {attempt > 0 ? `Refreshing details...` : `Rendering art...`}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono mt-1">
                            {attempt > 0 ? `Retry attempt ${attempt}/5` : `Initializing neural passes`}
                          </span>
                        </div>
                      )}
                      
                      <img
                        src={finalSrc}
                        alt={gen.prompt}
                        onLoad={() => {
                          setLoadedImageIds(prev => ({ ...prev, [gen.id]: true }));
                        }}
                        onError={() => {
                          const currentAttempts = retryAttempts[gen.id] || 0;
                          if (currentAttempts < 5) {
                            // Reset load state to show spinner during retry delay
                            setLoadedImageIds(prev => ({ ...prev, [gen.id]: false }));
                            setTimeout(() => {
                              setRetryAttempts(prev => ({ ...prev, [gen.id]: currentAttempts + 1 }));
                            }, 3000);
                          } else {
                            setBrokenImageIds(prev => ({ ...prev, [gen.id]: true }));
                          }
                        }}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    </>
                  )}

                  {/* Floating zoomable "Before" comparison thumbnail */}
                  {gen.sourceUrl && !isBroken && (
                    <div className="absolute top-2.5 left-2.5 z-25 pointer-events-auto">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/65 shadow-[0_4px_12px_rgba(0,0,0,0.2)] transform hover:scale-[2.4] hover:translate-x-3 hover:translate-y-3 origin-top-left transition-all duration-300 ease-out cursor-zoom-in">
                        <img
                          src={getDisplayUrl(gen.sourceUrl)}
                          className="w-full h-full object-cover"
                          alt="Before"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/85 text-[5px] text-white font-extrabold text-center py-0.5 uppercase tracking-wider scale-x-90">
                          Before
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Styled Hover & Tap Menu Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/35 p-3 flex flex-col justify-between text-white z-10 transition-all duration-300 ${
                      isActive 
                        ? 'opacity-100 pointer-events-auto' 
                        : 'opacity-0 md:group-hover:opacity-100 pointer-events-none md:group-hover:pointer-events-auto'
                    }`}
                  >
                    {/* Top quick row */}
                    <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[9px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {gen.style}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(gen.id);
                        }}
                        className={`p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                          gen.favorite ? 'bg-rose-600 text-white shadow-sm' : 'bg-black/40 text-white/90 hover:bg-black/60'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Bottom prompt details & action */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <p className="text-[10px] text-white/90 line-clamp-2 leading-relaxed">
                        {gen.prompt}
                      </p>
                      <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/10">
                        {!isBroken && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(gen.url, gen.prompt);
                            }}
                            className="flex-1 bg-white/15 hover:bg-white/25 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            Save
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPromptToClipboard(gen.prompt, gen.id);
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"
                          title="Copy prompt text"
                        >
                          {copiedPromptId === gen.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#20C997]" />
                              <span className="text-[#20C997]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        {gen.sourceUrl && !isBroken && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGenForRestyle(gen);
                              setIsRestyleModalOpen(true);
                            }}
                            className="flex-1 bg-violet-600 hover:bg-violet-750 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Layers className="w-3 h-3" />
                            Blend Photo
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrompt(gen.prompt);
                            setSelectedStyle(gen.style);
                            if (gen.sourceUrl) {
                              setUploadedImage(gen.sourceUrl);
                            }
                            setErrorText(null);
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"
                          title="Load settings to re-generate"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Re-use
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Style selections */}
      <div className="border-t border-neutral-900 bg-black pt-3.5 pb-2">
        <div className="flex items-center gap-1.5 px-5 mb-2">
          <Layers className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-[10.5px] uppercase tracking-wider font-mono font-bold text-neutral-500">
            Select Style Accent
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-none">
          {IMAGE_STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStyle(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedStyle === s
                  ? 'bg-[#20C997] text-black border-[#20C997] shadow-sm font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error text notice */}
      {errorText && (
        <div className="mx-4 mt-2 px-3.5 py-2.5 bg-neutral-950 border border-rose-500/15 rounded-xl text-xs text-rose-450 font-semibold">
          ⚠️ {errorText}
        </div>
      )}

      {/* Uploaded image preview bar */}
      {uploadedImage && (
        <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-800 shadow-sm flex-shrink-0">
              <img src={uploadedImage} alt="Input source" className="w-full h-full object-cover" />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-black text-white rounded-full p-1 cursor-pointer transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <div>
              <p className="text-xs font-serif text-neutral-200">Using reference picture</p>
              <p className="text-[10px] text-neutral-500 leading-normal">Describe how you want Junpon AI to edit or restyle this photo</p>
            </div>
          </div>
          <button
            onClick={() => setUploadedImage(null)}
            className="text-xs text-rose-450 hover:text-rose-500 font-bold transition-colors cursor-pointer"
          >
            Remove Photo
          </button>
        </div>
      )}

      {/* Cute, rounded-pill Send Box & centered input */}
      <div className="bg-black p-5 border-t border-neutral-900 sticky bottom-0 z-30 backdrop-blur-md">
        <div className="max-w-md mx-auto flex gap-3 items-center">
          {/* Invisible file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Cute Upload Circle Button with Hover Animation and Sparkly Gradient */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="w-12 h-12 rounded-full bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white hover:scale-105 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm border border-neutral-900"
            title="Upload photo to edit"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Centered & Cute Pill Text Input Box */}
          <div className="flex-1 relative flex items-center bg-neutral-950 border border-neutral-900 hover:border-[#20C997]/30 rounded-full px-6 py-3 focus-within:ring-2 focus-within:ring-[#20C997]/10 focus-within:border-[#20C997]/50 transition-all duration-300">
            {/* Glowing left background trace */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
            </div>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder={uploadedImage ? "How should we restyle this photo?" : "Ask Junpon to draw..."}
              className="w-full bg-transparent border-none outline-none text-xs text-center placeholder:text-center text-neutral-200 placeholder-neutral-550 font-sans tracking-wide focus:placeholder-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            {/* Glowing right background trace */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
            </div>
          </div>

          {/* Cute Send Circle Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-12 h-12 rounded-full bg-[#20C997] hover:bg-[#1ebd8e] disabled:opacity-30 disabled:bg-neutral-950 disabled:text-neutral-500 text-black flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:pointer-events-none"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advanced Junpon AI Photo Restyler Studio Modal */}
      {isRestyleModalOpen && selectedGenForRestyle && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-350">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Layers className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Junpon Photo Restyler
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Blending your photo with AI masterpiece style
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRestyleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Image comparison viewport */}
              <div className="grid grid-cols-2 gap-3">
                {/* User's original photo */}
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Original Photo</span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-950">
                    <img
                      src={selectedGenForRestyle.sourceUrl}
                      className="w-full h-full object-cover"
                      alt="Your photo"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Blended / Styled output */}
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-violet-500 tracking-wider">Restyled Portrait</span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-violet-100/30 dark:border-violet-900/20 shadow-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    {isRestyleLoading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 rounded-full border-3 border-violet-500/20 border-t-violet-600 animate-spin" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase animate-pulse">Rendering...</span>
                      </div>
                    ) : restyleResult ? (
                      <img
                        src={restyleResult}
                        className="w-full h-full object-cover animate-fade-in"
                        alt="Restyled Output"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Loading master assets...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Restyling Presets */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Select Blend Style
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { name: 'Avatar Light', mode: 'overlay', desc: 'Smooth match' },
                    { name: 'Color Fusion', mode: 'color', desc: 'Pure palette' },
                    { name: 'Neon Glow', mode: 'screen', desc: 'High brightness' },
                    { name: 'Pencil Noir', mode: 'multiply', desc: 'Deep shadow' },
                    { name: 'Soft Ambient', mode: 'soft-light', desc: 'Subtle blend' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setRestyleBlendMode(preset.mode as GlobalCompositeOperation)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        restyleBlendMode === preset.mode
                          ? 'bg-violet-600 border-violet-600 text-white shadow-sm ring-2 ring-violet-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-[10px] font-bold block truncate w-full">{preset.name}</span>
                      <span className={`text-[7px] mt-0.5 ${restyleBlendMode === preset.mode ? 'text-violet-100' : 'text-slate-400'}`}>
                        {preset.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity slider */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">AI Styling Intensity</span>
                  <span className="text-violet-600 dark:text-violet-400 font-extrabold">{Math.round(restyleOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.95"
                  step="0.05"
                  value={restyleOpacity}
                  onChange={(e) => setRestyleOpacity(parseFloat(e.target.value))}
                  className="w-full accent-violet-600 dark:accent-violet-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-400 leading-normal mt-1">
                  💡 Tip: Increase for deep AI color details; decrease to preserve your face details and natural brightness.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
              <button
                onClick={() => setIsRestyleModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!restyleResult) return;
                  await handleDownload(restyleResult, `${selectedGenForRestyle.prompt} restyled`);
                }}
                disabled={!restyleResult || isRestyleLoading}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-500/20 hover:scale-103"
              >
                <Download className="w-4 h-4" />
                Save Restyled Portrait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
