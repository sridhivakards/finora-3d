/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Finora Resilient Full-Stack Data Layer
 *
 * Supports both authenticated Supabase cloud data and instant offline/demo
 * local storage fallback.
 *
 * If the user is signed into Supabase, all operations sync with PostgreSQL & RLS.
 * If the user is unauthenticated, visiting as guest, or Supabase is paused/offline,
 * all operations seamlessly fallback to FinoraStore so the app NEVER crashes
 * and "Launch App" works immediately for anyone.
 */

import { createClient } from '@/lib/supabase/client';
import { FinoraStore } from '@/lib/storage';
import type {
  Transaction,
  Budget,
  FinancialGoal,
  Bill,
  Investment,
} from '@/lib/types';

// ─── Supabase client helper ───────────────────────────────────────────────────

let cachedUser: any = undefined;
let userCheckPromise: Promise<any> | null = null;

function getSupabaseClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

async function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase operation timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

async function getAuthenticatedUser() {
  if (cachedUser !== undefined) return cachedUser;
  if (userCheckPromise) return userCheckPromise;

  userCheckPromise = (async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        cachedUser = null;
        return null;
      }

      // Fast 1.2s timeout so pages load instantly if Supabase is offline or paused
      const res = await withTimeout(supabase.auth.getUser(), 1200);
      if (res?.data?.user) {
        cachedUser = res.data.user;
        return cachedUser;
      }
    } catch {
      // Supabase unreachable or paused
    }
    cachedUser = null;
    return null;
  })();

  const result = await userCheckPromise;
  userCheckPromise = null;
  return result;
}

// ─── Financial Summary ────────────────────────────────────────────────────────

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  savingsRate: number;
  categorySpending: Record<string, number>;
  transactionCount: number;
}

export function computeSummary(transactions: Transaction[]): FinancialSummary {
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
  /** Fetch all transactions for the current user, or local store fallback. */
  async list(): Promise<Transaction[]> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Transaction[];
        }
      }
    } catch {
      // Fallback to local storage below
    }
    return FinoraStore.getTransactions();
  },

  /** Add a new transaction. */
  async add(
    payload: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
  ): Promise<Transaction> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();

        if (!error && data) {
          return data as Transaction;
        }
      }
    } catch {
      // Fallback
    }
    return FinoraStore.addTransaction(payload);
  },

  /** Update an existing transaction. */
  async update(id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase
          .from('transactions')
          .update(updates)
          .eq('id', id);
      }
    } catch {}
    FinoraStore.updateTransaction(id, updates as any);
  },

  /** Delete a transaction by ID. */
  async delete(id: string): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase.from('transactions').delete().eq('id', id);
      }
    } catch {}
    FinoraStore.deleteTransaction(id);
  },

  /** Compute a financial summary. */
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

    const entries = Object.entries(map);
    if (entries.length === 0) {
      // Default initial trend if empty
      return [
        { month: 'Apr', Income: 85000, Expenses: 22000 },
        { month: 'May', Income: 85000, Expenses: 19500 },
        { month: 'Jun', Income: 88000, Expenses: 24000 },
        { month: 'Jul', Income: 88000, Expenses: 21500 },
        { month: 'Aug', Income: 90000, Expenses: 23100 },
        { month: 'Sep', Income: 92000, Expenses: 18400 },
      ];
    }

    return entries
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
  async list(): Promise<Budget[]> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Budget[];
        }
      }
    } catch {}
    return FinoraStore.getBudgets();
  },

  async upsert(payload: Omit<Budget, 'id' | 'user_id' | 'created_at'>): Promise<Budget> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('budgets')
          .upsert(
            { ...payload, user_id: user.id },
            { onConflict: 'user_id,category,month' }
          )
          .select()
          .single();

        if (!error && data) {
          return data as Budget;
        }
      }
    } catch {}
    return FinoraStore.addBudget(payload);
  },

  async delete(id: string): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase.from('budgets').delete().eq('id', id);
      }
    } catch {}
    FinoraStore.deleteBudget(id);
  },
};

// ─── Financial Goals ──────────────────────────────────────────────────────────

export const goals = {
  async list(): Promise<FinancialGoal[]> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('financial_goals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as FinancialGoal[];
        }
      }
    } catch {}
    return FinoraStore.getGoals();
  },

  async add(payload: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at'>): Promise<FinancialGoal> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('financial_goals')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();

        if (!error && data) {
          return data as FinancialGoal;
        }
      }
    } catch {}
    return FinoraStore.addGoal(payload);
  },

  async contribute(id: string, amount: number): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data: existing } = await supabase
          .from('financial_goals')
          .select('current_amount')
          .eq('id', id)
          .single();

        if (existing) {
          const newAmount = Number(existing.current_amount) + amount;
          await supabase
            .from('financial_goals')
            .update({ current_amount: newAmount })
            .eq('id', id);
        }
      }
    } catch {}
    FinoraStore.contributeToGoal(id, amount);
  },

  async delete(id: string): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase.from('financial_goals').delete().eq('id', id);
      }
    } catch {}
    FinoraStore.deleteGoal(id);
  },
};

// ─── Bills ────────────────────────────────────────────────────────────────────

export const bills = {
  async list(): Promise<Bill[]> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .order('due_date', { ascending: true });

        if (!error && data) {
          return data as Bill[];
        }
      }
    } catch {}
    return FinoraStore.getBills();
  },

  async add(payload: Omit<Bill, 'id' | 'user_id' | 'created_at'>): Promise<Bill> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('bills')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();

        if (!error && data) {
          return data as Bill;
        }
      }
    } catch {}
    return FinoraStore.addBill(payload);
  },

  async toggleStatus(id: string, currentStatus: Bill['status']): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const newStatus: Bill['status'] = currentStatus === 'Paid' ? 'Upcoming' : 'Paid';
        await supabase
          .from('bills')
          .update({ status: newStatus })
          .eq('id', id);
      }
    } catch {}
    FinoraStore.toggleBillStatus(id);
  },

  async delete(id: string): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase.from('bills').delete().eq('id', id);
      }
    } catch {}
    FinoraStore.deleteBill(id);
  },
};

// ─── Investments ──────────────────────────────────────────────────────────────

export const investments = {
  async list(): Promise<Investment[]> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Investment[];
        }
      }
    } catch {}
    return FinoraStore.getInvestments();
  },

  async add(payload: Omit<Investment, 'id' | 'user_id' | 'created_at'>): Promise<Investment> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data, error } = await supabase
          .from('investments')
          .insert({ ...payload, user_id: user.id })
          .select()
          .single();

        if (!error && data) {
          return data as Investment;
        }
      }
    } catch {}
    return FinoraStore.addInvestment(payload);
  },

  async update(id: string, updates: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase.from('investments').update(updates).eq('id', id);
      }
    } catch {}
    FinoraStore.updateInvestment(id, updates as any);
  },

  async delete(id: string): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase.from('investments').delete().eq('id', id);
      }
    } catch {}
    FinoraStore.deleteInvestment(id);
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
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) return data as UserProfile;

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
    } catch {}

    // Fallback guest profile
    return {
      id: 'guest-user',
      email: 'guest@finora.app',
      full_name: 'Guest User',
      currency: 'INR',
      currency_symbol: '₹',
      monthly_income: 92000,
    };
  },

  async update(updates: Partial<Omit<UserProfile, 'id' | 'email'>>): Promise<void> {
    try {
      const user = await getAuthenticatedUser();
      const supabase = getSupabaseClient();
      if (user && supabase) {
        await supabase
          .from('user_profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch {}
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
