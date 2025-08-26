"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for Django backend response
interface RedditItem {
  id: string;
  title: string;
  text: string;
  url: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  upvote_ratio: number;
  created_utc: number;
  created_at: string;
  author: string;
  nsfw: boolean;
}

interface NewsItem {
  source: string;
  id: string;
  title: string;
  text: string;
  url: string;
  publisher: string;
  published: string;
  created_at: string;
  feed_source: string;
  symbol: string;
}

interface ComponentAnalysis {
  source_type: string;
  signal: string;
  confidence: string;
  sentiment_score: number;
}

interface SentimentAnalysis {
  symbol: string;
  signal: string;
  confidence: string;
  sentiment_score: number;
  buy_probability: string;
  sell_probability: string;
  neutral_probability: string;
  rationale: string;
  key_insights: string[];
  risk_level: string;
  timeframe: string;
  sources_analyzed: number;
  source_types: string[];
  analysis_timestamp: string;
  component_analyses: ComponentAnalysis[];
}

interface SentimentData {
  symbol: string;
  metadata: {
    keywords: string[];
    subs: string[];
    category: string;
    regions: string[];
    note: string;
  };
  sources: {
    reddit: {
      enabled: boolean;
      items_found: number;
      items: RedditItem[];
    };
    news: {
      enabled: boolean;
      items_found: number;
      items: NewsItem[];
    };
  };
  total_items: number;
  timestamp: string;
  sentiment_analysis: SentimentAnalysis;
}

interface CachedSentimentData {
  data: SentimentData;
  fetchedAt: number;
  symbol: string;
}

interface SentimentContextType {
  cachedData: Map<string, CachedSentimentData>;
  getSentimentData: (symbol: string) => Promise<SentimentData>;
  loading: boolean;
  error: string;
  refreshData: (symbol: string) => Promise<SentimentData>;
}

const SentimentContext = createContext<SentimentContextType | undefined>(undefined);

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const SentimentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cachedData, setCachedData] = useState<Map<string, CachedSentimentData>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchSentimentData = async (symbol: string): Promise<SentimentData> => {
    const res = await fetch(`/api/sentiment?symbol=${symbol}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch sentiment data: ${res.status}`);
    }

    return await res.json();
  };

  const getSentimentData = async (symbol: string): Promise<SentimentData> => {
    const cached = cachedData.get(symbol);
    const now = Date.now();

    // Return cached data if it's still fresh
    if (cached && (now - cached.fetchedAt) < CACHE_DURATION) {
      return cached.data;
    }

    // Fetch new data
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchSentimentData(symbol);
      
      // Update cache
      const newCachedData = new Map(cachedData);
      newCachedData.set(symbol, {
        data,
        fetchedAt: now,
        symbol
      });
      setCachedData(newCachedData);
      
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async (symbol: string): Promise<SentimentData> => {
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchSentimentData(symbol);
      
      // Force update cache
      const newCachedData = new Map(cachedData);
      newCachedData.set(symbol, {
        data,
        fetchedAt: Date.now(),
        symbol
      });
      setCachedData(newCachedData);
      
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SentimentContext.Provider value={{
      cachedData,
      getSentimentData,
      loading,
      error,
      refreshData
    }}>
      {children}
    </SentimentContext.Provider>
  );
};

export const useSentiment = () => {
  const context = useContext(SentimentContext);
  if (context === undefined) {
    throw new Error('useSentiment must be used within a SentimentProvider');
  }
  return context;
};

export type { SentimentData, RedditItem, NewsItem, ComponentAnalysis, SentimentAnalysis };
