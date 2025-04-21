import React from 'react';
import { Grid, Box, Typography, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Media } from '../types';
import MediaCard from './MediaCard';
import { ArrowForward } from '@mui/icons-material';



interface MediaGridProps {
  media: Media[];
  title: string;
  showType?: boolean;
  showViewAll?: boolean;
  viewAllPath?: string;
  onViewAll?: () => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  showCount?: boolean;
  onMediaChange?: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  title,
  showType = true,
  showViewAll = true,
  viewAllPath,
  onViewAll,
  showLoadMore = false,
  onLoadMore,
  totalCount,
  showCount = false,
  onMediaChange,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (viewAllPath) {
      navigate(viewAllPath);
    }
  };

    // Handle wishlist changes at the grid level
    const handleWishlistChange = (mediaId: number, mediaType: 'movie' | 'tv', isWishlisted: boolean) => {
      if (onMediaChange) {
        onMediaChange();
      }
    };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%',
      mx: 'auto',
      px: 'auto',
      mb: 2,
      boxSizing: 'border-box'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        mb: 2,
        width: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          {showCount && totalCount !== undefined && (
            <Typography variant="body2" color="text.secondary">
              ({totalCount.toLocaleString()} titles)
            </Typography>
          )}
          {showViewAll && (viewAllPath || onViewAll) && (
            <Button
              onClick={handleViewAll}
              variant="outlined"
              color="primary"
              size="small"
              endIcon={<ArrowForward />}
              sx={{ 
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: '100px' },
                px: { xs: 1, sm: 2 },
                py: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 2px 4px ${theme.palette.primary.main}40`,
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: 'none',
                }
              }}
            >
              View All
            </Button>
          )}
        </Box>
      </Box>
      <Grid 
        container 
        spacing={{ xs: '0.5rem', sm: '1rem', md: '1.5rem' }}
        columns={{ xs: 4, sm: 8, md: 12, lg: 16, xl: 16 }}
        sx={{ 
          width: '100%',
          margin: 0
        }}
      >
        {media.map((item) => (
          <Grid 
            key={item.id} 
            size={{ xs: 2, sm: 4, md: 3, lg: 2, xl: 2 }}
          >
            <MediaCard media={item} showType={showType} onWishlistChange={handleWishlistChange}/>
          </Grid>
        ))}
      </Grid>
      {showLoadMore && onLoadMore && media.length < (totalCount || 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            onClick={onLoadMore}
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MediaGrid; 