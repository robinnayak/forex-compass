import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { ErrorState } from '@/types/errors';

// Define the DataPoint type
export interface DataPoint {
  Date: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
  [key: string]: string; // Allow for additional properties
}

interface ApiResponse {
  message?: string;
  timestamp?: string;
  data?: {
    headers?: string[];
    data?: DataPoint[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface UseOhlcvDataOptions {
  pair: string;
  interval: '1m' | '5m' | '15m' | '1hr';
  refreshInterval?: number; // in milliseconds
  limit?: number; // Number of data points to keep
}

interface UseOhlcvDataResult {
  data: DataPoint[] | null;
  currentDataPoint: DataPoint | null;
  loading: boolean;
  error: ErrorState | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

/**
 * Custom hook for fetching and updating OHLCV data at regular intervals
 */
export function useOhlcvData({
  pair,
  interval,
  refreshInterval = 60 * 1000, // Default to 1 minute
  limit = 30 // Default to 30 data points
}: UseOhlcvDataOptions): UseOhlcvDataResult {
  const { 
    data: apiResponse, 
    loading, 
    error, 
    fetchData 
  } = useApi<ApiResponse>(`/api/forex/live?pair=${pair}&interval=${interval}`);

  const [ohlcvData, setOhlcvData] = useState<DataPoint[] | null>(null);
  const [currentDataPoint, setCurrentDataPoint] = useState<DataPoint | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Update OHLCV data when API data changes
  useEffect(() => {
    if (apiResponse?.data?.data) {
      const newData = apiResponse.data.data.slice(0, limit);
      setOhlcvData(newData);
      setLastUpdated(apiResponse.timestamp || new Date().toISOString());
      
      // Set the current data point to the first/latest one
      if (newData.length > 0) {
        setCurrentDataPoint(newData[0]);
      }
    }
  }, [apiResponse, limit]);
  
  // Memoized refresh function that returns a promise
  const refreshData = useCallback(async () => {
    try {
      await fetchData();
    } catch (err) {
      console.error("Error refreshing OHLCV data:", err);
    }
  }, [fetchData]);
  
  // Set up polling for live updates
  useEffect(() => {
    // Initial data fetch
    refreshData();
    
    // Set up polling
    const pollingInterval = setInterval(() => {
      refreshData();
    }, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(pollingInterval);
  }, [refreshInterval, refreshData]);
  
  return {
    data: ohlcvData,
    currentDataPoint,
    loading,
    error,
    refresh: refreshData,
    lastUpdated
  };
}