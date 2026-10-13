'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import AddTransactionModal from '@/components/AddTransactionModal';
import DonutChart3D, { ExpenseCategory } from '@/components/3d/DonutChart3D';
import { FinoraStore } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { Transaction, FinancialHealthScore } from '@/lib/types';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Brain,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Orbit,
  ChevronRight,
  Inbox
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#06b6d4',          // Cyber Cyan
  Shopping: '#8b5cf6',      // Electric Violet
  Transport: '#38bdf8',     // Sky Blue
  Bills: '#f59e0b',         // Imperial Amber
  Health: '#10b981',        // Emerald Green
  Entertainment: '#c084fc', // Neon Lavender
  Education: '#0ea5e9',     // Deep Aqua
  Salary: '#34d399',        // Mint Green
  Investment: '#2dd4bf',    // Teal
  Other: '#64748b'          // Slate
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    savingsRate: 0,
    nextMonthPrediction: 0,
    categorySpending: {} as Record<string, number>,
    transactionCount: 0
  });
  const [health, setHealth] = useState<FinancialHealthScore>({
    score: 78,
    rating: 'Good',
    explanation: 'Calculating financial diagnostic...',
    factors: []
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const loadData = () => {
    const txs = FinoraStore.getTransactions();
    const sum = FinoraStore.getFinancialSummary();
    const hlth = FinoraStore.getFinancialHealth();
    setTransactions(txs);
    setSummary(sum);
    setHealth(hlth);
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
    window.addEventListener('finora-data-updated', loadData);
    return () => window.removeEventListener('finora-data-updated', loadData);
  }, []);

  // 360° 3D Donut Chart Category Data
  const expense3DData: ExpenseCategory[] = useMemo(() => {
    const entries = Object.entries(summary.categorySpending).filter(([_, v]) => v > 0);
    if (entries.length === 0) return [];

    const glowMap: Record<string, string> = {
      Food: '#22d3ee',
      Shopping: '#c084fc',
      Transport: '#7dd3fc',
      Bills: '#fbbf24',
      Health: '#34d399',
      Entertainment: '#e879f9',
      Education: '#38bdf8',
      Salary: '#6ee7b7',
      Investment: '#5eead4',
      Other: '#94a3b8',
    };

    return entries.map(([name, value]) => {
      const color = CATEGORY_COLORS[name] || '#06b6d4';
      const glowColor = glowMap[name] || '#22d3ee';
      const count = transactions.filter((t) => t.category === name).length;
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        amount: Number(value),
        color,
        glowColor,
        transactionsCount: count,
      };
    });
  }, [summary.categorySpending, transactions]);

  const [chartMode, setChartMode] = useState<'line' | 'bar'>('line');

  // Income vs Expenses Bar Chart data
  const barData = [
    {
      name: 'Cash Flow',
      Income: summary.totalIncome,
      Expenses: summary.totalExpenses
    }
  ];

  // Income vs Expenses 6-Month Trend Data for Line Chart
  const cashflowTrend = [
    { month: 'Apr', Income: 85000, Expenses: 22000 },
    { month: 'May', Income: 85000, Expenses: 19500 },
    { month: 'Jun', Income: 88000, Expenses: 24000 },
    { month: 'Jul', Income: 88000, Expenses: 21500 },
    { month: 'Aug', Income: 90000, Expenses: 23100 },
    { month: 'Sep', Income: summary.totalIncome, Expenses: summary.totalExpenses },
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          INITIALIZING FINORA SYSTEM...
        </div>
      </div>
    );
  }

  const isEmpty = transactions.length === 0;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                FINORA
              </span>
              <span className="text-xs text-slate-400">• Financial Intelligence</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Financial Dashboard
            </h1>
            <p className="text-xs text-slate-400">Your personal financial overview</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => FinoraStore.resetToDemoData()}
              title="Reset to realistic Indian demo transactions"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
            <Link
              href="/universe"
              className="px-3.5 py-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Orbit className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
              <span>3D Universe</span>
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 lg:p-10 space-y-8 flex-1">
          {isEmpty ? (
            /* Section 32: Empty Dashboard State */
            <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-[#0c1222] border border-slate-800 rounded-2xl p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Your financial picture starts here.
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Add your first transaction to unlock real-time financial insights, AI analysis, and machine learning expense predictions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20"
                >
                  + Add First Transaction
                </button>
                <button
                  onClick={() => FinoraStore.resetToDemoData()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium"
                >
                  Load Sample Indian Finances
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 5 Main Financial Cards (Section 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Income */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-emerald-500/40 transition-all shadow-lg group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Total Income</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {formatINR(summary.totalIncome)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Monthly Inflow</span>
                  </div>
                </div>

                {/* 2. Total Expenses */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-rose-500/40 transition-all shadow-lg group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Total Expenses</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {formatINR(summary.totalExpenses)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Total Outflow</span>
                  </div>
                </div>

                {/* 3. Current Balance */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-cyan-500/40 transition-all shadow-lg group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Current Balance</span>
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-cyan-300">
                    {formatINR(summary.currentBalance)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                    <span>Net Available Liquidity</span>
                  </div>
                </div>

                {/* 4. Savings Rate */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 transition-all shadow-lg group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Savings Rate</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-indigo-300">
                    {summary.savingsRate}%
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <span>Above 20% Goal</span>
                  </div>
                </div>

                {/* 5. Next Month Prediction */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">ML Forecast</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-amber-300">
                    {formatINR(summary.nextMonthPrediction)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gradient Boosting Est.</span>
                  </div>
                </div>
              </div>

              {/* Charts Section: Income vs Expenses & Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Income vs Expenses Chart (7 cols) - Line & Bar with zero white cursor background */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Income vs Expenses</h3>
                      <p className="text-xs text-slate-400">Cashflow trajectory & spending variance</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* View Switcher: Line Trend vs Bar Total */}
                      <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium">
                        <button
                          type="button"
                          onClick={() => setChartMode('line')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            chartMode === 'line'
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Line Trend
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartMode('bar')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            chartMode === 'bar'
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Bar Total
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Income
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Expenses
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartMode === 'line' ? (
                        <AreaChart data={cashflowTrend} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                          <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            cursor={{ stroke: 'rgba(56, 189, 248, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                            contentStyle={{
                              backgroundColor: '#090e1f',
                              borderColor: '#38bdf8',
                              borderRadius: '12px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.25)',
                            }}
                            itemStyle={{ fontWeight: 600 }}
                            labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                            formatter={(value: any, name: any) => [
                              formatINR(Number(value)),
                              name === 'Income' ? 'Monthly Income' : 'Monthly Expenses',
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="Income"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#incomeGrad)"
                            activeDot={{ r: 6, fill: '#34d399', stroke: '#060913', strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Expenses"
                            stroke="#f43f5e"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#expenseGrad)"
                            activeDot={{ r: 6, fill: '#fb7185', stroke: '#060913', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            cursor={{
                              fill: 'rgba(6, 182, 212, 0.04)',
                              stroke: 'rgba(56, 189, 248, 0.2)',
                              strokeWidth: 1,
                              rx: 8,
                            }}
                            contentStyle={{
                              backgroundColor: '#090e1f',
                              borderColor: '#38bdf8',
                              borderRadius: '12px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.25)',
                            }}
                            itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
                            labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                            formatter={(value: any) => [formatINR(Number(value)), '']}
                          />
                          <Bar
                            dataKey="Income"
                            fill="#10b981"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={60}
                            activeBar={{ fill: '#34d399', stroke: '#10b981', strokeWidth: 1 }}
                          />
                          <Bar
                            dataKey="Expenses"
                            fill="#f43f5e"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={60}
                            activeBar={{ fill: '#fb7185', stroke: '#f43f5e', strokeWidth: 1 }}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 360° 3D Donut Chart: Spending by Category (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <h3 className="text-base font-bold text-white">Spending by Category</h3>
                      </div>
                      <p className="text-xs text-slate-400">360° 3D monthly expense allocation</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {expense3DData.length} Categories
                    </span>
                  </div>

                  <div className="h-80 w-full relative flex items-center justify-center my-1 rounded-xl overflow-hidden bg-[#070b18]/60 border border-slate-800/60">
                    {expense3DData.length === 0 ? (
                      <p className="text-xs text-slate-500">No expense categories to show</p>
                    ) : (
                      <DonutChart3D
                        data={expense3DData}
                        height="100%"
                        showControls={false}
                        centerTitle="TOTAL SPEND"
                        centerSubtitle="MONTHLY ALLOCATION"
                        bottomTag="360° 3D DONUT // DRAG TO ROTATE // CLICK SLICE TO POP OUT"
                        sidePopupPosition="right"
                        cameraDistance={8.3}
                        countUnit="txs"
                      />
                    )}
                  </div>

                  {/* Category Legend Pills with Percentages & Glowing Dots */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80">
                    {expense3DData.map((item) => {
                      const totalExp = summary.totalExpenses || 1;
                      const pct = ((item.amount / totalExp) * 100).toFixed(1);
                      return (
                        <div
                          key={item.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-[11px] transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]"
                            style={{ backgroundColor: item.color, color: item.color }}
                          />
                          <span className="text-slate-300 font-medium">{item.name}:</span>
                          <span className="font-bold text-white font-mono">{formatINR(item.amount)}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Financial Health Section (Section 7) */}
              <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-[#0c1222] via-[#0e162e] to-[#0c1222] border border-cyan-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-black text-2xl shadow-lg shadow-cyan-500/10">
                      {health.score}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {health.rating}
                        </span>
                        <span className="text-xs text-slate-400">Deterministic Health Diagnostic</span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">
                        Financial Health Indicator: {health.score} / 100
                      </h3>
                      <p className="text-sm text-cyan-200/90 mt-1 max-w-2xl">
                        &quot;{health.explanation}&quot;
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/ai"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors w-fit"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ask Finora AI to Improve Score</span>
                  </Link>
                </div>

                {/* Factors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {health.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300">{factor.name}</span>
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            factor.impact === 'positive'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : factor.impact === 'warning'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {factor.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{factor.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions List with Outlier Warnings */}
              <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                    <p className="text-xs text-slate-400">Real-time ledger entries</p>
                  </div>
                  <Link
                    href="/transaction"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View All Transactions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {transactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="py-3.5 flex items-center justify-between hover:bg-slate-900/40 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            tx.transaction_type === 'income'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.transaction_type === 'income' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {tx.description}
                            </span>
                            {tx.is_unusual && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-semibold text-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                Unusual
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>{tx.category}</span>
                            <span>•</span>
                            <span>{formatDate(tx.transaction_date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-bold font-mono ${
                            tx.transaction_type === 'income'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {tx.transaction_type === 'income' ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </div>
                        {tx.anomaly_reason && (
                          <div className="text-[10px] text-amber-400/80 max-w-xs truncate">
                            {tx.anomaly_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
