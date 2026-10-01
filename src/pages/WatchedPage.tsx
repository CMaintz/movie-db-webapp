import React, { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { getMediaDetails } from '../services/api';
import MediaGrid from '../components/MediaGrid';
import { useWatched } from '../hooks/useWatched';
import { useAuth } from '../context/AuthContext';

const WatchedPage: React.FC = () => {
  const { user } = useAuth();
  const { watched, loading: watchedLoading, refreshWatched } = useWatched();
  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading: mediaLoading } = useQuery({
    queryKey: ['watched', 'media', watched.length],
    queryFn: async () => {
      return Promise.all(watched.map((item) => getMediaDetails(item.media_type, item.id)));
    },
    enabled: watched.length > 0 && !watchedLoading,
  });

  const handleMediaChange = useCallback(() => {
    refreshWatched();
    queryClient.invalidateQueries({ queryKey: ['watched', 'media'] });
  }, [queryClient, refreshWatched]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <CheckCircle className="w-16 h-16 text-white/20" />
        <p className="text-white text-lg">Please log in to view your watched list</p>
      </div>
    );
  }

  if (!watchedLoading && watched.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <CheckCircle className="w-16 h-16 text-white/20" />
        <p className="text-white text-lg">No watched movies or shows yet</p>
        <p className="text-text-secondary text-sm">Mark titles as watched from their detail page</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-6">
      <h1 className="text-white text-2xl font-bold mb-6">Watched</h1>
      {mediaLoading || watchedLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse bg-bg-paper rounded-lg" />
          ))}
        </div>
      ) : (
        <MediaGrid
          media={mediaItems}
          title=""
          showViewAll={false}
          showType={true}
          showCount={true}
          totalCount={mediaItems.length}
          onMediaChange={handleMediaChange}
        />
      )}
    </div>
  );
};

export default WatchedPage;
