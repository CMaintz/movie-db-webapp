import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthUser } from '../context/useAuth';
import WishlistButton from './WishlistButton';

const state = vi.hoisted(() => ({
    user: null as AuthUser | null,
    wishlisted: false,
    add: vi.fn(),
    remove: vi.fn(),
}));

vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../hooks/useWishlist', () => ({
    useWishlist: () => ({
        isInWishlist: () => state.wishlisted,
        addToWishlist: state.add,
        removeFromWishlist: state.remove,
    }),
}));

describe('WishlistButton', () => {
    beforeEach(() => {
        state.user = { uid: 'u1', email: null, displayName: null };
        state.wishlisted = false;
        state.add.mockReset().mockResolvedValue(true);
        state.remove.mockReset().mockResolvedValue(true);
    });

    it('asks signed-out users to log in instead of writing', async () => {
        state.user = null;
        render(<WishlistButton mediaId={1} mediaType="movie" />);

        await userEvent.click(screen.getByRole('button', { name: 'Add to wishlist' }));

        expect(await screen.findByText('Please login to add to wishlist')).toBeInTheDocument();
        expect(state.add).not.toHaveBeenCalled();
    });

    it('adds media that is not wishlisted', async () => {
        render(<WishlistButton mediaId={1} mediaType="tv" />);

        await userEvent.click(screen.getByRole('button', { name: 'Add to wishlist' }));

        expect(state.add).toHaveBeenCalledWith(1, 'tv');
        expect(state.remove).not.toHaveBeenCalled();
    });

    it('removes media that is already wishlisted', async () => {
        state.wishlisted = true;
        render(<WishlistButton mediaId={2} mediaType="movie" />);

        const button = screen.getByRole('button', { name: 'Remove from wishlist' });
        expect(button).toHaveAttribute('aria-pressed', 'true');
        await userEvent.click(button);

        expect(state.remove).toHaveBeenCalledWith(2, 'movie');
    });

    it('does not trigger clicks on the surrounding card', async () => {
        const onCardClick = vi.fn();
        render(
            <div onClick={onCardClick}>
                <WishlistButton mediaId={1} mediaType="movie" />
            </div>
        );

        await userEvent.click(screen.getByRole('button'));

        expect(onCardClick).not.toHaveBeenCalled();
    });
});
