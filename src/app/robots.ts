import type { MetadataRoute } from 'next';
import { isIndexable, siteOrigin } from '@/lib/indexing';

/**
 * robots.txt. Production allows the public surface and keeps crawlers out of
 * the admin portal and the API. Every other environment disallows everything,
 * matching the X-Robots-Tag header next.config.ts sends there.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  const origin = siteOrigin();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    ...(origin ? { sitemap: `${origin}/sitemap.xml`, host: origin } : {}),
  };
}
