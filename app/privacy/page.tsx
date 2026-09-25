import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export const metadata: Metadata = {
  title: 'Privacy Policy — NoLoginNotepad',
  description:
    'Read our privacy policy. NoLoginNotepad operates on a local-first client architecture with zero server-side storage of user notes, plus third-party advertising disclosures.',
  alternates: {
    canonical: 'https://www.nologinnotepad.com/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500">
            Last Updated: September 2026 • Effective Date: September 2026
          </p>
        </div>

        <div className="prose prose-stone dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              1. Overview & Local-First Architecture
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              At <strong>NoLoginNotepad</strong> (accessible from <a href="https://www.nologinnotepad.com" className="underline font-medium">www.nologinnotepad.com</a>), your privacy is our top priority. Unlike conventional online word processors and cloud notepad applications, NoLoginNotepad is engineered with a <strong>local-first, zero-account client architecture</strong>.
            </p>
            <p className="text-stone-600 dark:text-stone-300">
              We do not ask for your name, email address, password, or credit card. We do not transmit, analyze, or store any of the notes, texts, or documents you write on remote servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              2. Data Storage on Your Device (IndexedDB & LocalStorage)
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              When you write or edit a note, all information is stored directly inside your browser’s local sandbox storage using <strong>IndexedDB</strong> and <strong>LocalStorage</strong> APIs. This data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600 dark:text-stone-300">
              <li>Remains strictly on your physical machine or device.</li>
              <li>Is never transmitted across the network to our servers or third parties.</li>
              <li>Can be exported anytime by you as JSON, TXT, or Markdown (.md).</li>
              <li>Can be permanently wiped at any time using our built-in &quot;Delete All Notes &amp; Settings&quot; feature or by clearing your browser cache.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              3. Cookies and Advertising Disclosures (Google AdSense)
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Third-party vendors, including <strong>Google</strong>, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites across the Internet:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600 dark:text-stone-300">
              <li>
                <strong>Google&apos;s advertising cookies</strong> enable it and its partners to serve ads to users based on their visits to this site and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium text-blue-600 dark:text-blue-400"
                >
                  Google Ads Settings
                </a>.
              </li>
              <li>
                Alternatively, users can opt out of third-party vendor use of cookies for personalized advertising by visiting{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium text-blue-600 dark:text-blue-400"
                >
                  aboutads.info
                </a>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              4. Log Files and Standard Web Requests
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Like all standard web servers and Content Delivery Networks (such as Cloudflare), standard HTTP server logs are generated when resources (like images, scripts, and CSS) are fetched. These logs include Internet Protocol (IP) addresses, browser user-agents, referring pages, and access timestamps. These logs are used purely for security mitigation (such as DDoS prevention) and do not contain or associate with your note content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              5. GDPR &amp; CCPA Compliance
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Under the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), users have rights regarding personal information. Because NoLoginNotepad does not collect, sell, or retain personal identifiers, your data sovereignty is naturally upheld:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600 dark:text-stone-300">
              <li><strong>Right to Access &amp; Portability:</strong> You can download all your stored data via JSON export at any time.</li>
              <li><strong>Right to Erasure:</strong> You can purge all stored data in one click via the Settings menu or browser settings.</li>
              <li><strong>We Do Not Sell Personal Information:</strong> We do not broker, trade, or monetize user note contents.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              6. Children&apos;s Information (COPPA)
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              We do not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child provided personal information on our website, please contact us immediately so we can take appropriate measures.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              7. Contact Information
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              If you have any questions or require more information about our Privacy Policy, please reach out via our{' '}
              <Link href="/contact" className="underline font-medium text-blue-600 dark:text-blue-400">
                Contact Page
              </Link>{' '}
              or by email at <span className="font-mono text-xs">welovequizzeschannel@gmail.com</span>.
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
