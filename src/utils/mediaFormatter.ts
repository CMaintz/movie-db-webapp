import { Media, MovieDetails, SeriesDetails } from '../types';

// TMDB dates are YYYY-MM-DD, which Date parses as UTC midnight; read the year in UTC too
const yearOf = (date: string | undefined): string =>
    date ? new Date(date).getUTCFullYear().toString() : '';

export const formatMediaDateRange = (media: Media, showFullRange: boolean = false): string => {
    if (media.media_type === 'tv') {
        const series = media as SeriesDetails;
        const startYear = yearOf(series.first_air_date);
        if (!startYear) return '';

        if (showFullRange && (series.status === 'Ended' || series.status === 'Canceled')) {
            const endYear = yearOf(series.last_air_date);
            return endYear ? `${startYear} - ${endYear}` : startYear;
        }

        return startYear;
    }
    return yearOf((media as MovieDetails).release_date);
};

export const formatMediaRuntime = (media: Media): string | null => {
    if (media.media_type !== 'movie') return null;
    const { runtime } = media as MovieDetails;
    if (!runtime) return null;
    return `${Math.floor(runtime / 60)}h ${runtime % 60}m`;
};

export const formatSeasonYear = (airDate: string | null | undefined): string => yearOf(airDate ?? undefined);
