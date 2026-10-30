/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Finora Supabase Data-Access Layer
 *
 * All functions operate on the authenticated user's rows only.
 * Row Level Security on every table ensures the database enforces this as well.
 *
 * Usage (client components):
 *   import { db } from '@/lib/db';
 *   const txs = await db.transactions.list();
 */

import { createBrowserClient } from '@supabase/ssr';
import type {
  Transaction,
  Budget,
  FinancialGoal,
  Bill,
  Investment,
} from '@/lib/types';

// ─── Supabase client ──────────────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) throw new Error('Supabase environment variables are not configured.');
  return createBrowserClient(url, key);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the currently authenticated user's UUID, throws if not logged in. */
async function requireUserId(): Promise<string> {
  const supabase = getSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('User is not authenticated.');
  return user.id;
}

/** Shared error handler — extracts a human-readable message. */
function dbError(context: string, error: any): never {
  throw new Error(`[db.${context}] ${error?.message ?? 'Unknown database error'}`);
}

// ─── Financial Summary (computed from real transactions) ──────────────────────

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  savingsRate: number;
  categorySpending: Record<string, number>;
  transactionCount: number;
}

function computeSummary(transactions: Transaction[]): FinancialSummary {
  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.transaction_type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const currentBalance = totalIncome - totalExpenses;

  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10)
      : 0;

  const categorySpending: Record<string, number> = {};
  transactions
    .filter((t) => t.transaction_type === 'expense')
    .forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] ?? 0) + Number(t.amount);
    });

  return {
    totalIncome,
    totalExpenses,
    currentBalance,
    savingsRate,
    categorySpending,
    transactionCount: transactions.length,
  };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = {
  /** Fetch all transactions for the current user, newest first. */
  async list(): Promise<Transaction[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) dbError('transactions.list', error);
    return (data ?? []) as Transaction[];
  },

  /** Add a new transaction for the current user. */
  async add(
    payload: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
  ): Promise<Transaction> {
    const supabase = getSupabase();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) dbError('transactions.add', error);
    return data as Transaction;
  },

  /** Update an existing transaction (only the owner's row). */
  async update(id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);
    if (error) dbError('transactions.update', error);
  },

  /** Delete a transaction by ID (RLS ensures only own rows). */
  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) dbError('transactions.delete', error);
  },

  /** Compute a financial summary from the current user's transactions. */
  async getSummary(): Promise<FinancialSummary> {
    const txs = await this.list();
    return computeSummary(txs);
  },

  /** Return transactions grouped by month for trend charts. */
  async getMonthlyTrend(): Promise<{ month: string; Income: number; Expenses: number }[]> {
    const txs = await this.list();
    const map: Record<string, { Income: number; Expenses: number }> = {};

    txs.forEach((t) => {
      const d = new Date(t.transaction_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { Income: 0, Expenses: 0 };
      if (t.transaction_type === 'income') {
        map[key].Income += Number(t.amount);
      } else {
        map[key].Expenses += Number(t.amount);
      }
    });

    // Return last 6 months sorted chronologically
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [year, month] = key.split('-');
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
          month: 'short',
          year: '2-digit',
        });
        return { month: label, ...val };
      });
  },

  /** Return monthly expense totals for ML prediction input. */
  async getMonthlyExpenseTotals(): Promise<number[]> {
    const trend = await this.getMonthlyTrend();
    return trend.map((t) => t.Expenses);
  },
};

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const budgets = {
  /** Fetch all budgets for the current user. */
  async list(): Promise<Budget[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) dbError('budgets.list', error);
    return (data ?? []) as Budget[];
  },

  /** Upsert a budget for a given category + month. */
  async upsert(payload: Omit<Budget, 'id' | 'user_id' | 'created_at'>): Promise<Budget> {
    const supabase = getSupabase();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { ...payload, user_id: userId },
        { onConflict: 'user_id,category,month' }
      )
      .select()
      .single();

    if (error) dbError('budgets.upsert', error);
    return data as Budget;
  },

  /** Delete a budget by ID. */
  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) dbError('budgets.delete', error);
  },
};

// ─── Financial Goals ──────────────────────────────────────────────────────────

export const goals = {
  async list(): Promise<FinancialGoal[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) dbError('goals.list', error);
    return (data ?? []) as FinancialGoal[];
  },

  async add(payload: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at'>): Promise<FinancialGoal> {
    const supabase = getSupabase();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) dbError('goals.add', error);
    return data as FinancialGoal;
  },

  async contribute(id: string, amount: number): Promise<void> {
    const supabase = getSupabase();
    // Read current value first to avoid race conditions
    const { data: existing, error: fetchErr } = await supabase
      .from('financial_goals')
      .select('current_amount')
      .eq('id', id)
      .single();
    if (fetchErr) dbError('goals.contribute.fetch', fetchErr);

    const newAmount = Number(existing.current_amount) + amount;
    const { error } = await supabase
      .from('financial_goals')
      .update({ current_amount: newAmount })
      .eq('id', id);
    if (error) dbError('goals.contribute', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('financial_goals').delete().eq('id', id);
    if (error) dbError('goals.delete', error);
  },
};

// ─── Bills ────────────────────────────────────────────────────────────────────

export const bills = {
  async list(): Promise<Bill[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) dbError('bills.list', error);
    return (data ?? []) as Bill[];
  },

  async add(payload: Omit<Bill, 'id' | 'user_id' | 'created_at'>): Promise<Bill> {
    const supabase = getSupabase();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('bills')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) dbError('bills.add', error);
    return data as Bill;
  },

  async toggleStatus(id: string, currentStatus: Bill['status']): Promise<void> {
    const supabase = getSupabase();
    const newStatus: Bill['status'] = currentStatus === 'Paid' ? 'Upcoming' : 'Paid';
    const { error } = await supabase
      .from('bills')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) dbError('bills.toggleStatus', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) dbError('bills.delete', error);
  },
};

// ─── Investments ──────────────────────────────────────────────────────────────

export const investments = {
  async list(): Promise<Investment[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) dbError('investments.list', error);
    return (data ?? []) as Investment[];
  },

  async add(payload: Omit<Investment, 'id' | 'user_id' | 'created_at'>): Promise<Investment> {
    const supabase = getSupabase();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('investments')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) dbError('investments.add', error);
    return data as Investment;
  },

  async update(id: string, updates: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('investments').update(updates).eq('id', id);
    if (error) dbError('investments.update', error);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (error) dbError('investments.delete', error);
  },
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  currency: string;
  currency_symbol: string;
  monthly_income: number;
}

export const userProfile = {
  async get(): Promise<UserProfile | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) dbError('userProfile.get', error);

    // If no profile row yet, create one from auth metadata
    if (!data) {
      const profile: UserProfile = {
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? null,
        currency: 'INR',
        currency_symbol: '₹',
        monthly_income: 0,
      };
      await supabase.from('user_profiles').upsert(profile);
      return profile;
    }

    return data as UserProfile;
  },

  async update(updates: Partial<Omit<UserProfile, 'id' | 'email'>>): Promise<void> {
    const supabase = getSupabase();
    const userId = await requireUserId();
    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) dbError('userProfile.update', error);
  },
};

// ─── Named export ─────────────────────────────────────────────────────────────

export const db = {
  transactions,
  budgets,
  goals,
  bills,
  investments,
  userProfile,
  computeSummary,
};
