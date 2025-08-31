import { createServer } from 'http';
import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import simulationManager, { IntervalType } from '@/lib/simulator/SimulationManager';

// Initialize simulation on server startup
simulationManager.initialize();

// This is a socket.io implementation for Next.js API routes
export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  // Return early if already initialized
  if ((res as any).socket.server.io) {
    res.end();
    return;
  }

  // Create HTTP server
  const httpServer = createServer();
  const io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Store the socket.io instance on the response object
  (res as any).socket.server.io = io;

  // Set up socket.io connections
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle subscription to forex data
    socket.on('subscribe', ({ pair, interval }: { pair: string, interval?: IntervalType }) => {
      const validInterval = interval || '1m';
      
      try {
        console.log(`Client ${socket.id} subscribed to ${pair} (${validInterval})`);
        
        // Get simulator for this pair
        const simulator = simulationManager.getOrCreateSimulator(pair, validInterval);
        
        // Create unique subscription ID for this socket/pair/interval
        const subId = `${socket.id}_${pair}_${validInterval}`;
        
        // Set up subscription to data updates
        const unsubscribe = simulator.subscribe((dataPoint) => {
          socket.emit('data', { 
            pair, 
            interval: validInterval, 
            dataPoint,
            timestamp: new Date().toISOString()
          });
        });
        
        // Store unsubscribe function for cleanup
        socket.data.subscriptions = socket.data.subscriptions || {};
        socket.data.subscriptions[subId] = unsubscribe;
        
        // Send initial data immediately
        socket.emit('data', { 
          pair, 
          interval: validInterval, 
          dataPoint: simulator.getCurrentDataPoint(),
          timestamp: new Date().toISOString()
        });
        
        // Send status information
        socket.emit('status', {
          pair,
          interval: validInterval,
          status: simulator.getStatus()
        });
      } catch (error) {
        console.error(`Error setting up subscription for ${pair}:`, error);
        socket.emit('error', { 
          message: `Failed to subscribe to ${pair}: ${(error as Error).message}`
        });
      }
    });
    
    // Handle unsubscribe
    socket.on('unsubscribe', ({ pair, interval }: { pair: string, interval?: IntervalType }) => {
      const validInterval = interval || '1m';
      const subId = `${socket.id}_${pair}_${validInterval}`;
      
      if (socket.data.subscriptions?.[subId]) {
        socket.data.subscriptions[subId]();
        delete socket.data.subscriptions[subId];
        console.log(`Client ${socket.id} unsubscribed from ${pair} (${validInterval})`);
      }
    });
    
    // Clean up on disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up all subscriptions
      if (socket.data.subscriptions) {
        Object.values(socket.data.subscriptions).forEach((unsubscribe: any) => {
          unsubscribe();
        });
      }
    });
  });

  // Start the HTTP server on a free port
  httpServer.listen(0, () => {
    console.log(`Socket.IO server started on random port`);
  });

  // Send an empty response to complete the API route
  res.end();
}
