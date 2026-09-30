import React, { useState } from 'react';
import { IconButton, SxProps, Theme, Tooltip, keyframes } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/useAuth';
import { MediaType } from '../types';

const heartbeat = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

interface WishlistButtonProps {
    mediaId: number;
    mediaType: MediaType;
    sx?: SxProps<Theme>;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ mediaId, mediaType, sx }) => {
    const { user } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const isWishlisted = isInWishlist(mediaId, mediaType);

    const handleClick = async (e: React.MouseEvent) => {
        // The button sits inside a clickable card
        e.stopPropagation();

        if (!user) {
            setShowTooltip(true);
            return;
        }

        if (isWishlisted) {
            await removeFromWishlist(mediaId, mediaType);
        } else if (await addToWishlist(mediaId, mediaType)) {
            setShouldAnimate(true);
            setTimeout(() => setShouldAnimate(false), 500);
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
                onClick={handleClick}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
                sx={[
                    {
                        '& .MuiSvgIcon-root': {
                            animation: shouldAnimate ? `${heartbeat} 0.5s ease-in-out` : 'none',
                        },
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                {isWishlisted ? <Favorite color="error" /> : <FavoriteBorder sx={{ color: 'white' }} />}
            </IconButton>
        </Tooltip>
    );
};

export default WishlistButton;
