import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Heart, HelpCircle, LogOut, Moon, Sun, Shield, FileText, Download, Archive } from 'lucide-react';
import { User, Route } from '../types';

interface ProfileViewProps {
  user: User | null;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onNavigate: (route: Route) => void;
  onLogout: () => void;
  onBack: () => void;
}

export default function ProfileView({
  user,
  theme,
  onThemeChange,
  onNavigate,
  onLogout,
  onBack,
}: ProfileViewProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'G';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-slate-100' : 'bg-neutral-50 text-neutral-800'}`}>
      {/* Top Header */}
      <div className={`h-14 px-4 flex items-center justify-between border-b sticky top-0 z-30 transition-colors duration-300 ${isDark ? 'border-neutral-900 bg-black/90 text-neutral-100' : 'border-neutral-200 bg-white/95 text-neutral-800'} backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-neutral-350 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className={`text-sm font-serif font-semibold leading-tight ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
              My Profile
            </h2>
            <p className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Personal Configuration</p>
          </div>
        </div>
      </div>

      {/* Main scrolling content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
        {/* User Card badge details */}
        <div className={`p-5 rounded-xl text-center flex flex-col items-center border ${isDark ? 'bg-neutral-950 border-neutral-900 shadow-lg' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className={`w-16 h-16 rounded-xl border flex items-center justify-center font-serif text-[#20C997] text-2xl font-semibold ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
            {firstLetter}
          </div>
          <h3 className={`text-base font-serif font-normal mt-4 leading-none ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
            {user?.name || 'Guest User'}
          </h3>
          <p className="text-xs text-neutral-500 font-sans mt-1.5 leading-none">
            {user?.email || 'guest@junpon.ai'}
          </p>

          <div className={`inline-flex items-center gap-1 font-mono text-[9px] px-2.5 py-1 rounded-full border mt-4 uppercase tracking-wider ${isDark ? 'bg-neutral-900 border-neutral-850 text-amber-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-600 font-semibold'}`}>
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            <span>Free Tier</span>
          </div>
        </div>

        {/* Setting blocks: Theme Choice */}
        <div>
          <h4 className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest px-1 mb-2.5">
            Interface Theme
          </h4>
          <div className={`border rounded-xl overflow-hidden shadow-md divide-y ${isDark ? 'bg-neutral-950 border-neutral-900 divide-neutral-900' : 'bg-white border-neutral-200 divide-neutral-100'}`}>
            <button
              onClick={() => onThemeChange('light')}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${isDark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3.5">
                <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-[#20C997]' : 'text-neutral-500'}`} />
                <span className={`text-xs font-sans font-medium ${theme === 'light' ? 'text-neutral-850 font-bold' : (isDark ? 'text-neutral-400' : 'text-neutral-500')}`}>
                  Light Mode / লাইট মোড
                </span>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  theme === 'light' ? 'border-[#20C997]' : (isDark ? 'border-neutral-800' : 'border-neutral-200')
                }`}
              >
                {theme === 'light' && <div className="w-2 h-2 rounded-full bg-[#20C997]"></div>}
              </div>
            </button>

            <button
              onClick={() => onThemeChange('dark')}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${isDark ? 'hover:bg-neutral-900' : 'hover:bg-neutral-50'}`}
            >
              <div className="flex items-center gap-3.5">
                <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-[#20C997]' : 'text-neutral-500'}`} />
                <span className={`text-xs font-sans font-medium ${theme === 'dark' ? 'text-neutral-100 font-bold' : 'text-neutral-500'}`}>
                  Dark Mode / ডার্ক মোড
                </span>
              </div>
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  theme === 'dark' ? 'border-[#20C997]' : (isDark ? 'border-neutral-800' : 'border-neutral-200')
                }`}
              >
                {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-[#20C997]"></div>}
              </div>
            </button>
          </div>
        </div>

        {/* Feature toggles */}
        <div>
          <h4 className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest px-1 mb-2.5">
            Quick Shortcuts
          </h4>
          <div className={`border rounded-xl overflow-hidden shadow-md divide-y ${isDark ? 'bg-neutral-950 border-neutral-900 divide-neutral-900' : 'bg-white border-neutral-200 divide-neutral-100'}`}>
            <button
              onClick={() => onNavigate('subscription')}
              className={`w-full flex items-center justify-between p-4 text-left transition-all cursor-pointer text-xs font-sans font-medium ${isDark ? 'hover:bg-neutral-900 text-neutral-200' : 'hover:bg-neutral-50 text-neutral-700'}`}
            >
              <div className="flex items-center gap-3.5">
                <Sparkles className="w-4 h-4 text-[#20C997]" />
                <span>Subscription Plan</span>
              </div>
              <span className="text-neutral-500 font-bold">›</span>
            </button>

            <button
              onClick={() => onNavigate('favorites')}
              className={`w-full flex items-center justify-between p-4 text-left transition-all cursor-pointer text-xs font-sans font-medium ${isDark ? 'hover:bg-neutral-900 text-neutral-200' : 'hover:bg-neutral-50 text-neutral-700'}`}
            >
              <div className="flex items-center gap-3.5">
                <Heart className="w-4 h-4 text-rose-450" />
                <span>Favorites Album</span>
              </div>
              <span className="text-neutral-500 font-bold">›</span>
            </button>

            <button
              onClick={() => showToast('Support ticket systems are accessible in fully deployed live domains.')}
              className={`w-full flex items-center justify-between p-4 text-left transition-all cursor-pointer text-xs font-sans font-medium ${isDark ? 'hover:bg-neutral-900 text-neutral-200' : 'hover:bg-neutral-50 text-neutral-700'}`}
            >
              <div className="flex items-center gap-3.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Help & Support Ticket</span>
              </div>
              <span className="text-neutral-500 font-bold">›</span>
            </button>
          </div>
        </div>





        {/* Founder & Brand Card */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">🏆</span>
            <h4 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
              About Junpon AI
            </h4>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Founder & CEO</span>
              <span className={`font-serif font-semibold text-[#20C997]`}>Arjun Paul Arpon</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t pt-1.5 border-dashed border-neutral-800">
              <span className={`${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Platform Version</span>
              <span className={`font-mono text-[10px] ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>v1.2.0 (Stable)</span>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className={`w-full border rounded-xl py-3 text-xs font-semibold text-rose-450 flex items-center justify-center gap-2 transition-all cursor-pointer ${isDark ? 'bg-neutral-950 hover:bg-rose-500/5 border-rose-500/15' : 'bg-white border-rose-200 hover:bg-rose-50 text-rose-600 shadow-sm'}`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`absolute bottom-20 left-4 right-4 border text-xs py-3 px-4 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in ${isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-850 shadow-xl'}`}>
          <Shield className="w-4 h-4 text-[#20C997]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
