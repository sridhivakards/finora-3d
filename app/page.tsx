'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Wallet,
  ReceiptText,
  MessageCircle,
  ChartNoAxesCombined,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923] selection:bg-[#E5EBDD] selection:text-[#244C3B]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EBDD] border border-[#CBD4C7] text-[#244C3B] text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#244C3B]" />
            <span>Personal Financial Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1D2923] tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Your money. <br className="hidden sm:inline" />
            Clearly understood.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-[#777E77] max-w-2xl mx-auto font-sans leading-relaxed">
            Finora combines real-time ledger accounting, category-level budget guardrails,
            and machine-learning expense forecasting into a calm, human-designed workspace.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-card"
            >
              <span>Access Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFFFFF] hover:bg-[#F0F1E9] border border-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* Product Dashboard Visual Preview */}
          <div className="mt-14 max-w-5xl mx-auto bg-[#FFFFFF] border border-[#E6E5DC] rounded-2xl shadow-card overflow-hidden text-left p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E5DC]">
              <div>
                <span className="font-serif text-2xl text-[#1D2923] block">FINORA LEDGER</span>
                <span className="text-xs text-[#777E77]">Active Personal Workspace Preview</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#39845B] bg-[#E5EBDD] px-3 py-1 rounded-full">
                <span>Verified PostgreSQL Instance</span>
              </div>
            </div>

            {/* Metrics preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-[#F7F6F0] rounded-xl border border-[#E6E5DC]">
                <span className="text-[11px] text-[#777E77] block">Total Balance</span>
                <span className="text-xl font-mono font-medium text-[#1D2923] mt-1 block">₹2,45,800</span>
              </div>
              <div className="p-4 bg-[#F7F6F0] rounded-xl border border-[#E6E5DC]">
                <span className="text-[11px] text-[#777E77] block">Monthly Inflow</span>
                <span className="text-xl font-mono font-medium text-[#39845B] mt-1 block">+₹1,20,000</span>
              </div>
              <div className="p-4 bg-[#F7F6F0] rounded-xl border border-[#E6E5DC]">
                <span className="text-[11px] text-[#777E77] block">Monthly Outflow</span>
                <span className="text-xl font-mono font-medium text-[#DB896B] mt-1 block">-₹68,400</span>
              </div>
              <div className="p-4 bg-[#F7F6F0] rounded-xl border border-[#E6E5DC]">
                <span className="text-[11px] text-[#777E77] block">Savings Margin</span>
                <span className="text-xl font-mono font-medium text-[#244C3B] mt-1 block">43% rate</span>
              </div>
            </div>

            {/* Micro table preview */}
            <div className="mt-6 border border-[#E6E5DC] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F6F0] border-b border-[#E6E5DC] text-[#777E77]">
                    <th className="py-2.5 px-4 font-medium">Record</th>
                    <th className="py-2.5 px-4 font-medium">Category</th>
                    <th className="py-2.5 px-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E5DC]">
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1D2923]">Monthly Tech Salary</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E5EBDD] text-[#39845B] text-[10px]">Salary</span></td>
                    <td className="py-3 px-4 text-right font-mono text-[#39845B]">+₹1,20,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1D2923]">Apartment Lease & Maintenance</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#F0F1E9] text-[#1D2923] text-[10px]">Bills</span></td>
                    <td className="py-3 px-4 text-right font-mono text-[#1D2923]">-₹32,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#1D2923]">Organic Groceries & Provisions</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#F0F1E9] text-[#1D2923] text-[10px]">Food</span></td>
                    <td className="py-3 px-4 text-right font-mono text-[#1D2923]">-₹6,450</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-20 bg-[#FFFFFF] border-y border-[#E6E5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1D2923] tracking-tight">
              Designed for intentional finance.
            </h2>
            <p className="mt-3 text-sm text-[#777E77] font-sans">
              Each module serves an explicit functional purpose without noise or distraction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 bg-[#F7F6F0] border border-[#E6E5DC] rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#E5EBDD] flex items-center justify-center text-[#244C3B]">
                <Wallet className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1D2923]">
                Strict Ledger Accounting
              </h3>
              <p className="text-xs text-[#777E77] leading-relaxed">
                Log every inflow and outflow with instant categorization. Your running balance, monthly cash flows, and category distributions update in real time.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 bg-[#F7F6F0] border border-[#E6E5DC] rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#E5EBDD] flex items-center justify-center text-[#244C3B]">
                <ChartNoAxesCombined className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1D2923]">
                Category Guardrails
              </h3>
              <p className="text-xs text-[#777E77] leading-relaxed">
                Establish monthly allocation limits across food, transport, bills, and entertainment. Receive early warnings before category limits are breached.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 bg-[#F7F6F0] border border-[#E6E5DC] rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#E5EBDD] flex items-center justify-center text-[#244C3B]">
                <MessageCircle className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1D2923]">
                Grounded Financial AI
              </h3>
              <p className="text-xs text-[#777E77] leading-relaxed">
                A conversational assistant strictly grounded on your verified database entries. Ask natural-language questions and receive factual answers with zero hallucination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-2xl p-8 sm:p-12 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-medium text-[#244C3B]">
                <ShieldCheck className="w-4 h-4 text-[#244C3B]" strokeWidth={1.75} />
                <span>ISOLATED DATABASE SECURITY</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1D2923]">
                Your records stay private.
              </h3>
              <p className="text-xs text-[#777E77] leading-relaxed">
                Finora leverages Supabase PostgreSQL with Row Level Security (RLS). Every query requires authenticated user credentials, ensuring complete data isolation between accounts.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-card"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E6E5DC] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#777E77]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#244C3B] flex items-center justify-center text-white font-serif font-bold text-sm">
              F
            </div>
            <span className="font-serif text-base tracking-tight text-[#1D2923]">FINORA</span>
            <span className="text-[11px] text-[#9A9F98]">© {new Date().getFullYear()} Finora Systems</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-[#1D2923] transition-colors">
              Dashboard
            </Link>
            <Link href="/transaction" className="hover:text-[#1D2923] transition-colors">
              Transactions
            </Link>
            <Link href="/budgets" className="hover:text-[#1D2923] transition-colors">
              Budgets
            </Link>
            <Link href="/login" className="hover:text-[#1D2923] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
