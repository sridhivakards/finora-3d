'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Sparkles,
  TrendingUp,
  CreditCard,
  Briefcase,
  Settings,
  Plus,
  Orbit,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { FinoraStore } from '@/lib/storage';
import AddTransactionModal from './AddTransactionModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transaction', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/reports', label: 'Reports & Analytics', icon: PieChart },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/predictions', label: 'ML Predictions', icon: TrendingUp },
  { href: '/ai', label: 'Ask Finora AI', icon: Sparkles, badge: 'AI' },
  { href: '/universe', label: '3D Money Universe', icon: Orbit, badge: '3D' },
  { href: '/goals', label: 'Financial Goals', icon: Target },
  { href: '/bills', label: 'Bills & Subscriptions', icon: CreditCard },
  { href: '/investments', label: 'Investments', icon: Briefcase },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0f20] border-b border-slate-800 text-white z-40 fixed top-0 left-0 right-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="font-extrabold tracking-tight">FINORA</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Desktop + Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0f20] border-r border-slate-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 pb-4 border-b border-slate-800/60 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg text-white">F</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                FINORA
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </span>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase -mt-0.5">
                Financial OS
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Transaction</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                      item.badge === '3D'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                D
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Dhilikesh</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">₹ Indian Mode</p>
              </div>
            </div>
            <Link
              href="/"
              title="Sign Out to Landing Page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
        }}
      />
    </>
  );
}
