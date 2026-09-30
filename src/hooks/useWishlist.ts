import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/useAuth';
import { wishlistService, WishlistItem } from '../services/wishlistService';
import { MediaType } from '../types';

interface WishlistChange {
    mediaId: number;
    mediaType: MediaType;
}

type WishlistKey = ReturnType<typeof wishlistQueryKey>;

export const wishlistQueryKey = (userId: string | undefined) => ['wishlist', userId] as const;

// Applies `update` to the cached list immediately and rolls back if Firestore rejects the write
const useOptimisticWishlistMutation = (
    queryKey: WishlistKey,
    write: (change: WishlistChange) => Promise<unknown>,
    update: (items: WishlistItem[], change: WishlistChange) => WishlistItem[]
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: write,
        onMutate: async (change: WishlistChange) => {
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<WishlistItem[]>(queryKey);
            queryClient.setQueryData<WishlistItem[]>(queryKey, (items = []) => update(items, change));
            return { previous };
        },
        onError: (error, _change, context) => {
            console.error('Wishlist update failed:', error);
            queryClient.setQueryData(queryKey, context?.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    }).mutateAsync;
};

export const useWishlist = () => {
    const { user } = useAuth();
    const userId = user?.uid;
    const queryKey = wishlistQueryKey(userId);

    const { data: wishlist = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => wishlistService.fetchWishlist(userId!),
        enabled: !!userId,
    });

    const add = useOptimisticWishlistMutation(
        queryKey,
        ({ mediaId, mediaType }) => wishlistService.addToWishlist(userId!, mediaId, mediaType),
        (items, { mediaId, mediaType }) => [...items, { id: mediaId, media_type: mediaType, addedAt: new Date() }]
    );

    const remove = useOptimisticWishlistMutation(
        queryKey,
        ({ mediaId, mediaType }) => wishlistService.removeFromWishlist(userId!, mediaId, mediaType),
        (items, { mediaId, mediaType }) =>
            items.filter((item) => !(item.id === mediaId && item.media_type === mediaType))
    );

    const run = useCallback(
        async (mutate: (change: WishlistChange) => Promise<unknown>, change: WishlistChange) => {
            if (!userId) return false;
            try {
                await mutate(change);
                return true;
            } catch {
                return false;
            }
        },
        [userId]
    );

    const addToWishlist = useCallback(
        (mediaId: number, mediaType: MediaType) => run(add, { mediaId, mediaType }),
        [run, add]
    );

    const removeFromWishlist = useCallback(
        (mediaId: number, mediaType: MediaType) => run(remove, { mediaId, mediaType }),
        [run, remove]
    );

    const isInWishlist = useCallback(
        (mediaId: number, mediaType: MediaType) => wishlistService.isInWishlist(wishlist, mediaId, mediaType),
        [wishlist]
    );

    return {
        wishlist,
        loading: !!userId && isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
    };
};
