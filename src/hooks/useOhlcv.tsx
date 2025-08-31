"use client"
import { useState, useEffect, useRef, useCallback } from 'react';

export interface OHLCV {
  Date: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
}

interface OhlcvParams {
  pair?: string;
  interval?: string;
  refreshInterval?: number;
  maxDataPoints?: number;
  autoReset?: boolean;
}

export const useOhlcv = ({
  pair = 'EURUSD',
  interval = '1m',
  refreshInterval = 5000,
  maxDataPoints = 100,
  autoReset = false,
}: OhlcvParams = {}) => {
  const [data, setData] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataExhausted, setDataExhausted] = useState<boolean>(false);
  
  const isFetchingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await fetch(`/api/forex/ohlcv?pair=${pair}&interval=${interval}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.exhausted) {
        setDataExhausted(true);
        if (autoReset) {
          await resetDataStream();
        }
        return;
      }

      if (result.data) {
        setData(prevData => [...prevData, result.data].slice(-maxDataPoints));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [pair, interval, maxDataPoints, autoReset]);

  const resetDataStream = useCallback(async () => {
    try {
      await fetch(`/api/forex/ohlcv?pair=${pair}&interval=${interval}&reset=true`);
      setData([]);
      setDataExhausted(false);
      setError(null);
      setLoading(true);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset data stream');
    }
  }, [pair, interval, fetchData]);

  useEffect(() => {
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset state when parameters change
    setData([]);
    setLoading(true);
    setError(null);
    setDataExhausted(false);

    // Initial fetch
    fetchData();

    // Set up the interval for streaming data
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!dataExhausted || autoReset) {
          fetchData();
        } else {
          // If data is exhausted and not auto-resetting, clear the interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, refreshInterval);
    }

    // Cleanup function to clear interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pair, interval, refreshInterval, autoReset, fetchData]);

  return { data, loading, error, dataExhausted, resetDataStream };
};