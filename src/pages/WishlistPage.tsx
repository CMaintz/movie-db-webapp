import React from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { getMediaDetails, mediaDetailsQueryKey } from '../services/apiService';
import MediaGrid from '../components/MediaGrid';
import { useWishlist } from '../hooks/useWishlist';

const WishlistPage: React.FC = () => {
    const { wishlist, loading } = useWishlist();

    const mediaItems = useQueries({
        queries: wishlist.map((item) => ({
            queryKey: mediaDetailsQueryKey(item.media_type, item.id),
            queryFn: () => getMediaDetails(item.media_type, item.id),
        })),
        combine: (results) => results.flatMap((result) => (result.data ? [result.data] : [])),
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (wishlist.length === 0) {
        return (
            <Container maxWidth={false}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5">Your wishlist is empty</Typography>
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
                    totalCount={wishlist.length}
                />
            </Box>
        </Container>
    );
};

export default WishlistPage;
