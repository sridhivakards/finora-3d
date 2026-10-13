'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import AddTransactionModal from '@/components/AddTransactionModal';
import { FinoraStore } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { Transaction, TransactionCategory, TransactionType } from '@/lib/types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Education',
  'Salary',
  'Investment',
  'Other',
];

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    setTransactions(FinoraStore.getTransactions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('finora-data-updated', loadData);
    return () => window.removeEventListener('finora-data-updated', loadData);
  }, []);

  // Filtered & sorted transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query (Section 38)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((t) => t.transaction_type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sorting (Section 38: Newest, Oldest, Highest, Lowest)
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      } else if (sortBy === 'highest') {
        return b.amount - a.amount;
      } else if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchQuery, selectedType, selectedCategory, sortBy]);

  const handleDelete = (id: string) => {
    FinoraStore.deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Description', 'Amount (INR)', 'Category', 'Type', 'Date', 'Unusual'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.category,
      t.transaction_type,
      t.transaction_date,
      t.is_unusual ? 'YES' : 'NO',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Finora_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                LEDGER
              </span>
              <span className="text-xs text-slate-400">• Financial Transactions</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Transactions
            </h1>
            <p className="text-xs text-slate-400">
              Manage, search, filter, and inspect all cash flows with anomaly flags
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </button>
          </div>
        </header>

        {/* Filter Controls Bar */}
        <div className="p-6 lg:p-10 space-y-6">
          <div className="p-4 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search description or category (e.g. Swiggy, Food, Uber)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category dropdown */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting dropdown */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="highest">Sort: Highest Amount</option>
                  <option value="lowest">Sort: Lowest Amount</option>
                </select>
              </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium mr-2">Type:</span>
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setSelectedType('income')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income ({transactions.filter((t) => t.transaction_type === 'income').length})
              </button>
              <button
                onClick={() => setSelectedType('expense')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expenses ({transactions.filter((t) => t.transaction_type === 'expense').length})
              </button>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm">No transactions matched your filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 text-xs text-cyan-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080d1e] border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Transaction</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Amount (INR)</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-900/50 transition-colors group"
                      >
                        {/* Description & Type Icon */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
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
                                <span className="font-semibold text-white text-sm">
                                  {tx.description}
                                </span>
                                {tx.is_unusual && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-semibold text-amber-300">
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    Unusual Spike
                                  </span>
                                )}
                              </div>
                              {tx.anomaly_reason && (
                                <p className="text-[11px] text-amber-400/90 mt-0.5 font-sans">
                                  {tx.anomaly_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 font-medium">
                            {tx.category}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {formatDate(tx.transaction_date)}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-mono font-bold text-sm">
                          <span
                            className={
                              tx.transaction_type === 'income'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            {tx.transaction_type === 'income' ? '+' : '-'}
                            {formatINR(tx.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {deleteConfirmId === tx.id ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-[11px] text-rose-400 font-medium">
                                Confirm?
                              </span>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                className="px-2 py-1 rounded bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-600"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 rounded text-slate-400 hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
