import { describe, it, expect } from 'vitest';
import { parseQuery, applyParsedQuery } from '@/lib/public/search-parse';
import { EMPTY_CRITERIA } from '@/lib/public/filters';
import { COUNTRIES, NEED_KEYS, type NeedKey } from '@/lib/reference';

/**
 * The parser is the whole of the "smart search" claim the hint line makes, and
 * it is pure — so this is where the behaviour is pinned, not in the component.
 *
 * The cases that matter are the ones where one phrase can eat another's
 * letters: the two Congos, `cloud credits` against `cloud`, `agriculture`
 * against `agri`. Those are the regressions a reordered table would cause, and
 * none of them is visible from the UI until somebody searches for a country
 * and gets the neighbouring one.
 */
describe('parseQuery', () => {
  it('resolves the prototype’s own example into three facets and no text', () => {
    expect(parseQuery('funding for health AI in Kenya')).toEqual({
      need: 'funding',
      sector: 'Health',
      stage: null,
      country: 'Kenya',
      query: '',
    });
  });

  it('is case-insensitive', () => {
    expect(parseQuery('FUNDING IN KENYA')).toEqual(
      parseQuery('funding in kenya'),
    );
  });

  it('takes the longest phrase, so a shorter one cannot claim its letters', () => {
    // 'cloud credits' must win over 'cloud', or 'credits' survives as text and
    // the search then demands that literal word appear in the card copy.
    expect(parseQuery('cloud credits')).toEqual({
      need: 'compute',
      sector: null,
      stage: null,
      country: null,
      query: '',
    });
    // Same shape, one table over: 'agriculture' must win over 'agri'.
    expect(parseQuery('agriculture')).toMatchObject({
      sector: 'Agriculture',
      query: '',
    });
  });

  it('keeps the two Congos apart', () => {
    expect(parseQuery('republic of the congo')).toMatchObject({
      country: 'Republic of the Congo',
      query: '',
    });
    expect(parseQuery('democratic republic of the congo')).toMatchObject({
      country: 'Democratic Republic of the Congo',
      query: '',
    });
    // The bare alias resolves to the DRC, and only ever sees a string neither
    // full name matched.
    expect(parseQuery('congo')).toMatchObject({
      country: 'Democratic Republic of the Congo',
    });
  });

  it('resolves the country whose name is hard to type, accent or not', () => {
    const expected = { country: "Côte d'Ivoire", query: '' };
    expect(parseQuery("Côte d'Ivoire")).toMatchObject(expected);
    expect(parseQuery("cote d'ivoire")).toMatchObject(expected);
    expect(parseQuery('cote d ivoire')).toMatchObject(expected);
    expect(parseQuery('ivory coast')).toMatchObject(expected);
  });

  it('resolves the drc alias', () => {
    expect(parseQuery('gpus in drc')).toEqual({
      need: 'compute',
      sector: null,
      stage: null,
      country: 'Democratic Republic of the Congo',
      query: '',
    });
  });

  it('drops stop-words and words of two characters or fewer', () => {
    expect(parseQuery('looking for ai resources to help my startup')).toEqual({
      need: null,
      sector: null,
      stage: null,
      country: null,
      query: '',
    });
  });

  it('keeps words it cannot place, as the text term', () => {
    expect(parseQuery('zindi indaba')).toMatchObject({
      need: null,
      query: 'zindi indaba',
    });
  });

  it('keeps the first value per facet and does not leak the second into text', () => {
    const parsed = parseQuery('kenya ghana');
    // One country per facet is all FilterCriteria can hold; the point of the
    // assertion is that the other one is *gone*, not sitting in `query` where
    // it would filter the prose and match nothing.
    expect(COUNTRIES).toContain(parsed.country);
    expect(parsed.query).toBe('');
  });

  it('resolves stages, including the phrase that is two words', () => {
    expect(parseQuery('getting started')).toMatchObject({ stage: 'Getting started' });
    expect(parseQuery('new to ai')).toMatchObject({ stage: 'New to AI' });
    expect(parseQuery('beginner')).toMatchObject({ stage: 'New to AI' });
  });

  it('leaves Building unreachable on purpose', () => {
    // "building" is a verb before it is a stage — see the empty entry in
    // STAGE_SYNONYMS. This asserts the omission is a decision, so removing it
    // has to be one too.
    expect(parseQuery('building')).toMatchObject({ stage: null });
  });

  it('reaches every need in the taxonomy', () => {
    // NEED_KEYS is pinned to the public.need_type enum, so this fails the day
    // a migration adds a category nobody gave a word to.
    const byName: Record<NeedKey, string> = {
      compute: 'compute',
      training: 'courses',
      funding: 'grants',
      accelerator: 'incubator',
      data: 'datasets',
      challenges: 'hackathons',
      community: 'meetup',
    };
    for (const need of NEED_KEYS) {
      expect(parseQuery(byName[need]).need, `no phrase resolves to ${need}`).toBe(need);
    }
  });

  it('returns nothing at all for an empty query', () => {
    expect(parseQuery('')).toEqual({
      need: null,
      sector: null,
      stage: null,
      country: null,
      query: '',
    });
  });
});

describe('applyParsedQuery', () => {
  it('sets what the query named and resets to the first page', () => {
    const next = applyParsedQuery({ ...EMPTY_CRITERIA, page: 4 }, 'grants in kenya');
    expect(next).toMatchObject({
      need: 'funding',
      country: 'Kenya',
      query: '',
      page: 1,
    });
  });

  it('leaves a facet the query did not name alone', () => {
    // Merging, not replacing: a search for a category must not silently
    // discard the country somebody chose a moment earlier.
    const next = applyParsedQuery({ ...EMPTY_CRITERIA, country: 'Rwanda' }, 'grants');
    expect(next.country).toBe('Rwanda');
    expect(next.need).toBe('funding');
  });

  it('overwrites a facet the query does name', () => {
    const next = applyParsedQuery({ ...EMPTY_CRITERIA, country: 'Rwanda' }, 'grants in kenya');
    expect(next.country).toBe('Kenya');
  });

  it('keeps the sort, which is not filter state', () => {
    const next = applyParsedQuery({ ...EMPTY_CRITERIA, sort: 'recent' }, 'grants');
    expect(next.sort).toBe('recent');
  });

  it('replaces the text term rather than appending to it', () => {
    const next = applyParsedQuery({ ...EMPTY_CRITERIA, query: 'indaba' }, 'zindi');
    expect(next.query).toBe('zindi');
  });
});

describe('the searches the client reported', () => {
  it('keeps only meaningful leftovers from a full sentence', () => {
    expect(parseQuery('I need to learn about AI to grow in my career')).toMatchObject({
      need: 'training',
      query: 'grow career',
    });
    expect(parseQuery('I need to learn about AI to grow my water startup')).toMatchObject({
      need: 'training',
      sector: 'Water',
      query: 'grow',
    });
  });

  it('moves to Best match when there is something to rank on, but not over a chosen sort', () => {
    expect(applyParsedQuery(EMPTY_CRITERIA, 'grow my career').sort).toBe('best');
    expect(applyParsedQuery(EMPTY_CRITERIA, 'water').sort).toBe('best');
    expect(applyParsedQuery(EMPTY_CRITERIA, 'grants in kenya').sort).toBe(EMPTY_CRITERIA.sort);
    expect(applyParsedQuery({ ...EMPTY_CRITERIA, sort: 'recent' }, 'career').sort).toBe('recent');
  });

  it('does not read a subject as a request for a course', () => {
    expect(parseQuery('machine learning dataset')).toMatchObject({
      need: 'data',
      query: 'machine learning',
    });
  });

  it('resolves the added stage phrases', () => {
    expect(parseQuery('early stage')).toMatchObject({ stage: 'Getting started', query: '' });
    expect(parseQuery('growth stage')).toMatchObject({ stage: 'Scaling', query: '' });
  });

  it('follows up by replacing the words and keeping the filters', () => {
    const first = applyParsedQuery(EMPTY_CRITERIA, 'grants in kenya for farmers');
    const next = applyParsedQuery(first, 'women');
    expect(next).toMatchObject({ need: 'funding', country: 'Kenya', query: 'women' });
  });
});
