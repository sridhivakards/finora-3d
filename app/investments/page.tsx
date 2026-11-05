'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Investment } from '@/lib/types';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const CATEGORIES: Investment['category'][] = [
  'Mutual Funds',
  'Stocks',
  'Fixed Deposits',
  'Gold',
  'Crypto',
  'Other',
];

const ASSET_COLORS: Record<string, string> = {
  'Mutual Funds': '#244C3B',
  Stocks: '#466B56',
  'Fixed Deposits': '#39845B',
  Gold: '#D6A45E',
  Crypto: '#DB896B',
  Other: '#A6B6A1',
};

export default function InvestmentsPage() {
  const [mounted, setMounted] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Investment['category']>('Mutual Funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setErrorMsg('');
      const data = await db.investments.list();
      setInvestments(data);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to load investments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const totalInvested = investments.reduce((s, i) => s + Number(i.invested_amount), 0);
  const totalValue = investments.reduce((s, i) => s + Number(i.current_value), 0);
  const totalGain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0';

  const assetAllocation = useMemo(() => {
    const map: Record<string, number> = {};
    investments.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + Number(i.current_value);
    });
    return Object.entries(map).map(([cat, val]) => ({
      name: cat,
      value: val,
      color: ASSET_COLORS[cat] || '#A6B6A1',
    }));
  }, [investments]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const invAmt = parseFloat(investedAmount);
    const curVal = parseFloat(currentValue);

    if (!name.trim()) {
      setErrorMsg('Please specify an asset name.');
      return;
    }
    if (isNaN(invAmt) || invAmt <= 0 || isNaN(curVal) || curVal < 0) {
      setErrorMsg('Please enter valid invested and current amounts.');
      return;
    }

    setSubmitting(true);
    try {
      await db.investments.add({
        name: name.trim(),
        category,
        invested_amount: invAmt,
        current_value: curVal,
        notes: notes.trim() || undefined,
      });
      setName('');
      setInvestedAmount('');
      setCurrentValue('');
      setNotes('');
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to add investment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.investments.delete(id);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete investment.');
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
                Investments
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Portfolio performance, asset distribution and valuation tracking
              </p>
            </div>
            <button
              onClick={() => {
                setErrorMsg('');
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Add Investment</span>
            </button>
          </div>

          {/* Portfolio Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Invested</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {formatINR(totalInvested)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Current Valuation</span>
              <span className="text-lg font-mono font-medium text-[#244C3B] mt-1 block tabular-nums">
                {formatINR(totalValue)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Unrealized P&L</span>
              <span
                className={`text-lg font-mono font-medium mt-1 block tabular-nums ${
                  totalGain >= 0 ? 'text-[#39845B]' : 'text-[#DB896B]'
                }`}
              >
                {totalGain >= 0 ? '+' : ''}{formatINR(totalGain)} ({gainPct}%)
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Active Holdings</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {investments.length} assets
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#C76B63]/10 border border-[#C76B63]/30 rounded-xl text-[#C76B63] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Allocation & Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Asset Allocation Donut (4 cols) */}
            <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle flex flex-col justify-between min-h-[360px]">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Asset Allocation
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  Portfolio weighting by instrument
                </p>
              </div>

              <div className="h-48 w-full my-2">
                {mounted && assetAllocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocation}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {assetAllocation.map((entry, index) => (
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
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-[#777E77]">No asset allocations recorded.</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E6E5DC]">
                {assetAllocation.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#1D2923]">{item.name}</span>
                    </div>
                    <span className="font-mono text-[#777E77] tabular-nums">
                      {formatINR(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Holdings Table (8 cols) */}
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-subtle overflow-hidden">
              <div className="p-6 border-b border-[#E6E5DC]">
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Holdings Ledger
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  Individual investment positions and performance
                </p>
              </div>

              {investments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F7F6F0]/70 border-b border-[#E6E5DC] text-[#777E77]">
                        <th className="py-3 px-6 font-medium">Asset Name</th>
                        <th className="py-3 px-6 font-medium">Category</th>
                        <th className="py-3 px-6 font-medium text-right">Invested</th>
                        <th className="py-3 px-6 font-medium text-right">Current Value</th>
                        <th className="py-3 px-6 font-medium text-right">P&L</th>
                        <th className="py-3 px-6 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E5DC]">
                      {investments.map((inv) => {
                        const gain = Number(inv.current_value) - Number(inv.invested_amount);
                        const pct = Number(inv.invested_amount) > 0 ? ((gain / Number(inv.invested_amount)) * 100).toFixed(1) : '0';
                        return (
                          <tr key={inv.id} className="hover:bg-[#F0F1E9]/40 transition-colors">
                            <td className="py-3.5 px-6 font-medium text-[#1D2923]">
                              {inv.name}
                              {inv.notes && (
                                <span className="block text-[10px] text-[#9A9F98] mt-0.5 font-normal">
                                  {inv.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F0F1E9] text-[#1D2923] text-[11px]">
                                {inv.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right font-mono tabular-nums text-[#777E77]">
                              {formatINR(inv.invested_amount)}
                            </td>
                            <td className="py-3.5 px-6 text-right font-mono tabular-nums font-medium text-[#1D2923]">
                              {formatINR(inv.current_value)}
                            </td>
                            <td
                              className={`py-3.5 px-6 text-right font-mono tabular-nums font-medium ${
                                gain >= 0 ? 'text-[#39845B]' : 'text-[#DB896B]'
                              }`}
                            >
                              {gain >= 0 ? '+' : ''}{formatINR(gain)} ({pct}%)
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <button
                                onClick={() => handleDelete(inv.id)}
                                title="Delete position"
                                className="p-1 rounded-md text-[#777E77] hover:text-[#C76B63] hover:bg-[#F0F1E9] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Inbox className="w-8 h-8 text-[#9A9F98] stroke-1 mx-auto mb-2" />
                  <p className="text-xs text-[#777E77]">No investment positions recorded yet.</p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Add First Asset</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Investment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E5DC]">
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Add Investment Asset
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[#9A9F98] hover:text-[#1D2923] hover:bg-[#F0F1E9]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Parag Parikh Flexi Cap Fund"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Asset Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Investment['category'])}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Invested (INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    placeholder="50000"
                    required
                    className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Current Value (INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="58000"
                    required
                    className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Monthly SIP started March 2024"
                  className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
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
                  disabled={submitting}
                  className="px-5 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
