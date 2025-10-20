"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { DataPoint } from "@/types/technical";
import axios from "axios";

interface PairData {
  pair: string;
  data: DataPoint[];
  currentIndex: number;
  countdown: number;
  isLoading: boolean;
  error: string | null;
}

interface OhlcvContextType {
  pairsData: Record<string, PairData>;
  isLoading: boolean;
  error: string | null;
  timeframe: string;
  refreshPair: (pair: string) => Promise<void>;
  refreshAllPairs: () => Promise<void>;
}

const MAJOR_PAIRS = ["EURUSD", "GBPUSD"];
const DEFAULT_TIMEFRAME = "1";
const WINDOW_SIZE = 50; // Fixed window size
const INITIAL_FROM = 0;
const INITIAL_TO = WINDOW_SIZE;

const OhlcvContext = createContext<OhlcvContextType | null>(null);

export function OhlcvProvider({ children }: { children: ReactNode }) {
  const [pairsData, setPairsData] = useState<Record<string, PairData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe] = useState(DEFAULT_TIMEFRAME);
  const timerRef = useRef<NodeJS.Timeout>();

  const [fromLimit, setFromLimit] = useState(INITIAL_FROM);
  const [toLimit, setToLimit] = useState(INITIAL_TO);

  // Initialize all pairs data structure
  const initializePairsData = useCallback(() => {
    const initialData: Record<string, PairData> = {};
    MAJOR_PAIRS.forEach(pair => {
      initialData[pair] = {
        pair,
        data: [],
        currentIndex: 0,
        countdown: parseInt(timeframe) * 60,
        isLoading: true,
        error: null
      };
    });
    return initialData;
  }, [timeframe]);

  // Fetch data for a specific pair with current limits
  const fetchPairData = useCallback(async (pair: string, customFrom?: number, customTo?: number) => {
    try {
      setPairsData(prev => ({
        ...prev,
        [pair]: { ...prev[pair], isLoading: true, error: null }
      }));

      const currentFrom = customFrom !== undefined ? customFrom : fromLimit;
      const currentTo = customTo !== undefined ? customTo : toLimit;

      const response = await axios.get(`/api/forex-ohlcv/${pair}/${timeframe}?to_limit=${currentTo}&from_limit=${currentFrom}`);
      
      if (!response.data?.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid data format received');
      }

      const pairData: PairData = {
        pair,
        data: response.data.data,
        currentIndex: 0,
        countdown: parseInt(timeframe) * 60,
        isLoading: false,
        error: null
      };

      setPairsData(prev => ({ ...prev, [pair]: pairData }));
      console.log(`[OHLCV] Successfully loaded ${pair}: ${response.data.data.length} data points (${currentFrom}-${currentTo})`);
      
      return pairData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[OHLCV] Error fetching ${pair}:`, errorMessage);
      
      setPairsData(prev => ({
        ...prev,
        [pair]: { 
          ...prev[pair], 
          isLoading: false, 
          error: errorMessage 
        }
      }));
      
      return null;
    }
  }, [timeframe, fromLimit, toLimit]);

  // Fetch data for all pairs
  const fetchAllPairsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize all pairs first
      setPairsData(initializePairsData());

      // Fetch data for all pairs concurrently
      const promises = MAJOR_PAIRS.map(pair => fetchPairData(pair, fromLimit, toLimit));
      const results = await Promise.allSettled(promises);

      // Check if any requests failed
      const failedPairs = results
        .map((result, index) => result.status === 'rejected' ? MAJOR_PAIRS[index] : null)
        .filter(Boolean);

      if (failedPairs.length > 0) {
        setError(`Failed to load: ${failedPairs.join(', ')}`);
      }

      console.log(`[OHLCV] Initialized ${MAJOR_PAIRS.length} currency pairs with data ${fromLimit}-${toLimit}`);
    } catch (err) {
      setError('Failed to initialize currency pairs data');
      console.error('[OHLCV] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPairData, initializePairsData, fromLimit, toLimit]);

  // Refresh single pair with current limits
  const refreshPair = useCallback(async (pair: string) => {
    if (MAJOR_PAIRS.includes(pair)) {
      await fetchPairData(pair, fromLimit, toLimit);
    }
  }, [fetchPairData, fromLimit, toLimit]);

  // Refresh all pairs
  const refreshAllPairs = useCallback(async () => {
    await fetchAllPairsData();
  }, [fetchAllPairsData]);

  // Move to next data window
  const moveToNextWindow = useCallback(async () => {
    console.log(`[OHLCV] Moving to next data window: ${fromLimit + 1}-${toLimit + 1}`);
    
    // Update limits for next window
    const newFrom = fromLimit + 1;
    const newTo = toLimit + 1;
    
    setFromLimit(newFrom);
    setToLimit(newTo);

    // Refresh all pairs with new limits
    setIsLoading(true);
    try {
      const promises = MAJOR_PAIRS.map(pair => fetchPairData(pair, newFrom, newTo));
      await Promise.allSettled(promises);
      console.log(`[OHLCV] Successfully updated to window ${newFrom}-${newTo}`);
    } catch (err) {
      console.error('[OHLCV] Error moving to next window:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fromLimit, toLimit, fetchPairData]);

  // Initialize all pairs on mount
  useEffect(() => {
    fetchAllPairsData();
  }, [fetchAllPairsData]);

  // Timer for data progression and window movement
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setPairsData(prev => {
        const updated = { ...prev };
        let hasUpdates = false;

        Object.keys(updated).forEach(pair => {
          const pairData = updated[pair];
          
          // Skip if no data or still loading
          if (pairData.isLoading || pairData.data.length === 0) return;

          // Update countdown
          const newCountdown = pairData.countdown - 1;
          
          // Check if we need to move to next data point AND next window
          if (newCountdown <= 0) {
            // Move to next data point within current window
            const newIndex = (pairData.currentIndex + 1) % pairData.data.length;
            updated[pair] = {
              ...pairData,
              currentIndex: newIndex,
              countdown: parseInt(timeframe) * 60
            };
            hasUpdates = true;
            
            console.log(`[OHLCV] ${pair} advanced to index: ${newIndex}`);
            
            // Move to next data window (this will trigger a re-fetch)
            moveToNextWindow();
          } else {
            updated[pair] = {
              ...pairData,
              countdown: newCountdown
            };
            hasUpdates = true;
          }
        });

        return hasUpdates ? updated : prev;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeframe, moveToNextWindow]);

  // Auto-refresh data periodically (every 5 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('[OHLCV] Auto-refreshing all pairs data');
      fetchAllPairsData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [fetchAllPairsData]);

  const contextValue: OhlcvContextType = {
    pairsData,
    isLoading,
    error,
    timeframe,
    refreshPair,
    refreshAllPairs
  };

  return (
    <OhlcvContext.Provider value={contextValue}>
      {children}
    </OhlcvContext.Provider>
  );
}

export function useOhlcv() {
  const context = useContext(OhlcvContext);
  if (!context) {
    throw new Error("useOhlcv must be used within an OhlcvProvider");
  }
  return context;
}

// Helper hook for individual pair data
export function usePairData(pair: string) {
  const { pairsData, refreshPair } = useOhlcv();
  const pairData = pairsData[pair] || {
    pair,
    data: [],
    currentIndex: 0,
    countdown: 60,
    isLoading: true,
    error: null
  };

  return {
    ...pairData,
    refresh: () => refreshPair(pair),
    currentData: pairData.data[pairData.currentIndex] || null
  };
}