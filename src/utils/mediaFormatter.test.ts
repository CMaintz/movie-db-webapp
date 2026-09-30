import { describe, expect, it } from 'vitest';
import { formatMediaDateRange, formatMediaRuntime, formatSeasonYear } from './mediaFormatter';
import { MovieDetails, SeriesDetails } from '../types';
import { makeMedia } from '../test/utils';

const movie = (overrides: Partial<MovieDetails> = {}) =>
    ({ ...makeMedia(), media_type: 'movie', release_date: '2010-07-16', runtime: 148, ...overrides }) as MovieDetails;

const series = (overrides: Partial<SeriesDetails> = {}) =>
    ({
        ...makeMedia(),
        media_type: 'tv',
        first_air_date: '2008-01-20',
        last_air_date: '2013-09-29',
        status: 'Ended',
        ...overrides,
    }) as SeriesDetails;

describe('formatMediaDateRange', () => {
    it('returns the release year for movies', () => {
        expect(formatMediaDateRange(movie())).toBe('2010');
    });

    it('returns an empty string when a movie has no release date', () => {
        expect(formatMediaDateRange(movie({ release_date: '' }))).toBe('');
    });

    it('returns only the start year for series unless the full range is requested', () => {
        expect(formatMediaDateRange(series())).toBe('2008');
    });

    it('returns the full run for ended or canceled series when requested', () => {
        expect(formatMediaDateRange(series(), true)).toBe('2008 - 2013');
        expect(formatMediaDateRange(series({ status: 'Canceled' }), true)).toBe('2008 - 2013');
    });

    it('keeps a running series open-ended even when the full range is requested', () => {
        expect(formatMediaDateRange(series({ status: 'Returning Series' }), true)).toBe('2008');
    });

    it('falls back to the start year when an ended series has no last air date', () => {
        expect(formatMediaDateRange(series({ last_air_date: '' }), true)).toBe('2008');
    });

    it('returns an empty string for a series that has not aired', () => {
        expect(formatMediaDateRange(series({ first_air_date: '' }), true)).toBe('');
    });

    it('reads January 1st dates as that year regardless of timezone', () => {
        expect(formatMediaDateRange(movie({ release_date: '1999-01-01' }))).toBe('1999');
    });
});

describe('formatMediaRuntime', () => {
    it('formats minutes as hours and minutes', () => {
        expect(formatMediaRuntime(movie({ runtime: 148 }))).toBe('2h 28m');
        expect(formatMediaRuntime(movie({ runtime: 45 }))).toBe('0h 45m');
    });

    it('returns null when there is no runtime or the media is a series', () => {
        expect(formatMediaRuntime(movie({ runtime: 0 }))).toBeNull();
        expect(formatMediaRuntime(series())).toBeNull();
    });
});

describe('formatSeasonYear', () => {
    it('returns the year of an air date', () => {
        expect(formatSeasonYear('2019-04-14')).toBe('2019');
    });

    it('returns an empty string for a missing air date', () => {
        expect(formatSeasonYear('')).toBe('');
        expect(formatSeasonYear(null)).toBe('');
    });
});
