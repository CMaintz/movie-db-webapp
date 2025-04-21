import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
  Skeleton
} from '@mui/material';
import { ArrowBack} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import { useMediaDetails } from '../services/api';
import MediaRating from '../components/MediaRating';
import WishlistButton from '../components/WishlistButton';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { MovieDetails, SeriesDetails, Genre } from '../types';
import { getGenreMapping } from '../utils/genreMap';
import { formatMediaDateRange, formatMediaRuntime, formatSeasonYear } from '../utils/mediaDate';


const MediaDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>();
  const { data: media, isLoading, error } = useMediaDetails(mediaType as 'movie' | 'tv', Number(id));
  const [autoPlay, setAutoPlay] = useState(true);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !media) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error?.message || 'Media not found'}</Typography>
      </Box>
    );
  }

  // Get director information (for movies)
  const director = media.media_type === 'movie' 
    ? media.credits?.crew?.find(person => person.job === 'Director')
    : null;

  // Get creators (for TV shows)
  const creators = media.media_type === 'tv'
    ? media.credits?.crew?.filter(person => person.job === 'Creator' || person.job === 'Executive Producer' || person.job === 'Showrunner')
    : [];

  const handleGenreClick = (genre: Genre) => {
    const mapping = getGenreMapping(genre.name);
    if (mapping) {
      const scrollPosition = window.scrollY;
      navigate(`/genre/${genre.name}`, { 
        state: { 
          genreName: genre.name,
          scrollPosition
        }
      });
    }
  };

  const trailer = media.videos?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  );

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      width: '100%',
      position: 'relative',
      bgcolor: 'background.default',
      alignItems: 'center',
    }}>

      {/* Background Image Section */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: media.backdrop_path 
            ? `url(https://image.tmdb.org/t/p/original${media.backdrop_path})`
            : 'linear-gradient(45deg, #2E3B4E 0%, #1A1E2A 100%)',
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center 0px', sm: 'center 0px', md: 'center 48px' },
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.5) 100%)',
          },
        }}
      />

      {/* Header Section */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: 'fixed',
          left: 16,
          top: { xs: '16px', sm: '16px', md: '72px' },
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          zIndex: 2,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <ArrowBack />
      </IconButton>

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
                {media.media_type === 'movie' 
                  ? `${formatMediaDateRange(media)} • ${formatMediaRuntime(media)}`
                  : formatMediaDateRange(media, true)
                }
              </Typography>
              
              {/* Display Director for Movies */}
              {media.media_type === 'movie' && director && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white', 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    wordBreak: 'break-word'
                  }}
                >
                  • Director: {director.name}
                </Typography>
              )}

              {/* Display Creators for TV Shows */}
              {media.media_type === 'tv' && creators.length > 0 && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white', 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    wordBreak: 'break-word'
                  }}
                >
                  • Creator: {creators[0].name}
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

      {/* Content Section */}
      <Box sx={{ 
        position: 'relative', 
        mt: -4, 
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: { xs: '100%', md: '80%', lg: '70%' },
        mx: 'auto',
        px: { xs: 2, sm: 3 },
      }}>
        <Stack spacing={4}>
          {/* Main Content */}
          <Grid container spacing={4}>
            <Grid size={12}>
              <Stack spacing={4}>
                {/* Overview Section */}
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(30, 30, 30, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                }}>
                  <Grid container spacing={3}>
                    {/* Poster Image */}
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
                            paddingTop: '150%', // 2:3 aspect ratio
                            borderRadius: 2,
                            bgcolor: 'grey.800'
                          }}
                        />
                      )}
                    </Grid>
                    
                    {/* Overview Text */}
                    <Grid size={{xs:12, sm: 8, md: 9}}>
                      <Typography variant="h5" gutterBottom>
                        Overview
                      </Typography>
                      <Typography variant="body1">
                        {media.overview}
                      </Typography>
                      
                      {/* Movie Details */}
                      {media.media_type === 'movie' && director && (
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
                      
                      {/* TV Show Details */}
                      {media.media_type === 'tv' && creators.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                            Creator
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {creators.slice(0, 2).map(creator => (
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

                {/* Cast Section */}
                {media.credits?.cast?.length > 0 && (
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    bgcolor: 'rgba(30, 30, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                  }}>
                    <Typography variant="h5" gutterBottom>
                      Cast
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                      <Carousel
                        showThumbs={false}
                        showStatus={false}
                        showIndicators={false}
                        infiniteLoop
                        centerMode
                        centerSlidePercentage={isMobile ? 33 : 16}
                        swipeable
                        emulateTouch
                        showArrows={!isMobile}
                        autoPlay={autoPlay}
                        interval={3000}
                        stopOnHover
                        onSwipeStart={() => setAutoPlay(false)}
                        onSwipeEnd={() => setAutoPlay(true)}
                      >
                        {media.credits.cast
                          .filter((actor, index, self) => 
                            index === self.findIndex((a) => a.id === actor.id)
                          )
                          .slice(0, 10)
                          .map((actor) => (
                          <Box key={actor.id} sx={{ px: 1, width: '100%', textAlign: 'center' }}>
                            <Box sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1,
                              width: '100%'
                            }}>
                              <Box 
                                sx={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  border: '2px solid rgba(255, 255, 255, 0.2)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                  position: 'relative'
                                }}
                              >
                                <Box
                                  component="img"
                                  src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'none'}
                                  alt={actor.name}
                                  sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center 20%',
                                    display: actor.profile_path ? 'block' : 'none'
                                  }}
                                />
                                {!actor.profile_path && (
                                  <Skeleton
                                    variant="circular"
                                    animation="wave"
                                    width="100%"
                                    height="100%"
                                    sx={{ 
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      bgcolor: 'grey.800' 
                                    }}
                                  />
                                )}
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {actor.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {actor.character}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Carousel>
                    </Box>
                  </Paper>
                )}

                {/* Trailer Section */}
                {trailer && (
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
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Seasons Section (TV only) */}
          {media.media_type === 'tv' && (media as SeriesDetails).seasons?.length > 0 && (
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: 'rgba(30, 30, 30, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
            }}>
              <Typography variant="h5" gutterBottom>
                Seasons
              </Typography>
              <Stack spacing={3}>
                {(media as SeriesDetails).seasons.map((season) => (
                  <Box
                    key={season.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <Box
                      component="img"
                      src={season.poster_path ? `https://image.tmdb.org/t/p/w154${season.poster_path}` : 'none'}
                      alt={season.name}
                      sx={{
                        width: 92,
                        height: 138,
                        borderRadius: 1,
                        objectFit: 'cover',
                        flexShrink: 0,
                        display: season.poster_path ? 'block' : 'none'
                      }}
                    />
                    {!season.poster_path && (
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        width={92}
                        height={138}
                        sx={{ 
                          borderRadius: 1,
                          flexShrink: 0,
                          bgcolor: 'grey.800'
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {season.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {season.episode_count} episodes
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatSeasonYear(season.air_date)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default MediaDetailsPage; 