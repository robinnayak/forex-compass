"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  Zap,
  Settings,
  Camera,
  Download,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Eye,
  ChevronDown,
  DollarSign
} from 'lucide-react';

// Trading Strategy Types
interface CurrencyPair {
  symbol: string;
  name: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  session: string;
}

interface Indicator {
  name: string;
  value: string;
  status: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

interface Confirmation {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  target?: string;
}

interface PairAnalysis {
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
}

interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  successRate: number;
  availablePairs: PairAnalysis[];
}

// Available currency pairs
const currencyPairs: CurrencyPair[] = [
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    currentPrice: '1.18436',
    change: '+0.00156',
    changePercent: '+0.13%',
    isPositive: true,
    session: 'London'
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    currentPrice: '1.31245',
    change: '-0.00087',
    changePercent: '-0.07%',
    isPositive: false,
    session: 'London'
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    currentPrice: '149.856',
    change: '+0.234',
    changePercent: '+0.16%',
    isPositive: true,
    session: 'Asian'
  },
  {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / US Dollar',
    currentPrice: '0.67823',
    change: '+0.00145',
    changePercent: '+0.21%',
    isPositive: true,
    session: 'Sydney'
  },
  {
    symbol: 'USDCAD',
    name: 'US Dollar / Canadian Dollar',
    currentPrice: '1.35678',
    change: '-0.00234',
    changePercent: '-0.17%',
    isPositive: false,
    session: 'New York'
  }
];

// Mock data for trading strategies
const tradingStrategies: TradingStrategy[] = [
  {
    id: '1',
    name: 'Bollinger Bands Breakout',
    description: 'Price breakout above upper Bollinger Band with volume confirmation',
    timeframe: '15M',
    riskLevel: 'medium',
    successRate: 73,
    availablePairs: [
      {
        pair: 'EURUSD',
        signal: 'buy',
        strength: 85,
        currentPrice: '1.18436',
        entryPrice: '1.1843',
        targetPrice: '1.1865',
        stopLoss: '1.1820',
        lastSignal: '2 min ago',
        indicators: [
          { name: 'Bollinger Upper', value: '1.1845', status: 'bullish', confidence: 85 },
          { name: 'Volume', value: '125%', status: 'bullish', confidence: 78 },
          { name: 'RSI', value: '72.5', status: 'bullish', confidence: 65 },
          { name: 'MACD', value: '+0.0023', status: 'bullish', confidence: 82 }
        ],
        confirmations: [
          { id: '1', name: 'Price Above BB Upper', status: 'confirmed', timestamp: '10:45:23', target: '1.1850' },
          { id: '2', name: 'Volume Spike', status: 'confirmed', timestamp: '10:45:25', target: '120%+' },
          { id: '3', name: 'RSI Momentum', status: 'confirmed', timestamp: '10:45:30', target: '>70' },
          { id: '4', name: 'MACD Crossover', status: 'pending', timestamp: 'waiting...' }
        ]
      },
      {
        pair: 'GBPUSD',
        signal: 'wait',
        strength: 45,
        currentPrice: '1.31245',
        entryPrice: '1.3130',
        targetPrice: '1.3155',
        stopLoss: '1.3110',
        lastSignal: '15 min ago',
        indicators: [
          { name: 'Bollinger Upper', value: '1.3125', status: 'neutral', confidence: 55 },
          { name: 'Volume', value: '85%', status: 'neutral', confidence: 48 },
          { name: 'RSI', value: '58.2', status: 'neutral', confidence: 52 },
          { name: 'MACD', value: '-0.0011', status: 'bearish', confidence: 45 }
        ],
        confirmations: [
          { id: '1', name: 'Price Above BB Upper', status: 'pending', timestamp: 'waiting...' },
          { id: '2', name: 'Volume Spike', status: 'pending', timestamp: 'waiting...' },
          { id: '3', name: 'RSI Momentum', status: 'failed', timestamp: '10:30:15', target: '>70' },
          { id: '4', name: 'MACD Crossover', status: 'pending', timestamp: 'waiting...' }
        ]
      },
      {
        pair: 'USDJPY',
        signal: 'sell',
        strength: 72,
        currentPrice: '149.856',
        entryPrice: '149.80',
        targetPrice: '149.45',
        stopLoss: '150.15',
        lastSignal: '8 min ago',
        indicators: [
          { name: 'Bollinger Upper', value: '149.95', status: 'bearish', confidence: 78 },
          { name: 'Volume', value: '110%', status: 'bullish', confidence: 71 },
          { name: 'RSI', value: '75.8', status: 'bearish', confidence: 82 },
          { name: 'MACD', value: '+0.145', status: 'bearish', confidence: 68 }
        ],
        confirmations: [
          { id: '1', name: 'Price Above BB Upper', status: 'confirmed', timestamp: '10:42:18', target: '149.95' },
          { id: '2', name: 'Volume Spike', status: 'confirmed', timestamp: '10:42:22', target: '110%+' },
          { id: '3', name: 'RSI Overbought', status: 'confirmed', timestamp: '10:42:28', target: '>75' },
          { id: '4', name: 'MACD Divergence', status: 'pending', timestamp: 'forming...' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'RSI Scalping Strategy',
    description: 'Oversold RSI with divergence pattern for quick scalp trades',
    timeframe: '5M',
    riskLevel: 'low',
    successRate: 81,
    availablePairs: [
      {
        pair: 'GBPUSD',
        signal: 'buy',
        strength: 92,
        currentPrice: '1.31245',
        entryPrice: '1.3125',
        targetPrice: '1.3140',
        stopLoss: '1.3115',
        lastSignal: '1 min ago',
        indicators: [
          { name: 'RSI', value: '25.3', status: 'bullish', confidence: 95 },
          { name: 'Stochastic', value: '12.8', status: 'bullish', confidence: 92 },
          { name: 'Price Action', value: 'Hammer', status: 'bullish', confidence: 88 },
          { name: 'Support Level', value: '1.3120', status: 'bullish', confidence: 85 }
        ],
        confirmations: [
          { id: '1', name: 'RSI Oversold', status: 'confirmed', timestamp: '10:47:15', target: '<30' },
          { id: '2', name: 'Bullish Divergence', status: 'confirmed', timestamp: '10:47:20', target: 'Confirmed' },
          { id: '3', name: 'Support Hold', status: 'confirmed', timestamp: '10:47:25', target: '1.3120' },
          { id: '4', name: 'Volume Increase', status: 'confirmed', timestamp: '10:47:28', target: '115%+' }
        ]
      },
      {
        pair: 'AUDUSD',
        signal: 'buy',
        strength: 76,
        currentPrice: '0.67823',
        entryPrice: '0.6785',
        targetPrice: '0.6795',
        stopLoss: '0.6775',
        lastSignal: '5 min ago',
        indicators: [
          { name: 'RSI', value: '28.9', status: 'bullish', confidence: 88 },
          { name: 'Stochastic', value: '18.2', status: 'bullish', confidence: 82 },
          { name: 'Price Action', value: 'Doji', status: 'neutral', confidence: 65 },
          { name: 'Support Level', value: '0.6780', status: 'bullish', confidence: 78 }
        ],
        confirmations: [
          { id: '1', name: 'RSI Oversold', status: 'confirmed', timestamp: '10:43:10', target: '<30' },
          { id: '2', name: 'Bullish Divergence', status: 'pending', timestamp: 'forming...' },
          { id: '3', name: 'Support Hold', status: 'confirmed', timestamp: '10:43:25', target: '0.6780' },
          { id: '4', name: 'Volume Increase', status: 'pending', timestamp: 'monitoring...' }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Moving Average Crossover',
    description: 'Golden cross formation with 50 EMA crossing above 200 EMA',
    timeframe: '1H',
    riskLevel: 'medium',
    successRate: 68,
    availablePairs: [
      {
        pair: 'EURUSD',
        signal: 'buy',
        strength: 68,
        currentPrice: '1.18436',
        entryPrice: '1.1845',
        targetPrice: '1.1875',
        stopLoss: '1.1825',
        lastSignal: '25 min ago',
        indicators: [
          { name: 'EMA 50', value: '1.1842', status: 'bullish', confidence: 72 },
          { name: 'EMA 200', value: '1.1838', status: 'bullish', confidence: 68 },
          { name: 'Price vs EMA', value: '+8 pips', status: 'bullish', confidence: 65 },
          { name: 'Trend Strength', value: 'Moderate', status: 'bullish', confidence: 70 }
        ],
        confirmations: [
          { id: '1', name: 'Golden Cross', status: 'confirmed', timestamp: '09:45:00', target: 'EMA50>EMA200' },
          { id: '2', name: 'Price Above EMAs', status: 'confirmed', timestamp: '09:47:15', target: 'Above both' },
          { id: '3', name: 'Volume Confirmation', status: 'pending', timestamp: 'waiting...' },
          { id: '4', name: 'Trend Continuation', status: 'pending', timestamp: 'monitoring...' }
        ]
      },
      {
        pair: 'USDJPY',
        signal: 'buy',
        strength: 85,
        currentPrice: '149.856',
        entryPrice: '149.80',
        targetPrice: '150.25',
        stopLoss: '149.45',
        lastSignal: '12 min ago',
        indicators: [
          { name: 'EMA 50', value: '149.75', status: 'bullish', confidence: 88 },
          { name: 'EMA 200', value: '149.45', status: 'bullish', confidence: 85 },
          { name: 'Price vs EMA', value: '+18 pips', status: 'bullish', confidence: 92 },
          { name: 'Trend Strength', value: 'Strong', status: 'bullish', confidence: 89 }
        ],
        confirmations: [
          { id: '1', name: 'Golden Cross', status: 'confirmed', timestamp: '08:30:00', target: 'EMA50>EMA200' },
          { id: '2', name: 'Price Above EMAs', status: 'confirmed', timestamp: '08:32:15', target: 'Above both' },
          { id: '3', name: 'Volume Confirmation', status: 'confirmed', timestamp: '08:35:22', target: '125%+' },
          { id: '4', name: 'Trend Continuation', status: 'confirmed', timestamp: '08:40:10', target: 'Sustained' }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Fibonacci Retracement',
    description: 'Price bouncing from 61.8% Fibonacci level with confluence',
    timeframe: '30M',
    riskLevel: 'high',
    successRate: 75,
    availablePairs: [
      {
        pair: 'AUDUSD',
        signal: 'wait',
        strength: 45,
        currentPrice: '0.67823',
        entryPrice: '0.6785',
        targetPrice: '0.6805',
        stopLoss: '0.6765',
        lastSignal: '35 min ago',
        indicators: [
          { name: 'Fib 61.8%', value: '0.6782', status: 'bullish', confidence: 85 },
          { name: 'Price Action', value: 'Doji', status: 'neutral', confidence: 55 },
          { name: 'Support Zone', value: '0.6780-85', status: 'bullish', confidence: 72 },
          { name: 'Momentum', value: 'Slowing', status: 'neutral', confidence: 48 }
        ],
        confirmations: [
          { id: '1', name: 'Fib Level Hold', status: 'confirmed', timestamp: '10:15:30', target: '61.8%' },
          { id: '2', name: 'Confluence Zone', status: 'confirmed', timestamp: '10:16:00', target: 'Multiple levels' },
          { id: '3', name: 'Reversal Pattern', status: 'pending', timestamp: 'forming...' },
          { id: '4', name: 'Volume Spike', status: 'pending', timestamp: 'waiting...' }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Momentum Breakout',
    description: 'High momentum breakout with ADX and volume confirmation',
    timeframe: '15M',
    riskLevel: 'high',
    successRate: 62,
    availablePairs: [
      {
        pair: 'USDCAD',
        signal: 'wait',
        strength: 35,
        currentPrice: '1.35678',
        entryPrice: '1.3570',
        targetPrice: '1.3595',
        stopLoss: '1.3550',
        lastSignal: '18 min ago',
        indicators: [
          { name: 'ADX', value: '42.8', status: 'bullish', confidence: 88 },
          { name: 'ATR', value: '0.0042', status: 'bullish', confidence: 75 },
          { name: 'Breakout Level', value: '1.3575', status: 'bearish', confidence: 45 },
          { name: 'Volume Profile', value: 'Low', status: 'bearish', confidence: 42 }
        ],
        confirmations: [
          { id: '1', name: 'ADX > 40', status: 'confirmed', timestamp: '10:30:10', target: '40+' },
          { id: '2', name: 'High Volatility', status: 'confirmed', timestamp: '10:30:15', target: 'ATR expanding' },
          { id: '3', name: 'Resistance Break', status: 'failed', timestamp: '10:35:00', target: '1.3575' },
          { id: '4', name: 'Volume Follow-through', status: 'pending', timestamp: 'monitoring...' }
        ]
      }
    ]
  }
];

const TechnicalBot = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(tradingStrategies[0].id);
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [isLive, setIsLive] = useState(true);

  const currentStrategy = tradingStrategies.find(s => s.id === selectedStrategy) || tradingStrategies[0];
  const currentPairAnalysis = selectedPair 
    ? currentStrategy.availablePairs.find(p => p.pair === selectedPair)
    : null;

  // Helper to get overall strategy stats
  const getStrategyOverallStats = (strategy: TradingStrategy) => {
    const signals = strategy.availablePairs.map(p => p.signal);
    const buySignals = signals.filter(s => s === 'buy').length;
    const sellSignals = signals.filter(s => s === 'sell').length;
    const waitSignals = signals.filter(s => s === 'wait').length;
    const avgStrength = Math.round(strategy.availablePairs.reduce((acc, p) => acc + p.strength, 0) / strategy.availablePairs.length);
    
    return {
      totalPairs: strategy.availablePairs.length,
      buySignals,
      sellSignals,
      waitSignals,
      avgStrength,
      dominantSignal: buySignals > sellSignals && buySignals > waitSignals ? 'buy' 
                     : sellSignals > buySignals && sellSignals > waitSignals ? 'sell' 
                     : 'wait'
    };
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-600 bg-green-50 border-green-200';
      case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      case 'wait': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="w-4 h-4" />;
      case 'sell': return <TrendingDown className="w-4 h-4" />;
      case 'wait': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getIndicatorStatus = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConfirmationIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technical Analysis Bot</h1>
            <p className="text-muted-foreground mt-2">
              Real-time trading signals with multi-indicator confirmation
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsLive(!isLive)}
              variant={isLive ? "default" : "outline"}
              size="default"
            >
              {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isLive ? 'Live' : 'Paused'}
            </Button>
            
            <Button variant="outline" size="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="default">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Strategy Overview */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Current Strategy Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{currentStrategy.name}</h2>
                    <p className="text-muted-foreground">{currentStrategy.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {currentStrategy.timeframe} • {currentStrategy.riskLevel} Risk
                  </Badge>
                </div>
                
                <div className="flex items-baseline gap-4">
                  <span className="text-lg text-muted-foreground">Available Pairs:</span>
                  <span className="text-2xl font-bold">{getStrategyOverallStats(currentStrategy).totalPairs}</span>
                  <div className="flex gap-2">
                    {getStrategyOverallStats(currentStrategy).buySignals > 0 && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        {getStrategyOverallStats(currentStrategy).buySignals} BUY
                      </Badge>
                    )}
                    {getStrategyOverallStats(currentStrategy).sellSignals > 0 && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                        {getStrategyOverallStats(currentStrategy).sellSignals} SELL
                      </Badge>
                    )}
                    {getStrategyOverallStats(currentStrategy).waitSignals > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                        {getStrategyOverallStats(currentStrategy).waitSignals} WAIT
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Strategy Stats */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Strategy Performance</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold">{currentStrategy.successRate}%</span>
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg Strength: {getStrategyOverallStats(currentStrategy).avgStrength}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Pairs for Selected Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Available Pairs for {currentStrategy.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentStrategy.availablePairs.map((pairAnalysis) => (
                <Card
                  key={pairAnalysis.pair}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedPair === pairAnalysis.pair
                      ? 'ring-2 ring-primary border-primary bg-primary/5'
                      : 'hover:shadow-md hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPair(pairAnalysis.pair)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{pairAnalysis.pair}</h3>
                          <p className="text-sm text-muted-foreground">{pairAnalysis.currentPrice}</p>
                          <p className="text-xs text-muted-foreground">{pairAnalysis.lastSignal}</p>
                        </div>
                        <Badge className={`${getSignalColor(pairAnalysis.signal)} border text-xs`}>
                          {getSignalIcon(pairAnalysis.signal)}
                          <span className="ml-1">{pairAnalysis.signal.toUpperCase()}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Signal Strength:</span>
                          <span className="font-medium">{pairAnalysis.strength}%</span>
                        </div>
                        <Progress value={pairAnalysis.strength} className="h-1" />
                        
                        {pairAnalysis.signal !== 'wait' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Entry:</span>
                              <span className="font-medium">{pairAnalysis.entryPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Target:</span>
                              <span className="font-medium text-green-600">{pairAnalysis.targetPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Stop Loss:</span>
                              <span className="font-medium text-red-600">{pairAnalysis.stopLoss}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Strategy Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Trading Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {tradingStrategies.map((strategy) => {
                const stats = getStrategyOverallStats(strategy);
                return (
                  <Card
                    key={strategy.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedStrategy === strategy.id
                        ? 'ring-2 ring-primary border-primary bg-primary/5'
                        : 'hover:shadow-md hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedStrategy(strategy.id);
                      setSelectedPair(''); // Reset pair selection when changing strategy
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-sm leading-tight">{strategy.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {strategy.availablePairs.length} Pairs
                              </Badge>
                              <span className="text-xs text-muted-foreground">{strategy.timeframe}</span>
                            </div>
                          </div>
                          <Badge className={`${getSignalColor(stats.dominantSignal)} border text-xs`}>
                            {getSignalIcon(stats.dominantSignal)}
                            <span className="ml-1">{stats.dominantSignal.toUpperCase()}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Strength:</span>
                            <span className="font-medium">{stats.avgStrength}%</span>
                          </div>
                          <Progress value={stats.avgStrength} className="h-1" />
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="font-medium">{strategy.successRate}%</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk:</span>
                            <Badge variant="outline" className={`${getRiskColor(strategy.riskLevel)} text-xs`}>
                              {strategy.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPair && currentPairAnalysis ? (
              <>
                {/* Selected Pair Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{currentPairAnalysis.pair}</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                              {currentStrategy.name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-normal">
                            {currentStrategy.timeframe} • Price: {currentPairAnalysis.currentPrice}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getSignalColor(currentPairAnalysis.signal)} border`}>
                        {getSignalIcon(currentPairAnalysis.signal)}
                        <span className="ml-1">{currentPairAnalysis.signal.toUpperCase()}</span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-muted-foreground mb-4">{currentStrategy.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Timeframe</p>
                          <p className="font-semibold">{currentStrategy.timeframe}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Signal Strength</p>
                          <p className="font-semibold">{currentPairAnalysis.strength}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="font-semibold">{currentStrategy.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Signal</p>
                          <p className="font-semibold">{currentPairAnalysis.lastSignal}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Trade Levels */}
                    {currentPairAnalysis.signal !== 'wait' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Entry Price</p>
                          <p className="text-lg font-bold text-blue-700">{currentPairAnalysis.entryPrice}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Target Price</p>
                          <p className="text-lg font-bold text-green-700">{currentPairAnalysis.targetPrice}</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600 font-medium">Stop Loss</p>
                          <p className="text-lg font-bold text-red-700">{currentPairAnalysis.stopLoss}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Technical Indicators for {currentPairAnalysis.pair}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPairAnalysis.indicators.map((indicator, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{indicator.name}</h4>
                            <span className={`text-sm font-medium ${getIndicatorStatus(indicator.status)}`}>
                              {indicator.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-bold">{indicator.value}</span>
                            <span className="text-sm text-muted-foreground">{indicator.confidence}%</span>
                          </div>
                          <Progress value={indicator.confidence} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Confirmations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Signal Confirmations for {currentPairAnalysis.pair}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentPairAnalysis.confirmations.map((confirmation) => (
                        <div key={confirmation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getConfirmationIcon(confirmation.status)}
                            <div>
                              <p className="font-medium">{confirmation.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {confirmation.target && `Target: ${confirmation.target}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={confirmation.status === 'confirmed' ? 'default' : 'outline'}
                              className={
                                confirmation.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : confirmation.status === 'failed'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }
                            >
                              {confirmation.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{confirmation.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* No Pair Selected */
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Currency Pair</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a currency pair from the available options above to see detailed analysis, 
                    entry/exit points, and signal confirmations for the {currentStrategy.name} strategy.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentStrategy.availablePairs.map((pair) => (
                      <Button
                        key={pair.pair}
                        variant="outline"
                        onClick={() => setSelectedPair(pair.pair)}
                        className="min-w-[100px]"
                      >
                        {pair.pair}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chart Snapshot Area */}
          <div className="space-y-6">
            {/* Live Chart Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Chart Snapshot
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Live Chart</p>
                    {selectedPair && currentPairAnalysis ? (
                      <>
                        <p className="text-lg font-bold text-blue-600">{currentPairAnalysis.pair}</p>
                        <p className="text-xs text-gray-400">{currentStrategy.timeframe} • {currentStrategy.name}</p>
                        <div className="mt-3 space-y-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Chart
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Strategy: {currentPairAnalysis.signal.toUpperCase()} Signal
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-gray-600">Select Pair</p>
                        <p className="text-xs text-gray-400">{currentStrategy.timeframe} • {currentStrategy.name}</p>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="w-full" disabled>
                            <Eye className="w-4 h-4 mr-2" />
                            Select a pair first
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">12</p>
                    <p className="text-sm text-green-600">Successful Signals</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">18</p>
                    <p className="text-sm text-blue-600">Total Signals</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Win Rate</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg. Profit</span>
                    <span className="font-medium text-green-600">+24 pips</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Loss</span>
                    <span className="font-medium text-red-600">-12 pips</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Risk/Reward</span>
                    <span className="font-medium">1:2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Market Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Market Session</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    London Open
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Volatility</span>
                  <span className="text-sm font-medium">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trend</span>
                  <span className="text-sm font-medium text-green-600">Bullish</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">News Impact</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Medium
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalBot;