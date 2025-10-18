"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useOhlcv } from "@/context/OhlcvContext";
import { cn } from "@/lib/utils";

export function Header() {
  const { pair, timeframe, visibleData, ohlcvData, countdown } = useOhlcv();
  const lastPrice = visibleData[visibleData.length - 1]?.close;
  const previousPrice = visibleData[visibleData.length - 2]?.close;

  const isPriceUp = lastPrice > previousPrice;
  const isPriceDown = lastPrice < previousPrice;
    const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Forex Compass</span>
          </Link>
        </div>

        {pair && timeframe && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {pair} - {timeframe}m
              </span>
              {lastPrice && (
                <span
                  className={cn(
                    "font-mono font-bold",
                    isPriceUp && "text-green-500",
                    isPriceDown && "text-red-500"
                  )}
                >
                  {lastPrice.toFixed(5)}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Next update in: {formatCountdown()}
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              {visibleData.length} / {ohlcvData.length} points
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
