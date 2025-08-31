import { NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';

// Cache for parsed CSV data and position tracking
interface CacheEntry {
  rawData: string;
  formattedData: ForexData;
  timestamp: number;
  currentIndex: number; // Current position in the data array
  exhausted: boolean;   // Flag to indicate if all data has been served
}

interface ForexData {
  headers: string[];
  data: Record<string, string>[];
}

const dataCache: Record<string, CacheEntry> = {};

// Cache expiration time (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

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

function getCurrentDataPoint(pair: string, interval: string): { dataPoint: Record<string, string> | null; exhausted: boolean } {
  const cacheKey = `${pair}_${interval}`;

  console.log("==============================")
  console.log(`Fetching data point for ${cacheKey}`);
  console.log("cache data", dataCache)
  console.log(`Cache keys: ${Object.keys(dataCache).join(", ")}`);  
  console.log("==============================")
  
  if (!dataCache[cacheKey]) {
    throw new Error(`No cached data found for ${pair}_${interval}`);
  }
  
  const cacheEntry = dataCache[cacheKey];

  if (!cacheEntry.formattedData) {
    throw new Error(`No formatted data found for ${pair}_${interval}`);
  }

  // Check if we've exhausted all data
  if (cacheEntry.exhausted || cacheEntry.currentIndex >= cacheEntry.formattedData.data.length) {
    cacheEntry.exhausted = true;
    return { dataPoint: null, exhausted: true };
  }
  
  const currentPoint = { ...cacheEntry.formattedData.data[cacheEntry.currentIndex] };
  
  // Update timestamp to current time to simulate live data
  if (currentPoint.Date) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    currentPoint.Date = `${now.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
  }
  
  // Add slight variations to price fields (Open, High, Low, Close)
  if (currentPoint.Open && currentPoint.Close && currentPoint.High && currentPoint.Low) {
    const baseOpen = parseFloat(currentPoint.Open);
    const baseClose = parseFloat(currentPoint.Close);
    
    // Random variations
    const openVariation = (Math.random() - 0.5) * 0.0005;
    const closeVariation = (Math.random() - 0.5) * 0.0005;
    
    const newOpen = baseOpen + openVariation;
    const newClose = baseClose + closeVariation;
    
    // Set new values
    currentPoint.Open = newOpen.toFixed(5);
    currentPoint.Close = newClose.toFixed(5);
    
    // Ensure High and Low are consistent
    const newHigh = Math.max(newOpen, newClose) + Math.random() * 0.0003;
    const newLow = Math.min(newOpen, newClose) - Math.random() * 0.0003;
    
    currentPoint.High = newHigh.toFixed(5);
    currentPoint.Low = newLow.toFixed(5);
    
    // Update volume with a random variation
    if (currentPoint.Volume) {
      const baseVolume = parseInt(currentPoint.Volume.replace(/\r/g, ''), 10);
      const volumeVariation = Math.floor(Math.random() * 10) - 5;
      currentPoint.Volume = Math.max(1, baseVolume + volumeVariation).toString();
    }
  }
  
  // Move to the next data point for the next request
  cacheEntry.currentIndex += 1;
  
  // Check if we've reached the end after this data point
  if (cacheEntry.currentIndex >= cacheEntry.formattedData.data.length) {
    cacheEntry.exhausted = true;
  }
  
  return { dataPoint: currentPoint, exhausted: false };
}

async function initializeForexData(pair: string, interval: string): Promise<void> {
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
      currentIndex: 0,
      exhausted: formattedData.data.length === 0 // Mark as exhausted if no data
    };
  }
}

// For dev/testing - Reset the data cache and start from beginning again
export async function resetDataCache(pair: string, interval: string): Promise<void> {
  const cacheKey = `${pair}_${interval}`;
  if (dataCache[cacheKey]) {
    dataCache[cacheKey].currentIndex = 0;
    dataCache[cacheKey].exhausted = false;
  }
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const pair = searchParams.get("pair") || "EURUSD";
  const interval = searchParams.get("interval") || "1m";
  const reset = searchParams.get("reset") === "true"; // Optional param to reset the counter
  
  if (!['1m', '5m', '15m', '1hr'].includes(interval)) {
    return NextResponse.json(
      { error: "Invalid interval. Supported intervals: 1m, 5m, 15m, 1hr" }, 
      { status: 400 }
    );
  }
  
  try {
    // Initialize the data cache if needed
    await initializeForexData(pair, interval);
    
    // Reset the data stream if requested
    if (reset) {
      await resetDataCache(pair, interval);
    }
    
    // Get the current data point
    const { dataPoint, exhausted } = getCurrentDataPoint(pair, interval);
    
    // If we're out of data, return a specific message
    if (exhausted) {
      return NextResponse.json({
        message: `All data for ${pair} at interval ${interval} has been consumed`,
        timestamp: new Date().toISOString(),
        exhausted: true
      }, { status: 204 }); // 204 No Content is appropriate here
    }
    
    return NextResponse.json({
      message: `Live data for ${pair} at interval ${interval}`,
      timestamp: new Date().toISOString(),
      data: dataPoint,
      exhausted: false
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