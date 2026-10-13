'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroScene from '@/components/3d/HeroScene';
import MoneyUniverseScene from '@/components/3d/MoneyUniverseScene';
import GlitterWarp from '@/components/ui/GlitterWarp';
import BendingMarquee from '@/components/ui/BendingMarquee';
import InteractiveCreditCard from '@/components/ui/InteractiveCreditCard';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  Orbit,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Lock,
  ChevronRight,
  Database,
  BarChart3,
  Bot,
  Layers,
  ArrowDownRight,
  Wallet
} from 'lucide-react';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ml' | 'ai'>('overview');

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* GLOBAL FULL WEBSITE BACKGROUND MOTION (GLITTER WARP) */}
      <GlitterWarp
        isFixed={true}
        speed={0.8}
        particleCount={300}
        warpFactor={1.15}
        colors={['#06b6d4', '#22d3ee', '#6366f1', '#8b5cf6', '#f59e0b', '#38bdf8']}
      />

      <div className="relative z-10">
        <Navbar />

        {/* 1. HERO SECTION WITH 3D DONUT EXPENSE RING */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
          {/* Ambient atmospheric glows */}
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-10">
            {/* Left Text Column (6 cols) */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>&ldquo;A bank statement that talks back.&rdquo;</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                A Smarter Way to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  Understand Your Money.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Finora is an AI-powered financial operating system designed for Indian users. It
                transforms your raw transactions into clear behavioral insights, machine learning
                predictions, and intelligent conversational guidance.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Start Tracking Your Money</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#universe-demo"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#0c1222]/80 hover:bg-[#131d36] border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <Orbit className="w-4 h-4 text-cyan-400" />
                  <span>Explore 3D Donut Chart</span>
                </a>
              </div>

              {/* Metric Social Proof */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">₹1,03,000</div>
                  <div className="text-[11px] text-slate-400">Indian (INR) Native</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">3 ML Models</div>
                  <div className="text-[11px] text-slate-400">Expense Forecasting</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-violet-400 font-mono">100% RLS</div>
                  <div className="text-[11px] text-slate-400">PostgreSQL Privacy</div>
                </div>
              </div>
            </div>

            {/* Right 3D Viewport Column (6 cols) */}
            <div className="lg:col-span-6 h-[460px] sm:h-[560px] w-full relative">
              <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-800/80 bg-gradient-radial from-slate-900/60 via-[#060913]/95 to-[#04060c] shadow-2xl relative">
                {isClient ? (
                  <HeroScene />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-400 font-mono text-xs">
                    INITIALIZING 3D ENGINE...
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      {/* MOTIVATIONAL WEALTH PHILOSOPHY BENDING MARQUEE */}
      <BendingMarquee />

      {/* 2. THE PROBLEM SECTION (Section 22) */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            The Fundamental Gap in Modern Finance
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Most finance apps only show numbers.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              Finora explains the numbers.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            A traditional banking statement gives you a lifeless summary: &ldquo;Expenses: ₹18,400&rdquo;. But it never answers why your spending surged, how much you can safely invest, or what you will spend next month.
          </p>
        </div>

        {/* Contrast Cards with React Bits 3D Credit Card Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 items-stretch">
          {/* Traditional Banking Card */}
          <InteractiveCreditCard
            variant="traditional"
            badge="TRADITIONAL BANKING APPS"
            title="Passive Data Display"
            subtitle="Static retrospective numbers with zero predictive context"
            cardNumber="•••• •••• •••• 1840"
            holderName="LEGACY BANK USER"
            expiry="09/24"
            footerNote="Users leave more confused and anxious about where their paycheck disappeared."
          >
            <div className="p-4 rounded-xl bg-black/60 border border-rose-500/20 text-slate-300 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span>• Total Spent:</span>
                <span className="text-white font-bold">₹18,400</span>
              </div>
              <div className="flex justify-between">
                <span>• Closing Balance:</span>
                <span className="text-white font-bold">₹71,600</span>
              </div>
              <div className="text-rose-400/90 pt-1 border-t border-rose-500/20">
                ❌ No predictive forecasting or velocity
              </div>
              <div className="text-rose-400/90">
                ❌ No conversational question-answering
              </div>
              <div className="text-rose-400/90">
                ❌ Lifeless ledger with zero behavioral context
              </div>
            </div>
          </InteractiveCreditCard>

          {/* Finora Financial Intelligence Card */}
          <InteractiveCreditCard
            variant="finora"
            badge="FINORA FINANCIAL INTELLIGENCE"
            title="Proactive Financial OS"
            subtitle="Grounded conversational copilot & machine learning forecaster"
            cardNumber="4291 •••• •••• 9000"
            holderName="DHILIKESH // FINORA TITANIUM"
            expiry="09/30"
            footerNote="Instant clarity, explainable ML models, and actionable wealth recommendations."
          >
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs space-y-2.5 shadow-lg">
              <div className="text-cyan-300 font-semibold flex items-center justify-between">
                <span>&ldquo;Where did I spend the most?&rdquo;</span>
                <span className="text-[10px] font-mono text-cyan-400 font-normal">AI COPILOT</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                → Food accounts for 42% (₹6,200). You had 1 unusual Zara spike of ₹5,600.
              </div>
              <div className="text-amber-300 font-semibold pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>&ldquo;What will I spend next month?&rdquo;</span>
                <span className="text-[10px] font-mono text-amber-400 font-normal">ML ENGINE</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                → Gradient Boosting ML predicts ~₹20,500 based on your 6-month velocity.
              </div>
            </div>
          </InteractiveCreditCard>
        </div>
      </section>

      {/* 3. 3D DONUT EXPENSE RING INTERACTIVE DEMO */}
      <section id="universe-demo" className="py-20 bg-[#080d1e]/50 border-y border-slate-800/80 relative overflow-hidden backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <Orbit className="w-3.5 h-3.5 text-cyan-400" />
              <span>FINORA 3D DONUT EXPENSE RING</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              See Your Spending Moves in 3D Space
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Orbit 360°, pop out category slices, and trace real-time expense ratios in Indian Rupees (₹) through your interactive 3D ring chart.
            </p>
          </div>

          {/* 3D Viewport */}
          <div className="w-full h-[580px] rounded-3xl overflow-hidden border border-slate-800 bg-[#060913]/85 shadow-2xl relative">
            {isClient ? (
              <MoneyUniverseScene />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400 font-mono text-xs">
                INITIALIZING 3D DONUT SPATIAL ENGINE...
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/universe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all shadow-lg"
            >
              <span>Launch Fullscreen 3D Donut Experience</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID (Section 22) */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Complete Product Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed as a True Financial Operating System
          </h2>
          <p className="text-sm text-slate-400">
            Eight deeply integrated intelligence engines built to replace fragmented spreadsheet trackers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '1. Smart Expense Tracking',
              desc: 'Seamless manual & automated ledger with Indian Rupee formatting (₹) and real-time category clustering.',
              icon: Wallet,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10',
            },
            {
              title: '2. Ask Finora AI',
              desc: 'Conversational assistant answering complex financial queries grounded strictly in your real database facts.',
              icon: Bot,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
            },
            {
              title: '3. ML Expense Predictions',
              desc: 'Ensemble comparing Linear Regression, Random Forest, and Gradient Boosting with MAE & RMSE metrics.',
              icon: Brain,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
            {
              title: '4. Unusual Spending Detection',
              desc: 'Unsupervised Isolation Forest algorithm detects spending anomalies without false fraud alarms.',
              icon: ShieldCheck,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10',
            },
            {
              title: '5. Budget Intelligence',
              desc: 'Monthly category budget caps with dynamic spend tracking and On Track / Over Budget indicators.',
              icon: BarChart3,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              title: '6. Financial Reports & Trends',
              desc: '6-Month multi-tier cashflow trajectory, largest transactions, average spend, and velocity trends.',
              icon: TrendingUp,
              color: 'text-sky-400',
              bg: 'bg-sky-500/10',
            },
            {
              title: '7. Milestone Goal Tracking',
              desc: 'Target savings for emergency buffers, gadgets, and trips with visual progress bars and contribution deposits.',
              icon: Layers,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
            },
            {
              title: '8. Bills & Subscriptions',
              desc: 'Countdown timers for upcoming OTT, rent, BESCOM power, and broadband bills with one-click paid markers.',
              icon: Cpu,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-slate-700 hover:scale-[1.02] transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW FINORA WORKS (Section 22) */}
      <section id="how-it-works" className="py-20 bg-[#080d1e]/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Simple 4-Step Intelligence Cycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Money Has a Story. Finora Helps You Read It
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Add Transactions',
                desc: 'Record or sync your income and expenses with automatic Indian currency formatting.',
              },
              {
                step: '02',
                title: 'Behavior Analysis',
                desc: 'Finora evaluates category proportions, recurring liabilities, and budget burn rates.',
              },
              {
                step: '03',
                title: 'AI & ML Reasoning',
                desc: 'Scikit-learn forecasts next month while Isolation Forest inspects spending outliers.',
              },
              {
                step: '04',
                title: 'Take Smarter Actions',
                desc: 'Optimize food spends, fund emergency reserves, and maintain a 78+ Financial Health Score.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 relative group"
              >
                <div className="text-3xl font-black font-mono text-cyan-500/40 group-hover:text-cyan-400 transition-colors mb-3">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONVERSATIONAL AI PREVIEW SECTION (Section 22) */}
      <section id="ai-preview" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0f1938] to-[#0c1222] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold mb-2">
                <Bot className="w-4 h-4" />
                <span>HYBRID AI REASONING LAYER</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Conversational Financial Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Zero fabricated facts. Every answer is grounded in your live PostgreSQL ledger.
              </p>
            </div>

            <Link
              href="/ai"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shrink-0"
            >
              Try Live AI Assistant
            </Link>
          </div>

          {/* Simulated Dialogue */}
          <div className="space-y-4">
            {/* User */}
            <div className="flex gap-3 max-w-lg ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                You
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm rounded-tr-none">
                Where am I spending the most this month? Can I reduce it?
              </div>
            </div>

            {/* Finora AI */}
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-tl-none space-y-2">
                <p>
                  Your highest spending category this month is <strong>Food at ₹6,200</strong>, representing <strong>34%</strong> of your total expenditures. Your next highest is Shopping at ₹5,600.
                </p>
                <p className="text-slate-300 text-xs border-t border-slate-800 pt-2">
                  💡 <strong>Actionable Tip:</strong> Consolidating dinner deliveries via weekly bulk pantry deliveries could easily save ₹1,400, bringing you back below your ₹8,000 food budget cap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION (Section 22 & 46) */}
      <section className="py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            &ldquo;Understand your money before your money controls you.&rdquo;
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            Join Finora today. Turn raw transactions into intelligent predictions, clear insights, and financial peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Finora Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all"
            >
              Sign In to Your Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#04060c] py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              F
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">FINORA</span>
              <p className="text-[10px] text-slate-500">AI-Powered Personal Finance Operating System</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
            <Link href="/transaction" className="hover:text-slate-300">Transactions</Link>
            <Link href="/reports" className="hover:text-slate-300">Reports</Link>
            <Link href="/predictions" className="hover:text-slate-300">ML Predictions</Link>
            <Link href="/ai" className="hover:text-slate-300">Ask Finora AI</Link>
            <Link href="/universe" className="hover:text-slate-300">3D Universe</Link>
            <Link href="/settings" className="hover:text-slate-300">Settings</Link>
          </div>

          <p className="text-[11px] font-mono text-slate-500">
            © 2026 FINORA. All Indian currency metrics formatted in ₹ INR.
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
