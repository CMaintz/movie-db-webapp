import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import MediaGrid from '../components/MediaGrid';
import { useNavigate } from 'react-router-dom';
import { GENRES } from '../utils/genreMap';
import { useGenreMedia } from '../hooks/useGenreMedia';
import { Media } from '../types';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleGenreClick = (genreName: string) => {
        navigate(`/genre/${genreName}`);
    };

    return (
        <Container maxWidth={false} disableGutters>
            {GENRES.map((genre) => (
                <GenreSection
                    key={genre.name}
                    genre={genre}
                    title={genre.name}
                    onViewAll={() => handleGenreClick(genre.name)}
                />
            ))}
        </Container>
    );
};

const GenreSection: React.FC<{
    genre: { name: string; movieId: number; tvId: number };
    title: string;
    onViewAll: () => void;
}> = ({ genre, title, onViewAll }) => {
    const [page, setPage] = useState(1);
    const [allMedia, setAllMedia] = useState<Media[]>([]);
    const [visibleCount, setVisibleCount] = useState(8);
    const itemsPerPage = 8;

    const {
        combinedMedia,
        totalCount,
        moviesLoading,
        tvLoading
    } = useGenreMedia({
        movieId: genre.movieId,
        tvId: genre.tvId,
        page
    });

    useEffect(() => {
        if (combinedMedia && combinedMedia.length > 0) {
            setAllMedia(prev => {
                const newItems = combinedMedia.filter(
                    item => !prev.some(existing => existing.id === item.id)
                );
                return [...prev, ...newItems];
            });
        }
    }, [combinedMedia]);

    const handleLoadMore = () => {
        const nextVisibleCount = visibleCount + itemsPerPage;

        if (nextVisibleCount <= allMedia.length) {
            setVisibleCount(nextVisibleCount);
        } else if (allMedia.length < totalCount) {
            setPage(prev => prev + 1);
            setVisibleCount(nextVisibleCount);
        }
    };

    return (
        <MediaGrid
            media={allMedia.slice(0, visibleCount)}
            title={title}
            onViewAll={onViewAll}
            showViewAll={true}
            showType={true}
            showLoadMore={visibleCount < totalCount && !moviesLoading && !tvLoading}
            onLoadMore={handleLoadMore}
            totalCount={totalCount}
            showCount={true}
        />
    );
};

export default HomePage;