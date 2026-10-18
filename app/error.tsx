'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Application Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 dark:bg-[#090B10] dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4 p-8 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex justify-center mb-2">
          <AppLogo size={44} />
        </div>
        <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Something went wrong</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">We encountered an unexpected issue</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Your notes are safely preserved in local storage. You can reload the notepad to continue writing.
        </p>
        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
