import type { MetadataRoute } from 'next';
import { isIndexable, siteOrigin } from '@/lib/indexing';
import { listPublicResources } from '@/lib/public/readers';

/**
 * sitemap.xml, regenerated hourly so resources published or auto-closed in
 * the admin portal appear or drop out without a rebuild.
 *
 * Closed resources are left out: a past deadline removes a resource from the
 * public listings, and the sitemap is one. Their detail pages still resolve
 * for shared links, they are just not advertised. `/impact` is left out while
 * `feature_public_impact_page` is off at launch, because it returns 404.
 */
export const revalidate = 3600;

const STATIC_PATHS = ['/', '/contact', '/privacy', '/terms'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable()) return [];
  const origin = siteOrigin();
  const resources = await listPublicResources();

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${origin}${path}` })),
    ...resources
      .filter((resource) => !resource.isClosed)
      .map((resource) => ({ url: `${origin}/resources/${resource.id}` })),
  ];
}
