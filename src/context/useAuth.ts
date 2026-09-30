import { createContext, useContext } from 'react';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
}

export interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateDisplayName: (displayName: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
