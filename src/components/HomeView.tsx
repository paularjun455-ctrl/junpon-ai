import React from 'react';
import { Menu, Search, Mic } from 'lucide-react';
import { User, Route } from '../types';
import { TOOLS } from '../data';

interface HomeViewProps {
  user: User | null;
  onNavigate: (route: Route) => void;
  onOpenSidebar: () => void;
  onPreFillChatPrompt?: (prompt: string) => void;
  theme?: 'light' | 'dark';
}

export default function HomeView({
  user,
  onNavigate,
  onOpenSidebar,
  onPreFillChatPrompt,
  theme = 'dark',
}: HomeViewProps) {
  const isDark = theme === 'dark';
  const firstName = user ? user.name.split(' ')[0] : 'there';
  const popularTools = TOOLS.slice(0, 6);

  const handleToolClick = (tool: typeof TOOLS[0]) => {
    if (tool.route === 'chat') {
      let initialPrompt = '';
      if (tool.title === 'PDF Summarizer') {
        initialPrompt = 'Summarize the core points of this document: ';
      } else if (tool.title === 'AI Writer') {
        initialPrompt = 'Write a comprehensive blog post about: ';
      } else if (tool.title === 'Translate') {
        initialPrompt = 'Translate the following text: ';
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
    <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-slate-100' : 'bg-neutral-50 text-neutral-800'}`}>
      {/* Top Navigation bar */}
      <div className={`h-14 px-4 flex items-center justify-between border-b transition-colors duration-300 ${isDark ? 'border-neutral-900 bg-black/90 text-neutral-100' : 'border-neutral-200 bg-white/95 text-neutral-800'} backdrop-blur-md sticky top-0 z-30`}>
        <button
          onClick={onOpenSidebar}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'text-neutral-350 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Multi-faceted premium 3D crystal logo */}
          <div className="relative w-5.5 h-5.5 flex-shrink-0 animate-float select-none">
            <svg
              className="w-full h-full drop-shadow-[0_0_8px_rgba(32,201,151,0.4)]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logo-top-left" x1="8" y1="3" x2="12" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#D946EF" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="logo-top-right" x1="16" y1="3" x2="12" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#20C997" />
                  <stop offset="100%" stopColor="#0AA37A" />
                </linearGradient>
                <linearGradient id="logo-mid-center" x1="8" y1="3" x2="16" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="logo-bottom-left" x1="3" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="logo-bottom-right" x1="21" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
              </defs>
              
              <polygon points="8,3 16,3 12,9" fill="url(#logo-mid-center)" opacity="0.95" />
              <polygon points="8,3 3,9 12,9" fill="url(#logo-top-left)" opacity="0.9" />
              <polygon points="16,3 21,9 12,9" fill="url(#logo-top-right)" opacity="0.9" />
              <polygon points="3,9 12,21 12,9" fill="url(#logo-bottom-left)" opacity="0.85" />
              <polygon points="21,9 12,21 12,9" fill="url(#logo-bottom-right)" opacity="0.85" />
              
              {/* Wireframe edge highlights for 3D realism */}
              <polyline points="8,3 12,9 16,3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="9" x2="12" y2="21" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              <polyline points="3,9 12,9 21,9" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points="8,3 16,3 21,9 12,21 3,9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={`font-serif text-base tracking-tight font-medium ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
            Junpon <span className="font-serif italic text-[#20C997] font-normal">AI</span>
          </span>
        </div>

        <button
          onClick={() => onNavigate('subscription')}
          className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase rounded-full transition-all active:scale-95 ${isDark ? 'bg-neutral-900 border border-neutral-800 text-amber-400 hover:bg-neutral-850' : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold hover:bg-amber-500/20'}`}
        >
          👑 Pro
        </button>
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin">
        {/* Welcome message */}
        <div className="pt-2">
          <h1 className={`text-2xl font-serif font-normal tracking-tight leading-none ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
            Hello, <span className="font-serif italic text-[#20C997] font-normal">{firstName}</span>
          </h1>
          <p className={`text-[11px] font-sans mt-2 leading-relaxed ${isDark ? 'text-neutral-450' : 'text-neutral-500'}`}>
            What will you search or create today? Enter a prompt or select a specialized tool below.
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className={`border rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-neutral-950 border-neutral-900 shadow-lg shadow-black/40' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div
            onClick={() => onNavigate('search')}
            className="flex items-center gap-2.5 text-neutral-500 text-xs cursor-pointer py-1"
          >
            <Search className="w-4 h-4 text-neutral-500" />
            <span className={`flex-1 font-sans ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Search or ask anything...</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('chat');
              }}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-sm cursor-pointer active:scale-90 ${isDark ? 'bg-neutral-900 border-neutral-800 text-[#20C997] hover:border-[#20C997]' : 'bg-neutral-50 border-neutral-200 text-[#20C997] hover:bg-neutral-100'}`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`flex gap-2.5 mt-3 pt-3 border-t ${isDark ? 'border-neutral-900' : 'border-neutral-100'}`}>
            <button
              onClick={() => onNavigate('chat')}
              className={`flex-1 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border ${isDark ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-850 text-neutral-200 hover:text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-800'}`}
            >
              <span>💬</span> AI Chat
            </button>
            <button
              onClick={() => onNavigate('imagegen')}
              className={`flex-1 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border ${isDark ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-850 text-neutral-200 hover:text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-800'}`}
            >
              <span>🖼️</span> AI Image
            </button>
          </div>
        </div>

        {/* Bento Popular grid */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-neutral-450' : 'text-neutral-500 font-medium'}`}>
              Popular Tools
            </h3>
            <button
              onClick={() => onNavigate('search')}
              className="text-[11px] font-mono font-bold uppercase text-[#20C997] hover:underline"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {popularTools.map((t, idx) => (
              <button
                key={idx}
                onClick={() => handleToolClick(t)}
                className={`border rounded-xl p-3 flex flex-col gap-2.5 items-start text-left hover:border-[#20C997]/40 transition-all shadow-sm group active:scale-95 duration-200 ${isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-neutral-200'}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  {t.icon}
                </div>
                <div>
                  <div className={`text-[11px] font-bold leading-tight ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                    {t.title}
                  </div>
                  <div className={`text-[9px] leading-normal mt-0.5 truncate max-w-full font-sans ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {t.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upgrade card */}
        <div
          onClick={() => onNavigate('subscription')}
          className={`relative overflow-hidden p-5 rounded-xl border cursor-pointer group active:scale-[0.99] transition-all duration-200 ${isDark ? 'bg-neutral-950 text-white border-neutral-900 hover:border-amber-500/30 shadow-lg' : 'bg-white text-neutral-800 border-neutral-200 hover:border-amber-500/30 shadow-sm'}`}
        >
          <div className="relative z-10 max-w-[70%]">
            <span className={`inline-block px-2 py-0.5 border text-[8px] font-mono tracking-widest uppercase rounded-full mb-2 ${isDark ? 'bg-neutral-900 border-neutral-800 text-amber-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-600 font-bold'}`}>
              PRO ACCESS
            </span>
            <h4 className={`text-sm font-serif font-semibold tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>Upgrade to Pro ✨</h4>
            <p className={`text-[10px] mt-1 leading-relaxed font-sans ${isDark ? 'text-neutral-450' : 'text-neutral-500'}`}>
              Unlock unlimited lightning-fast generations, high-resolution upscaling, and early access to features.
            </p>
            <button className={`border font-semibold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg mt-3 transition-colors ${isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-neutral-800' : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 border-amber-200'}`}>
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Brand Footer Credit */}
        <div className="pt-2 pb-6 text-center">
          <p className={`text-[9px] font-sans tracking-wide ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
            ✦ Junpon AI is powered by secure Gemini 1.5 Engines
          </p>
          <p className={`text-[8px] font-mono tracking-wider uppercase mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Founder & CEO: <span className="text-[#20C997] font-semibold">Arjun Paul Arpon</span>
          </p>
        </div>
      </div>
    </div>
  );
}
