import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface WishlistButtonProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  className?: string;
  iconSize?: number;
  onWishlistChange?: (isWishlisted: boolean) => void;
  focusable?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  mediaId,
  mediaType,
  className = '',
  iconSize = 20,
  onWishlistChange,
  focusable: enableFocus = false,
}) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [animating, setAnimating] = useState(false);

  const isWishlisted = isInWishlist(mediaId, mediaType);

  const handleToggle = async () => {
    if (!user) {
      toast.info('Please log in to manage your wishlist');
      return;
    }

    let success = false;
    if (isWishlisted) {
      success = await removeFromWishlist(mediaId, mediaType);
      if (success) toast.success('Removed from wishlist');
    } else {
      success = await addToWishlist(mediaId, mediaType);
      if (success) {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 500);
        toast.success('Added to wishlist');
      }
    }
    if (success && onWishlistChange) {
      onWishlistChange(!isWishlisted);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggle();
  };

  const { ref, focused } = useFocusable({
    focusable: enableFocus,
    onEnterPress: handleToggle,
  });

  return (
    <button
      ref={enableFocus ? ref as React.RefObject<HTMLButtonElement> : undefined}
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-primary transition-colors p-1.5 ${
        enableFocus && focused ? 'ring-2 ring-primary' : ''
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        width={iconSize}
        height={iconSize}
        className={`transition-transform ${animating ? 'animate-heartbeat' : ''} ${
          isWishlisted ? 'text-red-500 fill-red-500' : 'text-white fill-transparent'
        }`}
      />
    </button>
  );
};

export default WishlistButton;
