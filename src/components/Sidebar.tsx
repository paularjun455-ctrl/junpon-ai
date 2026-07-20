import React from 'react';
import { MessageSquare, Grid, History, Heart, Settings, HelpCircle, LogOut, Sparkles, X, Plus, Trash2, MessageCircle } from 'lucide-react';
import { User, Route, ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onNavigate: (route: Route) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteSession?: (id: string, e?: React.MouseEvent) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  onNavigate,
  onLogout,
  theme = 'dark',
  sessions = [],
  activeSessionId = '',
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) {
  const isDark = theme === 'dark';
  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'G';

  return (
    <>
      {/* Background Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar menu slider */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-[280px] max-w-[85%] z-50 transform transition-transform duration-300 ease-out flex flex-col p-5 shadow-2xl transition-colors ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-[#0a0a0b] border-r border-neutral-900 text-neutral-100' : 'bg-white border-r border-neutral-200 text-neutral-800'}`}
      >
        {/* Header brand */}
        <div className={`flex items-center justify-between border-b pb-4 mb-3.5 ${isDark ? 'border-neutral-900' : 'border-neutral-100'}`}>
          <div className="flex items-center gap-2.5">
            {/* Multi-faceted premium 3D crystal logo */}
            <div className="relative w-5.5 h-5.5 flex-shrink-0 animate-float select-none">
              <svg
                className="w-full h-full drop-shadow-[0_0_8px_rgba(32,201,151,0.4)]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="side-logo-top-left" x1="8" y1="3" x2="12" y2="9" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#D946EF" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="side-logo-top-right" x1="16" y1="3" x2="12" y2="9" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#20C997" />
                    <stop offset="100%" stopColor="#0AA37A" />
                  </linearGradient>
                  <linearGradient id="side-logo-mid-center" x1="8" y1="3" x2="16" y2="9" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="side-logo-bottom-left" x1="3" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                  <linearGradient id="side-logo-bottom-right" x1="21" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                </defs>
                
                <polygon points="8,3 16,3 12,9" fill="url(#side-logo-mid-center)" opacity="0.95" />
                <polygon points="8,3 3,9 12,9" fill="url(#side-logo-top-left)" opacity="0.9" />
                <polygon points="16,3 21,9 12,9" fill="url(#side-logo-top-right)" opacity="0.9" />
                <polygon points="3,9 12,21 12,9" fill="url(#side-logo-bottom-left)" opacity="0.85" />
                <polygon points="21,9 12,21 12,9" fill="url(#side-logo-bottom-right)" opacity="0.85" />
                
                {/* Edge highlights */}
                <polyline points="8,3 12,9 16,3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="9" x2="12" y2="21" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <polyline points="3,9 12,9 21,9" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                <polygon points="8,3 16,3 21,9 12,21 3,9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`text-base font-serif tracking-tight font-medium ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
              Junpon <span className="font-serif italic text-[#20C997] font-normal">AI</span>
            </span>
            <span className={`text-[9px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full ${isDark ? 'bg-neutral-900 text-amber-400 border border-neutral-800' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold'}`}>
              Pro
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? 'hover:bg-neutral-900 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu list */}
        <ul className="space-y-1">
          <li
            onClick={() => {
              onNavigate('chat');
              onClose();
            }}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl cursor-pointer transition-all font-sans text-xs ${isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-900' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <MessageSquare className="w-4 h-4 text-[#20C997]" />
            <span>AI Chat</span>
          </li>

          <li
            onClick={() => {
              onNavigate('search');
              onClose();
            }}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl cursor-pointer transition-all font-sans text-xs ${isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-900' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <Grid className="w-4 h-4 text-[#20C997]" />
            <span>AI Tools</span>
          </li>



          <li
            onClick={() => {
              onNavigate('profile');
              onClose();
            }}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl cursor-pointer transition-all font-sans text-xs ${isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-900' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
          >
            <Settings className="w-4 h-4 text-[#20C997]" />
            <span>Settings</span>
          </li>

          <li
            onClick={() => {
              onNavigate('subscription');
              onClose();
            }}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl cursor-pointer transition-all font-sans text-xs border ${isDark ? 'bg-neutral-950 border-neutral-900 text-amber-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-800'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono tracking-wide">Junpon Pro</span>
          </li>
        </ul>

        {/* Recents Section */}
        <div className={`flex flex-col flex-1 overflow-hidden mt-4 border-t pt-3 ${isDark ? 'border-neutral-900/80' : 'border-neutral-100'}`}>
          <div className="flex items-center justify-between px-3 mb-1.5 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-450'}`}>
              Recents
            </span>
            {onNewChat && (
              <button
                onClick={onNewChat}
                className={`p-1 rounded-lg transition-colors border ${isDark ? 'hover:bg-neutral-900 border-neutral-900 text-neutral-400 hover:text-[#20C997]' : 'hover:bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-[#12a178]'}`}
                title="Start dynamic new chat / নতুন চ্যাট শুরু করুন"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
            {sessions.length > 0 ? (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession?.(session.id)}
                    className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-[#142d25]/40 border border-[#20C997]/25 text-[#20C997] font-semibold'
                          : 'bg-[#e6fbf5] border border-[#20C997]/25 text-[#12a178] font-semibold'
                        : isDark
                          ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] shrink-0" />
                      ) : (
                        <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                      )}
                      <span className="text-xs truncate tracking-wide pr-3">
                        {session.title || 'New Chat'}
                      </span>
                    </div>

                    {/* Delete session button, visible on hover */}
                    {onDeleteSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id, e);
                        }}
                        className={`p-1 rounded-md transition-all shrink-0 ${
                          isActive
                            ? 'text-[#20C997]/60 hover:text-rose-500 hover:bg-rose-500/15'
                            : 'opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-500 hover:bg-neutral-800/40'
                        }`}
                        title="Delete this chat history"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-neutral-500 italic px-3 py-2">
                No recent conversations
              </div>
            )}
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className={`pt-4 mt-auto border-t ${isDark ? 'border-neutral-900' : 'border-neutral-100'}`}>
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-serif text-sm text-[#20C997] font-semibold ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-250'}`}>
                {firstLetter}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>{user.name}</div>
                <div className={`text-[10px] truncate ${isDark ? 'text-neutral-500' : 'text-neutral-450'}`}>{user.email}</div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className={`w-full mt-3 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${isDark ? 'text-rose-450 hover:bg-rose-500/10 border-rose-500/15' : 'text-rose-650 hover:bg-rose-50 border-rose-200 shadow-sm'}`}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
