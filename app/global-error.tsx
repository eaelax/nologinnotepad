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
      <body className="min-h-screen bg-stone-50 text-stone-900 font-sans flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Application Error</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-xs sm:text-sm text-stone-600">
            An unexpected error occurred. You can attempt to recover by refreshing the page.
          </p>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:opacity-90 transition"
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
