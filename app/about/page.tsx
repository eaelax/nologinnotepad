import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, HardDrive, WifiOff, Lock, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export const metadata: Metadata = {
  title: 'About Us — NoLoginNotepad | The Privacy-First Free Online Notepad',
  description:
    'Learn about NoLoginNotepad, our mission for zero-friction private writing, our local-first client architecture using IndexedDB, and why we never store your data.',
  alternates: {
    canonical: 'https://www.nologinnotepad.com/about',
  },
};

export default function AboutPage() {
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hero */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Shield className="w-3.5 h-3.5" />
            <span>Independent & Privacy-First</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About NoLoginNotepad
          </h1>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
            We built NoLoginNotepad because taking a quick note on the web shouldn’t require handing over your email address, creating passwords, or waiting for verification codes.
          </p>
        </section>

        {/* Mission */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Our Core Mission
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            Most modern note-taking platforms have become cluttered with complex dashboards, paywalls, and aggressive telemetry tracking. Whenever you need to jot down a phone number, draft an email, paste a code snippet, or brainstorm in private, you are confronted with a login gate.
          </p>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            <strong>NoLoginNotepad</strong> removes every barrier. When you visit the site, the cursor is ready, the paper is clean, and your keystrokes are saved immediately to your browser’s local storage.
          </p>
        </section>

        {/* Pillars Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Local-First Storage (IndexedDB)</h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Your notes never leave your personal computer, tablet, or phone. All notes, drafting revisions, and display preferences are stored locally in client-side IndexedDB.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Sub-Second Speed</h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Because there are no server roundtrips required for writing, typing latency is less than 16 milliseconds. Every keystroke is debounced and preserved smoothly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Full Offline & PWA Support</h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Equipped with a modern Progressive Web App Service Worker. You can use it in airplanes, underground subways, or during internet outages without missing a beat.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">Zero Server-Side Liability</h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              We do not maintain databases of user credentials or confidential text. In an era of rampant database breaches, your words stay strictly on your own hardware.
            </p>
          </div>
        </section>

        {/* Commitment */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Our Commitment to Open, Accessible Web Tools
          </h2>
          <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>No Forced Subscriptions:</strong> Free for students, writers, developers, and professionals.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Easy Data Portability:</strong> Export individual notes or full JSON backups anytime with zero lock-in.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Total Data Cleanout:</strong> A built-in one-click factory reset completely wipes all IndexedDB and LocalStorage data upon request.</span>
            </li>
          </ul>
        </section>

        {/* Contact CTA */}
        <section className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Have questions or suggestions?</h3>
            <p className="text-xs text-stone-500">We welcome feedback, bug reports, and stationery style requests.</p>
          </div>
          <Link
            href="/contact"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 transition"
          >
            Contact Team
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 px-4 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. Built with care for distraction-free writing.</p>
      </footer>
    </div>
  );
}
