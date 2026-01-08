import { useState, useEffect, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAsyncDataOptions<T> {
  /** Initial data value */
  initialData?: T | null;
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
  /** Callback on successful fetch */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseAsyncDataReturn<T> extends AsyncState<T> {
  /** Refetch the data */
  refetch: () => Promise<void>;
  /** Manually set data */
  setData: (data: T | null) => void;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * Generic hook for async data fetching with loading and error states
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const { initialData = null, immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetcher();
      setState({ data: result, isLoading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      onError?.(error);
    }
  }, [fetcher, onSuccess, onError]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null });
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    setData,
    reset,
  };
}

/**
 * Parse API response that may be paginated or an array
 */
export function parseApiResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'results' in response) {
    return (response as { results: T[] }).results || [];
  }
  return [];
}
