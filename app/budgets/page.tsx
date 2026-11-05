'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Budget, TransactionCategory, Transaction } from '@/lib/types';
import {
  Wallet,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Pencil,
  X,
  Check,
  TrendingDown,
  Inbox
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

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categorySpending, setCategorySpending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<TransactionCategory>('Food');
  const [targetAmount, setTargetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const loadData = async () => {
    try {
      setErrorMsg('');
      const [bList, txs] = await Promise.all([
        db.budgets.list(),
        db.transactions.list(),
      ]);
      setBudgets(bList);
      const sum = db.computeSummary(txs);
      setCategorySpending(sum.categorySpending);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to load budget records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (categorySpending[b.category] || 0), 0);
    const overCount = budgets.filter((b) => (categorySpending[b.category] || 0) > Number(b.amount)).length;
    const overallPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    return {
      allocated: totalAllocated,
      spent: totalSpent,
      remaining: Math.max(0, totalAllocated - totalSpent),
      overCount,
      overallPct,
    };
  }, [budgets, categorySpending]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(targetAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please specify a valid budget amount.');
      return;
    }

    setSaving(true);
    try {
      await db.budgets.upsert({
        category: selectedCat,
        amount: amt,
        month: currentMonth,
      });
      setTargetAmount('');
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to save budget limit.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await db.budgets.delete(id);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete budget.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
            <div>
              <h1 className="font-serif text-3xl font-normal text-[#1D2923] tracking-tight">
                Budgets
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Set monthly spending limits by category to control your cash flow
              </p>
            </div>
            <button
              onClick={() => {
                setTargetAmount('');
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Set Budget</span>
            </button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Allocated</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {formatINR(stats.allocated)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Spent this Month</span>
              <span className="text-lg font-mono font-medium text-[#DB896B] mt-1 block tabular-nums">
                {formatINR(stats.spent)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Remaining Margin</span>
              <span className="text-lg font-mono font-medium text-[#39845B] mt-1 block tabular-nums">
                {formatINR(stats.remaining)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Status</span>
              <span className="text-lg font-mono font-medium text-[#244C3B] mt-1 block tabular-nums">
                {stats.overallPct}% utilized
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#C76B63]/10 border border-[#C76B63]/30 rounded-xl text-[#C76B63] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Budgets Grid */}
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((b) => {
                const spent = categorySpending[b.category] || 0;
                const limit = Number(b.amount);
                const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                const isOver = spent > limit;
                const remaining = limit - spent;

                return (
                  <div
                    key={b.id}
                    className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-[#CBD4C7] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg font-normal text-[#1D2923]">
                          {b.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedCat(b.category);
                              setTargetAmount(String(b.amount));
                              setModalOpen(true);
                            }}
                            title="Edit budget"
                            className="p-1 rounded-md text-[#777E77] hover:text-[#1D2923] hover:bg-[#F0F1E9] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(b.id)}
                            title="Delete budget"
                            className="p-1 rounded-md text-[#777E77] hover:text-[#C76B63] hover:bg-[#F0F1E9] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between text-xs font-mono tabular-nums">
                        <span className="text-base font-medium text-[#1D2923]">
                          {formatINR(spent)}
                        </span>
                        <span className="text-[#777E77]">
                          of {formatINR(limit)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[#F0F1E9] overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver
                              ? 'bg-[#DB896B]'
                              : pct >= 80
                              ? 'bg-[#D6A45E]'
                              : 'bg-[#244C3B]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E6E5DC]/80 flex items-center justify-between text-xs">
                      <span className="text-[#777E77]">
                        {isOver ? (
                          <span className="text-[#DB896B] font-medium">
                            {formatINR(Math.abs(remaining))} over limit
                          </span>
                        ) : (
                          <span className="text-[#39845B]">
                            {formatINR(remaining)} remaining
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[#777E77] tabular-nums">
                        {pct}% used
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-12 text-center shadow-subtle">
              <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mx-auto mb-2" />
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">No active budgets defined</h3>
              <p className="text-xs text-[#777E77] mt-1 max-w-sm mx-auto">
                Setting monthly spending limits helps track category expenditures and prevent accidental overspending.
              </p>
              <button
                onClick={() => {
                  setTargetAmount('');
                  setModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Create Your First Budget</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Set / Edit Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E5DC]">
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Set Category Budget
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[#9A9F98] hover:text-[#1D2923] hover:bg-[#F0F1E9]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value as TransactionCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Monthly Limit (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#777E77]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6E5DC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#F0F1E9] hover:bg-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
