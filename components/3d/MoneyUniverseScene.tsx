'use client';

import React, { useState, useMemo } from 'react';
import DonutChart3D, { ExpenseCategory, DEFAULT_EXPENSE_DATA } from './DonutChart3D';
import { formatINR } from '@/lib/utils';
import { PieChart, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export interface UniverseNodeData {
  id: string;
  name: string;
  amount: number;
  color: string;
  glowColor: string;
  category: string;
  details: string;
  pct: string;
}

interface MoneyUniverseSceneProps {
  score?: number;
  summaryData?: {
    income: number;
    expenses: number;
    balance: number;
    investments: number;
    bills: number;
    goals: number;
  };
  onNodeClick?: (node: UniverseNodeData) => void;
}

export default function MoneyUniverseScene({
  score = 78,
  summaryData,
  onNodeClick,
}: MoneyUniverseSceneProps) {
  const [viewMode, setViewMode] = useState<'expenses' | 'wealth'>('expenses');

  // Convert wealth summary to Donut format if in wealth mode
  const wealthData: ExpenseCategory[] = useMemo(() => {
    if (!summaryData) {
      return [
        { id: 'balance', name: 'Liquid Savings', amount: 71600, color: '#06b6d4', glowColor: '#22d3ee', transactionsCount: 12 },
        { id: 'investments', name: 'Investments', amount: 332300, color: '#8b5cf6', glowColor: '#a78bfa', transactionsCount: 8 },
        { id: 'expenses', name: 'Monthly Spend', amount: 18400, color: '#f43f5e', glowColor: '#fb7185', transactionsCount: 42, anomalyNote: 'Zara spike ₹5,600 flagged' },
        { id: 'goals', name: 'Target Goals', amount: 87000, color: '#38bdf8', glowColor: '#7dd3fc', transactionsCount: 3 },
        { id: 'bills', name: 'Fixed Bills', amount: 4849, color: '#f59e0b', glowColor: '#fbbf24', transactionsCount: 4 },
      ];
    }
    return [
      { id: 'balance', name: 'Liquid Savings', amount: summaryData.balance, color: '#06b6d4', glowColor: '#22d3ee', transactionsCount: 12 },
      { id: 'investments', name: 'Investments', amount: summaryData.investments, color: '#8b5cf6', glowColor: '#a78bfa', transactionsCount: 8 },
      { id: 'expenses', name: 'Monthly Spend', amount: summaryData.expenses, color: '#f43f5e', glowColor: '#fb7185', transactionsCount: 42, anomalyNote: 'Food ₹6,200 (highest spend)' },
      { id: 'goals', name: 'Target Goals', amount: summaryData.goals, color: '#38bdf8', glowColor: '#7dd3fc', transactionsCount: 3 },
      { id: 'bills', name: 'Fixed Bills', amount: summaryData.bills, color: '#f59e0b', glowColor: '#fbbf24', transactionsCount: 4 },
    ];
  }, [summaryData]);

  const activeDataset = viewMode === 'expenses' ? DEFAULT_EXPENSE_DATA : wealthData;

  return (
    <div className="w-full h-full relative">
      {/* Mode Switcher Tabs */}
      <div className="absolute top-16 right-4 sm:right-6 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md">
        <button
          onClick={() => setViewMode('expenses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            viewMode === 'expenses'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Category Expenses</span>
        </button>
        <button
          onClick={() => setViewMode('wealth')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            viewMode === 'wealth'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Total Wealth Ring</span>
        </button>
      </div>

      {/* 3D Donut Chart Component with 360° Drag & Inertia */}
      <DonutChart3D
        data={activeDataset}
        height="100%"
        showControls={true}
      />
    </div>
  );
}
