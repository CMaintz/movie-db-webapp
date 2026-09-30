import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Skeleton
} from '@mui/material';
import { MovieDetails, SeriesDetails, MediaDetails } from '../../types';

interface MediaOverviewProps {
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

export const MediaOverview: React.FC<MediaOverviewProps> = ({ media, director, creators }) => {

    return (
        <Paper elevation={0} sx={{
            p: 3,
            bgcolor: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
        }}>
            <Grid container spacing={3}>
                <Grid size={{xs:12, sm: 4, md: 3}}>
                    {media.poster_path ? (
                        <Box
                            component="img"
                            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                            alt={media.title}
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                aspectRatio: '2/3',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <Skeleton
                            variant="rectangular"
                            animation="wave"
                            sx={{
                                width: '100%',
                                paddingTop: '150%',
                                borderRadius: 2,
                                bgcolor: 'grey.800'
                            }}
                        />
                    )}
                </Grid>

                <Grid size={{xs:12, sm: 8, md: 9}}>
                    <Typography variant="h5" gutterBottom>
                        Overview
                    </Typography>
                    <Typography variant="body1">
                        {media.overview}
                    </Typography>

                    {isMovieDetails(media) && director && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                                Director
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Box
                                    component="img"
                                    src={director.profile_path ? `https://image.tmdb.org/t/p/w185${director.profile_path}` : 'none'}
                                    alt={director.name}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        display: director.profile_path ? 'block' : 'none'
                                    }}
                                />
                                {!director.profile_path && (
                                    <Skeleton
                                        variant="circular"
                                        animation="wave"
                                        width={100}
                                        height={100}
                                        sx={{ bgcolor: 'grey.800' }}
                                    />
                                )}
                                <Typography variant="body1">
                                    {director.name}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {isSeriesDetails(media) && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                                Series Details
                            </Typography>
                            <Typography variant="body1">
                                {media.number_of_seasons} seasons • {media.number_of_episodes} episodes
                            </Typography>
                        </Box>
                    )}

                    {isSeriesDetails(media) && creators.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                                Creators
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                {creators.map(creator => (
                                    <Box key={creator.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            component="img"
                                            src={creator.profile_path ? `https://image.tmdb.org/t/p/w185${creator.profile_path}` : 'none'}
                                            alt={creator.name}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                display: creator.profile_path ? 'block' : 'none'
                                            }}
                                        />
                                        {!creator.profile_path && (
                                            <Skeleton
                                                variant="circular"
                                                animation="wave"
                                                width={100}
                                                height={100}
                                                sx={{ bgcolor: 'grey.800' }}
                                            />
                                        )}
                                        <Typography variant="body1">
                                            {creator.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
}; 