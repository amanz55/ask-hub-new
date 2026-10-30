import { COUNTRIES, SECTORS, STAGES, NEED_KEYS } from '@/lib/reference';
import { queryTerms, scoreResource } from './search-rank';
import type { NeedKey, PublicResource } from './types';

export type SortMode = 'featured' | 'recent' | 'best';

const SORT_MODES: readonly SortMode[] = ['featured', 'recent', 'best'];

export const DEFAULT_SORT: SortMode = 'featured';

export interface FilterCriteria {
  need: NeedKey | null;
  /**
   * Refines `need`, so it is only ever set alongside one. Free text with no
   * reference list behind it: see `dropUnknownSubCategory`.
   */
  subCategory: string | null;
  sector: string | null;
  country: string | null;
  stage: string | null;
  query: string;
  sort: SortMode;
  /** 1-based. Page state lives in the URL like every other facet. */
  page: number;
}

/** Cards per page: four rows of the directory's three-column grid. */
export const PAGE_SIZE = 12;

export const EMPTY_CRITERIA: FilterCriteria = {
  need: null,
  subCategory: null,
  sector: null,
  country: null,
  stage: null,
  query: '',
  sort: DEFAULT_SORT,
  page: 1,
};

/**
 * The narrowest shape both `URLSearchParams` and Next's
 * `ReadonlyURLSearchParams` satisfy. Declared structurally rather than
 * importing `ReadonlyURLSearchParams`, so this module stays free of a
 * next/navigation import and remains testable with a plain URLSearchParams.
 */
interface ReadableParams {
  get(name: string): string | null;
}

function oneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | null {
  if (value === null) return null;
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

/**
 * Read filter state from the URL, which is the single source of truth.
 *
 * An unrecognised value falls back to the default rather than being honoured.
 * A stale bookmark, a hand-edited link or a filter option removed from
 * reference.ts would otherwise produce an empty directory with nothing on
 * screen explaining why.
 */
export function parseFilters(params: ReadableParams): FilterCriteria {
  const need = oneOf<NeedKey>(params.get('need'), NEED_KEYS);
  const sector = oneOf(params.get('sector'), SECTORS);
  const query = (params.get('q') ?? '').trim();
  const sort = oneOf<SortMode>(params.get('sort'), SORT_MODES) ?? DEFAULT_SORT;
  return {
    need,
    // Meaningless without its need: a sub-category is a refinement of one.
    subCategory: need === null ? null : params.get('sub')?.trim() || null,
    sector,
    country: oneOf(params.get('country'), COUNTRIES),
    stage: oneOf(params.get('stage'), STAGES),
    query,
    // Best match means nothing once the words it ranks on are gone.
    sort: sort === 'best' && rankTerms({ query, sector }).length === 0 ? DEFAULT_SORT : sort,
    page: pageFrom(params.get('page')),
  };
}

/**
 * A page number from the URL, or 1.
 *
 * Only plain digits count. Zero, negatives, decimals, exponent notation and
 * outright nonsense all become 1, because every one of them arrives the same
 * way -- a hand-edited link or a stale bookmark -- and would otherwise slice an
 * empty window and render a directory with nothing in it and nothing
 * explaining why.
 *
 * The digit test rather than `Number()`: `Number('1e3')` is 1000, a perfectly
 * valid integer that no visitor ever typed, and `parseInt` reads both `1.5`
 * and `1e3` as 1, which is a different wrong answer. A page parameter is
 * either a run of digits or it is not a page parameter.
 *
 * `Number.MAX_SAFE_INTEGER` bounds it so a very long digit string cannot
 * become `Infinity`; `paginate` then clamps whatever survives to a page that
 * exists.
 */
function pageFrom(raw: string | null): number {
  if (raw === null || !/^\d+$/.test(raw)) return 1;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) return 1;
  return value;
}

/**
 * Drop a selected sub-category that the current need does not offer.
 *
 * The rule `parseFilters` applies to every other facet, which it cannot apply
 * here: sub-categories are discovered from the live rows rather than listed in
 * reference.ts, so only a caller holding those rows can tell a stale link from
 * a real one. Without this, a link to a sub-category since retired would open
 * an empty directory (FR-025).
 */
export function dropUnknownSubCategory(
  criteria: FilterCriteria,
  offered: readonly string[],
): FilterCriteria {
  if (criteria.subCategory === null || offered.includes(criteria.subCategory)) {
    return criteria;
  }
  return { ...criteria, subCategory: null };
}

/**
 * Write filter state back to the URL.
 *
 * `base` carries anything already in the query string that is not ours --
 * campaign tags, a future locale param -- so a filter click preserves it.
 * Our own keys are always rewritten from `criteria`, so clearing a facet
 * removes the key rather than serialising it empty; `?sector=` in a shared
 * link is noise that survives every subsequent copy of that link.
 */
export function toSearchParams(
  criteria: FilterCriteria,
  base?: URLSearchParams,
): URLSearchParams {
  const out = new URLSearchParams(base?.toString() ?? '');
  const set = (key: string, value: string | null) => {
    if (value === null || value === '') out.delete(key);
    else out.set(key, value);
  };
  set('need', criteria.need);
  set('sub', criteria.subCategory);
  set('sector', criteria.sector);
  set('country', criteria.country);
  set('stage', criteria.stage);
  set('q', criteria.query.trim());
  const sortIsDefault =
    criteria.sort === DEFAULT_SORT ||
    (criteria.sort === 'best' && rankTerms(criteria).length === 0);
  set('sort', sortIsDefault ? null : criteria.sort);
  // Page 1 is the default, so it is left out: a first-page link should be the
  // bare link, not `?page=1`, or every shared URL carries a parameter that
  // means nothing and survives every later copy of it.
  set('page', criteria.page > 1 ? String(criteria.page) : null);
  return out;
}

/**
 * Return `next`, on the first page if anything other than the page changed.
 *
 * The trap: narrow a sixty-row directory while reading page five, and without
 * this the visitor lands on page five of a two-page result -- an empty grid
 * that reads as "no matches" for a filter that matched plenty. Paging itself
 * is not a filter change, so moving between pages is left alone; resetting
 * there would pin the visitor to page one and make the control inert.
 *
 * A pure function rather than a rule inside the directory component, so both
 * the behaviour and its exception are testable without rendering anything.
 */
export function resetPageOnFilterChange(
  next: FilterCriteria,
  previous: FilterCriteria,
): FilterCriteria {
  const changed =
    next.need !== previous.need ||
    next.subCategory !== previous.subCategory ||
    next.sector !== previous.sector ||
    next.country !== previous.country ||
    next.stage !== previous.stage ||
    next.query !== previous.query ||
    next.sort !== previous.sort;
  return changed ? { ...next, page: 1 } : next;
}

export interface PaginatedRows<T> {
  rows: readonly T[];
  /** The page actually shown, which may be lower than the one requested. */
  page: number;
  pageCount: number;
}

/**
 * One page of rows, with the page clamped to what exists.
 *
 * A page past the end returns the first page rather than an empty window: it
 * is reachable from a shared link whose result set has since shrunk, and an
 * empty grid there is indistinguishable from "nothing matched".
 *
 * `pageCount` is never 0 -- an empty directory is one empty page, so "page 1
 * of 1" is what renders, and every range check downstream stays honest.
 *
 * Exported and used by both directory renderers, so the server-rendered
 * fallback and the hydrated client cannot slice differently and shift the page
 * under the reader on hydration.
 */
export function paginate<T>(
  rows: readonly T[],
  page: number,
  size: number = PAGE_SIZE,
): PaginatedRows<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * size;
  return { rows: rows.slice(start, start + size), page: safePage, pageCount };
}

/**
 * The URL a filter selection navigates to.
 *
 * The directory is a band on the home page, not a route, so every filtered
 * view is `/` plus a query string plus the `#directory` fragment. Both
 * consumers -- `ResourceDirectoryClient`'s own controls and the browse
 * menu's links -- go through here, so a link in the sidebar and a chip in
 * the directory cannot serialise the same selection two different ways.
 *
 * The empty query string is dropped rather than serialised as `/?`, which a
 * visitor would otherwise copy out of the address bar and share.
 */
export function directoryHref(
  criteria: FilterCriteria,
  base?: URLSearchParams,
): string {
  const query = toSearchParams(criteria, base).toString();
  return query === '' ? '/#directory' : `/?${query}#directory`;
}

/**
 * The same URL as `directoryHref`, without the `#directory` fragment.
 *
 * For the browse menu's category and sub-category rows. Selecting either
 * changes the menu and the rail beside it, and the fragment scrolled the
 * viewport straight past both to the results, so what a click had just changed
 * was never in view. The filtering still happens; only the jump is dropped.
 *
 * Built from the same `toSearchParams`, so a category row and a chip
 * expressing the same selection still serialise identically.
 */
export function browseHref(
  criteria: FilterCriteria,
  base?: URLSearchParams,
): string {
  const query = toSearchParams(criteria, base).toString();
  return query === '' ? '/' : `/?${query}`;
}

/**
 * An empty eligibility array means "no restriction", not "eligible for
 * nothing". The seed maps the prototype's `sectors: 'All'` sentinel to `[]`,
 * so reading an empty array as a filter miss would hide every
 * open-to-everyone resource -- the ones most worth showing.
 */
function matchesList(eligible: readonly string[], selected: string | null): boolean {
  if (selected === null) return true;
  if (eligible.length === 0) return true;
  return eligible.includes(selected);
}

/**
 * The same reading of `sub_category` the browse menu counts by: trimmed and
 * exact. So a sub-item reading "3" leads to exactly three cards, where a text
 * search for the same words would also catch any row that merely mentions them.
 */
function matchesSubCategory(row: PublicResource, selected: string | null): boolean {
  return selected === null || row.subCategory?.trim() === selected;
}

/**
 * Content rule 10.6: the country filter has no catch-all option. A resource
 * whose geo_scope is global, all_africa or partner_countries matches every
 * country selection; only `specific` consults countries_eligible.
 */
function matchesCountry(row: PublicResource, selected: string | null): boolean {
  if (selected === null) return true;
  if (row.geoScope !== 'specific') return true;
  return matchesList(row.countriesEligible, selected);
}

/** Whether anything other than search text is narrowing the directory. */
export function hasFacet(
  criteria: Pick<FilterCriteria, 'need' | 'subCategory' | 'sector' | 'stage' | 'country'>,
): boolean {
  return (
    criteria.need !== null ||
    criteria.subCategory !== null ||
    criteria.sector !== null ||
    criteria.stage !== null ||
    criteria.country !== null
  );
}

/**
 * What Best match ranks on: the search words, plus the selected sector's name.
 * The sector counts because resources are rarely tagged with one, so a resource
 * that talks about water should still come first under Water.
 */
export function rankTerms(criteria: Pick<FilterCriteria, 'query' | 'sector'>): string[] {
  return [...new Set([...queryTerms(criteria.query), ...queryTerms(criteria.sector ?? '')])];
}

/**
 * Search words narrow the directory only when nothing else does.
 *
 * With a facet set, they rank and never exclude. They used to be required, so
 * one word no resource used ("career") emptied a category that had 75 good
 * answers, which read as the AI Hub having nothing to offer. With no facet they
 * still have to match at least once, or a search for nonsense would return the
 * entire directory looking like a result.
 */
function matchesQuery(row: PublicResource, criteria: FilterCriteria): boolean {
  if (hasFacet(criteria)) return true;
  const terms = queryTerms(criteria.query);
  return terms.length === 0 || scoreResource(row, terms).matched > 0;
}

/** Whether any of these rows contains any of the search words. */
export function anyRowMatchesQuery(rows: readonly PublicResource[], query: string): boolean {
  const terms = queryTerms(query);
  return rows.some((row) => scoreResource(row, terms).matched > 0);
}

/**
 * The resources a visitor should be offered: everything live whose deadline
 * has not passed.
 *
 * A closed opportunity leaves the public listings -- the directory, search,
 * the recently-added rail and the browse menu -- because it is something
 * nobody can act on any more, and a directory of things you cannot apply to
 * is a directory that wastes the reader's time. It keeps its own page, so a
 * link shared in a newsletter still resolves and says Closed rather than
 * 404ing at whoever follows it months later.
 *
 * Reads `isClosed` rather than comparing dates: `resources_public` computes
 * it in SQL, and a second opinion in TypeScript is how the two come to
 * disagree about the day a deadline expires.
 */
export function openResources(
  rows: readonly PublicResource[],
): PublicResource[] {
  return rows.filter((row) => !row.isClosed);
}

export function filterResources(
  rows: readonly PublicResource[],
  criteria: FilterCriteria,
): PublicResource[] {
  return rows.filter(
    (row) =>
      (criteria.need === null ||
        row.needPrimary === criteria.need ||
        row.needSecondary === criteria.need) &&
      matchesSubCategory(row, criteria.subCategory) &&
      matchesList(row.sectorsEligible, criteria.sector) &&
      matchesList(row.stagesEligible, criteria.stage) &&
      matchesCountry(row, criteria.country) &&
      matchesQuery(row, criteria),
  );
}

/**
 * Both modes end in a comparison on `id`. Without it, two rows with the same
 * sort_order or added_date can come back in a different order from one render
 * to the next, which React reports as a hydration mismatch and a visitor sees
 * as cards jumping.
 */
export function sortResources(
  rows: readonly PublicResource[],
  mode: SortMode,
): PublicResource[] {
  const copy = [...rows];
  if (mode === 'recent') {
    return copy.sort(
      (a, b) =>
        (b.addedDate ?? '').localeCompare(a.addedDate ?? '') || a.id.localeCompare(b.id),
    );
  }
  return copy.sort(
    (a, b) =>
      Number(b.isFeatured) - Number(a.isFeatured) ||
      a.sortOrder - b.sortOrder ||
      a.id.localeCompare(b.id),
  );
}

/**
 * The directory's final order. Best match puts resources containing the most
 * search words first, then those where the words sit in a stronger field. When
 * the words do not decide it, a resource whose main category is the selected one
 * beats one that only lists it as secondary. Remaining ties keep the featured
 * order, so results stay stable between renders.
 */
export function arrangeResources(
  rows: readonly PublicResource[],
  criteria: FilterCriteria,
): PublicResource[] {
  const sorted = sortResources(rows, criteria.sort);
  const terms = rankTerms(criteria);
  if (criteria.sort !== 'best' || terms.length === 0) return sorted;
  const scores = new Map(sorted.map((row) => [row.id, scoreResource(row, terms)]));
  return sorted.sort((a, b) => {
    const left = scores.get(a.id)!;
    const right = scores.get(b.id)!;
    return (
      right.matched - left.matched ||
      right.score - left.score ||
      Number(b.needPrimary === criteria.need) - Number(a.needPrimary === criteria.need)
    );
  });
}

export type RecoveryOption =
  | {
      kind: 'remove';
      facet: 'country' | 'stage' | 'sector' | 'subCategory' | 'query';
      value: string;
      count: number;
      criteria: FilterCriteria;
    }
  | { kind: 'remove'; facet: 'need'; value: NeedKey; count: number; criteria: FilterCriteria }
  | { kind: 'browse'; need: NeedKey; count: number; criteria: FilterCriteria }
  | { kind: 'clearAll'; count: number; criteria: FilterCriteria };

/**
 * Specific ways out of an empty result, each with the number of resources it
 * leads to. Geography comes first, as the most likely thing to broaden. A way
 * out that would also be empty is left out.
 */
export function recoveryOptions(
  rows: readonly PublicResource[],
  criteria: FilterCriteria,
): RecoveryOption[] {
  const count = (next: FilterCriteria) => filterResources(rows, next).length;
  const base: FilterCriteria = { ...criteria, page: 1 };
  const options: RecoveryOption[] = [];
  const remove = (
    facet: 'country' | 'stage' | 'sector' | 'subCategory' | 'query',
    value: string | null,
    next: FilterCriteria,
  ) => {
    if (value) options.push({ kind: 'remove', facet, value, count: count(next), criteria: next });
  };

  remove('country', criteria.country, { ...base, country: null });
  remove('stage', criteria.stage, { ...base, stage: null });
  remove('sector', criteria.sector, { ...base, sector: null });
  remove('subCategory', criteria.subCategory, { ...base, subCategory: null });
  if (criteria.need) {
    const next: FilterCriteria = { ...base, need: null, subCategory: null };
    options.push({ kind: 'remove', facet: 'need', value: criteria.need, count: count(next), criteria: next });
  }
  remove('query', criteria.query, { ...base, query: '' });
  // Only a search with no facet can leave a visitor with no category to loosen.
  if (!hasFacet(criteria)) {
    const browse = NEED_KEYS.map((need) => {
      const next: FilterCriteria = { ...base, query: '', need };
      return { kind: 'browse' as const, need, count: count(next), criteria: next };
    }).sort((a, b) => b.count - a.count);
    options.push(...browse.slice(0, 3));
  }
  // Several constraints can empty the list together, leaving no single removal
  // that helps. With only one, removing it already is clearing everything.
  const active = [
    criteria.need,
    criteria.subCategory,
    criteria.sector,
    criteria.stage,
    criteria.country,
    criteria.query || null,
  ].filter((value) => value !== null).length;
  if (active > 1) {
    options.push({
      kind: 'clearAll',
      count: count(EMPTY_CRITERIA),
      criteria: { ...EMPTY_CRITERIA },
    });
  }
  return options.filter((option) => option.count > 0);
}
