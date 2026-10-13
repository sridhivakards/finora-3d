'use client';

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { FinoraStore } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Settings as SettingsIcon,
  Database,
  Key,
  Shield,
  RotateCcw,
  Trash2,
  Download,
  Check,
  User,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function SettingsPage() {
  const [cleared, setCleared] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleResetDemo = () => {
    FinoraStore.resetToDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const handleClearAll = () => {
    FinoraStore.clearAllData();
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  const handleExportBackup = () => {
    const backup = {
      transactions: FinoraStore.getTransactions(),
      budgets: FinoraStore.getBudgets(),
      goals: FinoraStore.getGoals(),
      bills: FinoraStore.getBills(),
      investments: FinoraStore.getInvestments(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Finora_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 border-b border-slate-800/80 bg-[#080d1e]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              CONFIG
            </span>
            <span className="text-xs text-slate-400">• System & Integrations</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">Settings</h1>
          <p className="text-xs text-slate-400">
            Manage your currency formatting, Supabase PostgreSQL sync, and local data persistence
          </p>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 space-y-8 max-w-4xl">
          {/* Currency Configuration (Section 34) */}
          <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Currency Localization (Section 34)
            </h3>
            <p className="text-xs text-slate-400">
              Finora defaults to Indian Numbering System (₹ Lakhs & Crores format) across all ledgers,
              graphs, predictions, and conversational AI responses.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">Active Currency:</span>
                <span className="ml-2 font-mono text-cyan-300 font-bold">Indian Rupee (INR - ₹)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Database & Supabase Status (Section 4 & 35) */}
          <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Supabase PostgreSQL & RLS Integration</span>
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isSupabaseConfigured ? 'CONNECTED' : 'STANDALONE / DEMO MODE'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Finora includes the complete PostgreSQL schema with Row-Level Security (`auth.uid() = user_id`) in `supabase/schema.sql`. In Standalone/Demo mode, all actions reactively persist in your browser session with zero friction.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL = {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured via .env.local'}</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY = {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '••••••••••••••••' : 'Configured via .env.local'}</div>
            </div>
          </div>

          {/* Data Controls & Testing Empty States */}
          <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Data Management & State Testing</span>
            </h3>
            <p className="text-xs text-slate-400">
              Easily toggle between authentic demo data or test empty dashboard states as required for client reviews and recruitment evaluation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleResetDemo}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                {resetDone ? <Check className="w-4 h-4 text-emerald-400" /> : <RotateCcw className="w-4 h-4 text-cyan-400" />}
                <span>{resetDone ? 'Demo Data Restored!' : 'Reset Demo Data'}</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Backup (JSON)</span>
              </button>

              <button
                onClick={handleClearAll}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 transition-all"
              >
                {cleared ? <Check className="w-4 h-4 text-emerald-400" /> : <Trash2 className="w-4 h-4 text-rose-400" />}
                <span>{cleared ? 'Cleared!' : 'Test Empty State'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
