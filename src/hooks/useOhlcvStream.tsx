import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Types for the OHLCV data
export interface OhlcvTick {
  Date: string;     // ISO string
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface OhlcvResponse {
  pair: string;
  interval: string;
  date: string;     // server timestamp ISO
  total_rows: number;
  returned: number;
  has_more: boolean;
  cursor: string;   // next cursor
  data: OhlcvTick;  // single row returned by "live/single"
}

interface UseOhlcvStreamOptions {
  pair: string;
  interval: string;
  baseUrl?: string;
  pollInterval?: number;
  maxStoredTicks?: number;
}

/**
 * A custom hook for streaming OHLCV data from the API
 */
// Keep track of active interval IDs
const activeIntervals = new Set<number>();

export function useOhlcvStream({
  pair,
  interval,
  baseUrl = process.env.NEXT_PUBLIC_TECHNICAL_API_BASE ?? "http://localhost:8000",
  pollInterval = Number(process.env.NEXT_PUBLIC_POLL_MS ?? "") || 10_000,
  maxStoredTicks = 5000
}: UseOhlcvStreamOptions) {
  // Local state
  const [lastTick, setLastTick] = useState<OhlcvTick | null>(null);
  const [ticks, setTicks] = useState<OhlcvTick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to avoid interval recreation
  const cursorRef = useRef<string | undefined>(undefined);
  const mountedRef = useRef(true);
  const resetRef = useRef<boolean | undefined>(undefined);
  const seenDatesRef = useRef<Set<string>>(new Set());
  const intervalIdRef = useRef<number | null>(null);

  // Track if a fetch is in progress to prevent overlapping requests
  const isFetchingRef = useRef(false);
  
  const fetchOhlcv = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
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

  useEffect(() => {
    // Set mounted flag to true
    mountedRef.current = true;
    
    // Clear any existing intervals for this component instance
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      activeIntervals.delete(intervalIdRef.current);
    }

    // Initial fetch immediately
    fetchOhlcv();

    // Stable polling with debounce protection
    const id = window.setInterval(() => {
      // Only proceed if component is still mounted and this is the most recent interval
      if (mountedRef.current && intervalIdRef.current === id) {
        fetchOhlcv();
      }
    }, pollInterval);
    
    // Store the interval ID and track it globally
    intervalIdRef.current = id;
    activeIntervals.add(id);
    
    // Debug tracking - uncomment if needed
    // console.log('Active intervals:', activeIntervals.size);
    
    return () => {
      mountedRef.current = false;
      clearInterval(id);
      if (intervalIdRef.current === id) {
        intervalIdRef.current = null;
      }
      activeIntervals.delete(id);
    };
  }, [fetchOhlcv, pollInterval]);

  const handleReset = useCallback(() => {
    // Clear local buffers and request a server reset on next call
    cursorRef.current = undefined;
    seenDatesRef.current.clear();
    setTicks([]);
    setLastTick(null);
    resetRef.current = true;
    fetchOhlcv(); // call once immediately with reset=true
  }, [fetchOhlcv]);

  return {
    lastTick,
    ticks,
    loading,
    error,
    reset: handleReset,
  };
}
