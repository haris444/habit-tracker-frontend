import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'https://habit-tracker-backend-0576.onrender.com';

export interface Habit {
    id: number;
    name: string;
    streak: number;
    xp: number;
    level: number;
    completionDates?: string[];
    user?: { id: number };
}

// Create axios instance with auth header
const apiClient = axios.create({
    baseURL: 'https://habit-tracker-backend-0576.onrender.com/api'
});

// Add auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Get current date from backend
export const getCurrentDate = async (): Promise<string> => {
    try {
        const response = await apiClient.get('/habits/current-date');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch current date:', error);
        throw error;
    }
};

// Get all habits
export const getHabits = async (): Promise<Habit[]> => {
    try {
        const response = await apiClient.get('/habits');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch habits:', error);
        throw error;
    }
};

// Create a new habit
export const createHabit = async (name: string): Promise<Habit> => {
    try {
        const response = await apiClient.post('/habits', { name, streak: 0 });
        return response.data;
    } catch (error) {
        console.error('Failed to create habit:', error);
        throw error;
    }
};

// Delete a habit
export const deleteHabit = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`/habits/${id}`);
    } catch (error) {
        console.error('Failed to delete habit:', error);
        throw error;
    }
};

// Complete a habit
export const completeHabit = async (id: number): Promise<Habit> => {
    try {
        const response = await apiClient.post(`/habits/complete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to complete habit:', error);
        throw error;
    }
};



export const getCompletionCounts = async (
    start: string,
    end: string
): Promise<Record<string, number>> => {
    try {
        const response = await apiClient.get('/habits/completions', {
            params: { start, end }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch completion counts:', error);
        throw error;
    }
};

// Set a custom date for testing
export const setCustomDate = async (date: string): Promise<string> => {
    try {
        // This is an open endpoint as configured in SecurityConfig
        const response = await axios.post('/api/habits/set-date', null, {
            params: { date }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to set custom date:', error);
        throw error;
    }
};