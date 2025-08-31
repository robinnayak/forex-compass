"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// Types for the backend response
interface OhlcvTick {
  Date: string;     // ISO string
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}
interface OhlcvResponse {
  pair: string;
  interval: string;
  date: string;     // server timestamp ISO
  total_rows: number;
  returned: number;
  has_more: boolean;
  cursor: string;   // next cursor
  data: OhlcvTick;  // single row returned by "live/single"
}

const StrategyTab: React.FC = () => {
  // Configurable inputs
  const baseUrl =
    process.env.NEXT_PUBLIC_TECHNICAL_API_BASE ?? "http://localhost:8000";
  const pollMs =
    Number(process.env.NEXT_PUBLIC_POLL_MS ?? "") || 10_000; // default 10s

  // Query params
  const pair = "eurusd";
  const interval = "1m";

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

  const fetchOhlcv = async () => {
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
        signal: AbortSignal.timeout(Math.max(pollMs, 10_000)),
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
        return [tick, ...prev].slice(0, 5000);
      });
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      if ((e as Error)?.name === "AbortError") return;
      setError((e as Error)?.message ?? "Failed to fetch OHLCV data");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch immediately
    fetchOhlcv();

    // Stable polling
    const id = setInterval(fetchOhlcv, pollMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [baseUrl, pollMs]);

  const handleReset = () => {
    // Clear local buffers and request a server reset on next call
    cursorRef.current = undefined;
    seenDatesRef.current.clear();
    setTicks([]);
    setLastTick(null);
    resetRef.current = true;
    fetchOhlcv(); // call once immediately with reset=true
  };

  return (
    <div className="p-4 space-y-3 bg-background">
      <h2 className="text-lg font-semibold">Strategy</h2>

      <div className="text-sm text-gray-600">
        Pair: {pair.toUpperCase()} | Interval: {interval} | Poll: {pollMs / 1000}s
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-2 py-1 text-sm rounded hover:bg-background border-white border-2"
        >
          Reset stream
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">Error: {error}</div>}

      <div className="text-sm">
        Last tick:{" "}
        {lastTick
          ? `${lastTick.Date} O:${lastTick.Open} H:${lastTick.High} L:${lastTick.Low} C:${lastTick.Close} V:${lastTick.Volume}`
          : loading
          ? "Loading..."
          : "No data yet"}
      </div>

      <div className="text-xs text-gray-500 mb-2">Stored ticks: {ticks.length}</div>
      
      {/* Render stored ticks in a table for better visualization */}
      {ticks.length > 0 && (
        <div className="overflow-auto max-h-80 border border-gray-300 rounded">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-right">Open</th>
                <th className="px-2 py-1 text-right">High</th>
                <th className="px-2 py-1 text-right">Low</th>
                <th className="px-2 py-1 text-right">Close</th>
                <th className="px-2 py-1 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {ticks.slice(0, 10).map((tick, index) => (
                <tr key={tick.Date} className={index === 0 ? "bg-blue-50" : "hover:bg-gray-50"}>
                  <td className="px-2 py-1">{new Date(tick.Date).toLocaleTimeString()}</td>
                  <td className="px-2 py-1 text-right">{tick.Open.toFixed(5)}</td>
                  <td className="px-2 py-1 text-right">{tick.High.toFixed(5)}</td>
                  <td className="px-2 py-1 text-right">{tick.Low.toFixed(5)}</td>
                  <td className="px-2 py-1 text-right">{tick.Close.toFixed(5)}</td>
                  <td className="px-2 py-1 text-right">{tick.Volume}</td>
                </tr>
              ))}
              {ticks.length > 10 && (
                <tr>
                  <td colSpan={6} className="px-2 py-1 text-center text-gray-500">
                    + {ticks.length - 10} more ticks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StrategyTab;