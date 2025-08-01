"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


type NewsItem = {
  title: string;
  url: string;
  time_published: string;
  source: string;
  banner_image?: string;
  summary: string;
  overall_sentiment_label: string;
  ticker_sentiment: {
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }[];
};

// Module-level cache to store news data during the user's session.
let newsCache: { data: NewsItem[]; timestamp: number } | null = null;
// Cache duration: 24 hours
const NEWS_CACHE_DURATION_MS = 60 * 60 * 1000 * 24; // 24 HOURS

export function NewsTab() {
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNewsSentiment = useCallback(async () => {
    // Check if a valid cache exists
    if (newsCache && (Date.now() - newsCache.timestamp < NEWS_CACHE_DURATION_MS)) {
      setNewsItems(newsCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/forex-news?symbol=USD"); // The symbol seems static, good candidate for caching
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      const feed = data.feed || [];
      setNewsItems(feed);
      newsCache = { data: feed, timestamp: Date.now() }; // Update the cache
    } catch (error) {
      console.error("Error fetching news sentiment:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsSentiment();
  }, [fetchNewsSentiment]);

  const formatTime = (timeString: string) => {
    // Format: "20250730T105500" → "Jul 30, 10:55 AM"
    const date = new Date(
      parseInt(timeString.substring(0, 4)), // year
      parseInt(timeString.substring(4, 6)) - 1, // month (0-indexed)
      parseInt(timeString.substring(6, 8)), // day
      parseInt(timeString.substring(9, 11)), // hour
      parseInt(timeString.substring(11, 13)) // minute
    );
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrencyFromTicker = (ticker: string) => {
    return ticker.replace('FOREX:', '');
  };

  const getImpactLevel = (relevanceScore: string) => {
    const score = parseFloat(relevanceScore);
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const filteredNews = newsItems.filter(item => {
    // Find the most relevant forex ticker for this news item
    const forexTicker = item.ticker_sentiment.find(t => t.ticker.startsWith('FOREX:'));
    if (!forexTicker) return false;

    const currency = getCurrencyFromTicker(forexTicker.ticker);
    const impact = getImpactLevel(forexTicker.relevance_score);

    const currencyMatch = currencyFilter === 'all' || currency === currencyFilter;
    const impactMatch = impactFilter === 'all' || impact === impactFilter;
    
    return currencyMatch && impactMatch;
  });

  const uniqueCurrencies = ['all', ...Array.from(
    new Set(
      newsItems
        .flatMap(item => 
          item.ticker_sentiment
            .filter(t => t.ticker.startsWith('FOREX:'))
            .map(t => getCurrencyFromTicker(t.ticker))
    )
  ))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Real-Time Forex News</CardTitle>
          <CardDescription>Stay updated with market-moving events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by currency" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCurrencies.map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency === 'all' ? 'All Currencies' : currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impacts</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading news...</div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item, index) => {
                const forexTicker = item.ticker_sentiment.find(t => t.ticker.startsWith('FOREX:'));
                const currency = forexTicker ? getCurrencyFromTicker(forexTicker.ticker) : 'USD';
                const impact = forexTicker ? getImpactLevel(forexTicker.relevance_score) : 'medium';
                
                return (
                  <a 
                    key={index} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="p-4 flex justify-between items-start hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.source} • {formatTime(item.time_published)}
                        </p>
                        {item.summary && (
                          <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                            {item.summary}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <Badge variant="secondary">{currency}</Badge>
                        <Badge
                          variant={
                            impact === 'high' ? 'destructive' :
                            impact === 'medium' ? 'secondary' :
                            'outline'
                          }
                        >
                          {impact}
                        </Badge>
                        <Badge variant="outline">
                          {item.overall_sentiment_label}
                        </Badge>
                      </div>
                    </Card>
                  </a>
                );
              })}
              {!loading && filteredNews.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No news items match your filters.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}