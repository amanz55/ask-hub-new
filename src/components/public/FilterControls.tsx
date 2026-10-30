'use client';

import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import { COUNTRIES, SECTORS, STAGES, NEED_KEYS } from '@/lib/reference';
import {
  DEFAULT_SORT,
  EMPTY_CRITERIA,
  rankTerms,
  type FilterCriteria,
  type SortMode,
} from '@/lib/public/filters';
import { applyParsedQuery } from '@/lib/public/search-parse';

/**
 * Transcribed from the approved prototype's directory screen: a search pill
 * with the button inside it, a line of plain-language help beneath, a row of
 * removable chips for whatever is currently filtered, and one row of
 * dropdowns -- need, sector, stage, country, plus the sub-category dropdown
 * beside need, which the prototype does not have. Client feedback asked for it
 * so that a sub-category chosen in the browse rail can be seen and changed here.
 *
 * **Search runs on submit, not on every keystroke.** The prototype searches
 * only on Enter or the button, and it has to: a query is *parsed* into facets
 * (see `applyParsedQuery`), and parsing half a sentence would set filters from
 * words the visitor had not finished typing. Committing per keystroke would
 * also put a URL replacement behind every letter. The earlier debounce is
 * gone with it. Nothing is lost without JavaScript, either -- this component
 * is never rendered without it, because `ResourceDirectoryStatic` is what
 * serves the no-JS and crawler path and it deliberately renders no controls
 * at all.
 *
 * **The draft text is the one piece of local state**, and it is deliberately
 * allowed to diverge from `criteria.query`: after searching "funding in
 * Kenya" the box still reads that sentence while the committed query is empty
 * and two facets are set. That divergence is why the draft cannot simply be
 * bound to `criteria.query` -- and it could not be anyway, because `q` is
 * trimmed on read and on write in filters.ts, so a trailing space would be
 * trimmed out of the DOM the instant a URL update committed, deleting it
 * before the next keystroke could arrive. Multi-word search would be
 * unusable.
 *
 * Everything else still round-trips through the URL with no local mirror,
 * which is what keeps the back button and shared links honest.
 */
export default function FilterControls({
  criteria,
  subCategories,
  resultCount,
  noTextMatch = false,
  onChange,
}: {
  criteria: FilterCriteria;
  /** What the selected need offers. Empty when no need is selected. */
  subCategories: readonly string[];
  resultCount: number;
  /** The search words matched nothing, so the facets alone chose these rows. */
  noTextMatch?: boolean;
  onChange: (next: FilterCriteria) => void;
}) {
  const [draft, setDraft] = useState(criteria.query);
  const [searchFocused, setSearchFocused] = useState(false);

  // What this component last sent upstream. Written only in event handlers and
  // read only in the effect below -- never during render, which is what
  // `react-hooks/refs` requires and what makes this safe.
  const sentRef = useRef(criteria.query);

  // Re-seed the box when the committed query changes from somewhere other than
  // this component: a shared link, the back button, or the text chip's ×. A
  // render-time comparison against `criteria.query` cannot do this job any
  // more -- submitting deliberately leaves the two different, so comparing
  // them would wipe the visitor's own sentence out of the box the moment they
  // pressed Search.
  useEffect(() => {
    if (criteria.query === sentRef.current) return;
    sentRef.current = criteria.query;
    setDraft(criteria.query);
  }, [criteria.query]);

  function runSearch() {
    const next = applyParsedQuery(criteria, draft);
    // `next.query` is the leftover after parsing, not what was typed, so this
    // is what the effect above has to compare against to recognise its own
    // commit coming back.
    sentRef.current = next.query;
    onChange(next);
  }

  function clearAll() {
    sentRef.current = '';
    setDraft('');
    // EMPTY_CRITERIA rather than a hand-written literal: a field added to
    // FilterCriteria should reset here by default, not be forgotten until the
    // compiler notices -- which is exactly how `page` arrived.
    onChange({ ...EMPTY_CRITERIA });
  }

  const isFiltered =
    criteria.need !== null ||
    criteria.sector !== null ||
    criteria.country !== null ||
    criteria.stage !== null ||
    criteria.query !== '' ||
    criteria.sort !== DEFAULT_SORT;

  /**
   * The active facets, as the prototype's removable chip row, in the order the
   * dropdowns above sit in so the two read as one control rather than two.
   *
   * The committed query gets a chip too, worded as what it is: words that
   * order the results rather than a filter on them. Without one the only
   * evidence of an active search would be the text in the box -- which after
   * parsing is not the same thing at all.
   */
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (criteria.need) {
    activeChips.push({
      key: 'need',
      label: t(`need.${criteria.need}`),
      clear: () => onChange({ ...criteria, need: null, subCategory: null }),
    });
  }
  if (criteria.subCategory) {
    activeChips.push({
      key: 'subCategory',
      label: criteria.subCategory,
      clear: () => onChange({ ...criteria, subCategory: null }),
    });
  }
  if (criteria.sector) {
    activeChips.push({
      key: 'sector',
      label: criteria.sector,
      clear: () => onChange({ ...criteria, sector: null }),
    });
  }
  if (criteria.stage) {
    activeChips.push({
      key: 'stage',
      label: criteria.stage,
      clear: () => onChange({ ...criteria, stage: null }),
    });
  }
  if (criteria.country) {
    activeChips.push({
      key: 'country',
      label: criteria.country,
      clear: () => onChange({ ...criteria, country: null }),
    });
  }
  if (criteria.query !== '') {
    activeChips.push({
      key: 'query',
      label: t('filter.textChip', { value: criteria.query }),
      clear: () => onChange({ ...criteria, query: '' }),
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            runSearch();
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: `1.5px solid ${searchFocused ? '#1F5FBF' : '#C9D3E8'}`,
            borderRadius: 12,
            background: '#fff',
            padding: '0 6px 0 16px',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 15, color: '#1F5FBF', flexShrink: 0 }}>
            ✦
          </span>
          <input
            type="search"
            value={draft}
            aria-label={t('filter.searchHint')}
            placeholder={t('filter.search')}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '13px 0',
              border: 'none',
              fontSize: 15,
              color: '#1A2332',
              outline: 'none',
              background: 'transparent',
            }}
          />
          <button
            type="submit"
            className="proto-primary-button"
            style={{
              background: '#1F5FBF',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {t('search.submit')}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 8, fontSize: 11.5, color: '#5B6B8C' }}>{t('filter.smartHint')}</p>

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={GROUP_LABEL}>{t('filter.label')}</span>
        <select
          value={criteria.need ?? ''}
          aria-label={t('filter.need')}
          onChange={(event) =>
            onChange({
              ...criteria,
              need: (event.target.value === ''
                ? null
                : event.target.value) as FilterCriteria['need'],
              // The options below belong to the need being left.
              subCategory: null,
            })
          }
          style={FACET_SELECT}
        >
          <option value="">{t('filter.anyNeed')}</option>
          {NEED_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`need.${key}`)}
            </option>
          ))}
        </select>
        <select
          value={criteria.subCategory ?? ''}
          aria-label={t('filter.subCategory')}
          disabled={subCategories.length === 0}
          title={criteria.need === null ? t('filter.subCategoryHint') : undefined}
          onChange={(event) =>
            onChange({
              ...criteria,
              subCategory: event.target.value === '' ? null : event.target.value,
            })
          }
          style={subCategories.length === 0 ? FACET_SELECT_DISABLED : FACET_SELECT}
        >
          <option value="">{t('filter.anySubCategory')}</option>
          {subCategories.map((subCategory) => (
            <option key={subCategory} value={subCategory}>
              {subCategory}
            </option>
          ))}
        </select>
        <select
          value={criteria.sector ?? ''}
          aria-label={t('filter.sector')}
          onChange={(event) =>
            onChange({
              ...criteria,
              sector: event.target.value === '' ? null : event.target.value,
            })
          }
          style={FACET_SELECT}
        >
          <option value="">{t('filter.anySector')}</option>
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
        <select
          value={criteria.stage ?? ''}
          aria-label={t('filter.stage')}
          onChange={(event) =>
            onChange({
              ...criteria,
              stage: event.target.value === '' ? null : event.target.value,
            })
          }
          style={FACET_SELECT}
        >
          <option value="">{t('filter.anyStage')}</option>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <select
          value={criteria.country ?? ''}
          aria-label={t('filter.country')}
          onChange={(event) =>
            onChange({
              ...criteria,
              country: event.target.value === '' ? null : event.target.value,
            })
          }
          style={FACET_SELECT}
        >
          <option value="">{t('filter.anyCountry')}</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* Shown whenever anything is filtered, not merely when a chip exists: a
          non-default sort produces no chip, and hiding "Clear all" in that
          state would leave no way back to the default view. */}
      {isFiltered ? (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="proto-active-chip"
              style={ACTIVE_CHIP}
            >
              {chip.label}
              <span aria-hidden="true" style={{ fontWeight: 800, opacity: 0.6 }}>
                ×
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="proto-clear-all"
            style={{
              background: 'none',
              border: 'none',
              color: '#5B6B8C',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 8px',
            }}
          >
            {t('filter.clearAll')}
          </button>
        </div>
      ) : null}

      <div
        style={{
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 13.5, color: '#5B6B8C', fontWeight: 600 }}>
          {resultCount === 1
            ? t('directory.countOne')
            : t('directory.count', { count: resultCount })}
          {' · '}
          {t('site.curationStatement')}
          {noTextMatch ? (
            <div style={{ fontWeight: 400, marginTop: 4 }}>
              {t('directory.noExactMatch', { value: criteria.query })}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={GROUP_LABEL}>{t('sort.label')}</span>
          <select
            value={criteria.sort}
            aria-label={t('sort.label')}
            onChange={(event) =>
              onChange({
                ...criteria,
                sort: (event.target.value as SortMode | null) ?? DEFAULT_SORT,
              })
            }
            style={{ ...SELECT, fontSize: 13, padding: '7px 10px', fontWeight: 600 }}
          >
            {rankTerms(criteria).length > 0 ? (
              <option value="best">{t('sort.best')}</option>
            ) : null}
            <option value="featured">{t('sort.featured')}</option>
            <option value="recent">{t('sort.recent')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/** A removable filter chip, as the prototype draws it. */
const ACTIVE_CHIP = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  background: '#EEF2FB',
  color: '#1F5FBF',
  border: '1px solid #C9D3E8',
  borderRadius: 99,
  padding: '6px 13px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
} as const;

/** The "Filter" and "Sort" eyebrows. */
const GROUP_LABEL = {
  fontSize: 11.5,
  fontWeight: 800,
  color: '#5B6B8C',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const;

/**
 * The facet dropdowns. Held apart from `SELECT` below, which is the sort
 * control's: the two are different sizes in the prototype, and folding them
 * into one const would restyle a row this change does not touch.
 */
const FACET_SELECT = {
  flex: 1,
  minWidth: 150,
  padding: '9px 12px',
  borderRadius: 9,
  border: '1px solid #C9D3E8',
  fontSize: 13,
  fontWeight: 600,
  background: '#fff',
  color: '#1A2332',
  cursor: 'pointer',
} as const;

/**
 * White like the others: only the muted text and the cursor say it is
 * unavailable. `opacity` undoes the fade browsers apply to a disabled select.
 */
const FACET_SELECT_DISABLED = {
  ...FACET_SELECT,
  color: '#5B6B8C',
  cursor: 'not-allowed',
  opacity: 1,
} as const;

const SELECT = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #C9D3E8',
  fontSize: 13.5,
  background: '#fff',
  color: '#1A2332',
  cursor: 'pointer',
} as const;
