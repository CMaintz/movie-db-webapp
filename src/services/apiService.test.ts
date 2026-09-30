import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({
    get: vi.fn(),
    onRejected: undefined as undefined | ((error: unknown) => Promise<never>),
}));

vi.mock('axios', () => ({
    default: {
        create: () => ({
            get: http.get,
            interceptors: {
                response: {
                    use: (_onFulfilled: unknown, onRejected: (error: unknown) => Promise<never>) => {
                        http.onRejected = onRejected;
                    },
                },
            },
        }),
    },
}));

import {
    MAX_PAGE_LIMIT,
    getMediaByGenre,
    getMediaCountByGenre,
    getMediaDetails,
    getSafePage,
} from './apiService';

beforeEach(() => {
    http.get.mockReset();
});

describe('getSafePage', () => {
    it('passes through pages inside the TMDB range', () => {
        expect(getSafePage(1)).toBe(1);
        expect(getSafePage(250)).toBe(250);
        expect(getSafePage(MAX_PAGE_LIMIT)).toBe(MAX_PAGE_LIMIT);
    });

    it('clamps pages above the TMDB limit', () => {
        expect(getSafePage(501)).toBe(MAX_PAGE_LIMIT);
        expect(getSafePage(10_000)).toBe(MAX_PAGE_LIMIT);
    });

    it('clamps zero, negative and non-finite pages to 1', () => {
        expect(getSafePage(0)).toBe(1);
        expect(getSafePage(-3)).toBe(1);
        expect(getSafePage(Number.NaN)).toBe(1);
    });

    it('drops fractional pages', () => {
        expect(getSafePage(2.7)).toBe(2);
    });
});

describe('getMediaByGenre', () => {
    it('normalises TV names into titles, tags the media type and caps total pages', async () => {
        http.get.mockResolvedValue({
            data: {
                page: 1,
                total_pages: 900,
                total_results: 18_000,
                results: [{ id: 7, name: 'Some Show', popularity: 3 }],
            },
        });

        const response = await getMediaByGenre('tv', 18, 999);

        expect(http.get).toHaveBeenCalledWith('/discover/tv', {
            params: expect.objectContaining({ with_genres: 18, page: MAX_PAGE_LIMIT }),
        });
        expect(response.total_pages).toBe(MAX_PAGE_LIMIT);
        expect(response.results).toEqual([{ id: 7, popularity: 3, title: 'Some Show', media_type: 'tv' }]);
    });
});

describe('getMediaDetails', () => {
    it('uses first_air_date as the release date for series', async () => {
        http.get.mockResolvedValue({ data: { id: 3, name: 'Show', first_air_date: '2011-04-17' } });

        const details = await getMediaDetails('tv', 3);

        expect(details).toMatchObject({ title: 'Show', media_type: 'tv', release_date: '2011-04-17' });
    });
});

describe('getMediaCountByGenre', () => {
    it('caps the count at the number of reachable results', async () => {
        http.get.mockResolvedValue({ data: { total_results: 1_000_000 } });
        await expect(getMediaCountByGenre('movie', 28)).resolves.toBe(MAX_PAGE_LIMIT * 20);

        http.get.mockResolvedValue({ data: { total_results: 42 } });
        await expect(getMediaCountByGenre('movie', 28)).resolves.toBe(42);
    });
});

describe('response interceptor', () => {
    it('reports rejected TMDB credentials and still rejects', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = { response: { status: 401 } };

        await expect(http.onRejected!(error)).rejects.toBe(error);
        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('VITE_TMDB_API_KEY'));

        consoleError.mockRestore();
    });
});
