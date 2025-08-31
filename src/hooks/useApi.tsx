import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { parseError } from '@/utils/errors';
import { ErrorState } from '@/types/errors';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ErrorState | null;
  fetchData: (config?: AxiosRequestConfig) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for handling API requests with consistent error handling
 */
export function useApi<T = unknown>(initialUrl: string, initialConfig?: AxiosRequestConfig): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchData = useCallback(async (config?: AxiosRequestConfig) => {
    const requestConfig = config || initialConfig || {};
    const url = config?.url || initialUrl;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({ ...requestConfig, url });
      setData(response.data);
      return response.data;
    } catch (err) {
      // console.error('API Error:', err.response.data);
      const parsedError = parseError(err);
      console.error('Parsed Error:', parsedError.resError);
      setError(parsedError.resError ? { ...parsedError, resError: parsedError.resError } : parsedError);
      throw parsedError;
    } finally {
      setLoading(false);
    }
  }, [initialUrl, initialConfig]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { data, loading, error, fetchData, clearError };
}