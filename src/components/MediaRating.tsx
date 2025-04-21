import React, { useState } from 'react';
import { Rating, Box, Typography, Tooltip, useTheme, useMediaQuery } from '@mui/material';

interface MediaRatingProps {
  voteAverage: number;
  voteCount?: number;
  showVoteCount?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const MediaRating: React.FC<MediaRatingProps> = ({
  voteAverage,
  voteCount,
  showVoteCount = false,
  size = 'small'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showTooltip, setShowTooltip] = useState(false);
  const ratingValue = voteAverage / 2;
  const formattedRating = ratingValue.toFixed(1);

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.stopPropagation();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip 
        title={`${formattedRating}/5`} 
        placement="top"
        open={isMobile && showTooltip}
        onClose={() => setShowTooltip(false)}
        disableHoverListener={isMobile}
        disableFocusListener={isMobile}
        disableTouchListener={isMobile}
      >
        <Box onClick={handleClick}>
          <Rating 
            value={ratingValue} 
            precision={0.5} 
            readOnly 
            size={size}
            sx={{
              '& .MuiRating-iconEmpty': {
                color: 'rgba(255, 255, 255, 0.3)',
                stroke: 'rgba(0, 0, 0, 0.5)',
                strokeWidth: 1,
              },
              '& .MuiRating-iconFilled': {
                color: 'primary.main',
              },
              '& .MuiRating-iconHover': {
                color: 'primary.main',
              }
            }}
          />
        </Box>
      </Tooltip>
      {showVoteCount && voteCount !== undefined && (
        <Typography variant="body2" color="text.secondary">
          ({voteCount.toLocaleString()} votes)
        </Typography>
      )}
    </Box>
  );
};

export default MediaRating; 