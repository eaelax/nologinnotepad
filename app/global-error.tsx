'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F6F7F9] text-slate-900 font-sans flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-4 p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Application Error</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An unexpected error occurred. You can attempt to recover by refreshing the page.
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
