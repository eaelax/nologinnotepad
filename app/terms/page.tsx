'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { LanguageCode } from '@/types/note';

export default function TermsPage() {
  const [lang] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('notepad_preferences');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.language) return parsed.language;
        }
      } catch {}
    }
    return 'EN';
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('notepad_preferences');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.theme) {
          const isDark = parsed.theme === 'dark';
          document.documentElement.classList.toggle('dark', isDark);
          document.documentElement.setAttribute('data-theme', parsed.theme);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const isRtl = lang === 'AR';

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 dark:bg-[#090B10] dark:text-slate-100 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#11141C]/85 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AppLogo size={28} />
          <Link href="/" className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 hover:opacity-80 transition">
            NoLoginNotepad
          </Link>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          <span>Open Notepad</span>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-300">
              By accessing and using NoLoginNotepad, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Description of Service & Local Storage</h2>
            <p className="text-slate-600 dark:text-slate-300">
              NoLoginNotepad provides a browser-based, client-side text editor that requires no user registration. All notes and configurations are saved locally on your device via IndexedDB and LocalStorage.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. Terms of Service.</p>
      </footer>
    </div>
  );
}
