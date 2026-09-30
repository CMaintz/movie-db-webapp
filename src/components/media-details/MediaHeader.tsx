import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MediaRating from '../MediaRating';
import WishlistButton from '../WishlistButton';
import { MovieDetails, SeriesDetails, Genre, MediaDetails } from '../../types';
import { getGenreMapping } from '../../utils/genreMap';
import { formatMediaDateRange, formatMediaRuntime } from '../../utils/mediaFormatter.ts';

interface MediaHeaderProps {
    media: MediaDetails;
    director: MediaDetails['credits']['crew'][0] | null;
    creators: SeriesDetails['created_by'];
}

const isMovieDetails = (media: MediaDetails): media is MovieDetails => {
    return media.media_type === 'movie';
};

const isSeriesDetails = (media: MediaDetails): media is SeriesDetails => {
    return media.media_type === 'tv';
};

export const MediaHeader: React.FC<MediaHeaderProps> = ({ media, director, creators }) => {
    const navigate = useNavigate();

    const handleGenreClick = (genre: Genre) => {
        const mapping = getGenreMapping(genre.name);
        if (mapping) {
            navigate(`/genre/${genre.name}`);
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: '40vh', sm: '50vh', md: '60vh' },
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                zIndex: 1,
                mt: { xs: 'calc(30vh + 64px)', sm: 'calc(35vh + 72px)', md: 'calc(40vh + 72px)' }
            }}
        >
            <Box sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: '80%', lg: '70%' },
                mx: 'auto',
                px: { xs: 2, sm: 3 }
            }}>
                <Stack spacing={2} sx={{ pb: 4 }}>
                    <Stack
                        direction="row"
                        spacing={0}
                        alignItems="center"
                        sx={{
                            width: '100%',
                            flexWrap: 'wrap'
                        }}
                    >
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                color: 'white',
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                wordBreak: 'break-word',
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {media.title}
                            <WishlistButton
                                mediaId={media.id}
                                mediaType={media.media_type}
                                sx={{
                                    color: 'white',
                                    flexShrink: 0,
                                    p: 1.5,
                                    ml: 0.5,
                                    '& .MuiSvgIcon-root': {
                                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                    }
                                }}
                            />
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                        sx={{ width: '100%' }}
                    >
                        <MediaRating
                            voteAverage={media.vote_average}
                            voteCount={media.vote_count}
                            showVoteCount
                            size="large"
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                wordBreak: 'break-word'
                            }}
                        >
                            {isMovieDetails(media)
                                ? `${formatMediaDateRange(media)} • ${formatMediaRuntime(media)}`
                                : formatMediaDateRange(media, true)
                            }
                        </Typography>

                        {isMovieDetails(media) && director && (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'white',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                    wordBreak: 'break-word'
                                }}
                            >
                                Directed by {director.name}
                            </Typography>
                        )}

                        {isSeriesDetails(media) && creators.length > 0 && (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'white',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                    wordBreak: 'break-word'
                                }}
                            >
                                Created by {creators.map(creator => creator.name).join(', ')}
                            </Typography>
                        )}
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        gap={1}
                        sx={{ width: '100%' }}
                    >
                        {media.genres.map((genre: Genre) => (
                            <Chip
                                key={genre.id}
                                label={genre.name}
                                size="medium"
                                onClick={() => handleGenreClick(genre)}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                }}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};
