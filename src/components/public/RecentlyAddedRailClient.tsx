'use client';

import { useSearchParams } from 'next/navigation';
import RecentlyAddedRail from './RecentlyAddedRail';
import { dropUnknownSubCategory, parseFilters } from '@/lib/public/filters';
import { subCategoriesFor } from '@/lib/public/need-menu';
import type { PublicResource } from '@/lib/public/types';

/**
 * The rail's one interactive concern: which category is selected, read from the
 * same URL and parser the browse menu and directory use. The same shape as
 * `BrowseByNeedClient`, for the same reason: `page.tsx` must not read
 * `searchParams`, so the `Suspense` fallback beside this is the rail with
 * nothing selected, which is real content for a crawler or a no-JS visitor.
 */
export default function RecentlyAddedRailClient({ resources }: { resources: PublicResource[] }) {
  const parsed = parseFilters(useSearchParams());
  const offered = parsed.need
    ? subCategoriesFor(resources, parsed.need).map((sub) => sub.label)
    : [];
  const { need, subCategory } = dropUnknownSubCategory(parsed, offered);

  return <RecentlyAddedRail resources={resources} need={need} subCategory={subCategory} />;
}
