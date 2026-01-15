import apiClient from '@/shared/services/api';

export interface User {
    id: string;
    email: string;
    username: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    register: (email: string, username: string, password: string) =>
        apiClient.post<AuthResponse>('/auth/register', { email, username, password }),

    login: (email: string, password: string) =>
        apiClient.post<AuthResponse>('/auth/login', { email, password }),

    getProfile: () =>
        apiClient.get<User>('/auth/profile'),

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    setToken: (token: string) => {
        localStorage.setItem('auth_token', token);
    },

    getToken: () => localStorage.getItem('auth_token'),

    isAuthenticated: () => !!localStorage.getItem('auth_token'),
};
