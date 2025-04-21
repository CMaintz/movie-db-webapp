import { useMemo } from 'react';
import { useMediaByGenre, useMediaCountByGenre } from '../services/api';
import { Media } from '../types';

interface UseGenreMediaProps {
  movieId: number;
  tvId: number;
  page: number;
  shouldLoadAll?: boolean;
  itemsPerPage?: number;
}

interface UseGenreMediaResult {
  moviesData: any;
  tvData: any;
  moviesLoading: boolean;
  tvLoading: boolean;
  movieCount: number;
  tvCount: number;
  combinedMedia: Media[];
  totalCount: number;
}

export const useGenreMedia = ({
  movieId,
  tvId,
  page,
  shouldLoadAll = false,
  itemsPerPage = 8
}: UseGenreMediaProps): UseGenreMediaResult => {
  const { data: moviesData, isLoading: moviesLoading } = useMediaByGenre('movie', movieId, page);
  const { data: tvData, isLoading: tvLoading } = useMediaByGenre('tv', tvId, page);
  const { data: movieCount } = useMediaCountByGenre('movie', movieId);
  const { data: tvCount } = useMediaCountByGenre('tv', tvId);

  // Memoize the combined and sorted media
  const combinedMedia = useMemo(() => {
    if (!moviesData?.results || !tvData?.results) return [];
    
    const newItems = [
      ...(moviesData.results || []),
      ...(tvData.results || [])
    ].sort((a, b) => b.popularity - a.popularity);

    const unique = newItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );

    // If shouldLoadAll is true, return all items
    // Otherwise, return only itemsPerPage items
    return shouldLoadAll ? unique : unique.slice(0, itemsPerPage);
  }, [moviesData, tvData, shouldLoadAll, itemsPerPage]);

  const totalCount = (movieCount || 0) + (tvCount || 0);

  return {
    moviesData,
    tvData,
    moviesLoading,
    tvLoading,
    movieCount: movieCount || 0,
    tvCount: tvCount || 0,
    combinedMedia,
    totalCount
  };
}; 