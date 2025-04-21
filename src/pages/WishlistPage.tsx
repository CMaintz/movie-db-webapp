import React, { useCallback } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
      const items = await Promise.all(
        wishlist.map((item) => getMediaDetails(item.media_type, item.id))
      );
      return items;
    },
    enabled: wishlist.length > 0 && !wishlistLoading,
  });

  // Force refresh media items when wishlist changes
  const handleMediaChange = useCallback(() => {
    // First refresh the wishlist data
    refreshWishlist();
    // Then invalidate the query to trigger a re-fetch
    queryClient.invalidateQueries({ queryKey: ['wishlist', 'media'] });
  }, [queryClient, refreshWishlist]);

  if (!user) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5">
            Please log in to view your wishlist
          </Typography>
        </Box>
      </Container>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5">
            Your wishlist is empty
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          My Wishlist
        </Typography>
        <MediaGrid
          media={mediaItems}
          title="Wishlist"
          showViewAll={false}
          showType={true}
          showCount={true}
          totalCount={mediaItems.length}
          onMediaChange={handleMediaChange}
        />
      </Box>
    </Container>
  );
};

export default WishlistPage; 