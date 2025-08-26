export type NewsItem = {
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