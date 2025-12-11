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

    updateProfile: async (data: {
        first_name?: string;
        last_name?: string;
        bio?: string;
    }) => {
        const response = await apiClient.patch('/accounts/profiles/update_profile/', data);
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

// Presets API methods
export const presetsAPI = {
    getAll: async (params?: {
        search?: string;
        ordering?: string;
    }) => {
        const response = await apiClient.get('/exercises/presets/', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/exercises/presets/${id}/`);
        return response.data;
    },
};

// Nutrition API methods
export const nutritionAPI = {
    // Food Items
    searchFoods: async (search?: string) => {
        const response = await apiClient.get('/nutrition/foods/', {
            params: { search }
        });
        return response.data;
    },

    // Nutrition Goals
    getGoal: async () => {
        const response = await apiClient.get('/nutrition/goals/');
        return response.data;
    },

    createGoal: async (data: {
        daily_calories: number;
        daily_protein: number;
        daily_carbs: number;
        daily_fat: number;
        goal_type: 'maintain' | 'cut' | 'bulk';
    }) => {
        const response = await apiClient.post('/nutrition/goals/', data);
        return response.data;
    },

    updateGoal: async (id: number, data: {
        daily_calories: number;
        daily_protein: number;
        daily_carbs: number;
        daily_fat: number;
        goal_type: 'maintain' | 'cut' | 'bulk';
    }) => {
        const response = await apiClient.put(`/nutrition/goals/${id}/`, data);
        return response.data;
    },

    // Meal Logs
    getMealLogs: async (params?: {
        date?: string;
        meal_type?: string;
    }) => {
        const response = await apiClient.get('/nutrition/logs/', { params });
        return response.data;
    },

    createMealLog: async (data: {
        food_name: string;
        quantity: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        date: string;
        food_item?: number;
    }) => {
        const response = await apiClient.post('/nutrition/logs/', data);
        return response.data;
    },

    updateMealLog: async (id: number, data: {
        food_name?: string;
        quantity?: number;
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        date?: string;
    }) => {
        const response = await apiClient.patch(`/nutrition/logs/${id}/`, data);
        return response.data;
    },

    deleteMealLog: async (id: number) => {
        const response = await apiClient.delete(`/nutrition/logs/${id}/`);
        return response.data;
    },

    // Daily Summary
    getDailySummary: async (date?: string) => {
        const response = await apiClient.get('/nutrition/logs/daily_summary/', {
            params: { date }
        });
        return response.data;
    },

    // Favorite Meals
    getFavoriteMeals: async () => {
        const response = await apiClient.get('/nutrition/favorites/');
        return response.data;
    },

    createFavoriteMeal: async (data: {
        food_item: number;
        name: string;
        default_quantity: number;
        default_meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    }) => {
        const response = await apiClient.post('/nutrition/favorites/', data);
        return response.data;
    },

    deleteFavoriteMeal: async (id: number) => {
        const response = await apiClient.delete(`/nutrition/favorites/${id}/`);
        return response.data;
    },

    logFavoriteNow: async (id: number, data?: {
        meal_type?: string;
        quantity?: number;
        date?: string;
    }) => {
        const response = await apiClient.post(`/nutrition/favorites/${id}/log_now/`, data);
        return response.data;
    },
};

// Workout API methods
export const workoutAPI = {
    // Generate workout
    generateWorkout: async (data: {
        muscles_targeted: string[];
        duration: number;
        intensity: 'light' | 'moderate' | 'intense';
        goal: 'strength' | 'hypertrophy' | 'endurance';
        equipment: 'bodyweight' | 'home' | 'gym';
    }) => {
        const response = await apiClient.post('/workouts/generated/generate/', data);
        return response.data;
    },

    // Fetch workout history
    getHistory: async (params?: {
        intensity?: string;
        goal?: string;
        equipment?: string;
        ordering?: string;
    }) => {
        const response = await apiClient.get('/workouts/history/', { params });
        return response.data;
    },

    // Create workout history entry
    createHistory: async (data: {
        muscles_targeted: string[];
        duration: number;
        intensity: string;
        goal: string;
        equipment: string;
        exercises_completed: any[];
        status?: 'planned' | 'in_progress' | 'completed';
    }) => {
        const response = await apiClient.post('/workouts/history/', data);
        return response.data;
    },

    // Update workout history (mark as completed)
    updateHistory: async (id: number, data: any) => {
        const response = await apiClient.patch(`/workouts/history/${id}/`, data);
        return response.data;
    },
};
// Social API methods
export const socialAPI = {
    // Follow/Unfollow
    followUser: async (userId: number) => {
        const response = await apiClient.post('/social/follows/', { following_id: userId });
        return response.data;
    },

    unfollowUser: async (userId: number) => {
        const response = await apiClient.delete(`/social/follows/unfollow/?following_id=${userId}`);
        return response.data;
    },

    getFollowing: async () => {
        const response = await apiClient.get('/social/follows/following/');
        return response.data;
    },

    getFollowers: async () => {
        const response = await apiClient.get('/social/follows/followers/');
        return response.data;
    },

    // Social Feed
    getFeed: async () => {
        const response = await apiClient.get('/social/feed/');
        return response.data;
    },

    createPost: async (data: {
        post_type: 'workout' | 'achievement' | 'milestone';
        content: string;
        workout_id?: number;
        achievement_id?: number;
        metadata?: any;
    }) => {
        const response = await apiClient.post('/social/feed/', data);
        return response.data;
    },

    likePost: async (postId: number) => {
        const response = await apiClient.post(`/social/feed/${postId}/like/`);
        return response.data;
    },

    unlikePost: async (postId: number) => {
        const response = await apiClient.delete(`/social/feed/${postId}/unlike/`);
        return response.data;
    },

    commentOnPost: async (postId: number, content: string) => {
        const response = await apiClient.post(`/social/feed/${postId}/comment/`, { content });
        return response.data;
    },

    getMyPosts: async () => {
        const response = await apiClient.get('/social/feed/my_posts/');
        return response.data;
    },

    // User Search
    searchUsers: async (search: string) => {
        const response = await apiClient.get('/social/users/', { params: { search } });
        return response.data;
    },

    getUserProfile: async (userId: number) => {
        const response = await apiClient.get(`/social/users/${userId}/profile/`);
        return response.data;
    },
};