import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import MediaCard from './MediaCard';
import { makeMedia, renderWithProviders } from '../test/utils';

vi.mock('./WishlistButton', () => ({ default: () => null }));

describe('MediaCard', () => {
    it('shows the title, poster and a Series badge for TV shows', () => {
        renderWithProviders(<MediaCard media={makeMedia({ title: 'Severance', media_type: 'tv' })} />);

        expect(screen.getByText('Severance')).toBeInTheDocument();
        expect(screen.getByText('Series')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Severance' })).toHaveAttribute(
            'src',
            'https://image.tmdb.org/t/p/w500/poster.jpg'
        );
    });

    it('hides the type badge when asked', () => {
        renderWithProviders(<MediaCard media={makeMedia()} showType={false} />);

        expect(screen.queryByText('Movie')).not.toBeInTheDocument();
    });

    it('opens the details page for its media type', async () => {
        renderWithProviders(
            <Routes>
                <Route path="/" element={<MediaCard media={makeMedia({ id: 603, media_type: 'movie' })} />} />
                <Route path="/movie/603" element={<p>details page</p>} />
            </Routes>
        );

        await userEvent.click(screen.getByText('Test Title'));

        expect(screen.getByText('details page')).toBeInTheDocument();
    });
});
