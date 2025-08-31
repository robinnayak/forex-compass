"use client"
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupSimulationDocsPage() {
  const [setupRunning, setSetupRunning] = useState(false);
  const [setupOutput, setSetupOutput] = useState<string | null>(null);
  
  async function runSetupScript() {
    setSetupRunning(true);
    setSetupOutput('Running setup script...');
    
    try {
      // Call an API endpoint that will run the setup script server-side
      const response = await fetch('/api/setup-simulation', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSetupOutput(`Setup completed successfully!\n\n${data.output || ''}`);
      } else {
        setSetupOutput(`Error: ${data.error}\n\n${data.output || ''}`);
      }
    } catch (error) {
      setSetupOutput(`Failed to run setup: ${(error as Error).message}`);
    } finally {
      setSetupRunning(false);
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Forex Simulation Setup</CardTitle>
          <CardDescription className="text-gray-400">
            Learn how to set up the forex simulation data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="prose prose-invert max-w-none">
          <h2>Setting Up Simulation Data</h2>
          
          <p>
            The forex simulation requires CSV data files to work properly. Follow these steps
            to set up the required data files:
          </p>
          
          <h3>Option 1: Run the Setup Script</h3>
          
          <p>
            The easiest way to set up simulation data is to run the provided setup script.
            This will create sample data for all supported forex pairs.
          </p>
          
          <div className="bg-black/50 rounded-md p-4 my-4">
            <code className="text-gray-300">npm run setup-simulation</code>
          </div>
          
          <p>
            Alternatively, you can click the button below to run the setup directly from this page:
          </p>
          
          <button
            className={`px-4 py-2 rounded-md ${
              setupRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
            onClick={runSetupScript}
            disabled={setupRunning}
          >
            {setupRunning ? 'Setting up...' : 'Run Setup Script'}
          </button>
          
          {setupOutput && (
            <pre className="mt-4 p-4 bg-black/50 rounded-md overflow-auto text-sm text-green-400 max-h-60">
              {setupOutput}
            </pre>
          )}
          
          <h3>Option 2: Manual Setup</h3>
          
          <p>
            If you prefer to set up manually or want to use your own data:
          </p>
          
          <ol>
            <li>
              Create a <code>public/data</code> directory in your project root
            </li>
            <li>
              Create CSV files for each currency pair you want to simulate
              (e.g., <code>EURUSD.csv</code>, <code>GBPUSD.csv</code>, etc.)
            </li>
            <li>
              Ensure your CSV files have these column headers:
              <code>Date,Open,High,Low,Close,Volume</code>
            </li>
          </ol>
          
          <h3>CSV Format Example</h3>
          
          <pre className="bg-black/50 p-4 rounded-md overflow-auto text-xs text-gray-300">
{`Date,Open,High,Low,Close,Volume
2023-08-01T12:00:00.000Z,1.09534,1.09587,1.09501,1.09543,754
2023-08-01T12:01:00.000Z,1.09543,1.09567,1.09523,1.09537,632
2023-08-01T12:02:00.000Z,1.09537,1.09572,1.09519,1.09542,841
...`}
          </pre>
          
          <h3>Supported Pairs</h3>
          
          <p>
            The simulation currently supports the following currency pairs:
          </p>
          
          <ul>
            <li>EURUSD</li>
            <li>GBPUSD</li>
            <li>USDJPY</li>
            <li>AUDUSD</li>
            <li>USDCAD</li>
          </ul>
          
          <h3>After Setup</h3>
          
          <p>
            Once setup is complete:
          </p>
          
          <ol>
            <li>Restart your Next.js development server</li>
            <li>Return to the Live Data Simulation tab</li>
            <li>The simulation should now display live data</li>
          </ol>
          
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-md p-4 my-4">
            <h4 className="text-blue-300 mt-0">Need More Help?</h4>
            <p className="mb-0">
              If you&apos;re still having issues, check the console logs for more detailed error messages.
              Make sure the data files are properly formatted and accessible to the application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
