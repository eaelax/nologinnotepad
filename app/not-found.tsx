import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 dark:bg-[#090B10] dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4 p-8 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex justify-center mb-2">
          <AppLogo size={44} />
        </div>
        <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <FileQuestion className="w-3.5 h-3.5" />
          <span>404 — Page Not Found</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">The requested page could not be found</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved. You can return to your notepad anytime.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Notepad</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
