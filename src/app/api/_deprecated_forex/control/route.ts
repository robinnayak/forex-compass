import { NextResponse } from 'next/server';
import simulationManager, { IntervalType } from '@/lib/simulator/SimulationManager';
import fs from 'fs';
import path from 'path';

// Ensure simulator is initialized
simulationManager.initialize();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action')?.toLowerCase();
  const pair = searchParams.get('pair')?.toUpperCase();
  const interval = searchParams.get('interval') as IntervalType;

  if (!action) {
    return NextResponse.json({
      success: false,
      message: "Please provide an 'action' query parameter (status, pairs, intervals, start, pause)",
    }, { status: 400 });
  }

  // Check if data directory exists
  const dataPath = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dataPath)) {
    return NextResponse.json({
      success: false,
      message: 'Simulation data directory not found. Please run `npm run setup-simulation` to create sample data.',
      path: dataPath,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  try {
    // Handle different actions
    switch (action) {
      case 'status':
        if (!pair) {
          return NextResponse.json({
            success: false,
            message: "Please provide a 'pair' query parameter",
          }, { status: 400 });
        }
        
        // Get status for the specified pair
        try {
          const simulator = simulationManager.getOrCreateSimulator(pair, interval || '1m');
          return NextResponse.json({
            success: true,
            status: simulator.getStatus(),
            pair,
            interval: interval || '1m'
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Error getting status for ${pair}: ${(error as Error).message}`,
          }, { status: 404 });
        }

      case 'start':
        if (!pair) {
          return NextResponse.json({
            success: false,
            message: "Please provide a 'pair' query parameter",
          }, { status: 400 });
        }
        
        // Start the simulator for the specified pair
        try {
          const simulator = simulationManager.getOrCreateSimulator(pair, interval || '1m');
          simulator.start();
          
          return NextResponse.json({
            success: true,
            message: `Started simulation for ${pair}`,
            status: simulator.getStatus()
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Error starting simulation for ${pair}: ${(error as Error).message}`,
          }, { status: 500 });
        }
        
      case 'pause':
        if (!pair) {
          return NextResponse.json({
            success: false,
            message: "Please provide a 'pair' query parameter",
          }, { status: 400 });
        }
        
        // Pause the simulator for the specified pair
        try {
          const simulator = simulationManager.getOrCreateSimulator(pair, interval || '1m');
          simulator.pause();
          
          return NextResponse.json({
            success: true,
            message: `Paused simulation for ${pair}`,
            status: simulator.getStatus()
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Error pausing simulation for ${pair}: ${(error as Error).message}`,
          }, { status: 500 });
        }

      case 'pairs':
        // Return list of supported pairs
        return NextResponse.json({
          success: true,
          pairs: simulationManager.getSupportedPairs(),
        });

      case 'intervals':
        // Return list of available intervals
        return NextResponse.json({
          success: true,
          intervals: simulationManager.getAvailableIntervals(),
        });

      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}. Available actions: status, start, pause, pairs, intervals`,
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process request',
      error: (error as Error).message,
    }, { status: 500 });
  }
}

// Export the API route handler
