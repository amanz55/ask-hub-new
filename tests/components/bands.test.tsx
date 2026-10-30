// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StatsBand from '@/components/public/StatsBand';
import BrowseByNeed from '@/components/public/BrowseByNeed';
import type { PublicStat } from '@/lib/public/types';
import type { NeedMenuEntry } from '@/lib/public/need-menu';

afterEach(cleanup);

/**
 * `isHero` is required, not defaulted.
 *
 * It used to default to `true`, which made every one of these tests build a
 * band of six heroes and left `StatsBand`'s hero filter untested: deleting the
 * filter outright kept all twelve tests green, because with six heroes and no
 * heroes alike the first four rows come out the same. A default cannot stand
 * in for the value under test. `headline_stats.is_hero` is `not null default
 * false`, so a test that does not say which it means is not describing a real
 * row anyway.
 */
const stat = (over: Partial<PublicStat> & Pick<PublicStat, 'isHero'>): PublicStat => ({
  id: 's1',
  value: '18',
  label: 'partner countries',
  sortOrder: 0,
  ...over,
});


describe('StatsBand', () => {
  it('renders nothing at all when no figure has been attested', () => {
    // headline_stats cannot hold a row without source, attested_by and
    // attested_on (all NOT NULL, all non-blank). So "no rows" means "nobody
    // has vouched for a number yet", and the honest response is no band --
    // not a band of zeros, not a placeholder, not an apology.
    const { container } = render(<StatsBand stats={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders exactly the figures that exist and invents nothing for the rest', () => {
    // The partial case is the one that will actually ship: the client
    // supplies fifteen figures over time, not in one delivery.
    render(
      <StatsBand
        stats={[
          stat({ id: 'a', value: '18', label: 'partner countries', isHero: true }),
          stat({ id: 'b', value: '6', label: 'priority sectors', isHero: true }),
        ]}
      />,
    );
    expect(screen.getAllByRole('term')).toHaveLength(2);
    expect(screen.getByText('18')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();
  });

  it('shows the first four hero figures and drops the rest', () => {
    // PRD 5.1 item 2: the home strip is the first four hero stats. The About
    // page renders all of them; this band is the strip. Asserted by value, not
    // by count alone -- a count of four is equally satisfied by the wrong four.
    render(
      <StatsBand
        stats={[1, 2, 3, 4, 5, 6].map((n) => stat({ id: `s${n}`, value: String(n), isHero: true }))}
      />,
    );
    expect(screen.getAllByRole('term')).toHaveLength(4);
    for (const shown of ['1', '2', '3', '4']) {
      expect(screen.getByText(shown), `hero ${shown} is missing from the strip`).toBeDefined();
    }
    for (const dropped of ['5', '6']) {
      expect(screen.queryByText(dropped), `stat ${dropped} is past the limit of four`).toBeNull();
    }
  });

  it('renders the hero figures and only those', () => {
    // The filter, stated positively and negatively in one render: the two
    // heroes appear, the two non-heroes do not, and the count is exactly two
    // rather than "at most four". A test that only asserts absence passes just
    // as well when the component renders nothing at all.
    render(
      <StatsBand
        stats={[
          stat({ id: 'a', value: '18', label: 'partner countries', isHero: true }),
          stat({ id: 'b', value: '6', label: 'priority sectors', isHero: false }),
          stat({ id: 'c', value: '400', label: 'GPU hours', isHero: true }),
          stat({ id: 'd', value: '9', label: 'workshops held', isHero: false }),
        ]}
      />,
    );
    expect(screen.getAllByRole('term')).toHaveLength(2);
    expect(screen.getByText('18')).toBeDefined();
    expect(screen.getByText('400')).toBeDefined();
    expect(screen.queryByText('6'), 'a non-hero stat reached the home strip').toBeNull();
    expect(screen.queryByText('9'), 'a non-hero stat reached the home strip').toBeNull();
  });

  it('renders nothing when figures exist but none is marked hero', () => {
    // `headline_stats.is_hero` is `not null default false` and the Site
    // Content screen creates every stat unticked, so this is the table's
    // starting state, not a corner. The component used to fall back to
    // `stats.slice(0, 4)` here, which put four figures nobody had designated
    // into the slot PRD 5.1 item 2 reserves for hero stats and made the Hero
    // checkbox a no-op until the first tick. The About page (PRD 5.6) is where
    // every attested figure is shown regardless of the flag.
    const { container } = render(
      <StatsBand
        stats={[
          stat({ id: 'a', value: '18', label: 'partner countries', isHero: false }),
          stat({ id: 'b', value: '6', label: 'priority sectors', isHero: false }),
        ]}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('BrowseByNeed', () => {
  const entry = (over: Partial<NeedMenuEntry> & Pick<NeedMenuEntry, 'need'>): NeedMenuEntry => ({
    liveCount: 4,
    subCategories: [],
    moreSubCategories: [],
    ...over,
  });

  // Sub-item counts are deliberately distinct from each other and from the
  // entry's own count, so an assertion on one cannot be satisfied by another
  // number that happens to be on screen.
  const sub = (label: string, liveCount: number) => ({ label, liveCount });

  it('renders nothing when no need has a live resource', () => {
    const { container } = render(<BrowseByNeed entries={[]} activeNeed={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders one entry per need with a live count, linking into the directory', () => {
    render(
      <BrowseByNeed
        entries={[entry({ need: 'compute' }), entry({ need: 'funding', liveCount: 2 })]}
        activeNeed={null}
      />,
    );
    // No #directory on a category row, deliberately. Opening a category
    // reveals its sub-categories inside the menu, and the fragment scrolled
    // the viewport straight past them to the results -- so what the click had
    // just revealed was never seen. The filter still applies.
    expect(screen.getByRole('link', { name: /Compute/ }).getAttribute('href')).toBe(
      '/?need=compute',
    );
    expect(screen.getByRole('link', { name: /Funding/ }).getAttribute('href')).toBe(
      '/?need=funding',
    );
  });

  it('keeps a need\u2019s sub-items hidden while that need is not the one filtering', () => {
    // The sub-items are the expanded state of the *active* category
    //. Rendering every need's sub-items at once would
    // turn a 232px rail into a wall of twenty links and lose the signal of
    // which category the directory is actually showing.
    render(
      <BrowseByNeed
        entries={[entry({ need: 'compute', subCategories: [sub('Cloud credits', 2)] })]}
        activeNeed={null}
      />,
    );
    expect(screen.queryByRole('link', { name: /Cloud credits/ })).toBeNull();
    expect(screen.queryByRole('link', { name: 'More' })).toBeNull();
  });

  it('expands the active need, linking each sub-item to that need and sub-category', () => {
    // The href is the assertion that matters: it is the same need+sub pair the
    // directory's own dropdown and chips read and write, so the sub-item is a
    // real, shareable filter rather than a label.
    render(
      <BrowseByNeed
        entries={[
          entry({ need: 'training', subCategories: [sub('Cloud credits', 2), sub('Curriculum', 7)] }),
        ]}
        activeNeed="training"
      />,
    );
    expect(screen.getByRole('link', { name: /Cloud credits/ }).getAttribute('href')).toBe(
      '/?need=training&sub=Cloud+credits',
    );
    expect(screen.getByRole('link', { name: /Curriculum/ }).getAttribute('href')).toBe(
      '/?need=training&sub=Curriculum',
    );
  });

  it('marks only the selected sub-item, and selecting it again clears it', () => {
    render(
      <BrowseByNeed
        entries={[
          entry({ need: 'training', subCategories: [sub('Cloud credits', 2), sub('Curriculum', 7)] }),
        ]}
        activeNeed="training"
        activeSubCategory="Curriculum"
      />,
    );
    const selected = screen.getByRole('link', { name: /Curriculum/ });
    expect(selected.getAttribute('aria-current')).toBe('true');
    expect(selected.getAttribute('href')).toBe('/?need=training');

    const other = screen.getByRole('link', { name: /Cloud credits/ });
    expect(other.getAttribute('aria-current')).toBeNull();
    expect(other.getAttribute('href')).toBe('/?need=training&sub=Cloud+credits');
  });

  it('lists a selected sub-item from past the cap, and no other from there', () => {
    // Reachable from the directory's dropdown, which offers all of them. The
    // rail would otherwise show no selection while the directory had one.
    const entries = [
      entry({
        need: 'training',
        subCategories: [sub('Curriculum', 7)],
        moreSubCategories: [sub('Specialisation', 3), sub('AI literacy', 5)],
      }),
    ];
    render(<BrowseByNeed entries={entries} activeNeed="training" activeSubCategory="Specialisation" />);
    expect(
      screen.getByRole('link', { name: /Specialisation/ }).getAttribute('aria-current'),
    ).toBe('true');
    expect(screen.queryByRole('link', { name: /AI literacy/ })).toBeNull();
  });

  it('shows each sub-item\u2019s own count, announced with its unit', () => {
    // 7 is neither the entry's count (4) nor the other sub-item's (2), so
    // this fails against a component wiring the wrong number through.
    render(
      <BrowseByNeed
        entries={[
          entry({ need: 'training', subCategories: [sub('Cloud credits', 2), sub('Curriculum', 7)] }),
        ]}
        activeNeed="training"
      />,
    );
    const curriculum = screen.getByRole('link', { name: /Curriculum/ });
    // The digit on screen, for the eye...
    expect(curriculum.querySelector('[aria-hidden="true"]')?.textContent).toBe('7');
    // ...and the unit for everyone else, so the link does not announce as
    // "Curriculum 7", which is seven of nothing.
    expect(curriculum.querySelector('.sr-only')?.textContent).toBe('7 live');
    // The other sub-item keeps its own number: neither is the entry's count.
    expect(
      screen.getByRole('link', { name: /Cloud credits/ }).querySelector('.sr-only')
        ?.textContent,
    ).toBe('2 live');
  });

  it('expands only the active need when several have sub-items', () => {
    // Both halves in one render. The "expands the active one" assertion on
    // its own passes against a component that expands everything.
    render(
      <BrowseByNeed
        entries={[
          entry({ need: 'compute', subCategories: [sub('Cloud credits', 2)] }),
          entry({ need: 'training', subCategories: [sub('Curriculum', 7)] }),
        ]}
        activeNeed="training"
      />,
    );
    expect(screen.getByRole('link', { name: /Curriculum/ })).toBeDefined();
    expect(screen.queryByRole('link', { name: /Cloud credits/ })).toBeNull();
  });

  it('turns the active need\u2019s own link into a way out of the filter', () => {
    // The prototype toggles the need off when it is picked again. The
    // rail has no "all needs" entry, so without the toggle a visitor who
    // filtered from here has no way back except the directory's Clear button.
    render(
      <BrowseByNeed entries={[entry({ need: 'compute' })]} activeNeed="compute" />,
    );
    const compute = screen.getByRole('link', { name: /Compute/ });
    expect(compute.getAttribute('href')).toBe('/');
    expect(compute.getAttribute('aria-current')).toBe('true');
  });

  it('marks only the active entry as current', () => {
    render(
      <BrowseByNeed
        entries={[entry({ need: 'compute' }), entry({ need: 'funding' })]}
        activeNeed="compute"
      />,
    );
    expect(
      screen.getByRole('link', { name: /Funding/ }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('offers More, which keeps the need and drops the sub-category', () => {
    // This is the only route back to the rows the four-sub-item cap hid, so
    // its href must clear q while keeping need -- not clear both.
    render(
      <BrowseByNeed
        entries={[entry({ need: 'funding', subCategories: [sub('Grants', 3)] })]}
        activeNeed="funding"
      />,
    );
    expect(screen.getByRole('link', { name: 'More' }).getAttribute('href')).toBe(
      '/?need=funding#directory',
    );
  });

  it('expands to nothing when the active need has no sub-categories', () => {
    // A lone "More" under an expanded entry would link to the filter that is
    // already applied.
    render(
      <BrowseByNeed
        entries={[entry({ need: 'community', subCategories: [] })]}
        activeNeed="community"
      />,
    );
    expect(screen.queryByRole('link', { name: 'More' })).toBeNull();
  });
});

