import type { ReactNode } from 'react';
import { t } from '@/lib/i18n';
import ResourceCard from './ResourceCard';
import type { PublicResource } from '@/lib/public/types';

/**
 * The directory's outer measure, from the prototype's directory screen
 * (the approved prototype): 1180px, not the 1280px the
 * storefront above it uses. Exported because the server-rendered fallback and
 * the hydrated client directory must be identical down to the padding -- they
 * swap places on hydration, and any difference shows up as the page jumping.
 * One definition is what makes that impossible rather than merely unlikely.
 */
export const DIRECTORY_SECTION = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '44px 32px 80px 32px',
} as const;

/** The directory's h1: */
export const DIRECTORY_HEADING = {
  margin: 0,
  fontSize: 32,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#1A2332',
} as const;

/**
 * The card grid and its two data-driven empty states. Shared by the
 * server-rendered fallback (always unfiltered, so `resources` and `allCount`
 * are the same length) and the client directory (filtered, so they can
 * differ) -- one place for the grid markup and the empty-state copy so the
 * two renderers cannot drift apart.
 *
 * Deliberately has no `'use client'` directive and no hooks: it is plain
 * presentation over props, so it is equally valid to render from a Server
 * Component and from a Client Component.
 *
 * The grid is `auto-fill` over a 290px minimum rather than the prototype's
 * fixed three columns. At the directory's 1180px measure that resolves to the
 * same three, and it is what lets the grid reflow to two and then one instead
 * of forcing a horizontal scrollbar on a narrow screen -- which the fixed
 * version does, and which PRD 5.8 ("fully mobile-responsive at every
 * breakpoint") rules out.
 *
 * The empty states take the prototype's dashed panel but not its "Clear all
 * filters" button: the removable chips and the Clear filters control already
 * sit directly above this. The caller supplies specific next steps instead.
 */
export default function ResourceGrid({
  resources,
  allCount,
  emptyContent = null,
}: {
  resources: readonly PublicResource[];
  allCount: number;
  /** What to say when nothing matched, for a caller that knows why. */
  emptyContent?: ReactNode;
}) {
  // Three empty cases exist across the two callers, deliberately distinct.
  // Telling someone to remove a filter when they have not set one is worse
  // than saying nothing -- so "nothing live at all" and "nothing after
  // filtering" stay two different messages, never collapsed into one.
  if (allCount === 0) {
    return (
      <div style={EMPTY_PANEL}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{t('directory.emptyAll')}</div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div style={EMPTY_PANEL}>
        {emptyContent ?? (
          <div style={{ fontSize: 16, fontWeight: 800 }}>{t('directory.emptyFiltered')}</div>
        )}
      </div>
    );
  }

  return (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: 20,
        marginTop: 14,
        listStyle: 'none',
        padding: 0,
      }}
    >
      {resources.map((resource) => (
        <li key={resource.id} style={{ display: 'flex' }}>
          <ResourceCard resource={resource} />
        </li>
      ))}
    </ul>
  );
}

const EMPTY_PANEL = {
  marginTop: 30,
  border: '1px dashed #C9D3E8',
  borderRadius: 14,
  padding: 44,
  textAlign: 'center',
} as const;
