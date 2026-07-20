import React, { useState, useEffect } from 'react';
import PhoneFrame from './components/PhoneFrame';
import Sidebar from './components/Sidebar';
import SplashView from './components/SplashView';
import LoginView from './components/LoginView';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import EditorView from './components/EditorView';
import HistoryView from './components/HistoryView';
import FavoritesView from './components/FavoritesView';
import ProfileView from './components/ProfileView';
import SubscriptionView from './components/SubscriptionView';
import SearchView from './components/SearchView';
import { User, Route, ChatMessage, Generation, ChatSession } from './types';
import { MessageSquare, Home, History, User as UserIcon } from 'lucide-react';

export default function App() {
  const [route, setRoute] = useState<Route>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [preFilledChatPrompt, setPreFilledChatPrompt] = useState('');

  // 1. Initial State Loading from LocalStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('junpon_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedTheme = localStorage.getItem('junpon_theme') || 'dark';
      setTheme(storedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');

      const storedSessions = localStorage.getItem('junpon_chat_sessions');
      let loadedSessions: ChatSession[] = [];
      if (storedSessions) {
        try {
          loadedSessions = JSON.parse(storedSessions);
        } catch (_) {}
      }

      // Migration fallback so users don't lose old single chat history
      if (loadedSessions.length === 0) {
        const storedChat = localStorage.getItem('junpon_chat');
        if (storedChat) {
          try {
            const oldMessages: ChatMessage[] = JSON.parse(storedChat);
            if (oldMessages && oldMessages.length > 0) {
              const defaultSession: ChatSession = {
                id: 'migrated_chat_default',
                title: oldMessages.find(m => m.role === 'user')?.text?.slice(0, 24) || 'Previous Conversation',
                messages: oldMessages,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              loadedSessions = [defaultSession];
              localStorage.setItem('junpon_chat_sessions', JSON.stringify(loadedSessions));
            }
          } catch (e) {
            console.error('Migration error', e);
          }
        }
      }

      if (loadedSessions.length === 0) {
        // Safe default initial empty session
        const defaultSession: ChatSession = {
          id: 'initial_chat',
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        loadedSessions = [defaultSession];
        localStorage.setItem('junpon_chat_sessions', JSON.stringify(loadedSessions));
      }

      setSessions(loadedSessions);

      const storedActiveId = localStorage.getItem('junpon_active_session_id');
      if (storedActiveId && loadedSessions.some(s => s.id === storedActiveId)) {
        setActiveSessionId(storedActiveId);
      } else {
        setActiveSessionId(loadedSessions[0].id);
      }

      const storedGens = localStorage.getItem('junpon_generations');
      if (storedGens) {
        const parsed = JSON.parse(storedGens);
        if (Array.isArray(parsed)) {
          const validGens = parsed.filter((g: any) => g && g.url && g.url.trim() !== '');
          setGenerations(validGens);
        }
      }
    } catch (e) {
      console.error('LocalStorage load error', e);
    }
  }, []);

  // 2. Splash Screen Transition completed handler
  const handleSplashComplete = () => {
    if (user) {
      setRoute('home');
    } else {
      setRoute('login');
    }
  };

  // 3. Login event completed handler
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('junpon_user', JSON.stringify(newUser));
    setRoute('home');
  };

  // 4. Logout action
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('junpon_user');
    setRoute('login');
  };

  // 5. Theme change handler
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('junpon_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // 6. Add Chat message to active session & sync
  const handleAddChatMessage = (newMsg: ChatMessage) => {
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const updatedMessages = [...session.messages, newMsg];
          // Set dynamic title based on the first user text
          let newTitle = session.title;
          if (session.title === 'New Chat' && newMsg.role === 'user') {
            newTitle = newMsg.text.length > 28 ? newMsg.text.slice(0, 28) + '...' : newMsg.text;
          }
          return {
            ...session,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      });

      try {
        const safeSessions = updatedSessions.map(session => ({
          ...session,
          messages: session.messages.map(msg => {
            if (msg.attachment && msg.attachment.url && msg.attachment.url.startsWith('data:') && msg.attachment.url.length > 10000) {
              return {
                ...msg,
                attachment: {
                  ...msg.attachment,
                  url: '⚠️ [Heavy Image Data - Stripped for storage space]'
                }
              };
            }
            return msg;
          })
        }));
        localStorage.setItem('junpon_chat_sessions', JSON.stringify(safeSessions));
      } catch (e) {
        console.warn('Failed to save chat sessions to localStorage due to quota limits', e);
        try {
          const fallback = updatedSessions.map(session => {
            if (session.id === activeSessionId) {
              return {
                ...session,
                messages: session.messages.slice(-12)
              };
            }
            return session;
          });
          localStorage.setItem('junpon_chat_sessions', JSON.stringify(fallback));
        } catch (err) {
          console.error('LocalStorage critical save fail', err);
        }
      }
      return updatedSessions;
    });
  };

  // 7. Clear chat messages for active session
  const handleClearChat = () => {
    setSessions(prevSessions => {
      const updated = prevSessions.map(s => s.id === activeSessionId ? { ...s, messages: [], title: 'New Chat' } : s);
      localStorage.setItem('junpon_chat_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  // Create a brand new empty chat session and activate it
  const handleCreateSession = (initialPrompt?: string) => {
    const newId = 'session_' + Math.random().toString(36).slice(2, 11);
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSessions(prev => {
      const updated = [newSession, ...prev];
      localStorage.setItem('junpon_chat_sessions', JSON.stringify(updated));
      return updated;
    });
    setActiveSessionId(newId);
    localStorage.setItem('junpon_active_session_id', newId);
    setRoute('chat');
    setSidebarOpen(false);
  };

  // Switch to a selected chat session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    localStorage.setItem('junpon_active_session_id', id);
    setRoute('chat');
    setSidebarOpen(false);
  };

  // Delete a chat session
  const handleDeleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      let nextActiveId = activeSessionId;

      if (filtered.length === 0) {
        const defaultSession: ChatSession = {
          id: 'initial_chat_reset',
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        filtered.push(defaultSession);
        nextActiveId = defaultSession.id;
      } else if (activeSessionId === id) {
        nextActiveId = filtered[0].id;
      }

      localStorage.setItem('junpon_chat_sessions', JSON.stringify(filtered));
      setActiveSessionId(nextActiveId);
      localStorage.setItem('junpon_active_session_id', nextActiveId);
      return filtered;
    });
  };

  // 8. Add Generation to history & sync
  const saveGenerationsToStorage = (list: Generation[]) => {
    try {
      // Drop heavy base64 strings (like uploaded source images) when saving to localStorage to prevent quota exhaustion
      const safeForStorage = list.map(g => {
        const pruned = { ...g };
        if (pruned.sourceUrl && pruned.sourceUrl.startsWith('data:') && pruned.sourceUrl.length > 20000) {
          // Keep a notice or just drop it for localStorage preservation
          pruned.sourceUrl = undefined;
        }
        if (pruned.url && pruned.url.startsWith('data:') && pruned.url.length > 50000) {
          // If the output itself is base64, keep it but drop if too large, or fallback
          pruned.url = ''; 
        }
        return pruned;
      });
      localStorage.setItem('junpon_generations', JSON.stringify(safeForStorage));
    } catch (e) {
      console.warn('Failed to save to localStorage due to quota limits, attempting fallback', e);
      try {
        // Ultimate fallback: save only non-base64 metadata
        const fallbackList = list.map(g => ({
          ...g,
          sourceUrl: undefined,
          url: g.url.startsWith('data:') ? '' : g.url
        })).slice(0, 10); // Keep only last 10 generations metadata
        localStorage.setItem('junpon_generations', JSON.stringify(fallbackList));
      } catch (err) {
        console.error('Critical localStorage save failure', err);
      }
    }
  };

  const handleAddGeneration = (newGen: Generation) => {
    const updated = [newGen, ...generations];
    setGenerations(updated);
    saveGenerationsToStorage(updated);
  };

  // 9. Toggle Favorite status of generation
  const handleToggleFavorite = (id: string) => {
    const updated = generations.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g));
    setGenerations(updated);
    saveGenerationsToStorage(updated);
  };

  // 10. Clear whole creations history
  const handleClearHistory = () => {
    setGenerations([]);
    localStorage.removeItem('junpon_generations');
  };

  // List of active tabs that should display the bottom navigation menu bar
  const showBottomNav = ['home', 'chat', 'history', 'profile', 'search', 'favorites'].includes(route);

  return (
    <PhoneFrame theme={theme}>
      {/* Dynamic View rendering based on Route */}
      {route === 'splash' && <SplashView onComplete={handleSplashComplete} />}

      {route === 'login' && <LoginView onLoginSuccess={handleLogin} />}

      {route === 'home' && (
        <HomeView
          user={user}
          onNavigate={setRoute}
          onOpenSidebar={() => setSidebarOpen(true)}
          onPreFillChatPrompt={setPreFilledChatPrompt}
          theme={theme}
        />
      )}

      {route === 'chat' && (
        <ChatView
          chatHistory={sessions.find(s => s.id === activeSessionId)?.messages || (sessions[0]?.messages || [])}
          onAddMessage={handleAddChatMessage}
          onClearChat={handleClearChat}
          onBack={() => setRoute('home')}
          preFilledPrompt={preFilledChatPrompt}
          onClearPreFilledPrompt={() => setPreFilledChatPrompt('')}
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewChat={() => handleCreateSession()}
          activeSessionTitle={sessions.find(s => s.id === activeSessionId)?.title || 'New Chat'}
        />
      )}

      {route === 'imagegen' && (
        <ImageGenView
          generations={generations}
          onAddGeneration={handleAddGeneration}
          onToggleFavorite={handleToggleFavorite}
          onBack={() => setRoute('home')}
        />
      )}

      {route === 'editor' && <EditorView onBack={() => setRoute('home')} />}

      {route === 'history' && (
        <HistoryView
          generations={generations}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
          onBack={() => setRoute('home')}
        />
      )}

      {route === 'favorites' && (
        <FavoritesView
          generations={generations}
          onToggleFavorite={handleToggleFavorite}
          onBack={() => setRoute('profile')}
        />
      )}

      {route === 'profile' && (
        <ProfileView
          user={user}
          theme={theme}
          onThemeChange={handleThemeChange}
          onNavigate={setRoute}
          onLogout={handleLogout}
          onBack={() => setRoute('home')}
        />
      )}

      {route === 'subscription' && <SubscriptionView onBack={() => setRoute('home')} />}

      {route === 'search' && (
        <SearchView
          onNavigate={setRoute}
          onPreFillChatPrompt={setPreFilledChatPrompt}
          onBack={() => setRoute('home')}
        />
      )}

      {/* Side Slider Menu overlay layer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onNavigate={setRoute}
        onLogout={handleLogout}
        theme={theme}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Universal Bottom Navigation tabs (shows on main tabs only) */}
      {showBottomNav && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-t border-neutral-900 flex items-center justify-around px-2 z-30 select-none pb-1.5 transition-colors duration-300">
          <button
            onClick={() => setRoute('home')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              route === 'home' ? 'text-[#20C997] font-bold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-sans tracking-wide">Home</span>
          </button>

          <button
            onClick={() => setRoute('chat')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              route === 'chat' ? 'text-[#20C997] font-bold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-sans tracking-wide">Chat</span>
          </button>

          <button
            onClick={() => setRoute('history')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              route === 'history' ? 'text-[#20C997] font-bold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-sans tracking-wide">History</span>
          </button>

          <button
            onClick={() => setRoute('profile')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
              route === 'profile' ? 'text-[#20C997] font-bold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-sans tracking-wide">Profile</span>
          </button>
        </div>
      )}
    </PhoneFrame>
  );
}
