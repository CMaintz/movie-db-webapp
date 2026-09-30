import { Pagination as MuiPagination, Box, Typography } from '@mui/material';
import { MAX_PAGE_LIMIT } from '../services/apiService';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const pageCount = Math.min(totalPages, MAX_PAGE_LIMIT);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <MuiPagination
                count={pageCount}
                page={currentPage}
                onChange={(_, page) => onPageChange(page)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                siblingCount={1}
            />

            {totalPages > MAX_PAGE_LIMIT && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Note: Results limited to {MAX_PAGE_LIMIT} pages due to API constraints
                </Typography>
            )}
        </Box>
    );
};

export default Pagination;
