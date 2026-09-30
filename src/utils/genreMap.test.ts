import { describe, expect, it } from 'vitest';
import { GENRES, getGenreMapping } from './genreMap';

describe('genreMap', () => {
    it('resolves a genre name to its movie and TV ids', () => {
        expect(getGenreMapping('Action')).toEqual({ name: 'Action', movieId: 28, tvId: 10759 });
    });

    it('maps genres TMDB lacks on TV to the nearest TV genre', () => {
        expect(getGenreMapping('Thriller')?.tvId).toBe(9648);
        expect(getGenreMapping('War')?.tvId).toBe(10768);
    });

    it('returns undefined for unknown or differently cased names', () => {
        expect(getGenreMapping('Western')).toBeUndefined();
        expect(getGenreMapping('action')).toBeUndefined();
    });

    it('has unique genre names', () => {
        const names = GENRES.map((genre) => genre.name);
        expect(new Set(names).size).toBe(names.length);
    });
});
