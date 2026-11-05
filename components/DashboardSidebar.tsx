'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  TrendingUp,
  Target,
  ReceiptText,
  MessageCircle,
  Settings,
  Plus,
  LogOut,
  UserRound,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AddTransactionModal from './AddTransactionModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transaction', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
  { href: '/reports', label: 'Reports', icon: ChartNoAxesCombined },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/bills', label: 'Bills', icon: ReceiptText },
  { href: '/ai', label: 'AI Assistant', icon: MessageCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('User');

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const email = user.email || '';
          setUserEmail(email);
          const name = user.user_metadata?.full_name || email.split('@')[0] || 'User';
          setDisplayName(name);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E6E5DC] text-[#1D2923] select-none">
      {/* Brand Header */}
      <div className="px-6 py-7 border-b border-[#E6E5DC]/70">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#244C3B] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <span className="font-serif text-xl tracking-tight text-[#1D2923] block leading-none">
              FINORA
            </span>
            <span className="text-[11px] font-sans text-[#777E77] tracking-wider uppercase mt-1 block">
              Financial Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Action Button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={() => {
            setModalOpen(true);
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#E5EBDD] text-[#244C3B] font-semibold'
                  : 'text-[#777E77] hover:text-[#1D2923] hover:bg-[#F0F1E9]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#244C3B]' : 'text-[#777E77]'
                }`}
                strokeWidth={1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-[#E6E5DC]/80 bg-[#F7F6F0]/60">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#E5EBDD] border border-[#CBD4C7] flex items-center justify-center text-[#244C3B] font-semibold text-xs shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#1D2923] truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-[#9A9F98] truncate leading-tight mt-0.5">
                {userEmail || 'Active session'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-md text-[#9A9F98] hover:text-[#C76B63] hover:bg-[#FFFFFF] border border-transparent hover:border-[#E6E5DC] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {navContent}
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#FFFFFF] border-b border-[#E6E5DC] z-40 px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#244C3B] flex items-center justify-center text-white font-serif font-bold text-sm">
            F
          </div>
          <span className="font-serif text-lg tracking-tight text-[#1D2923]">FINORA</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[#1D2923] hover:bg-[#F0F1E9]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#1D2923]/30 z-40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          // If on a page with transactions, trigger window refresh or custom event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('finora:transaction-changed'));
          }
        }}
      />
    </>
  );
}
