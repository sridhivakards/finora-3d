'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { Bill } from '@/lib/types';
import {
  ReceiptText,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  X,
  Trash2,
  Inbox
} from 'lucide-react';

const CATEGORIES = [
  'Utilities',
  'Housing & Rent',
  'Subscriptions',
  'Insurance',
  'Telecom & Internet',
  'Loans & EMI',
  'Other',
];

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setErrorMsg('');
      const data = await db.bills.list();
      setBills(data);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string, currentStatus: Bill['status']) => {
    try {
      await db.bills.toggleStatus(id, currentStatus);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to update bill status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.bills.delete(id);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete bill.');
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!title.trim()) {
      setErrorMsg('Please specify a bill title.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Please enter a due date.');
      return;
    }

    setSubmitting(true);
    try {
      await db.bills.add({
        title: title.trim(),
        amount: amt,
        due_date: dueDate,
        category,
        recurring_frequency: frequency,
        status: 'Upcoming',
      });
      setTitle('');
      setAmount('');
      setDueDate('');
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to add bill.');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const upcoming = bills.filter((b) => b.status === 'Upcoming');
    const upcomingSum = upcoming.reduce((s, b) => s + Number(b.amount), 0);
    const paidSum = bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + Number(b.amount), 0);
    return {
      upcomingCount: upcoming.length,
      upcomingSum,
      paidSum,
      totalCount: bills.length,
    };
  }, [bills]);

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
            <div>
              <h1 className="font-serif text-3xl font-normal text-[#1D2923] tracking-tight">
                Bills & Subscriptions
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Upcoming recurring liabilities, due dates and payment tracking
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
              <span>Add Bill</span>
            </button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Upcoming Obligations</span>
              <span className="text-lg font-mono font-medium text-[#DB896B] mt-1 block tabular-nums">
                {formatINR(stats.upcomingSum)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Pending Payments</span>
              <span className="text-lg font-mono font-medium text-[#1D2923] mt-1 block tabular-nums">
                {stats.upcomingCount} bills
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Paid this Cycle</span>
              <span className="text-lg font-mono font-medium text-[#39845B] mt-1 block tabular-nums">
                {formatINR(stats.paidSum)}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-4 shadow-subtle">
              <span className="text-xs text-[#777E77] block">Active Subscriptions</span>
              <span className="text-lg font-mono font-medium text-[#244C3B] mt-1 block tabular-nums">
                {stats.totalCount} registered
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#C76B63]/10 border border-[#C76B63]/30 rounded-xl text-[#C76B63] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bills Ledger Table */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-subtle overflow-hidden">
            <div className="p-6 border-b border-[#E6E5DC]">
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Scheduled Liabilities
              </h3>
              <p className="text-xs text-[#777E77] mt-0.5">
                Mark items as paid when settled to maintain payment status
              </p>
            </div>

            {bills.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F6F0]/70 border-b border-[#E6E5DC] text-[#777E77]">
                      <th className="py-3 px-6 font-medium">Bill Title</th>
                      <th className="py-3 px-6 font-medium">Category</th>
                      <th className="py-3 px-6 font-medium">Due Date</th>
                      <th className="py-3 px-6 font-medium">Frequency</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium text-right">Amount</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E5DC]">
                    {bills.map((bill) => {
                      const isPaid = bill.status === 'Paid';
                      return (
                        <tr key={bill.id} className="hover:bg-[#F0F1E9]/40 transition-colors">
                          <td className="py-3.5 px-6 font-medium text-[#1D2923]">
                            {bill.title}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F0F1E9] text-[#1D2923] text-[11px]">
                              {bill.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-mono text-[#777E77] tabular-nums whitespace-nowrap">
                            {formatDate(bill.due_date)}
                          </td>
                          <td className="py-3.5 px-6 text-[#777E77]">
                            {bill.recurring_frequency}
                          </td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                isPaid
                                  ? 'bg-[#E5EBDD] text-[#39845B]'
                                  : 'bg-[#DB896B]/10 text-[#DB896B]'
                              }`}
                            >
                              {isPaid ? 'Paid' : 'Upcoming'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-medium text-[#1D2923] tabular-nums">
                            {formatINR(bill.amount)}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleToggle(bill.id, bill.status)}
                                className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                                  isPaid
                                    ? 'bg-[#F0F1E9] text-[#777E77] hover:text-[#1D2923]'
                                    : 'bg-[#244C3B] text-white hover:bg-[#1D3D30]'
                                }`}
                              >
                                {isPaid ? 'Mark Due' : 'Mark Paid'}
                              </button>
                              <button
                                onClick={() => handleDelete(bill.id)}
                                title="Delete"
                                className="p-1 rounded-md text-[#9A9F98] hover:text-[#C76B63] hover:bg-[#F0F1E9] transition-colors"
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
                <p className="text-xs text-[#777E77]">No recurring bills scheduled.</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Add First Bill</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl shadow-dropdown overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E5DC]">
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Schedule Recurring Bill
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[#9A9F98] hover:text-[#1D2923] hover:bg-[#F0F1E9]"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Bill Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. JioFiber Broadband"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1179"
                    required
                    className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
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
                  disabled={submitting}
                  className="px-5 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Save Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
