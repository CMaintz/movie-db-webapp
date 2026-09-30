import { collection, doc, addDoc, deleteDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebaseService';
import { MediaType } from '../types';

export interface WishlistItem {
    id: number;
    media_type: MediaType;
    addedAt: Date;
}

const wishlistRef = (userId: string) => collection(db, 'users', userId, 'wishlist');

export const wishlistService = {
    fetchWishlist: async (userId: string): Promise<WishlistItem[]> => {
        if (!userId) return [];

        const snapshot = await getDocs(wishlistRef(userId));
        return snapshot.docs.map((document) => {
            const data = document.data();
            return {
                id: data.mediaId,
                media_type: data.mediaType,
                addedAt: data.addedAt instanceof Timestamp ? data.addedAt.toDate() : data.addedAt,
            };
        });
    },

    addToWishlist: async (userId: string, mediaId: number, mediaType: MediaType): Promise<string> => {
        if (!userId) throw new Error('User ID is required');

        const docRef = await addDoc(wishlistRef(userId), {
            mediaId,
            mediaType,
            addedAt: new Date(),
        });
        return docRef.id;
    },

    removeFromWishlist: async (userId: string, mediaId: number, mediaType: MediaType): Promise<void> => {
        if (!userId) throw new Error('User ID is required');

        const matches = await getDocs(
            query(wishlistRef(userId), where('mediaId', '==', mediaId), where('mediaType', '==', mediaType))
        );
        await Promise.all(
            matches.docs.map((document) => deleteDoc(doc(db, 'users', userId, 'wishlist', document.id)))
        );
    },

    isInWishlist: (wishlist: WishlistItem[], mediaId: number, mediaType: MediaType): boolean =>
        wishlist.some((item) => item.id === mediaId && item.media_type === mediaType),
};
