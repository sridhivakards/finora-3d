'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { FinancialGoal } from '@/lib/types';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  AlertCircle,
  TrendingUp,
  Inbox
} from 'lucide-react';

const GOAL_CATEGORIES = [
  'Savings',
  'Emergency Buffer',
  'Travel',
  'Investments',
  'Real Estate',
  'Vehicle',
  'Education',
  'Other',
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Create Goal Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Savings');
  const [submitting, setSubmitting] = useState(false);

  // Contribute Modal
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const loadData = async () => {
    try {
      setErrorMsg('');
      const list = await db.goals.list();
      setGoals(list);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to load financial goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
    const totalCurrent = goals.reduce((s, g) => s + Number(g.current_amount), 0);
    const completedCount = goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount)).length;
    const overallPct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
    return {
      totalTarget,
      totalCurrent,
      completedCount,
      overallPct,
    };
  }, [goals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const tAmt = parseFloat(targetAmount);
    const cAmt = parseFloat(currentAmount || '0');

    if (!name.trim()) {
      setErrorMsg('Please specify a goal name.');
      return;
    }
    if (isNaN(tAmt) || tAmt <= 0) {
      setErrorMsg('Target amount must be greater than zero.');
      return;
    }
    if (!targetDate) {
      setErrorMsg('Please set a target completion date.');
      return;
    }

    setSubmitting(true);
    try {
      await db.goals.add({
        name: name.trim(),
        target_amount: tAmt,
        current_amount: cAmt >= 0 ? cAmt : 0,
        target_date: targetDate,
        category,
      });
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to create financial goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    const dep = parseFloat(depositAmount);
    if (isNaN(dep) || dep <= 0) return;

    setSubmitting(true);
    try {
      await db.goals.contribute(activeGoal.id, dep);
      setDepositAmount('');
      setContributeModalOpen(false);
      setActiveGoal(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to contribute to goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.goals.delete(id);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete goal.');
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
                Financial Goals
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Target milestones, savings accumulation and projected timeline tracking
              </p>
            </div>
            <button
              onClick={() => {
                setErrorMsg('');
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Create Goal</span>
            </button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Cumulative Saved</span>
              <span className="text-lg font-mono font-medium text-[#244C3B] mt-1 block tabular-nums">
                {formatINR(stats.totalCurrent)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Target Capital</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {formatINR(stats.totalTarget)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Progress Status</span>
              <span className="text-lg font-mono font-medium text-[#39845B] mt-1 block tabular-nums">
                {stats.overallPct}% funded
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Completed Targets</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {stats.completedCount} of {goals.length} goals
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#C76B63]/10 border border-[#C76B63]/30 rounded-xl text-[#C76B63] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Goals Grid */}
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((g) => {
                const current = Number(g.current_amount);
                const target = Number(g.target_amount);
                const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                const isCompleted = current >= target;
                const remaining = Math.max(0, target - current);

                return (
                  <div
                    key={g.id}
                    className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-[#CBD4C7] transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#F0F1E9] text-[#777E77] text-[10px] font-medium uppercase tracking-wider mb-1">
                            {g.category || 'Savings'}
                          </span>
                          <h3 className="font-serif text-lg font-normal text-[#1D2923] leading-snug">
                            {g.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDelete(g.id)}
                          title="Delete goal"
                          className="p-1 rounded-md text-[#9A9F98] hover:text-[#C76B63] hover:bg-[#F0F1E9] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between text-xs font-mono tabular-nums">
                        <span className="text-base font-medium text-[#244C3B]">
                          {formatINR(current)}
                        </span>
                        <span className="text-[#777E77]">
                          target: {formatINR(target)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[#F0F1E9] overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-[#39845B]' : 'bg-[#244C3B]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#E6E5DC]/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#777E77] flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-[#9A9F98]" strokeWidth={1.75} />
                          {formatDate(g.target_date)}
                        </span>
                        <span className="font-mono text-[#244C3B] font-medium tabular-nums">
                          {pct}% funded
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#777E77]">
                          {isCompleted ? 'Target achieved' : `${formatINR(remaining)} remaining`}
                        </span>
                        {!isCompleted && (
                          <button
                            onClick={() => {
                              setActiveGoal(g);
                              setDepositAmount('');
                              setContributeModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#E5EBDD] hover:bg-[#CBD4C7] text-[#244C3B] text-xs font-medium rounded-md transition-colors"
                          >
                            + Add Funds
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-12 text-center shadow-subtle">
              <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mx-auto mb-2" />
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">No financial goals established</h3>
              <p className="text-xs text-[#777E77] mt-1 max-w-sm mx-auto">
                Setting specific financial targets keeps your savings disciplined and gives your surplus capital purpose.
              </p>
              <button
                onClick={() => {
                  setErrorMsg('');
                  setCreateModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Create Your First Goal</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Goal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E5DC]">
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Create Financial Goal
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-md text-[#9A9F98] hover:text-[#1D2923] hover:bg-[#F0F1E9]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 6-Month Emergency Fund"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all cursor-pointer"
                >
                  {GOAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Target Capital (INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="300000"
                    required
                    className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Initial Deposit (INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6E5DC]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#F0F1E9] hover:bg-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Funds Modal */}
      {contributeModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E5DC]">
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Add Funds
              </h3>
              <button
                onClick={() => setContributeModalOpen(false)}
                className="p-1 rounded-md text-[#9A9F98] hover:text-[#1D2923] hover:bg-[#F0F1E9]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleContribute} className="p-6 space-y-4">
              <p className="text-xs text-[#777E77]">
                Contributing capital toward <strong className="text-[#1D2923]">{activeGoal.name}</strong>.
              </p>
              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Deposit Amount (INR)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6E5DC]">
                <button
                  type="button"
                  onClick={() => setContributeModalOpen(false)}
                  className="px-4 py-2 bg-[#F0F1E9] hover:bg-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Depositing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
