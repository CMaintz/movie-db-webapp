import { describe, expect, it } from 'vitest';
import { dedupeMedia, mergeByPopularity } from './useGenreMedia';
import { makeMedia } from '../test/utils';

describe('dedupeMedia', () => {
    it('keeps a movie and a show that share an id', () => {
        const movie = makeMedia({ id: 5, media_type: 'movie' });
        const show = makeMedia({ id: 5, media_type: 'tv' });
        expect(dedupeMedia([movie, show])).toEqual([movie, show]);
    });

    it('drops repeated entries of the same media', () => {
        const movie = makeMedia({ id: 5 });
        expect(dedupeMedia([movie, { ...movie }])).toHaveLength(1);
    });
});

describe('mergeByPopularity', () => {
    it('interleaves movies and shows by descending popularity', () => {
        const movies = [makeMedia({ id: 1, popularity: 50 }), makeMedia({ id: 2, popularity: 10 })];
        const shows = [makeMedia({ id: 3, media_type: 'tv', popularity: 30 })];

        expect(mergeByPopularity(movies, shows).map((item) => item.id)).toEqual([1, 3, 2]);
    });
});
