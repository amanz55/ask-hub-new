/**
 * Whether this deployment may be indexed by search engines.
 *
 * Only Production is indexable. Vercel Preview and Development deployments
 * carry placeholder or in-progress data on throwaway URLs, and an indexed
 * preview URL competes with the real domain in results. Off Vercel
 * (`VERCEL_ENV` unset, e.g. local `next start`) the build is treated as
 * indexable; the crawler cannot reach localhost anyway.
 */
export function isIndexable(): boolean {
  const env = process.env.VERCEL_ENV;
  return env === undefined || env === '' || env === 'production';
}

/**
 * Absolute origin for sitemap and robots.txt entries, which search engines
 * require to be fully qualified. Empty when NEXT_PUBLIC_SITE_URL is unset.
 */
export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/+$/, '');
}
