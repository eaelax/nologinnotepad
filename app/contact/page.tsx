'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { LanguageCode } from '@/types/note';

export default function ContactPage() {
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

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>Support & Feedback</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Have a question, suggestion, bug report, or stationery theme idea? We would love to hear from you.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Direct Email Support</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Send an email directly to our project mailbox.</p>
              <a
                href="mailto:contact@nologinnotepad.com"
                className="inline-block mt-2 font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                contact@nologinnotepad.com
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Response time: Within 24-48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Open to feature requests & suggestions</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Common Inquiries</span>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Where is my note saved?</strong>
              All your text is saved right inside your browser device using IndexedDB. No account or cloud sync is needed.
            </div>
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Can I back up my notes before clearing browser history?</strong>
              Yes! Use the &quot;Export&quot; tool to download all your notes as a single JSON file.
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. 100% Private, Free Online Notepad.</p>
      </footer>
    </div>
  );
}
