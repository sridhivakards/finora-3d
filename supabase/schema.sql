-- ============================================================
-- FINORA - AI-Powered Personal Finance Operating System
-- Supabase PostgreSQL Schema with Row-Level Security (RLS)
-- Idempotent & Safe to run multiple times
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    monthly_income NUMERIC(12, 2) DEFAULT 90000.00,
    financial_health_score INTEGER DEFAULT 78,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Food', 'Transport', 'Shopping', 'Entertainment', 
        'Bills', 'Health', 'Education', 'Salary', 'Investment', 'Other'
    )),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_unusual BOOLEAN DEFAULT false,
    anomaly_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'Food', 'Transport', 'Shopping', 'Entertainment', 
        'Bills', 'Health', 'Education', 'Other'
    )),
    amount NUMERIC(12, 2) NOT NULL,
    month TEXT NOT NULL, -- e.g. '2026-10'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category, month)
);

-- 4. FINANCIAL GOALS
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    category TEXT DEFAULT 'Savings',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BILLS & RECURRING PAYMENTS
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Paid', 'Overdue')),
    recurring_frequency TEXT DEFAULT 'Monthly' CHECK (recurring_frequency IN ('Monthly', 'Quarterly', 'Yearly')),
    category TEXT DEFAULT 'Utilities',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. INVESTMENTS
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Stocks', 'Mutual Funds', 'Fixed Deposits', 'Gold', 'Crypto', 'Other')),
    invested_amount NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can SELECT own transactions" ON public.transactions;
CREATE POLICY "Users can SELECT own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can INSERT own transactions" ON public.transactions;
CREATE POLICY "Users can INSERT own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can UPDATE own transactions" ON public.transactions;
CREATE POLICY "Users can UPDATE own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can DELETE own transactions" ON public.transactions;
CREATE POLICY "Users can DELETE own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Budgets Policies
DROP POLICY IF EXISTS "Users can SELECT own budgets" ON public.budgets;
CREATE POLICY "Users can SELECT own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can INSERT own budgets" ON public.budgets;
CREATE POLICY "Users can INSERT own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can UPDATE own budgets" ON public.budgets;
CREATE POLICY "Users can UPDATE own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can DELETE own budgets" ON public.budgets;
CREATE POLICY "Users can DELETE own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Financial Goals Policies
DROP POLICY IF EXISTS "Users can SELECT own goals" ON public.financial_goals;
CREATE POLICY "Users can SELECT own goals" ON public.financial_goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can INSERT own goals" ON public.financial_goals;
CREATE POLICY "Users can INSERT own goals" ON public.financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can UPDATE own goals" ON public.financial_goals;
CREATE POLICY "Users can UPDATE own goals" ON public.financial_goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can DELETE own goals" ON public.financial_goals;
CREATE POLICY "Users can DELETE own goals" ON public.financial_goals FOR DELETE USING (auth.uid() = user_id);

-- Bills Policies
DROP POLICY IF EXISTS "Users can SELECT own bills" ON public.bills;
CREATE POLICY "Users can SELECT own bills" ON public.bills FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can INSERT own bills" ON public.bills;
CREATE POLICY "Users can INSERT own bills" ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can UPDATE own bills" ON public.bills;
CREATE POLICY "Users can UPDATE own bills" ON public.bills FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can DELETE own bills" ON public.bills;
CREATE POLICY "Users can DELETE own bills" ON public.bills FOR DELETE USING (auth.uid() = user_id);

-- Investments Policies
DROP POLICY IF EXISTS "Users can SELECT own investments" ON public.investments;
CREATE POLICY "Users can SELECT own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can INSERT own investments" ON public.investments;
CREATE POLICY "Users can INSERT own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can UPDATE own investments" ON public.investments;
CREATE POLICY "Users can UPDATE own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can DELETE own investments" ON public.investments;
CREATE POLICY "Users can DELETE own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);
