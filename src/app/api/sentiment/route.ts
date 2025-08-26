import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'eurusd';

    // Forward the request to your Django backend with extended timeout for LLM processing
    const res = await fetch(
      `http://127.0.0.1:8000/sentiment/analyze/${symbol.toLowerCase()}/?include_reddit=true&include_news=true&analyze_sentiment=true&max_items=20`,
      {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        // Increased timeout to 5 minutes for LLM processing
        signal: AbortSignal.timeout(300000)
      }
    );

    if (!res.ok) {
      throw new Error(`Django API responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching sentiment data:', error);
    
    // Better error handling for different error types
    if (error instanceof Error) {
      // Check for connection refused (server down)
      if (error.message.includes('ECONNREFUSED') || error.cause?.toString().includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            error: 'SERVER_DOWN',
            message: 'Django sentiment analysis server is not running',
            details: 'Please start the Django backend server on localhost:8000'
          },
          { status: 503 }
        );
      }
      
      // Check for timeout
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'TIMEOUT',
            message: 'Local LLM processing timeout',
            details: 'The sentiment analysis is taking longer than expected due to local LLM processing. This is normal for local models. You can try again or consider optimizing your LLM setup.'
          },
          { status: 408 }
        );
      }
      
      // Check for fetch errors (network issues)
      if (error.message.includes('fetch failed')) {
        return NextResponse.json(
          { 
            error: 'NETWORK_ERROR',
            message: 'Network connection failed',
            details: 'Unable to connect to the sentiment analysis server'
          },
          { status: 503 }
        );
      }
    }
    
    // Generic error fallback
    return NextResponse.json(
      { 
        error: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch sentiment data',
        details: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}