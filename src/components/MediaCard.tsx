import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { CheckCircle } from 'lucide-react';
import { Media } from '../types';
import WishlistButton from './WishlistButton';
import { useWatched } from '../hooks/useWatched';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useOmdbRatings } from '../services/omdb';

interface MediaCardProps {
  media: Media;
  showType?: boolean;
  onWishlistChange?: (mediaId: number, mediaType: 'movie' | 'tv', isWishlisted: boolean) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, showType = true, onWishlistChange }) => {
  const navigate = useNavigate();
  const { isWatched } = useWatched();
  const watched = isWatched(media.id, media.media_type);

  // Only fetch OMDb once the card is visible in the viewport
  const { ref: visRef, isVisible } = useIntersectionObserver();

  const releaseYear = media.release_date
    ? new Date(media.release_date).getFullYear()
    : null;
  const { data: omdb } = useOmdbRatings(media.title, releaseYear, media.media_type, isVisible);

  // D-pad / spatial navigation
  const { ref: focusRef, focused } = useFocusable({
    onEnterPress: () =>
      navigate(`/${media.media_type}/${media.id}`, {
        state: { backgroundLocation: window.location.pathname },
      }),
  });

  const handleClick = () => {
    navigate(`/${media.media_type}/${media.id}`, {
      state: { backgroundLocation: window.location.pathname },
    });
  };

  // Merge the two refs onto one DOM node
  const setRefs = (el: HTMLDivElement | null) => {
    (visRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (focusRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  const rtNum = omdb?.rottenTomatoes ? parseInt(omdb.rottenTomatoes) : null;

  return (
    <div
      ref={setRefs}
      onClick={handleClick}
      className={`relative cursor-pointer h-full flex flex-col bg-bg-paper rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02] focus:outline-none ${
        focused ? 'ring-2 ring-primary ring-offset-1 ring-offset-bg-default scale-[1.02]' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3]">
        {media.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={media.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-gray-800" />
        )}

        {/* Wishlist button — top right */}
        <WishlistButton
          mediaId={media.id}
          mediaType={media.media_type}
          className="absolute top-1.5 right-1.5"
          iconSize={18}
          onWishlistChange={(isWishlisted) =>
            onWishlistChange?.(media.id, media.media_type, isWishlisted)
          }
        />

        {/* Movie/Series chip — top left */}
        {showType && (
          <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full">
            {media.media_type === 'movie' ? 'Movie' : 'Series'}
          </span>
        )}

        {/* Watched badge — bottom left */}
        {watched && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/70 text-green-400 text-[0.65rem] px-1.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 fill-green-400/20" />
            Watched
          </span>
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 flex flex-col justify-between gap-1.5 p-2">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2">
          {media.title}
        </p>

        {/* Score row — TMDB always shown; IMDb + RT lazy-loaded */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[1.25rem]">
          {media.vote_average > 0 && (
            <span className="text-[#01b4e4] text-xs font-bold">
              ★ {media.vote_average.toFixed(1)}
            </span>
          )}
          {omdb?.imdbRating && (
            <span className="text-[#f5c518] text-xs font-semibold">
              IMDb {omdb.imdbRating}
            </span>
          )}
          {omdb?.rottenTomatoes && rtNum !== null && (
            <span className={`text-xs font-semibold ${rtNum >= 60 ? 'text-green-400' : 'text-red-400'}`}>
              🍅 {omdb.rottenTomatoes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
