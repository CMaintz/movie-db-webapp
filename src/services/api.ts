import axios from 'axios';
import { MediaResponse, Genre, MediaDetails } from '../types';
import { useQuery } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'en-US'; // Set default language to English
const MAX_PAGE_LIMIT = 500; // TMDB API page limit

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: DEFAULT_LANGUAGE, // Apply language filter globally
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Add response interceptor to handle CORS
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Handle CORS errors
      console.error('CORS error:', error);
    }
    return Promise.reject(error);
  }
);

// Helper function to ensure page is within limits
const getSafePage = (page: number): number => {
  return Math.min(page, MAX_PAGE_LIMIT);
};

export const getTrending = async (mediaType: 'movie' | 'tv' = 'movie', page: number = 1): Promise<MediaResponse> => {
  const safePage = getSafePage(page);
  const { data } = await api.get(`/trending/${mediaType}/week`, {
    params: { 
      page: safePage,
      with_original_language: 'en' // Only English language content
    },
  });
  
  // Set a maximum number of total pages to avoid API errors
  if (data.total_pages > MAX_PAGE_LIMIT) {
    data.total_pages = MAX_PAGE_LIMIT;
  }
  
  return data;
};

export const getGenres = async (mediaType: 'movie' | 'tv'): Promise<Genre[]> => {
  const { data } = await api.get(`/genre/${mediaType}/list`);
  return data.genres;
};

export const getMediaByGenre = async (
  mediaType: 'movie' | 'tv',
  genreId: number,
  page: number = 1
): Promise<MediaResponse> => {
  const safePage = getSafePage(page);
  const { data } = await api.get(`/discover/${mediaType}`, {
    params: {
      with_genres: genreId,
      page: safePage,
      with_original_language: 'en', // Only English language content
      sort_by: 'popularity.desc' // Sort by popularity
    },
  });
  
  // Set a maximum number of total pages to avoid API errors
  if (data.total_pages > MAX_PAGE_LIMIT) {
    data.total_pages = MAX_PAGE_LIMIT;
  }
  
  // Normalize fields for both movies and TV shows
  const results = data.results.map((item: any) => ({
    ...item,
    media_type: mediaType,
    title: item.title || item.name
  }));
  
  return {
    ...data,
    results
  };
};

export const getMediaDetails = async (
  mediaType: 'movie' | 'tv',
  id: number
): Promise<MediaDetails> => {
  const { data } = await api.get(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'credits,videos,runtime,status,last_air_date'
    },
  });
  
  return {
    ...data,
    media_type: mediaType,
    title: data.title || data.name,
    release_date: data.release_date || data.first_air_date
  };
};

export const getMediaCountByGenre = async (mediaType: 'movie' | 'tv', genreId: number): Promise<number> => {
  const { data } = await api.get(`/discover/${mediaType}`, {
    params: {
      with_genres: genreId,
      page: 1,
      with_original_language: 'en' // Only English language content
    },
  });
  
  // Cap the total results based on maximum page size
  const maxResults = MAX_PAGE_LIMIT * 20; // Assuming 20 results per page
  return Math.min(data.total_results, maxResults);
};

export const useTrending = (mediaType: 'movie' | 'tv' = 'movie', page: number = 1, options?: any) => {
  return useQuery<MediaResponse>({
    queryKey: ['trending', mediaType, page],
    queryFn: () => getTrending(mediaType, page),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useGenres = (mediaType: 'movie' | 'tv', options?: any) => {
  return useQuery<Genre[]>({
    queryKey: ['genres', mediaType],
    queryFn: () => getGenres(mediaType),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    ...options,
  });
};

export const useMediaByGenre = (mediaType: 'movie' | 'tv', genreId: number, page: number = 1, options?: any) => {
  return useQuery<MediaResponse>({
    queryKey: ['mediaByGenre', mediaType, genreId, page],
    queryFn: () => getMediaByGenre(mediaType, genreId, page),
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

export const useMediaCountByGenre = (mediaType: 'movie' | 'tv', genreId: number) => {
  return useQuery<number>({
    queryKey: ['mediaCountByGenre', mediaType, genreId],
    queryFn: () => getMediaCountByGenre(mediaType, genreId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}; 