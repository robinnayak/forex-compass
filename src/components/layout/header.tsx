"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useOhlcv } from "@/context/OhlcvContext";
import { cn } from "@/lib/utils";

export function Header() {
  const { pairsData, timeframe } = useOhlcv();

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Forex Compass</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-between items-center space-x-4 overflow-x-auto">
          {Object.values(pairsData).map(
            ({ pair, data, currentIndex, countdown }) => {
              const lastPrice = data[currentIndex]?.close;
              const prevPrice = data[currentIndex - 1]?.close;
              const isPriceUp = lastPrice > prevPrice;
              const isPriceDown = lastPrice < prevPrice;

              return (
                <div
                  key={pair}
                  className="flex items-center space-x-2 min-w-fit"
                >
                  <span className="text-sm text-muted-foreground">{pair}</span>
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
                  <span className="text-xs text-muted-foreground">
                    {formatCountdown(countdown)}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </header>
  );
}
