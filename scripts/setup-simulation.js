import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create necessary directories
// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createDirectoryIfNotExists(dirPath) {
  const fullPath = path.join(path.resolve(__dirname, '..'), dirPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
    return true;
  }
  return false;
}

// Create a sample CSV file with forex data
function createSampleForexData(filePath, pair) {
  const fullPath = path.join(path.resolve(__dirname, '..'), filePath);
  
  // Check if file already exists
  if (fs.existsSync(fullPath)) {
    console.log(`File already exists: ${filePath}`);
    return false;
  }
  
  console.log(`Creating sample forex data for ${pair} at: ${filePath}`);
  
  // Create CSV header
  let csvContent = 'Date,Open,High,Low,Close,Volume\n';
  
  // Generate sample data for past 100 days
  const now = new Date();
  const basePrice = pair === 'EURUSD' ? 1.1000 : 
                    pair === 'GBPUSD' ? 1.2500 : 
                    pair === 'USDJPY' ? 110.00 : 
                    pair === 'AUDUSD' ? 0.7000 : 
                    pair === 'USDCAD' ? 1.3000 : 1.0000;
  
  // Generate 10,000 data points at 1-minute intervals
  for (let i = 10000; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 60000)); // 1-minute intervals
    
    // Generate random price movements (with some trend)
    const randomFactor = Math.random() * 0.002 - 0.001; // Random movement between -0.1% and +0.1%
    const trendFactor = Math.sin(i / 500) * 0.005; // Add a sine wave trend
    
    const open = basePrice + randomFactor + trendFactor;
    const high = open + Math.random() * 0.0020;
    const low = open - Math.random() * 0.0020;
    const close = (open + high + low) / 3 + (Math.random() * 0.0010 - 0.0005);
    const volume = Math.floor(Math.random() * 1000) + 500;
    
    // Format with 5 decimal places for most pairs
    const formatNum = pair.includes('JPY') ? 
      (n) => n.toFixed(3) : // 3 decimals for JPY pairs 
      (n) => n.toFixed(5);  // 5 decimals for other pairs
    
    // Add row to CSV
    csvContent += `${date.toISOString()},${formatNum(open)},${formatNum(high)},${formatNum(low)},${formatNum(close)},${volume}\n`;
  }
  
  // Write to file
  fs.writeFileSync(fullPath, csvContent);
  return true;
}

// Main setup function
function setupSimulation() {
  console.log('Setting up forex simulation environment...');
  
  // Create directories
  createDirectoryIfNotExists('public/data');
  
  // Create sample data for all supported pairs
  const supportedPairs = [
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'AUDUSD',
    'USDCAD'
  ];
  
  for (const pair of supportedPairs) {
    const filePath = `public/data/${pair}.csv`;
    createSampleForexData(filePath, pair);
  }
  
  console.log('Setup complete! The simulation is ready to run.');
}

// Run setup
setupSimulation();
