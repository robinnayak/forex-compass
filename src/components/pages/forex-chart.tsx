"use client";

import { useOhlcv } from "@/context/OhlcvContext";
import { useState } from "react";

export default function ForexChart() {
  const { pairsData, isLoading, error, timeframe } = useOhlcv();
  const [selectedPair, setSelectedPair] = useState("EURUSD");

  if (isLoading) return <div>Loading OHLCV data...</div>;
  if (error) return <div>{error}</div>;

  const selectedPairData = pairsData[selectedPair];
  if (!selectedPairData) return <div>No data available for {selectedPair}</div>;

  const visibleData = selectedPairData.data.slice(0, selectedPairData.currentIndex + 1);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {selectedPair} - {timeframe} Minute Chart
        </h1>
        <select 
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          className="px-4 py-2 rounded-md border border-border bg-background"
        >
          {Object.keys(pairsData).map(pair => (
            <option key={pair} value={pair}>
              {pair}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center space-x-4 text-sm text-muted-foreground">
        <div>
          Points: {selectedPairData.currentIndex + 1} / {selectedPairData.data.length}
        </div>
        <div>
          Next update in: {Math.floor(selectedPairData.countdown / 60)}:
          {(selectedPairData.countdown % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 bg-card">
        {visibleData.length > 0 ? (
          <pre className="overflow-auto max-h-[600px]">
            {JSON.stringify(visibleData, null, 2)}
          </pre>
        ) : (
          <div className="text-center text-muted-foreground">
            No data points to display
          </div>
        )}
      </div>
    </div>
  );
}