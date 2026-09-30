import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenrePage from './GenrePage';
import { renderWithProviders } from '../test/utils';

const genreMedia = vi.hoisted(() => ({ calls: [] as { movieId: number; tvId: number; page: number }[] }));

vi.mock('../hooks/useGenreMedia', async () => {
    const { makeMedia: media } = await import('../test/utils');
    return {
        useGenreMedia: (args: { movieId: number; tvId: number; page: number }) => {
            genreMedia.calls.push(args);
            const combinedMedia = [
                media({ id: 1, title: 'A Movie', media_type: 'movie' }),
                media({ id: 2, title: 'A Show', media_type: 'tv' }),
            ];
            return {
                moviesData: { page: 1, results: [], total_pages: 3, total_results: 60 },
                tvData: { page: 1, results: [], total_pages: 2, total_results: 40 },
                moviesLoading: false,
                tvLoading: false,
                movieCount: 60,
                tvCount: 40,
                combinedMedia,
                totalCount: 100,
            };
        },
    };
});

vi.mock('../components/WishlistButton', () => ({ default: () => null }));

beforeEach(() => {
    genreMedia.calls = [];
});

describe('GenrePage', () => {
    it('loads the genre named in the URL', () => {
        renderWithProviders(<GenrePage />, { route: '/genre/Comedy', path: '/genre/:genreName' });

        expect(screen.getByRole('heading', { name: 'All Comedy Titles' })).toBeInTheDocument();
        expect(genreMedia.calls.at(-1)).toEqual({ movieId: 35, tvId: 35, page: 1 });
    });

    it('reports unknown genres instead of silently showing another one', () => {
        renderWithProviders(<GenrePage />, { route: '/genre/Western', path: '/genre/:genreName' });

        expect(screen.getByText('Unknown genre: Western')).toBeInTheDocument();
    });

    it('filters the grid by the selected tab', async () => {
        renderWithProviders(<GenrePage />, { route: '/genre/Drama', path: '/genre/:genreName' });

        await userEvent.click(screen.getByRole('tab', { name: /TV Shows/ }));

        expect(screen.getByRole('heading', { name: 'Drama TV Shows' })).toBeInTheDocument();
        expect(screen.getByText('A Show')).toBeInTheDocument();
        expect(screen.queryByText('A Movie')).not.toBeInTheDocument();
    });
});
