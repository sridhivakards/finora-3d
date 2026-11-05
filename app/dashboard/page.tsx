'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import AddTransactionModal from '@/components/AddTransactionModal';
import { db, FinancialSummary } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Transaction, Budget, FinancialGoal } from '@/lib/types';
import {
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  Wallet,
  TrendingUp,
  Target,
  Sparkles,
  AlertCircle,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#466B56',
  Shopping: '#DB896B',
  Transport: '#A6B6A1',
  Bills: '#D6A45E',
  Health: '#244C3B',
  Entertainment: '#8F9E8B',
  Education: '#39845B',
  Salary: '#39845B',
  Investment: '#5D7C68',
  Other: '#B8C2B3',
};

const DEFAULT_COLOR = '#A6B6A1';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetsList, setBudgetsList] = useState<Budget[]>([]);
  const [goalsList, setGoalsList] = useState<FinancialGoal[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    savingsRate: 0,
    categorySpending: {},
    transactionCount: 0,
  });
  const [cashflowTrend, setCashflowTrend] = useState<{ month: string; Income: number; Expenses: number }[]>([]);
  const [nextMonthPrediction, setNextMonthPrediction] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [txs, trend, bList, gList] = await Promise.all([
        db.transactions.list(),
        db.transactions.getMonthlyTrend(),
        db.budgets.list(),
        db.goals.list(),
      ]);

      const sum = db.computeSummary(txs);
      setTransactions(txs);
      setSummary(sum);
      setCashflowTrend(trend);
      setBudgetsList(bList);
      setGoalsList(gList);

      // Fetch ML prediction if expense data exists
      const expenses = trend.map((t) => t.Expenses).filter((v) => v > 0);
      if (expenses.length > 0) {
        try {
          const res = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expenses }),
          });
          if (res.ok) {
            const data = await res.json();
            if (typeof data.predicted_next_month === 'number') {
              setNextMonthPrediction(data.predicted_next_month);
            }
          }
        } catch {
          // ML server optional
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadAllData();

    const handleTxChanged = () => loadAllData();
    window.addEventListener('finora:transaction-changed', handleTxChanged);
    return () => window.removeEventListener('finora:transaction-changed', handleTxChanged);
  }, []);

  // Filtered transactions for quick search
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions.slice(0, 7);
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
    ).slice(0, 7);
  }, [transactions, searchQuery]);

  // Donut chart data from real category spending
  const categoryData = useMemo(() => {
    const entries = Object.entries(summary.categorySpending).filter(([, val]) => val > 0);
    const total = entries.reduce((s, [, val]) => s + val, 0);
    return entries
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: CATEGORY_COLORS[name] || DEFAULT_COLOR,
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary.categorySpending]);

  // Historical percentage comparison (only if at least 2 months exist)
  const expenseDiff = useMemo(() => {
    if (cashflowTrend.length < 2) return null;
    const current = cashflowTrend[cashflowTrend.length - 1].Expenses;
    const prev = cashflowTrend[cashflowTrend.length - 2].Expenses;
    if (prev === 0) return null;
    const pct = Math.round(((current - prev) / prev) * 100);
    return pct;
  }, [cashflowTrend]);

  const incomeDiff = useMemo(() => {
    if (cashflowTrend.length < 2) return null;
    const current = cashflowTrend[cashflowTrend.length - 1].Income;
    const prev = cashflowTrend[cashflowTrend.length - 2].Income;
    if (prev === 0) return null;
    const pct = Math.round(((current - prev) / prev) * 100);
    return pct;
  }, [cashflowTrend]);

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Top Bar: Search, Notification, Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777E77]" strokeWidth={1.75} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all shadow-subtle"
              />
            </div>

            {/* Quick Actions & Notifications */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Add Record</span>
              </button>
              <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E6E5DC] flex items-center justify-center text-[#777E77] hover:text-[#1D2923] transition-colors cursor-pointer shadow-subtle">
                <Bell className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Page Introduction */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1D2923] tracking-tight">
              Your money. Clearly understood.
            </h1>
            <p className="text-sm text-[#777E77] mt-1.5 font-sans">
              Track, plan and grow your finances with Finora.
            </p>
          </div>

          {/* 4 Financial Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Balance */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <div className="flex items-center justify-between text-xs text-[#777E77]">
                <span>Total Balance</span>
                <span className="w-2 h-2 rounded-full bg-[#39845B]" />
              </div>
              <p className="text-2xl font-mono font-medium text-[#1D2923] mt-3 tabular-nums tracking-tight">
                {formatINR(summary.currentBalance)}
              </p>
              <div className="mt-2 text-[11px] text-[#777E77] flex items-center gap-1">
                <span>Net liquidity across records</span>
              </div>
            </div>

            {/* 2. Monthly Income */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <div className="flex items-center justify-between text-xs text-[#777E77]">
                <span>Monthly Income</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#39845B]" strokeWidth={1.75} />
              </div>
              <p className="text-2xl font-mono font-medium text-[#39845B] mt-3 tabular-nums tracking-tight">
                {formatINR(summary.totalIncome)}
              </p>
              <div className="mt-2 text-[11px] text-[#777E77] flex items-center gap-1">
                {incomeDiff !== null ? (
                  <span className={incomeDiff >= 0 ? 'text-[#39845B]' : 'text-[#DB896B]'}>
                    {incomeDiff >= 0 ? `+${incomeDiff}%` : `${incomeDiff}%`} vs previous month
                  </span>
                ) : (
                  <span>Based on recorded income</span>
                )}
              </div>
            </div>

            {/* 3. Monthly Expenses */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <div className="flex items-center justify-between text-xs text-[#777E77]">
                <span>Monthly Expenses</span>
                <ArrowDownRight className="w-3.5 h-3.5 text-[#DB896B]" strokeWidth={1.75} />
              </div>
              <p className="text-2xl font-mono font-medium text-[#1D2923] mt-3 tabular-nums tracking-tight">
                {formatINR(summary.totalExpenses)}
              </p>
              <div className="mt-2 text-[11px] text-[#777E77] flex items-center gap-1">
                {expenseDiff !== null ? (
                  <span className={expenseDiff <= 0 ? 'text-[#39845B]' : 'text-[#DB896B]'}>
                    {expenseDiff > 0 ? `+${expenseDiff}%` : `${expenseDiff}%`} vs previous month
                  </span>
                ) : (
                  <span>Total outgoing capital</span>
                )}
              </div>
            </div>

            {/* 4. Savings */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <div className="flex items-center justify-between text-xs text-[#777E77]">
                <span>Savings</span>
                <span className="text-[11px] font-mono text-[#466B56] font-medium">
                  {summary.savingsRate}% rate
                </span>
              </div>
              <p className="text-2xl font-mono font-medium text-[#244C3B] mt-3 tabular-nums tracking-tight">
                {formatINR(Math.max(0, summary.totalIncome - summary.totalExpenses))}
              </p>
              <div className="mt-2 text-[11px] text-[#777E77]">
                {summary.totalIncome > 0
                  ? `${summary.savingsRate}% of recorded income retained`
                  : 'Add income to compute rate'}
              </div>
            </div>
          </div>

          {/* Chart Section: 3-column / asymmetric layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Spending Overview (5 cols) */}
            <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                    Spending Overview
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-[#777E77]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#39845B]" />
                      Income
                    </span>
                    <span className="flex items-center gap-1 text-[#777E77]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#DB896B]" />
                      Expense
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#777E77] mt-1">
                  Monthly cash flow comparison
                </p>
              </div>

              <div className="h-64 w-full mt-4">
                {mounted && cashflowTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashflowTrend} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6E5DC" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#777E77"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#E6E5DC' }}
                      />
                      <YAxis
                        stroke="#777E77"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E6E5DC',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#1D2923',
                          boxShadow: '0 4px 6px -1px rgba(29, 41, 35, 0.05)',
                        }}
                        formatter={(val: any) => [formatINR(Number(val)), '']}
                      />
                      <Bar dataKey="Income" fill="#39845B" radius={[3, 3, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="Expenses" fill="#DB896B" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mb-2" />
                    <p className="text-xs text-[#777E77]">No cash flow trend data available yet.</p>
                    <p className="text-[11px] text-[#9A9F98] mt-0.5">Records will generate this visualization automatically.</p>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Spending Categories (4 cols) */}
            <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle min-h-[380px] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Spending Categories
                </h3>
                <p className="text-xs text-[#777E77] mt-1">
                  Distribution of expenses by category
                </p>
              </div>

              <div className="h-52 w-full my-2">
                {mounted && categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E6E5DC',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#1D2923',
                        }}
                        formatter={(val: any) => [formatINR(Number(val)), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mb-2" />
                    <p className="text-xs text-[#777E77]">No expense categories recorded.</p>
                  </div>
                )}
              </div>

              {/* Minimal Legend */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6E5DC]/80">
                {categoryData.slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#1D2923]">{item.name}</span>
                    </div>
                    <span className="font-mono text-[#777E77] tabular-nums">
                      {formatINR(item.value)} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Finora Insight (3 cols) */}
            <div className="lg:col-span-3 bg-[#F0F1E9] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#244C3B] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#244C3B]" strokeWidth={1.75} />
                  <span>Finora Insight</span>
                </div>
                <h3 className="font-serif text-xl font-normal text-[#1D2923] mt-3">
                  {summary.savingsRate >= 30
                    ? 'Healthy Capital Retention'
                    : summary.savingsRate > 0
                    ? 'Balanced Spending'
                    : 'Action Required'}
                </h3>
                <p className="text-xs text-[#777E77] mt-2 leading-relaxed">
                  {summary.totalIncome === 0
                    ? 'Start by recording your primary income stream to unlock comprehensive budgeting insights and machine-learning forecasting.'
                    : summary.savingsRate >= 30
                    ? `You are currently saving ${summary.savingsRate}% of your total recorded income. Consider directing this surplus into your target goals.`
                    : 'Your expenses currently exceed or approach your total income. Review discretionary categories to protect your emergency buffer.'}
                </p>
              </div>

              {/* Machine learning forecast badge if available */}
              {nextMonthPrediction !== null && nextMonthPrediction > 0 && (
                <div className="p-3 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg mt-4">
                  <span className="text-[10px] text-[#777E77] uppercase tracking-wider block">
                    ML Projected Expense (Next Month)
                  </span>
                  <span className="text-base font-mono font-medium text-[#244C3B] mt-0.5 block tabular-nums">
                    {formatINR(nextMonthPrediction)}
                  </span>
                </div>
              )}

              <Link
                href="/ai"
                className="mt-4 flex items-center justify-between text-xs font-medium text-[#244C3B] hover:text-[#1D3D30] pt-3 border-t border-[#E6E5DC]"
              >
                <span>Consult Finora AI</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-subtle overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#E6E5DC]">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Recent Transactions
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  Latest activity across your accounts
                </p>
              </div>
              <Link
                href="/transaction"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#244C3B] hover:text-[#1D3D30] transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </Link>
            </div>

            {/* Table */}
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F6F0]/60 border-b border-[#E6E5DC] text-[#777E77]">
                      <th className="py-3 px-6 font-medium">Date</th>
                      <th className="py-3 px-6 font-medium">Description</th>
                      <th className="py-3 px-6 font-medium">Category</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E5DC]">
                    {filteredTransactions.map((tx) => {
                      const isIncome = tx.transaction_type === 'income';
                      return (
                        <tr key={tx.id} className="hover:bg-[#F0F1E9]/40 transition-colors">
                          <td className="py-3.5 px-6 font-mono text-[#777E77] whitespace-nowrap">
                            {formatDate(tx.transaction_date)}
                          </td>
                          <td className="py-3.5 px-6 font-medium text-[#1D2923]">
                            {tx.description}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-[#F0F1E9] text-[#1D2923] text-[11px]">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                isIncome
                                  ? 'bg-[#E5EBDD] text-[#39845B]'
                                  : 'bg-[#DB896B]/10 text-[#DB896B]'
                              }`}
                            >
                              {isIncome ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-6 text-right font-mono font-medium tabular-nums ${
                              isIncome ? 'text-[#39845B]' : 'text-[#1D2923]'
                            }`}
                          >
                            {isIncome ? '+' : '-'} {formatINR(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mx-auto mb-2" />
                <p className="text-xs text-[#777E77]">No transactions recorded yet.</p>
                <p className="text-[11px] text-[#9A9F98] mt-1">
                  Click &ldquo;Add Record&rdquo; to input your first financial entry.
                </p>
              </div>
            )}
          </div>

          {/* Two Columns: Budget Overview & Financial Goals Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budgets Preview */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E5DC]">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                    Budget Overview
                  </h3>
                  <p className="text-xs text-[#777E77] mt-0.5">
                    Monthly spending limits by category
                  </p>
                </div>
                <Link
                  href="/budgets"
                  className="text-xs font-medium text-[#244C3B] hover:text-[#1D3D30] inline-flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {budgetsList.length > 0 ? (
                  budgetsList.slice(0, 4).map((b) => {
                    const spent = summary.categorySpending[b.category] || 0;
                    const pct = Math.min(100, Math.round((spent / Number(b.amount)) * 100));
                    const isOver = spent > Number(b.amount);

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#1D2923]">{b.category}</span>
                          <span className="font-mono text-[#777E77] tabular-nums">
                            {formatINR(spent)} / {formatINR(b.amount)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F0F1E9] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver ? 'bg-[#DB896B]' : 'bg-[#244C3B]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-[#777E77]">No active budgets defined.</p>
                    <Link
                      href="/budgets"
                      className="text-xs text-[#244C3B] font-medium underline mt-1 inline-block"
                    >
                      Set up your monthly budgets
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Goals Preview */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E5DC]">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                    Financial Goals
                  </h3>
                  <p className="text-xs text-[#777E77] mt-0.5">
                    Target milestones and savings progress
                  </p>
                </div>
                <Link
                  href="/goals"
                  className="text-xs font-medium text-[#244C3B] hover:text-[#1D3D30] inline-flex items-center gap-1"
                >
                  <span>View goals</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {goalsList.length > 0 ? (
                  goalsList.slice(0, 4).map((g) => {
                    const current = Number(g.current_amount);
                    const target = Number(g.target_amount);
                    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

                    return (
                      <div key={g.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#1D2923]">{g.name}</span>
                          <span className="font-mono text-[#777E77] tabular-nums">
                            {formatINR(current)} / {formatINR(target)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F0F1E9] overflow-hidden">
                          <div
                            className="h-full bg-[#466B56] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-[#777E77]">No financial goals established yet.</p>
                    <Link
                      href="/goals"
                      className="text-xs text-[#244C3B] font-medium underline mt-1 inline-block"
                    >
                      Create your first savings goal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          loadAllData();
        }}
      />
    </div>
  );
}
