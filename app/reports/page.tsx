'use client';

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { FinoraStore } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Cell
} from 'recharts';

export default function ReportsPage() {
  const [summary, setSummary] = useState({
    totalIncome: 90000,
    totalExpenses: 18400,
    currentBalance: 71600,
    savingsRate: 79.6,
    categorySpending: {} as Record<string, number>,
    transactionCount: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [histogramMode, setHistogramMode] = useState<'cashflow' | 'bins'>('cashflow');

  useEffect(() => {
    const s = FinoraStore.getFinancialSummary();
    const t = FinoraStore.getTransactions();
    setSummary(s);
    setTransactions(t);
  }, []);

  // Multi-month trend mock based on historical data
  const trendData = [
    { month: 'Apr', Income: 85000, Expenses: 14200, Savings: 70800 },
    { month: 'May', Income: 85000, Expenses: 15800, Savings: 69200 },
    { month: 'Jun', Income: 90000, Expenses: 16400, Savings: 73600 },
    { month: 'Jul', Income: 90000, Expenses: 17900, Savings: 72100 },
    { month: 'Aug', Income: 90000, Expenses: 17200, Savings: 72800 },
    { month: 'Sep', Income: summary.totalIncome, Expenses: summary.totalExpenses, Savings: summary.currentBalance },
  ];

  // Frequency Binned Histogram Distribution
  const expenseBins = [
    { range: '< ₹500', label: 'Micro Purchases', count: 8, total: 1950, color: '#38bdf8' },
    { range: '₹500 - ₹1.5k', label: 'Daily Essentials', count: 6, total: 4850, color: '#06b6d4' },
    { range: '₹1.5k - ₹5k', label: 'Bills & Lifestyle', count: 4, total: 6000, color: '#8b5cf6' },
    { range: '> ₹5k', label: 'Major Spikes (Zara)', count: 1, total: 5600, color: '#f43f5e' },
  ];

  // Highest spending category
  const sortedCategories = Object.entries(summary.categorySpending).sort((a, b) => b[1] - a[1]);
  const highestCat = sortedCategories[0] || ['Food', 6200];
  const highestCatPct = summary.totalExpenses > 0 ? Math.round((highestCat[1] / summary.totalExpenses) * 100) : 0;

  // Largest transaction
  const expensesOnly = transactions.filter((t) => t.transaction_type === 'expense');
  const largestTx = expensesOnly.reduce((max, t) => (t.amount > max.amount ? t : max), expensesOnly[0] || { amount: 5600, description: 'Zara Weekend Shopping Spree' });
  const avgExpense = expensesOnly.length > 0 ? Math.round(summary.totalExpenses / expensesOnly.length) : 0;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ANALYTICS
              </span>
              <span className="text-xs text-slate-400">• Financial Intelligence Reports</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Financial Reports & Trends
            </h1>
            <p className="text-xs text-slate-400">
              Granular analytics, category velocity, and historical cash flow trends
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cycle: September 2026</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 space-y-6">
          {/* Top Monthly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-lg">
              <span className="text-xs text-slate-400 font-medium">Total Income</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatINR(summary.totalIncome)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Primary salary credits</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-lg">
              <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {formatINR(summary.totalExpenses)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">10 logged transactions</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-lg">
              <span className="text-xs text-slate-400 font-medium">Net Savings</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                {formatINR(summary.currentBalance)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Retained liquid capital</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-lg">
              <span className="text-xs text-slate-400 font-medium">Savings Rate</span>
              <div className="text-2xl font-black text-indigo-300 mt-1">
                {summary.savingsRate}%
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                Surpasses 20% benchmark
              </p>
            </div>
          </div>

          {/* Human Readable Insights Callout (Section 10) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Finora Algorithmic Insight</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                &ldquo;<strong>{highestCat[0]}</strong> accounts for{' '}
                <strong>{highestCatPct}%</strong> of your expenses this month (
                {formatINR(highestCat[1])}). Your largest single expense was{' '}
                <strong>{largestTx.description}</strong> ({formatINR(largestTx.amount)}). Average
                ticket size per transaction is {formatINR(avgExpense)}.&rdquo;
              </p>
            </div>
          </div>

          {/* Cashflow & Expense Distribution Histogram */}
          <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Financial Distribution Histogram</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clear, easy-to-read vertical frequency distribution of your money
                </p>
              </div>

              {/* Histogram Mode Toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setHistogramMode('cashflow')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    histogramMode === 'cashflow'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Cashflow
                </button>
                <button
                  onClick={() => setHistogramMode('bins')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    histogramMode === 'bins'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expense Size Bins
                </button>
              </div>
            </div>

            {/* Legend Indicators */}
            {histogramMode === 'cashflow' ? (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  Income (Inflow)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-3 rounded-md bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                  Expenses (Outflow)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-3 rounded-md bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                  Net Savings Retained
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono pt-1">
                {expenseBins.map((bin) => (
                  <span key={bin.range} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: bin.color }} />
                    <span>{bin.label}:</span>
                    <span className="font-bold text-white">{bin.count} txns</span>
                  </span>
                ))}
              </div>
            )}

            {/* Histogram Viewport */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {histogramMode === 'cashflow' ? (
                  <BarChart data={trendData} margin={{ top: 15, right: 25, left: 10, bottom: 5 }} barGap={6}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(6, 182, 212, 0.06)', stroke: 'rgba(56, 189, 248, 0.2)', strokeWidth: 1, rx: 8 }}
                      contentStyle={{
                        backgroundColor: '#090e1f',
                        borderColor: '#38bdf8',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(6, 182, 212, 0.25)',
                      }}
                      itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                      labelStyle={{ color: '#ffffff', fontWeight: 800, marginBottom: '4px' }}
                      formatter={(val: any, name: string) => [
                        <span key={name} className="font-mono text-cyan-300 font-bold">{formatINR(Number(val))}</span>,
                        <span key={`${name}-label`} className="text-slate-300 capitalize">{name}</span>
                      ]}
                    />
                    <Bar
                      dataKey="Income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                      activeBar={{ fill: '#059669', stroke: '#34d399', strokeWidth: 1 }}
                    />
                    <Bar
                      dataKey="Expenses"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                      activeBar={{ fill: '#e11d48', stroke: '#fb7185', strokeWidth: 1 }}
                    />
                    <Bar
                      dataKey="Savings"
                      fill="#06b6d4"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                      activeBar={{ fill: '#0891b2', stroke: '#22d3ee', strokeWidth: 1 }}
                    />
                  </BarChart>
                ) : (
                  <BarChart data={expenseBins} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="range"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => `${val} txns`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(139, 92, 246, 0.08)', stroke: 'rgba(167, 139, 250, 0.2)', strokeWidth: 1, rx: 8 }}
                      contentStyle={{
                        backgroundColor: '#090e1f',
                        borderColor: '#8b5cf6',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(139, 92, 246, 0.25)',
                      }}
                      itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                      labelStyle={{ color: '#ffffff', fontWeight: 800 }}
                      formatter={(val: any, name: string, item: any) => [
                        <span key="val" className="font-mono text-cyan-300 font-bold">
                          {item.payload.count} transactions ({formatINR(item.payload.total)})
                        </span>,
                        'Volume'
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={55}
                      activeBar={{ opacity: 0.85 }}
                    >
                      {expenseBins.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Beginner-Friendly Explainer Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-4 text-slate-300">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Why a Histogram?</strong> Clear vertical blocks let you compare income vs expenses at a glance without reading confusing curve lines.
                </span>
              </div>
              <div className="hidden md:flex items-center gap-3 font-mono text-[11px] shrink-0 text-slate-400">
                <span>Avg Income: <strong className="text-emerald-400">₹88.3k</strong></span>
                <span>Avg Spend: <strong className="text-rose-400">₹16.6k</strong></span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
