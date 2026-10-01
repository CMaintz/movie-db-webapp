// src/hooks/useWishlist.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { wishlistService, WishlistItem } from '../services/wishlistService';


/**
 * Custom React hook for managing a user's wishlist
 * Provides functionality to fetch, add, remove, and check wishlist items
 * @returns Object containing wishlist state and functions to manipulate it
 */
export const useWishlist = () => {
  // Get the current authenticated user from auth context
  const { user } = useAuth();
  
  // State for storing the wishlist items
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  
  // State for tracking loading status during async operations
  const [loading, setLoading] = useState(true);
// To force a rerender when the wishlist changes
  const [version, setVersion] = useState(0);

    // Increment version to trigger re-renders
    const bumpVersion = useCallback(() => {
      setVersion(v => v + 1);
    }, []);

  /**
   * Fetches the current user's wishlist from Firestore
   * Updates the wishlist state and loading state
   * @returns void
   */
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await wishlistService.fetchWishlist(user.uid);
      setWishlist(items);
      bumpVersion(); // Bump version on fetch
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user, bumpVersion]);

  /**
   * Effect hook to fetch the wishlist when the user changes
   * If there's no user, clears the wishlist
   */
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user, fetchWishlist]);

  /**
   * Adds an item to the current user's wishlist
   * Updates both Firestore and local state
   * @param mediaId - The ID of the media to add
   * @param mediaType - The type of media ('movie' or 'tv')
   * @returns Promise that completes when the operation is done
   */
  const addToWishlist = useCallback(async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return Promise.resolve(false);
    
    try {
      await wishlistService.addToWishlist(user.uid, mediaId, mediaType);
      
      // Update local state to reflect the change immediately
      setWishlist(prev => [
        ...prev,
        {
          id: mediaId,
          media_type: mediaType,
          addedAt: new Date(),
        },
      ]);
      bumpVersion(); // Bump version after state change
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return Promise.resolve(false);
    }
  }, [user, bumpVersion]);


  /**
   * Removes an item from the current user's wishlist
   * Updates both Firestore and local state
   * @param mediaId - The ID of the media to remove
   * @param mediaType - The type of media ('movie' or 'tv')
   * @returns Promise that completes when the operation is done
   */
  const removeFromWishlist = useCallback(async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return Promise.resolve(false);
    
    try {
      await wishlistService.removeFromWishlist(user.uid, mediaId, mediaType);
      
      // Update local state to reflect the change immediately
      setWishlist(prev => prev.filter(item => !(item.id === mediaId && item.media_type === mediaType)));
      bumpVersion(); // Bump version after state change
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return Promise.resolve(false);
    }
  }, [user, bumpVersion]);

  /**
   * Checks if a specific item is in the current user's wishlist
   * @param mediaId - The ID of the media to check for
   * @param mediaType - The type of media ('movie' or 'tv')
   * @returns Boolean indicating whether the item is in the wishlist
   */
  const isInWishlist = useCallback((mediaId: number, mediaType: 'movie' | 'tv') => {
    return wishlistService.isInWishlist(wishlist, mediaId, mediaType);
  }, [wishlist]);

  // Return the wishlist state and functions to manipulate it
  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist,
    wishlistVersion: version,
  };
};