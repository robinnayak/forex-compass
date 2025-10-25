import { TradingStrategy } from "@/types/technical";

export const tradingStrategies: TradingStrategy[] = [
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
        ],
        candlestickPattern: {
          name: 'Bullish Engulfing',
          type: 'reversal',
          direction: 'bullish',
          strength: 'strong',
          confidence: 88,
          timeframe: '15M',
          description: 'Large bullish candle completely engulfs previous bearish candle',
          isForming: false,
          completedBars: 2
        },
        chartPattern: {
          name: 'Ascending Triangle',
          type: 'continuation',
          direction: 'bullish',
          strength: 'moderate',
          confidence: 75,
          timeframe: '15M',
          targetPrice: '1.1875',
          keyLevels: {
            support: '1.1835',
            resistance: '1.1850',
            breakoutLevel: '1.1851'
          },
          patternStatus: 'forming',
          estimatedCompletion: '2-3 bars'
        },
        patternConfluence: {
          score: 82,
          description: 'Strong bullish confluence: Engulfing pattern aligns with ascending triangle breakout'
        }
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
        ],
        candlestickPattern: {
          name: 'Doji',
          type: 'reversal',
          direction: 'neutral',
          strength: 'moderate',
          confidence: 65,
          timeframe: '15M',
          description: 'Indecision candle showing market uncertainty',
          isForming: true,
          completedBars: 1
        },
        chartPattern: {
          name: 'Rectangle',
          type: 'continuation',
          direction: 'bearish',
          strength: 'weak',
          confidence: 45,
          timeframe: '15M',
          keyLevels: {
            support: '1.3115',
            resistance: '1.3135',
            breakoutLevel: '1.3136'
          },
          patternStatus: 'forming',
          estimatedCompletion: '5-7 bars'
        },
        patternConfluence: {
          score: 45,
          description: 'Neutral confluence: Doji pattern within rectangle consolidation suggests continued indecision'
        }
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
        ],
        candlestickPattern: {
          name: 'Shooting Star',
          type: 'reversal',
          direction: 'bearish',
          strength: 'strong',
          confidence: 78,
          timeframe: '15M',
          description: 'Bearish reversal pattern at resistance level with long upper shadow',
          isForming: false,
          completedBars: 1
        },
        chartPattern: {
          name: 'Double Top',
          type: 'reversal',
          direction: 'bearish',
          strength: 'strong',
          confidence: 75,
          timeframe: '1H',
          keyLevels: {
            support: '149.20',
            resistance: '150.00',
            breakoutLevel: '149.15'
          },
          patternStatus: 'forming',
          estimatedCompletion: '2-3 bars'
        },
        patternConfluence: {
          score: 78,
          description: 'Strong bearish confluence: Shooting Star at double top resistance with RSI overbought'
        }
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
        ],
        candlestickPattern: {
          name: 'Hammer',
          type: 'reversal',
          direction: 'bullish',
          strength: 'strong',
          confidence: 88,
          timeframe: '5M',
          description: 'Strong bullish hammer at support with RSI oversold confirmation',
          isForming: false,
          completedBars: 1
        },
        chartPattern: {
          name: 'Inverse Head and Shoulders',
          type: 'reversal',
          direction: 'bullish',
          strength: 'strong',
          confidence: 85,
          timeframe: '15M',
          keyLevels: {
            support: '1.3110',
            resistance: '1.3145',
            breakoutLevel: '1.3146'
          },
          patternStatus: 'forming',
          estimatedCompletion: '3-5 bars'
        },
        patternConfluence: {
          score: 92,
          description: 'Very strong bullish confluence: Hammer pattern completing inverse H&S with RSI oversold divergence'
        }
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
        ],
        candlestickPattern: {
          name: 'Dragonfly Doji',
          type: 'reversal',
          direction: 'bullish',
          strength: 'moderate',
          confidence: 72,
          timeframe: '5M',
          description: 'Bullish dragonfly doji at support level with RSI oversold',
          isForming: true,
          completedBars: 1
        },
        chartPattern: {
          name: 'Falling Wedge',
          type: 'reversal',
          direction: 'bullish',
          strength: 'moderate',
          confidence: 68,
          timeframe: '30M',
          keyLevels: {
            support: '0.6775',
            resistance: '0.6795',
            breakoutLevel: '0.6796'
          },
          patternStatus: 'forming',
          estimatedCompletion: '8-10 bars'
        },
        patternConfluence: {
          score: 76,
          description: 'Good bullish confluence: Dragonfly doji within falling wedge pattern with RSI oversold'
        }
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
        ],
        candlestickPattern: {
          name: 'Morning Star',
          type: 'reversal',
          direction: 'bullish',
          strength: 'moderate',
          confidence: 70,
          timeframe: '1H',
          description: 'Three-bar bullish reversal pattern completing near EMA support',
          isForming: false,
          completedBars: 3
        },
        chartPattern: {
          name: 'Cup and Handle',
          type: 'continuation',
          direction: 'bullish',
          strength: 'moderate',
          confidence: 65,
          timeframe: '4H',
          keyLevels: {
            support: '1.1825',
            resistance: '1.1875',
            breakoutLevel: '1.1876'
          },
          patternStatus: 'forming',
          estimatedCompletion: '12-15 bars'
        },
        patternConfluence: {
          score: 68,
          description: 'Moderate bullish confluence: Morning star pattern within cup and handle formation above golden cross'
        }
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
        ],
        candlestickPattern: {
          name: 'Bullish Marubozu',
          type: 'continuation',
          direction: 'bullish',
          strength: 'strong',
          confidence: 85,
          timeframe: '1H',
          description: 'Strong bullish marubozu confirming uptrend continuation above EMAs',
          isForming: false,
          completedBars: 1
        },
        chartPattern: {
          name: 'Ascending Channel',
          type: 'continuation',
          direction: 'bullish',
          strength: 'strong',
          confidence: 82,
          timeframe: '4H',
          keyLevels: {
            support: '149.45',
            resistance: '150.50',
            breakoutLevel: '150.55'
          },
          patternStatus: 'forming',
          estimatedCompletion: 'Ongoing trend'
        },
        patternConfluence: {
          score: 85,
          description: 'Strong bullish confluence: Bullish marubozu within ascending channel above golden cross'
        }
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
        ],
        candlestickPattern: {
          name: 'Spinning Top',
          type: 'reversal',
          direction: 'bullish',
          strength: 'weak',
          confidence: 45,
          timeframe: '30M',
          description: 'Indecision candle at Fibonacci 61.8% level showing potential reversal',
          isForming: true,
          completedBars: 1
        },
        chartPattern: {
          name: 'Bull Flag',
          type: 'continuation',
          direction: 'bullish',
          strength: 'moderate',
          confidence: 60,
          timeframe: '1H',
          keyLevels: {
            support: '0.6775',
            resistance: '0.6790',
            breakoutLevel: '0.6791'
          },
          patternStatus: 'forming',
          estimatedCompletion: '6-8 bars'
        },
        patternConfluence: {
          score: 55,
          description: 'Moderate confluence: Spinning top at Fibonacci 61.8% within bull flag consolidation'
        }
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
        ],
        candlestickPattern: {
          name: 'Inside Bar',
          type: 'continuation',
          direction: 'bearish',
          strength: 'weak',
          confidence: 35,
          timeframe: '15M',
          description: 'Consolidation inside bar showing uncertainty before potential breakout',
          isForming: true,
          completedBars: 1
        },
        chartPattern: {
          name: 'Symmetrical Triangle',
          type: 'continuation',
          direction: 'bearish',
          strength: 'moderate',
          confidence: 50,
          timeframe: '1H',
          keyLevels: {
            support: '1.3555',
            resistance: '1.3575',
            breakoutLevel: '1.3554'
          },
          patternStatus: 'forming',
          estimatedCompletion: '4-6 bars'
        },
        patternConfluence: {
          score: 40,
          description: 'Weak confluence: Inside bar within symmetrical triangle showing consolidation before breakout'
        }
      }
    ]
  }
];