import React, { useEffect, useState, useRef } from 'react';
import { DataPoint } from '@/hooks/useOhlcvData';

interface LivePriceProps {
  dataPoint: DataPoint | null;
  pair?: string;
  isLoading?: boolean;
  onPriceChange?: (direction: 'up' | 'down' | 'neutral') => void;
}

const LivePrice = ({ 
  dataPoint, 
  pair = "EUR/USD", 
  isLoading = false,
  onPriceChange
}: LivePriceProps) => {
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [lastPrice, setLastPrice] = useState<string | null>(null);
  const previousDataPointRef = useRef<DataPoint | null>(null);
  
  // Update price direction when the price changes
  useEffect(() => {
    if (!dataPoint?.Close) return;
    
    // Check if this is a new data point (date or value changed)
    const isNewDataPoint = previousDataPointRef.current?.Date !== dataPoint.Date ||
                          previousDataPointRef.current?.Close !== dataPoint.Close;
    
    if (lastPrice !== null && isNewDataPoint) {
      const currentPrice = parseFloat(dataPoint.Close);
      const prevPrice = parseFloat(lastPrice);
      
      let direction: 'up' | 'down' | 'neutral' = 'neutral';
      
      if (currentPrice > prevPrice) {
        direction = 'up';
      } else if (currentPrice < prevPrice) {
        direction = 'down';
      }
      
      setPriceDirection(direction);
      
      // Notify parent component if callback provided
      if (onPriceChange) {
        onPriceChange(direction);
      }
    }
    
    // Update last price and ref
    setLastPrice(dataPoint.Close);
    previousDataPointRef.current = dataPoint;
    
    // Reset direction after a short delay for visual effect
    const timer = setTimeout(() => {
      setPriceDirection('neutral');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [dataPoint, lastPrice, onPriceChange]);
  
  if (!dataPoint) {
    return (
      <div className="p-4 border rounded-md bg-background shadow-sm">
        <h3 className="font-medium text-sm text-muted-foreground mb-1">{pair}</h3>
        <div className="h-8 flex items-center">
          <span className="text-lg font-mono">---.-----</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-md bg-background shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium text-sm text-muted-foreground">{pair}</h3>
        <span className="text-xs text-muted-foreground">{dataPoint.Date}</span>
      </div>
      
      <div className="flex items-end space-x-3">
        {/* Main price display */}
        <div className={`text-2xl font-mono font-semibold transition-colors duration-300 ${
          priceDirection === 'up' ? 'text-green-500' : 
          priceDirection === 'down' ? 'text-red-500' : 
          'text-foreground'
        }`}>
          {dataPoint.Close || "-.-----"}
          
          {/* Direction indicators */}
          {priceDirection === 'up' && <span className="ml-1 text-green-500">↑</span>}
          {priceDirection === 'down' && <span className="ml-1 text-red-500">↓</span>}
        </div>
        
        {/* OHLC smaller display */}
        <div className="flex flex-col text-xs text-muted-foreground">
          <div className="grid grid-cols-2 gap-x-2">
            <span>O: {dataPoint.Open}</span>
            <span>H: {dataPoint.High}</span>
            <span>L: {dataPoint.Low}</span>
            <span>V: {dataPoint.Volume}</span>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-2 flex items-center">
          <div className="h-1 w-1 bg-blue-500 rounded-full animate-ping mr-1"></div>
          <span className="text-xs text-muted-foreground">Updating...</span>
        </div>
      )}
    </div>
  );
};

export default LivePrice;