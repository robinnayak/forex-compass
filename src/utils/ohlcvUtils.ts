import axios from 'axios';
import { OhlcvResponse, OhlcvTick } from '../hooks/useOhlcvStream';

interface FetchOhlcvOptions {
  pair: string;
  interval: string;
  baseUrl?: string;
  cursor?: string;
  reset?: boolean;
  timeout?: number;
}

/**
 * Fetches a single OHLCV data point from the API
 */
export async function fetchOhlcvSingle({
  pair,
  interval,
  baseUrl = process.env.NEXT_PUBLIC_TECHNICAL_API_BASE ?? "http://localhost:8000",
  cursor,
  reset = false,
  timeout = 10_000
}: FetchOhlcvOptions): Promise<OhlcvResponse> {
  const params = new URLSearchParams({ pair, interval });
  
  if (cursor) params.set("cursor", cursor);
  if (reset) params.set("reset", "true");
  
  const url = `${baseUrl}/technical/simulate/live/single?${params.toString()}`;
  
  const response = await axios.get<OhlcvResponse>(url, {
    signal: AbortSignal.timeout(timeout),
  });
  
  return response.data;
}

/**
 * Fetches multiple OHLCV data points from the API
 * @param count Number of data points to fetch
 */
export async function fetchOhlcvBatch({
  pair,
  interval,
  baseUrl = process.env.NEXT_PUBLIC_TECHNICAL_API_BASE ?? "http://localhost:8000",
  cursor,
  reset = false,
  timeout = 10_000
}: FetchOhlcvOptions & { count?: number }): Promise<OhlcvTick[]> {
  // This is a simple implementation that just makes multiple calls to the single endpoint
  // In a real implementation, you might want to have a batch endpoint on the server
  
  const count = 10; // Default batch size
  const result: OhlcvTick[] = [];
  let currentCursor = cursor;
  const doReset = reset;
  
  for (let i = 0; i < count; i++) {
    try {
      const data = await fetchOhlcvSingle({
        pair,
        interval,
        baseUrl,
        cursor: currentCursor,
        reset: i === 0 && doReset, // Only apply reset on the first call
        timeout
      });
      
      result.push(data.data);
      currentCursor = data.cursor;
      
      // If there's no more data, break early
      if (!data.has_more) break;
    } catch {
      break; // Stop on error
    }
  }
  
  return result;
}

/**
 * Helper function to format OHLCV tick data for display
 */
export function formatOhlcvTick(tick: OhlcvTick): string {
  return `${tick.Date} O:${tick.Open.toFixed(5)} H:${tick.High.toFixed(5)} L:${tick.Low.toFixed(5)} C:${tick.Close.toFixed(5)} V:${tick.Volume}`;
}

/**
 * Helper function to format a date from OHLCV tick data
 */
export function formatTickDate(tick: OhlcvTick): string {
  return new Date(tick.Date).toLocaleTimeString();
}
