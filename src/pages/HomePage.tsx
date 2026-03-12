import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GENRES } from '../utils/genreMap';
import { useGenreMedia } from '../hooks/useGenreMedia';
import { useTrending, TrendingWindow } from '../services/api';
import { Media } from '../types';
import MediaGrid from '../components/MediaGrid';
import MediaRating from '../components/MediaRating';

// ---------- Trending Carousel ----------

const TRENDING_WINDOWS: { label: string; value: TrendingWindow }[] = [
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

const TrendingCarousel: React.FC = () => {
  const [window, setWindow] = useState<TrendingWindow>('week');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: trendingData, isLoading } = useTrending(mediaType, window);
  const items = trendingData?.results?.slice(0, 10) || [];

  const navigate = useNavigate();

  useEffect(() => {
    setCurrentIndex(0);
  }, [window, mediaType]);

  const prev = () => setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setCurrentIndex((i) => (i + 1) % items.length);

  const featured = items[currentIndex];

  return (
    <div className="w-full mb-8">
      {/* Controls row */}
      <div className="flex items-center gap-4 flex-wrap mb-4 px-2 sm:px-0">
        <h2 className="text-white text-xl font-semibold">Trending</h2>

        {/* Time window tabs */}
        <div className="flex gap-1 bg-bg-paper rounded-lg p-1">
          {TRENDING_WINDOWS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setWindow(value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                window === value ? 'bg-primary text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Movie/TV toggle */}
        <div className="flex gap-1 bg-bg-paper rounded-lg p-1">
          {(['movie', 'tv'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                mediaType === type ? 'bg-primary text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {type === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-[16/7] bg-bg-paper">
        {isLoading || !featured ? (
          <div className="w-full h-full animate-pulse bg-gray-800" />
        ) : (
          <>
            {/* Background */}
            <img
              src={
                featured.backdrop_path
                  ? `https://image.tmdb.org/t/p/w1280${featured.backdrop_path}`
                  : `https://image.tmdb.org/t/p/w500${featured.poster_path}`
              }
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Content */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 cursor-pointer"
              onClick={() => navigate(`/${featured.media_type || mediaType}/${featured.id}`)}
            >
              <h3 className="text-white text-xl sm:text-3xl font-bold mb-2 drop-shadow max-w-xl">
                {featured.title}
              </h3>
              <MediaRating voteAverage={featured.vote_average} size="medium" showVoteCount />
              {featured.overview && (
                <p className="text-white/70 text-sm mt-2 max-w-lg line-clamp-2 hidden sm:block">
                  {featured.overview}
                </p>
              )}
            </div>

            {/* Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`rounded-full transition-all focus:outline-none ${
                    i === currentIndex ? 'bg-primary w-5 h-1.5' : 'bg-white/40 w-1.5 h-1.5'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Genre sections ----------

const GenreSection: React.FC<{
  genre: { name: string; movieId: number; tvId: number };
  onViewAll: () => void;
}> = ({ genre, onViewAll }) => {
  const [page, setPage] = useState(1);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const itemsPerPage = 8;

  const { combinedMedia, totalCount, moviesLoading, tvLoading } = useGenreMedia({
    movieId: genre.movieId,
    tvId: genre.tvId,
    page,
    shouldLoadAll: false,
    itemsPerPage,
  });

  useEffect(() => {
    if (combinedMedia && combinedMedia.length > 0) {
      if (page === 1) {
        setAllMedia(combinedMedia);
      } else {
        setAllMedia((prev) => {
          const newItems = combinedMedia.filter(
            (item) => !prev.some((existing) => existing.id === item.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [combinedMedia, page]);

  return (
    <MediaGrid
      media={allMedia}
      title={genre.name}
      onViewAll={onViewAll}
      showViewAll={true}
      showType={true}
      showLoadMore={allMedia.length < totalCount && !moviesLoading && !tvLoading}
      onLoadMore={() => setPage((p) => p + 1)}
      totalCount={totalCount}
      showCount={true}
    />
  );
};

// ---------- HomePage ----------

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-2 sm:px-4 py-4">
      <TrendingCarousel />
      {GENRES.map((genre) => (
        <GenreSection
          key={genre.name}
          genre={genre}
          onViewAll={() => {
            const scrollPosition = window.scrollY;
            navigate(`/genre/${genre.name}`, { state: { genreName: genre.name, scrollPosition } });
          }}
        />
      ))}
    </div>
  );
};

export default HomePage;
