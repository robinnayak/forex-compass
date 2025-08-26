// contexts/CacheContext.tsx
"use client";

import React, { createContext, useContext, ReactNode, useState } from 'react';

// Define cache item structure
interface CacheItem {
  data: unknown;
  timestamp: number;
}

// Define the context type
interface CacheContextType {
  getCache: (key: string) => CacheItem | null;
  setCache: (key: string, data: unknown) => void;
  isCacheValid: (key: string, duration?: number) => boolean;
  clearCache: (key?: string) => void;
}

// Create the context
const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Default cache duration (24 hours)
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000;

// Provider component
export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Using state to hold our cache
  const [cache, setCache] = useState<Record<string, CacheItem>>({});

  // Get data from cache
  const getCache = (key: string): CacheItem | null => {
    return cache[key] || null;
  };

  // Set data in cache
  const setCacheData = (key: string, data: unknown) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  };

  // Check if cache is still valid
  const isCacheValid = (key: string, duration: number = DEFAULT_CACHE_DURATION): boolean => {
    const cached = cache[key];
    return !!(cached && (Date.now() - cached.timestamp < duration));
  };

  // Clear cache (specific key or all)
  const clearCache = (key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
    } else {
      setCache({});
    }
  };

  return (
    <CacheContext.Provider value={{ getCache, setCache: setCacheData, isCacheValid, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};

// Custom hook to use the cache
export const useCache = () => {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};