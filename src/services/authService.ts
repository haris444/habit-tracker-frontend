import axios from 'axios';

const API_URL = 'https://habit-tracker-backend-0576.onrender.com';

export interface User {
    id: number;
    username: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

// Store token and user data in localStorage
export const setAuthData = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Get token from localStorage
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Get user from localStorage
export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

// Login user
export const login = async (username: string, password: string): Promise<User> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
            username,
            password
        });

        const { token, user } = response.data;
        setAuthData(token, user);
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

// Register user
export const register = async (username: string, password: string): Promise<User> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
            username,
            password
        });

        const { token, user } = response.data;
        setAuthData(token, user);
        return user;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

// Logout user
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};