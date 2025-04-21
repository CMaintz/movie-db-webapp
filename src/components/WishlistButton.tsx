import React, { useState } from 'react';
import { IconButton, Tooltip, keyframes } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';

const heartbeat = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
`;

interface WishlistButtonProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  sx?: any;
  onWishlistChange?: (isWishlisted: boolean) => void; // Add callback prop
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ mediaId, mediaType, sx,  onWishlistChange}) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, refreshWishlist } = useWishlist();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isWishlisted = isInWishlist(mediaId, mediaType);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowTooltip(true);
      return;
    }
    let success = false;
    if (isWishlisted) {
      success = await removeFromWishlist(mediaId, mediaType);

    } else {
      success = await addToWishlist(mediaId, mediaType);
      if (success) {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 500);
    }
  }
    // If successful, notify parent and refresh wishlist
    if (success) {
      if (onWishlistChange) {
        onWishlistChange(!isWishlisted);
      }
      await refreshWishlist();
    }
  };

  return (
    <Tooltip 
      title="Please login to add to wishlist" 
      open={showTooltip}
      onClose={() => setShowTooltip(false)}
      placement="top"
      arrow
    >
      <IconButton
        onClick={handleWishlistClick}
        sx={{
          ...sx,
          '& .MuiSvgIcon-root': {
            animation: shouldAnimate ? `${heartbeat} 0.5s ease-in-out` : 'none',
          }
        }}
      >
        {isWishlisted ? (
          <Favorite color="error" />
        ) : (
          <FavoriteBorder sx={{ color: 'white' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default WishlistButton; 