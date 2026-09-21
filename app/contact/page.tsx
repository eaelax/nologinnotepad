import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export const metadata: Metadata = {
  title: 'Contact Us — NoLoginNotepad',
  description:
    'Get in touch with the NoLoginNotepad team. We welcome your feedback, bug reports, feature suggestions, and partnership inquiries.',
  alternates: {
    canonical: 'https://nologinpad.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <AppLogo size={28} />
          <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 group-hover:opacity-80 transition">
            NoLoginNotepad
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Open Notepad</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>Support &amp; Feedback</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-400">
            Have a question, suggestion, bug report, or stationery theme idea? We would love to hear from you.
          </p>
        </div>

        {/* Contact Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Direct Email Support
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Send an email directly to our project mailbox.
              </p>
              <a
                href="mailto:welovequizzeschannel@gmail.com"
                className="inline-block mt-2 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                welovequizzeschannel@gmail.com
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400 shrink-0" />
              <span>Response time: Within 24-48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Open to feature requests &amp; suggestions</span>
            </div>
          </div>
        </div>

        {/* FAQ box */}
        <div className="p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-semibold text-sm">
            <MessageSquare className="w-4 h-4 text-stone-500" />
            <span>Common Inquiries</span>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            <div>
              <strong className="text-stone-800 dark:text-stone-200 block mb-0.5">Where is my note saved?</strong>
              All your text is saved right inside your browser device using IndexedDB. No account or cloud sync is needed.
            </div>
            <div>
              <strong className="text-stone-800 dark:text-stone-200 block mb-0.5">Can I back up my notes before clearing browser history?</strong>
              Yes! Use the &quot;Backup &amp; Export&quot; tool from the top menu to download all your notes as a single JSON file.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 px-4 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. All rights reserved.</p>
      </footer>
    </div>
  );
}
