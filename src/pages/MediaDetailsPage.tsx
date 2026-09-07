import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { ArrowLeft } from 'lucide-react';
import { useMediaDetails } from '../services/api';
import { config } from '../config';
import { useWatchRegion } from '../hooks/useWatchRegion';
import MediaRating from '../components/MediaRating';
import RatingsPanel from '../components/RatingsPanel';
import WishlistButton from '../components/WishlistButton';
import WatchedButton from '../components/WatchedButton';
import WatchProviderButtons from '../components/WatchProviderButtons';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { MovieDetails, SeriesDetails, Genre } from '../types';
import { getGenreMapping } from '../utils/genreMap';
import { formatMediaDateRange, formatMediaRuntime, formatSeasonYear } from '../utils/mediaDate';

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

const MediaDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>();
  const { data: media, isLoading, error } = useMediaDetails(
    mediaType as 'movie' | 'tv',
    Number(id)
  );
  const [autoPlay, setAutoPlay] = useState(true);
  const watchRegion = useWatchRegion();

  const { ref: pageRef, focusKey } = useFocusable({
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  const { ref: backRef, focused: backFocused } = useFocusable({
    onEnterPress: () => navigate(-1),
  });

  const { ref: trailerRef, focused: trailerFocused } = useFocusable();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">{(error as Error)?.message || 'Media not found'}</p>
      </div>
    );
  }

  const movieMedia = media.media_type === 'movie' ? (media as MovieDetails) : null;
  const director = movieMedia?.credits?.crew?.find((p) => p.job === 'Director') ?? null;

  const creators =
    media.media_type === 'tv'
      ? media.credits?.crew?.filter(
          (p) => p.job === 'Creator' || p.job === 'Executive Producer' || p.job === 'Showrunner'
        )
      : [];

  const handleGenreClick = (genre: Genre) => {
    if (getGenreMapping(genre.name)) {
      navigate(`/genre/${genre.name}`, {
        state: { genreName: genre.name, scrollPosition: window.scrollY },
      });
    }
  };

  const trailer = media.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={pageRef as React.RefObject<HTMLDivElement>} className="flex flex-col min-h-full w-full relative bg-bg-default">
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

        {/* Hero area — push content below backdrop */}
        <div className="relative z-10 mt-[calc(25vh+64px)] sm:mt-[calc(30vh+64px)] md:mt-[calc(35vh+72px)] w-full max-w-4xl mx-auto px-4 sm:px-6">
          {/* Title row */}
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-white text-3xl sm:text-4xl font-bold flex-1 drop-shadow">
              {media.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              <WishlistButton mediaId={media.id} mediaType={media.media_type} iconSize={24} focusable />
              <WatchedButton mediaId={media.id} mediaType={media.media_type} iconSize={24} focusable />
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
            {movieMedia && director && (
              <span className="text-white/80 text-sm">• Dir: {director.name}</span>
            )}
            {media.media_type === 'tv' && (creators?.length ?? 0) > 0 && (
              <span className="text-white/80 text-sm">• {creators![0].name}</span>
            )}
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

        {/* Main content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-16 flex flex-col gap-6">

          {/* Overview card */}
          <div className="bg-bg-paper/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Poster */}
              <div className="w-full sm:w-36 flex-shrink-0">
                {media.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                    alt={media.title}
                    className="w-full rounded-xl aspect-[2/3] object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-xl bg-gray-800 animate-pulse" />
                )}
              </div>

              {/* Overview + director/creator */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Multi-source ratings */}
                <RatingsPanel
                  media={media}
                  releaseYear={
                    movieMedia
                      ? (movieMedia.release_date ? new Date(movieMedia.release_date).getFullYear() : null)
                      : null
                  }
                />
                <div>
                  <h2 className="text-white font-semibold mb-2">Overview</h2>
                  <p className="text-white/80 text-sm leading-relaxed">{media.overview}</p>
                </div>

                {/* Director */}
                {media.media_type === 'movie' && director && (
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-2">Director</h3>
                    <div className="flex items-center gap-3">
                      {director.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                          alt={director.name}
                          className="w-12 h-12 rounded-full object-cover object-top border border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
                      )}
                      <span className="text-white text-sm">{director.name}</span>
                    </div>
                  </div>
                )}

                {/* Creators */}
                {media.media_type === 'tv' && (creators?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-2">Creator{(creators?.length ?? 0) > 1 ? 's' : ''}</h3>
                    <div className="flex flex-wrap gap-3">
                      {creators!.slice(0, 2).map((creator) => (
                        <div key={creator.id} className="flex items-center gap-2">
                          {creator.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${creator.profile_path}`}
                              alt={creator.name}
                              className="w-10 h-10 rounded-full object-cover object-top border border-white/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                          )}
                          <span className="text-white text-sm">{creator.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Watch Providers */}
          {config.tmdbReadToken && (
            <div className="bg-bg-paper/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10">
              <WatchProviderButtons
                mediaType={media.media_type}
                mediaId={media.id}
                region={watchRegion}
              />
            </div>
          )}

          {/* Cast */}
          {(media.credits?.cast?.length ?? 0) > 0 && (
            <div className="bg-bg-paper/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-4">Cast</h2>
              <Carousel
                showThumbs={false}
                showStatus={false}
                showIndicators={false}
                infiniteLoop
                centerMode
                centerSlidePercentage={22}
                swipeable
                emulateTouch
                showArrows
                autoPlay={autoPlay}
                interval={3000}
                stopOnHover
                onSwipeStart={() => setAutoPlay(false)}
                onSwipeEnd={() => setAutoPlay(true)}
              >
                {media.credits!.cast
                  .filter((actor, index, self) => index === self.findIndex((a) => a.id === actor.id))
                  .slice(0, 10)
                  .map((actor) => (
                    <div key={actor.id} className="px-2 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-md mx-auto relative">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-full object-cover object-[center_20%]"
                          />
                        ) : (
                          <div className="w-full h-full animate-pulse bg-gray-700" />
                        )}
                      </div>
                      <p className="text-white text-xs font-semibold mt-2 leading-tight">{actor.name}</p>
                      <p className="text-text-secondary text-[0.65rem] leading-tight">{actor.character}</p>
                    </div>
                  ))}
              </Carousel>
            </div>
          )}

          {/* Trailer */}
          {trailer && (
            <div className="bg-bg-paper/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-4">Trailer</h2>
              <div
                ref={trailerRef as React.RefObject<HTMLDivElement>}
                className={`relative w-full ${trailerFocused ? 'ring-2 ring-primary rounded-xl' : ''}`}
                style={{ paddingTop: '56.25%' }}
              >
                <iframe
                  className="absolute inset-0 w-full h-full rounded-xl border-0"
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1`}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Seasons (TV) */}
          {media.media_type === 'tv' && (media as SeriesDetails).seasons?.length > 0 && (
            <div className="bg-bg-paper/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-4">Seasons</h2>
              <div className="flex flex-col gap-4">
                {(media as SeriesDetails).seasons.map((season) => (
                  <div key={season.id} className="flex gap-3 items-center">
                    {season.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w154${season.poster_path}`}
                        alt={season.name}
                        className="w-14 rounded-md object-cover flex-shrink-0"
                        style={{ aspectRatio: '2/3' }}
                      />
                    ) : (
                      <div className="w-14 flex-shrink-0 aspect-[2/3] rounded-md animate-pulse bg-gray-700" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{season.name}</p>
                      <p className="text-text-secondary text-xs">{season.episode_count} episodes</p>
                      <p className="text-text-secondary text-xs">{formatSeasonYear(season.air_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default MediaDetailsPage;
