import React from 'react';
import { Pagination as MuiPagination, Box, Typography } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGE_LIMIT = 500; // Same as in API service

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Apply the page limit safely
  const safeMaxPages = Math.min(totalPages, MAX_PAGE_LIMIT);
  
  // Show warning if the API is reporting more pages than we can handle
  const showLimitWarning = totalPages > MAX_PAGE_LIMIT;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <MuiPagination
        count={safeMaxPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        size="large"
        showFirstButton
        showLastButton
        siblingCount={1}
      />
      
      {showLimitWarning && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Note: Results limited to {MAX_PAGE_LIMIT} pages due to API constraints
        </Typography>
      )}
    </Box>
  );
};

export default Pagination; 