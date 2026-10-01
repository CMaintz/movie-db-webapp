import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { watchedService, WatchedItem } from '../services/watchedService';

export const useWatched = () => {
  const { user } = useAuth();
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatched = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await watchedService.fetchWatched(user.uid);
      setWatched(items);
    } catch (error) {
      console.error('Error fetching watched:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWatched();
    } else {
      setWatched([]);
      setLoading(false);
    }
  }, [user, fetchWatched]);

  const addToWatched = useCallback(async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return false;
    try {
      await watchedService.addToWatched(user.uid, mediaId, mediaType);
      setWatched(prev => [...prev, { id: mediaId, media_type: mediaType, watchedAt: new Date() }]);
      return true;
    } catch (error) {
      console.error('Error adding to watched:', error);
      return false;
    }
  }, [user]);

  const removeFromWatched = useCallback(async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return false;
    try {
      await watchedService.removeFromWatched(user.uid, mediaId, mediaType);
      setWatched(prev => prev.filter(item => !(item.id === mediaId && item.media_type === mediaType)));
      return true;
    } catch (error) {
      console.error('Error removing from watched:', error);
      return false;
    }
  }, [user]);

  const isWatched = useCallback((mediaId: number, mediaType: 'movie' | 'tv') => {
    return watchedService.isWatched(watched, mediaId, mediaType);
  }, [watched]);

  return {
    watched,
    loading,
    addToWatched,
    removeFromWatched,
    isWatched,
    refreshWatched: fetchWatched,
  };
};
