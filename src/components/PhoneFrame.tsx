import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

export default function PhoneFrame({ children, theme }: PhoneFrameProps) {
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 md:p-8 transition-colors duration-300 ${isDark ? 'bg-[#090a0b]' : 'bg-neutral-100'}`}>
      {/* Phone container */}
      <div
        id="phone-frame"
        className={`w-full h-screen md:h-[844px] md:w-[390px] md:rounded-[36px] flex flex-col relative overflow-hidden transition-all duration-300 ${
          isDark 
            ? 'bg-black text-slate-100 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] md:ring-12 md:ring-neutral-900' 
            : 'bg-white text-neutral-800 md:shadow-[0_12px_40px_rgba(0,0,0,0.1)] md:ring-12 md:ring-neutral-250'
        }`}
      >
        {/* Sleek top safety spacer instead of busy status bar */}
        <div className="h-4 w-full z-40 select-none bg-transparent"></div>

        {/* Content of the App */}
        <div className="flex-1 flex flex-col overflow-hidden relative pb-16">
          {children}
        </div>

        {/* Home Indicator bar for iOS/Android simulator feel */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/40 rounded-full z-40 pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
}
