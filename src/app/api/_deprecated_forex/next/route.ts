import { NextResponse } from 'next/server';
import simulationManager, { IntervalType } from '@/lib/simulator/SimulationManager';
import '@/lib/simulator/initSimulation'; // This ensures initialization happens on server start
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  console.log("Forex next data API route hit");
  const { searchParams } = new URL(request.url);
  const pair = searchParams.get('pair')?.toUpperCase();
  const interval = (searchParams.get('interval') || '1m') as IntervalType;

  // Check if data directory exists
  const dataPath = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dataPath)) {
    console.error("Data directory not found:", dataPath);
    return NextResponse.json({
      success: false,
      message: 'Simulation data directory not found. Please run `npm run setup-simulation` to create sample data.',
      path: dataPath,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  // If no pair is provided, return error
  if (!pair) {
    return NextResponse.json({
      success: false,
      message: "Please provide a 'pair' query parameter, e.g. ?pair=EURUSD&interval=1m",
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
  
  // Check if pair is supported
  const supportedPairs = simulationManager.getSupportedPairs();
  if (!supportedPairs.includes(pair)) {
    return NextResponse.json({
      success: false,
      message: `Unsupported pair: ${pair}. Supported pairs: ${supportedPairs.join(', ')}`,
    }, { status: 400 });
  }
  
  // Check if data file exists for this pair
  const pairFilePath = path.join(dataPath, `${pair}.csv`);
  if (!fs.existsSync(pairFilePath)) {
    console.error(`Data file not found for pair ${pair}:`, pairFilePath);
    return NextResponse.json({
      success: false,
      message: `No data file found for pair ${pair}. Please run 'npm run setup-simulation' to create sample data.`,
      pair,
      path: pairFilePath,
      timestamp: new Date().toISOString()
    }, { status: 404 });
  }
  
  try {
    console.log(`Advancing data for ${pair} (${interval})`);
    
    // Advance to the next data point
    simulationManager.advanceToNextDataPoint(pair, interval);
    
    // Get the new current data point
    const currentData = simulationManager.getCurrentData(pair, interval);
    
    if (!currentData) {
      console.warn(`No data available for pair ${pair} after advancing`);
      return NextResponse.json({
        success: false,
        message: `No data available for pair ${pair} after advancing`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    console.log(`Returning advanced data for ${pair}:`, currentData);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: currentData,
    });
  } catch (error) {
    console.error("Error advancing forex data:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to advance forex data',
      error: (error as Error).message,
    }, { status: 500 });
  }
}
