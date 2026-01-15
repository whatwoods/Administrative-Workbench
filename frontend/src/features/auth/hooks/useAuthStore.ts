import { create } from 'zustand';
import { User } from '../services/authService';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null,
    token: localStorage.getItem('auth_token'),
    isLoading: false,

    setUser: (user) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
        set({ user });
    },

    setToken: (token) => {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
        set({ token });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    login: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        set({ user, token });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        set({ user: null, token: null });
    },
}));
