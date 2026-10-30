import { describe, it, expect } from 'vitest';
import {
  buildNeedMenu,
  MAX_SUB_CATEGORIES,
  type NeedMenuEntry,
} from '@/lib/public/need-menu';
import { NEED_KEYS } from '@/lib/reference';
import type { NeedCount, PublicResource } from '@/lib/public/types';

/**
 * `buildNeedMenu` is the whole of the browse menu's logic: the component that
 * renders it holds none. Every rule the prototype's `deptMenu` encodes
 * (the approved prototype) is asserted here, and each
 * assertion is built so that deleting the clause it covers fails it -- a test
 * that still passes with the rule removed is not testing the rule.
 */

const resource = (over: Partial<PublicResource> & Pick<PublicResource, 'id'>): PublicResource => ({
  name: 'A resource',
  partnerName: 'Partner',
  partnerLogoUrl: null,
  partnerWebsiteUrl: null,
  partnerTier: 'strategic',
  resourceType: null,
  needPrimary: 'compute',
  needSecondary: null,
  subCategory: null,
  description: null,
  actionLabel: null,
  externalUrl: null,
  bannerImageUrl: null,
  countriesEligible: [],
  sectorsEligible: [],
  stagesEligible: [],
  geoScope: 'global',
  deadline: null,
  isFeatured: false,
  exclusivity: null,
  sortOrder: 0,
  addedDate: '2026-01-01',
  isClosed: false,
  daysLeft: null,
  ...over,
});

const count = (need: NeedCount['need'], liveCount: number): NeedCount => ({ need, liveCount });

/**
 * The entry for one need. Every need renders now, so a test cannot reach the
 * one it is about by position.
 */
const only = (menu: NeedMenuEntry[], need: NeedCount['need']) => {
  const entry = menu.find((e) => e.need === need);
  if (!entry) throw new Error(`no menu entry for ${need}`);
  return entry;
};

const labelsOf = (menu: NeedMenuEntry[], need: NeedCount['need']) =>
  only(menu, need).subCategories.map((c) => c.label);

describe('which entries exist', () => {
  it('shows a need with nothing live as a zero rather than dropping it', () => {
    // The menu states what the directory covers, not what happens to be
    // published today, so an empty category is an honest zero rather than a
    // silent omission. A need missing from `counts` entirely is the same
    // thing: Postgres counted live rows and found none.
    const menu = buildNeedMenu(
      [count('compute', 3), count('funding', 0), count('accelerator', 1)],
      [],
    );
    expect(only(menu, 'funding').liveCount).toBe(0);
    expect(only(menu, 'community').liveCount).toBe(0);
    expect(only(menu, 'compute').liveCount).toBe(3);
  });

  it('imposes the browse order, whatever order it is given', () => {
    // This inverts an earlier rule. The menu used to pass through whatever
    // order listNeedCounts returned; the client now positions the release
    // around a stated sequence, so the builder owns it. Ordering by live
    // count would reproduce today's mockup and then rearrange itself the
    // next time something is published.
    //
    // The input is scrambled on purpose: canonical input passes through any
    // ordering that happens to agree with it.
    const menu = buildNeedMenu(
      [
        count('accelerator', 1), count('community', 2), count('compute', 3),
        count('data', 4), count('training', 5), count('challenges', 6), count('funding', 7),
      ],
      [],
    );
    expect(menu.map((e) => e.need)).toEqual([
      'training',
      'compute',
      'funding',
      'accelerator',
      'data',
      'challenges',
      'community',
    ]);
  });

  it('offers every need the product has, and no other', () => {
    // A menu missing a category understates what the directory covers, and
    // one listing a category the enum no longer has (partners, dropped in
    // 0026) would link to an empty filter. The count going in proves an
    // entry carries real data rather than a placeholder.
    const menu = buildNeedMenu([count('community', 3), count('compute', 1)], []);
    expect([...menu.map((e) => e.need)].sort()).toEqual([...NEED_KEYS].sort());
    expect(only(menu, 'community').liveCount).toBe(3);
  });

  it('takes the count from need_counts_public and never recomputes it', () => {
    // The count is a `count(*) where status = 'live'` from Postgres. The
    // resource list passed alongside it is whatever the page happened to
    // fetch, and the two are deliberately not the same query. Here they
    // disagree on purpose: one matching row against a count of 9. A build
    // that counted the rows would say 1.
    const menu = buildNeedMenu(
      [count('compute', 9)],
      [resource({ id: 'a', needPrimary: 'compute' })],
    );
    expect(only(menu, 'compute').liveCount).toBe(9);
  });
});

describe('which sub-categories an entry carries', () => {
  it('collects them from the need\'s live resources, in first-appearance order', () => {
    // The expected order is not alphabetical (Curriculum would come first),
    // so a sort slipped into the builder fails this.
    const menu = buildNeedMenu(
      [count('training', 3)],
      [
        resource({ id: 'a', needPrimary: 'training', subCategory: 'Training pathway' }),
        resource({ id: 'b', needPrimary: 'training', subCategory: 'Curriculum' }),
      ],
    );
    expect(labelsOf(menu, 'training')).toEqual(['Training pathway', 'Curriculum']);
  });

  it('counts a resource filed under the need as its secondary, not only its primary', () => {
    // filterResources matches on either slot, so the menu must too: a
    // sub-item the menu refused to list would still be reachable by typing
    // the phrase into search, and one it listed on primary-only reasoning
    // would under-report the category. The compute row exists to prove the
    // secondary row is not simply being swept in by a missing need check.
    const menu = buildNeedMenu(
      [count('training', 2)],
      [
        resource({
          id: 'a',
          needPrimary: 'accelerator',
          needSecondary: 'training',
          subCategory: 'Startup programme',
        }),
        resource({ id: 'b', needPrimary: 'compute', subCategory: 'Cloud credits' }),
      ],
    );
    expect(labelsOf(menu, 'training')).toEqual(['Startup programme']);
  });

  it('lists a repeated sub-category once, and counts both rows', () => {
    const menu = buildNeedMenu(
      [count('compute', 2)],
      [
        resource({ id: 'a', needPrimary: 'compute', subCategory: 'Cloud credits' }),
        resource({ id: 'b', needPrimary: 'compute', subCategory: 'Cloud credits' }),
      ],
    );
    expect(only(menu, 'compute').subCategories).toEqual([
      { label: 'Cloud credits', liveCount: 2 },
    ]);
  });

  it('skips null, empty and whitespace-only values, and trims what it keeps', () => {
    // sub_category is free text with no NOT NULL and no trim constraint, so
    // all three of these are rows the admin form can really produce. A
    // sub-item labelled '' or '  ' is a click target nobody can see or read.
    const menu = buildNeedMenu(
      [count('compute', 4)],
      [
        resource({ id: 'a', needPrimary: 'compute', subCategory: null }),
        resource({ id: 'b', needPrimary: 'compute', subCategory: '' }),
        resource({ id: 'c', needPrimary: 'compute', subCategory: '   ' }),
        resource({ id: 'd', needPrimary: 'compute', subCategory: '  HPC allocation  ' }),
      ],
    );
    expect(labelsOf(menu, 'compute')).toEqual(['HPC allocation']);
  });

  it('treats a trimmed duplicate as the same sub-category', () => {
    // Trimming after the distinctness check would list 'Grants' twice.
    const menu = buildNeedMenu(
      [count('funding', 2)],
      [
        resource({ id: 'a', needPrimary: 'funding', subCategory: 'Grants' }),
        resource({ id: 'b', needPrimary: 'funding', subCategory: ' Grants ' }),
      ],
    );
    expect(only(menu, 'funding').subCategories).toEqual([{ label: 'Grants', liveCount: 2 }]);
  });

  it(`stops at ${MAX_SUB_CATEGORIES}, keeping the first ones`, () => {
    const menu = buildNeedMenu(
      [count('funding', 5)],
      ['Grants', 'Corporate VC', 'Grant fund', 'Early-stage capital', 'Prize'].map(
        (subCategory, i) =>
          resource({ id: `r${i}`, needPrimary: 'funding', subCategory }),
      ),
    );
    expect(only(menu, 'funding').subCategories).toHaveLength(MAX_SUB_CATEGORIES);
    expect(labelsOf(menu, 'funding')).not.toContain('Prize');
  });

  it('counts only the rows carrying that label, not the need\u2019s whole set', () => {
    // The tally must be per label, not the entry's own count copied down.
    // Distinct expected numbers (2 and 1) against a need count of 7 mean no
    // single wrong source of truth satisfies this.
    const menu = buildNeedMenu(
      [count('compute', 7)],
      [
        resource({ id: 'a', needPrimary: 'compute', subCategory: 'Cloud credits' }),
        resource({ id: 'b', needPrimary: 'compute', subCategory: 'Cloud credits' }),
        resource({ id: 'c', needPrimary: 'compute', subCategory: 'HPC allocation' }),
        resource({ id: 'd', needPrimary: 'compute', subCategory: null }),
      ],
    );
    expect(only(menu, 'compute').subCategories).toEqual([
      { label: 'Cloud credits', liveCount: 2 },
      { label: 'HPC allocation', liveCount: 1 },
    ]);
  });

  it('counts a row that reaches the need through its secondary slot', () => {
    const menu = buildNeedMenu(
      [count('training', 2)],
      [
        resource({ id: 'a', needPrimary: 'training', subCategory: 'Curriculum' }),
        resource({
          id: 'b',
          needPrimary: 'accelerator',
          needSecondary: 'training',
          subCategory: 'Curriculum',
        }),
      ],
    );
    expect(only(menu, 'training').subCategories).toEqual([
      { label: 'Curriculum', liveCount: 2 },
    ]);
  });

  it('counts every row for a kept label, including rows beyond the cap', () => {
    // The cap trims labels, never tallies. Five distinct labels appear, the
    // fifth is dropped, and the first label has a sixth row sitting after the
    // cap would have been reached -- a build that counted as it went would
    // report 1 for it.
    const menu = buildNeedMenu(
      [count('funding', 6)],
      ['Grants', 'Corporate VC', 'Grant fund', 'Early-stage capital', 'Prize', 'Grants'].map(
        (subCategory, i) => resource({ id: `r${i}`, needPrimary: 'funding', subCategory }),
      ),
    );
    expect(only(menu, 'funding').subCategories).toEqual([
      { label: 'Grants', liveCount: 2 },
      { label: 'Corporate VC', liveCount: 1 },
      { label: 'Grant fund', liveCount: 1 },
      { label: 'Early-stage capital', liveCount: 1 },
    ]);
  });

  it('gives a need whose live resources are all uncategorised an empty list', () => {
    // Not an omitted entry: the need still has resources and still filters.
    // It is the sub-menu that has nothing to offer.
    const menu = buildNeedMenu(
      [count('accelerator', 1)],
      [resource({ id: 'a', needPrimary: 'accelerator', subCategory: null })],
    );
    expect(only(menu, 'accelerator')).toEqual({
      need: 'accelerator',
      liveCount: 1,
      subCategories: [],
      moreSubCategories: [],
    });
  });

  it('keeps each need to its own sub-categories', () => {
    // One resource list, two entries. A builder that ignored the need
    // argument would give both entries both labels.
    const menu = buildNeedMenu(
      [count('compute', 1), count('training', 1)],
      [
        resource({ id: 'a', needPrimary: 'compute', subCategory: 'Cloud credits' }),
        resource({ id: 'b', needPrimary: 'training', subCategory: 'Curriculum' }),
      ],
    );
    // Courses precedes Compute in the browse order, so the expectation is in
    // that order rather than the order the counts were passed in.
    expect(labelsOf(menu, 'training')).toEqual(['Curriculum']);
    expect(labelsOf(menu, 'compute')).toEqual(['Cloud credits']);
  });
});
