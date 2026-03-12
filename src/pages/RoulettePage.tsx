import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, RefreshCw, Tv } from 'lucide-react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { discoverRandom, getMediaDetails } from '../services/api';
import { getOmdbRatings } from '../services/omdb';
import { GENRES } from '../utils/genreMap';
import { useWishlist } from '../hooks/useWishlist';
import { useWatched } from '../hooks/useWatched';
import { useAuth } from '../context/AuthContext';
import { useUserSettings } from '../hooks/useUserSettings';
import { useWatchRegion } from '../hooks/useWatchRegion';
import { config } from '../config';
import { Media } from '../types';
import MediaCard from '../components/MediaCard';

type MediaTypeFilter = 'movie' | 'tv' | 'both';
type GenreMode = 'AND' | 'OR';
type Source = 'tmdb' | 'wishlist';
type ScoreSource = 'tmdb' | 'imdb' | 'rt';

const SCORE_LABELS: Record<ScoreSource, string> = {
  tmdb: 'TMDB (out of 10)',
  imdb: 'IMDb (out of 10)',
  rt:   'Rotten Tomatoes (%)',
};

const RoulettePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const effectiveRegion = useWatchRegion();
  const { wishlist } = useWishlist();
  const { isWatched } = useWatched();
  const { settings } = useUserSettings();

  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [genreMode, setGenreMode] = useState<GenreMode>('OR');
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('both');
  const [minRating, setMinRating] = useState(0);
  const [scoreSource, setScoreSource] = useState<ScoreSource>('tmdb');
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [source, setSource] = useState<Source>('tmdb');
  const [excludeWatched, setExcludeWatched] = useState(true);
  const [filterMyServices, setFilterMyServices] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Media | null>(null);
  const [error, setError] = useState('');

  const spinnerPosters = useRef<string[]>([]);
  const [spinnerIndex, setSpinnerIndex] = useState(0);

  // Norigin for the spin button
  const { ref: spinRef, focused: spinFocused } = useFocusable({ onEnterPress: () => !spinning && spin() });

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const getRandomFromArray = <T,>(arr: T[]): T | null =>
    arr.length === 0 ? null : arr[Math.floor(Math.random() * arr.length)];

  /** Check if a candidate meets the minimum score threshold for the chosen score source. */
  const meetsScoreThreshold = async (
    candidate: Media,
    threshold: number,
    source: ScoreSource
  ): Promise<boolean> => {
    if (threshold <= 0) return true;
    if (source === 'tmdb') {
      return (candidate.vote_average || 0) >= threshold;
    }
    // IMDb / RT — need OMDb lookup
    if (!config.omdbApiKey) return true; // can't check without API key
    const year = candidate.release_date
      ? new Date(candidate.release_date).getFullYear()
      : null;
    const omdb = await getOmdbRatings(
      candidate.title,
      year,
      candidate.media_type === 'tv' ? 'series' : 'movie'
    );
    if (!omdb) return false;
    if (source === 'imdb') {
      return parseFloat(omdb.imdbRating || '0') >= threshold;
    }
    // rt — compare percentage number (threshold treated as %)
    return parseInt(omdb.rottenTomatoes || '0%') >= threshold;
  };

  const spin = async () => {
    setError('');
    setResult(null);
    setSpinning(true);

    const activeProviders =
      filterMyServices && user && settings.streamingServiceIds.length > 0
        ? settings.streamingServiceIds
        : undefined;
    const watchRegion = activeProviders ? effectiveRegion : undefined;

    try {
      let picked: Media | null = null;

      if (source === 'wishlist') {
        const filtered = wishlist
          .filter((item) => {
            if (mediaType === 'movie') return item.media_type === 'movie';
            if (mediaType === 'tv') return item.media_type === 'tv';
            return true;
          })
          .filter((item) => !excludeWatched || !isWatched(item.id, item.media_type));

        if (filtered.length === 0) {
          setError('No items in wishlist matching your filters.');
          setSpinning(false);
          return;
        }

        // Try up to 5 candidates to meet the score threshold
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled.slice(0, 5)) {
          const full = await getMediaDetails(candidate.media_type, candidate.id);
          if (await meetsScoreThreshold(full, minRating, scoreSource)) {
            picked = full;
            break;
          }
        }
        if (!picked) {
          // Fall back to first candidate if none meet threshold
          picked = await getMediaDetails(shuffled[0].media_type, shuffled[0].id);
        }
      } else {
        // TMDB discover
        const types: ('movie' | 'tv')[] =
          mediaType === 'both' ? ['movie', 'tv'] : [mediaType];
        const chosenType = getRandomFromArray(types)!;

        const genreIds = selectedGenres
          .map((idx) => {
            const g = GENRES.find((_, i) => i === idx) || GENRES[idx];
            return chosenType === 'movie' ? g?.movieId : g?.tvId;
          })
          .filter(Boolean) as number[];

        // TMDB discover filter is always by TMDB score (server-side);
        // IMDb/RT threshold is validated client-side after picking.
        const tmdbMinRating = scoreSource === 'tmdb' ? minRating : 0;

        const firstPage = await discoverRandom(
          chosenType, genreIds, genreMode,
          tmdbMinRating,
          yearFrom ? parseInt(yearFrom) : null,
          yearTo ? parseInt(yearTo) : null,
          1,
          activeProviders,
          watchRegion
        );

        if (!firstPage.total_pages) {
          setError('No results found for these filters.');
          setSpinning(false);
          return;
        }

        spinnerPosters.current = firstPage.results
          .filter((m) => m.poster_path)
          .map((m) => `https://image.tmdb.org/t/p/w185${m.poster_path}`)
          .slice(0, 8);

        // Try up to 3 random pages to find a candidate meeting the score threshold
        let found: Media | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const randomPage =
            Math.floor(Math.random() * Math.min(firstPage.total_pages, 100)) + 1;
          const pageData =
            randomPage === 1
              ? firstPage
              : await discoverRandom(
                  chosenType, genreIds, genreMode,
                  tmdbMinRating,
                  yearFrom ? parseInt(yearFrom) : null,
                  yearTo ? parseInt(yearTo) : null,
                  randomPage,
                  activeProviders,
                  watchRegion
                );

          let candidates = pageData.results.filter(
            (m) => !excludeWatched || !isWatched(m.id, m.media_type || chosenType)
          );
          if (candidates.length === 0) candidates = pageData.results;

          const shuffled = [...candidates].sort(() => Math.random() - 0.5);
          for (const c of shuffled.slice(0, 5)) {
            if (await meetsScoreThreshold(c, minRating, scoreSource)) {
              found = c;
              break;
            }
          }
          if (found) break;
        }

        picked = found || getRandomFromArray(firstPage.results);
      }

      // Animate for ~2 seconds
      let tick = 0;
      const interval = setInterval(() => {
        setSpinnerIndex((i) => (i + 1) % Math.max(spinnerPosters.current.length, 1));
        tick++;
        if (tick > 12) {
          clearInterval(interval);
          setSpinning(false);
          if (picked) {
            setResult({
              ...picked,
              media_type: picked.media_type || (mediaType === 'both' ? 'movie' : mediaType),
            });
          } else {
            setError('Could not find a matching title. Try adjusting your filters.');
          }
        }
      }, 150);
    } catch (err) {
      setSpinning(false);
      setError('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  // Rating slider ranges differ by score source
  const ratingMax = scoreSource === 'rt' ? 100 : 10;
  const ratingStep = scoreSource === 'rt' ? 5 : 0.5;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Shuffle className="w-7 h-7 text-primary" />
        <h1 className="text-white text-2xl font-bold">Movie Roulette</h1>
      </div>

      {/* Filters card */}
      <div className="bg-bg-paper/80 backdrop-blur rounded-2xl p-5 border border-white/10 flex flex-col gap-5">

        {/* Source */}
        <div>
          <p className="text-white/70 text-sm mb-2">Pick from</p>
          <div className="flex gap-2">
            {(['tmdb', 'wishlist'] as Source[]).map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                disabled={s === 'wishlist' && !user}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${
                  source === s ? 'bg-primary text-white' : 'bg-bg-default text-white/70 hover:bg-white/10'
                }`}
              >
                {s === 'tmdb' ? 'All TMDB' : 'My Wishlist'}
              </button>
            ))}
          </div>
        </div>

        {/* My services toggle (TMDB only) */}
        {source === 'tmdb' && user && settings.streamingServiceIds.length > 0 && (
          <div>
            <p className="text-white/70 text-sm mb-2">Filter by</p>
            <button
              onClick={() => setFilterMyServices(!filterMyServices)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                filterMyServices
                  ? 'bg-primary text-white border-primary'
                  : 'text-white/70 border-white/20 bg-bg-default hover:bg-white/10'
              }`}
            >
              <Tv className="w-4 h-4" />
              My services
            </button>
          </div>
        )}

        {/* Media type */}
        <div>
          <p className="text-white/70 text-sm mb-2">Type</p>
          <div className="flex gap-2">
            {(['movie', 'tv', 'both'] as MediaTypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setMediaType(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  mediaType === t ? 'bg-primary text-white' : 'bg-bg-default text-white/70 hover:bg-white/10'
                }`}
              >
                {t === 'movie' ? 'Movies' : t === 'tv' ? 'TV Shows' : 'Both'}
              </button>
            ))}
          </div>
        </div>

        {/* Genres (TMDB only) */}
        {source === 'tmdb' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-white/70 text-sm">Genres</p>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <span>Match</span>
                <button
                  onClick={() => setGenreMode((m) => (m === 'AND' ? 'OR' : 'AND'))}
                  className="bg-bg-default border border-white/20 px-2 py-0.5 rounded text-white/80 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {genreMode === 'AND' ? 'ALL (AND)' : 'ANY (OR)'}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre, i) => (
                <button
                  key={genre.name}
                  onClick={() => toggleGenre(i)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    selectedGenres.includes(i)
                      ? 'bg-primary text-white'
                      : 'bg-bg-default border border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Minimum rating */}
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <p className="text-white/70 text-sm">
              Minimum score:{' '}
              <span className="text-white font-medium">
                {minRating.toFixed(scoreSource === 'rt' ? 0 : 1)}
                {scoreSource === 'rt' ? '%' : ''}
              </span>
            </p>
            {/* Score source selector */}
            <div className="flex gap-1 bg-bg-default rounded-lg p-0.5 ml-auto">
              {(['tmdb', 'imdb', 'rt'] as ScoreSource[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScoreSource(s);
                    setMinRating(0);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus:outline-none ${
                    scoreSource === s ? 'bg-primary text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s === 'tmdb' ? 'TMDB' : s === 'imdb' ? 'IMDb' : 'RT'}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={ratingMax}
            step={ratingStep}
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-white/30 text-xs mt-1">{SCORE_LABELS[scoreSource]}</p>
          {(scoreSource === 'imdb' || scoreSource === 'rt') && !config.omdbApiKey && (
            <p className="text-yellow-500/70 text-xs mt-1">
              OMDb API key not set — score filter will be skipped
            </p>
          )}
        </div>

        {/* Year range (TMDB only) */}
        {source === 'tmdb' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-white/70 text-sm mb-1 block">From year</label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30"
              />
            </div>
            <div className="flex-1">
              <label className="text-white/70 text-sm mb-1 block">To year</label>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder={`e.g. ${new Date().getFullYear()}`}
                className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30"
              />
            </div>
          </div>
        )}

        {/* Exclude watched */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeWatched}
            onChange={(e) => setExcludeWatched(e.target.checked)}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-white/80 text-sm">Exclude already watched</span>
        </label>
      </div>

      {/* Spin button */}
      <button
        ref={spinRef}
        onClick={spin}
        disabled={spinning}
        className={`w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl text-lg transition-colors focus:outline-none disabled:opacity-60 ${
          spinFocused ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-default' : ''
        }`}
      >
        {spinning ? (
          <RefreshCw className="w-6 h-6 animate-spin" />
        ) : (
          <Shuffle className="w-6 h-6" />
        )}
        {spinning ? 'Finding something…' : 'Spin!'}
      </button>

      {/* Spinner animation */}
      {spinning && spinnerPosters.current.length > 0 && (
        <div className="flex justify-center gap-3 overflow-hidden">
          {[-1, 0, 1].map((offset) => {
            const idx =
              (spinnerIndex + offset + spinnerPosters.current.length) %
              spinnerPosters.current.length;
            const poster = spinnerPosters.current[idx];
            return (
              <div
                key={offset}
                className={`rounded-xl overflow-hidden flex-shrink-0 transition-all duration-150 ${
                  offset === 0 ? 'w-28 opacity-100 scale-100' : 'w-20 opacity-40 scale-90'
                }`}
                style={{ aspectRatio: '2/3' }}
              >
                {poster ? (
                  <img src={poster} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-bg-paper animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !spinning && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <h2 className="text-white text-lg font-semibold text-center">Your pick!</h2>
          <div className="max-w-[180px] mx-auto w-full">
            <MediaCard media={result} showType />
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate(`/${result.media_type}/${result.id}`)}
              className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              View Details
            </button>
            <button
              onClick={spin}
              className="border border-white/30 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Spin Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoulettePage;
