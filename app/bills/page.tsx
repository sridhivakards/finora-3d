'use client';

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { FinoraStore } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { Bill } from '@/lib/types';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  X,
  Tv,
  Wifi,
  Zap,
  Smartphone
} from 'lucide-react';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  const loadData = () => {
    setBills(FinoraStore.getBills());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('finora-data-updated', loadData);
    return () => window.removeEventListener('finora-data-updated', loadData);
  }, []);

  const handleToggle = (id: string) => {
    FinoraStore.toggleBillStatus(id);
    loadData();
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0 || !dueDate) return;

    const list = FinoraStore.getBills();
    const newBill: Bill = {
      id: 'bl-' + Date.now(),
      title: title.trim(),
      amount: numAmount,
      due_date: dueDate,
      status: 'Upcoming',
      recurring_frequency: frequency,
      category,
    };

    FinoraStore.saveBills([...list, newBill]);
    setTitle('');
    setAmount('');
    setDueDate('');
    setModalOpen(false);
    loadData();
  };

  const getDaysLeft = (dueDateStr: string) => {
    const diff = new Date(dueDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const totalUpcoming = bills
    .filter((b) => b.status === 'Upcoming')
    .reduce((s, b) => s + b.amount, 0);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                RECURRING
              </span>
              <span className="text-xs text-slate-400">• Bills & Subscriptions</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Bills & Subscriptions
            </h1>
            <p className="text-xs text-slate-400">
              Track due dates for rent, broadband, OTT platforms, and mobile plans
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recurring Bill</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Pending Upcoming</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {formatINR(totalUpcoming)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total pending this cycle</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Active Services</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">{bills.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Internet, Netflix, Bescom, Airtel</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Next Due Date</span>
              <div className="text-2xl font-black text-white mt-1">In 3 Days</div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">ACT Fibernet Bill</p>
            </div>
          </div>

          {/* Bills List */}
          <div className="space-y-3">
            {bills.map((bill) => {
              const daysLeft = getDaysLeft(bill.due_date);
              const isPaid = bill.status === 'Paid';

              return (
                <div
                  key={bill.id}
                  className={`p-5 rounded-2xl bg-[#0c1222] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isPaid ? 'border-slate-800/80 opacity-70' : 'border-slate-800 hover:border-amber-500/40 shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : daysLeft <= 3
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{bill.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {bill.recurring_frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>Due: {formatDate(bill.due_date)}</span>
                        <span>•</span>
                        <span
                          className={
                            isPaid
                              ? 'text-emerald-400 font-medium'
                              : daysLeft < 0
                              ? 'text-rose-400 font-bold'
                              : daysLeft <= 3
                              ? 'text-amber-400 font-bold'
                              : 'text-slate-300'
                          }
                        >
                          {isPaid
                            ? 'Settled'
                            : daysLeft < 0
                            ? `Overdue by ${Math.abs(daysLeft)} days`
                            : daysLeft === 0
                            ? 'Due Today'
                            : `Due in ${daysLeft} days`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-white">
                        {formatINR(bill.amount)}
                      </div>
                      <span className="text-[10px] text-slate-400">{bill.category}</span>
                    </div>

                    <button
                      onClick={() => handleToggle(bill.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isPaid ? 'Paid' : 'Mark as Paid'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Add Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0c1222] border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Subscription / Bill</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Service / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium, Rent, ACT Fibernet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  placeholder="999"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-semibold shadow-lg shadow-amber-500/25 mt-2"
              >
                Track Bill
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
