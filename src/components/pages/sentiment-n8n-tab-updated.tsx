"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  Building2,
  Globe,
  Clock,
  BarChart3,
  Target,
  Shield,
  Lightbulb
} from 'lucide-react';
import { RedditItem, SentimentData, NewsItem } from '@/types/sentiment';

// Error handling interfaces
enum ErrorType {
  SERVER_DOWN = 'SERVER_DOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface ErrorState {
  type: ErrorType;
  message: string;
  canRetry: boolean;
  details?: string;
}

const SentimentSignalBadge: React.FC<{ signal: string; size?: 'sm' | 'md' | 'lg' }> = ({ signal, size = 'md' }) => {
  const getSignalConfig = (signal: string) => {
    const normalizedSignal = signal.toLowerCase();
    switch (normalizedSignal) {
      case 'buy':
      case 'bullish':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
          label: signal
        };
      case 'sell':
      case 'bearish':
        return {
          icon: <TrendingDown className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
          label: signal
        };
      case 'neutral':
      default:
        return {
          icon: <Minus className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
          label: signal
        };
    }
  };

  const config = getSignalConfig(signal);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} border flex items-center gap-1 font-medium`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const ConfidenceMeter: React.FC<{ confidence: string; score?: number }> = ({ confidence, score }) => {
  const getConfidenceValue = (conf: string) => {
    switch (conf.toLowerCase()) {
      case 'high': return 85;
      case 'medium': return 60;
      case 'low': return 35;
      default: return score ? score * 100 : 50;
    }
  };

  const value = getConfidenceValue(confidence);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Confidence</span>
        <span className="text-sm text-muted-foreground">{confidence}</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
};

const ProbabilityCard: React.FC<{ 
  type: 'buy' | 'sell' | 'neutral'; 
  probability: string; 
}> = ({ type, probability }) => {
  const config = {
    buy: {
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-300',
      bgAccent: 'bg-green-100 dark:bg-green-900/20'
    },
    sell: {
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      bgAccent: 'bg-red-100 dark:bg-red-900/20'
    },
    neutral: {
      icon: <Minus className="w-5 h-5" />,
      color: 'border-gray-200 bg-gray-50 dark:bg-gray-900/10 dark:border-gray-700',
      textColor: 'text-gray-700 dark:text-gray-300',
      bgAccent: 'bg-gray-100 dark:bg-gray-900/20'
    }
  };

  const typeConfig = config[type];
  const numericValue = parseFloat(probability.replace('%', ''));

  return (
    <Card className={`${typeConfig.color} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${typeConfig.bgAccent}`}>
            <div className={typeConfig.textColor}>
              {typeConfig.icon}
            </div>
          </div>
          <div className={`text-2xl font-bold ${typeConfig.textColor}`}>
            {probability}
          </div>
        </div>
        <div className="text-sm font-medium capitalize mb-1">{type} Probability</div>
        <Progress 
          value={numericValue} 
          className="h-2"
        />
      </CardContent>
    </Card>
  );
};

const RedditPostCard: React.FC<{ item: RedditItem }> = ({ item }) => (
  <Card className="border-l-4 border-l-orange-400">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-sm leading-tight flex-1">{item.title}</h4>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>u/{item.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>r/{item.subreddit}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {item.text && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.text}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <ThumbsUp className="w-3 h-3" />
            <span>{item.upvotes}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <MessageSquare className="w-3 h-3" />
            <span>{item.comments}</span>
          </div>
          <div className="text-muted-foreground">
            <span>{Math.round(item.upvote_ratio * 100)}% upvoted</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NewsArticleCard: React.FC<{ item: NewsItem }> = ({ item }) => (
  <Card className="border-l-4 border-l-blue-400">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-sm leading-tight flex-1">{item.title}</h4>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{item.publisher}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(item.published).toLocaleDateString()}</span>
          </div>
        </div>

        {item.text && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {item.text}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

const ErrorDisplay: React.FC<{ error: ErrorState; onRetry: () => void }> = ({ error, onRetry }) => {
  const getErrorConfig = (type: ErrorType) => {
    switch (type) {
      case ErrorType.SERVER_DOWN:
        return { icon: '🔌', title: 'Server Not Running' };
      case ErrorType.NETWORK_ERROR:
        return { icon: '📡', title: 'Network Error' };
      case ErrorType.TIMEOUT:
        return { icon: '⏱️', title: 'Request Timeout' };
      case ErrorType.INVALID_RESPONSE:
        return { icon: '⚠️', title: 'Invalid Response' };
      default:
        return { icon: '❌', title: 'Unknown Error' };
    }
  };

  const config = getErrorConfig(error.type);

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-8 text-center">
        <div className="text-4xl mb-4">{config.icon}</div>
        <h3 className="text-lg font-semibold text-destructive mb-2">{config.title}</h3>
        <p className="text-destructive/80 mb-4">{error.message}</p>
        {error.details && (
          <p className="text-sm text-muted-foreground mb-6">{error.details}</p>
        )}
        {error.canRetry && (
          <Button onClick={onRetry} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const LoadingCard: React.FC = () => (
  <Card>
    <CardContent className="p-8 text-center">
      <div className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Analyzing market sentiment with local LLM...</p>
      <p className="text-sm text-muted-foreground mt-2">This may take a few minutes due to local AI processing</p>
    </CardContent>
  </Card>
);

const SentimentN8nTab: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("EURUSD");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const availableSymbols = useMemo(() => ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "NZDUSD"], []);

  // Debug logging
  useEffect(() => {
    console.log('🔍 SentimentN8nTab: Component mounted/updated');
    console.log('📊 Current state:', {
      sentimentData: sentimentData ? 'Present' : 'Null',
      selectedSymbol,
      loading,
      error: error ? error.message : 'None',
      lastUpdate: lastUpdate ? lastUpdate.toISOString() : 'None'
    });
  });

  useEffect(() => {
    console.log('🔄 SentimentN8nTab: Component mounted, initializing...');
    return () => {
      console.log('🔄 SentimentN8nTab: Component unmounting...');
    };
  }, []);

  useEffect(() => {
    console.log('📈 Selected symbol changed to:', selectedSymbol);
  }, [selectedSymbol]);

  const parseError = (err: unknown): ErrorState => {
    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED')) {
        return {
          type: ErrorType.SERVER_DOWN,
          message: 'The sentiment analysis server is not running.',
          details: 'Please make sure the Django backend server is started on localhost:8000',
          canRetry: true
        };
      }
      
      if (err.message.includes('timeout') || err.name === 'AbortError') {
        return {
          type: ErrorType.TIMEOUT,
          message: 'Request timed out.',
          details: 'The server took too long to respond. Please try again.',
          canRetry: true
        };
      }
      
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: err.message,
        canRetry: true
      };
    }
    
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: 'An unknown error occurred.',
      canRetry: true
    };
  };

  const fetchSentiment = async (symbol: string) => {
    console.log('🚀 fetchSentiment called with symbol:', symbol);
    console.log('📊 Current loading state:', loading);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🌐 Making API request to:', `/api/sentiment?symbol=${symbol}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for LLM processing
      
      const res = await fetch(`/api/sentiment?symbol=${symbol}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 API Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
          console.log('❌ Error response data:', errorData);
        } catch {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
        
        let errorType: ErrorType;
        switch (errorData.error) {
          case 'SERVER_DOWN':
            errorType = ErrorType.SERVER_DOWN;
            break;
          case 'NETWORK_ERROR':
            errorType = ErrorType.NETWORK_ERROR;
            break;
          case 'TIMEOUT':
            errorType = ErrorType.TIMEOUT;
            break;
          default:
            errorType = ErrorType.UNKNOWN_ERROR;
        }
        
        setError({
          type: errorType,
          message: errorData.message || 'Server error occurred',
          details: errorData.details,
          canRetry: true
        });
        return;
      }
      
      const data = await res.json();
      console.log('✅ API Response received successfully');
      console.log('📈 Sentiment data:', {
        symbol: data.symbol,
        signal: data.sentiment_analysis?.signal,
        totalItems: data.total_items,
        timestamp: data.timestamp
      });
      
      console.log('💾 Setting sentiment data to state...');
      setSentimentData(data);
      setLastUpdate(new Date());
      console.log('✅ State updated successfully');
      
    } catch (err: unknown) {
      console.log('❌ Error in fetchSentiment:', err);
      setError(parseError(err));
    } finally {
      console.log('🏁 fetchSentiment completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchSentiment(selectedSymbol);
  };

  const handleRetry = () => {
    console.log('🔄 Retry triggered');
    fetchSentiment(selectedSymbol);
  };

  useEffect(() => {
    console.log('🎯 useEffect triggered for selectedSymbol:', selectedSymbol);
    console.log('📊 Current state before effect:', {
      loading,
      error: error ? error.message : 'None',
      sentimentData: sentimentData ? 'Present' : 'Null'
    });

    const loadSentiment = async () => {
      console.log('🔄 loadSentiment function called');
      setLoading(true);
      setError(null);
      
      try {
        console.log('🌐 Making API request from useEffect to:', `/api/sentiment?symbol=${selectedSymbol}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for LLM processing
        
        const res = await fetch(`/api/sentiment?symbol=${selectedSymbol}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 useEffect API Response status:', res.status, res.statusText);
        
        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
            console.log('❌ useEffect Error response data:', errorData);
          } catch {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
          }
          
          let errorType: ErrorType;
          switch (errorData.error) {
            case 'SERVER_DOWN':
              errorType = ErrorType.SERVER_DOWN;
              break;
            case 'NETWORK_ERROR':
              errorType = ErrorType.NETWORK_ERROR;
              break;
            case 'TIMEOUT':
              errorType = ErrorType.TIMEOUT;
              break;
            default:
              errorType = ErrorType.UNKNOWN_ERROR;
          }
          
          setError({
            type: errorType,
            message: errorData.message || 'Server error occurred',
            details: errorData.details,
            canRetry: true
          });
          return;
        }
        
        const data = await res.json();
        console.log('✅ useEffect API Response received successfully');
        console.log('📈 useEffect Sentiment data:', {
          symbol: data.symbol,
          signal: data.sentiment_analysis?.signal,
          totalItems: data.total_items,
          timestamp: data.timestamp
        });
        
        console.log('💾 useEffect Setting sentiment data to state...');
        setSentimentData(data);
        setLastUpdate(new Date());
        console.log('✅ useEffect State updated successfully');
        
      } catch (err: unknown) {
        console.log('❌ useEffect Error in loadSentiment:', err);
        setError(parseError(err));
      } finally {
        console.log('🏁 useEffect loadSentiment completed, setting loading to false');
        setLoading(false);
      }
    };

    loadSentiment();
  }, [selectedSymbol]);

  // Add render debugging
  console.log('🎨 Rendering SentimentN8nTab with state:', {
    loading,
    error: error ? error.type : 'None',
    sentimentData: sentimentData ? 'Present' : 'Null',
    selectedSymbol
  });

  console.log('🔍 Render conditions:', {
    showLoading: loading,
    showError: error && !loading,
    showData: sentimentData && !loading && !error,
    showNoData: !sentimentData && !loading && !error
  });

  if (loading) {
    console.log('🔄 Showing LoadingCard');
    return <LoadingCard />;
  }

  if (error && !loading) {
    console.log('❌ Showing ErrorDisplay');
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  if (!sentimentData && !loading && !error) {
    console.log('⚠️ No data available - showing empty state');
  }

  console.log('✅ Showing sentiment data interface');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Sentiment Analysis</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {lastUpdate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        
          <div className="flex items-center gap-3">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              disabled={loading}
              className="px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {availableSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            
            <Button 
              onClick={handleRefresh} 
              disabled={loading}
              variant="outline"
              size="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {!sentimentData && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No sentiment data available. Click refresh to load data.</p>
          </div>
        )}

        {sentimentData && !loading && !error && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <ProbabilityCard 
                type="buy" 
                probability={sentimentData.sentiment_analysis.buy_probability}
              />
              <ProbabilityCard 
                type="sell" 
                probability={sentimentData.sentiment_analysis.sell_probability}
              />
              {sentimentData.sentiment_analysis.neutral_probability !== "0%" && (
                <ProbabilityCard 
                  type="neutral" 
                  probability={sentimentData.sentiment_analysis.neutral_probability}
                />
              )}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <SentimentSignalBadge signal={sentimentData.sentiment_analysis.signal} size="sm" />
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Overall Signal</div>
                      <ConfidenceMeter 
                        confidence={sentimentData.sentiment_analysis.confidence}
                        score={sentimentData.sentiment_analysis.sentiment_score}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Sentiment Analysis for {sentimentData.symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      Risk Level
                    </div>
                    <Badge variant="outline">{sentimentData.sentiment_analysis.risk_level}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Timeframe
                    </div>
                    <Badge variant="outline">{sentimentData.sentiment_analysis.timeframe}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BarChart3 className="w-4 h-4" />
                      Sources Analyzed
                    </div>
                    <Badge variant="outline">{sentimentData.sentiment_analysis.sources_analyzed} sources</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Analysis Rationale</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {sentimentData.sentiment_analysis.rationale}
                  </p>
                </div>

                {sentimentData.sentiment_analysis.key_insights.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Key Insights
                      </h4>
                      <ul className="space-y-2">
                        {sentimentData.sentiment_analysis.key_insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm text-muted-foreground">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Component Analysis */}
            {sentimentData.sentiment_analysis.component_analyses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Source Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentimentData.sentiment_analysis.component_analyses.map((component, idx) => (
                      <Card key={idx} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium capitalize">{component.source_type}</h5>
                            <SentimentSignalBadge signal={component.signal} size="sm" />
                          </div>
                          <div className="space-y-2">
                            <ConfidenceMeter confidence={component.confidence} score={component.sentiment_score} />
                            <div className="text-xs text-muted-foreground">
                              Score: {component.sentiment_score.toFixed(2)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Keywords</h5>
                    <div className="flex flex-wrap gap-2">
                      {sentimentData.metadata.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Communities</h5>
                    <div className="flex flex-wrap gap-2">
                      {sentimentData.metadata.subs.map((sub, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          r/{sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Category:</span> {sentimentData.metadata.category} | 
                  <span className="font-medium ml-2">Regions:</span> {sentimentData.metadata.regions.join(", ")} | 
                  <span className="font-medium ml-2">Note:</span> {sentimentData.metadata.note}
                </div>
              </CardContent>
            </Card>

            {/* Reddit Posts */}
            {sentimentData.sources.reddit.enabled && sentimentData.sources.reddit.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Reddit Discussion ({sentimentData.sources.reddit.items_found} posts)</span>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Reddit
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentimentData.sources.reddit.items.slice(0, 6).map((item, idx) => (
                      <RedditPostCard key={idx} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* News Articles */}
            {sentimentData.sources.news.enabled && sentimentData.sources.news.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Latest News ({sentimentData.sources.news.items_found} articles)</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      News
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentimentData.sources.news.items.slice(0, 6).map((item, idx) => (
                      <NewsArticleCard key={idx} item={item} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentN8nTab;
