//Data Points

  export interface DataPoint {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }


// Trading Strategy Types
export interface Indicator {
  name: string;
  value: string;
  status: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export interface Confirmation {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  target?: string;
}

export interface CandlestickPattern {
  name: string;
  type: 'reversal' | 'continuation';
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
  confidence: number; // 0-100
  timeframe: string;
  description: string;
  isForming: boolean; // true if pattern is still forming
  completedBars: number; // how many bars the pattern spans
}

export interface ChartPattern {
  name: string;
  type: 'continuation' | 'reversal';
  direction: 'bullish' | 'bearish';
  strength: 'weak' | 'moderate' | 'strong';
  confidence: number; // 0-100
  timeframe: string;
  targetPrice?: string;
  keyLevels: {
    support?: string;
    resistance?: string;
    breakoutLevel?: string;
  };
  patternStatus: 'forming' | 'completed' | 'broken';
  estimatedCompletion: string; // e.g., "2-3 bars", "Near completion"
}

export interface PairAnalysis {
  pair: string;
  signal: 'buy' | 'sell' | 'wait';
  strength: number;
  indicators: Indicator[];
  confirmations: Confirmation[];
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  lastSignal: string;
  currentPrice: string;
  candlestickPattern?: CandlestickPattern;
  chartPattern?: ChartPattern;
  patternConfluence: {
    score: number; // 0-100, higher when patterns align
    description: string;
  };
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  successRate: number;
  availablePairs: PairAnalysis[];
}