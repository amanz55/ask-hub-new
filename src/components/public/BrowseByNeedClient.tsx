'use client';

import { useSearchParams } from 'next/navigation';
import BrowseByNeed from './BrowseByNeed';
import { parseFilters } from '@/lib/public/filters';
import type { NeedMenuEntry } from '@/lib/public/need-menu';

/**
 * The browse menu's one interactive concern: which need the directory is
 * currently filtered to, so that need's entry can show its sub-categories.
 *
 * The menu itself needs no client code -- its entries are links and its
 * markup is static. What it cannot do on the server is know the active need.
 * `src/app/(public)/page.tsx` deliberately never reads `searchParams`: doing
 * so would make `/` dynamic per request and lose the static prerender PRD
 * 12.2 depends on. So the active need is read here, in the browser, from the
 * same `useSearchParams()` and the same `parseFilters` the directory uses --
 * one parser, one source of truth, no second copy to drift.
 *
 * This is the pattern `ResourceDirectoryClient` already establishes, for the
 * same reason and with the same shape: `useSearchParams()` opts this subtree,
 * and only this subtree, out of the static prerender, and the `Suspense`
 * fallback beside it is not a spinner but the same menu rendered with no
 * active need. That fallback is real, crawlable, no-JS-safe markup: every
 * category and count is in the static HTML for `/`, and every category link
 * works without JavaScript. Only the sub-items -- which exist solely to
 * narrow a filter that is already applied -- wait for hydration.
 *
 * The entries are computed on the server and passed down rather than derived
 * here, so `buildNeedMenu` never ships to the browser and both renderings of
 * the menu are guaranteed to be listing the same thing.
 */
export default function BrowseByNeedClient({
  entries,
}: {
  entries: NeedMenuEntry[];
}) {
  const criteria = parseFilters(useSearchParams());
  return (
    <BrowseByNeed
      entries={entries}
      activeNeed={criteria.need}
      activeSubCategory={criteria.subCategory}
    />
  );
}
