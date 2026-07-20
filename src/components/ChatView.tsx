import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Trash2, Sparkles, AlertCircle, Copy, Check, Volume2, VolumeX, Mic, MicOff, Camera, FileUp, Paperclip, X, Image as ImageIcon, ArrowUp, Plus, Sun, Moon, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface ChatViewProps {
  chatHistory: ChatMessage[];
  onAddMessage: (message: ChatMessage) => void;
  onClearChat: () => void;
  onBack: () => void;
  preFilledPrompt?: string;
  onClearPreFilledPrompt?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onOpenSidebar?: () => void;
  onNewChat?: () => void;
  activeSessionTitle?: string;
}

const SUGGESTIONS = [
  'Write a professional email asking for a raise',
  'Explain block-chain simply with an analogy',
  'Give me 5 creative domain names for a startup',
  'Help me fix a bug with TypeScript type definitions',
];

export default function ChatView({
  chatHistory,
  onAddMessage,
  onClearChat,
  onBack,
  preFilledPrompt,
  onClearPreFilledPrompt,
  theme = 'dark',
  onThemeChange,
  onOpenSidebar,
  onNewChat,
  activeSessionTitle,
}: ChatViewProps) {
  const isDark = theme === 'dark';
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isAutoSpeak, setIsAutoSpeak] = useState<boolean>(() => {
    try {
      return localStorage.getItem('junpon_autospeak') === 'true';
    } catch {
      return false;
    }
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState('bn-BD'); // 'bn-BD' by default or 'en-US'
  const recognitionRef = useRef<any>(null);

  // File & Camera Attachment States
  const [attachment, setAttachment] = useState<{ url: string; mimeType: string; name: string } | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close attachment dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showAttachmentMenu) {
        setShowAttachmentMenu(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showAttachmentMenu]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Start Webcam stream for the custom desktop live camera modal
  const startCamera = async () => {
    try {
      setShowCameraModal(true);
      setShowAttachmentMenu(false);
      // Wait for a render cycle so video element is created
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err: any) {
          console.error("Webcam stream failed:", err);
          alert("Could not open desktop camera stream. Please use standard file upload or verify permissions.");
          setShowCameraModal(false);
        }
      }, 300);
    } catch (e) {
      console.error(e);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAttachment({
          url: dataUrl,
          mimeType: 'image/jpeg',
          name: `Camera_Capture_${Date.now().toString().slice(-4)}.jpg`
        });
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachment({
          url: event.target.result as string,
          mimeType: file.type || 'application/octet-stream',
          name: file.name
        });
      }
    };
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
    // Reset input so the same file can be uploaded again
    e.target.value = '';
  };

  const autoDetectLang = () => {
    // 1. Check if current text input has Bengali characters
    const hasBengaliInput = /[\u0980-\u09FF]/.test(input);
    if (hasBengaliInput) return 'bn-BD';

    // 2. Check recent chat history for Bengali
    const recentHistory = chatHistory.slice(-3);
    const hasBengaliHistory = recentHistory.some(msg => /[\u0980-\u09FF]/.test(msg.text));
    if (hasBengaliHistory) return 'bn-BD';

    // 3. Check browser language
    const browserLang = navigator.language || '';
    if (browserLang.startsWith('bn')) return 'bn-BD';

    // 4. Check user preferences/languages list
    const navLanguages = navigator.languages || [];
    const prefersBengali = navLanguages.some(l => l.toLowerCase().startsWith('bn'));
    if (prefersBengali) return 'bn-BD';

    // 5. Check timezone as a strong hint
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Dhaka' || tz === 'Asia/Kolkata') {
        return 'bn-BD';
      }
    } catch (e) {
      console.error(e);
    }

    // Default to 'en-US'
    return 'en-US';
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = recognitionLang;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [recognitionLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Your browser does not support voice input. Please use Google Chrome or Safari.');
      return;
    }
    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        const detectedLang = autoDetectLang();
        setRecognitionLang(detectedLang);
        recognitionRef.current.lang = detectedLang;
        recognitionRef.current.start();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stop speaking when navigating away
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  useEffect(() => {
    if (preFilledPrompt) {
      setInput(preFilledPrompt);
      if (onClearPreFilledPrompt) {
        onClearPreFilledPrompt();
      }
    }
  }, [preFilledPrompt, onClearPreFilledPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  const toggleAutoSpeak = () => {
    const newVal = !isAutoSpeak;
    setIsAutoSpeak(newVal);
    try {
      localStorage.setItem('junpon_autospeak', String(newVal));
    } catch (e) {
      console.error(e);
    }
  };

  const speakText = (text: string, id: string) => {
    try {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();

      // Filter out code blocks and markdown punctuation for a beautiful read
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '[Code snippet skipped]') // skip reading long code chunks
        .replace(/[#*`_~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/-\s+/g, '')
        .replace(/\n+/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Check for Bengali characters
      const isBengali = /[\u0980-\u09FF]/.test(text);
      if (isBengali) {
        utterance.lang = 'bn-BD';
      } else {
        // Automatically matches user browser language
        utterance.lang = '';
      }

      utterance.onend = () => {
        setSpeakingId(null);
      };

      utterance.onerror = () => {
        setSpeakingId(null);
      };

      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      setSpeakingId(null);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text && !attachment) return; // Allow sending just an image/file too, or image with text!
    
    const currentAttachment = attachment;
    setInput('');
    setAttachment(null);
    setApiError(null);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message to History (including optional attachment)
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2, 9),
      role: 'user',
      text: text || (currentAttachment ? `[Attachment: ${currentAttachment.name}]` : ''),
      time: timeString,
      attachment: currentAttachment || undefined,
    };
    onAddMessage(userMsg);

    // 2. Trigger Generating Indicator
    setIsGenerating(true);

    try {
      // 3. Post to Express Server API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || (currentAttachment ? `Analyze this attachment named ${currentAttachment.name}` : ''),
          history: chatHistory, // Pass all previous messages for full multi-turn context
          attachment: currentAttachment || undefined,
        }),
      });

      if (!response.ok) {
        let errMsg = `Server returned code ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      // 4. Add Assistant Message to History
      const assistantId = Math.random().toString(36).slice(2, 9);
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        text: data.text || 'Sorry, I did not receive a response from the model.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddMessage(assistantMsg);

      // Speak if auto-speak is enabled
      if (isAutoSpeak && data.text) {
        speakText(data.text, assistantId);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setApiError(err.message || 'Could not communicate with the Gemini server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-slate-100' : 'bg-neutral-50 text-neutral-800'}`}>
      {/* Top Header */}
      <div className={`h-14 px-4 flex items-center justify-between border-b sticky top-0 z-30 transition-colors duration-300 ${isDark ? 'border-neutral-900 bg-black/90 text-neutral-100' : 'border-neutral-200 bg-white/95 text-neutral-800'} backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'text-neutral-350 hover:bg-neutral-900' : 'text-[#20C997] hover:bg-neutral-100'}`}
              title="Open Recents / পূর্ববর্তী চ্যাট দেখুন"
            >
              <Menu className="w-5 h-5 text-[#20C997]" />
            </button>
          )}
          <button
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-neutral-350 hover:bg-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
            title="Back to home"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="min-w-0 max-w-[120px] sm:max-w-[160px]">
            <h2 className={`text-xs font-serif font-semibold leading-tight truncate ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
              {activeSessionTitle || 'AI Chat'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse shrink-0"></span>
              <p className="text-[8px] text-[#20C997] font-mono uppercase tracking-wider truncate">
                Active Session
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onNewChat && (
            <button
              onClick={onNewChat}
              className={`p-2 rounded-xl transition-all flex items-center justify-center border ${isDark ? 'text-[#20C997] bg-[#20C997]/5 border-neutral-900 hover:bg-[#20C997]/15' : 'text-[#12a178] bg-[#e6fbf5] border-neutral-200 hover:bg-emerald-100'}`}
              title="Start a new chat / নতুন চ্যাট শুরু করুন"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Elegant 3D Speaker Auto Speak Toggle */}
          <button
            onClick={toggleAutoSpeak}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isAutoSpeak
                ? 'text-black bg-[#20C997] border border-[#20C997] shadow-[0_0_15px_rgba(32,201,151,0.25)]'
                : `hover:bg-neutral-900 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'}`
            }`}
            title={isAutoSpeak ? 'Disable Voice Auto-Response' : 'Enable Voice Auto-Response'}
          >
            {isAutoSpeak ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 animate-pulse" />
            )}
          </button>

          {chatHistory.length > 0 && (
            <button
              onClick={onClearChat}
              className={`p-2 rounded-xl transition-all ${isDark ? 'text-neutral-500 hover:text-rose-450 hover:bg-rose-500/10' : 'text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10'}`}
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-thin">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center h-full">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-3xl bg-[#20C997]/5 opacity-10 blur-xl"></div>
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${isDark ? 'bg-neutral-950 border border-neutral-900' : 'bg-white border border-neutral-200'}`}>
                💬
              </div>
            </div>

            <h3 className={`text-base font-serif font-normal tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
              Ask Junpon <span className="font-serif italic text-[#20C997] font-normal">anything</span>
            </h3>
            <p className={`text-[11px] max-w-[240px] mt-2 leading-relaxed ${isDark ? 'text-neutral-450' : 'text-neutral-500'}`}>
              Experience lightning-fast answers, advanced reasoning, text synthesis, or clean code formatting.
            </p>

            {/* Quick Suggestions Cards */}
            <div className="w-full space-y-2.5 mt-8 max-w-xs">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium shadow-sm transition-all duration-200 active:scale-[0.98] ${isDark ? 'bg-neutral-950 border border-neutral-900 text-neutral-300 hover:border-[#20C997]/40' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-[#20C997]/40 hover:bg-neutral-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className={`w-6 h-6 mt-1 rounded-lg flex items-center justify-center text-[#20C997] text-[10px] flex-shrink-0 ${isDark ? 'bg-neutral-950 border border-neutral-900' : 'bg-white border border-neutral-200 shadow-sm'}`}>
                    ✦
                  </div>
                )}

                <div className="max-w-[85%] flex flex-col gap-1.5">
                  {msg.role === 'assistant' && (
                    <div className="flex flex-col gap-2 mt-0.5 mb-2">
                      <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-neutral-500">
                        <Sparkles className="w-2.5 h-2.5 text-[#20C997]" />
                        <span>Sources</span>
                      </div>
                      <div className="flex gap-1.5 select-none overflow-x-auto pb-0.5 max-w-full">
                        <div className={`px-2 py-1 rounded-md text-[9px] flex items-center gap-1 whitespace-nowrap ${isDark ? 'bg-neutral-950 border border-neutral-900 text-neutral-400' : 'bg-white border border-neutral-200 text-neutral-700 font-semibold shadow-sm'}`}>
                          <span className="w-1 h-1 rounded-full bg-[#20C997]"></span>
                          <span>Junpon Knowledge Graph</span>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[9px] flex items-center gap-1 whitespace-nowrap ${isDark ? 'bg-neutral-950 border border-neutral-900 text-neutral-400' : 'bg-white border border-neutral-200 text-neutral-700 font-semibold shadow-sm'}`}>
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          <span>Real-time Sync</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.attachment && (
                    <div className={`mb-1.5 ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                      {msg.attachment.mimeType.startsWith('image/') ? (
                        msg.attachment.url.startsWith('⚠️') ? (
                          <div className={`rounded-xl p-2.5 flex items-center gap-2.5 max-w-xs text-xs shadow-md border ${isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-500'}`}>
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-neutral-500 font-bold border flex-shrink-0 text-base ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-250'}`}>
                              🖼️
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-sans font-medium truncate text-[11px]">{msg.attachment.name}</p>
                              <p className="text-[9px] text-neutral-500 font-mono mt-0.5">IMAGE IN LOCAL STORAGE (STRIPPED)</p>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`relative rounded-lg overflow-hidden border max-w-xs cursor-zoom-in hover:brightness-110 transition-all duration-200 shadow-md group ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-100'}`}
                            onClick={() => setActiveZoomImage(msg.attachment!.url)}
                          >
                            <img 
                              src={msg.attachment.url} 
                              alt={msg.attachment.name} 
                              className="max-h-40 object-cover rounded-lg max-w-full block"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[10px] text-white font-mono bg-black/70 px-2.5 py-1 rounded-full border border-neutral-800">
                                🔍 Click to zoom
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className={`rounded-xl p-2.5 flex items-center gap-2.5 max-w-xs text-xs shadow-md border ${isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-500'}`}>
                          <div className={`w-8 h-8 rounded flex items-center justify-center text-[#20C997] font-bold border flex-shrink-0 text-base ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-250'}`}>
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans font-medium truncate text-[11px]">{msg.attachment.name}</p>
                            <p className="text-[9px] text-neutral-500 font-mono uppercase mt-0.5">{msg.attachment.mimeType.split('/')[1] || 'FILE'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`relative leading-relaxed transition-all duration-350 ${
                      msg.role === 'user'
                        ? (isDark 
                          ? 'bg-neutral-900 text-neutral-100 rounded-xl rounded-tr-none px-3.5 py-2.5 text-xs border border-neutral-800 shadow-sm'
                          : 'bg-[#20C997]/15 text-neutral-950 font-medium rounded-xl rounded-tr-none px-3.5 py-2.5 text-xs border border-[#20C997]/30 shadow-sm')
                        : `bg-transparent border-none ${isDark ? 'text-neutral-200' : 'text-neutral-950'} text-xs p-0`
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    ) : (
                      <div className={`markdown-body prose max-w-none pb-1 ${isDark ? 'dark:prose-invert text-neutral-250' : 'prose-neutral text-neutral-950 font-medium'}`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className={`h-7 px-2.5 rounded-lg border text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${isDark ? 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white hover:border-[#20C997]/30' : 'bg-white border-neutral-200 text-neutral-700 font-semibold hover:text-neutral-950 hover:border-[#20C997]/30 shadow-sm'}`}
                        title="Copy response to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#20C997]" />
                            <span className="text-[#20C997] font-medium font-sans">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="font-sans">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`h-7 px-2.5 rounded-lg border text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                          speakingId === msg.id
                            ? 'bg-[#20C997] border-[#20C997] text-black shadow-sm font-semibold'
                            : (isDark ? 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-700 font-semibold hover:text-neutral-950 shadow-sm')
                        }`}
                        title={speakingId === msg.id ? 'Stop voice' : 'Listen to response'}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 animate-pulse" />
                            <span className="font-sans">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span className="font-sans">Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  <span
                    className={`text-[9px] font-mono select-none ${isDark ? 'text-neutral-500' : 'text-neutral-600 font-medium'} ${
                      msg.role === 'user' ? 'text-right mr-1' : 'ml-1'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading / Typing indicator */}
        {isGenerating && (
          <div className="flex gap-2.5 items-start justify-start animate-fade-in">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[#20C997] text-[10px] flex-shrink-0 ${isDark ? 'bg-neutral-950 border border-neutral-900' : 'bg-white border border-neutral-200 shadow-sm'}`}>
              ✦
            </div>
            <div className="bg-transparent border-none p-0 flex items-center justify-center">
              <div className="flex items-center gap-2 py-0.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-bounce"></span>
                </div>
                <span className="text-[10px] text-[#20C997] font-mono uppercase tracking-wider animate-pulse">
                  Searching...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* API Error Box */}
        {apiError && (
          <div className={`p-3.5 rounded-xl flex gap-2.5 items-start border ${isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-rose-50 border-rose-100 shadow-sm'}`}>
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className={`text-xs leading-normal ${isDark ? 'text-rose-450' : 'text-rose-800'}`}>
              <span className="font-bold">Error:</span> {apiError}
              <button
                onClick={() => handleSend()}
                className="block underline font-bold mt-1 hover:text-rose-450 transition-colors"
              >
                Retry message
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className={`p-3.5 relative border-t transition-colors duration-300 ${isDark ? 'border-neutral-900 bg-black' : 'border-neutral-200 bg-white'}`}>
        {/* Hidden inputs for uploading files and camera */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={nativeCameraInputRef} 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {/* Attachment preview box if one is selected */}
        {attachment && (
          <div className={`absolute left-3.5 right-3.5 -top-16 border rounded-xl p-2.5 flex items-center justify-between shadow-2xl animate-fade-in z-20 ${isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-neutral-200'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {attachment.mimeType.startsWith('image/') ? (
                <img 
                  src={attachment.url} 
                  alt="Attachment preview" 
                  className={`w-10 h-10 object-cover rounded-lg border ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-rose-450 text-lg font-bold ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                  📄
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className={`text-xs font-sans font-medium truncate max-w-[180px] ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>{attachment.name}</p>
                <p className="text-[9px] text-neutral-500 font-mono uppercase mt-0.5">{attachment.mimeType || 'Unknown Type'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDark ? 'hover:bg-neutral-900 text-neutral-450 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800'}`}
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={`flex flex-col rounded-3xl p-1 transition-all duration-350 border ${
          isDark 
            ? 'bg-[#06110e] border-[#20C997]/25 focus-within:ring-2 focus-within:ring-[#20C997]/15 focus-within:border-[#20C997]/50 focus-within:bg-[#071914]' 
            : 'bg-[#f4fcf9] border-[#20C997]/30 shadow-sm focus-within:ring-2 focus-within:ring-[#20C997]/10 focus-within:border-[#20C997]/55 focus-within:bg-[#e8f7f3]'
        }`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isGenerating}
            placeholder={isListening ? "Listening... speak now / বলুন..." : "Ask Junpon anything..."}
            rows={2}
            className={`w-full bg-transparent border-none outline-none text-xs font-sans resize-none py-2 px-3.5 leading-relaxed scrollbar-none transition-all duration-300 ${
              isDark 
                ? 'text-[#a4eed8] placeholder-[#20C997]/40' 
                : 'text-[#0a3f31] placeholder-[#12a178]/60'
            } ${
              isListening ? 'animate-pulse text-[#20C997] placeholder-[#20C997]/60' : ''
            }`}
          />

          <div className="flex items-center justify-between px-2 pb-1.5 bg-transparent">
            {/* Left side voice feedback status */}
            <div className="flex items-center gap-1.5">
              {isListening && (
                <span className="flex items-center gap-1 text-[9px] font-mono text-rose-400 pl-1.5 uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Listening / শুনছি...
                </span>
              )}
            </div>

            {/* Action Tools aligned side-by-side on the right */}
            <div className="flex items-center gap-2">



              {/* Voice input microphone with 3D tactile theme */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer flex-shrink-0 select-none ${
                  isListening
                    ? 'bg-gradient-to-b from-rose-400 to-rose-600 border-b-4 border-rose-850 text-white animate-pulse shadow-[0_4px_12px_rgba(239,68,68,0.4)] active:translate-y-[2px] active:border-b-2'
                    : isDark 
                      ? 'bg-gradient-to-b from-[#142d25] to-[#0a1b16] border-b-4 border-[#040e0b] text-[#20C997] hover:from-[#1b3d32] hover:to-[#0f2821] active:translate-y-[2px] active:border-b-2 shadow-md hover:text-[#25dfa9]' 
                      : 'bg-gradient-to-b from-[#e6fbf5] to-[#d0f6ea] border-b-4 border-[#9bead1] text-[#12a178] hover:from-[#d1faf0] hover:to-[#bbf2e1] active:translate-y-[2px] active:border-b-2 shadow-sm hover:text-[#0e7c5d]'
                }`}
                title={isListening ? 'Stop Listening' : 'Talk with Voice'}
              >
                {isListening ? (
                  <MicOff className="w-4.5 h-4.5 stroke-[2.25]" />
                ) : (
                  <Mic className="w-4.5 h-4.5 stroke-[2.25]" />
                )}
              </button>

              {/* Attachment / Plus Button with 3D tactile theme */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAttachmentMenu(!showAttachmentMenu);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer flex-shrink-0 select-none ${
                    showAttachmentMenu || attachment
                      ? 'bg-gradient-to-b from-[#20C997] to-[#12a178] hover:from-[#25dfa9] hover:to-[#15b084] border-b-4 border-[#0e7c5d] text-neutral-950 shadow-[0_4px_12px_rgba(32,201,151,0.3)] active:translate-y-[2px] active:border-b-2'
                      : isDark 
                        ? 'bg-gradient-to-b from-[#142d25] to-[#0a1b16] border-b-4 border-[#040e0b] text-[#20C997] hover:from-[#1b3d32] hover:to-[#0f2821] active:translate-y-[2px] active:border-b-2 shadow-md hover:text-[#25dfa9]' 
                        : 'bg-gradient-to-b from-[#e6fbf5] to-[#d0f6ea] border-b-4 border-[#9bead1] text-[#12a178] hover:from-[#d1faf0] hover:to-[#bbf2e1] active:translate-y-[2px] active:border-b-2 shadow-sm hover:text-[#0e7c5d]'
                  }`}
                  title="Attach File or Capture Camera"
                >
                  <Plus className={`w-4.5 h-4.5 stroke-[2.5] transition-colors duration-150 ${
                    showAttachmentMenu || attachment
                      ? 'text-neutral-950'
                      : ''
                  }`} />
                </button>

                {/* Dropdown Action Menu */}
                {showAttachmentMenu && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute bottom-11 right-0 border rounded-xl p-2 w-48 shadow-[0_12px_36px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-1 animate-fade-in ${isDark ? 'bg-neutral-950 border-neutral-850' : 'bg-white border-neutral-200 shadow-lg'}`}
                  >
                    <div className="text-[8px] text-neutral-500 font-mono uppercase px-2 py-1 tracking-wider select-none text-left font-bold">
                      Attach Media
                    </div>
                    
                    {/* Upload File / Photos */}
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left font-sans font-medium ${isDark ? 'text-neutral-300 hover:bg-neutral-900 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                    >
                      <FileUp className="w-4 h-4 text-[#20C997]" />
                      <span>Upload File / Photo</span>
                    </button>

                    {/* Webcam Live Capture */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left font-sans font-medium ${isDark ? 'text-neutral-300 hover:bg-neutral-900 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                    >
                      <Camera className="w-4 h-4 text-[#20C997]" />
                      <span>Use Live Camera</span>
                    </button>

                    {/* Mobile camera direct */}
                    <button
                      type="button"
                      onClick={() => {
                        nativeCameraInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left font-sans font-medium ${isDark ? 'text-neutral-300 hover:bg-neutral-900 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                    >
                      <Camera className="w-4 h-4 text-[#20C997]" />
                      <span>Mobile Camera (Direct)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* High-contrast, tactile 3D Green Up Arrow Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={(!input.trim() && !attachment) || isGenerating}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer flex-shrink-0 font-bold select-none
                  ${
                    (!input.trim() && !attachment) || isGenerating
                      ? isDark
                        ? 'bg-gradient-to-b from-[#143d31] to-[#0d2c22] border-b-4 border-[#071a14] text-neutral-500 opacity-60 cursor-not-allowed shadow-sm'
                        : 'bg-gradient-to-b from-[#cfebd9] to-[#b1dec0] border-b-4 border-[#98cca8] text-neutral-500 opacity-75 cursor-not-allowed shadow-sm'
                      : 'bg-gradient-to-b from-[#20C997] to-[#12a178] hover:from-[#25dfa9] hover:to-[#15b084] border-b-4 border-[#0e7c5d] active:translate-y-[2px] active:border-b-2 shadow-[0_4px_12px_rgba(32,201,151,0.35)]'
                  }
                `}
                title="Send Message / বার্তা পাঠান"
              >
                <ArrowUp className={`w-4.5 h-4.5 stroke-[3.5] transition-colors duration-150 ${
                  (!input.trim() && !attachment) || isGenerating
                    ? isDark ? 'text-neutral-500' : 'text-[#50b296]'
                    : 'text-neutral-950'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Helper text when listening */}
        {isListening && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 backdrop-blur-md text-rose-400 text-[10px] font-mono tracking-wider flex items-center gap-1.5 animate-bounce shadow-lg whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>LISTENING NOW (কথা বলুন...)</span>
          </div>
        )}
      </div>

      {/* 1. Fullscreen Image zoom preview Modal */}
      {activeZoomImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-fade-in"
          onClick={() => setActiveZoomImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer active:scale-95 transition-all"
            onClick={() => setActiveZoomImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-[90%] max-h-[80%] overflow-hidden rounded-2xl border border-neutral-900 shadow-2xl">
            <img 
              src={activeZoomImage} 
              alt="High resolution view" 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl block"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-neutral-400 text-[11px] font-mono mt-4 tracking-wide uppercase select-none">
            Click anywhere to close preview
          </p>
        </div>
      )}

      {/* 2. Custom Live Camera webcam capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 max-w-sm w-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative flex flex-col items-center">
            <button 
              className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-all"
              onClick={stopCamera}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 self-start">
              <span className="w-2 h-2 rounded-full bg-[#20C997] animate-ping"></span>
              <h4 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-widest">
                Live Camera Capture
              </h4>
            </div>

            {/* Video viewport framed inside an elegant camera viewfinder */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-900 bg-black flex items-center justify-center shadow-inner mb-5">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Retro viewfinder corner marks */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-neutral-600"></div>
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-neutral-600"></div>
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-neutral-600"></div>
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-neutral-600"></div>
              
              {!cameraStream && (
                <p className="absolute text-[10px] text-neutral-500 font-mono animate-pulse uppercase">
                  Initializing camera stream...
                </p>
              )}
            </div>

            <div className="flex gap-2.5 w-full">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraStream}
                className="flex-1 py-2.5 rounded-xl bg-[#20C997] hover:bg-[#1ebd8e] text-black font-semibold text-xs transition-all duration-300 disabled:opacity-30 cursor-pointer active:scale-95"
              >
                Capture Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850 text-xs font-medium transition-all duration-300 cursor-pointer active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
