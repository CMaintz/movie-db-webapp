// src/services/wishlistService.ts
import { collection, doc, addDoc, deleteDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Interface representing a wishlist item in the application
 * @property id - The media ID (movie or TV show ID)
 * @property media_type - The type of media (movie or TV show)
 * @property addedAt - The date when the item was added to the wishlist
 */
export interface WishlistItem {
  id: number;
  media_type: 'movie' | 'tv';
  addedAt: Date;
  // Add any other fields you might need
}

/**
 * Service object containing functions for managing wishlist data in Firestore
 */
export const wishlistService = {
  /**
   * Gets the reference to a specific user's wishlist collection in Firestore
   * @param userId - The ID of the user whose wishlist we want to access
   * @returns Firestore collection reference to the user's wishlist
   */
  getWishlistRef: (userId: string) => {
    return collection(db, 'users', userId, 'wishlist');
  },

  /**
   * Fetches all items in a user's wishlist from Firestore
   * @param userId - The ID of the user whose wishlist we want to fetch
   * @returns Promise resolving to an array of WishlistItem objects
   * @throws Error if the fetch operation fails
   */
  fetchWishlist: async (userId: string): Promise<WishlistItem[]> => {
    if (!userId) return [];
    
    try {
      const wishlistRef = collection(db, 'users', userId, 'wishlist');
      const querySnapshot = await getDocs(wishlistRef);
      
      return querySnapshot.docs.map(document => {
        const data = document.data();
        return {
          id: data.mediaId,
          media_type: data.mediaType,
          // Handle Firestore Timestamp objects by converting them to JavaScript Date objects
          addedAt: data.addedAt instanceof Timestamp ? data.addedAt.toDate() : data.addedAt,
        } as WishlistItem;
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  /**
   * Adds a new item to a user's wishlist in Firestore
   * @param userId - The ID of the user whose wishlist we're updating
   * @param mediaId - The ID of the media (movie or TV show) to add
   * @param mediaType - The type of media ('movie' or 'tv')
   * @returns Promise resolving to the ID of the newly created document
   * @throws Error if the user ID is missing or if the add operation fails
   */
  addToWishlist: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<string> => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const wishlistRef = collection(db, 'users', userId, 'wishlist');
      const docRef = await addDoc(wishlistRef, {
        mediaId,
        mediaType,
        addedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Removes an item from a user's wishlist in Firestore
   * @param userId - The ID of the user whose wishlist we're updating
   * @param mediaId - The ID of the media to remove
   * @param mediaType - The type of media ('movie' or 'tv')
   * @returns Promise that resolves when the removal is complete
   * @throws Error if the user ID is missing or if the remove operation fails
   */
  removeFromWishlist: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<void> => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      // Query to find all documents that match the media ID and type
      const wishlistRef = collection(db, 'users', userId, 'wishlist');
      const q = query(
        wishlistRef,
        where('mediaId', '==', mediaId),
        where('mediaType', '==', mediaType)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Create an array of promises for deleting each matching document
      const deletePromises = querySnapshot.docs.map(document => 
        deleteDoc(doc(db, 'users', userId, 'wishlist', document.id))
      );
      
      // Execute all delete operations in parallel
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  /**
   * Checks if a specific item is in the user's wishlist
   * @param wishlist - The array of wishlist items to check
   * @param mediaId - The ID of the media to check for
   * @param mediaType - The type of media ('movie' or 'tv')
   * @returns Boolean indicating whether the item is in the wishlist
   */
  isInWishlist: (wishlist: WishlistItem[], mediaId: number, mediaType: 'movie' | 'tv'): boolean => {
    return wishlist.some(item => item.id === mediaId && item.media_type === mediaType);
  }
};