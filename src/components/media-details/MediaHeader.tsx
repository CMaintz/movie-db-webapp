import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { ArrowLeft } from 'lucide-react';
import MediaRating from '../MediaRating';
import WishlistButton from '../WishlistButton';
import WatchedButton from '../WatchedButton';
import { MediaDetails, MovieDetails, Genre } from '../../types';
import { getGenreMapping } from '../../utils/genreMap';
import { formatMediaDateRange, formatMediaRuntime } from '../../utils/mediaDate';
import { getCreators, getDirector } from './credits';

const FocusableGenreChip: React.FC<{ genre: Genre; onClick: () => void }> = ({ genre, onClick }) => {
  const { ref, focused } = useFocusable({ onEnterPress: onClick });
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      className={`bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition-colors focus:outline-none ${
        focused ? 'ring-2 ring-primary bg-white/30' : ''
      }`}
    >
      {genre.name}
    </button>
  );
};

const READABLE_ON_ANY_BACKDROP = 'border border-white/25 backdrop-blur-md shadow-lg shadow-black/40';

/**
 * Backdrop, back button and the title block. The backdrop is fixed-positioned,
 * so it paints behind the whole page regardless of where this sits in the DOM.
 */
const MediaHeader: React.FC<{ media: MediaDetails }> = ({ media }) => {
  const navigate = useNavigate();
  const { ref: backRef, focused: backFocused } = useFocusable({
    onEnterPress: () => navigate(-1),
  });

  const movieMedia = media.media_type === 'movie' ? (media as MovieDetails) : null;
  const director = getDirector(media);
  const creators = getCreators(media);

  const handleGenreClick = (genre: Genre) => {
    if (getGenreMapping(genre.name)) {
      navigate(`/genre/${genre.name}`, {
        state: { genreName: genre.name, scrollPosition: window.scrollY },
      });
    }
  };

  return (
    <>
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none"
        style={{
          backgroundImage: media.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${media.backdrop_path})`
            : 'linear-gradient(45deg, #2E3B4E 0%, #1A1E2A 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/50" />
      </div>

      {/* Back button */}
      <button
        ref={backRef as React.RefObject<HTMLButtonElement>}
        onClick={() => navigate(-1)}
        className={`fixed left-4 top-16 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur focus:outline-none transition-colors ${
          backFocused ? 'ring-2 ring-primary' : ''
        }`}
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero area: clear the back button, keep some backdrop visible */}
      <div className="relative z-10 mt-16 sm:mt-20 md:mt-[14vh] w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-white text-3xl sm:text-4xl font-bold min-w-0 drop-shadow">
            {media.title}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <WishlistButton mediaId={media.id} mediaType={media.media_type} iconSize={22} className={READABLE_ON_ANY_BACKDROP} focusable />
            <WatchedButton mediaId={media.id} mediaType={media.media_type} iconSize={22} className={READABLE_ON_ANY_BACKDROP} focusable />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <MediaRating voteAverage={media.vote_average} size="medium" />
          <span className="text-white/80 text-sm">
            {movieMedia
              ? [formatMediaDateRange(movieMedia), formatMediaRuntime(movieMedia)].filter(Boolean).join(' • ')
              : formatMediaDateRange(media, true)}
          </span>
          {director && <span className="text-white/80 text-sm">• Dir: {director.name}</span>}
          {creators.length > 0 && <span className="text-white/80 text-sm">• {creators[0].name}</span>}
        </div>

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2 pb-6">
          {media.genres.map((genre: Genre) => (
            <FocusableGenreChip
              key={genre.id}
              genre={genre}
              onClick={() => handleGenreClick(genre)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default MediaHeader;
