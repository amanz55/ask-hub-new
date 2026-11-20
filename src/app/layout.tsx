import type { Metadata } from 'next';
import './globals.css';
import { t } from '@/lib/i18n';
import { isIndexable } from '@/lib/indexing';

export const metadata: Metadata = {
  // From the locale file, not inline: <title> and <meta description> are
  // user-facing. SP1 Task 2 adds the self-hosted Outfit preload below.
  title: t('site.name'),
  description: t('site.tagline'),
  // Production is indexable; Preview and Development deployments are not
  // (see src/lib/indexing.ts). The admin layout overrides this to noindex.
  robots: isIndexable()
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Self-hosted Outfit (SP1 Task 2): preloaded to protect LCP since
            it is the body font. Self-hosted rather than loaded from
            Google's font CDN, to keep that round trip off the critical
            rendering path — see globals.css and the design doc. */}
        <link
          rel="preload"
          href="/fonts/outfit-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
