'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Guard: Supabase must be configured for real auth
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        'Authentication is not configured. Please contact the site administrator to set up Supabase environment variables.'
      );
      setLoading(false);
      return;
    }

    // Password length check (Supabase default minimum is 6)
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          // emailRedirectTo ensures the confirmation link sends the user back to the app
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        // Surface the actual Supabase error to the user
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Supabase returns a user but no session when email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation is required — tell the user clearly
        setSuccessMsg(
          `✅ Account created! We sent a confirmation email to ${email.trim()}. Please check your inbox (and spam folder) and click the link to activate your account, then come back to log in.`
        );
        setLoading(false);
        return;
      }

      // Session present — email confirmation is disabled, go straight to dashboard
      if (data.session) {
        router.push('/dashboard');
        return;
      }

      // Unexpected state — should not happen, but handle gracefully
      setSuccessMsg(
        'Account request submitted. If you do not receive a confirmation email within a few minutes, please try again.'
      );
      setLoading(false);
    } catch (err: any) {
      // Network error or unexpected exception — show it, do NOT swallow it
      setErrorMsg(
        err?.message || 'An unexpected error occurred. Please check your connection and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0c1222]/90 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl text-white">F</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-white">FINORA</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Create your account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Unlock your AI financial intelligence operating system
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success / confirmation message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Only show form when we haven't sent a confirmation email */}
        {!successMsg && (
          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

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
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creating Account...' : 'Get Started with Finora'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {successMsg && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-semibold"
            >
              Go to Sign In
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
