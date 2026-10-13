'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/DashboardSidebar';
import { FinoraStore } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { FinancialGoal } from '@/lib/types';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  Gift,
  Award,
  Zap,
  ArrowRight,
  Flame,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Compass,
  Laptop,
  Plane,
  Home,
  Car,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

const GOAL_CATEGORIES = [
  'Savings',
  'Gadgets',
  'Travel',
  'Investments',
  'Emergency',
  'Real Estate',
  'Vehicle',
  'Other',
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Savings: Coins,
  Gadgets: Laptop,
  Travel: Plane,
  Investments: TrendingUp,
  Emergency: ShieldCheck,
  'Real Estate': Home,
  Vehicle: Car,
  Other: Target,
};

// Milestone Tier Helper
function getGoalTier(pct: number) {
  if (pct >= 100) {
    return {
      title: 'Conquered 🏆',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      gradient: 'from-emerald-500 to-teal-400',
    };
  }
  if (pct >= 75) {
    return {
      title: 'Diamond Ascendant',
      color: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      gradient: 'from-cyan-500 to-blue-500',
    };
  }
  if (pct >= 50) {
    return {
      title: 'Gold Strategist',
      color: '#fbbf24',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      gradient: 'from-amber-400 to-yellow-500',
    };
  }
  if (pct >= 25) {
    return {
      title: 'Silver Vanguard',
      color: '#a78bfa',
      badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      gradient: 'from-purple-500 to-indigo-500',
    };
  }
  return {
    title: 'Bronze Initiate',
    color: '#94a3b8',
    badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
    gradient: 'from-slate-400 to-slate-600',
  };
}

// Circular Radial Progress Meter
function RadialGoalRing({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = '#06b6d4',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg] overflow-visible">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
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
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-black font-mono tracking-tight text-white">
          {percentage}%
        </span>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
          Funded
        </span>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [contribGoal, setContribGoal] = useState<FinancialGoal | null>(null);
  const [contribAmount, setContribAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Savings');

  const loadData = () => {
    setGoals(FinoraStore.getGoals());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('finora-data-updated', loadData);
    return () => window.removeEventListener('finora-data-updated', loadData);
  }, []);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(currentAmount) || 0;
    if (!name.trim() || isNaN(target) || target <= 0) return;

    FinoraStore.addGoal({
      name: name.trim(),
      target_amount: target,
      current_amount: initial,
      target_date: targetDate,
      category,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#8b5cf6', '#10b981'],
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setModalOpen(false);
    loadData();
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoal) return;
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) return;

    FinoraStore.contributeToGoal(contribGoal.id, amt);

    // High energy confetti burst
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#6366f1', '#10b981', '#fbbf24'],
    });

    setContribAmount('');
    setContribGoal(null);
    loadData();
  };

  const handleDeleteGoal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    FinoraStore.deleteGoal(id);
    loadData();
  };

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const remainingTotal = Math.max(0, totalTarget - totalSaved);

  // Calculate monthly savings velocity needed (based on earliest or avg target date)
  // Approximate months remaining to Dec 2026: ~3 months
  const avgMonthsRemaining = 4;
  const monthlySavingsPaceNeeded = Math.round(remainingTotal / avgMonthsRemaining);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                TRENDING FINTECH VAULTS
              </span>
              <span className="text-xs text-slate-400">• Capital Milestones & Wealth Pots</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
              <span>Financial Goals</span>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Track progress toward wealth accumulation, tech milestones, and lifestyle goals.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Milestone</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 space-y-8 flex-1">
          {/* Trending Luxury Fintech Master Vault Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0c1224] via-[#10183b] to-[#0d1329] border border-indigo-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden">
            {/* Ambient Backlight */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    PORTFOLIO WEALTH ENGINE
                  </span>
                  <span className="text-xs text-slate-400">• {goals.length} Active Targets</span>
                </div>

                <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    {formatINR(totalSaved)}{' '}
                    <span className="text-base lg:text-lg font-normal text-slate-400">
                      / {formatINR(totalTarget)} Target
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    You have achieved <strong>{overallPct}%</strong> of your active financial targets.
                    Remaining capital to deposit: <strong className="text-cyan-300 font-mono">{formatINR(remainingTotal)}</strong>.
                  </p>
                </div>

                {/* Micro Metrics Pill Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Runway Pace: <strong className="text-white font-mono">{formatINR(monthlySavingsPaceNeeded)}/mo</strong></span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disciplined Reserve: <strong className="text-emerald-300">Healthy</strong></span>
                  </div>
                </div>
              </div>

              {/* Master Circular Progress Visual */}
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#090f20]/90 border border-indigo-500/30 shadow-xl shrink-0">
                <RadialGoalRing percentage={overallPct} size={110} strokeWidth={9} color="#6366f1" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    Total Milestones
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {overallPct}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {remainingTotal === 0 ? 'All Goals Conquered!' : `${formatINR(remainingTotal)} to go`}
                  </div>
                </div>
              </div>
            </div>

            {/* Stepped Progress Segment Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>0% START</span>
                <span>25% VANGUARD</span>
                <span>50% STRATEGIST</span>
                <span>75% ASCENDANT</span>
                <span>100% CONQUERED</span>
              </div>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Active Vault Milestones ({goals.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Click &quot;Boost Deposit&quot; to inject capital
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((g) => {
                const remaining = Math.max(0, g.target_amount - g.current_amount);
                const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
                const tier = getGoalTier(pct);
                const CategoryIcon = CATEGORY_ICONS[g.category || 'Savings'] || Target;

                // Calculate days remaining
                const targetTimestamp = new Date(g.target_date).getTime();
                const nowTimestamp = new Date().getTime();
                const diffDays = Math.max(1, Math.round((targetTimestamp - nowTimestamp) / (1000 * 60 * 60 * 24)));
                const approxMonths = Math.max(1, Math.round(diffDays / 30));
                const neededPerMonth = Math.round(remaining / approxMonths);

                return (
                  <motion.div
                    key={g.id}
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    className="p-6 rounded-2xl bg-gradient-to-b from-[#0c1324] to-[#090d1a] border border-slate-800/80 hover:border-indigo-500/40 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top colored accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-70 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(90deg, ${tier.color}, transparent)`,
                      }}
                    />

                    <div>
                      {/* Top Bar: Category, Tier & Delete */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-200">
                            <CategoryIcon className="w-4 h-4 text-cyan-400" />
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeBg}`}>
                            {tier.title}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteGoal(g.id, e)}
                          className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Goal Title */}
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        {g.name}
                      </h3>

                      {/* Date & Countdown */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due {formatDate(g.target_date)}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-indigo-400 font-medium">{diffDays} days left</span>
                      </div>

                      {/* Circular Gauge + Financial Metrics */}
                      <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-800/70 my-2">
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-400">Current Capital:</div>
                          <div className="text-xl font-bold font-mono text-emerald-400">
                            {formatINR(g.current_amount)}
                          </div>
                          <div className="text-xs text-slate-400">
                            Target: <span className="font-semibold text-white font-mono">{formatINR(g.target_amount)}</span>
                          </div>
                          <div className="text-[11px] text-indigo-300 font-medium pt-1">
                            {remaining === 0 ? (
                              <span className="text-emerald-400 font-bold">Completed 🎉</span>
                            ) : (
                              <span>{formatINR(remaining)} remaining</span>
                            )}
                          </div>
                        </div>

                        <RadialGoalRing
                          percentage={pct}
                          size={84}
                          strokeWidth={7}
                          color={tier.color}
                        />
                      </div>

                      {/* Required Velocity Metric */}
                      {remaining > 0 && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Savings Pace Needed:</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {formatINR(neededPerMonth)} / month
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Boost Button */}
                    <div className="mt-5 pt-3">
                      <button
                        onClick={() => {
                          setContribGoal(g);
                          setContribAmount('');
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 hover:border-cyan-400 text-xs font-semibold text-indigo-200 hover:text-white flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Boost Deposit to Vault</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* QUICK BOOST DEPOSIT MODAL                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {contribGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#0c1324] via-[#090e1b] to-[#070b16] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Boost Goal Capital</h3>
                </div>
                <button
                  onClick={() => setContribGoal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <div className="text-xs text-slate-400">Contributing to:</div>
                <div className="text-base font-bold text-white">{contribGoal.name}</div>
                <div className="text-xs text-indigo-300 font-mono">
                  Current: {formatINR(contribGoal.current_amount)} / {formatINR(contribGoal.target_amount)}
                </div>
              </div>

              <form onSubmit={handleContribute} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Deposit Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={100}
                    placeholder="e.g. 5000"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Quick chip buttons */}
                <div className="flex items-center gap-2">
                  {[500, 1000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setContribAmount(String(val))}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-[11px] font-semibold text-slate-300 hover:text-cyan-300 border border-slate-700"
                    >
                      +₹{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContribGoal(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                  >
                    Confirm Deposit 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CREATE NEW FINANCIAL GOAL MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0c1222] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Create Financial Milestone</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Milestone Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro M4, Bali Vacation, Emergency Fund"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {GOAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    placeholder="e.g. 100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    Initial Saved Amount (₹ INR - Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="e.g. 15000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Launch Milestone
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
