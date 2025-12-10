import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    _hasHydrated: boolean;

    // Actions
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true, // Start as loading until hydrated
            _hasHydrated: false,

            setTokens: (access, refresh) =>
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true
                }),

            setUser: (user) =>
                set({ user, isAuthenticated: true }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false
                }),

            setLoading: (loading) =>
                set({ isLoading: loading }),

            setHasHydrated: (state) => {
                set({
                    _hasHydrated: state,
                    isLoading: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

