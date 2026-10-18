'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { LanguageCode } from '@/types/note';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Client-Side Local Storage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Overview & Local-First Architecture</h2>
            <p className="text-slate-600 dark:text-slate-300">
              At NoLoginNotepad, your privacy is our top priority. Unlike conventional online word processors and cloud notepad applications, NoLoginNotepad is engineered with a local-first, zero-account client architecture.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Data Storage on Your Device (IndexedDB & LocalStorage)</h2>
            <p className="text-slate-600 dark:text-slate-300">
              When you write or edit a note, all information is stored directly inside your browser’s local sandbox storage using IndexedDB and LocalStorage APIs. It remains strictly on your physical device and is never transmitted to our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. GDPR & CCPA Compliance</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Because NoLoginNotepad does not collect, sell, or retain personal identifiers, your data sovereignty is naturally upheld. You can download or purge all your stored data in one click at any time.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. 100% Client-Side Local Storage.</p>
      </footer>
    </div>
  );
}
