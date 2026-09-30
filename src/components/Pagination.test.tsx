import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
    it('reports the selected page', async () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

        await userEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));

        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('caps the page count at the TMDB limit and explains why', () => {
        render(<Pagination currentPage={1} totalPages={900} onPageChange={() => {}} />);

        expect(screen.getByRole('button', { name: 'Go to page 500' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Go to page 900' })).not.toBeInTheDocument();
        expect(screen.getByText(/limited to 500 pages/)).toBeInTheDocument();
    });

    it('omits the limit note when every page is reachable', () => {
        render(<Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />);

        expect(screen.queryByText(/limited to 500 pages/)).not.toBeInTheDocument();
    });
});
