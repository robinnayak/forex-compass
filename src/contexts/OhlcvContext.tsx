"use client"

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { OhlcvTick, OhlcvResponse } from '../hooks/useOhlcvStream';

// Context type definition
interface OhlcvContextType {
  lastTick: OhlcvTick | null;
  ticks: OhlcvTick[];
  loading: boolean;
  error: string | null;
  reset: () => void;
  pair: string;
  interval: string;
  setPair: (pair: string) => void;
  setInterval: (interval: string) => void;
}

// Default context value
const defaultContext: OhlcvContextType = {
  lastTick: null,
  ticks: [],
  loading: false,
  error: null,
  reset: () => {},
  pair: 'eurusd',
  interval: '1m',
  setPair: () => {},
  setInterval: () => {},
};

// Create the context
const OhlcvContext = createContext<OhlcvContextType>(defaultContext);

// Track active polling globally across the app
const activePollingInterval: { 
  id: number | null;
  count: number;
} = {
  id: null,
  count: 0,
};

interface OhlcvProviderProps {
  children: ReactNode;
  initialPair?: string;
  initialInterval?: string;
  baseUrl?: string;
  pollInterval?: number;
  maxStoredTicks?: number;
}

// Provider component
export const OhlcvProvider: React.FC<OhlcvProviderProps> = ({
  children,
  initialPair = 'eurusd',
  initialInterval = '1m',
  baseUrl = process.env.NEXT_PUBLIC_TECHNICAL_API_BASE ?? "http://localhost:8000",
  pollInterval = Number(process.env.NEXT_PUBLIC_POLL_MS ?? "") || 10_000,
  maxStoredTicks = 5000,
}) => {
  // State
  const [pair, setPair] = useState(initialPair);
  const [interval, setInterval] = useState(initialInterval);
  const [lastTick, setLastTick] = useState<OhlcvTick | null>(null);
  const [ticks, setTicks] = useState<OhlcvTick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const cursorRef = useRef<string | undefined>(undefined);
  const resetRef = useRef<boolean | undefined>(undefined);
  const seenDatesRef = useRef<Set<string>>(new Set());
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchOhlcv = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current || !mountedRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    const params = new URLSearchParams({ pair, interval });
    if (cursorRef.current) params.set("cursor", cursorRef.current);

    // One-shot reset: include once and then clear
    const doReset = resetRef.current === true;
    if (doReset) {
      params.set("reset", "true");
      resetRef.current = undefined;
    }

    const url = `${baseUrl}/technical/simulate/live/single?${params.toString()}`;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<OhlcvResponse>(url, {
        signal: AbortSignal.timeout(Math.max(pollInterval, 10_000)),
      });
      if (!mountedRef.current) return;

      const payload = response.data;
      cursorRef.current = payload.cursor;

      const tick = payload.data;
      setLastTick(tick);

      // De-duplicate by Date even if duplicates are non-consecutive
      setTicks((prev) => {
        if (seenDatesRef.current.has(tick.Date)) return prev;
        seenDatesRef.current.add(tick.Date);
        return [tick, ...prev].slice(0, maxStoredTicks);
      });
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      if ((e as Error)?.name === "AbortError") return;
      setError((e as Error)?.message ?? "Failed to fetch OHLCV data");
    } finally {
      if (mountedRef.current) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [baseUrl, interval, pair, pollInterval, maxStoredTicks]);

  // Setup polling
  useEffect(() => {
    mountedRef.current = true;
    activePollingInterval.count += 1;
    
    // Clear any existing global interval
    if (activePollingInterval.id !== null) {
      clearInterval(activePollingInterval.id);
      activePollingInterval.id = null;
    }
    
    // Initial fetch
    fetchOhlcv();
    
    // Setup new interval
    const id = window.setInterval(fetchOhlcv, pollInterval);
    activePollingInterval.id = id;
    
    return () => {
      activePollingInterval.count -= 1;
      
      // Only clear the interval if this is the last component unmounting
      if (activePollingInterval.count === 0 && activePollingInterval.id === id) {
        clearInterval(id);
        activePollingInterval.id = null;
      }
      
      mountedRef.current = false;
    };
  }, [fetchOhlcv, pollInterval]);
  
  // Reset function
  const handleReset = useCallback(() => {
    cursorRef.current = undefined;
    seenDatesRef.current.clear();
    setTicks([]);
    setLastTick(null);
    resetRef.current = true;
    fetchOhlcv();
  }, [fetchOhlcv]);

  // Context value
  const contextValue: OhlcvContextType = {
    lastTick,
    ticks,
    loading,
    error,
    reset: handleReset,
    pair,
    interval,
    setPair,
    setInterval,
  };

  return (
    <OhlcvContext.Provider value={contextValue}>
      {children}
    </OhlcvContext.Provider>
  );
};

// Hook to use the OHLCV data
export const useOhlcvContext = () => {
  const context = useContext(OhlcvContext);
  if (!context) {
    throw new Error('useOhlcvContext must be used within an OhlcvProvider');
  }
  return context;
};
