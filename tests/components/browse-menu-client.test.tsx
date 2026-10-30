// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BrowseByNeedClient from '@/components/public/BrowseByNeedClient';
import type { NeedMenuEntry } from '@/lib/public/need-menu';

const params = { current: new URLSearchParams() };
vi.mock('next/navigation', () => ({ useSearchParams: () => params.current }));

afterEach(cleanup);

const entries: NeedMenuEntry[] = [
  { need: 'compute', liveCount: 4, subCategories: [{ label: 'Cloud credits', liveCount: 2 }], moreSubCategories: [] },
  { need: 'training', liveCount: 3, subCategories: [{ label: 'Curriculum', liveCount: 1 }], moreSubCategories: [] },
];

/**
 * The one link in the browse menu that `bands.test.tsx` cannot reach: the
 * step from the URL to the `activeNeed` prop.
 *
 * `BrowseByNeed` is tested against an `activeNeed` handed to it, so every
 * assertion there stays green if this wrapper passes the wrong thing -- or
 * always passes `null`, which is exactly what the untested version of this
 * component would look like from the outside. The whole feature (sub-items
 * appear under the need the directory is filtered to) lives in this join.
 */
describe('the browse menu reading the URL', () => {
  it('expands the need the URL is filtered to', () => {
    params.current = new URLSearchParams('need=training');
    render(<BrowseByNeedClient entries={entries} />);
    expect(screen.getByRole('link', { name: /Curriculum/ })).toBeDefined();
    expect(screen.queryByRole('link', { name: /Cloud credits/ })).toBeNull();
  });

  it('marks the sub-category the URL is filtered to', () => {
    params.current = new URLSearchParams('need=training&sub=Curriculum');
    render(<BrowseByNeedClient entries={entries} />);
    expect(screen.getByRole('link', { name: /Curriculum/ }).getAttribute('aria-current')).toBe('true');
  });

  it('expands nothing when no need is filtered', () => {
    params.current = new URLSearchParams('q=grants');
    render(<BrowseByNeedClient entries={entries} />);
    expect(screen.queryByRole('link', { name: /Curriculum/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Cloud credits/ })).toBeNull();
  });

  it('expands nothing for a need value the app does not recognise', () => {
    // parseFilters rejects an unknown value rather than honouring it, so a
    // hand-edited or stale link cannot open a category that is not there.
    params.current = new URLSearchParams('need=mentorship');
    render(<BrowseByNeedClient entries={entries} />);
    expect(screen.queryByRole('link', { name: /Curriculum/ })).toBeNull();
    // 'Courses' since this release renamed the training category.
    expect(screen.getAllByRole('link', { name: /Courses/ })).toHaveLength(1);
  });
});
