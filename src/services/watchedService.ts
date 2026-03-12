import { collection, doc, addDoc, deleteDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface WatchedItem {
  id: number;
  media_type: 'movie' | 'tv';
  watchedAt: Date;
}

export const watchedService = {
  getWatchedRef: (userId: string) => {
    return collection(db, 'users', userId, 'watched');
  },

  fetchWatched: async (userId: string): Promise<WatchedItem[]> => {
    if (!userId) return [];
    try {
      const watchedRef = collection(db, 'users', userId, 'watched');
      const querySnapshot = await getDocs(watchedRef);
      return querySnapshot.docs.map(document => {
        const data = document.data();
        return {
          id: data.mediaId,
          media_type: data.mediaType,
          watchedAt: data.watchedAt instanceof Timestamp ? data.watchedAt.toDate() : data.watchedAt,
        } as WatchedItem;
      });
    } catch (error) {
      console.error('Error fetching watched:', error);
      throw error;
    }
  },

  addToWatched: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<string> => {
    if (!userId) throw new Error('User ID is required');
    try {
      const watchedRef = collection(db, 'users', userId, 'watched');
      const docRef = await addDoc(watchedRef, {
        mediaId,
        mediaType,
        watchedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding to watched:', error);
      throw error;
    }
  },

  removeFromWatched: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    try {
      const watchedRef = collection(db, 'users', userId, 'watched');
      const q = query(
        watchedRef,
        where('mediaId', '==', mediaId),
        where('mediaType', '==', mediaType)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(document =>
        deleteDoc(doc(db, 'users', userId, 'watched', document.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error removing from watched:', error);
      throw error;
    }
  },

  isWatched: (watched: WatchedItem[], mediaId: number, mediaType: 'movie' | 'tv'): boolean => {
    return watched.some(item => item.id === mediaId && item.media_type === mediaType);
  },
};
