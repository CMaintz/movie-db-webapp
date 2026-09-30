import React, { useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser,
} from 'firebase/auth';
import { useSnackbar } from 'notistack';
import { auth } from '../services/firebaseService';
import { AuthContext, AuthUser } from './useAuth';

const toAuthUser = (firebaseUser: FirebaseUser): AuthUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
});

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : 'An unknown error occurred';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        return onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
            setLoading(false);
        });
    }, []);

    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            enqueueSnackbar('Account created successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(`Failed to create account: ${errorMessage(error)}`, { variant: 'error' });
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            enqueueSnackbar('Logged in successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(`Failed to log in: ${errorMessage(error)}`, { variant: 'error' });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            enqueueSnackbar('Logged out successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(`Failed to log out: ${errorMessage(error)}`, { variant: 'error' });
            throw error;
        }
    };

    const updateDisplayName = async (displayName: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('Not signed in');
        await updateProfile(currentUser, { displayName });
        // onAuthStateChanged does not fire for profile updates, so refresh local state manually
        setUser(toAuthUser(currentUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, logout, updateDisplayName }}>
            {children}
        </AuthContext.Provider>
    );
};
