import Link from 'next/link';
import { t } from '@/lib/i18n';
import {
  directoryHref,
  hasFacet,
  type FilterCriteria,
  type RecoveryOption,
} from '@/lib/public/filters';

function optionLabel(option: RecoveryOption): string {
  if (option.kind === 'clearAll') {
    return t('directory.clearAllFilters', { count: option.count });
  }
  if (option.kind === 'browse') {
    return t('directory.browseCategory', { value: t(`need.${option.need}`), count: option.count });
  }
  if (option.facet === 'query') return t('directory.clearSearch', { count: option.count });
  if (option.facet === 'need') {
    return t('directory.removeFilter', { value: t(`need.${option.value}`), count: option.count });
  }
  return t('directory.removeFilter', { value: option.value, count: option.count });
}

function optionKey(option: RecoveryOption): string {
  if (option.kind === 'clearAll') return 'clear-all';
  return option.kind === 'browse' ? `browse-${option.need}` : option.facet;
}

/** Fixed to the one language the site ships in, like the strings around it. */
const FILTER_LIST = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' });

/**
 * Names what actually emptied the list. With a filter set, search words only
 * rank and never exclude, so it is the filters that are named, never the words.
 */
export function noResultsTitle(criteria: FilterCriteria): string {
  if (hasFacet(criteria)) {
    const applied = [
      criteria.need ? t(`need.${criteria.need}`) : null,
      criteria.subCategory,
      criteria.sector,
      criteria.stage,
      criteria.country,
    ].filter((value): value is string => value !== null);
    return t('directory.emptyFacets', { value: FILTER_LIST.format(applied) });
  }
  return criteria.query === ''
    ? t('directory.emptyFiltered')
    : t('directory.emptyQuery', { value: criteria.query });
}

/**
 * The empty directory: what matched nothing, then the next steps. Each step is a
 * link to a view whose count has already been worked out, so none of them leads
 * to another empty page. Styled as outline buttons, because the filled chips
 * just above this remove a filter while these go somewhere.
 */
export default function NoResultsHelp({
  criteria,
  options,
}: {
  criteria: FilterCriteria;
  options: readonly RecoveryOption[];
}) {
  const searchOnly = !hasFacet(criteria) && criteria.query !== '';

  return (
    <>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{noResultsTitle(criteria)}</div>
      {searchOnly ? (
        <div style={{ ...NOTE, marginTop: 6 }}>{t('directory.emptySearchTip')}</div>
      ) : null}
      {options.length === 0 ? (
        <div style={{ ...NOTE, marginTop: 6 }}>{t('directory.emptyFilteredAction')}</div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={NOTE}>{t('directory.emptyHelp')}</div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              marginTop: 10,
            }}
          >
            {options.map((option) => (
              <Link
                key={optionKey(option)}
                href={directoryHref(option.criteria)}
                className="proto-outline-button"
                style={{
                  background: '#fff',
                  color: '#1F5FBF',
                  border: '1.5px solid #C9D3E8',
                  borderRadius: 9,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {optionLabel(option)}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div style={{ ...NOTE, marginTop: 18 }}>
        {t('directory.emptySuggestPrompt')}{' '}
        <Link href="/contact#suggest" style={{ color: '#1F5FBF', fontWeight: 700 }}>
          {t('contact.suggestAction')}
        </Link>
      </div>
    </>
  );
}

const NOTE = { fontSize: 13.5, color: '#5B6B8C' } as const;
