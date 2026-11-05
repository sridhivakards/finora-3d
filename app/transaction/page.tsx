'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import AddTransactionModal from '@/components/AddTransactionModal';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Transaction, TransactionCategory, TransactionType } from '@/lib/types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  AlertCircle,
  Inbox,
  Filter
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
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError('');
      const txs = await db.transactions.list();
      setTransactions(txs);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleTxChanged = () => loadData();
    window.addEventListener('finora:transaction-changed', handleTxChanged);
    return () => window.removeEventListener('finora:transaction-changed', handleTxChanged);
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (selectedType !== 'all') {
      result = result.filter((t) => t.transaction_type === selectedType);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

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

  const summaryStats = useMemo(() => {
    const totalInflow = transactions
      .filter((t) => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalOutflow = transactions
      .filter((t) => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      inflow: totalInflow,
      outflow: totalOutflow,
      count: transactions.length,
      net: totalInflow - totalOutflow,
    };
  }, [transactions]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await db.transactions.delete(id);
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete transaction.');
    } finally {
      setDeleting(null);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Description', 'Amount (INR)', 'Category', 'Type', 'Date'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.category,
      t.transaction_type,
      t.transaction_date,
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
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
            <div>
              <h1 className="font-serif text-3xl font-normal text-[#1D2923] tracking-tight">
                Transactions
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Comprehensive record of your incoming and outgoing capital
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                disabled={filteredTransactions.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#F0F1E9] border border-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors shadow-subtle disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-[#777E77]" strokeWidth={1.75} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => {
                  setEditingTx(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Add Record</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Inflow</span>
              <span className="text-lg font-mono font-medium text-[#39845B] mt-1 block tabular-nums">
                +{formatINR(summaryStats.inflow)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Total Outflow</span>
              <span className="text-lg font-mono font-medium text-[#DB896B] mt-1 block tabular-nums">
                -{formatINR(summaryStats.outflow)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Net Difference</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {formatINR(summaryStats.net)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Recorded Entries</span>
              <span className="text-lg font-mono font-medium text-[#244C3B] mt-1 block tabular-nums">
                {summaryStats.count} records
              </span>
            </div>
          </div>

          {/* Controls Bar: Search & Filters */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777E77]" strokeWidth={1.75} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by description or category..."
                  className="w-full pl-9 pr-4 py-2 bg-[#F7F6F0]/60 border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] placeholder:text-[#9A9F98] focus:bg-[#FFFFFF] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#F0F1E9] border border-[#E6E5DC] rounded-lg text-xs">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                      selectedType === t
                        ? 'bg-[#FFFFFF] text-[#244C3B] shadow-subtle border border-[#E6E5DC]'
                        : 'text-[#777E77] hover:text-[#1D2923]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              <div className="w-full md:w-44">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="w-full md:w-40">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-subtle overflow-hidden">
            {error && (
              <div className="p-4 bg-[#C76B63]/10 border-b border-[#C76B63]/30 text-[#C76B63] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F6F0]/70 border-b border-[#E6E5DC] text-[#777E77]">
                      <th className="py-3 px-6 font-medium">Date</th>
                      <th className="py-3 px-6 font-medium">Description</th>
                      <th className="py-3 px-6 font-medium">Category</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium text-right">Amount</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
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
                          <td className="py-3.5 px-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTx(tx);
                                  setModalOpen(true);
                                }}
                                title="Edit"
                                className="p-1 rounded-md text-[#777E77] hover:text-[#1D2923] hover:bg-[#F0F1E9] transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(tx.id)}
                                title="Delete"
                                className="p-1 rounded-md text-[#777E77] hover:text-[#C76B63] hover:bg-[#F0F1E9] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                              </button>
                            </div>
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
                <p className="text-xs text-[#777E77]">No transactions match your search or filter.</p>
                <button
                  onClick={() => {
                    setEditingTx(null);
                    setModalOpen(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Add First Entry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 max-w-sm w-full shadow-dropdown space-y-4">
            <h3 className="font-serif text-lg font-normal text-[#1D2923]">
              Confirm Deletion
            </h3>
            <p className="text-xs text-[#777E77]">
              Are you sure you want to remove this transaction record? This operation cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 bg-[#F0F1E9] hover:bg-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={Boolean(deleting)}
                className="px-4 py-2 bg-[#C76B63] hover:bg-[#B35850] text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditingTx(null);
          loadData();
        }}
        transactionToEdit={editingTx}
      />
    </div>
  );
}
