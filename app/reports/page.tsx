'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db, FinancialSummary } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    savingsRate: 0,
    categorySpending: {},
    transactionCount: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; Income: number; Expenses: number; Savings: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const [txs, trend] = await Promise.all([
          db.transactions.list(),
          db.transactions.getMonthlyTrend(),
        ]);
        const s = db.computeSummary(txs);
        setSummary(s);
        setTransactions(txs);
        setTrendData(trend.map((t) => ({ ...t, Savings: Math.max(0, t.Income - t.Expenses) })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const expensesOnly = useMemo(() => transactions.filter((t) => t.transaction_type === 'expense'), [transactions]);

  const sortedCategories = useMemo(() => {
    return Object.entries(summary.categorySpending).sort((a, b) => b[1] - a[1]);
  }, [summary.categorySpending]);

  const topCategory = sortedCategories[0] || ['—', 0];
  const topCategoryPct = summary.totalExpenses > 0 ? Math.round((Number(topCategory[1]) / summary.totalExpenses) * 100) : 0;

  const largestExpense = useMemo(() => {
    if (expensesOnly.length === 0) return null;
    return expensesOnly.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max), expensesOnly[0]);
  }, [expensesOnly]);

  const avgExpense = expensesOnly.length > 0 ? Math.round(summary.totalExpenses / expensesOnly.length) : 0;

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
            <div>
              <h1 className="font-serif text-3xl font-normal text-[#1D2923] tracking-tight">
                Financial Reports
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Analytical trends, monthly cash flow comparison and category distribution
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#777E77] shadow-subtle">
              <Calendar className="w-3.5 h-3.5 text-[#244C3B]" strokeWidth={1.75} />
              <span>All Logged Periods</span>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Inflow</span>
              <p className="text-2xl font-mono font-medium text-[#39845B] mt-2 tabular-nums">
                +{formatINR(summary.totalIncome)}
              </p>
              <span className="text-[11px] text-[#777E77] mt-1 block">Cumulative credits</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Outflow</span>
              <p className="text-2xl font-mono font-medium text-[#DB896B] mt-2 tabular-nums">
                -{formatINR(summary.totalExpenses)}
              </p>
              <span className="text-[11px] text-[#777E77] mt-1 block">
                {expensesOnly.length} recorded debits
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Net Savings Rate</span>
              <p className="text-2xl font-mono font-medium text-[#244C3B] mt-2 tabular-nums">
                {summary.savingsRate}%
              </p>
              <span className="text-[11px] text-[#777E77] mt-1 block">
                {formatINR(Math.max(0, summary.totalIncome - summary.totalExpenses))} retained
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Average Expense</span>
              <p className="text-2xl font-mono font-medium text-[#1D2923] mt-2 tabular-nums">
                {formatINR(avgExpense)}
              </p>
              <span className="text-[11px] text-[#777E77] mt-1 block">Per recorded transaction</span>
            </div>
          </div>

          {/* Cash Flow History Chart */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Monthly Cash Flow Trends
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  Historical comparison of income, expenses, and retained savings
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[#777E77]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#39845B]" />
                  Income
                </span>
                <span className="flex items-center gap-1.5 text-[#777E77]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#DB896B]" />
                  Expense
                </span>
                <span className="flex items-center gap-1.5 text-[#777E77]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#244C3B]" />
                  Savings
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {mounted && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barGap={4}>
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
                      }}
                      formatter={(val: any) => [formatINR(Number(val)), '']}
                    />
                    <Bar dataKey="Income" fill="#39845B" radius={[3, 3, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Expenses" fill="#DB896B" radius={[3, 3, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Savings" fill="#244C3B" radius={[3, 3, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mb-2" />
                  <p className="text-xs text-[#777E77]">No historical cash flow records available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Two Columns: Category Breakdown & Financial Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Table */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-4">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Category Breakdown
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  Proportion of total expenditure by category
                </p>
              </div>

              {sortedCategories.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {sortedCategories.map(([cat, amount]) => {
                    const pct = summary.totalExpenses > 0 ? Math.round((amount / summary.totalExpenses) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#1D2923]">{cat}</span>
                          <span className="font-mono text-[#777E77] tabular-nums">
                            {formatINR(amount)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F0F1E9] overflow-hidden">
                          <div
                            className="h-full bg-[#466B56] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#777E77]">
                  No expense records to analyze.
                </div>
              )}
            </div>

            {/* Financial Highlights */}
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Analytical Summary
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  Key observations from your transaction records
                </p>

                <div className="mt-4 space-y-3">
                  <div className="p-3.5 bg-[#F0F1E9] rounded-lg border border-[#E6E5DC]">
                    <span className="text-[11px] text-[#777E77] block">Primary Expense Category</span>
                    <span className="text-sm font-medium text-[#1D2923] mt-0.5 block">
                      {topCategory[0]} ({topCategoryPct}% of total outgoings)
                    </span>
                  </div>

                  {largestExpense && (
                    <div className="p-3.5 bg-[#F0F1E9] rounded-lg border border-[#E6E5DC]">
                      <span className="text-[11px] text-[#777E77] block">Largest Individual Expense</span>
                      <span className="text-sm font-medium text-[#1D2923] mt-0.5 block">
                        {largestExpense.description} — <span className="font-mono">{formatINR(largestExpense.amount)}</span>
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 bg-[#F0F1E9] rounded-lg border border-[#E6E5DC]">
                    <span className="text-[11px] text-[#777E77] block">Cash Reserve Status</span>
                    <span className="text-sm font-medium text-[#1D2923] mt-0.5 block">
                      {summary.currentBalance >= 0
                        ? `Net positive balance of ${formatINR(summary.currentBalance)}`
                        : `Deficit of ${formatINR(Math.abs(summary.currentBalance))}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6E5DC] text-[11px] text-[#777E77]">
                Calculated strictly from your database ledger entries.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
