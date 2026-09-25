import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export const metadata: Metadata = {
  title: 'Terms of Service — NoLoginNotepad',
  description:
    'Read the Terms of Service for using NoLoginNotepad. Simple, clear guidelines on permitted use, warranties, and client-side data responsibilities.',
  alternates: {
    canonical: 'https://www.nologinnotepad.com/terms',
  },
};

export default function TermsPage() {
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
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            Last Updated: September 2026 • Effective Date: September 2026
          </p>
        </div>

        <div className="prose prose-stone dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              1. Acceptance of Terms
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              By accessing and using <strong>NoLoginNotepad</strong> (&quot;the Service&quot;), accessible via <a href="https://www.nologinnotepad.com" className="underline font-medium">www.nologinnotepad.com</a>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              2. Description of Service &amp; Local Storage
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              NoLoginNotepad provides a browser-based, client-side text editor and note-taking utility that requires no user registration. All notes and configurations are saved locally on your device via browser technologies (including IndexedDB and LocalStorage).
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              Because data is kept on your device, you are responsible for maintaining your own backups using our provided JSON, TXT, or Markdown export tools. If you clear your browser cache or reset your browser profile, locally stored data may be deleted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              3. Acceptable Use
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              You agree to use the Service in compliance with all applicable local, national, and international laws and regulations. You agree not to attempt to reverse engineer, disrupt, or introduce malicious scripts or unauthorized automated load on the website infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              4. Disclaimer of Warranties
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              5. Limitation of Liability
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              IN NO EVENT SHALL NOLOGINNOTEPAD, ITS AUTHORS, OR OPERATORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF DATA, DEVICE ISSUES, OR BUSINESS INTERRUPTION) ARISING OUT OF THE USE OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              6. Modifications to Terms
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              We reserve the right to revise these Terms at any time. Changes become effective immediately upon posting to this page. Continued use of the website following any changes signifies your acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              7. Contact Us
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              For questions concerning these Terms, please reach out via our{' '}
              <Link href="/contact" className="underline font-medium text-blue-600 dark:text-blue-400">
                Contact Page
              </Link>{' '}
              or email us at <span className="font-mono text-xs">welovequizzeschannel@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 px-4 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. All rights reserved.</p>
      </footer>
    </div>
  );
}
