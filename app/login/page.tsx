'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const supabase = createClient();
    if (!supabase) {
      setErrorMsg(
        'Authentication is not configured. Missing Supabase environment variables.'
      );
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg(
            'Invalid email or password. If you recently created your account, please check your credentials or create an account first.'
          );
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg(
            'Please verify your email address or confirm your account in Supabase before logging in.'
          );
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (!data.session) {
        setErrorMsg('Login did not return a valid session. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'An unexpected error occurred. Please check your connection and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6E5DC] rounded-2xl p-8 shadow-card">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-9 h-9 rounded-lg bg-[#244C3B] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              F
            </div>
            <span className="font-serif text-2xl tracking-tight text-[#1D2923]">FINORA</span>
          </Link>
          <h2 className="font-serif text-2xl font-normal text-[#1D2923]">Welcome back</h2>
          <p className="text-xs text-[#777E77] mt-1 font-sans">
            Sign in to access your personal financial intelligence workspace
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#C76B63]/10 border border-[#C76B63]/30 text-[#C76B63] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
              <input
                type="email"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs font-mono text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white font-medium text-xs rounded-lg transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Supabase'}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </form>

        <p className="text-center text-xs text-[#777E77] mt-6">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="text-[#244C3B] font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
