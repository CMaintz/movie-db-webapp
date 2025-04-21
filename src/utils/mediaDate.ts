import { Media, MovieDetails, SeriesDetails } from '../types';

export const formatMediaDateRange = (media: Media, showFullRange: boolean = false) => {
  if (media.media_type === 'tv') {
    const seriesMedia = media as SeriesDetails;
    const startYear = seriesMedia.first_air_date ? new Date(seriesMedia.first_air_date).getFullYear() : '';
    if (!startYear) return '';
    
    // Only show full range if explicitly requested (for details page)
    if (showFullRange && (seriesMedia.status === 'Ended' || seriesMedia.status === 'Canceled')) {
      const endYear = seriesMedia.last_air_date ? new Date(seriesMedia.last_air_date).getFullYear() : '';
      return endYear ? `${startYear} - ${endYear}` : startYear;
    }
    
    // For MediaCard, just show start year
    return startYear;
  }
  const movieMedia = media as MovieDetails;
  return movieMedia.release_date ? new Date(movieMedia.release_date).getFullYear() : '';
};

export const formatMediaRuntime = (media: Media) => {
  if (media.media_type === 'movie') {
    const movieMedia = media as MovieDetails;
    if (movieMedia.runtime) {
      const hours = Math.floor(movieMedia.runtime / 60);
      const minutes = movieMedia.runtime % 60;
      return `${hours}h ${minutes}m`;
    }
  }
  return null;
};

export const formatSeasonYear = (airDate: string): string => {
  return airDate ? new Date(airDate).getFullYear().toString() : '';
}; 