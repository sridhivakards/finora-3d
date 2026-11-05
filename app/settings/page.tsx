'use client';

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import {
  Settings as SettingsIcon,
  Database,
  Download,
  Check,
  UserRound,
  ShieldCheck,
  LogOut,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [exportDone, setExportDone] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserEmail(user.email ?? '');
          setFullName(user.user_metadata?.full_name ?? '');
        }
      });
    }

    db.userProfile.get().then((profile) => {
      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);
        if (profile.monthly_income) setMonthlyIncome(String(profile.monthly_income));
      }
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await db.userProfile.update({
        full_name: fullName.trim() || null,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : 0,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const [transactions, budgets, goals, bills, investments] = await Promise.all([
        db.transactions.list(),
        db.budgets.list(),
        db.goals.list(),
        db.bills.list(),
        db.investments.list(),
      ]);
      const backup = {
        transactions,
        budgets,
        goals,
        bills,
        investments,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Finora_Data_Export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-[#E6E5DC]">
            <h1 className="font-serif text-3xl font-normal text-[#1D2923] tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-sm text-[#777E77] mt-1 font-sans">
              Account parameters, baseline income configuration and data management
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#C76B63]/10 border border-[#C76B63]/30 rounded-xl text-[#C76B63] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-5">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Account Profile
              </h3>
              <p className="text-xs text-[#777E77] mt-0.5">
                Manage your identity and expected monthly income baseline
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#F0F1E9] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#777E77] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777E77] mb-1.5">
                  Expected Monthly Income (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#777E77]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
                  />
                </div>
                <span className="text-[11px] text-[#9A9F98] mt-1 block">
                  Used by Finora AI and budgeting models to calculate savings benchmarks.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                {isSaved && (
                  <span className="text-xs font-medium text-[#39845B] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Saved successfully
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Localization & Currency */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-4">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Currency Localization
              </h3>
              <p className="text-xs text-[#777E77] mt-0.5">
                Finora is formatted for the Indian Numbering System across all modules
              </p>
            </div>

            <div className="p-3.5 bg-[#F0F1E9] border border-[#E6E5DC] rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-[#1D2923]">Standard Currency:</span>
                <span className="ml-2 font-mono text-[#244C3B] font-medium">Indian Rupee (INR — ₹)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#E5EBDD] text-[#244C3B] text-[10px] font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Database Integration Status */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                  Supabase Security & Database Sync
                </h3>
                <p className="text-xs text-[#777E77] mt-0.5">
                  PostgreSQL database with Row-Level Security (RLS) enforcement
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5EBDD] text-[#39845B] text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                RLS Active
              </span>
            </div>
            <p className="text-xs text-[#777E77] leading-relaxed">
              Every database query verifies your authenticated user ID before read or write execution. Financial data remains isolated to your account.
            </p>
          </div>

          {/* Data Export & Sign Out */}
          <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-6 shadow-subtle space-y-4">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#1D2923]">
                Data Management & Session
              </h3>
              <p className="text-xs text-[#777E77] mt-0.5">
                Download a clean JSON archive of your records or terminate your session
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full sm:w-auto px-4 py-2 bg-[#F0F1E9] hover:bg-[#E6E5DC] border border-[#E6E5DC] text-[#1D2923] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {exportDone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#39845B]" strokeWidth={1.75} />
                    <span>Download Started</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#777E77]" strokeWidth={1.75} />
                    <span>Export Full Data (JSON)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="w-full sm:w-auto px-4 py-2 bg-[#C76B63]/10 hover:bg-[#C76B63]/20 border border-[#C76B63]/30 text-[#C76B63] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
