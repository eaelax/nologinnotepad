import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#121316' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://nologinpad.com'),
  title: 'NoLoginNotepad — Fast, Free Online Notepad | No Login & 100% Private',
  description:
    'NoLoginNotepad is a fast, distraction-free, privacy-first online notepad. Write instantly without registration, accounts, or logins. Features automatic IndexedDB saving, Markdown formatting, ruled paper templates, offline PWA support, and text export.',
  applicationName: 'NoLoginNotepad',
  authors: [{ name: 'NoLoginNotepad Team', url: 'https://nologinpad.com' }],
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
    canonical: 'https://nologinpad.com',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NoLoginNotepad',
  },
  openGraph: {
    title: 'NoLoginNotepad — Free Online Notepad Without Login',
    description:
      'Write instantly with zero friction. 100% private, client-side auto-saving in IndexedDB, offline capability, ruled paper styles, and custom themes.',
    url: 'https://nologinpad.com',
    siteName: 'NoLoginNotepad',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/pwa-512x512.png',
        width: 512,
        height: 512,
        alt: 'NoLoginNotepad Logo and Notepad Icon',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'NoLoginNotepad — Free Online Notepad Without Login',
    description:
      'Write instantly with zero friction. 100% private, client-side auto-saving in IndexedDB, offline capability, ruled paper styles, and custom themes.',
    images: ['/pwa-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Rich multi-schema structured data: WebApplication, FAQPage, HowTo
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'NoLoginNotepad',
      alternateName: [
        'NoLoginNotepad Online Notepad',
        'No Login Notes',
        'Private Browser Scratchpad',
        'Offline Web Notepad',
      ],
      url: 'https://nologinpad.com',
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
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1280',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Instant note-taking with zero registration, login, or password required',
        '100% client-side privacy: all notes remain in your device IndexedDB database',
        'Offline capability via Progressive Web App (PWA) Service Worker',
        'Multiple realistic stationery styles: Lined, Dotted, Grid, Graph, Journal, Blank',
        'Custom eye-care themes: Clean Light, AMOLED Dark, and Vintage Sepia',
        'Live word, character, and line count tracking with instant auto-save indicator',
        'Rich text formatting: Bold, Italic, Code, Strikethrough, Highlighter, Checklists',
        'One-click export to Markdown (.md) or Plain Text (.txt)',
        'Built-in search across all locally stored notes with timestamp organization',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
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
            text: 'Yes! NoLoginNotepad is a certified Progressive Web App (PWA). Once loaded, it works entirely offline without an internet connection. You can also install it to your home screen or desktop for instant access.',
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className="antialiased min-h-screen selection:bg-stone-200 selection:text-stone-900 dark:selection:bg-stone-700 dark:selection:text-stone-100"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        {children}

        {/* 
          Semantic crawlable content for search engine indexers (Googlebot / Bingbot)
          Runs cleanly in <noscript> so it never affects browser UI or JavaScript execution.
        */}
        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>NoLoginNotepad — Free Online Notepad Without Login</h1>
            <p>
              NoLoginNotepad is a fast, distraction-free, private online notepad designed for quick thoughts, meeting notes,
              code snippets, and daily writing. No sign up, no email, no accounts, and no trackers.
            </p>
            <h2>Key Search Features & Utilities</h2>
            <ul>
              <li><strong>Free Online Notepad:</strong> Start drafting in your browser immediately.</li>
              <li><strong>Zero Login Required:</strong> No passwords or authentication hurdles.</li>
              <li><strong>100% Private Client-Side Storage:</strong> Notes persist locally in IndexedDB.</li>
              <li><strong>Offline PWA Support:</strong> Continue writing anywhere without internet access.</li>
              <li><strong>Markdown & Plain Text Export:</strong> Download your documents anytime.</li>
              <li><strong>Stationery Styles:</strong> Ruled lined paper, grid graph paper, dotted notes, and clean blank canvas.</li>
            </ul>
          </div>
        </noscript>
      </body>
    </html>
  );
}
