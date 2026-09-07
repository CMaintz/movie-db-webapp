import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Tv } from 'lucide-react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { useGenreMedia } from '../hooks/useGenreMedia';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../context/AuthContext';
import MediaGrid from '../components/MediaGrid';
import Pagination from '../components/Pagination';
import { getGenreMapping, GENRES } from '../utils/genreMap';
import { useQueryClient } from '@tanstack/react-query';
import { GenreSortBy, getMediaByGenre } from '../services/api';
import { useWatchRegion } from '../hooks/useWatchRegion';
import { useOmdbBatch, OmdbItem } from '../services/omdb';
import { Media } from '../types';

const TABS = ['All', 'Movies', 'TV Shows'] as const;
type Tab = typeof TABS[number];

type SortOption = GenreSortBy | 'imdb' | 'rt';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Popular',     value: 'popularity.desc' },
  { label: 'Top Rated',   value: 'vote_average.desc' },
  { label: 'Newest',      value: 'release_date.desc' },
  { label: 'Oldest',      value: 'release_date.asc' },
  { label: 'IMDb',        value: 'imdb' },
  { label: 'RT Score',    value: 'rt' },
];

const GenrePage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [selectedGenre, setSelectedGenre] = useState('Action');
  const [movieId, setMovieId] = useState<number | undefined>();
  const [tvId, setTvId] = useState<number | undefined>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterMyServices, setFilterMyServices] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popularity.desc');

  const { user } = useAuth();
  const { settings } = useUserSettings();
  const effectiveRegion = useWatchRegion();

  useEffect(() => {
    const genreName = name || location.state?.genreName || selectedGenre;
    if (genreName) {
      setSelectedGenre(genreName);
      const mapping = getGenreMapping(genreName);
      if (mapping) {
        setMovieId(mapping.movieId);
        setTvId(mapping.tvId);
      }
    }
    if (location.state?.scrollPosition) {
      window.scrollTo(0, location.state.scrollPosition);
    }
  }, [name, location.state]);

  const activeProviders =
    filterMyServices && user && settings.streamingServiceIds.length > 0
      ? settings.streamingServiceIds
      : undefined;
  const watchRegion = activeProviders ? effectiveRegion : undefined;

  // For IMDb/RT client-side sorts, fetch from TMDB using popularity order
  const serverSort: GenreSortBy =
    sortBy === 'imdb' || sortBy === 'rt' ? 'popularity.desc' : (sortBy as GenreSortBy);

  const queryClient = useQueryClient();

  const { moviesData, tvData, movieCount, tvCount, totalCount } = useGenreMedia({
    movieId: movieId || 0,
    tvId: tvId || 0,
    page,
    shouldLoadAll: true,
    providerIds: activeProviders,
    watchRegion,
    sortBy: serverSort,
  });

  // Prefetch the next page as soon as current page data arrives, so navigation is instant
  useEffect(() => {
    if (activeTab === 'All' || !movieId || !tvId) return;

    const isMovieTab  = activeTab === 'Movies';
    const data        = isMovieTab ? moviesData : tvData;
    const genreId     = isMovieTab ? movieId    : tvId;
    const mediaType   = isMovieTab ? 'movie'    : 'tv';

    if (!data || page >= data.total_pages) return;

    queryClient.prefetchQuery({
      queryKey: ['mediaByGenre', mediaType, genreId, page + 1, activeProviders, watchRegion, serverSort],
      queryFn:  () => getMediaByGenre(mediaType, genreId, page + 1, activeProviders, watchRegion, serverSort),
      staleTime: 1000 * 60 * 5,
    });
  }, [moviesData, tvData, page, activeTab, movieId, tvId, activeProviders, watchRegion, serverSort]);

  // OMDb batch — only triggered when IMDb or RT sort is active
  const isClientSort = sortBy === 'imdb' || sortBy === 'rt';
  // currentTabMedia: items for the single-type tabs (Movies / TV Shows)
  const currentTabMedia: Media[] = useMemo(() => {
    if (activeTab === 'Movies') return moviesData?.results || [];
    if (activeTab === 'TV Shows') return tvData?.results || [];
    return [];
  }, [activeTab, moviesData, tvData]);

  // For the All tab, we sort movies and TV independently
  const allMovies: Media[] = moviesData?.results || [];
  const allTv: Media[]     = tvData?.results     || [];

  // OMDb batch: covers whichever list(s) are visible
  const omdbSourceItems: Media[] = activeTab === 'All'
    ? [...allMovies, ...allTv]
    : currentTabMedia;

  const omdbItems: OmdbItem[] = useMemo(
    () =>
      omdbSourceItems.map((m) => ({
        title: m.title,
        year: m.release_date ? new Date(m.release_date).getFullYear() : null,
        type: m.media_type,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(omdbSourceItems.map((m) => m.id))]
  );
  const omdbResults = useOmdbBatch(omdbItems, isClientSort);

  const clientSort = (items: Media[], offset = 0): Media[] => {
    if (!isClientSort) return items;
    return [...items].sort((a, b) => {
      const idxA = omdbSourceItems.indexOf(a) + offset;
      const idxB = omdbSourceItems.indexOf(b) + offset;
      const omdbA = omdbResults[idxA]?.data;
      const omdbB = omdbResults[idxB]?.data;
      if (sortBy === 'imdb') {
        return parseFloat(omdbB?.imdbRating || '0') - parseFloat(omdbA?.imdbRating || '0');
      }
      return parseInt(omdbB?.rottenTomatoes || '0%') - parseInt(omdbA?.rottenTomatoes || '0%');
    });
  };

  // Single-type sorted result (Movies tab / TV Shows tab)
  const sortedMedia: Media[] = useMemo(
    () => clientSort(currentTabMedia),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTabMedia, omdbResults, sortBy, isClientSort]
  );

  // All-tab section sorted results
  const sortedMovies: Media[] = useMemo(
    () => clientSort(allMovies, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allMovies, omdbResults, sortBy, isClientSort]
  );
  const sortedTv: Media[] = useMemo(
    () => clientSort(allTv, allMovies.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allTv, allMovies, omdbResults, sortBy, isClientSort]
  );

  // Norigin for tab bar
  const { ref: tabBarRef, focusKey: tabBarFocusKey } = useFocusable({ focusKey: 'GENRE_TABS' });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setDropdownOpen(false);
    navigate(`/genre/${genre}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!movieId || !tvId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">Invalid genre</p>
      </div>
    );
  }

  const tabData: Record<Tab, { count: number; totalPages: number }> = {
    All:        { count: totalCount,  totalPages: Math.max(moviesData?.total_pages || 0, tvData?.total_pages || 0) },
    Movies:     { count: movieCount,  totalPages: moviesData?.total_pages || 0 },
    'TV Shows': { count: tvCount,     totalPages: tvData?.total_pages || 0 },
  };

  return (
    <div className="w-full px-2 sm:px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-white text-2xl font-bold">Browse by Genre</h1>

        {/* My services toggle */}
        {user && settings.streamingServiceIds.length > 0 && (
          <button
            onClick={() => setFilterMyServices(!filterMyServices)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              filterMyServices
                ? 'bg-primary text-white border-primary'
                : 'text-white/70 border-white/20 hover:bg-white/10'
            }`}
          >
            <Tv className="w-4 h-4" />
            My services
          </button>
        )}

        {/* Genre dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px] justify-between"
          >
            {selectedGenre}
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-bg-paper border border-white/10 rounded-lg overflow-auto shadow-xl min-w-[150px] max-h-64">
              {GENRES.map((genre) => (
                <button
                  key={genre.name}
                  onClick={() => handleGenreChange(genre.name)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors focus:outline-none ${
                    genre.name === selectedGenre
                      ? 'text-primary bg-primary/10'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className="text-white/50 text-sm">Sort by</span>
          <div className="flex gap-1 bg-bg-paper rounded-lg p-1 flex-wrap">
            {SORT_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setSortBy(value); setPage(1); }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
                  sortBy === value ? 'bg-primary text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* IMDb/RT sort note */}
      {isClientSort && (
        <p className="text-white/40 text-xs mb-4 -mt-2">
          Sorted within current page — scores loaded from OMDb
        </p>
      )}

      {/* Tabs */}
      <FocusContext.Provider value={tabBarFocusKey}>
        <div ref={tabBarRef} className="flex gap-1 border-b border-white/10 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs text-text-secondary">
                ({tabData[tab].count.toLocaleString()})
              </span>
            </button>
          ))}
        </div>
      </FocusContext.Provider>

      {/* Content */}
      {activeTab === 'All' ? (
        /* All tab: two labeled sections side-by-side (no pagination — it's a discovery view) */
        <div className="flex flex-col gap-10">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-lg font-semibold">Movies</h2>
              {movieCount > 0 && (
                <button
                  onClick={() => handleTabChange('Movies')}
                  className="text-primary text-sm hover:underline focus:outline-none"
                >
                  View all {movieCount.toLocaleString()} →
                </button>
              )}
            </div>
            <MediaGrid
              media={isClientSort
                ? sortedMovies
                : (moviesData?.results || [])}
              showViewAll={false}
              showType={false}
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-lg font-semibold">TV Shows</h2>
              {tvCount > 0 && (
                <button
                  onClick={() => handleTabChange('TV Shows')}
                  className="text-primary text-sm hover:underline focus:outline-none"
                >
                  View all {tvCount.toLocaleString()} →
                </button>
              )}
            </div>
            <MediaGrid
              media={isClientSort
                ? sortedTv
                : (tvData?.results || [])}
              showViewAll={false}
              showType={false}
            />
          </section>
        </div>
      ) : (
        /* Movies / TV Shows tabs: paginated single-type grid */
        <>
          <MediaGrid
            media={sortedMedia}
            showViewAll={false}
            showType={false}
            showCount={true}
            totalCount={tabData[activeTab].count}
          />
          {tabData[activeTab].totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={page}
                totalPages={tabData[activeTab].totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenrePage;
