'use client';

import React, { useState } from 'react';
import { X, PlusCircle, ArrowDownRight, ArrowUpRight, Calendar, Tag, FileText, Check } from 'lucide-react';
import { FinoraStore } from '@/lib/storage';
import { TransactionCategory, TransactionType } from '@/lib/types';
import confetti from 'canvas-confetti';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);

    try {
      FinoraStore.addTransaction({
        description: description.trim(),
        amount: numAmount,
        category,
        transaction_type: type,
        transaction_date: date,
      });

      if (type === 'income') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#06b6d4', '#6366f1'],
        });
      }

      // Reset form
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Food');

      if (onSuccess) onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1222] border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Transaction</h2>
              <p className="text-xs text-slate-400">Record a new income or expenditure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'Salary') setCategory('Food');
              }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
              }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount (₹) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-lg font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Swiggy Gourmet, Uber to Office, Tech Salary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
