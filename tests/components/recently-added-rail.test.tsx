// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { t } from '@/lib/i18n';
import RecentlyAddedRailClient from '@/components/public/RecentlyAddedRailClient';
import type { PublicResource } from '@/lib/public/types';

const params = { current: new URLSearchParams() };
vi.mock('next/navigation', () => ({ useSearchParams: () => params.current }));

afterEach(cleanup);

function resource(over: Partial<PublicResource>): PublicResource {
  return {
    id: 'r',
    name: 'R',
    partnerName: 'P',
    partnerLogoUrl: null,
    partnerWebsiteUrl: null,
    partnerTier: 'network',
    resourceType: 'Course',
    needPrimary: 'training',
    needSecondary: null,
    subCategory: null,
    description: null,
    actionLabel: null,
    externalUrl: 'https://example.org',
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
  };
}

const rows = [
  resource({ id: 'old', name: 'Old course', addedDate: '2026-01-01', subCategory: 'Curriculum' }),
  resource({ id: 'new', name: 'New course', addedDate: '2026-03-01', subCategory: 'AI literacy' }),
  resource({ id: 'gpu', name: 'GPU credits', needPrimary: 'compute', addedDate: '2026-02-01' }),
  resource({ id: 'both', name: 'Both', needPrimary: 'compute', needSecondary: 'training', addedDate: '2026-02-15' }),
];

function show(query: string, resources = rows) {
  params.current = new URLSearchParams(query);
  render(<RecentlyAddedRailClient resources={resources} />);
  return {
    title: screen.queryByRole('heading', { level: 2 })?.textContent,
    cards: screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent),
  };
}

describe('the rail following the browse selection', () => {
  it('shows the newest of everything by default', () => {
    expect(show('')).toEqual({
      title: t('home.recentHeading'),
      cards: ['New course', 'Both', 'GPU credits', 'Old course'],
    });
  });

  it('follows the category, newest first, including where it is secondary', () => {
    expect(show('need=training')).toEqual({
      title: t('need.training'),
      cards: ['New course', 'Both', 'Old course'],
    });
  });

  it('names the category and sub-category together', () => {
    expect(show('need=training&sub=Curriculum')).toEqual({
      title: t('home.railHeadingSub', { need: t('need.training'), sub: 'Curriculum' }),
      cards: ['Old course'],
    });
  });

  it('ignores a sub-category the category does not offer', () => {
    expect(show('need=training&sub=Gone').title).toBe(t('need.training'));
  });

  it('follows only the category, not the directory’s other filters', () => {
    expect(show('need=compute&q=nothing&country=Kenya').cards).toEqual(['Both', 'GPU credits']);
  });

  it('keeps the title and says so when a category has nothing yet', () => {
    expect(show('need=community')).toEqual({ title: t('need.community'), cards: [] });
    expect(screen.getByText(t('home.railEmpty'))).toBeTruthy();
  });

  it('renders nothing when the whole catalogue is empty', () => {
    params.current = new URLSearchParams();
    const { container } = render(<RecentlyAddedRailClient resources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows at most six', () => {
    const many = Array.from({ length: 9 }, (_, i) => resource({ id: `m${i}`, name: `M${i}` }));
    expect(show('need=training', many).cards).toHaveLength(6);
  });
});
