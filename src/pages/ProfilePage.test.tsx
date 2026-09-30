import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import { renderWithProviders } from '../test/utils';

const auth = vi.hoisted(() => ({
    updateDisplayName: vi.fn(),
    logout: vi.fn(),
}));

vi.mock('../context/useAuth', () => ({
    useAuth: () => ({
        user: { uid: 'u1', email: 'viewer@example.com', displayName: 'Old Name' },
        updateDisplayName: auth.updateDisplayName,
        logout: auth.logout,
    }),
}));

beforeEach(() => {
    auth.updateDisplayName.mockReset().mockResolvedValue(undefined);
    auth.logout.mockReset().mockResolvedValue(undefined);
});

describe('ProfilePage', () => {
    it('saves a changed display name', async () => {
        renderWithProviders(<ProfilePage />);
        const input = screen.getByLabelText('Display Name');

        await userEvent.clear(input);
        await userEvent.type(input, '  New Name ');
        await userEvent.click(screen.getByRole('button', { name: 'Update Profile' }));

        expect(auth.updateDisplayName).toHaveBeenCalledWith('New Name');
        expect(await screen.findByText('Profile updated successfully')).toBeInTheDocument();
    });

    it('disables saving until the name actually changes', () => {
        renderWithProviders(<ProfilePage />);

        expect(screen.getByRole('button', { name: 'Update Profile' })).toBeDisabled();
    });

    it('shows an error when the update fails', async () => {
        auth.updateDisplayName.mockRejectedValue(new Error('network'));
        renderWithProviders(<ProfilePage />);

        await userEvent.type(screen.getByLabelText('Display Name'), '!');
        await userEvent.click(screen.getByRole('button', { name: 'Update Profile' }));

        expect(await screen.findByText('Failed to update profile. Please try again.')).toBeInTheDocument();
    });
});
