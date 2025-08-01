export interface CandlestickPattern {
  name: string;
  type: string;
  description: string;
  strategy: string;
  benefit: string;
  image: string;
}

export interface Strategy {
  name: string;
  type: string;
  define: string;
  description: string;
  strategy: string;
  benefit: string;
  image: string;
}

export interface Indicator {
  name: string;
  type?: string;
  description: string;
  strategy: string;
  benefit: string;
  image: string;
}

export interface CandleStickPatterns {
  define: string;
  Bullish: CandlestickPattern[];
  Bearish: CandlestickPattern[];
  Neutral: CandlestickPattern[];
}

export interface ChartPatterns {
  define: string;
  Bullish: CandlestickPattern[];
  Bearish: CandlestickPattern[];
  Neutral: CandlestickPattern[];
}

export interface TrendIndicators {
  define: string;
  indicators: Indicator[];
}

export interface MomentumIndicators {
  define: string;
  indicators: Indicator[];
  VolumeIndicators: Indicator[];
}

export interface VolatilityIndicators {
  define: string;
  indicators: Indicator[];
}

export interface TradingTools {
  define: string;
  tools: CandlestickPattern[];
}

export interface PriceAction {
  define: string;
  Bullish: CandlestickPattern[];
  Bearish: CandlestickPattern[];
  Neutral: CandlestickPattern[];
}

export interface TradingStrategies {
  define: string;
  Strategies: Strategy[];
}

export interface RiskPsychology {
  define: string;
  Psychology: Indicator[];
}

export interface FundamentalAnalysis {
  define: string;
  EconomicIndicators: Indicator[];
}

export interface EducationGuides {
  TechnicalAnalysis: {
    CandleStickPatterns: CandleStickPatterns;
    ChartPatterns: ChartPatterns;
    TrendIndicators: TrendIndicators;
    MomentumIndicators: MomentumIndicators;
    VolatilityIndicators: VolatilityIndicators;
    TradingTools: TradingTools;
  };
  PriceAction: PriceAction;
  TradingStrategies: TradingStrategies;
  RiskPsychology: RiskPsychology;
  FundamentalAnalysis: FundamentalAnalysis;
}