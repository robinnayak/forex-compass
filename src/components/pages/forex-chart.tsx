"use client";

import { useOhlcv } from "@/context/OhlcvContext";

export default function ForexChart() {
  const { visibleData, isLoading, error, pair, timeframe } = useOhlcv();

  if (isLoading) return <div>Loading OHLCV data...</div>;
  if (error) return <div>{error}</div>;
  if (!visibleData.length) return <div>No OHLCV data available.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {pair} - {timeframe} Minute Chart
      </h1>
      <pre>{JSON.stringify(visibleData, null, 2)}</pre>
    </div>
  );
}