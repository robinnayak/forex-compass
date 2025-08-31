# Forex Compass – Code Guide for Beginners

This guide walks through the most important pieces of code in this project, shows key snippets, and explains what they do and why.

You’ll learn:
- How Next.js App Router API routes work
- How the simulated live/streaming OHLCV data is produced
- How custom React hooks, contexts, and components fit together
- How the AI flow (Genkit + Zod) is wired
- How error handling and types are structured

If you’re new to TypeScript/Next.js, read this like a cookbook: skim, copy, and tweak.


## 1) API routes (server-side) – App Router

API routes live in `src/app/api/**/route.ts` and export HTTP methods like `GET()`.

### Minimal endpoint
File: `src/app/api/forex/route.ts`
```ts
import { NextResponse } from "next/server";

export async function GET(request: Request){
  return NextResponse.json({ message: "Hello from the Forex API!" });
}
```
- Export a function named after the HTTP method.
- Return JSON using `NextResponse.json()`.

### Reading query params and responding with errors
Common pattern across routes (e.g. `forex/live` and `forex/ohlcv`):
```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = searchParams.get("pair");
  const interval = searchParams.get("interval");

  if (!pair || !interval) {
    return NextResponse.json({ error: "Currency pair and interval are required" }, { status: 400 });
  }

  // Do work, then return data...
}
```
- `new URL(request.url)` lets you parse query params on the server.
- Always validate inputs and return a helpful error.

### Simulated live data – CSV reading + caching
File: `src/app/api/forex/live/route.ts`
```ts
import path from 'path';
import fs from 'fs/promises';

interface ForexData {
  headers: string[];
  data: Record<string, string>[];
}

function getCsvPath(pair: string, interval: string): string {
  return path.join(process.cwd(), "public", "demo", `${pair}_${interval}.csv`);
}

async function readCsvFile(pair: string, interval: string): Promise<string> {
  const csvPath = getCsvPath(pair, interval);
  await fs.access(csvPath);              // throws if missing
  return await fs.readFile(csvPath, "utf-8");
}

function formatCsvData(csvData: string): ForexData {
  const lines = csvData.split("\n").filter(line => line.trim());
  const headers = lines[0].split(",").map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    return headers.reduce((acc, header, i) => {
      if (i < values.length) acc[header] = values[i];
      return acc;
    }, {} as Record<string, string>);
  });
  return { headers, data };
}
```
Why:
- Use `process.cwd()` to anchor paths at the project root.
- Parse CSV into `{ headers, data[] }` for easy consumption by the UI.

### Time-driven updates and a sliding window
Still in `forex/live`:
```ts
const INTERVAL_MAP: Record<string, number> = { '1m': 60_000, '5m': 300_000, '15m': 900_000, '1hr': 3_600_000 };

// In cache we track currentIndex and lastUpdateTime.
// If enough time has passed for the selected interval, we advance to next row and add tiny random noise.

// Later, we build a limited window (e.g., 30 points) with the latest point first:
const recentData = [...updatedCache.formattedData.data];
const currentPoint = recentData[latestIndex];
recentData.splice(latestIndex, 1);
recentData.unshift(currentPoint);
const limitedData = recentData.slice(0, 30);
```
Concepts:
- “Advance by interval” to simulate new candles arriving on schedule.
- Return a small sliding window to keep responses fast.

### One-point-at-a-time streaming with exhaustion
File: `src/app/api/forex/ohlcv/route.ts`
```ts
// Each GET returns one new data point and increments currentIndex
const { dataPoint, exhausted } = getCurrentDataPoint(pair, interval);

if (exhausted) {
  return NextResponse.json({ message: `All data ...`, exhausted: true }, { status: 204 });
}

return NextResponse.json({ message: `Live data for ${pair}`, data: dataPoint, exhausted: false });
```
Why:
- Feeds UI flows that want candle-by-candle progression.
- The 204 (No Content) status is used when data is fully consumed; the body still indicates `exhausted: true`.

### External API with an API key
File: `src/app/api/forex-news/route.ts`
```ts
const apiKey = process.env.ALPHA_API_KEY_NEWS;
const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=FOREX:${symbol}&apikey=${apiKey}`;
const res = await fetch(url);
const data = await res.json();
```
Notes:
- This runs server-side (safe to read `process.env`).
- In-memory cache avoids re-fetching too often.

### Proxying to a local Django backend with robust error mapping
File: `src/app/api/sentiment/route.ts`
```ts
const res = await fetch(`http://127.0.0.1:8000/sentiment/analyze/${symbol.toLowerCase()}/?...`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
  signal: AbortSignal.timeout(300000) // 5 minutes for local LLM
});

// ...catch errors and map to user-friendly JSON
if (error.name === 'AbortError') { /* return TIMEOUT */ }
if (error.message.includes('fetch failed')) { /* NETWORK_ERROR */ }
```
Why:
- Long-running LLM tasks need extended timeouts.
- Map low-level network errors into actionable UI messages.


## 2) Custom hooks – reusable data logic

### useApi – Axios wrapper with typed results and normalized errors
File: `src/hooks/useApi.tsx`
```ts
export function useApi<T = unknown>(initialUrl: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchData = useCallback(async (config?: AxiosRequestConfig) => {
    setLoading(true); setError(null);
    try {
      const response = await axios({ ...(config||{}), url: config?.url || initialUrl });
      setData(response.data);
      return response.data;
    } catch (err) {
      const parsed = parseError(err); // unify error shapes
      setError(parsed.resError ? { ...parsed, resError: parsed.resError } : parsed);
      throw parsed;
    } finally { setLoading(false); }
  }, [initialUrl]);

  return { data, loading, error, fetchData, clearError: () => setError(null) };
}
```
Concepts:
- Generics (`<T>`) allow strong typing of `data`.
- `parseError` converts various error types into a consistent `ErrorState`.

### useOhlcvData – polling batches for tables/widgets
File: `src/hooks/useOhlcvData.tsx`
```ts
export function useOhlcvData({ pair, interval, refreshInterval = 60_000, limit = 30 }) {
  const { data: apiResponse, loading, error, fetchData } = useApi<ApiResponse>(`/api/forex/live?pair=${pair}&interval=${interval}`);
  const [ohlcvData, setOhlcvData] = useState<DataPoint[] | null>(null);
  const [currentDataPoint, setCurrentDataPoint] = useState<DataPoint | null>(null);

  useEffect(() => {
    if (apiResponse?.data?.data) {
      const newData = apiResponse.data.data.slice(0, limit);
      setOhlcvData(newData);
      setCurrentDataPoint(newData[0] || null); // latest first
    }
  }, [apiResponse, limit]);

  const refreshData = useCallback(async () => { await fetchData(); }, [fetchData]);

  useEffect(() => {
    refreshData();
    const id = setInterval(refreshData, refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval, refreshData]);

  return { data: ohlcvData, currentDataPoint, loading, error, refresh: refreshData };
}
```
Concepts:
- Separate “API response” shape from the “render-ready” shape.
- Keep the newest point first for easy widgets.

### useOhlcv – one-point stream with auto-reset and interval cleanup
File: `src/hooks/useOhlcv.tsx`
```ts
const isFetchingRef = useRef(false);
const intervalRef = useRef<NodeJS.Timeout | null>(null);

const fetchData = useCallback(async () => {
  if (isFetchingRef.current) return;
  isFetchingRef.current = true;
  try {
    const res = await fetch(`/api/forex/ohlcv?pair=${pair}&interval=${interval}`);
    const result = await res.json();
    if (result.exhausted) { setDataExhausted(true); if (autoReset) await resetDataStream(); return; }
    if (result.data) setData(prev => [...prev, result.data].slice(-maxDataPoints));
  } catch (e) { setError(e instanceof Error ? e.message : 'Failed to fetch data'); }
  finally { setLoading(false); isFetchingRef.current = false; }
}, [pair, interval, maxDataPoints, autoReset]);

useEffect(() => {
  // start interval
  if (refreshInterval > 0) {
    intervalRef.current = setInterval(() => {
      if (!dataExhausted || autoReset) fetchData();
      else if (intervalRef.current) clearInterval(intervalRef.current);
    }, refreshInterval);
  }
  return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
}, [pair, interval, refreshInterval, autoReset, fetchData]);
```
Concepts:
- `useRef` to prevent overlapping fetches and to store interval IDs.
- Graceful handling when data is exhausted.


## 3) Contexts – shared state and caching

### CacheContext – simple client-side cache
File: `src/context/CacheContext.tsx`
```ts
const [cache, setCache] = useState<Record<string, { data: unknown; timestamp: number }>>({});

const getCache = (key: string) => cache[key] || null;
const setCacheData = (key: string, data: unknown) => setCache(prev => ({ ...prev, [key]: { data, timestamp: Date.now() } }));
const isCacheValid = (key: string, duration = 24*60*60*1000) => {
  const c = cache[key];
  return !!(c && (Date.now() - c.timestamp < duration));
};
```
Usage (in `NewsTab`):
```ts
if (isCacheValid(NEWS_CACHE_KEY, NEWS_CACHE_DURATION_MS)) {
  const cached = getCache(NEWS_CACHE_KEY);
  if (cached) { setNewsItems(cached.data as NewsItem[]); return; }
}
// fetch, then setCache(NEWS_CACHE_KEY, feed)
```

### SentimentContext – fetch + 5‑minute TTL cache per symbol
File: `src/contexts/SentimentContext.tsx`
```ts
const [cachedData, setCachedData] = useState<Map<string, { data: SentimentData; fetchedAt: number; symbol: string }>>(new Map());

const getSentimentData = async (symbol: string) => {
  const cached = cachedData.get(symbol);
  if (cached && (Date.now() - cached.fetchedAt) < 5*60*1000) return cached.data;
  const data = await fetch(`/api/sentiment?symbol=${symbol}`).then(r => r.json());
  const next = new Map(cachedData); next.set(symbol, { data, fetchedAt: Date.now(), symbol });
  setCachedData(next); return data;
};
```


## 4) Components – how UI pieces use hooks and contexts

### LiveData – dropdowns + LivePrice widget + table
File: `src/components/pages/live-data-tab.tsx`
```tsx
const [selectedPair, setSelectedPair] = useState('EURUSD');
const [selectedInterval, setSelectedInterval] = useState<'1m'|'5m'|'15m'|'1hr'>('1m');
const { data, currentDataPoint, loading, error, refresh } = useOhlcvData({ pair: selectedPair, interval: selectedInterval });

// child callback that counts up/down moves
const handlePriceChange = (direction: 'up'|'down'|'neutral') => { /* update counters */ };

<LivePrice dataPoint={currentDataPoint} pair={formatPairName(selectedPair)} isLoading={loading} onPriceChange={handlePriceChange} />
```
Concepts:
- “Lift state up”: parent holds selected pair/interval and passes down.
- Lightweight real-time UI by polling the server route.

### StrategyTab – streaming controller over useOhlcv
File: `src/components/pages/strategy-tab.tsx`
```tsx
const [refreshInterval, setRefreshInterval] = useState(5000);
const [isStreaming, setIsStreaming] = useState(true);
const [autoReset, setAutoReset] = useState(false);

const { data, loading, error, dataExhausted, resetDataStream } = useOhlcv({
  pair: 'EURUSD', interval: '1m', refreshInterval: isStreaming ? refreshInterval : 0, autoReset
});
```
Concepts:
- Toggleable interval streaming; auto-reset when data ends.
- Disable start when exhausted and auto-reset is off.

### LivePrice – detecting up/down ticks
File: `src/components/live/liveprice.tsx`
```tsx
const previousDataPointRef = useRef<DataPoint | null>(null);
useEffect(() => {
  if (!dataPoint?.Close) return;
  const isNew = previousDataPointRef.current?.Date !== dataPoint.Date || previousDataPointRef.current?.Close !== dataPoint.Close;
  if (lastPrice !== null && isNew) {
    const direction = parseFloat(dataPoint.Close) > parseFloat(lastPrice) ? 'up' : (parseFloat(dataPoint.Close) < parseFloat(lastPrice) ? 'down' : 'neutral');
    setPriceDirection(direction); onPriceChange?.(direction);
  }
  setLastPrice(dataPoint.Close); previousDataPointRef.current = dataPoint;
  const timer = setTimeout(() => setPriceDirection('neutral'), 1000);
  return () => clearTimeout(timer);
}, [dataPoint, lastPrice, onPriceChange]);
```
Concepts:
- Compare the latest `Close` with the last price and adjust styles/colors accordingly.
- Reset highlight after 1s for a subtle flash.

### ErrorsPage – consistent user-friendly errors
File: `src/components/errors/ErrorsPage.tsx`
```tsx
const errorMessage = message || getErrorMessage(status);
// Optional expandable details in dev
{(details || (isDev && hasError(resError))) && (
  <Button onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide' : 'Show'} details</Button>
)}
```
Concepts:
- Provide Retry and Dismiss hooks.
- Show raw error only in dev to avoid confusing users.

### NewsTab – Alpha Vantage news + session cache
File: `src/components/pages/news-tab.tsx`
```tsx
useEffect(() => { fetchNewsSentiment(); }, [fetchNewsSentiment]);
const getImpactLevel = (relevanceScore: string) => parseFloat(relevanceScore) >= 0.7 ? 'high' : parseFloat(relevanceScore) >= 0.4 ? 'medium' : 'low';
const filteredNews = newsItems.filter(item => { /* filter by currency + impact */ });
```
Concepts:
- Simple derived helpers + controlled filters.
- Use `CacheContext` to avoid refetching during the same session.


## 5) AI flow (Genkit + Zod) and server action

### Configure Genkit
File: `src/ai/genkit.ts`
```ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
export const ai = genkit({ plugins: [googleAI()], model: 'googleai/gemini-2.0-flash' });
```

### Define typed input/output and a tool
File: `src/ai/flows/analyze-market-sentiment.ts`
```ts
import { z } from 'genkit';
const AnalyzeMarketSentimentInputSchema = z.object({ query: z.string().describe('The query, e.g. EUR/USD') });
const AnalyzeMarketSentimentOutputSchema = z.object({ sentimentSummary: z.string(), supportingNewsItems: z.array(z.string()) });

const getMarketSentiment = ai.defineTool({ /* name, inputSchema, outputSchema */ }, async (input) => {
  // Mock implementation — replace with real analysis
  return { sentiment: `The market sentiment for ${input.query} is currently neutral.`, newsItems: [/*...*/] };
});
```
Why Zod:
- Runtime validation + TypeScript inference (`z.infer<typeof Schema>`) keeps everything consistent.

### Prompt and flow
```ts
const analyzeMarketSentimentPrompt = ai.definePrompt({ name: 'analyzeMarketSentimentPrompt', tools: [getMarketSentiment], input: { schema: AnalyzeMarketSentimentInputSchema }, output: { schema: AnalyzeMarketSentimentOutputSchema }, prompt: `You are a financial analyst...`});

const analyzeMarketSentimentFlow = ai.defineFlow({ name: 'analyzeMarketSentimentFlow', inputSchema: AnalyzeMarketSentimentInputSchema, outputSchema: AnalyzeMarketSentimentOutputSchema }, async input => {
  const { output } = await analyzeMarketSentimentPrompt(input);
  return output!;
});

export async function analyzeMarketSentiment(input: AnalyzeMarketSentimentInput) {
  return analyzeMarketSentimentFlow(input);
}
```

### Server action + client tab
File: `src/lib/actions.ts`
```ts
"use server";
import { analyzeMarketSentiment } from "@/ai/flows/analyze-market-sentiment";
export async function getMarketSentimentAnalysis(input) {
  try { return { success: true, data: await analyzeMarketSentiment(input) }; }
  catch { return { success: false, error: "Failed to analyze market sentiment." }; }
}
```
File: `src/components/pages/sentiment-ai-tab.tsx`
```tsx
const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { query: "EUR/USD" } });
const onSubmit = async (values) => { setIsLoading(true); setResult(null); const response = await getMarketSentimentAnalysis({ query: values.query }); /* setResult or toast */ };
```
Concepts:
- Server actions keep keys on the server and provide a typed boundary for the client.


## 6) Utilities and types

### Error utilities
File: `src/utils/errors.ts`
```ts
export function parseError(error: unknown): ErrorState {
  if (axios.isAxiosError(error)) { /* unwrap Axios error, response.data, map fields */ }
  if (error instanceof Error) { /* name/message/stack */ }
  if (typeof error === 'string') { /* try parse JSON, else use string */ }
  if (error && typeof error === 'object') { /* generic object */ }
  return { message: 'An unknown error occurred', resError: error || 'Unknown error' };
}
```
Why:
- UIs need consistent shapes for errors regardless of source.

### TypeScript patterns you’ll see a lot
```ts
// Interfaces for shapes
type Interval = '1m' | '5m' | '15m' | '1hr';
interface DataPoint { Date: string; Open: string; High: string; Low: string; Close: string; Volume: string; }

// Generics
function identity<T>(value: T): T { return value; }

// Narrowing (simplified)
function isString(x: unknown): x is string { return typeof x === 'string'; }
```


## 7) Common gotchas and tips

- "use client" at the top makes a file a Client Component (you can use hooks). Server files (API routes, server actions) must not use client-only APIs.
- Don’t access `process.env` in client components. Do it server-side.
- Clean up intervals/timeouts in `useEffect` to avoid memory leaks.
- Keep data small over the network; slice arrays where possible (`limit` in hooks).
- Favor derived helpers for readability (e.g., `getImpactLevel`, `formatPairName`).


## 8) How it all fits together

- The UI tabs (Home page) render components that use hooks for data.
- Hooks call API routes. API routes read CSVs (for simulation) or call external services.
- Contexts cache client-side data to reduce re-fetching.
- The AI tab calls a server action, which calls a Genkit flow, which returns summarized, typed results.


## 9) Practice exercises (optional)

- Change the live API to read from `public/data/PAIR.csv` instead of `public/demo/PAIR_INTERVAL.csv`.
- Add another pair CSV and wire the dropdown to use it.
- Replace the mock `getMarketSentiment` tool with a real fetch to `/api/forex-news` and summarize headlines.
- Add a new error state to `ErrorsPage` (e.g., unauthorized) and surface it from an API route.


## 10) Glossary

- OHLCV: Open, High, Low, Close, Volume – typical candle fields.
- TTL: Time To Live – how long something stays cached.
- Zod: A schema library for runtime validation + TypeScript inference.
- Server action: A Next.js feature to run server-side code directly from client components.

---

Keep this guide open while reading code. When something’s unclear, search for the file path listed here and compare the snippet to the full source.


## Appendix: Practical Examples (copy–paste friendly)

These examples show how to try the APIs and code patterns quickly. Use Windows PowerShell for the shell examples.

### A1) Call the live OHLCV API from PowerShell

PowerShell (preferred on Windows):

```powershell
# Get a 30-point window for EURUSD 1-minute candles
Invoke-RestMethod -Method GET "http://localhost:3000/api/forex/live?pair=EURUSD&interval=1m" | ConvertTo-Json -Depth 5

# 5-minute candles
Invoke-RestMethod -Method GET "http://localhost:3000/api/forex/live?pair=EURUSD&interval=5m" | ConvertTo-Json -Depth 5
```

curl alternative:

```powershell
curl "http://localhost:3000/api/forex/live?pair=EURUSD&interval=1m"
```

What you should see: JSON with `message`, `timestamp`, and `data.data` (an array of OHLCV points, latest first).

Common errors to practice:
- Missing params → 400 with `{ error: "Currency pair and interval are required" }`
- Missing CSV file → 500 with a helpful error message

Tip: Change `pair` or `interval` to see how the API responds.

### A2) Call the one-point streaming API repeatedly

Run this in the browser console at `http://localhost:3000/`:

```js
async function streamOnce(pair = 'EURUSD', interval = '1m') {
  const res = await fetch(`/api/forex/ohlcv?pair=${pair}&interval=${interval}`);
  const json = await res.json();
  console.log(json);
  return json;
}

// Poll 10 times with a delay
(async () => {
  for (let i = 0; i < 10; i++) {
    const { exhausted } = await streamOnce();
    if (exhausted) { console.log('No more data'); break; }
    await new Promise(r => setTimeout(r, 1500));
  }
})();
```

Observe how data arrives one candle at a time until data is exhausted.

### A3) Minimal component using useApi

```tsx
"use client";
import React from 'react';
import { useApi } from '@/hooks/useApi';

type Hello = { message: string };

export default function HelloBox() {
  const { data, loading, error, fetchData } = useApi<Hello>('/api/forex');

  React.useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Concepts:
- Generic `<Hello>` types the `data` response.
- Errors are already normalized; show `error.message` safely.

### A4) Display latest price with useOhlcvData

```tsx
"use client";
import React from 'react';
import { useOhlcvData } from '@/hooks/useOhlcvData';

export function LatestPrice({ pair = 'EURUSD', interval = '1m' }) {
  const { currentDataPoint, loading, error } = useOhlcvData({ pair, interval, refreshInterval: 10_000, limit: 30 });

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!currentDataPoint) return <p>No data</p>;

  const { Date: t, Open, High, Low, Close } = currentDataPoint;
  return (
    <div>
      <div>{pair} {interval} — {t}</div>
      <div>O:{Open} H:{High} L:{Low} C:{Close}</div>
    </div>
  );
}
```

Concepts:
- `currentDataPoint` is newest-first; ideal for a compact widget.

### A5) Streaming list with useOhlcv

```tsx
"use client";
import React from 'react';
import { useOhlcv } from '@/hooks/useOhlcv';

export function StreamList() {
  const { data, loading, error, dataExhausted } = useOhlcv({ pair: 'EURUSD', interval: '1m', refreshInterval: 2000, maxDataPoints: 10, autoReset: false });

  return (
    <div>
      {loading && <p>Loading…</p>}
      {error && <p>Error: {error}</p>}
      {dataExhausted && <p>End of stream</p>}
      <ol>
        {data.map((d, i) => (
          <li key={i}>{d.Date} — Close: {d.Close}</li>
        ))}
      </ol>
    </div>
  );
}
```

Concepts:
- Keeps only the last 10 points via `maxDataPoints`.

### A6) Using CacheContext in a component

```tsx
"use client";
import React from 'react';
import { CacheContext } from '@/context/CacheContext';

export function WithCache() {
  const { getCache, setCache, isCacheValid } = React.useContext(CacheContext);
  const key = 'demo-key';

  function save() { setCache(key, { greeting: 'hello' }); }
  function load() {
    if (isCacheValid(key, 60_000)) {
      const cached = getCache(key);
      alert(JSON.stringify(cached?.data));
    } else {
      alert('No valid cache');
    }
  }

  return (
    <div>
      <button onClick={save}>Save</button>
      <button onClick={load}>Load</button>
    </div>
  );
}
```

Concepts:
- Use `useContext` to access cache helpers exposed by the provider.

### A7) SentimentContext example (per-symbol caching)

```tsx
"use client";
import React from 'react';
import { SentimentContext } from '@/contexts/SentimentContext';

export function SymbolSentiment({ symbol = 'EURUSD' }) {
  const { getSentimentData } = React.useContext(SentimentContext);
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    getSentimentData(symbol).then(d => setText(d?.sentimentSummary || JSON.stringify(d))).catch(e => setText(String(e)));
  }, [symbol, getSentimentData]);

  return <pre>{text}</pre>;
}
```

Concepts:
- Re-reads within 5 minutes hit the cache and return instantly.

### A8) Zod inference from schemas

```ts
import { z } from 'zod';

const TradeInput = z.object({ symbol: z.string(), amount: z.number().min(0.01) });
type TradeInput = z.infer<typeof TradeInput>;

function submitTrade(input: TradeInput) {
  // TS knows input.symbol is string and input.amount is number
}

// Runtime validation
const parsed = TradeInput.safeParse({ symbol: 'EURUSD', amount: -1 });
// parsed.success === false (amount must be >= 0.01)
```

Concepts:
- Single source of truth for both runtime and compile-time types.

### A9) parseError in action

```ts
import axios from 'axios';
import { parseError } from '@/utils/errors';

async function load() {
  try {
    await axios.get('/api/might-fail');
  } catch (e) {
    const err = parseError(e);
    console.log(err.message); // human-friendly
    if (err.resError) console.debug(err.resError); // raw details (dev only)
  }
}
```

Concepts:
- Regardless of the source, you get a predictable error shape.

### A10) PowerShell test for the news endpoint

```powershell
# Requires ALPHA_API_KEY_NEWS in your environment
$env:ALPHA_API_KEY_NEWS = "YOUR_KEY_HERE"
Invoke-RestMethod -Method GET "http://localhost:3000/api/forex-news?symbol=EURUSD" | ConvertTo-Json -Depth 5
```

Expected: a JSON feed from Alpha Vantage (cached for a day on the server).

### A11) AbortSignal timeout demo (server-side pattern)

```ts
const res = await fetch('http://127.0.0.1:8000/slow', { signal: AbortSignal.timeout(60_000) });
```

Concepts:
- Prevents a request from hanging forever; catch `AbortError` and show a friendly timeout message.

---

If you want more examples for charts or an end-to-end mini-feature, tell me what you’d like to build (e.g., “simple RSI indicator”) and I’ll add a step-by-step walkthrough.


## Advanced Next.js roadmap: what to learn next (and why)

Use this as a checklist. Each topic includes a short why and a hint/micro‑example.

1) Server Components deep dive (default in App Router)
- Why: Smaller bundles, faster TTFB, less client JS. Fetch data on the server close to the DB/APIs.
- Learn: When to add `"use client"`, how to pass props between server and client components, limitations (no browser-only APIs on server components).

2) Data fetching and caching semantics
- Why: Performance and correctness. Control revalidation precisely.
- Learn: `fetch()` cache options (`force-cache`, `no-store`), `revalidate` per request/segment, `revalidateTag`/`revalidatePath`.
- Micro-example:
  - Route handler decides caching window: `export const revalidate = 60; // ISR for 60s` in a segment file.

3) Streaming and Suspense
- Why: Show content sooner; great for slow parts like AI or news.
- Learn: `<Suspense fallback={...}>`, streaming Server Components, route handler streaming with `ReadableStream`.
- Micro-example (Server Component):
  - Wrap a slow child with `<Suspense fallback={<Skeleton/>}><SlowSection/></Suspense>`.

4) Server Actions (advanced)
- Why: Mutations without client API wrappers; secure by default.
- Learn: Form `action` prop, optimistic UI with `useOptimistic`/`useTransition`, error boundaries for actions.
- Micro-example:
  - `<form action={savePost}>{/* fields */}<Submit/></form>` where `async function savePost(formData: FormData) { "use server"; /* write to DB */ }`.

5) Middleware and Edge Runtime
- Why: Fast logic at the CDN edge: A/B tests, geolocation, i18n routing, auth gates.
- Learn: `middleware.ts` with `NextResponse.rewrite/redirect`, matching config, Edge runtime constraints (no Node APIs).

6) Incremental Static Regeneration (ISR) patterns
- Why: Combine static speed with fresh data.
- Learn: `export const revalidate = N`, `generateStaticParams` for dynamic routes, on-demand revalidation webhooks.

7) Metadata and Open Graph
- Why: SEO/social previews.
- Learn: `export const metadata`, `generateMetadata()`, dynamic OG images via route handlers (e.g., Satori/@vercel/og).

8) Images, Fonts, and static assets
- Why: Core Web Vitals wins.
- Learn: `next/image`, `next/font` (no layout shift), responsive sizes, placeholders.

9) Authentication and Authorization
- Why: Secure areas and personalization.
- Learn: Auth.js (NextAuth v5) with App Router, session in Server Components (`getServerSession`), route protection in middleware, cookie security (HttpOnly, Secure, SameSite).

10) Internationalization (i18n) and route groups
- Why: Multi-locale apps.
- Learn: Route groups `(en)/(fr)`, middleware locale detection, `Link` with `locale`, date/number formatting.

11) Real-time features
- Why: Live dashboards and collaboration.
- Learn: Server-Sent Events (SSE), WebSockets (Pusher/Ably/Supabase), Route Handlers that stream events, React hooks to consume streams.

12) Performance and bundle control
- Why: Keep UX snappy.
- Learn: `dynamic()` for code splitting, `prefetch` behavior in `Link`, bundle analyzer, memoization (`React.memo`, `useMemo`, `useCallback`) where it pays off.

13) Testing strategy
- Why: Confidence to refactor.
- Learn: Unit tests (Jest/Vitest), component tests (React Testing Library), E2E (Playwright). Mock `fetch` and route handlers; test Server Actions via direct function calls.

14) Observability and logging
- Why: Diagnose prod issues.
- Learn: `instrumentation.ts`, OpenTelemetry, structured logging, tracing slow server components, error boundaries and error routes `(error.tsx)`.

15) Security hardening
- Why: Protect data and users.
- Learn: CSP headers (set in `next.config.ts` or middleware), avoid leaking env vars to client, sanitize user input, rate limiting in route handlers.

16) Monorepos and shared packages
- Why: Scale with multiple apps/services.
- Learn: Turborepo, PNPM workspaces, shared UI packages, strict TypeScript project references.

17) Deployment models
- Why: Choose the right runtime.
- Learn: Vercel (Edge/Node), self-host Node server, Docker basics, environment variables per environment, feature flags.

18) API composition and validation
- Why: Reliable contracts.
- Learn: Zod schemas on the server, typed clients (OpenAPI or tRPC), error normalization patterns, backpressure and pagination in APIs.


Project ideas to practice (in this repo):
- Build an SSE endpoint under `src/app/api/forex/stream/route.ts` and a client hook to consume it with `EventSource`.
- Convert parts of News/Sentiment to use `<Suspense>` + streaming for faster first paint.
- Add Auth.js to protect a new “My Strategies” page; store user layouts in a DB (e.g., SQLite/Prisma) via Server Actions.
- Implement on-demand revalidation for a cached news page via a secret webhook route.
- Generate dynamic OG images for the selected currency pair and interval.

If you want, I can implement any one of these as a guided mini-feature with tests.


## Basics → Advanced: hands-on guide (with code)

This section adds short, progressive examples you can use as a study track.

### B1) TypeScript and React basics you’ll use everywhere

```ts
// Types and interfaces
type Interval = '1m' | '5m' | '15m' | '1hr';
interface Candle { time: string; open: number; high: number; low: number; close: number; volume: number; }

// Functions with typed params/returns
function midpoint(a: number, b: number): number { return (a + b) / 2; }

// Generics (reusable containers)
function first<T>(arr: T[]): T | undefined { return arr[0]; }

// Narrowing and guards
function isCandle(x: unknown): x is Candle {
  return !!x && typeof x === 'object' && 'open' in (x as any) && 'close' in (x as any);
}
```

React essentials:

```tsx
"use client";
import React from 'react';

export function Counter() {
  const [n, setN] = React.useState(0);
  React.useEffect(() => { document.title = `Count: ${n}`; }, [n]);
  return (
    <div>
      <button onClick={() => setN(n - 1)}>-</button>
      <span>{n}</span>
      <button onClick={() => setN(n + 1)}>+</button>
    </div>
  );
}
```

Key ideas: `useState`, `useEffect` dependencies, and events.

### B2) App Router essentials: pages, layout, metadata

File: `src/app/layout.tsx` (already present). Server Component by default.

```tsx
export const metadata = { title: 'Forex Compass', description: 'Learn and simulate forex' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Dynamic route example:

```
src/app/pairs/[pair]/page.tsx
```

```tsx
import { notFound } from 'next/navigation';

export default async function PairPage({ params }: { params: { pair: string } }) {
  const { pair } = params; // e.g., EURUSD
  if (!pair) return notFound();
  return <div>Pair: {pair}</div>;
}
```

Search params in a Server Component:

```tsx
export default function Page({ searchParams }: { searchParams: { interval?: string } }) {
  const interval = searchParams.interval ?? '1m';
  return <div>Interval: {interval}</div>;
}
```

### B3) Route Handlers (API) basics

```ts
// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ ok: true }); }
export async function POST(req: Request) { const body = await req.json(); return NextResponse.json({ received: body }); }
```

Headers/cookies on the server:

```ts
import { cookies, headers } from 'next/headers';
export async function GET() {
  const ua = headers().get('user-agent');
  cookies().set('visited', '1', { httpOnly: true });
  return Response.json({ ua });
}
```

### B4) Data fetching patterns matrix

- Server Component fetching: best for SEO and bundle size

```tsx
// Server Component (no "use client")
export default async function NewsServer() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forex-news?symbol=EURUSD`, { next: { revalidate: 60 } });
  const json = await res.json();
  return <pre>{JSON.stringify(json, null, 2)}</pre>;
}
```

- Client Component fetching: interactivity/polling

```tsx
"use client";
export function NewsClient() {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => { fetch('/api/forex-news?symbol=EURUSD').then(r => r.json()).then(setData); }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Caching knobs:

```ts
// Route segment file
export const revalidate = 300; // ISR every 5 minutes
// On fetch
await fetch(url, { cache: 'no-store' }); // always fresh
await fetch(url, { next: { revalidate: 120, tags: ['news'] } });
```

### B5) Error routes and boundaries

Error file co-located with a route segment:

```
src/app/(group)/error.tsx
```

```tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

Not found:

```tsx
// src/app/not-found.tsx
export default function NotFound() { return <h1>404 – Not Found</h1>; }
```

### B6) Forms and validation with Zod (client)

```tsx
"use client";
import { z } from 'zod';
import { useState } from 'react';

const FormSchema = z.object({ pair: z.string().min(6).max(7), interval: z.enum(['1m','5m','15m','1hr']) });

export function SimpleForm() {
  const [msg, setMsg] = useState('');
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = FormSchema.safeParse({ pair: fd.get('pair'), interval: fd.get('interval') });
    setMsg(parsed.success ? 'Valid!' : parsed.error.issues[0].message);
  }
  return (
    <form onSubmit={onSubmit}>
      <input name="pair" defaultValue="EURUSD" />
      <select name="interval" defaultValue="1m"><option>1m</option><option>5m</option><option>15m</option><option>1hr</option></select>
      <button type="submit">Validate</button>
      <div>{msg}</div>
    </form>
  );
}
```

### B7) Useful Next helpers: redirects, notFound, dynamic behavior

```tsx
import { redirect, notFound } from 'next/navigation';
export default function Page({ searchParams }: { searchParams: { go?: string } }) {
  if (searchParams.go === 'home') redirect('/');
  if (searchParams.go === 'missing') notFound();
  return <div>Welcome</div>;
}
```

Dynamic rendering toggle:

```ts
// in a route segment
export const dynamic = 'force-dynamic'; // disable static optimization
export const fetchCache = 'force-no-store';
```

### B8) Advanced micro-labs (build these here)

1. Server-Sent Events (SSE) streaming route

```
// File: src/app/api/forex/stream/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // SSE uses Node APIs

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let i = 0;
      const id = setInterval(() => {
        const payload = JSON.stringify({ t: Date.now(), i });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        i++;
        if (i > 10) { clearInterval(id); controller.close(); }
      }, 1000);
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
}
```

Client hook to consume SSE:

```tsx
"use client";
import React from 'react';

export function useSSE(url: string) {
  const [events, setEvents] = React.useState<any[]>([]);
  React.useEffect(() => {
    const es = new EventSource(url);
    es.onmessage = (e) => setEvents(prev => [...prev, JSON.parse(e.data)].slice(-50));
    return () => es.close();
  }, [url]);
  return events;
}
```

2. Middleware guard (basic auth gate or locale rewrite)

```ts
// middleware.ts at project root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  // Example: redirect `/` to `/en` if not already localized
  if (url.pathname === '/') { url.pathname = '/en'; return NextResponse.redirect(url); }
  return NextResponse.next();
}

export const config = { matcher: ['/', '/((?!_next|api|static).*)'] };
```

3. Cookies in Server Components

```tsx
// src/app/profile/page.tsx
import { cookies } from 'next/headers';
export default async function Profile() {
  const name = cookies().get('name')?.value ?? 'guest';
  return <div>Hello, {name}</div>;
}
```

4. Streaming UI with Suspense

```tsx
// src/app/streaming/page.tsx
import { Suspense } from 'react';

async function SlowPart() {
  await new Promise(r => setTimeout(r, 1500));
  return <div>Loaded after 1.5s</div>;
}

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading…</div>}>
        {/* @ts-expect-error Async Server Component */}
        <SlowPart />
      </Suspense>
    </div>
  );
}
```

### B9) Performance quick wins

- Prefer Server Components for static/SSR content; move only interactive parts to Client Components.
- Use `revalidate` or `next.revalidate` on fetch to cache safely.
- Code-split large widgets with `dynamic(() => import('./BigChart'), { ssr: false })` when appropriate.
- Memoize expensive client components with `React.memo`, and cache derived values with `useMemo`.

### B10) Production checklist

- Environment variables set for each environment (dev/stage/prod).
- Error routes (`error.tsx`) and `not-found.tsx` present.
- CSP and security headers via middleware or hosting config.
- Logs/metrics: consider `instrumentation.ts` and a log sink.
- Bundle check: analyze and ensure third-party libs are necessary.


## Caveats and best practices for this repo (don’t skip)

These points save time in real deployments and prevent subtle bugs.

### C1) Environment variables: server vs client

- Server-only: `process.env.SECRET_KEY` (never readable on the client). Use on the server (route handlers, Server Components, server actions).
- Client-readable: must be prefixed with `NEXT_PUBLIC_` and accessed as `process.env.NEXT_PUBLIC_*` or `runtime env` via injection.

Example `.env.local`:

```ini
ALPHA_API_KEY_NEWS=your-key
NEXT_PUBLIC_APP_NAME=Forex Compass
```

Server usage:

```ts
// OK on server
const key = process.env.ALPHA_API_KEY_NEWS;
```

Client usage:

```tsx
// OK in client component
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

### C2) In-memory cache in serverless contexts

- In-memory caches inside route handlers reset on cold starts or across regions.
- For consistency across requests, prefer Next.js fetch cache (`revalidate`, tags) or an external store (Redis/Upstash/DB).
- If you keep in-memory cache for dev convenience, make sure your code handles cache misses gracefully.

### C3) Node vs Edge runtime

- FS APIs (reading CSVs) require Node runtime.
- Declare it if needed:

```ts
export const runtime = 'nodejs';
```

- Edge runtime is great for low-latency logic without Node APIs.

### C4) Input validation and path safety (important here)

Whitelist valid inputs to prevent reading unintended files.

```ts
const ALLOWED_PAIRS = ['EURUSD','GBPUSD','USDJPY','USDCAD','AUDUSD'] as const;
const ALLOWED_INTERVALS = ['1m','5m','15m','1hr'] as const;
type Pair = typeof ALLOWED_PAIRS[number];
type Interval = typeof ALLOWED_INTERVALS[number];

function isValidPair(x: string): x is Pair { return (ALLOWED_PAIRS as readonly string[]).includes(x); }
function isValidInterval(x: string): x is Interval { return (ALLOWED_INTERVALS as readonly string[]).includes(x); }

// In route handler
if (!isValidPair(pair) || !isValidInterval(interval)) {
  return NextResponse.json({ error: 'Invalid pair or interval' }, { status: 400 });
}
```

Use `path.join(process.cwd(), 'public', 'demo', `${pair}_${interval}.csv`)` after validation to avoid traversal.

### C5) next.config.ts: headers, rewrites, redirects

Example patterns:

```ts
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      { source: '/:path*', headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }] },
    ];
  },
  async rewrites() {
    return [
      { source: '/feed', destination: '/api/forex-news?symbol=EURUSD' },
    ];
  },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ];
  },
};
export default nextConfig;
```

### C6) Minimal tests for a route handler (unit style)

```ts
// tests/ohlcv.test.ts (example with Vitest)
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/forex/ohlcv/route';

describe('ohlcv route', () => {
  it('validates params', async () => {
    const req = new Request('http://localhost/api/forex/ohlcv');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });
});
```

Tip: Add a simple test runner (Vitest) and map `@/` to `src/` in `tsconfig.json` for tests too.

### C7) Accessibility quick wins

- For live prices, add an aria-live region to announce changes:

```tsx
<div aria-live="polite" aria-atomic="true">
  Latest: {price}
  <span className="sr-only">{direction === 'up' ? 'Price up' : direction === 'down' ? 'Price down' : 'No change'}</span>
 </div>
```

- Use semantic elements and labels for inputs. Ensure color changes aren’t the only signal (use icons/text also).

### C8) Logging and instrumentation

`instrumentation.ts` runs during startup and can set up tracing/logging.

```ts
// src/instrumentation.ts
export async function register() {
  console.log('[boot] starting app');
}
```

For route handlers, log structured messages (JSON) for easier parsing.

### C9) Deployment notes

- Ensure CSVs under `public/demo` are present in production (they are static assets and will be uploaded).
- Configure environment variables (`ALPHA_API_KEY_NEWS`) in your hosting provider.
- If you rely on long timeouts (LLM proxy), confirm platform timeout limits and switch to background jobs if needed.
