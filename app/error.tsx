'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Finora Global Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[#0c1222] border border-rose-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-lg">!</div>
          <div>
            <h1 className="text-lg font-bold text-white">Something went wrong</h1>
            <p className="text-xs text-slate-400">A client-side error occurred</p>
          </div>
        </div>

        {/* Show the actual error so we can diagnose it */}
        <div className="bg-slate-900 rounded-xl p-4 mb-6 font-mono text-xs text-rose-300 border border-slate-800 overflow-auto max-h-48">
          <p className="font-semibold text-rose-400 mb-1">Error: {error?.name}</p>
          <p className="text-slate-300 break-words">{error?.message}</p>
          {error?.stack && (
            <p className="text-slate-500 mt-2 whitespace-pre-wrap text-[10px]">
              {error.stack.split('\n').slice(1, 6).join('\n')}
            </p>
          )}
          {error?.digest && (
            <p className="text-slate-600 mt-2">Digest: {error.digest}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          If this keeps happening, please share the error message above with support.
        </p>
      </div>
    </div>
  );
}
