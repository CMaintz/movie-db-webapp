import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Media, MediaResponse, MediaDetails, MediaType } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'en-US';
// TMDB rejects page numbers above 500
export const MAX_PAGE_LIMIT = 500;
const RESULTS_PER_PAGE = 20;

// TMDB names the title field `title` for movies and `name` for TV shows
type RawMedia = Omit<Media, 'title' | 'media_type'> & { title?: string; name?: string };

interface RawMediaResponse extends Omit<MediaResponse, 'results'> {
    results: RawMedia[];
}

type RawMediaDetails = Omit<MediaDetails, 'title' | 'media_type'> & {
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
};

const apiService = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: DEFAULT_LANGUAGE,
    },
    headers: {
        Accept: 'application/json',
    },
});

apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            console.error(`TMDB rejected the request (${status}); check VITE_TMDB_API_KEY.`);
        }
        return Promise.reject(error);
    }
);

export const getSafePage = (page: number): number => {
    if (!Number.isFinite(page)) return 1;
    return Math.min(Math.max(Math.floor(page), 1), MAX_PAGE_LIMIT);
};

export const getMediaByGenre = async (
    mediaType: MediaType,
    genreId: number,
    page: number = 1
): Promise<MediaResponse> => {
    const { data } = await apiService.get<RawMediaResponse>(`/discover/${mediaType}`, {
        params: {
            with_genres: genreId,
            page: getSafePage(page),
            with_original_language: 'en',
            sort_by: 'popularity.desc',
        },
    });

    return {
        ...data,
        total_pages: Math.min(data.total_pages, MAX_PAGE_LIMIT),
        results: data.results.map(({ name, title, ...item }) => ({
            ...item,
            media_type: mediaType,
            title: title || name || '',
        })),
    };
};

export const getMediaDetails = async (mediaType: MediaType, id: number): Promise<MediaDetails> => {
    const { data } = await apiService.get<RawMediaDetails>(`/${mediaType}/${id}`, {
        params: {
            append_to_response: 'credits,videos',
        },
    });

    return {
        ...data,
        media_type: mediaType,
        title: data.title || data.name || '',
        release_date: data.release_date || data.first_air_date,
    };
};

export const getMediaCountByGenre = async (mediaType: MediaType, genreId: number): Promise<number> => {
    const { data } = await apiService.get<RawMediaResponse>(`/discover/${mediaType}`, {
        params: {
            with_genres: genreId,
            page: 1,
            with_original_language: 'en',
        },
    });

    // Only the first MAX_PAGE_LIMIT pages are reachable, so cap the advertised count
    return Math.min(data.total_results, MAX_PAGE_LIMIT * RESULTS_PER_PAGE);
};

export const mediaDetailsQueryKey = (mediaType: MediaType, id: number) =>
    ['mediaDetails', mediaType, id] as const;

export const useMediaByGenre = (mediaType: MediaType, genreId: number, page: number = 1) => {
    return useQuery<MediaResponse>({
        queryKey: ['mediaByGenre', mediaType, genreId, page],
        queryFn: () => getMediaByGenre(mediaType, genreId, page),
        enabled: genreId > 0,
    });
};

export const useMediaDetails = (mediaType: MediaType, id: number) => {
    return useQuery<MediaDetails>({
        queryKey: mediaDetailsQueryKey(mediaType, id),
        queryFn: () => getMediaDetails(mediaType, id),
    });
};

export const useMediaCountByGenre = (mediaType: MediaType, genreId: number) => {
    return useQuery<number>({
        queryKey: ['mediaCountByGenre', mediaType, genreId],
        queryFn: () => getMediaCountByGenre(mediaType, genreId),
        enabled: genreId > 0,
    });
};
