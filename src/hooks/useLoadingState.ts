import { useState, useCallback } from 'react';

interface UseLoadingStateReturn<T> {
  loading: boolean;
  execute: (promise: Promise<T>) => Promise<T>;
}

/**
 * Custom hook that manages loading state for a promise.
 * 
 * @returns An object with loading state and an execute function that accepts a promise
 */
export const useLoadingState = <T,>(): UseLoadingStateReturn<T> => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (promise: Promise<T>) => {
    setLoading(true);
    try {
      const result = await promise;
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    execute,
  };
};