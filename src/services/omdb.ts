import { useQuery, useQueries } from '@tanstack/react-query';
import { config } from '../config';
import { getCachedRatings, setCachedRatings } from './ratingsCache';

const OMDB_KEY = config.omdbApiKey;
const OMDB_BASE = 'https://www.omdbapi.com';

export interface OmdbRatings {
  imdbRating: string | null;     // e.g. "8.3"
  imdbVotes: string | null;      // e.g. "1,234,567"
  rottenTomatoes: string | null; // e.g. "87%"
  metacritic: string | null;     // e.g. "82/100"
}

export const getOmdbRatings = async (
  title: string,
  year: string | number | null,
  type: 'movie' | 'series'
): Promise<OmdbRatings | null> => {
  // 1. Check Firestore cache first — avoids burning OMDb quota
  const cached = await getCachedRatings(title, year, type);
  if (cached) return cached as OmdbRatings;

  // 2. No cache hit — call OMDb
  if (!OMDB_KEY) return null;
  try {
    const params = new URLSearchParams({
      apikey: OMDB_KEY,
      t: title,
      type,
      ...(year ? { y: String(year) } : {}),
    });
    const res = await fetch(`${OMDB_BASE}/?${params}`);
    const data = await res.json();
    if (data.Response === 'False') return null;

    const rt = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes');
    const mc = data.Ratings?.find((r: any) => r.Source === 'Metacritic');

    const result: OmdbRatings = {
      imdbRating:     data.imdbRating  !== 'N/A' ? data.imdbRating  : null,
      imdbVotes:      data.imdbVotes   !== 'N/A' ? data.imdbVotes   : null,
      rottenTomatoes: rt?.Value  ?? null,
      metacritic:     mc?.Value  ?? null,
    };

    // 3. Save to Firestore cache (fire-and-forget — non-critical)
    setCachedRatings(title, year, type, result);

    return result;
  } catch {
    return null;
  }
};

export const useOmdbRatings = (
  title: string,
  year: string | number | null,
  type: 'movie' | 'tv',
  enabled = true
) => {
  return useQuery<OmdbRatings | null>({
    queryKey: ['omdb', title, year, type],
    queryFn: () => getOmdbRatings(title, year, type === 'tv' ? 'series' : 'movie'),
    staleTime: 1000 * 60 * 60 * 24, // React Query also caches for 24h in-memory
    gcTime:    1000 * 60 * 60 * 24 * 7,
    enabled: !!title && enabled, // works even without OMDB_KEY (Firestore cache may have it)
  });
};

export interface OmdbItem {
  title: string;
  year: string | number | null;
  type: 'movie' | 'tv';
}

/** Batch-fetch OMDb ratings. Shares React Query cache with useOmdbRatings. */
export const useOmdbBatch = (items: OmdbItem[], enabled: boolean) => {
  return useQueries({
    queries: items.map((item) => ({
      queryKey: ['omdb', item.title, item.year, item.type],
      queryFn: () =>
        getOmdbRatings(item.title, item.year, item.type === 'tv' ? 'series' : 'movie'),
      staleTime: 1000 * 60 * 60 * 24,
      gcTime:    1000 * 60 * 60 * 24 * 7,
      enabled: !!item.title && enabled,
    })),
  });
};
