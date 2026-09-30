import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import type { User } from 'firebase/auth';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { auth } from '../services/firebaseService';

const firebase = vi.hoisted(() => ({
    listener: undefined as undefined | ((user: User | null) => void),
    signIn: vi.fn(),
    updateProfile: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: (_auth: unknown, listener: (user: User | null) => void) => {
        firebase.listener = listener;
        return () => {};
    },
    signInWithEmailAndPassword: firebase.signIn,
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    updateProfile: firebase.updateProfile,
}));

const firebaseUser = { uid: 'u1', email: 'a@b.c', displayName: 'Before', photoURL: null } as User;

const Probe = () => {
    const { user, loading, signIn, updateDisplayName } = useAuth();
    if (loading) return <p>loading</p>;
    return (
        <>
            <p>user: {user ? user.displayName : 'none'}</p>
            <button onClick={() => updateDisplayName('After')}>rename</button>
            <button onClick={() => signIn('a@b.c', 'wrong').catch(() => {})}>sign in</button>
        </>
    );
};

const renderProvider = () =>
    render(
        <SnackbarProvider>
            <AuthProvider>
                <Probe />
            </AuthProvider>
        </SnackbarProvider>
    );

beforeEach(() => {
    firebase.listener = undefined;
    firebase.signIn.mockReset();
    firebase.updateProfile.mockReset().mockImplementation(async (user: User, { displayName }) => {
        Object.assign(user, { displayName });
    });
    Object.assign(auth, { currentUser: null });
});

describe('AuthProvider', () => {
    it('stays loading until Firebase reports the auth state', () => {
        renderProvider();
        expect(screen.getByText('loading')).toBeInTheDocument();

        act(() => firebase.listener!(null));

        expect(screen.getByText('user: none')).toBeInTheDocument();
    });

    it('refreshes the user after a display-name update', async () => {
        const current = { ...firebaseUser } as User;
        Object.assign(auth, { currentUser: current });
        renderProvider();
        act(() => firebase.listener!(current));
        expect(screen.getByText('user: Before')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'rename' }));

        expect(firebase.updateProfile).toHaveBeenCalledWith(current, { displayName: 'After' });
        expect(screen.getByText('user: After')).toBeInTheDocument();
    });

    it('shows the Firebase error when sign-in fails', async () => {
        firebase.signIn.mockRejectedValue(new Error('auth/wrong-password'));
        renderProvider();
        act(() => firebase.listener!(null));

        await userEvent.click(screen.getByRole('button', { name: 'sign in' }));

        expect(await screen.findByText('Failed to log in: auth/wrong-password')).toBeInTheDocument();
    });
});

describe('useAuth', () => {
    it('throws outside an AuthProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<Probe />)).toThrow('useAuth must be used within an AuthProvider');
        consoleError.mockRestore();
    });
});
