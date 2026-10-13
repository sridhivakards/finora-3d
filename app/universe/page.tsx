'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import MoneyUniverseScene, { UniverseNodeData } from '@/components/3d/MoneyUniverseScene';
import GlitterWarp from '@/components/ui/GlitterWarp';
import { FinoraStore } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import {
  Orbit,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  Maximize2,
  Info
} from 'lucide-react';

export default function UniversePage() {
  const [selectedNode, setSelectedNode] = useState<UniverseNodeData | null>(null);
  const [summary, setSummary] = useState({
    income: 90000,
    expenses: 18400,
    balance: 71600,
    investments: 332300,
    bills: 4849,
    goals: 87000,
  });
  const [score, setScore] = useState(78);
  const [isClient, setIsClient] = useState(false);

  const refreshData = () => {
    const s = FinoraStore.getFinancialSummary();
    const h = FinoraStore.getFinancialHealth();
    const invs = FinoraStore.getInvestments();
    const bls = FinoraStore.getBills();
    const gls = FinoraStore.getGoals();

    const totalInv = invs.reduce((sum, i) => sum + i.current_value, 0);
    const totalBills = bls.reduce((sum, b) => sum + b.amount, 0);
    const totalGoals = gls.reduce((sum, g) => sum + g.current_amount, 0);

    setSummary({
      income: s.totalIncome || 90000,
      expenses: s.totalExpenses || 18400,
      balance: s.currentBalance || 71600,
      investments: totalInv > 0 ? totalInv : 332300,
      bills: totalBills > 0 ? totalBills : 4849,
      goals: totalGoals > 0 ? totalGoals : 87000,
    });
    setScore(h.score || 78);
  };

  useEffect(() => {
    setIsClient(true);
    refreshData();
    window.addEventListener('finora-data-updated', refreshData);
    return () => window.removeEventListener('finora-data-updated', refreshData);
  }, []);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col relative">
        {/* Header HUD */}
        <header className="px-6 lg:px-10 py-5 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex items-center justify-between z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                3D WEBGL ENGINE
              </span>
              <span className="text-xs text-slate-400">• Real-Time Money Cosmos</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5 flex items-center gap-2">
              <span>Your Money Universe</span>
              <Orbit className="w-5 h-5 text-violet-400 animate-spin-slow" />
            </h1>
            <p className="text-xs text-slate-400">
              Interactive spatial model of your income, expenses, savings, bills, and investments
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs text-slate-400">Cosmos Engine:</span>
              <span className="text-xs font-bold font-mono text-cyan-300">Live 3D</span>
            </div>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        {/* 3D Canvas Viewport */}
        <div className="flex-1 relative w-full h-[calc(100vh-80px)] bg-gradient-radial from-[#0c1222] via-[#060913] to-[#04060c] overflow-hidden">
          <GlitterWarp
            colors={['#06b6d4', '#22d3ee', '#6366f1', '#8b5cf6', '#f59e0b', '#38bdf8']}
            speed={0.8}
            particleCount={200}
            warpFactor={1.1}
          >
            {isClient ? (
              <MoneyUniverseScene
                score={score}
                summaryData={summary}
                onNodeClick={(node) => setSelectedNode(node)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400 font-mono text-xs">
                INITIALIZING 3D DONUT SPATIAL ENGINE...
              </div>
            )}
          </GlitterWarp>

          {/* Quick HUD Metrics Strip at Bottom */}
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none hidden md:block">
            <div className="max-w-4xl mx-auto grid grid-cols-6 gap-2 pointer-events-auto">
              {[
                { label: 'Income', val: summary.income, color: 'text-emerald-400', border: 'border-emerald-500/30' },
                { label: 'Expenses', val: summary.expenses, color: 'text-rose-400', border: 'border-rose-500/30' },
                { label: 'Savings', val: summary.balance, color: 'text-cyan-400', border: 'border-cyan-500/30' },
                { label: 'Investments', val: summary.investments, color: 'text-violet-400', border: 'border-violet-500/30' },
                { label: 'Bills', val: summary.bills, color: 'text-amber-400', border: 'border-amber-500/30' },
                { label: 'Goals', val: summary.goals, color: 'text-indigo-400', border: 'border-indigo-500/30' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border ${item.border} text-center`}
                >
                  <div className="text-[10px] text-slate-400 font-medium">{item.label}</div>
                  <div className={`text-xs font-bold font-mono mt-0.5 ${item.color}`}>
                    {formatINR(item.val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
