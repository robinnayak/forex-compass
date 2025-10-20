"use client";

import { Compass, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useOhlcv } from "@/context/OhlcvContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function Header() {
  const { pairsData, timeframe, refreshAllPairs, isLoading } = useOhlcv();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllPairs();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous || !current) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getStatusColor = (countdown: number) => {
    if (countdown <= 30) return "text-red-500";
    if (countdown <= 60) return "text-amber-500";
    return "text-green-500";
  };

  // Debug: Log pairs data to console
  useEffect(() => {
    console.log("Header - Pairs Data:", pairsData);
    Object.entries(pairsData).forEach(([pair, data]) => {
      console.log(`Header - ${pair}:`, {
        currentIndex: data.currentIndex,
        dataLength: data.data.length,
        currentData: data.data[data.currentIndex],
        prevData: data.data[data.currentIndex - 1],
        hasData: !!data.data[data.currentIndex]?.close
      });
    });
  }, [pairsData]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Compass className="h-7 w-7 text-primary transition-transform group-hover:rotate-45" />
              <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </div>
            <span className="font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Forex Compass
            </span>
          </Link>
          
          {/* Timeframe Badge */}
          <div className="hidden sm:flex">
            <div className="px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">
                {timeframe}M
              </span>
            </div>
          </div>
        </div>

        {/* Currency Pairs */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-6 overflow-x-auto px-4 hide-scrollbar">
            {Object.values(pairsData).map(
              ({ pair, data, currentIndex, countdown, isLoading: pairLoading, error }) => {
                const currentData = data[currentIndex];
                const prevData = data[currentIndex - 1];
                const lastPrice = currentData?.close;
                const prevPrice = prevData?.close;
                
                // Better data checking
                const hasCurrentData = currentData && typeof lastPrice === 'number';
                const hasPrevData = prevData && typeof prevPrice === 'number';
                // const hasValidData = hasCurrentData && hasPrevData;
                
                const change = calculateChange(lastPrice, prevPrice);
                const isPriceUp = change > 0;
                const isPriceDown = change < 0;

                console.log(`Rendering ${pair}:`, {
                  currentIndex,
                  dataLength: data.length,
                  hasCurrentData,
                  hasPrevData,
                  lastPrice,
                  prevPrice,
                  pairLoading
                });

                return (
                  <div
                    key={pair}
                    className="flex items-center space-x-3 min-w-fit group relative"
                  >
                    {/* Pair Name */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-foreground">
                        {pair}
                      </span>
                      
                      {/* Error Indicator */}
                      {error && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>

                    {/* Price and Change */}
                    {hasCurrentData ? (
                      <div className="flex items-center space-x-2">
                        <span
                          className={cn(
                            "font-mono font-bold text-sm",
                            isPriceUp && "text-green-600 dark:text-green-400",
                            isPriceDown && "text-red-600 dark:text-red-400",
                            !isPriceUp && !isPriceDown && "text-foreground"
                          )}
                        >
                          {lastPrice.toFixed(5)}
                        </span>
                        
                        {/* Change Percentage - only show if we have previous data */}
                        {hasPrevData && (
                          <span
                            className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded",
                              isPriceUp && "bg-green-500/10 text-green-600 dark:text-green-400",
                              isPriceDown && "bg-red-500/10 text-red-600 dark:text-red-400",
                              !isPriceUp && !isPriceDown && "bg-muted text-muted-foreground"
                            )}
                          >
                            {isPriceUp && "+"}{change.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {pairLoading ? "Loading..." : "No data"}
                        </span>
                      </div>
                    )}

                    {/* Countdown Timer */}
                    <div className="flex items-center space-x-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        getStatusColor(countdown)
                      )} />
                      <span className={cn(
                        "font-mono text-xs font-medium",
                        getStatusColor(countdown)
                      )}>
                        {formatCountdown(countdown)}
                      </span>
                    </div>

                    {/* Hover Card Effect */}
                    <div className="absolute inset-0 -m-2 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className={cn(
              "p-2 rounded-lg border border-border hover:bg-muted transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              (isLoading || isRefreshing) && "animate-spin"
            )}
            title="Refresh all pairs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isLoading || isRefreshing ? "bg-amber-500" : "bg-green-500"
            )} />
            <span className="text-xs text-muted-foreground">
              {isLoading || isRefreshing ? "Updating..." : "Live"}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Hide */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </header>
  );
}