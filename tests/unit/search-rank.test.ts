import { describe, it, expect } from 'vitest';
import { queryTerms, scoreResource, termMatchesWord } from '@/lib/public/search-rank';
import type { PublicResource } from '@/lib/public/types';

const row = (over: Partial<PublicResource>) =>
  ({ name: '', partnerName: '', description: null, subCategory: null, ...over }) as PublicResource;

describe('termMatchesWord', () => {
  it('matches a whole word, its start, and close variations', () => {
    expect(termMatchesWord('water', 'water')).toBe(true);
    expect(termMatchesWord('tech', 'technology')).toBe(true);
    expect(termMatchesWord('farmers', 'farming')).toBe(true);
    expect(termMatchesWord('careers', 'career')).toBe(true);
  });

  it('does not match letters inside another word', () => {
    expect(termMatchesWord('art', 'startup')).toBe(false);
  });

  it('holds very short terms to an exact match', () => {
    expect(termMatchesWord('ai', 'aid')).toBe(false);
    expect(termMatchesWord('ai', 'ai')).toBe(true);
  });
});

describe('scoreResource', () => {
  it('counts each term once, at its strongest field', () => {
    const score = scoreResource(row({ name: 'Career paths', description: 'A career guide' }), ['career']);
    expect(score).toEqual({ matched: 1, score: 5 });
  });

  it('weighs name over sub-category over provider over description', () => {
    const of = (over: Partial<PublicResource>) => scoreResource(row(over), ['term']).score;
    expect(of({ name: 'term' })).toBeGreaterThan(of({ subCategory: 'term' }));
    expect(of({ subCategory: 'term' })).toBeGreaterThan(of({ partnerName: 'term' }));
    expect(of({ partnerName: 'term' })).toBeGreaterThan(of({ description: 'term' }));
  });

  it('reads punctuation and accents the same way as the search', () => {
    expect(queryTerms('Equity-free, Côte')).toEqual(['equity', 'free', 'cote']);
    expect(scoreResource(row({ description: 'Equity-free funding' }), ['equity']).matched).toBe(1);
  });
});
