'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, UserRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

    const supabase = createClient();
    if (!supabase) {
      setErrorMsg(
        'Authentication is not configured. Please contact the administrator.'
      );
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.session) {
        setSuccessMsg(
          `Account created for ${email.trim()}. Please check your inbox to activate your account, then log in.`
        );
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push('/dashboard');
        return;
      }

      setSuccessMsg('Account registered successfully. Please sign in to proceed.');
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
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
          <h2 className="font-serif text-2xl font-normal text-[#1D2923]">Create your account</h2>
          <p className="text-xs text-[#777E77] mt-1 font-sans">
            Personal financial intelligence workspace with real-time tracking
          </p>
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#C76B63]/10 border border-[#C76B63]/30 text-[#C76B63] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#39845B]/10 border border-[#39845B]/30 text-[#39845B] text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
              <input
                type="text"
                required
                placeholder="e.g. Dhilip Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
              />
            </div>
          </div>

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
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6E5DC] rounded-lg text-xs text-[#1D2923] placeholder:text-[#9A9F98] focus:border-[#244C3B] focus:ring-1 focus:ring-[#244C3B] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#777E77] mb-1.5">
              Password (6+ characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9F98]" strokeWidth={1.75} />
              <input
                type="password"
                required
                minLength={6}
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
            <span>{loading ? 'Registering...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </form>

        <p className="text-center text-xs text-[#777E77] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#244C3B] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
