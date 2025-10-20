"use client";

import { useOhlcv } from "@/context/OhlcvContext";
import { useState } from "react";

export default function ForexChart() {
  const { pairsData, isLoading, error, timeframe, refreshPair } = useOhlcv();
  const [selectedPair, setSelectedPair] = useState("EURUSD");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div>Loading OHLCV data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-destructive">
          <div className="text-lg font-semibold mb-2">Error Loading Data</div>
          <div className="mb-4">{error}</div>
          <button 
            onClick={() => refreshPair(selectedPair)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedPairData = pairsData[selectedPair];
  
  if (!selectedPairData || selectedPairData.data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-semibold mb-2">No Data Available</div>
          <div>No OHLCV data found for {selectedPair}</div>
        </div>
      </div>
    );
  }

  const currentData = selectedPairData.data[selectedPairData.currentIndex];
  const visibleData = selectedPairData.data.slice(0, selectedPairData.currentIndex + 1);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const calculateChange = (open: number, close: number) => {
    return ((close - open) / open) * 100;
  };

  return (
    <div className="p-6 space-y-6 bg-background mt-5 py-10 rounded-lg border border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedPair} Forex Chart
          </h1>
          <p className="text-muted-foreground mt-1">
            {timeframe} Minute Timeframe • Real-time OHLCV Data
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Object.keys(pairsData).map(pair => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
          
          <button 
            onClick={() => refreshPair(selectedPair)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            disabled={selectedPairData.isLoading}
          >
            {selectedPairData.isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Current Price</div>
          <div className="text-2xl font-bold">
            {currentData ? currentData.close.toFixed(5) : 'N/A'}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Change</div>
          <div className={`text-2xl font-bold ${
            currentData && currentData.close >= currentData.open 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {currentData ? calculateChange(currentData.open, currentData.close).toFixed(4) + '%' : 'N/A'}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">High</div>
          <div className="text-xl font-semibold">
            {currentData ? currentData.high.toFixed(5) : 'N/A'}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Low</div>
          <div className="text-xl font-semibold">
            {currentData ? currentData.low.toFixed(5) : 'N/A'}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Volume</div>
          <div className="text-xl font-semibold">
            {currentData ? currentData.volume.toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Data Points: {selectedPairData.currentIndex + 1} of {selectedPairData.data.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            Next update in: {Math.floor(selectedPairData.countdown / 60)}:
            {(selectedPairData.countdown % 60).toString().padStart(2, '0')}
          </span>
        </div>
        
        {currentData && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Last Update: {formatTime(currentData.timestamp)}</span>
          </div>
        )}
      </div>

      {/* Data Display */}
      <div className="border border-border rounded-lg bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold">OHLCV Data Stream</h3>
          <p className="text-sm text-muted-foreground">
            Showing {visibleData.length} data points • Window: {selectedPairData.data[0]?.timestamp ? formatDate(selectedPairData.data[0].timestamp) : ''} to {currentData?.timestamp ? formatDate(currentData.timestamp) : ''}
          </p>
        </div>
        
        <div className="p-4">
          {visibleData.length > 0 ? (
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-b border-border">
                  <tr>
                    <th className="text-left p-3 font-semibold">Time</th>
                    <th className="text-left p-3 font-semibold">Open</th>
                    <th className="text-left p-3 font-semibold">High</th>
                    <th className="text-left p-3 font-semibold">Low</th>
                    <th className="text-left p-3 font-semibold">Close</th>
                    <th className="text-left p-3 font-semibold">Volume</th>
                    <th className="text-left p-3 font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleData.map((data, index) => {
                    const change = calculateChange(data.open, data.close);
                    const isCurrent = index === selectedPairData.currentIndex;
                    
                    return (
                      <tr 
                        key={index} 
                        className={`border-b border-border hover:bg-muted/50 ${
                          isCurrent ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="p-3 font-mono">
                          {formatTime(data.timestamp)}
                          {isCurrent && <span className="ml-2 text-xs bg-blue-500 text-white px-1 rounded">LIVE</span>}
                        </td>
                        <td className="p-3 font-mono">{data.open.toFixed(5)}</td>
                        <td className="p-3 font-mono text-green-600">{data.high.toFixed(5)}</td>
                        <td className="p-3 font-mono text-red-600">{data.low.toFixed(5)}</td>
                        <td className="p-3 font-mono font-semibold">{data.close.toFixed(5)}</td>
                        <td className="p-3 font-mono">{data.volume.toLocaleString()}</td>
                        <td className={`p-3 font-mono font-semibold ${
                          change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.toFixed(4)}%
                        </td>
                      </tr>
                    );
                  }).reverse()} {/* Reverse to show latest first */}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-lg mb-2">No data points to display</div>
              <div className="text-sm">Data will appear as it becomes available</div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display for Individual Pair */}
      {selectedPairData.error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive">
            <span>⚠️</span>
            <span className="font-semibold">Error loading {selectedPair}:</span>
          </div>
          <div className="mt-1 text-sm">{selectedPairData.error}</div>
          <button 
            onClick={() => refreshPair(selectedPair)}
            className="mt-2 px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}