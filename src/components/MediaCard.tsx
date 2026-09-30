import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Media } from '../types';
import MediaRating from './MediaRating';
import WishlistButton from './WishlistButton';

interface MediaCardProps {
    media: Media;
    showType?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, showType = true }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/${media.media_type}/${media.id}`);
    };

    return (
        <Card
            sx={{
                position: 'relative',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
            }}
            onClick={handleClick}
        >
            <Box sx={{ position: 'relative' }}>
                {media.poster_path ? (
                    <CardMedia
                        component="img"
                        image={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={media.title}
                        sx={{
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Skeleton
                        variant="rectangular"
                        animation="wave"
                        sx={{
                            paddingTop: '150%', // 2:3 poster aspect ratio
                            bgcolor: 'grey.800'
                        }}
                    />
                )}
                <WishlistButton
                    mediaId={media.id}
                    mediaType={media.media_type}
                    sx={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                    }}
                />
                {showType && (
                    <Chip
                        label={media.media_type === 'movie' ? 'Movie' : 'Series'}
                        color="primary"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: '0.5rem',
                            left: '0.5rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            padding: '0 4px',
                            height: '20px',
                            fontSize: '0.7rem',
                            '& .MuiChip-label': {
                                color: 'white',
                                padding: '0 4px',
                            }
                        }}
                    />
                )}
            </Box>
            <CardContent sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.2rem'
            }}>
                <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.1em',
                    }}
                >
                    {media.title}
                </Typography>

                <MediaRating
                    voteAverage={media.vote_average}
                    size="small"
                />
            </CardContent>
        </Card>
    );
};

export default MediaCard;