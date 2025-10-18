"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { DataPoint } from "@/types/technical";
import axios from "axios";

interface OhlcvContextType {
  ohlcvData: DataPoint[];
  visibleData: DataPoint[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  pair: string;
  timeframe: string;
  setPair: (pair: string) => void;
  setTimeframe: (timeframe: string) => void;
  countdown: number; // Add countdown
}

const OhlcvContext = createContext<OhlcvContextType | null>(null);

export function OhlcvProvider({ children }: { children: ReactNode }) {
  const isInitialized = useRef(false);
  
  const [ohlcvData, setOhlcvData] = useState<DataPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("1");
  const [countdown, setCountdown] = useState(0);

  const fetchOhlcvData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/forex-ohlcv/${pair}/${timeframe}`);
      setOhlcvData(response.data.data);
      // Reset currentIndex when new data is fetched
      setCurrentIndex(0);
    } catch (err) {
      setError("Failed to fetch OHLCV data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pair, timeframe]);

  useEffect(()=>{
    if (!isInitialized.current) {
      fetchOhlcvData();
      isInitialized.current = true;
    }
  }, []);

  // Setup data fetching and interval
  useEffect(() => {

    if(!isInitialized.current) return;

    // fetchOhlcvData();
    
    const intervalTime = parseInt(timeframe) * 60 * 1000;
    setCountdown(intervalTime / 1000); // Set initial countdown in seconds

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : intervalTime / 1000));
    }, 1000);

    // Data display timer
    const dataTimer = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= ohlcvData.length - 1) {
          fetchOhlcvData(); // Fetch new data when we reach the end
          return 0;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(dataTimer);
    };
  }, [timeframe, pair, fetchOhlcvData, ohlcvData.length]);

  // Ensure we only show data up to currentIndex
  const visibleData = ohlcvData.slice(0, currentIndex + 1);

  return (
    <OhlcvContext.Provider 
      value={{
        ohlcvData,
        visibleData,
        currentIndex,
        isLoading,
        error,
        pair,
        timeframe,
        setPair,
        setTimeframe,
        countdown
      }}
    >
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