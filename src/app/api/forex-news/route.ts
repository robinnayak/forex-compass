// src/app/api/forex-news/route.ts
import { NextResponse } from 'next/server';

let cache = {
  data: null as unknown,
  timestamp: 0
}

const CACHE_DURATION_MS = 60 * 60 * 1000 * 24; // 24 HOURS

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  console.log("Fetching news for symbol:", symbol);

  if (cache.data && (Date.now() - cache.timestamp < CACHE_DURATION_MS)) {
    console.log("Returning cached data");
    return NextResponse.json(cache.data);
  }

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }


  const apiKey = process.env.ALPHA_API_KEY_NEWS;
  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=FOREX:${symbol}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch from Alpha Vantage');
    }

    const data = await res.json();

    cache = {
      data,
      timestamp: Date.now()
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news', details: (error as Error).message },
      { status: 500 }
    );
  }
}
