export interface RedditItem {
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

export interface NewsItem {
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

export interface ComponentAnalysis {
  source_type: 'reddit' | 'news' | string;
  signal: 'Buy' | 'Sell' | 'Neutral' | string;
  confidence: 'Low' | 'Medium' | 'High' | string;
  sentiment_score: number;
}

export interface SentimentAnalysis {
  symbol: string;
  signal: 'Buy' | 'Sell' | 'Neutral' | string;
  confidence: 'Low' | 'Medium' | 'High' | string;
  sentiment_score: number;
  buy_probability: string; // e.g., "50%"
  sell_probability: string; // e.g., "50%"
  neutral_probability: string; // e.g., "0%"
  rationale: string;
  key_insights: string[];
  risk_level: 'Low' | 'Medium' | 'High' | string;
  timeframe: 'Short-term' | 'Medium-term' | 'Long-term' | string;
  sources_analyzed: number;
  source_types: ('reddit' | 'news')[];
  analysis_timestamp: string; // ISO string format
  component_analyses: ComponentAnalysis[];
}

export interface SentimentData {
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
  timestamp: string; // ISO string format
  sentiment_analysis: SentimentAnalysis;
}
