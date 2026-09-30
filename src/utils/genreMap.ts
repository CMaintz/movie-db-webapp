export interface GenreMapping {
    name: string;
    movieId: number;
    tvId: number;
}

// TMDB keeps separate genre lists for movies and TV; Thriller and War map to the nearest TV genres (Mystery, War & Politics)
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

export const getGenreMapping = (genreName: string): GenreMapping | undefined =>
    GENRES.find((genre) => genre.name === genreName);
