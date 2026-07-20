import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Crown, ShieldCheck } from 'lucide-react';

interface SubscriptionViewProps {
  onBack: () => void;
}

export default function SubscriptionView({ onBack }: SubscriptionViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [purchased, setPurchased] = useState(false);

  const handleCheckout = () => {
    setPurchased(true);
    setTimeout(() => {
      setPurchased(false);
      onBack();
    }, 2800);
  };

  const PLANS = [
    {
      id: 'monthly' as const,
      name: 'Monthly Tier',
      price: '$9.99',
      period: '/ month',
      features: ['Unlimited high-speed chat', '100 high-def image generates', 'All photograph filters unlocked'],
    },
    {
      id: 'yearly' as const,
      name: 'Yearly Premium',
      price: '$79.99',
      period: '/ year',
      badge: 'BEST VALUE',
      features: ['Everything in Monthly', 'Unlimited high-def image generates', 'Priority GPU model speeds (Save 33%)'],
    },
  ];

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
              Upgrade Subscription
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Unlock Premium Power</p>
          </div>
        </div>
      </div>

      {/* Checkout Success Popup Modal Overlay */}
      {purchased && (
        <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl mb-4 animate-bounce">
            👑
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">Upgrade Successful!</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-[220px] leading-relaxed">
            Welcome to Junpon AI Pro! Your premium capabilities are now fully active. Enjoy limits-free generation.
          </p>
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mt-6"></div>
        </div>
      )}

      {/* Main scrolling plans */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="text-center py-4 space-y-1">
          <div className="w-12 h-12 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white mx-auto shadow-md">
            ✦
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white pt-2.5">
            Unlimited AI Power
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px] mx-auto leading-normal">
            Eliminate prompt boundaries, enjoy early feature updates, and upscale designs in seconds.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-3.5">
          {PLANS.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-violet-600 shadow-md'
                    : 'border-slate-100 dark:border-slate-850 hover:border-slate-250'
                }`}
              >
                {p.badge && (
                  <span className="absolute top-3.5 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold text-[8px] uppercase tracking-wider py-0.5 px-2 rounded-full">
                    {p.badge}
                  </span>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150">{p.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {p.price}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{p.period}</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-violet-600 bg-violet-600' : 'border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                  </div>
                </div>

                <ul className="space-y-1.5 border-t border-slate-100 dark:border-slate-850/50 pt-3">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Checkout Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-900 p-4">
        <button
          onClick={handleCheckout}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/10 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <Crown className="w-4 h-4 text-amber-300 fill-current" />
          <span>Checkout Securely</span>
        </button>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Flexible terms. Cancel anywhere with no fees.</span>
        </div>
      </div>
    </div>
  );
}
