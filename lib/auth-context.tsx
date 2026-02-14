"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, setToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: { email: string; password: string; name: string; majorId?: string; classId?: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token) {
                try {
                    const response = await authApi.getMe();
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to get user:', error);
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const response = await authApi.login({ email, password });
        setUser(response.user);
        return response.user;
    };

    const register = async (data: { email: string; password: string; name: string; majorId?: string; classId?: string }) => {
        const response = await authApi.register(data);
        setUser(response.user);
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const response = await authApi.getMe();
            setUser(response.data);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
