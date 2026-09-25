import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4">
        <div className="flex justify-center mb-2">
          <AppLogo size={48} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-xs font-semibold">
          <FileQuestion className="w-3.5 h-3.5" />
          <span>404 — Page Not Found</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">The requested page could not be found</h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
          The page you are looking for doesn't exist or has been moved. You can return to your notepad anytime.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Notepad</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
