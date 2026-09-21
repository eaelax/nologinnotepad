import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PSEO_PAGES, ALL_PSEO_SLUGS } from '@/lib/seo/pseo-pages';
import {
  FileText,
  ShieldCheck,
  Zap,
  Save,
  WifiOff,
  Moon,
  Type,
  Lock,
  EyeOff,
  Code,
  FileCode,
  Sliders,
  Maximize2,
  BarChart2,
  Layout,
  Smartphone,
  CloudOff,
  HardDrive,
  AlignJustify,
  Grid,
  CircleDot,
  BookOpen,
  Layers,
  FileDigit,
  Shield,
  Edit3,
  Command,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_PSEO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = PSEO_PAGES[slug];

  if (!page) {
    return {
      title: 'Page Not Found — NoLoginNotepad',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nologinpad.com';
  const canonicalUrl = `${baseUrl}/${page.slug}`;

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.targetKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: canonicalUrl,
      siteName: 'NoLoginNotepad',
      type: 'website',
      images: [
        {
          url: '/pwa-512x512.png',
          width: 512,
          height: 512,
          alt: `${page.keyword} on NoLoginNotepad`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.metaDescription,
      images: ['/pwa-512x512.png'],
    },
  };
}

// Icon mapper helper
function renderFeatureIcon(iconName: string) {
  const props = { className: 'w-6 h-6 text-stone-700 dark:text-stone-300' };
  switch (iconName) {
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'Save':
      return <Save {...props} />;
    case 'WifiOff':
      return <WifiOff {...props} />;
    case 'Lock':
      return <Lock {...props} />;
    case 'EyeOff':
      return <EyeOff {...props} />;
    case 'Code':
      return <Code {...props} />;
    case 'FileCode':
      return <FileCode {...props} />;
    case 'Sliders':
      return <Sliders {...props} />;
    case 'Maximize2':
      return <Maximize2 {...props} />;
    case 'Moon':
      return <Moon {...props} />;
    case 'BarChart2':
      return <BarChart2 {...props} />;
    case 'Layout':
      return <Layout {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'CloudOff':
      return <CloudOff {...props} />;
    case 'HardDrive':
      return <HardDrive {...props} />;
    case 'AlignJustify':
      return <AlignJustify {...props} />;
    case 'Grid':
      return <Grid {...props} />;
    case 'CircleDot':
      return <CircleDot {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Layers':
      return <Layers {...props} />;
    case 'FileDigit':
      return <FileDigit {...props} />;
    case 'Shield':
      return <Shield {...props} />;
    case 'Edit3':
      return <Edit3 {...props} />;
    case 'Command':
      return <Command {...props} />;
    case 'CheckCircle':
      return <CheckCircle {...props} />;
    case 'Type':
      return <Type {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    default:
      return <FileText {...props} />;
  }
}

export default async function PSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const page = PSEO_PAGES[slug];

  if (!page) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nologinpad.com';
  const canonicalUrl = `${baseUrl}/${page.slug}`;

  // Schema.org JSON-LD data specifically crafted for this keyword target
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: page.title,
        description: page.metaDescription,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          url: baseUrl,
          name: 'NoLoginNotepad',
        },
      },
      {
        '@type': 'WebApplication',
        name: `NoLoginNotepad — ${page.keyword}`,
        url: canonicalUrl,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: page.features.map((f) => f.title),
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Header */}
      <header
        id="pseo-header"
        className="w-full border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            id="brand-home-link"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
            title="Open NoLoginNotepad"
          >
            <AppLogo size={32} />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg leading-tight text-stone-900 dark:text-stone-100">
                NoLoginNotepad
              </span>
              <span className="text-[11px] font-medium tracking-wide text-stone-500 dark:text-stone-400">
                100% Private Notepad
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              id="cta-open-editor-nav"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <span>Open Notepad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section id="hero-section" className="py-16 sm:py-24 px-4 sm:px-6 border-b border-stone-200 dark:border-stone-800 bg-gradient-to-b from-stone-100/60 to-transparent dark:from-stone-900/40">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>No Login &bull; Zero Registration &bull; 100% Free</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-stone-950 dark:text-white">
              {page.headline}
            </h1>

            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
              {page.subheadline}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                id="cta-launch-main"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                <span>Launch Notepad Online</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                id="btn-view-features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-base hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Instant Auto-Save</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>IndexedDB Storage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Works 100% Offline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Designed for Speed, Simplicity, and Privacy
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-base">
              Everything you need to write comfortably without bloat, accounts, or privacy compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {page.features.map((feat, idx) => (
              <div
                key={idx}
                id={`feature-card-${idx}`}
                className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-sm space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  {renderFeatureIcon(feat.iconName)}
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {feat.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* In-depth Content Sections for High Search Engine Ranking */}
        {page.contentSections && page.contentSections.length > 0 && (
          <section id="editorial-content" className="py-12 sm:py-16 px-4 sm:px-6 bg-stone-100/50 dark:bg-stone-900/30 border-y border-stone-200 dark:border-stone-800">
            <div className="max-w-3xl mx-auto space-y-10">
              {page.contentSections.map((sec, idx) => (
                <article key={idx} className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {sec.heading}
                  </h2>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-stone-600 dark:text-stone-400 leading-relaxed text-base sm:text-lg"
                    >
                      {p}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Frequently Asked Questions (FAQ) */}
        {page.faqs && page.faqs.length > 0 && (
          <section id="faqs" className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Frequently Asked Questions
              </h2>
              <p className="text-stone-600 dark:text-stone-400 text-base">
                Everything you need to know about using {page.keyword}.
              </p>
            </div>

            <div className="space-y-4">
              {page.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  id={`faq-item-${idx}`}
                  className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 shadow-sm space-y-2"
                >
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {faq.question}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Banner */}
        <section className="py-16 px-4 sm:px-6 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Writing Right Now
            </h2>
            <p className="text-stone-300 dark:text-stone-600 text-base sm:text-lg max-w-xl mx-auto">
              No forms. No passwords. No cloud trackers. Experience the pure joy of typing in a private browser notepad.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                id="cta-bottom-start"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-50 font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                <span>Open {page.keyword}</span>
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Cross-Links to all Programmatic SEO Pages */}
      <footer
        id="pseo-footer"
        className="w-full border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-12 px-4 sm:px-6 text-sm"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AppLogo size={24} />
              <span className="font-bold text-stone-900 dark:text-stone-100">
                NoLoginNotepad
              </span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Zero login &bull; 100% client-side IndexedDB &bull; Progressive Web App
            </div>
          </div>

          <div className="border-t border-stone-100 dark:border-stone-900 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4">
              Online Notepad Tools & Topics
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {ALL_PSEO_SLUGS.map((slugKey) => {
                const item = PSEO_PAGES[slugKey];
                const isActive = slugKey === slug;
                return (
                  <Link
                    key={slugKey}
                    href={`/${slugKey}`}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {item.keyword}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 dark:text-stone-500 pt-4">
            <span>&copy; {new Date().getFullYear()} NoLoginNotepad. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:underline">
                Home Notepad
              </Link>
              <Link href="/notepad.html" className="hover:underline">
                Notepad (.html)
              </Link>
              <Link href="/sitemap.xml" className="hover:underline">
                Sitemap
              </Link>
              <Link href="/robots.txt" className="hover:underline">
                Robots.txt
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
