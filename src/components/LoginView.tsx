import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User as UserIcon, ArrowRight, Eye, EyeOff, Lock, ShieldCheck, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

// Minimalistic high-fidelity Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Minimalistic high-fidelity Apple Icon SVG
const AppleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33" />
  </svg>
);

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState('');

  // Form validations
  const isEmailValid = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim();

    if (activeTab === 'forgot') {
      if (!finalEmail || !isEmailValid(finalEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      setError('');
      setIsAuthenticating(true);
      setAuthStep('Dispatching Reset Token...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setAuthStep('Cryptographic signature generated.');
      await new Promise(resolve => setTimeout(resolve, 800));
      setAuthStep('Password reset email sent successfully!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticating(false);
      setActiveTab('signin');
      return;
    }

    const emailPrefix = finalEmail.split('@')[0] || '';
    const extractedName = emailPrefix
      .split(/[^a-zA-Z0-9]/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Junpon User';

    const finalName = activeTab === 'signup' ? name.trim() : extractedName;

    if (activeTab === 'signup' && !finalName) {
      setError('Please enter your name.');
      return;
    }
    if (!finalEmail || !isEmailValid(finalEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setIsAuthenticating(true);

    // Cryptographic simulated secure handshake (Premium tactile feedback)
    const steps = [
      'Initializing Secure Tunnel...',
      'Verifying RSA Signatures...',
      'Syncing User Space Databases...',
      'Handshake Complete! Welcome to Junpon AI'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAuthStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, i === steps.length - 1 ? 950 : 700));
    }

    setIsAuthenticating(false);
    onLoginSuccess({
      name: finalName,
      email: finalEmail,
      isPro: true, // Auto-award pro access to new logins
    });
  };

  // OAuth continuous authentication
  const handleOAuth = async (provider: 'Google' | 'Apple') => {
    setError('');
    setIsAuthenticating(true);
    
    const steps = [
      `Connecting to ${provider} Gateway...`,
      'Validating Token Exchange Handshake...',
      'Cryptographically Securing Account...',
      'Access Granted!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAuthStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setIsAuthenticating(false);
    onLoginSuccess({
      name: `${provider} User`,
      email: `user.${provider.toLowerCase()}@junpon.ai`,
      isPro: true
    });
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col justify-between overflow-y-auto p-6 sm:p-8 z-40 transition-all duration-300 select-none relative">
      
      {/* Luxurious Glowing Violet & Cyber Blue Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none"></div>

      {/* Main Glassmorphic Container */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10 my-auto py-6">
        
        {/* Animated App Logo Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          {/* Glowing 3D Crystal Logo Mockup Emblem */}
          <div className="inline-flex w-14 h-14 bg-gradient-to-br from-violet-900/40 to-cyan-950/40 border border-violet-500/20 rounded-2xl items-center justify-center p-3.5 shadow-[0_0_25px_rgba(32,201,151,0.15)] mb-4 select-none animate-float">
            <svg
              className="w-full h-full drop-shadow-[0_0_8px_rgba(139,92,246,0.35)]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="login-logo-top-left" x1="8" y1="3" x2="12" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#D946EF" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="login-logo-top-right" x1="16" y1="3" x2="12" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#20C997" />
                  <stop offset="100%" stopColor="#0AA37A" />
                </linearGradient>
                <linearGradient id="login-logo-mid-center" x1="8" y1="3" x2="16" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="login-logo-bottom-left" x1="3" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="login-logo-bottom-right" x1="21" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
              </defs>
              
              <polygon points="8,3 16,3 12,9" fill="url(#login-logo-mid-center)" opacity="0.95" />
              <polygon points="8,3 3,9 12,9" fill="url(#login-logo-top-left)" opacity="0.9" />
              <polygon points="16,3 21,9 12,9" fill="url(#login-logo-top-right)" opacity="0.9" />
              <polygon points="3,9 12,21 12,9" fill="url(#login-logo-bottom-left)" opacity="0.85" />
              <polygon points="21,9 12,21 12,9" fill="url(#login-logo-bottom-right)" opacity="0.85" />
              
              {/* Edge highlights */}
              <polyline points="8,3 12,9 16,3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="9" x2="12" y2="21" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              <polyline points="3,9 12,9 21,9" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              <polygon points="8,3 16,3 21,9 12,21 3,9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-neutral-100">
            Junpon <span className="font-serif italic text-violet-400 font-normal">AI</span>
          </h2>
          <p className="text-[11px] font-sans text-neutral-400 mt-1.5 max-w-[280px] mx-auto leading-relaxed">
            AI that understands you.
          </p>
        </motion.div>

        {/* Dynamic Glassmorphic Authentication Card */}
        <div className="bg-neutral-950/80 border border-neutral-900 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {/* Security overlay */}
          <AnimatePresence>
            {isAuthenticating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/98 z-50 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <span className="absolute inset-0 rounded-full border-2 border-t-transparent border-violet-500 animate-spin"></span>
                  <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase mb-2">
                  SECURE EXCHANGE GATEWAY
                </h4>
                <p className="text-xs text-violet-400 font-mono animate-pulse min-h-[1.5rem] tracking-wide">
                  {authStep}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Form Navigation Tabs */}
          <div className="flex bg-neutral-900/40 p-1 rounded-xl mb-6 border border-neutral-900">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError('');
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-violet-950/40 text-violet-300 border border-violet-500/20 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-violet-950/40 text-violet-300 border border-violet-500/20 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Authentication Forms */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Full Name (Sign Up only) */}
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5 font-bold">
                    Your Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-violet-400/60">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      placeholder="Your Name"
                      className="w-full bg-neutral-950 border border-neutral-900 rounded-xl py-2.5 pl-10 pr-4 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div>
              <label className="block text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5 font-bold">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-violet-400/60">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-950 border border-neutral-900 rounded-xl py-2.5 pl-10 pr-4 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Password (for Sign In & Sign Up only) */}
            {activeTab !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 hover:text-cyan-300 font-bold transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-violet-400/60">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-xl py-2.5 pl-10 pr-10 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error messaging bar */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-tight text-[11px]">{error}</span>
              </motion.div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-b-4 border-violet-850 active:translate-y-[2px] active:border-b-2 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(139,92,246,0.2)] select-none mt-2"
            >
              <span>
                {activeTab === 'signin' ? 'Sign In Securely' : activeTab === 'signup' ? 'Create Premium Account' : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Back to Login option (Forgot Password only) */}
          {activeTab === 'forgot' && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setError('');
                }}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-all underline decoration-neutral-700 underline-offset-4"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Quick OAuth options */}
          {activeTab !== 'forgot' && (
            <>
              {/* Divider */}
              <div className="flex items-center my-6 text-neutral-700 text-[8px] uppercase font-mono tracking-[0.2em] select-none">
                <div className="flex-1 h-px bg-neutral-900"></div>
                <span className="px-3">or continue with</span>
                <div className="flex-1 h-px bg-neutral-900"></div>
              </div>

              {/* Grid with Google & Apple */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('Google')}
                  className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-neutral-200 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center select-none shadow-sm"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('Apple')}
                  className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-neutral-200 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center select-none shadow-sm"
                >
                  <AppleIcon />
                  <span>Apple</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Brand Footer & CEO Citation */}
      <div className="text-center mt-4 shrink-0 relative z-10 select-none">
        <p className="text-[9px] text-neutral-600 font-sans tracking-wide leading-relaxed">
          Designed & Engineered by <span className="text-violet-400/80 font-medium">Junpon Systems Group</span>
        </p>
        <p className="text-[8px] text-neutral-500 font-mono tracking-widest uppercase mt-0.5">
          Founder & CEO: <span className="text-violet-400 font-bold">Arjun Paul Arpon</span>
        </p>
      </div>
    </div>
  );
}
