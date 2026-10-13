'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/DashboardSidebar';
import { FinoraStore } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { Budget, TransactionCategory, Transaction } from '@/lib/types';
import {
  Target,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  Utensils,
  Car,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Layers,
  ChevronRight,
  Sliders,
  DollarSign,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Education',
  'Other',
];

interface CategoryMeta {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
  bgGlow: string;
  badgeBg: string;
  badgeBorder: string;
}

const CATEGORY_META: Record<TransactionCategory, CategoryMeta> = {
  Food: {
    icon: Utensils,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    bgGlow: 'from-cyan-500/10 via-cyan-950/20 to-transparent',
    badgeBg: 'bg-cyan-500/10 text-cyan-400',
    badgeBorder: 'border-cyan-500/30',
  },
  Shopping: {
    icon: ShoppingBag,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    bgGlow: 'from-purple-500/10 via-purple-950/20 to-transparent',
    badgeBg: 'bg-purple-500/10 text-purple-400',
    badgeBorder: 'border-purple-500/30',
  },
  Transport: {
    icon: Car,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    bgGlow: 'from-sky-500/10 via-sky-950/20 to-transparent',
    badgeBg: 'bg-sky-500/10 text-sky-400',
    badgeBorder: 'border-sky-500/30',
  },
  Bills: {
    icon: Zap,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    bgGlow: 'from-amber-500/10 via-amber-950/20 to-transparent',
    badgeBg: 'bg-amber-500/10 text-amber-400',
    badgeBorder: 'border-amber-500/30',
  },
  Health: {
    icon: HeartPulse,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgGlow: 'from-emerald-500/10 via-emerald-950/20 to-transparent',
    badgeBg: 'bg-emerald-500/10 text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  Entertainment: {
    icon: Film,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    bgGlow: 'from-pink-500/10 via-pink-950/20 to-transparent',
    badgeBg: 'bg-pink-500/10 text-pink-400',
    badgeBorder: 'border-pink-500/30',
  },
  Education: {
    icon: GraduationCap,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    bgGlow: 'from-blue-500/10 via-blue-950/20 to-transparent',
    badgeBg: 'bg-blue-500/10 text-blue-400',
    badgeBorder: 'border-blue-500/30',
  },
  Salary: {
    icon: DollarSign,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgGlow: 'from-emerald-500/10 via-emerald-950/20 to-transparent',
    badgeBg: 'bg-emerald-500/10 text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
  },
  Investment: {
    icon: TrendingUp,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    bgGlow: 'from-purple-500/10 via-purple-950/20 to-transparent',
    badgeBg: 'bg-purple-500/10 text-purple-400',
    badgeBorder: 'border-purple-500/30',
  },
  Other: {
    icon: Layers,
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    bgGlow: 'from-slate-500/10 via-slate-900/20 to-transparent',
    badgeBg: 'bg-slate-500/10 text-slate-400',
    badgeBorder: 'border-slate-500/30',
  },
};

// SVG Circular Progress Arc Gauge
function CircularGauge({
  percentage,
  size = 90,
  strokeWidth = 7,
  color = '#06b6d4',
  trackColor = '#1e293b',
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg] overflow-visible">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-sm font-black font-mono tracking-tight text-white">
          {percentage}%
        </span>
        {label && <span className="text-[9px] text-slate-400 font-medium -mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categorySpending, setCategorySpending] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // React Bits Modal Card State
  const [activeModalBudget, setActiveModalBudget] = useState<Budget | null>(null);
  const [sliderAmount, setSliderAmount] = useState<number>(0);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // New budget modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<TransactionCategory>('Food');
  const [targetAmount, setTargetAmount] = useState('');

  const loadData = () => {
    const b = FinoraStore.getBudgets();
    setBudgets(b);
    const sum = FinoraStore.getFinancialSummary();
    setCategorySpending(sum.categorySpending);
    setTransactions(FinoraStore.getTransactions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('finora-data-updated', loadData);
    return () => window.removeEventListener('finora-data-updated', loadData);
  }, []);

  // When active modal opens, sync slider
  useEffect(() => {
    if (activeModalBudget) {
      setSliderAmount(activeModalBudget.amount);
      setSavedFeedback(false);
    }
  }, [activeModalBudget]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(targetAmount);
    if (isNaN(amt) || amt <= 0) return;

    FinoraStore.addBudget({
      category: selectedCat,
      amount: amt,
      month: '2026-09',
    });

    setTargetAmount('');
    setCreateModalOpen(false);
    loadData();
  };

  const handleUpdateActiveBudget = (newAmt: number) => {
    if (!activeModalBudget) return;
    FinoraStore.addBudget({
      category: activeModalBudget.category,
      amount: newAmt,
      month: activeModalBudget.month || '2026-09',
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
    loadData();
    // Update local modal view
    setActiveModalBudget((prev) => (prev ? { ...prev, amount: newAmt } : null));
  };

  const handleDeleteBudget = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    FinoraStore.deleteBudget(id);
    if (activeModalBudget?.id === id) {
      setActiveModalBudget(null);
    }
    loadData();
  };

  // Calculations
  const totalBudgetCap = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpentAcrossBudgets = budgets.reduce((acc, b) => acc + (categorySpending[b.category] || 0), 0);
  const totalRemaining = totalBudgetCap - totalSpentAcrossBudgets;
  const overallUsedPct = totalBudgetCap > 0 ? Math.round((totalSpentAcrossBudgets / totalBudgetCap) * 100) : 0;

  // Days left in current month (Sept 2026 = 30 days)
  const daysInMonth = 30;
  const currentDay = 28;
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  // Existing categories with budget
  const existingCategories = new Set(budgets.map((b) => b.category));
  const unbudgetedCategories = CATEGORIES.filter((c) => !existingCategories.has(c));

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                REACT BITS MODAL CARDS
              </span>
              <span className="text-xs text-slate-400">• Intelligent Monthly Allocation Caps</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              <span>Monthly Budgets</span>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Interactive telemetry cards: tap any card to adjust limits, monitor runway, and audit transactions.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Budget</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 space-y-8 flex-1">
          {/* Top Macro Telemetry Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629] to-[#0a0f1d] border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="text-xs text-slate-400 font-medium">Total Monthly Budget</div>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {formatINR(totalBudgetCap)}
              </div>
              <div className="text-[11px] text-cyan-400 mt-2 flex items-center gap-1">
                <span>{budgets.length} active category caps</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629] to-[#0a0f1d] border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="text-xs text-slate-400 font-medium">Allocated Spend So Far</div>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {formatINR(totalSpentAcrossBudgets)}
              </div>
              <div className="text-[11px] text-indigo-300 mt-2 flex items-center gap-1">
                <span>{overallUsedPct}% of aggregate cap consumed</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629] to-[#0a0f1d] border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="text-xs text-slate-400 font-medium">Remaining Buffer</div>
              <div className={`text-2xl font-black mt-1 font-mono ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalRemaining >= 0 ? formatINR(totalRemaining) : `-${formatINR(Math.abs(totalRemaining))}`}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <span>{daysRemaining} days left in cycle (Sept)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629] to-[#0a0f1d] border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="text-xs text-slate-400 font-medium">Safe Daily Allowance</div>
              <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
                {formatINR(Math.max(0, Math.round(totalRemaining / daysRemaining)))}
                <span className="text-xs text-slate-400 font-normal"> /day</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pacing within safe limits</span>
              </div>
            </div>
          </div>

          {/* Unbudgeted Categories Quick-Add Banner (if any) */}
          {unbudgetedCategories.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Quick-Add Unbudgeted Categories:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {unbudgetedCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCat(cat);
                      setCreateModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-medium transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modal Cards Grid (@reactbits-starter/modal-cards-tw style) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Category Budget Telemetry ({budgets.length} Monitored)
              </h2>
              <span className="text-[11px] text-slate-500">Tap card to inspect & calibrate</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((b) => {
                const spent = categorySpending[b.category] || 0;
                const remaining = b.amount - spent;
                const isOver = remaining < 0;
                const pct = Math.min(100, Math.round((spent / b.amount) * 100));
                const meta = CATEGORY_META[b.category] || CATEGORY_META.Other;
                const Icon = meta.icon;

                let status: 'Safe' | 'Caution' | 'Exceeded' = 'Safe';
                let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                let gaugeColor = meta.color;

                if (isOver) {
                  status = 'Exceeded';
                  statusBadge = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
                  gaugeColor = '#f43f5e';
                } else if (pct >= 80) {
                  status = 'Caution';
                  statusBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                  gaugeColor = '#f59e0b';
                }

                // Daily runway
                const dailyRunway = Math.max(0, Math.round(remaining / daysRemaining));

                return (
                  <motion.div
                    key={b.id}
                    layoutId={`budget-card-${b.id}`}
                    onClick={() => setActiveModalBudget(b)}
                    whileHover={{ scale: 1.02, translateY: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="group cursor-pointer rounded-2xl bg-[#0c1222]/90 hover:bg-[#0f172e] border border-slate-800/80 hover:border-slate-700/80 p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
                    style={{
                      boxShadow: `0 4px 20px -2px rgba(0, 0, 0, 0.5)`,
                    }}
                  >
                    {/* Top ambient colored line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-70 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(90deg, ${gaugeColor}, transparent)`,
                      }}
                    />

                    {/* Top Header with Icon, Name & Status */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border"
                            style={{
                              backgroundColor: `${meta.color}15`,
                              borderColor: `${meta.color}40`,
                              color: meta.color,
                            }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {b.category}
                            </h3>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span>Cap: {formatINR(b.amount)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}
                          >
                            {status}
                          </span>
                          <button
                            onClick={(e) => handleDeleteBudget(b.id, e)}
                            className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                            title="Remove Category Cap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Circular Gauge + Metric breakdown */}
                      <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-800/60 my-2">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400">Spent This Month</div>
                          <div className="text-lg font-bold text-white font-mono">
                            {formatINR(spent)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {isOver ? (
                              <span className="text-rose-400 font-semibold">
                                +{formatINR(Math.abs(remaining))} over
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">
                                {formatINR(remaining)} remaining
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Circular Gauge */}
                        <div className="shrink-0">
                          <CircularGauge
                            percentage={pct}
                            size={72}
                            strokeWidth={6}
                            color={gaugeColor}
                            label="used"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Velocity + Click Prompt */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Runway: <strong className="text-slate-200">{formatINR(dailyRunway)}/day</strong></span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* REACT BITS EXPANDED MODAL CARD (MODAL-CARDS-TW)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModalBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              layoutId={`budget-card-${activeModalBudget.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-xl bg-gradient-to-b from-[#0c1324] via-[#090e1b] to-[#070b16] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: `0 0 50px -10px rgba(6, 182, 212, 0.25)`,
              }}
            >
              {/* Subtle Ambient Radial Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

              {/* Close Button */}
              <button
                onClick={() => setActiveModalBudget(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {(() => {
                const spent = categorySpending[activeModalBudget.category] || 0;
                const remaining = activeModalBudget.amount - spent;
                const isOver = remaining < 0;
                const pct = Math.min(100, Math.round((spent / activeModalBudget.amount) * 100));
                const meta = CATEGORY_META[activeModalBudget.category] || CATEGORY_META.Other;
                const Icon = meta.icon;
                const dailyRunway = Math.max(0, Math.round(remaining / daysRemaining));

                // Filter transactions in this category
                const catTxs = transactions
                  .filter((t) => t.category === activeModalBudget.category && t.transaction_type === 'expense')
                  .slice(0, 4);

                let gaugeColor = meta.color;
                if (isOver) gaugeColor = '#f43f5e';
                else if (pct >= 80) gaugeColor = '#f59e0b';

                return (
                  <div className="space-y-6 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 pr-10">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
                        style={{
                          backgroundColor: `${meta.color}20`,
                          borderColor: `${meta.color}50`,
                          color: meta.color,
                          boxShadow: `0 0 20px ${meta.color}30`,
                        }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            CATEGORY TELEMETRY
                          </span>
                          <span className="text-xs text-slate-400">September 2026 Cycle</span>
                        </div>
                        <h2 className="text-2xl font-black text-white mt-0.5">
                          {activeModalBudget.category} Budget
                        </h2>
                      </div>
                    </div>

                    {/* Gauge & Metrics Trio */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#080d1a]/80 border border-slate-800">
                      <div className="flex flex-col items-center justify-center py-2 sm:border-r sm:border-slate-800">
                        <CircularGauge
                          percentage={pct}
                          size={96}
                          strokeWidth={8}
                          color={gaugeColor}
                          label="capacity"
                        />
                      </div>

                      <div className="sm:col-span-2 flex flex-col justify-center space-y-2.5 px-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Budget Limit:</span>
                          <span className="font-bold text-white font-mono text-sm">
                            {formatINR(activeModalBudget.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Current Spend:</span>
                          <span className="font-bold text-cyan-300 font-mono text-sm">
                            {formatINR(spent)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                          <span className="text-slate-400">
                            {isOver ? 'Over Limit By:' : 'Remaining Buffer:'}
                          </span>
                          <span
                            className={`font-black font-mono text-sm ${
                              isOver ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isOver ? `+${formatINR(Math.abs(remaining))}` : formatINR(remaining)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Daily Runway ({daysRemaining}d left):</span>
                          <span className="font-semibold text-slate-200 font-mono">
                            {formatINR(dailyRunway)} / day
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Budget Adjustment Slider */}
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Interactive Limit Calibration
                          </span>
                        </div>
                        <span className="text-sm font-black font-mono text-cyan-300">
                          {formatINR(sliderAmount)}
                        </span>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min={1000}
                        max={30000}
                        step={500}
                        value={sliderAmount}
                        onChange={(e) => setSliderAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>₹1,000</span>
                        <span>₹15,000</span>
                        <span>₹30,000</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSliderAmount((prev) => Math.max(1000, prev - 1000))}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                        >
                          -₹1,000
                        </button>
                        <button
                          type="button"
                          onClick={() => setSliderAmount((prev) => prev + 1000)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                        >
                          +₹1,000
                        </button>
                        <button
                          type="button"
                          onClick={() => setSliderAmount((prev) => prev + 5000)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                        >
                          +₹5,000
                        </button>
                        <div className="flex-1" />
                        <button
                          type="button"
                          onClick={() => handleUpdateActiveBudget(sliderAmount)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/30 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{savedFeedback ? 'Saved!' : 'Save Limit'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Category Transaction Feed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          Recent {activeModalBudget.category} Expenses
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {catTxs.length} items recorded
                        </span>
                      </div>

                      {catTxs.length === 0 ? (
                        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                          No expenses recorded in this category yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {catTxs.map((t) => (
                            <div
                              key={t.id}
                              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-white">{t.description}</div>
                                <div className="text-[10px] text-slate-500">
                                  {formatDate(t.transaction_date)}
                                </div>
                              </div>
                              <span className="font-mono font-bold text-rose-400">
                                -{formatINR(t.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CREATE NEW CATEGORY BUDGET MODAL                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0c1222] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Set Category Cap</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Spending Category
                  </label>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Monthly Spending Limit (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={100}
                    placeholder="e.g. 8000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                  >
                    Save Allocation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
