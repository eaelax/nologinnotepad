import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F7F9' },
    { media: '(prefers-color-scheme: dark)', color: '#090B10' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nologinnotepad.com'),
  title: 'NoLoginNotepad — Fast, Free Online Notepad | No Login & 100% Private',
  description:
    'NoLoginNotepad — A fast, distraction-free, privacy-focused online notepad with instant local IndexedDB auto-saving, Markdown support, and offline capabilities without any login.',
  applicationName: 'NoLoginNotepad',
  authors: [{ name: 'NoLoginNotepad Team', url: 'https://www.nologinnotepad.com' }],
  generator: 'Next.js',
  keywords: [
    'online notepad',
    'free online notepad',
    'notepad without login',
    'no login notes',
    'private online notepad',
    'quick notes browser',
    'offline notepad',
    'distraction free text editor',
    'markdown notepad online',
    'scratchpad online',
    'instant notepad',
    'anonymous notepad',
    'no sign up note taker',
    'browser text editor autosave',
    'indexeddb notepad',
    'secure browser notes',
    'minimalist notepad web',
    'plain text scratchpad',
  ],
  alternates: {
    canonical: 'https://www.nologinnotepad.com/',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NoLoginNotepad',
  },
  openGraph: {
    title: 'NoLoginNotepad — Fast, Free Online Notepad | No Login & 100% Private',
    description:
      'NoLoginNotepad — A fast, distraction-free, privacy-focused online notepad with instant local IndexedDB auto-saving, Markdown support, and offline capabilities without any login.',
    url: 'https://www.nologinnotepad.com',
    siteName: 'NoLoginNotepad',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NoLoginNotepad — Fast, Free Online Notepad | No Login & 100% Private',
    description:
      'NoLoginNotepad — A fast, distraction-free, privacy-focused online notepad with instant local IndexedDB auto-saving, Markdown support, and offline capabilities without any login.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': 'https://www.nologinnotepad.com/#webapp',
      name: 'NoLoginNotepad',
      alternateName: [
        'NoLoginNotepad Online Notepad',
        'No Login Notes',
        'Private Browser Scratchpad',
        'Offline Web Notepad',
      ],
      url: 'https://www.nologinnotepad.com',
      description:
        'Fast, distraction-free, 100% private online notepad. Start writing instantly without sign-up, accounts, or cookies. Equipped with local IndexedDB autosaving, realistic notebook paper themes, Markdown styling, and offline PWA capability.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'All (Windows, macOS, Linux, iOS, Android, ChromeOS)',
      browserRequirements: 'Requires modern web browser with HTML5 & JavaScript enabled',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Instant note-taking with zero registration, login, or password required',
        '100% client-side privacy: all notes remain in your device IndexedDB database',
        'Offline capability via Progressive Web App (PWA) Service Worker',
        'Multiple realistic stationery styles: Lined, Dotted, Grid, Graph, Journal, Blank',
        'Custom eye-care themes: Clean Light and Dark Mode',
        'Live word, character, and line count tracking with instant auto-save indicator',
        'Rich text formatting: Bold, Italic, Code, Strikethrough, Highlighter, Checklists',
        'One-click export to Markdown (.md) or Plain Text (.txt)',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://www.nologinnotepad.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do I need to create an account or login to use NoLoginNotepad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. NoLoginNotepad requires absolutely zero account creation, email sign-up, passwords, or logins. You can open the website and begin typing immediately.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where are my notes stored?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All your notes are stored locally in your browser using high-performance IndexedDB and LocalStorage. Your data never leaves your computer or phone and is never sent to any external server or third-party database.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does NoLoginNotepad work offline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! NoLoginNotepad is a certified Progressive Web App (PWA). Once loaded, it works entirely offline without an internet connection.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save or download my notes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Notes are saved automatically after every keystroke. You can also export any note to a Markdown (.md) file or plain text (.txt) file at any time by clicking the Export button.',
          },
        },
      ],
    },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Baloo+2:wght@400;600;700&family=Caveat:wght@400;600;700&family=Comic+Relief&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Geist+Mono:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&family=Jua&family=Merriweather+Sans:wght@400;600;700&family=PT+Mono&family=Patrick+Hand&family=Roboto+Slab:wght@400;600;700&family=Roboto:wght@300;400;500;700&family=Rubik:ital,wght@0,300..900;1,300..900&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;600;700&family=Almarai:wght@300;400;700;800&family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&family=Beiruti:wght@300;400;600;700&family=Cairo:wght@300;400;600;700&family=Lateef:wght@400;700&family=Mirza:wght@400;600;700&family=Noto+Kufi+Arabic:wght@300;400;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Sans+Arabic:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('notepad_preferences')||localStorage.getItem('nologinnotepad_preferences');var t=null;if(p){var j=JSON.parse(p);if(j&&j.theme)t=j.theme;}if(!t){t='light';}var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='dark'){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-100 max-w-[2000px] mx-auto w-full box-border relative"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        {children}

        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>NoLoginNotepad — Free Online Notepad Without Login</h1>
            <p>
              NoLoginNotepad is a fast, distraction-free, private online notepad designed for quick thoughts, meeting notes,
              code snippets, and daily writing. No sign up, no email, no accounts, and no trackers.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
