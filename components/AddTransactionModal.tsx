'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Tag, FileText, AlertCircle, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { Transaction, TransactionCategory, TransactionType } from '@/lib/types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  transactionToEdit?: Transaction | null;
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

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}: AddTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(transactionToEdit);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg('');
  };

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setType(transactionToEdit.transaction_type);
      setDate(transactionToEdit.transaction_date);
      setErrorMsg('');
    } else {
      resetForm();
    }
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (!description.trim()) {
      setErrorMsg('Please enter a description.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && transactionToEdit) {
        await db.transactions.update(transactionToEdit.id, {
          description: description.trim(),
          amount: numAmount,
          category,
          transaction_type: type,
          transaction_date: date,
        });
      } else {
        await db.transactions.add({
          description: description.trim(),
          amount: numAmount,
          category,
          transaction_type: type,
          transaction_date: date,
        });
      }

      handleClose();
      if (onSuccess) onSuccess();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('finora:transaction-changed'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2923]/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E6E5DC] rounded-2xl shadow-dropdown overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E5DC]">
          <div>
            <h3 className="font-serif text-xl font-normal text-[#1D2923]">
              {isEditing ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-[#777E77] mt-0.5">
              {isEditing
                ? 'Update the details for this transaction record.'
                : 'Add a new expense or income entry to your ledger.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#9A9F98] hover:text-[#1D2923] hover:bg-[#F0F1E9] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-[#C76B63]/10 border border-[#C76B63]/30 text-[#C76B63] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle: Expense vs Income */}
          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F1E9] rounded-lg border border-[#E6E5DC]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all ${
                  type === 'expense'
                    ? 'bg-[#FFFFFF] text-[#DB896B] font-semibold shadow-subtle border border-[#E6E5DC]'
                    : 'text-[#777E77] hover:text-[#1D2923]'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all ${
                  type === 'income'
                    ? 'bg-[#FFFFFF] text-[#39845B] font-semibold shadow-subtle border border-[#E6E5DC]'
                    : 'text-[#777E77] hover:text-[#1D2923]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#777E77]">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-sm font-mono text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Grocery shopping at Nature's Basket"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
              />
            </div>
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full pl-10 pr-8 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E6E5DC]/80">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-[#F0F1E9] hover:bg-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{isEditing ? 'Save Changes' : 'Add Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
