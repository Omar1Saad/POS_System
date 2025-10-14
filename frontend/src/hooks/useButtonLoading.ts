import { useState, useCallback } from 'react';

interface ButtonLoadingState {
  [key: string]: boolean;
}

interface UseButtonLoadingReturn {
  isLoading: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  withLoading: <T extends any[], R>(
    key: string,
    asyncFn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>;
  isAnyLoading: () => boolean;
}

/**
 * Custom hook for managing button loading states during API calls
 * Prevents multiple simultaneous requests and provides loading state management
 */
export const useButtonLoading = (): UseButtonLoadingReturn => {
  const [loadingStates, setLoadingStates] = useState<ButtonLoadingState>({});

  const isLoading = useCallback((key: string): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const withLoading = useCallback(<T extends any[], R>(
    key: string,
    asyncFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      // Prevent multiple simultaneous calls for the same key
      if (loadingStates[key]) {
        return Promise.reject(new Error('Request already in progress'));
      }

      setLoading(key, true);
      try {
        const result = await asyncFn(...args);
        return result;
      } finally {
        setLoading(key, false);
      }
    };
  }, [loadingStates, setLoading]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  return {
    isLoading,
    setLoading,
    withLoading,
    isAnyLoading
  };
};

export default useButtonLoading;
