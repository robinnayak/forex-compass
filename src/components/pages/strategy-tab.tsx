"use client";
import React, { useState } from "react";
import { fetchOhlcvBatch, formatOhlcvTick, formatTickDate } from "../../utils/ohlcvUtils";
import { useOhlcvContext } from "../../contexts/OhlcvContext";

const StrategyTab: React.FC = () => {
  // Get poll interval from env vars for display purposes
  const pollMs = Number(process.env.NEXT_PUBLIC_POLL_MS ?? "") || 10_000;

  // State for batch fetch demo
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<string[]>([]);

  // Use our context to access OHLCV data
  const { lastTick, ticks, loading, error, reset, pair, interval } = useOhlcvContext();
  
  // Example of using the utility function directly for one-time fetches
  const handleFetchBatch = async () => {
    try {
      setBatchLoading(true);
      const result = await fetchOhlcvBatch({ pair, interval });
      setBatchResults(result.map(formatOhlcvTick));
    } catch (err) {
      console.error("Failed to fetch batch:", err);
    } finally {
      setBatchLoading(false);
    }
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
          onClick={reset}
          className="px-2 py-1 text-sm rounded hover:bg-background border-white border-2"
        >
          Reset stream
        </button>
        
        <button
          type="button"
          onClick={handleFetchBatch}
          className="px-2 py-1 text-sm rounded hover:bg-background border-white border-2"
          disabled={batchLoading}
        >
          {batchLoading ? "Loading..." : "Fetch Batch"}
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
              {ticks.slice(0, 10).map((tick, index: number) => (
                <tr key={tick.Date} className={index === 0 ? "bg-blue-50" : "hover:bg-gray-50"}>
                  <td className="px-2 py-1">{formatTickDate(tick)}</td>
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
      
      {/* Batch fetch results */}
      {batchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Batch Fetch Results:</h3>
          <div className="overflow-auto max-h-40 border border-gray-300 rounded p-2 text-xs">
            {batchResults.map((result, idx) => (
              <div key={idx} className="py-1 border-b last:border-b-0 border-gray-100">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyTab;