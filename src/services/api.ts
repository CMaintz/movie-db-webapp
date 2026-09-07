import { MediaResponse, Genre, MediaDetails } from '../types';
import { useQuery } from '@tanstack/react-query';
import { config } from '../config';

const BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'en-US';
const MAX_PAGE_LIMIT = 500;

// Computed once at module load — valid for the whole session
const TODAY = new Date().toISOString().split('T')[0];

// --- Fetch helpers ---

// URLSearchParams encodes | as %7C; TMDB expects literal pipes for multi-value params
const serializeParams = (p: URLSearchParams): string => p.toString().replace(/%7C/gi, '|');

const buildParams = (extra: Record<string, any> = {}): string => {
  const p = new URLSearchParams();
  p.set('api_key', config.tmdbApiKey);
  p.set('language', DEFAULT_LANGUAGE);
  for (const [k, v] of Object.entries(extra)) {
    if (v !== undefined && v !== null) p.set(k, String(v));
  }
  return serializeParams(p);
};

const tmdbGet = async <T>(path: string, params: Record<string, any> = {}): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}?${buildParams(params)}`);
  if (!res.ok) {
    if (res.status === 403) console.error('API error 403:', path);
    throw new Error(`TMDB ${res.status}: ${path}`);
  }
  return res.json();
};

const tmdbGetBearer = async <T>(path: string, params: Record<string, any> = {}): Promise<T> => {
  const p = new URLSearchParams({ language: DEFAULT_LANGUAGE });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) p.set(k, String(v));
  }
  const res = await fetch(`${BASE_URL}${path}?${serializeParams(p)}`, {
    headers: { Authorization: `Bearer ${config.tmdbReadToken}` },
  });
  if (!res.ok) throw new Error(`TMDB Bearer ${res.status}: ${path}`);
  return res.json();
};

const getSafePage = (page: number): number => Math.min(page, MAX_PAGE_LIMIT);

/**
 * Adds "already released and available for home viewing" filters to a discover params object.
 * Movies: capped at today + must have a digital/physical/TV release (not theatrical-only).
 * TV:     capped at today (first air date in the past).
 */
const addAvailabilityFilters = (params: Record<string, any>, mediaType: 'movie' | 'tv'): void => {
  if (mediaType === 'movie') {
    params['primary_release_date.lte'] = TODAY;
    params['with_release_type'] = '4|5|6'; // 4=Digital, 5=Physical, 6=TV — excludes theatrical-only
  } else {
    params['first_air_date.lte'] = TODAY;
  }
};

// --- Trending ---

export type TrendingWindow = 'day' | 'week' | 'month' | 'year';

export const getTrending = async (
  mediaType: 'movie' | 'tv' = 'movie',
  window: TrendingWindow = 'week',
  page: number = 1
): Promise<MediaResponse> => {
  const safePage = getSafePage(page);

  // TMDB only has /trending/{type}/day and /trending/{type}/week natively.
  // For month/year we use /discover with a date range sorted by popularity.
  if (window === 'day' || window === 'week') {
    const data = await tmdbGet<MediaResponse>(`/trending/${mediaType}/${window}`, {
      page: safePage,
      with_original_language: 'en',
    });
    if (data.total_pages > MAX_PAGE_LIMIT) data.total_pages = MAX_PAGE_LIMIT;
    return data;
  }

  const now = new Date();
  let dateFrom: string;
  if (window === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFrom = d.toISOString().split('T')[0];
  } else {
    dateFrom = `${now.getFullYear()}-01-01`;
  }

  const dateField = mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
  const params: Record<string, any> = {
    [dateField]: dateFrom,
    sort_by: 'popularity.desc',
    with_original_language: 'en',
    page: safePage,
  };
  addAvailabilityFilters(params, mediaType);

  const data = await tmdbGet<MediaResponse>(`/discover/${mediaType}`, params);

  const results = data.results.map((item: any) => ({
    ...item,
    media_type: mediaType,
    title: item.title || item.name,
  }));

  if (data.total_pages > MAX_PAGE_LIMIT) data.total_pages = MAX_PAGE_LIMIT;
  return { ...data, results };
};

// --- Genres ---

export const getGenres = async (mediaType: 'movie' | 'tv'): Promise<Genre[]> => {
  const data = await tmdbGet<{ genres: Genre[] }>(`/genre/${mediaType}/list`);
  return data.genres;
};

// --- Genre sort ---

export type GenreSortBy =
  | 'popularity.desc'
  | 'vote_average.desc'
  | 'release_date.desc'
  | 'release_date.asc';

const resolveSort = (sortBy: GenreSortBy, mediaType: 'movie' | 'tv'): string => {
  if (sortBy === 'release_date.desc')
    return mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
  if (sortBy === 'release_date.asc')
    return mediaType === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc';
  return sortBy;
};

// --- Media by genre ---

export const getMediaByGenre = async (
  mediaType: 'movie' | 'tv',
  genreId: number,
  page: number = 1,
  providerIds?: number[],
  watchRegion?: string,
  sortBy: GenreSortBy = 'popularity.desc'
): Promise<MediaResponse> => {
  const safePage = getSafePage(page);
  const params: Record<string, any> = {
    with_genres: genreId,
    page: safePage,
    with_original_language: 'en',
    sort_by: resolveSort(sortBy, mediaType),
  };

  if (sortBy === 'vote_average.desc') {
    params['vote_count.gte'] = 100;
  }

  addAvailabilityFilters(params, mediaType);

  if (providerIds && providerIds.length > 0 && watchRegion) {
    params.with_watch_providers = providerIds.join('|');
    params.watch_region = watchRegion;
  }

  const data = await tmdbGet<MediaResponse>(`/discover/${mediaType}`, params);

  if (data.total_pages > MAX_PAGE_LIMIT) data.total_pages = MAX_PAGE_LIMIT;

  const results = data.results.map((item: any) => ({
    ...item,
    media_type: mediaType,
    title: item.title || item.name,
  }));

  return { ...data, results };
};

// --- Media details ---

export const getMediaDetails = async (
  mediaType: 'movie' | 'tv',
  id: number
): Promise<MediaDetails> => {
  const data = await tmdbGet<any>(`/${mediaType}/${id}`, {
    append_to_response: 'credits,videos,runtime,status,last_air_date',
  });

  return {
    ...data,
    media_type: mediaType,
    title: data.title || data.name,
    release_date: data.release_date || data.first_air_date,
  };
};

// --- Media count by genre ---

export const getMediaCountByGenre = async (
  mediaType: 'movie' | 'tv',
  genreId: number,
  providerIds?: number[],
  watchRegion?: string
): Promise<number> => {
  const params: Record<string, any> = {
    with_genres: genreId,
    page: 1,
    with_original_language: 'en',
  };
  addAvailabilityFilters(params, mediaType);
  if (providerIds && providerIds.length > 0 && watchRegion) {
    params.with_watch_providers = providerIds.join('|');
    params.watch_region = watchRegion;
  }
  const data = await tmdbGet<MediaResponse>(`/discover/${mediaType}`, params);
  return Math.min(data.total_results, MAX_PAGE_LIMIT * 20);
};

// --- Watch providers ---

export interface WatchProviderEntry {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProvidersResult {
  flatrate?: WatchProviderEntry[];
  buy?: WatchProviderEntry[];
  rent?: WatchProviderEntry[];
  link?: string;
}

export const getWatchProviders = async (
  mediaType: 'movie' | 'tv',
  id: number,
  region?: string
): Promise<WatchProvidersResult | null> => {
  const effectiveRegion = region || config.watchRegion || 'US';
  if (!config.tmdbReadToken) return null;
  try {
    const data = await tmdbGetBearer<{ results: Record<string, WatchProvidersResult> }>(
      `/${mediaType}/${id}/watch/providers`
    );
    return data.results?.[effectiveRegion] ?? null;
  } catch {
    return null;
  }
};

// --- Roulette discover ---

export const discoverRandom = async (
  mediaType: 'movie' | 'tv',
  genreIds: number[],
  genreMode: 'AND' | 'OR',
  minRating: number,
  yearFrom: number | null,
  yearTo: number | null,
  page: number,
  providerIds?: number[],
  watchRegion?: string
): Promise<MediaResponse> => {
  const safePage = getSafePage(page);
  const separator = genreMode === 'AND' ? '|' : ',';
  const params: Record<string, any> = {
    page: safePage,
    sort_by: 'popularity.desc',
    with_original_language: 'en',
    'vote_average.gte': minRating,
  };

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(separator);
  }

  const dateGte = mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
  const dateLte = mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte';

  if (yearFrom) params[dateGte] = `${yearFrom}-01-01`;

  // Always cap at today — if user picked a past yearTo, use whichever is earlier
  const yearToCap = yearTo ? `${yearTo}-12-31` : TODAY;
  params[dateLte] = yearToCap < TODAY ? yearToCap : TODAY;

  addAvailabilityFilters(params, mediaType);

  if (providerIds && providerIds.length > 0 && watchRegion) {
    params.with_watch_providers = providerIds.join('|');
    params.watch_region = watchRegion;
  }

  const data = await tmdbGet<MediaResponse>(`/discover/${mediaType}`, params);

  if (data.total_pages > MAX_PAGE_LIMIT) data.total_pages = MAX_PAGE_LIMIT;

  const results = data.results.map((item: any) => ({
    ...item,
    media_type: mediaType,
    title: item.title || item.name,
  }));

  return { ...data, results };
};

// --- React Query hooks ---

export const useTrending = (
  mediaType: 'movie' | 'tv' = 'movie',
  window: TrendingWindow = 'week',
  page: number = 1
) => {
  return useQuery<MediaResponse>({
    queryKey: ['trending', mediaType, window, page],
    queryFn: () => getTrending(mediaType, window, page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export const useGenres = (mediaType: 'movie' | 'tv', options?: any) => {
  return useQuery<Genre[]>({
    queryKey: ['genres', mediaType],
    queryFn: () => getGenres(mediaType),
    // Genre lists are effectively static — 24h stale time avoids pointless refetches
    staleTime: 1000 * 60 * 60 * 24,
    gcTime:    1000 * 60 * 60 * 24,
    ...options,
  });
};

export const useMediaByGenre = (
  mediaType: 'movie' | 'tv',
  genreId: number,
  page: number = 1,
  providerIds?: number[],
  watchRegion?: string,
  sortBy: GenreSortBy = 'popularity.desc',
  options?: any
) => {
  return useQuery<MediaResponse>({
    queryKey: ['mediaByGenre', mediaType, genreId, page, providerIds, watchRegion, sortBy],
    queryFn: () => getMediaByGenre(mediaType, genreId, page, providerIds, watchRegion, sortBy),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useMediaDetails = (mediaType: 'movie' | 'tv', id: number) => {
  return useQuery<MediaDetails>({
    queryKey: ['mediaDetails', mediaType, id],
    queryFn: () => getMediaDetails(mediaType, id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export const useMediaCountByGenre = (
  mediaType: 'movie' | 'tv',
  genreId: number,
  providerIds?: number[],
  watchRegion?: string
) => {
  return useQuery<number>({
    queryKey: ['mediaCountByGenre', mediaType, genreId, providerIds, watchRegion],
    queryFn: () => getMediaCountByGenre(mediaType, genreId, providerIds, watchRegion),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

export const useWatchProviders = (
  mediaType: 'movie' | 'tv',
  id: number,
  region?: string
) => {
  return useQuery<WatchProvidersResult | null>({
    queryKey: ['watchProviders', mediaType, id, region],
    queryFn: () => getWatchProviders(mediaType, id, region),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
