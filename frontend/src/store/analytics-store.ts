/**
 * Zustand store for analytics state management
 */
import { create } from 'zustand';
import type {
  AnalyticsSummary,
  TrendsData,
  MuscleAnalytics,
  ConsistencyData,
  PersonalRecords,
  AnalyticsParams,
} from '@/types/analytics';

interface AnalyticsState {
  // Data
  summary: AnalyticsSummary | null;
  trends: TrendsData | null;
  muscles: MuscleAnalytics | null;
  consistency: ConsistencyData | null;
  records: PersonalRecords | null;

  // UI State
  selectedPeriod: '7d' | '30d' | '90d' | 'all';
  dateRange: { start: string; end: string } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPeriod: (period: '7d' | '30d' | '90d' | 'all') => void;
  setCustomDateRange: (start: string, end: string) => void;
  setSummary: (data: AnalyticsSummary | null) => void;
  setTrends: (data: TrendsData | null) => void;
  setMuscles: (data: MuscleAnalytics | null) => void;
  setConsistency: (data: ConsistencyData | null) => void;
  setRecords: (data: PersonalRecords | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAll: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  // Initial state
  summary: null,
  trends: null,
  muscles: null,
  consistency: null,
  records: null,
  selectedPeriod: '30d',
  dateRange: null,
  isLoading: false,
  error: null,

  // Actions
  setPeriod: (period) => set({ selectedPeriod: period, dateRange: null }),

  setCustomDateRange: (start, end) =>
    set({ dateRange: { start, end }, selectedPeriod: 'all' }),

  setSummary: (data) => set({ summary: data }),

  setTrends: (data) => set({ trends: data }),

  setMuscles: (data) => set({ muscles: data }),

  setConsistency: (data) => set({ consistency: data }),

  setRecords: (data) => set({ records: data }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  clearAll: () =>
    set({
      summary: null,
      trends: null,
      muscles: null,
      consistency: null,
      records: null,
      error: null,
    }),
}));
