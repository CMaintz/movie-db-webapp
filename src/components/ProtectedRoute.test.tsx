import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AuthUser } from '../context/useAuth';
import ProtectedRoute from './ProtectedRoute';

const auth = vi.hoisted(() => ({ user: null as AuthUser | null }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: auth.user }) }));

const renderAt = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/login" element={<h1>Login page</h1>} />
                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute>
                            <h1>Secret wishlist</h1>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );

describe('ProtectedRoute', () => {
    beforeEach(() => {
        auth.user = null;
    });

    it('redirects signed-out visitors to the login page', () => {
        renderAt('/wishlist');

        expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument();
        expect(screen.queryByText('Secret wishlist')).not.toBeInTheDocument();
    });

    it('renders the protected content for signed-in users', () => {
        auth.user = { uid: 'u1', email: 'a@b.c', displayName: 'A' };

        renderAt('/wishlist');

        expect(screen.getByRole('heading', { name: 'Secret wishlist' })).toBeInTheDocument();
    });
});
