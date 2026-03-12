import { useMemo } from 'react';
import { useMediaByGenre, useMediaCountByGenre, GenreSortBy } from '../services/api';
import { Media } from '../types';

interface UseGenreMediaProps {
  movieId: number;
  tvId: number;
  page: number;
  shouldLoadAll?: boolean;
  itemsPerPage?: number;
  providerIds?: number[];
  watchRegion?: string;
  sortBy?: GenreSortBy;
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
  itemsPerPage = 8,
  providerIds,
  watchRegion,
  sortBy = 'popularity.desc',
}: UseGenreMediaProps): UseGenreMediaResult => {
  const { data: moviesData, isLoading: moviesLoading } = useMediaByGenre(
    'movie', movieId, page, providerIds, watchRegion, sortBy
  );
  const { data: tvData, isLoading: tvLoading } = useMediaByGenre(
    'tv', tvId, page, providerIds, watchRegion, sortBy
  );
  const { data: movieCount } = useMediaCountByGenre('movie', movieId, providerIds, watchRegion);
  const { data: tvCount } = useMediaCountByGenre('tv', tvId, providerIds, watchRegion);

  const combinedMedia = useMemo(() => {
    if (!moviesData?.results || !tvData?.results) return [];

    const newItems = [
      ...(moviesData.results || []),
      ...(tvData.results || []),
    ].sort((a, b) => {
      if (sortBy === 'vote_average.desc') return b.vote_average - a.vote_average;
      if (sortBy === 'release_date.desc') {
        return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
      }
      if (sortBy === 'release_date.asc') {
        return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
      }
      return b.popularity - a.popularity; // default: popularity.desc
    });

    const unique = newItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    return shouldLoadAll ? unique : unique.slice(0, itemsPerPage);
  }, [moviesData, tvData, shouldLoadAll, itemsPerPage, sortBy]);

  const totalCount = (movieCount || 0) + (tvCount || 0);

  return {
    moviesData,
    tvData,
    moviesLoading,
    tvLoading,
    movieCount: movieCount || 0,
    tvCount: tvCount || 0,
    combinedMedia,
    totalCount,
  };
};
