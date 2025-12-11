import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = useAuthStore.getState().refreshToken;
                if (!refreshToken) {
                    useAuthStore.getState().logout();
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                useAuthStore.getState().setTokens(access, refreshToken);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API methods
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await apiClient.post('/auth/token/', { username, password });
        return response.data;
    },

    register: async (data: {
        username: string;
        email: string;
        password: string;
        password_confirm: string;
        first_name?: string;
        last_name?: string;
    }) => {
        const response = await apiClient.post('/accounts/users/register/', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/accounts/profiles/me/');
        return response.data;
    },
};

// Analytics API methods
export const analyticsAPI = {
    getSummary: async (params?: {
        period?: '7d' | '30d' | '90d' | 'all';
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await apiClient.get('/workouts/history/analytics_summary/', { params });
        return response.data;
    },

    getTrends: async (params?: {
        period?: '7d' | '30d' | '90d' | 'all';
        granularity?: 'daily' | 'weekly' | 'monthly';
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await apiClient.get('/workouts/history/analytics_trends/', { params });
        return response.data;
    },

    getMuscles: async (params?: {
        period?: '7d' | '30d' | '90d' | 'all';
        top_n?: number;
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await apiClient.get('/workouts/history/analytics_muscles/', { params });
        return response.data;
    },

    getConsistency: async (params?: {
        period?: '7d' | '30d' | '90d' | 'all';
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await apiClient.get('/workouts/history/analytics_consistency/', { params });
        return response.data;
    },

    getRecords: async () => {
        const response = await apiClient.get('/workouts/history/analytics_records/');
        return response.data;
    },
};
