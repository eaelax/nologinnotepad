import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PSEO_PAGES, ALL_PSEO_SLUGS } from '@/lib/pseo-pages';
import { NotepadClientWrapper } from '@/components/NotepadClientWrapper';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

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

  const canonicalUrl = `https://www.nologinnotepad.com/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      siteName: 'NoLoginNotepad',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.description,
    },
  };
}

export default async function PSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const page = PSEO_PAGES[slug];

  if (!page) {
    notFound();
  }

  const canonicalUrl = `https://www.nologinnotepad.com/${page.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: page.title,
        description: page.description,
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://www.nologinnotepad.com/#website',
          url: 'https://www.nologinnotepad.com',
          name: 'NoLoginNotepad',
        },
      },
      {
        '@type': 'WebApplication',
        name: page.title,
        url: canonicalUrl,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: page.keyFeatures.map((f) => f.title),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotepadClientWrapper
        initialSlug={page.slug}
        defaultPageStyle={page.defaultPageStyle}
        defaultEditorMode={page.defaultEditorMode}
        defaultSampleContent={page.defaultSampleContent}
        defaultShowWordCounter={page.defaultShowWordCounter}
        highlightOffline={page.highlightOffline}
        pageHeader={{
          badge: page.badge,
          h1: page.h1,
        }}
        infoSection={{
          heading: page.infoHeading,
          paragraphs: page.infoParagraphs,
          useCases: page.useCases,
          keyFeatures: page.keyFeatures,
        }}
      />
    </>
  );
}
