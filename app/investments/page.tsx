'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DonutChart3D, { ExpenseCategory } from '@/components/3d/DonutChart3D';
import { FinoraStore } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import { Investment } from '@/lib/types';
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  X,
  PieChart as PieIcon,
  DollarSign
} from 'lucide-react';
import Preloader from '@/components/ui/Preloader';

const INV_COLORS: Record<string, string> = {
  'Mutual Funds': '#06b6d4',     // Cyber Cyan
  Stocks: '#8b5cf6',             // Electric Violet
  Gold: '#f59e0b',               // Imperial Amber
  'Fixed Deposits': '#10b981',    // Emerald Green
  Crypto: '#ec4899',             // Rose
  Other: '#38bdf8',              // Sky Blue
};

export default function InvestmentsPage() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Investment['category']>('Mutual Funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setInvestments(FinoraStore.getInvestments());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('finora-data-updated', loadData);
    return () => window.removeEventListener('finora-data-updated', loadData);
  }, []);

  const totalInvested = investments.reduce((s, i) => s + i.invested_amount, 0);
  const totalValue = investments.reduce((s, i) => s + i.current_value, 0);
  const totalGain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0';

  const pieData = Object.entries(
    investments.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + i.current_value;
      return acc;
    }, {} as Record<string, number>)
  ).map(([cat, val]) => ({ name: cat, value: val, color: INV_COLORS[cat] || '#8b5cf6' }));

  // 360° 3D Donut Chart Investment Asset Allocation Data
  const investment3DData: ExpenseCategory[] = useMemo(() => {
    const glowMap: Record<string, string> = {
      'Mutual Funds': '#22d3ee',
      Stocks: '#c084fc',
      Gold: '#fbbf24',
      'Fixed Deposits': '#34d399',
      Crypto: '#f472b6',
      Other: '#7dd3fc',
    };

    return pieData.map((item) => {
      const glowColor = glowMap[item.name] || '#c084fc';
      const count = investments.filter((i) => i.category === item.name).length;
      return {
        id: item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        amount: Number(item.value),
        color: item.color,
        glowColor,
        transactionsCount: count,
      };
    });
  }, [pieData, investments]);

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = parseFloat(investedAmount);
    const cur = parseFloat(currentValue);
    if (!name.trim() || isNaN(inv) || isNaN(cur)) return;

    const list = FinoraStore.getInvestments();
    const newInv: Investment = {
      id: 'inv-' + Date.now(),
      name: name.trim(),
      category,
      invested_amount: inv,
      current_value: cur,
      notes: notes.trim() || undefined,
    };

    FinoraStore.saveInvestments([...list, newInv]);
    setName('');
    setInvestedAmount('');
    setCurrentValue('');
    setNotes('');
    setModalOpen(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex relative">
      {/* React Bits Style Preloader */}
      {showPreloader && (
        <Preloader
          initialText="Loading your experience..."
          subTexts={[
            'Synthesizing portfolio asset classes...',
            'Decrypting live unrealized returns...',
            'Calculating net asset valuation...',
            'Your wealth terminal is ready.',
          ]}
          onComplete={() => setShowPreloader(false)}
        />
      )}

      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/30">
                PORTFOLIO
              </span>
              <span className="text-xs text-slate-400">• Assets & Wealth Tracking</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Investment Tracker
            </h1>
            <p className="text-xs text-slate-400">
              Manual portfolio tracking across Mutual Funds, Stocks, SGB Gold, and Fixed Deposits
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset Holding</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 space-y-8">
          {/* Portfolio Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Total Invested</span>
              <div className="text-2xl font-black text-white mt-1">
                {formatINR(totalInvested)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Book value</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Current Portfolio Value</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                {formatINR(totalValue)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Live market valuation</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Unrealized Gain</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                +{formatINR(totalGain)}
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                +{gainPct}% Cumulative Return
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Asset Allocation</span>
              <div className="text-2xl font-black text-violet-300 mt-1">
                {investments.length} Instruments
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across 4 diverse asset classes</p>
            </div>
          </div>

          {/* Allocation Breakdown and Holdings List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 360° 3D Donut Chart: Asset Class Allocation */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white">Asset Class Allocation</h3>
                  </div>
                  <p className="text-xs text-slate-400">360° 3D distribution by current valuation</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
                  {investment3DData.length} Classes
                </span>
              </div>

              <div className="h-80 w-full relative flex items-center justify-center my-1 rounded-xl overflow-hidden bg-[#070b18]/60 border border-slate-800/60">
                {investment3DData.length === 0 ? (
                  <p className="text-xs text-slate-500">No investment holdings to show</p>
                ) : (
                  <DonutChart3D
                    data={investment3DData}
                    height="100%"
                    showControls={false}
                    centerTitle="PORTFOLIO"
                    centerSubtitle="HOLDINGS ALLOCATION"
                    bottomTag="360° 3D PORTFOLIO // DRAG TO ROTATE // CLICK ASSET TO POP OUT"
                    sidePopupPosition="right"
                    cameraDistance={8.3}
                    countUnit="holdings"
                  />
                )}
              </div>

              {/* Legend Pills with Percentages & Glowing Dots */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
                {investment3DData.map((item) => {
                  const pct = totalValue > 0 ? ((item.amount / totalValue) * 100).toFixed(1) : '0';
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
                      <span className="text-[10px] text-violet-400 font-mono">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Holdings Table */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c1222] border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">Asset Holdings</h3>
              <p className="text-xs text-slate-400 mb-4">Detailed records of tracked assets</p>

              <div className="divide-y divide-slate-800">
                {investments.map((inv) => {
                  const gain = inv.current_value - inv.invested_amount;
                  const pct = ((gain / inv.invested_amount) * 100).toFixed(1);

                  return (
                    <div
                      key={inv.id}
                      className="py-3.5 flex items-center justify-between hover:bg-slate-900/40 px-2 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{inv.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            {inv.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Invested: {formatINR(inv.invested_amount)}
                          {inv.notes && ` • ${inv.notes}`}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-cyan-300">
                          {formatINR(inv.current_value)}
                        </div>
                        <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                          +{formatINR(gain)} (+{pct}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Regulatory & Safety Disclaimer (Section 18) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0" />
            <span>
              <strong>Finora Portfolio Disclaimer:</strong> This section is strictly an educational tracking and bookkeeping interface. Finora does not provide stock recommendations, investment advice, or guaranteed returns.
            </span>
          </div>
        </div>
      </main>

      {/* Add Holding Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0c1222] border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Asset Holding</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvestment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTI Nifty 50, TCS Shares, SGB Gold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Fixed Deposits">Fixed Deposits</option>
                  <option value="Gold">Gold</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Invested (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Current Value (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="62000"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SIP ₹10,000"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 mt-2"
              >
                Save Holding
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
