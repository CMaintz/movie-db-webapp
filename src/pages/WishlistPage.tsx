import React, { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { getMediaDetails } from '../services/api';
import MediaGrid from '../components/MediaGrid';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { wishlist, loading: wishlistLoading, wishlistVersion, refreshWishlist } = useWishlist();
  const queryClient = useQueryClient();

  const { data: mediaItems = [], isLoading: mediaLoading } = useQuery({
    queryKey: ['wishlist', 'media', wishlistVersion, wishlist.length],
    queryFn: async () => {
      return Promise.all(wishlist.map((item) => getMediaDetails(item.media_type, item.id)));
    },
    enabled: wishlist.length > 0 && !wishlistLoading,
  });

  const handleMediaChange = useCallback(() => {
    refreshWishlist();
    queryClient.invalidateQueries({ queryKey: ['wishlist', 'media'] });
  }, [queryClient, refreshWishlist]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <Heart className="w-16 h-16 text-white/20" />
        <p className="text-white text-lg">Please log in to view your wishlist</p>
      </div>
    );
  }

  if (!wishlistLoading && wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <Heart className="w-16 h-16 text-white/20" />
        <p className="text-white text-lg">Your wishlist is empty</p>
        <p className="text-text-secondary text-sm">Add movies and shows you want to watch</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-6">
      <h1 className="text-white text-2xl font-bold mb-6">My Wishlist</h1>
      {mediaLoading || wishlistLoading ? (
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

export default WishlistPage;
