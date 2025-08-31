"use client"

import React, { useState } from 'react'
import ErrorsPage from '../errors/ErrorsPage'
import LivePrice from '../live/liveprice'
import { useOhlcvData } from '@/hooks/useOhlcvData'

const LiveData = () => {
  // State for selected parameters
  const [selectedPair, setSelectedPair] = useState<string>('EURUSD');
  const [selectedInterval, setSelectedInterval] = useState<'1m' | '5m' | '15m' | '1hr'>('1m');
  const [priceChangeCount, setPriceChangeCount] = useState<{up: number; down: number}>({ up: 0, down: 0 });
  
  // Use the hook with selected parameters
  const { 
    data: ohlcvData, 
    currentDataPoint, 
    loading, 
    error, 
    refresh,
    lastUpdated
  } = useOhlcvData({
    pair: selectedPair,
    interval: selectedInterval
  });

  if (loading && !ohlcvData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorsPage
        status={error.status}
        message={error.message}
        code={error.code}
        details={error.details}
        onRetry={refresh}
      />
    );
  }

  // Handle price direction changes
  const handlePriceChange = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') {
      setPriceChangeCount(prev => ({ ...prev, up: prev.up + 1 }));
    } else if (direction === 'down') {
      setPriceChangeCount(prev => ({ ...prev, down: prev.down + 1 }));
    }
  };
  
  // Format the pair name for display
  const formatPairName = (pair: string): string => {
    if (pair === 'EURUSD') return 'EUR/USD';
    if (pair === 'GBPUSD') return 'GBP/USD';
    if (pair === 'USDJPY') return 'USD/JPY';
    if (pair === 'AUDUSD') return 'AUD/USD';
    if (pair === 'USDCAD') return 'USD/CAD';
    return pair;
  };
  
  // Available pairs for selection
  const availablePairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const availableIntervals = ['1m', '5m', '15m', '1hr'];

  return (
    <div className="space-y-6">
      {/* Parameter selection */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency Pair</label>
          <select 
            className="border rounded-md px-3 py-1 bg-background"
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
          >
            {availablePairs.map(pair => (
              <option key={pair} value={pair}>{formatPairName(pair)}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
          <select 
            className="border rounded-md px-3 py-1 bg-background"
            value={selectedInterval}
            onChange={(e) => setSelectedInterval(e.target.value as '1m' | '5m' | '15m' | '1hr')}
          >
            {availableIntervals.map(int => (
              <option key={int} value={int}>{int}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="text-right">
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Movements</label>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              ↑ {priceChangeCount.up}
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
              ↓ {priceChangeCount.down}
            </span>
          </div>
        </div>
      </div>
      
      {/* Live price widget */}
      <div className="mb-6">
        <LivePrice 
          dataPoint={currentDataPoint} 
          pair={formatPairName(selectedPair)}
          isLoading={loading}
          onPriceChange={handlePriceChange}
        />
        
        {lastUpdated && (
          <div className="mt-1 text-xs text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-semibold">Live Forex Data: {formatPairName(selectedPair)} ({selectedInterval})</h2>
      
      {/* Show loading indicator for refreshes */}
      {loading && (
        <div className="text-xs text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          Updating...
        </div>
      )}
      
      {ohlcvData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {ohlcvData.map((point, index) => (
                <tr 
                  key={`${point.Date}-${index}`} 
                  className={index === 0 ? "bg-blue-50/20" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{point.Date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{point.Open}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{point.High}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{point.Low}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{point.Close}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{point.Volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}
      
      {/* Debug section (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 p-4 border border-gray-200 rounded">
          <summary className="cursor-pointer font-medium">Debug Information</summary>
          <div className="mt-2 p-4 bg-background rounded overflow-x-auto text-xs">
            <p><strong>Current Data Point:</strong></p>
            <pre>{JSON.stringify(currentDataPoint, null, 2)}</pre>
            <p className="mt-2"><strong>API Data:</strong></p>
            <pre>{JSON.stringify(ohlcvData?.slice(0, 3), null, 2)}</pre>
          </div>
        </details>
      )}
    </div>
  )
}

export default LiveData