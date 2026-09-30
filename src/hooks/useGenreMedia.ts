import { useMemo } from 'react';
import { useMediaByGenre, useMediaCountByGenre } from '../services/apiService';
import { Media, MediaResponse } from '../types';

interface UseGenreMediaProps {
    movieId: number;
    tvId: number;
    page: number;
}

interface UseGenreMediaResult {
    moviesData: MediaResponse | undefined;
    tvData: MediaResponse | undefined;
    moviesLoading: boolean;
    tvLoading: boolean;
    movieCount: number;
    tvCount: number;
    combinedMedia: Media[];
    totalCount: number;
}

// Movie and TV ids come from separate TMDB id spaces, so the key must include the type
export const dedupeMedia = (media: Media[]): Media[] => {
    const seen = new Set<string>();
    return media.filter((item) => {
        const key = `${item.media_type}-${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export const mergeByPopularity = (movies: Media[], shows: Media[]): Media[] =>
    dedupeMedia([...movies, ...shows].sort((a, b) => b.popularity - a.popularity));

export const useGenreMedia = ({ movieId, tvId, page }: UseGenreMediaProps): UseGenreMediaResult => {
    const { data: moviesData, isLoading: moviesLoading } = useMediaByGenre('movie', movieId, page);
    const { data: tvData, isLoading: tvLoading } = useMediaByGenre('tv', tvId, page);
    const { data: movieCount = 0 } = useMediaCountByGenre('movie', movieId);
    const { data: tvCount = 0 } = useMediaCountByGenre('tv', tvId);

    const combinedMedia = useMemo(() => {
        if (!moviesData || !tvData) return [];
        return mergeByPopularity(moviesData.results, tvData.results);
    }, [moviesData, tvData]);

    return {
        moviesData,
        tvData,
        moviesLoading,
        tvLoading,
        movieCount,
        tvCount,
        combinedMedia,
        totalCount: movieCount + tvCount,
    };
};
