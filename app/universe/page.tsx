'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  ReceiptText,
  Target
} from 'lucide-react';

export default function UniversePage() {
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    investments: 0,
    bills: 0,
    goals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [txs, invs, bls, gls] = await Promise.all([
          db.transactions.list(),
          db.investments.list(),
          db.bills.list(),
          db.goals.list(),
        ]);
        const s = db.computeSummary(txs);
        const totalInv = invs.reduce((sum, i) => sum + Number(i.current_value), 0);
        const totalBills = bls.reduce((sum, b) => sum + Number(b.amount), 0);
        const totalGoals = gls.reduce((sum, g) => sum + Number(g.current_amount), 0);

        setSummary({
          income: s.totalIncome,
          expenses: s.totalExpenses,
          balance: s.currentBalance,
          investments: totalInv,
          bills: totalBills,
          goals: totalGoals,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalCapitalInPlay = summary.income + summary.investments + summary.goals;

  const nodes = [
    { label: 'Income Inflow', val: summary.income, icon: ArrowUpRight, color: '#39845B' },
    { label: 'Expenses Outflow', val: summary.expenses, icon: ArrowDownRight, color: '#DB896B' },
    { label: 'Net Liquidity', val: summary.balance, icon: Wallet, color: '#244C3B' },
    { label: 'Invested Assets', val: summary.investments, icon: TrendingUp, color: '#466B56' },
    { label: 'Recurring Liabilities', val: summary.bills, icon: ReceiptText, color: '#D6A45E' },
    { label: 'Goals Capital', val: summary.goals, icon: Target, color: '#A6B6A1' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
            <div>
              <h1 className="font-serif text-3xl font-normal text-[#1D2923] tracking-tight">
                Capital Ecosystem
              </h1>
              <p className="text-sm text-[#777E77] mt-1 font-sans">
                Holistic view of all liquidity, commitments, investments and milestones
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F0F1E9] border border-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Capital Ecosystem Summary Card */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-8 shadow-subtle text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-wider text-[#777E77] font-medium">
              Total Tracked Capital Velocity
            </span>
            <p className="text-4xl font-serif text-[#1D2923] mt-2 tabular-nums">
              {formatINR(totalCapitalInPlay)}
            </p>
            <p className="text-xs text-[#777E77] mt-2 max-w-md mx-auto">
              Synthesized from your active transactions, asset holdings, and defined financial targets.
            </p>
          </div>

          {/* Node Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {nodes.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.label}
                  className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-3 hover:border-[#CBD4C7] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#777E77]">{node.label}</span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: node.color }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                  </div>
                  <p className="text-2xl font-mono font-medium text-[#1D2923] tabular-nums">
                    {formatINR(node.val)}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-[#F0F1E9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: node.color,
                        width: totalCapitalInPlay > 0 ? `${Math.min(100, Math.round((node.val / totalCapitalInPlay) * 100))}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
