import type { PublicResource } from './types';

/**
 * How a search's words are compared with a resource. No model and no index: a
 * few hundred rows are scored in the browser, in the same pass that filters
 * them.
 */

/**
 * Lowercase, strip accents, reduce everything that is not a letter or digit to
 * a single space, and pad with one space at each end.
 *
 * The apostrophe becoming a space is why "cote d'ivoire" and "cote d ivoire"
 * both resolve while "cote divoire" does not.
 */
export function normalise(value: string): string {
  const flattened = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return ` ${flattened} `;
}

function tokens(value: string): string[] {
  return normalise(value).split(' ').filter((word) => word !== '');
}

export function queryTerms(query: string): string[] {
  return [...new Set(tokens(query))];
}

function sharedPrefix(a: string, b: string): number {
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1;
  return length;
}

/**
 * A term matches a whole word, the start of one ("tech" in "technology"), or a
 * close variation of it ("farmers" and "farming"). Matching whole words is what
 * stops "art" from matching "startup". The variation rule allows at most three
 * letters of difference from the longer word, so short stems stay distinct.
 */
export function termMatchesWord(term: string, word: string): boolean {
  if (term === word) return true;
  if (term.length < 3) return false;
  if (word.startsWith(term)) return true;
  return sharedPrefix(term, word) >= Math.max(4, Math.max(term.length, word.length) - 3);
}

/** Where a word was found decides how much it says about the resource. */
const FIELD_WEIGHTS = [
  { weight: 5, read: (row: PublicResource) => row.name },
  { weight: 4, read: (row: PublicResource) => row.subCategory },
  { weight: 3, read: (row: PublicResource) => row.partnerName },
  { weight: 1, read: (row: PublicResource) => row.description },
] as const;

export interface ResourceScore {
  /** How many of the terms were found anywhere in the resource. */
  matched: number;
  /** Each found term's weight, taken from the best field it appears in. */
  score: number;
}

export function scoreResource(row: PublicResource, terms: readonly string[]): ResourceScore {
  const fields = FIELD_WEIGHTS.map(({ weight, read }) => ({
    weight,
    words: tokens(read(row) ?? ''),
  }));
  let matched = 0;
  let score = 0;
  for (const term of terms) {
    const best = Math.max(
      0,
      ...fields.map(({ weight, words }) =>
        words.some((word) => termMatchesWord(term, word)) ? weight : 0,
      ),
    );
    if (best > 0) {
      matched += 1;
      score += best;
    }
  }
  return { matched, score };
}
