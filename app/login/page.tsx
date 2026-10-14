'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  // Empty initial state — no pre-filled credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Guard: Supabase must be configured — no silent fallthrough to dashboard
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        'Authentication is not configured. Please contact the administrator — the Supabase environment variables are missing from this deployment.'
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Show the real Supabase error (e.g. "Invalid login credentials", "Email not confirmed")
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        // Supabase returned no error but also no session — unusual, but handle it
        setErrorMsg('Login did not return a valid session. Please try again.');
        setLoading(false);
        return;
      }

      // Authenticated — navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      // Network or unexpected exception — surface it, never swallow it
      setErrorMsg(
        err?.message || 'An unexpected error occurred. Please check your connection and try again.'
      );
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0c1222]/90 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl text-white">F</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-white">FINORA</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your AI personal finance operating system
          </p>
        </div>

        {/* Quick Instant Demo Access Button */}
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
          <span className="text-[11px] text-cyan-300 font-semibold block mb-2">
            🚀 Client &amp; Reviewer Instant Access
          </span>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>Launch Instant Demo Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-[#0c1222] text-[11px] text-slate-500 uppercase tracking-widest font-mono">
            Or sign in with credentials
          </span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Supabase'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="text-cyan-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
