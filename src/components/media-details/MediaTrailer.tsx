import React from 'react';
import {
    Box,
    Typography,
    Paper
} from '@mui/material';

interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

interface MediaTrailerProps {
    videos: Video[];
}

export const MediaTrailer: React.FC<MediaTrailerProps> = ({ videos }) => {
    const trailer = videos.find(
        (video) => video.site === 'YouTube' && video.type === 'Trailer'
    );

    if (!trailer) return null;

    return (
        <Paper elevation={0} sx={{
            p: 3,
            bgcolor: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
        }}>
            <Typography variant="h5" gutterBottom>
                Trailer
            </Typography>
            <Box sx={{
                position: 'relative',
                paddingTop: '56.25%',
                borderRadius: 2,
                width: '100%',
                boxShadow: 1,
            }}>
                <iframe
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1`}
                    title="Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </Box>
        </Paper>
    );
}; 
