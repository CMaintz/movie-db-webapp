import React, { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useWatched } from '../hooks/useWatched';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface WatchedButtonProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  className?: string;
  iconSize?: number;
  onWatchedChange?: (isWatched: boolean) => void;
  focusable?: boolean;
}

const WatchedButton: React.FC<WatchedButtonProps> = ({
  mediaId,
  mediaType,
  className = '',
  iconSize = 20,
  onWatchedChange,
  focusable: enableFocus = false,
}) => {
  const { user } = useAuth();
  const { isWatched, addToWatched, removeFromWatched } = useWatched();
  const { isInWishlist, removeFromWishlist } = useWishlist();
  const [animating, setAnimating] = useState(false);

  const watched = isWatched(mediaId, mediaType);

  const handleToggle = async () => {
    if (!user) {
      toast.info('Please log in to manage your watched list');
      return;
    }

    let success = false;
    if (watched) {
      success = await removeFromWatched(mediaId, mediaType);
      if (success) toast.success('Removed from watched');
    } else {
      success = await addToWatched(mediaId, mediaType);
      if (success) {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);
        // Auto-remove from wishlist when marking as watched
        if (isInWishlist(mediaId, mediaType)) {
          await removeFromWishlist(mediaId, mediaType);
          toast.success('Marked as watched & removed from wishlist');
        } else {
          toast.success('Marked as watched');
        }
      }
    }

    if (success && onWatchedChange) {
      onWatchedChange(!watched);
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
      aria-label={watched ? 'Remove from watched' : 'Mark as watched'}
    >
      {watched ? (
        <CheckCircle
          width={iconSize}
          height={iconSize}
          className={`text-green-400 fill-green-400/20 transition-transform ${animating ? 'scale-125' : ''}`}
        />
      ) : (
        <Circle
          width={iconSize}
          height={iconSize}
          className="text-white/70"
        />
      )}
    </button>
  );
};

export default WatchedButton;
