export interface GenreMapping {
  name: string;
  movieId: number;
  tvId: number;
}

export const GENRES: GenreMapping[] = [
  { name: 'Action', movieId: 28, tvId: 10759 },
  { name: 'Comedy', movieId: 35, tvId: 35 },
  { name: 'Thriller', movieId: 53, tvId: 9648 },
  { name: 'War', movieId: 10752, tvId: 10768 },
  { name: 'Romance', movieId: 10749, tvId: 10749 },
  { name: 'Drama', movieId: 18, tvId: 18 },
  { name: 'Crime', movieId: 80, tvId: 80 },
  { name: 'Documentary', movieId: 99, tvId: 99 },
  { name: 'Horror', movieId: 27, tvId: 27 },
];

/**
 * Get the movie genre id for a given genre name
 */
export const getMovieGenreId = (genreName: string): number | undefined => {
  return GENRES.find(genre => genre.name === genreName)?.movieId;
};

/**
 * Get the TV show genre id for a given genre name
 */
export const getTVGenreId = (genreName: string): number | undefined => {
  return GENRES.find(genre => genre.name === genreName)?.tvId;
};

/**
 * Get the genre mapping object for a given genre name
 */
export const getGenreMapping = (genreName: string): GenreMapping | undefined => {
  return GENRES.find(genre => genre.name === genreName);
};

/**
 * Get the genre name for a given movie id and tv id
 */
export const getGenreName = (movieId: number, tvId: number): string | undefined => {
  return GENRES.find(genre => genre.movieId === movieId && genre.tvId === tvId)?.name;
}; 