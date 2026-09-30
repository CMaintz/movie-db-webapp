import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '../test/utils';
import { fakeFirestore } from '../test/fakeFirestore';
import type { AuthUser } from '../context/useAuth';

vi.mock('firebase/firestore', async () => (await import('../test/fakeFirestore')).fakeFirestore.module);

const auth = vi.hoisted(() => ({ user: null as AuthUser | null }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: auth.user }) }));

import { useWishlist } from './useWishlist';

const PATH = 'users/user-1/wishlist';

const renderWishlist = () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    // Two consumers of the hook, like two WishlistButtons on one page
    return renderHook(() => ({ first: useWishlist(), second: useWishlist() }), { wrapper });
};

beforeEach(() => {
    fakeFirestore.reset();
    auth.user = { uid: 'user-1', email: 'a@b.c', displayName: null };
});

describe('useWishlist', () => {
    it('loads the signed-in user\'s wishlist from Firestore', async () => {
        fakeFirestore.seed(PATH, 'a', { mediaId: 10, mediaType: 'movie', addedAt: new Date() });

        const { result } = renderWishlist();

        await waitFor(() => expect(result.current.first.loading).toBe(false));
        expect(result.current.first.isInWishlist(10, 'movie')).toBe(true);
        expect(result.current.first.isInWishlist(10, 'tv')).toBe(false);
    });

    it('does not query Firestore when signed out', () => {
        auth.user = null;

        const { result } = renderWishlist();

        expect(result.current.first.loading).toBe(false);
        expect(result.current.first.wishlist).toEqual([]);
        expect(fakeFirestore.module.getDocs).not.toHaveBeenCalled();
    });

    it('shares additions across every consumer and persists them', async () => {
        const { result } = renderWishlist();
        await waitFor(() => expect(result.current.first.loading).toBe(false));

        let succeeded = false;
        await act(async () => {
            succeeded = await result.current.first.addToWishlist(7, 'tv');
        });

        expect(succeeded).toBe(true);
        await waitFor(() => expect(result.current.second.isInWishlist(7, 'tv')).toBe(true));
        expect(fakeFirestore.read(PATH)).toEqual([expect.objectContaining({ mediaId: 7, mediaType: 'tv' })]);
    });

    it('removes items for every consumer', async () => {
        fakeFirestore.seed(PATH, 'a', { mediaId: 3, mediaType: 'movie', addedAt: new Date() });
        const { result } = renderWishlist();
        await waitFor(() => expect(result.current.second.isInWishlist(3, 'movie')).toBe(true));

        await act(async () => {
            await result.current.first.removeFromWishlist(3, 'movie');
        });

        await waitFor(() => expect(result.current.second.isInWishlist(3, 'movie')).toBe(false));
        expect(fakeFirestore.read(PATH)).toEqual([]);
    });

    it('reports failure and leaves the wishlist unchanged when Firestore rejects the write', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        fakeFirestore.module.addDoc.mockRejectedValueOnce(new Error('permission-denied'));
        const { result } = renderWishlist();
        await waitFor(() => expect(result.current.first.loading).toBe(false));

        let succeeded = true;
        await act(async () => {
            succeeded = await result.current.first.addToWishlist(9, 'movie');
        });

        expect(succeeded).toBe(false);
        await waitFor(() => expect(result.current.second.isInWishlist(9, 'movie')).toBe(false));
        expect(fakeFirestore.read(PATH)).toEqual([]);
        consoleError.mockRestore();
    });

    it('reports failure without writing when signed out', async () => {
        auth.user = null;
        const { result } = renderWishlist();

        await expect(result.current.first.addToWishlist(1, 'movie')).resolves.toBe(false);
        expect(fakeFirestore.module.addDoc).not.toHaveBeenCalled();
    });
});
