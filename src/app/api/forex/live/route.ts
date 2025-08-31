import { NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';

// Cache for parsed CSV data and real-time simulated data
interface CacheEntry {
  rawData: string;
  formattedData: ForexData;
  timestamp: number;
  lastUpdateTime: number;
  currentIndex: number;
}

interface ForexData {
  headers: string[];
  data: Record<string, string>[];
}

const dataCache: Record<string, CacheEntry> = {};

// Cache expiration time (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Interval mapping in milliseconds
const INTERVAL_MAP: Record<string, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1hr': 60 * 60 * 1000
};

function getCsvPath(pair: string, interval: string): string {
  if (!pair || !interval) {
    throw new Error("Invalid currency pair or interval");
  }

  return path.join(process.cwd(), "public", "demo", `${pair}_${interval}.csv`);
}

async function readCsvFile(pair: string, interval: string): Promise<string> {
  const csvPath = getCsvPath(pair, interval);
  
  try {
    await fs.access(csvPath);
  } catch {
    throw new Error(`CSV file not found for ${pair}_${interval}`);
  }
  
  return await fs.readFile(csvPath, "utf-8");
}

function formatCsvData(csvData: string): ForexData {
  const lines = csvData.split("\n").filter(line => line.trim());
  const headers = lines[0].split(",").map(header => header.trim());
  
  const data = lines.slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => {
      const values = line.split(",").map(value => value.trim());
      return headers.reduce((acc, header, index) => {
        if (index < values.length) {
          acc[header] = values[index];
        }
        return acc;
      }, {} as Record<string, string>);
    });
  
  return { headers, data };
}

function getUpdatedDataPoint(pair: string, interval: string): CacheEntry {
  const cacheKey = `${pair}_${interval}`;
  const cacheEntry = dataCache[cacheKey];
  
  if (!cacheEntry) {
    throw new Error(`No cached data found for ${pair}_${interval}`);
  }
  
  const currentTime = Date.now();
  const intervalMs = INTERVAL_MAP[interval] || 60000; // Default to 1 minute
  
  // Check if it's time for an update based on the interval
  if (currentTime - cacheEntry.lastUpdateTime >= intervalMs) {
    // Move to the next data point or cycle back to the beginning
    cacheEntry.currentIndex = (cacheEntry.currentIndex + 1) % cacheEntry.formattedData.data.length;
    cacheEntry.lastUpdateTime = currentTime;
    
    // Add small random variations to simulate live data
    const currentDataPoint = { ...cacheEntry.formattedData.data[cacheEntry.currentIndex] };
    
    // Add slight variations to price fields (Open, High, Low, Close)
    if (currentDataPoint.Open) {
      const baseOpen = parseFloat(currentDataPoint.Open);
      const variation = (Math.random() - 0.5) * 0.0005; // Small random variation
      currentDataPoint.Open = (baseOpen + variation).toFixed(5);
    }
    
    if (currentDataPoint.Close) {
      const baseClose = parseFloat(currentDataPoint.Close);
      const variation = (Math.random() - 0.5) * 0.0005;
      currentDataPoint.Close = (baseClose + variation).toFixed(5);
    }
    
    // Update the volume with a random variation
    if (currentDataPoint.Volume) {
      const baseVolume = parseInt(currentDataPoint.Volume.replace(/\r/g, ''), 10);
      const volumeVariation = Math.floor(Math.random() * 10) - 5;
      currentDataPoint.Volume = Math.max(1, baseVolume + volumeVariation).toString();
    }
    
    // Update timestamp to current time
    if (currentDataPoint.Date) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      currentDataPoint.Date = `${now.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
    }
    
    // Update the current data point in the cache
    cacheEntry.formattedData.data[cacheEntry.currentIndex] = currentDataPoint;
  }
  
  return cacheEntry;
}

async function getForexData(pair: string, interval: string): Promise<ForexData> {
  const cacheKey = `${pair}_${interval}`;
  const currentTime = Date.now();
  
  // Initialize or refresh cache if needed
  if (!dataCache[cacheKey] || currentTime - dataCache[cacheKey].timestamp >= CACHE_TTL) {
    const rawData = await readCsvFile(pair, interval);
    const formattedData = formatCsvData(rawData);
    
    dataCache[cacheKey] = {
      rawData,
      formattedData,
      timestamp: currentTime,
      lastUpdateTime: currentTime,
      currentIndex: 0
    };
    
    return formattedData;
  }
  
  // Get updated data point based on the interval
  const updatedCache = getUpdatedDataPoint(pair, interval);
  
  // Create a subset of the data, with the latest point first
  const latestIndex = updatedCache.currentIndex;
  const recentData = [...updatedCache.formattedData.data];
  
  // Move the current data point to the front for easier access
  const currentPoint = recentData[latestIndex];
  recentData.splice(latestIndex, 1);
  recentData.unshift(currentPoint);
  
  // Limit to 30 data points for performance
  const limitedData = recentData.slice(0, 30);
  
  return {
    headers: updatedCache.formattedData.headers,
    data: limitedData
  };
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const pair = searchParams.get("pair");
  const interval = searchParams.get("interval");
  
  if (!pair || !interval) {
    return NextResponse.json(
      { error: "Currency pair and interval are required" }, 
      { status: 400 }
    );
  }
  
  if (!['1m', '5m', '15m', '1hr'].includes(interval)) {
    return NextResponse.json(
      { error: "Invalid interval. Supported intervals: 1m, 5m, 15m, 1hr" }, 
      { status: 400 }
    );
  }
  
  try {
    const data = await getForexData(pair, interval);
    
    return NextResponse.json({
      message: `Live data for ${pair} at interval ${interval}`,
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}