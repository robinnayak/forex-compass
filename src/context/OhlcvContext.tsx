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
  // New fields for progressive loading
  allLoadedData: DataPoint[]; // All data loaded so far
  totalAvailable: number; // Total points available in backend
  hasMoreData: boolean; // Whether more data can be loaded
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
const INITIAL_LOAD_SIZE = 200; // Load more data initially
const PRE_FETCH_THRESHOLD = 50; // Pre-fetch when 50 points from end
const PRE_FETCH_SIZE = 100; // Pre-fetch 100 more points
const VISIBLE_DATA_POINTS = 100; // Show last 100 points in charts

const OhlcvContext = createContext<OhlcvContextType | null>(null);

export function OhlcvProvider({ children }: { children: ReactNode }) {
  const [pairsData, setPairsData] = useState<Record<string, PairData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe] = useState(DEFAULT_TIMEFRAME);
  const timerRef = useRef<NodeJS.Timeout>();

  // Track loading state per pair to avoid duplicate requests
  const loadingPairsRef = useRef<Set<string>>(new Set());

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
        error: null,
        allLoadedData: [], // All data loaded so far
        totalAvailable: 0, // Will be set after first fetch
        hasMoreData: true // Assume there's more data initially
      };
    });
    return initialData;
  }, [timeframe]);

  // Fetch initial data for a pair
  const fetchInitialPairData = useCallback(async (pair: string) => {
    if (loadingPairsRef.current.has(pair)) return;
    
    loadingPairsRef.current.add(pair);
    
    try {
      setPairsData(prev => ({
        ...prev,
        [pair]: { ...prev[pair], isLoading: true, error: null }
      }));

      // Fetch initial larger window
      const response = await axios.get(
        `/api/forex-ohlcv/${pair}/${timeframe}?from_limit=0&to_limit=${INITIAL_LOAD_SIZE}`
      );
      
      if (!response.data?.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid data format received');
      }

      const pairData: PairData = {
        pair,
        data: response.data.data.slice(0, VISIBLE_DATA_POINTS), // Show only recent points
        currentIndex: 0,
        countdown: parseInt(timeframe) * 60,
        isLoading: false,
        error: null,
        allLoadedData: response.data.data, // Store all loaded data
        totalAvailable: response.data.total || 0,
        hasMoreData: response.data.metadata?.hasMore ?? true
      };

      setPairsData(prev => ({ ...prev, [pair]: pairData }));
      console.log(`[OHLCV] Initial load ${pair}: ${response.data.data.length} points, total available: ${response.data.total || 'unknown'}`);
      
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
    } finally {
      loadingPairsRef.current.delete(pair);
    }
  }, [timeframe]);

  // Pre-fetch more data when approaching end of current data
  const preFetchMoreData = useCallback(async (pair: string) => {
    if (loadingPairsRef.current.has(pair)) return;
    
    const currentPairData = pairsData[pair];
    if (!currentPairData || !currentPairData.hasMoreData) return;
    
    loadingPairsRef.current.add(pair);
    
    try {
      const nextFrom = currentPairData.allLoadedData.length;
      const nextTo = nextFrom + PRE_FETCH_SIZE;
      
      console.log(`[OHLCV] Pre-fetching ${pair}: ${nextFrom}-${nextTo}`);
      
      const response = await axios.get(
        `/api/forex-ohlcv/${pair}/${timeframe}?from_limit=${nextFrom}&to_limit=${nextTo}`
      );
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        // Merge new data with existing data
        const newAllData = [...currentPairData.allLoadedData, ...response.data.data];
        
        setPairsData(prev => ({
          ...prev,
          [pair]: {
            ...prev[pair],
            allLoadedData: newAllData,
            hasMoreData: response.data.metadata?.hasMore ?? true,
            // Update visible data to show recent points
            data: newAllData.slice(
              Math.max(0, currentPairData.currentIndex - VISIBLE_DATA_POINTS + 1),
              currentPairData.currentIndex + 1
            )
          }
        }));
        
        console.log(`[OHLCV] Pre-fetched ${pair}: +${response.data.data.length} points, total loaded: ${newAllData.length}`);
      }
    } catch (err) {
      console.error(`[OHLCV] Error pre-fetching ${pair}:`, err);
    } finally {
      loadingPairsRef.current.delete(pair);
    }
  }, [pairsData, timeframe]);

  // Check if we need to pre-fetch more data
  const checkAndPreFetch = useCallback((pair: string, currentIndex: number, totalLoadedLength: number) => {
    const pointsRemaining = totalLoadedLength - currentIndex;
    
    if (pointsRemaining <= PRE_FETCH_THRESHOLD) {
      console.log(`[OHLCV] Low data buffer for ${pair} (${pointsRemaining} points left), pre-fetching more...`);
      preFetchMoreData(pair);
    }
  }, [preFetchMoreData]);

  // Update visible data (show recent points for charts)
  const updateVisibleData = useCallback((pair: string, currentIndex: number, allLoadedData: DataPoint[]) => {
    const startIndex = Math.max(0, currentIndex - VISIBLE_DATA_POINTS + 1);
    const visibleData = allLoadedData.slice(startIndex, currentIndex + 1);
    
    setPairsData(prev => ({
      ...prev,
      [pair]: {
        ...prev[pair],
        data: visibleData
      }
    }));
  }, []);

  // Fetch data for all pairs
  const fetchAllPairsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize all pairs first
      setPairsData(initializePairsData());

      // Fetch initial data for all pairs
      const promises = MAJOR_PAIRS.map(pair => fetchInitialPairData(pair));
      await Promise.allSettled(promises);

      console.log(`[OHLCV] Initialized ${MAJOR_PAIRS.length} pairs with ${INITIAL_LOAD_SIZE} points each`);
    } catch (err) {
      setError('Failed to initialize currency pairs data');
      console.error('[OHLCV] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInitialPairData, initializePairsData]);

  // Refresh single pair
  const refreshPair = useCallback(async (pair: string) => {
    await fetchInitialPairData(pair);
  }, [fetchInitialPairData]);

  // Refresh all pairs
  const refreshAllPairs = useCallback(async () => {
    await fetchAllPairsData();
  }, [fetchAllPairsData]);

  // Smooth data progression - NO WINDOW SHIFTING!
  const progressToNextDataPoint = useCallback(() => {
    setPairsData(prev => {
      const updated = { ...prev };
      let hasUpdates = false;

      Object.keys(updated).forEach(pair => {
        const pairData = updated[pair];
        
        if (pairData.isLoading || pairData.allLoadedData.length === 0) return;

        const newCountdown = pairData.countdown - 1;
        
        if (newCountdown <= 0) {
          const newIndex = pairData.currentIndex + 1;
          
          // Check if we have enough data for the new index
          if (newIndex < pairData.allLoadedData.length) {
            updated[pair] = {
              ...pairData,
              currentIndex: newIndex,
              countdown: parseInt(timeframe) * 60
            };
            hasUpdates = true;
            
            // Update visible data for charts
            updateVisibleData(pair, newIndex, pairData.allLoadedData);
            
            // Check if we need to pre-fetch more data
            checkAndPreFetch(pair, newIndex, pairData.allLoadedData.length);
            
            if (newIndex % 10 === 0) { // Log every 10 points to avoid spam
              console.log(`[OHLCV] ${pair} progressed to index: ${newIndex}/${pairData.allLoadedData.length}`);
            }
          } else {
            // Reached end of loaded data
            if (pairData.hasMoreData) {
              console.log(`[OHLCV] ${pair} reached end of loaded data, waiting for pre-fetch...`);
              // Trigger immediate pre-fetch if we haven't already
              preFetchMoreData(pair);
            } else {
              console.log(`[OHLCV] ${pair} reached end of all available data`);
              // Reset to beginning or pause, depending on your needs
              updated[pair] = {
                ...pairData,
                countdown: parseInt(timeframe) * 60 // Keep counting but don't advance
              };
              hasUpdates = true;
            }
          }
        } else {
          // Just update countdown
          updated[pair] = {
            ...pairData,
            countdown: newCountdown
          };
          hasUpdates = true;
        }
      });

      return hasUpdates ? updated : prev;
    });
  }, [timeframe, checkAndPreFetch, preFetchMoreData, updateVisibleData]);

  // Initialize all pairs on mount
  useEffect(() => {
    fetchAllPairsData();
  }, [fetchAllPairsData]);

  // Smooth timer for data progression
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      progressToNextDataPoint();
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [progressToNextDataPoint]);

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

// Updated hook for individual pair data
export function usePairData(pair: string) {
  const { pairsData, refreshPair } = useOhlcv();
  const pairData = pairsData[pair] || {
    pair,
    data: [],
    currentIndex: 0,
    countdown: 60,
    isLoading: true,
    error: null,
    allLoadedData: [],
    totalAvailable: 0,
    hasMoreData: true
  };

  return {
    ...pairData,
    refresh: () => refreshPair(pair),
    currentData: pairData.allLoadedData[pairData.currentIndex] || null,
    progress: pairData.totalAvailable > 0 
      ? (pairData.currentIndex / pairData.totalAvailable) * 100 
      : 0,
    // Helper properties
    pointsLoaded: pairData.allLoadedData.length,
    pointsRemaining: pairData.allLoadedData.length - pairData.currentIndex,
    canProgress: pairData.currentIndex < pairData.allLoadedData.length - 1
  };
}