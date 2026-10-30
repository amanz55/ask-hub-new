// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { t } from '@/lib/i18n';
import NoResultsHelp, { noResultsTitle } from '@/components/public/NoResultsHelp';
import { EMPTY_CRITERIA, type RecoveryOption } from '@/lib/public/filters';

afterEach(cleanup);

const clearAll: RecoveryOption = { kind: 'clearAll', count: 116, criteria: EMPTY_CRITERIA };

describe('noResultsTitle', () => {
  it('names the filters, not the search words, when a filter is set', () => {
    // With a filter set the words only rank, so they cannot be what emptied it.
    const title = noResultsTitle({
      ...EMPTY_CRITERIA,
      need: 'funding',
      stage: 'Scaling',
      country: 'Kenya',
      query: 'career',
    });
    expect(title).toBe(
      t('directory.emptyFacets', { value: `${t('need.funding')}, Scaling and Kenya` }),
    );
    expect(title).not.toContain('career');
  });

  it('names the search words when nothing else is set', () => {
    expect(noResultsTitle({ ...EMPTY_CRITERIA, query: 'xyzzy' })).toBe(
      t('directory.emptyQuery', { value: 'xyzzy' }),
    );
  });
});

describe('NoResultsHelp', () => {
  it('gives the spelling tip only to a search with no filters', () => {
    const { rerender } = render(
      <NoResultsHelp criteria={{ ...EMPTY_CRITERIA, query: 'xyzzy' }} options={[]} />,
    );
    expect(screen.getByText(t('directory.emptySearchTip'))).toBeTruthy();

    rerender(
      <NoResultsHelp criteria={{ ...EMPTY_CRITERIA, need: 'funding', query: 'xyzzy' }} options={[]} />,
    );
    expect(screen.queryByText(t('directory.emptySearchTip'))).toBeNull();
  });

  it('links each option to its view, with its count', () => {
    render(<NoResultsHelp criteria={{ ...EMPTY_CRITERIA, need: 'funding' }} options={[clearAll]} />);
    const link = screen.getByRole('link', { name: t('directory.clearAllFilters', { count: 116 }) });
    expect(link.getAttribute('href')).toBe('/#directory');
  });

  it('falls back to the generic line only when there are no options', () => {
    render(<NoResultsHelp criteria={{ ...EMPTY_CRITERIA, need: 'funding' }} options={[]} />);
    expect(screen.getByText(t('directory.emptyFilteredAction'))).toBeTruthy();
  });

  it('always offers suggesting a resource, straight into the form', () => {
    render(<NoResultsHelp criteria={{ ...EMPTY_CRITERIA, query: 'xyzzy' }} options={[clearAll]} />);
    expect(
      screen.getByRole('link', { name: t('contact.suggestAction') }).getAttribute('href'),
    ).toBe('/contact#suggest');
  });
});
