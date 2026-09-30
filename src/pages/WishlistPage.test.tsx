import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import WishlistPage from './WishlistPage';
import { makeMedia, renderWithProviders } from '../test/utils';
import type { WishlistItem } from '../services/wishlistService';

const state = vi.hoisted(() => ({ wishlist: [] as WishlistItem[], loading: false }));

vi.mock('../hooks/useWishlist', () => ({
    useWishlist: () => ({ wishlist: state.wishlist, loading: state.loading }),
}));

vi.mock('../services/apiService', () => ({
    mediaDetailsQueryKey: (type: string, id: number) => ['mediaDetails', type, id],
    getMediaDetails: vi.fn(async (type: 'movie' | 'tv', id: number) =>
        makeMedia({ id, media_type: type, title: `${type} ${id}` })
    ),
}));

vi.mock('../components/WishlistButton', () => ({ default: () => null }));

beforeEach(() => {
    state.wishlist = [];
    state.loading = false;
});

describe('WishlistPage', () => {
    it('shows a spinner while the wishlist loads', () => {
        state.loading = true;
        renderWithProviders(<WishlistPage />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('explains when the wishlist is empty', () => {
        renderWithProviders(<WishlistPage />);

        expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    });

    it('fetches and lists details for each wishlisted item', async () => {
        state.wishlist = [
            { id: 1, media_type: 'movie', addedAt: new Date() },
            { id: 2, media_type: 'tv', addedAt: new Date() },
        ];
        renderWithProviders(<WishlistPage />);

        expect(await screen.findByText('movie 1')).toBeInTheDocument();
        expect(await screen.findByText('tv 2')).toBeInTheDocument();
        expect(screen.getByText('(2 titles)')).toBeInTheDocument();
    });
});
