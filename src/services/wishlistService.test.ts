import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('firebase/firestore', async () => (await import('../test/fakeFirestore')).fakeFirestore.module);

import { wishlistService } from './wishlistService';
import { fakeFirestore } from '../test/fakeFirestore';

const PATH = 'users/user-1/wishlist';

beforeEach(() => {
    fakeFirestore.reset();
});

describe('wishlistService', () => {
    it('maps stored documents to wishlist items and converts Timestamps to Dates', async () => {
        const addedAt = new Date('2024-05-01T12:00:00Z');
        const { Timestamp } = fakeFirestore.module;
        fakeFirestore.seed(PATH, 'a', { mediaId: 10, mediaType: 'movie', addedAt: new Timestamp(addedAt) });

        await expect(wishlistService.fetchWishlist('user-1')).resolves.toEqual([
            { id: 10, media_type: 'movie', addedAt },
        ]);
    });

    it('returns an empty list without querying when there is no user', async () => {
        await expect(wishlistService.fetchWishlist('')).resolves.toEqual([]);
        expect(fakeFirestore.module.getDocs).not.toHaveBeenCalled();
    });

    it('stores new items under the user', async () => {
        await wishlistService.addToWishlist('user-1', 42, 'tv');

        expect(fakeFirestore.read(PATH)).toEqual([
            { mediaId: 42, mediaType: 'tv', addedAt: expect.any(Date) },
        ]);
    });

    it('removes only the matching id and media type', async () => {
        fakeFirestore.seed(PATH, 'a', { mediaId: 5, mediaType: 'movie' });
        fakeFirestore.seed(PATH, 'b', { mediaId: 5, mediaType: 'tv' });

        await wishlistService.removeFromWishlist('user-1', 5, 'movie');

        expect(fakeFirestore.read(PATH)).toEqual([{ mediaId: 5, mediaType: 'tv' }]);
    });

    it('refuses writes without a user', async () => {
        await expect(wishlistService.addToWishlist('', 1, 'movie')).rejects.toThrow('User ID is required');
        await expect(wishlistService.removeFromWishlist('', 1, 'movie')).rejects.toThrow('User ID is required');
    });

    it('checks membership by id and media type', () => {
        const items = [{ id: 1, media_type: 'movie' as const, addedAt: new Date() }];
        expect(wishlistService.isInWishlist(items, 1, 'movie')).toBe(true);
        expect(wishlistService.isInWishlist(items, 1, 'tv')).toBe(false);
    });
});
