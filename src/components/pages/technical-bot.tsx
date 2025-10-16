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
  DollarSign
} from 'lucide-react';
import { TradingStrategy } from '@/types/technical';
import { tradingStrategies } from '@/static-data/technical-data';



// Available currency pairs
// Mock data for trading strategies


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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/50 backdrop-blur-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Technical Analysis Bot
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Real-time trading signals with multi-indicator confirmation
                  </p>
                </div>
              </div>
              {isLive && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Analysis Active</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsLive(!isLive)}
                variant={isLive ? "default" : "outline"}
                size="default"
                className={isLive 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg" 
                  : "border-2 hover:border-green-500 hover:text-green-600"
                }
              >
                {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isLive ? 'Live' : 'Start Live'}
              </Button>
              
              <Button variant="outline" size="default" className="border-2 hover:border-blue-500 hover:text-blue-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button variant="outline" size="default" className="border-2 hover:border-purple-500 hover:text-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Strategy Overview */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-white">
              {/* Current Strategy Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentStrategy.name}</h2>
                    <p className="text-blue-100 opacity-90">{currentStrategy.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-100">Available Pairs:</span>
                    <span className="text-2xl font-bold">{getStrategyOverallStats(currentStrategy).totalPairs}</span>
                  </div>
                  <div className="flex gap-2">
                    {getStrategyOverallStats(currentStrategy).buySignals > 0 && (
                      <Badge className="bg-green-500/80 text-white border-green-400 backdrop-blur-sm">
                        {getStrategyOverallStats(currentStrategy).buySignals} BUY
                      </Badge>
                    )}
                    {getStrategyOverallStats(currentStrategy).sellSignals > 0 && (
                      <Badge className="bg-red-500/80 text-white border-red-400 backdrop-blur-sm">
                        {getStrategyOverallStats(currentStrategy).sellSignals} SELL
                      </Badge>
                    )}
                    {getStrategyOverallStats(currentStrategy).waitSignals > 0 && (
                      <Badge className="bg-yellow-500/80 text-white border-yellow-400 backdrop-blur-sm">
                        {getStrategyOverallStats(currentStrategy).waitSignals} WAIT
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Strategy Stats */}
              <div className="text-right bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-sm mb-2">Strategy Performance</p>
                <div className="flex items-center gap-2 justify-end mb-2">
                  <span className="text-3xl font-bold">{currentStrategy.successRate}%</span>
                  <TrendingUp className="w-5 h-5 text-green-300" />
                </div>
                <p className="text-blue-200 text-sm">
                  Avg Strength: {getStrategyOverallStats(currentStrategy).avgStrength}%
                </p>
                <Badge className={`mt-2 ${getRiskColor(currentStrategy.riskLevel)} border-white/20`}>
                  {currentStrategy.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        
        {/* Strategy Selection */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              Trading Strategies
              <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                {tradingStrategies.length} Available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {tradingStrategies.map((strategy) => {
                const stats = getStrategyOverallStats(strategy);
                return (
                  <Card
                    key={strategy.id}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedStrategy === strategy.id
                        ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/80 shadow-xl'
                        : 'hover:shadow-lg hover:border-purple-300 bg-white/80 backdrop-blur-sm border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedStrategy(strategy.id);
                      setSelectedPair(''); // Reset pair selection when changing strategy
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-sm leading-tight text-gray-800 mb-1">
                              {strategy.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {strategy.availablePairs.length} Pairs
                              </Badge>
                              <span className="text-xs text-gray-600 font-medium">{strategy.timeframe}</span>
                            </div>
                          </div>
                          <Badge className={`${getSignalColor(stats.dominantSignal)} border-2 font-semibold shadow-sm`}>
                            {getSignalIcon(stats.dominantSignal)}
                            <span className="ml-1 text-xs">{stats.dominantSignal.toUpperCase()}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 text-xs">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600 font-medium">Avg Strength:</span>
                              <span className="font-bold text-gray-800">{stats.avgStrength}%</span>
                            </div>
                            <Progress value={stats.avgStrength} className="h-2 bg-gray-200" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Success Rate:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-green-600">{strategy.successRate}%</span>
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Risk Level:</span>
                            <Badge variant="outline" className={`${getRiskColor(strategy.riskLevel)} text-xs font-semibold border-2`}>
                              {strategy.riskLevel.toUpperCase()}
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
        {/* Available Pairs for Selected Strategy */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              Available Pairs for {currentStrategy.name}
              <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                {currentStrategy.timeframe}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentStrategy.availablePairs.map((pairAnalysis) => (
                <Card
                  key={pairAnalysis.pair}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedPair === pairAnalysis.pair
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/80 shadow-lg'
                      : 'hover:shadow-lg hover:border-blue-300 bg-white/80 backdrop-blur-sm border-gray-200'
                  }`}
                  onClick={() => setSelectedPair(pairAnalysis.pair)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{pairAnalysis.pair}</h3>
                          <p className="text-sm font-semibold text-gray-700">{pairAnalysis.currentPrice}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pairAnalysis.lastSignal}
                          </p>
                        </div>
                        <Badge className={`${getSignalColor(pairAnalysis.signal)} border-2 font-semibold shadow-sm`}>
                          {getSignalIcon(pairAnalysis.signal)}
                          <span className="ml-1">{pairAnalysis.signal.toUpperCase()}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 font-medium">Signal Strength:</span>
                            <span className="font-bold text-gray-800">{pairAnalysis.strength}%</span>
                          </div>
                          <Progress 
                            value={pairAnalysis.strength} 
                            className="h-2 bg-gray-200"
                          />
                        </div>
                        
                        {/* Pattern Confluence */}
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-blue-700 font-medium">Pattern Score:</span>
                            <span className={`font-bold ${
                              pairAnalysis.patternConfluence.score >= 80 ? 'text-green-600' :
                              pairAnalysis.patternConfluence.score >= 60 ? 'text-blue-600' :
                              pairAnalysis.patternConfluence.score >= 40 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {pairAnalysis.patternConfluence.score}%
                            </span>
                          </div>
                          <Progress 
                            value={pairAnalysis.patternConfluence.score} 
                            className="h-2"
                          />
                        </div>
                        
                        {/* Pattern Names */}
                        <div className="space-y-2">
                          {pairAnalysis.candlestickPattern && (
                            <div className="bg-orange-50 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-orange-700 font-medium text-xs">🕯️ Candle:</span>
                                <span className="font-semibold text-xs text-orange-900 truncate ml-1">
                                  {pairAnalysis.candlestickPattern.name}
                                </span>
                              </div>
                              <div className="text-xs text-orange-600 mt-1">
                                {pairAnalysis.candlestickPattern.confidence}% confidence
                              </div>
                            </div>
                          )}
                          {pairAnalysis.chartPattern && (
                            <div className="bg-blue-50 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-blue-700 font-medium text-xs">📈 Chart:</span>
                                <span className="font-semibold text-xs text-blue-900 truncate ml-1">
                                  {pairAnalysis.chartPattern.name}
                                </span>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                {pairAnalysis.chartPattern.confidence}% confidence
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {pairAnalysis.signal !== 'wait' && (
                          <>
                            <Separator className="my-3" />
                            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Entry:</span>
                                <span className="font-bold text-blue-600">{pairAnalysis.entryPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Target:</span>
                                <span className="font-bold text-green-600">{pairAnalysis.targetPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Stop Loss:</span>
                                <span className="font-bold text-red-600">{pairAnalysis.stopLoss}</span>
                              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPair && currentPairAnalysis ? (
              <>
                {/* Selected Pair Analysis */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">{currentPairAnalysis.pair}</span>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 font-medium">
                              {currentStrategy.name}
                            </Badge>
                          </div>
                          <p className="text-blue-100 font-normal text-sm">
                            {currentStrategy.timeframe} • Current: {currentPairAnalysis.currentPrice}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getSignalColor(currentPairAnalysis.signal)} border-2 text-base font-bold px-3 py-1`}>
                        {getSignalIcon(currentPairAnalysis.signal)}
                        <span className="ml-2">{currentPairAnalysis.signal.toUpperCase()}</span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                      <p className="text-gray-700 mb-4 font-medium">{currentStrategy.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">Timeframe</p>
                          <p className="font-bold text-lg text-blue-600">{currentStrategy.timeframe}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">Signal Strength</p>
                          <p className="font-bold text-lg text-green-600">{currentPairAnalysis.strength}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">Success Rate</p>
                          <p className="font-bold text-lg text-purple-600">{currentStrategy.successRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">Last Signal</p>
                          <p className="font-bold text-lg text-orange-600">{currentPairAnalysis.lastSignal}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Trade Levels */}
                    {currentPairAnalysis.signal !== 'wait' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                          <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-3">
                            <Target className="w-6 h-6" />
                          </div>
                          <p className="text-blue-100 font-medium mb-1">Entry Price</p>
                          <p className="text-2xl font-bold">{currentPairAnalysis.entryPrice}</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                          <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-3">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <p className="text-green-100 font-medium mb-1">Target Price</p>
                          <p className="text-2xl font-bold">{currentPairAnalysis.targetPrice}</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg">
                          <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-3">
                            <TrendingDown className="w-6 h-6" />
                          </div>
                          <p className="text-red-100 font-medium mb-1">Stop Loss</p>
                          <p className="text-2xl font-bold">{currentPairAnalysis.stopLoss}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Indicators */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Activity className="w-5 h-5" />
                      </div>
                      Technical Indicators for {currentPairAnalysis.pair}
                      <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                        {currentPairAnalysis.indicators.length} Indicators
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPairAnalysis.indicators.map((indicator, idx) => (
                        <div key={idx} className="p-5 border-2 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800">{indicator.name}</h4>
                            <Badge className={`${
                              indicator.status === 'bullish' ? 'bg-green-100 text-green-700 border-green-300' :
                              indicator.status === 'bearish' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-yellow-100 text-yellow-700 border-yellow-300'
                            } font-semibold`}>
                              {indicator.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-2xl font-bold text-gray-800">{indicator.value}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 font-medium">Confidence:</span>
                              <span className="text-lg font-bold text-blue-600">{indicator.confidence}%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress 
                              value={indicator.confidence} 
                              className="h-3 bg-gray-200"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Low</span>
                              <span>Medium</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pattern Recognition */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      Pattern Recognition for {currentPairAnalysis.pair}
                      <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                        Advanced Analysis
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Pattern Confluence Score */}
                    <div className="p-6 rounded-2xl border-2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-xl text-gray-800">Pattern Confluence Score</h4>
                        <div className="flex items-center gap-3">
                          <div className={`text-4xl font-bold ${
                            currentPairAnalysis.patternConfluence.score >= 80 ? 'text-green-600' :
                            currentPairAnalysis.patternConfluence.score >= 60 ? 'text-blue-600' :
                            currentPairAnalysis.patternConfluence.score >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {currentPairAnalysis.patternConfluence.score}%
                          </div>
                          <Badge className={`text-base font-bold px-4 py-2 ${
                            currentPairAnalysis.patternConfluence.score >= 80 ? 'bg-green-100 text-green-700 border-green-300' :
                            currentPairAnalysis.patternConfluence.score >= 60 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            currentPairAnalysis.patternConfluence.score >= 40 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          }`}>
                            {currentPairAnalysis.patternConfluence.score >= 80 ? 'VERY STRONG' :
                             currentPairAnalysis.patternConfluence.score >= 60 ? 'STRONG' :
                             currentPairAnalysis.patternConfluence.score >= 40 ? 'MODERATE' :
                             'WEAK'}
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={currentPairAnalysis.patternConfluence.score} 
                        className="h-4 mb-4 bg-gray-200"
                      />
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {currentPairAnalysis.patternConfluence.description}
                      </p>
                    </div>

                    {/* Candlestick and Chart Patterns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Candlestick Pattern */}
                      {currentPairAnalysis.candlestickPattern && (
                        <div className="p-6 border-2 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-xl text-orange-800 flex items-center gap-2">
                              <span className="text-2xl">🕯️</span>
                              Candlestick Pattern
                            </h4>
                            <Badge className={`text-base font-bold px-3 py-1 ${
                              currentPairAnalysis.candlestickPattern.direction === 'bullish' ? 'bg-green-100 text-green-700 border-green-300' :
                              currentPairAnalysis.candlestickPattern.direction === 'bearish' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {currentPairAnalysis.candlestickPattern.direction.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-bold text-2xl text-orange-900 mb-2">
                                {currentPairAnalysis.candlestickPattern.name}
                              </h5>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="bg-white text-orange-700 border-orange-300">
                                  {currentPairAnalysis.candlestickPattern.type}
                                </Badge>
                                <Badge variant="outline" className="bg-white text-orange-700 border-orange-300">
                                  {currentPairAnalysis.candlestickPattern.timeframe}
                                </Badge>
                                <Badge variant="outline" className={`${
                                  currentPairAnalysis.candlestickPattern.strength === 'strong' ? 'bg-green-50 text-green-700 border-green-300' :
                                  currentPairAnalysis.candlestickPattern.strength === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                  'bg-red-50 text-red-700 border-red-300'
                                }`}>
                                  {currentPairAnalysis.candlestickPattern.strength.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Confidence Level:</span>
                                <span className="font-bold text-gray-800">{currentPairAnalysis.candlestickPattern.confidence}%</span>
                              </div>
                              <Progress value={currentPairAnalysis.candlestickPattern.confidence} className="h-3 bg-gray-200" />
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <Badge variant="outline" className={`text-xs ${
                                    currentPairAnalysis.candlestickPattern.isForming ? 'bg-yellow-50 text-yellow-700 border-yellow-300' : 'bg-green-50 text-green-700 border-green-300'
                                  }`}>
                                    {currentPairAnalysis.candlestickPattern.isForming ? 'FORMING' : 'COMPLETED'}
                                  </Badge>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Bars:</span>
                                  <span className="font-bold text-gray-800">{currentPairAnalysis.candlestickPattern.completedBars}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-orange-100 rounded-xl p-4">
                              <p className="text-sm text-orange-800 font-medium leading-relaxed">
                                {currentPairAnalysis.candlestickPattern.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Chart Pattern */}
                      {currentPairAnalysis.chartPattern && (
                        <div className="p-6 border-2 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-xl text-blue-800 flex items-center gap-2">
                              <span className="text-2xl">📈</span>
                              Chart Pattern
                            </h4>
                            <Badge className={`text-base font-bold px-3 py-1 ${
                              currentPairAnalysis.chartPattern.direction === 'bullish' ? 'bg-green-100 text-green-700 border-green-300' :
                              'bg-red-100 text-red-700 border-red-300'
                            }`}>
                              {currentPairAnalysis.chartPattern.direction.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-bold text-2xl text-blue-900 mb-2">
                                {currentPairAnalysis.chartPattern.name}
                              </h5>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                                  {currentPairAnalysis.chartPattern.type}
                                </Badge>
                                <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                                  {currentPairAnalysis.chartPattern.timeframe}
                                </Badge>
                                <Badge variant="outline" className={`${
                                  currentPairAnalysis.chartPattern.strength === 'strong' ? 'bg-green-50 text-green-700 border-green-300' :
                                  currentPairAnalysis.chartPattern.strength === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                  'bg-red-50 text-red-700 border-red-300'
                                }`}>
                                  {currentPairAnalysis.chartPattern.strength.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Confidence Level:</span>
                                <span className="font-bold text-gray-800">{currentPairAnalysis.chartPattern.confidence}%</span>
                              </div>
                              <Progress value={currentPairAnalysis.chartPattern.confidence} className="h-3 bg-gray-200" />
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <Badge variant="outline" className={`text-xs ${
                                    currentPairAnalysis.chartPattern.patternStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-300' :
                                    currentPairAnalysis.chartPattern.patternStatus === 'forming' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                    'bg-red-50 text-red-700 border-red-300'
                                  }`}>
                                    {currentPairAnalysis.chartPattern.patternStatus.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <div className="flex justify-between">
                                  <span className="text-gray-600">ETA:</span>
                                  <span className="font-bold text-gray-800 text-xs">{currentPairAnalysis.chartPattern.estimatedCompletion}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Key Levels */}
                            <div className="bg-blue-100 rounded-xl p-4">
                              <h6 className="text-sm font-bold text-blue-800 mb-3">🎯 Key Levels:</h6>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                {currentPairAnalysis.chartPattern.keyLevels.support && (
                                  <div className="flex justify-between items-center bg-white rounded-lg p-2">
                                    <span className="text-gray-600 font-medium">Support:</span>
                                    <span className="font-bold text-green-600">{currentPairAnalysis.chartPattern.keyLevels.support}</span>
                                  </div>
                                )}
                                {currentPairAnalysis.chartPattern.keyLevels.resistance && (
                                  <div className="flex justify-between items-center bg-white rounded-lg p-2">
                                    <span className="text-gray-600 font-medium">Resistance:</span>
                                    <span className="font-bold text-red-600">{currentPairAnalysis.chartPattern.keyLevels.resistance}</span>
                                  </div>
                                )}
                                {currentPairAnalysis.chartPattern.keyLevels.breakoutLevel && (
                                  <div className="flex justify-between items-center bg-white rounded-lg p-2">
                                    <span className="text-gray-600 font-medium">Breakout:</span>
                                    <span className="font-bold text-blue-600">{currentPairAnalysis.chartPattern.keyLevels.breakoutLevel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Confirmations */}
                <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      Signal Confirmations for {currentPairAnalysis.pair}
                      <Badge className="bg-white/20 text-white border-white/30 ml-auto">
                        {currentPairAnalysis.confirmations.filter(c => c.status === 'confirmed').length}/
                        {currentPairAnalysis.confirmations.length} Confirmed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {currentPairAnalysis.confirmations.map((confirmation) => (
                        <div key={confirmation.id} className={`
                          flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300
                          ${confirmation.status === 'confirmed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                            confirmation.status === 'failed' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' :
                            'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'}
                        `}>
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              confirmation.status === 'confirmed' ? 'bg-green-100' :
                              confirmation.status === 'failed' ? 'bg-red-100' :
                              'bg-yellow-100'
                            }`}>
                              {getConfirmationIcon(confirmation.status)}
                            </div>
                            <div>
                              <p className="font-bold text-lg text-gray-800">{confirmation.name}</p>
                              {confirmation.target && (
                                <p className="text-sm text-gray-600 font-medium">
                                  🎯 Target: <span className="font-bold">{confirmation.target}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={confirmation.status === 'confirmed' ? 'default' : 'outline'}
                              className={`text-base font-bold px-4 py-2 mb-2 ${
                                confirmation.status === 'confirmed'
                                  ? 'bg-green-500 text-white border-green-600'
                                  : confirmation.status === 'failed'
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              }`}
                            >
                              {confirmation.status.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {confirmation.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Confirmation Summary */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">Confirmation Rate:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {Math.round((currentPairAnalysis.confirmations.filter(c => c.status === 'confirmed').length / currentPairAnalysis.confirmations.length) * 100)}%
                          </span>
                          <div className="flex gap-1">
                            {currentPairAnalysis.confirmations.map((c, idx) => (
                              <div key={idx} className={`w-3 h-3 rounded-full ${
                                c.status === 'confirmed' ? 'bg-green-500' :
                                c.status === 'failed' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(currentPairAnalysis.confirmations.filter(c => c.status === 'confirmed').length / currentPairAnalysis.confirmations.length) * 100}
                        className="h-3 mt-2 bg-gray-200"
                      />
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
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-t-2xl">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <LineChart className="w-5 h-5" />
                    </div>
                    Chart Snapshot
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="p-4 bg-white/80 rounded-xl backdrop-blur-sm mb-4">
                      <LineChart className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-bold">Live Chart Analysis</p>
                    </div>
                    {selectedPair && currentPairAnalysis ? (
                      <>
                        <div className="bg-white/90 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-2xl font-bold text-blue-600 mb-1">{currentPairAnalysis.pair}</p>
                          <p className="text-sm text-gray-600 font-medium">{currentStrategy.timeframe} • {currentStrategy.name}</p>
                          <div className="mt-3 space-y-2">
                            <Button size="sm" variant="outline" className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Chart
                            </Button>
                            <div className="flex items-center justify-center gap-2">
                              <Badge className={`${getSignalColor(currentPairAnalysis.signal)} border-2 font-bold`}>
                                {currentPairAnalysis.signal.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-bold text-gray-700">{currentPairAnalysis.strength}%</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/90 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-lg font-bold text-gray-600 mb-1">Select a Pair</p>
                          <p className="text-sm text-gray-500">{currentStrategy.timeframe} • {currentStrategy.name}</p>
                          <div className="mt-3">
                            <Button size="sm" variant="outline" className="w-full border-gray-300 text-gray-500" disabled>
                              <Eye className="w-4 h-4 mr-2" />
                              Select a pair first
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pattern Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  Pattern Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {selectedPair && currentPairAnalysis ? (
                  <>
                    {/* Selected Pair Patterns */}
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
                        <p className="text-3xl font-bold">{currentPairAnalysis.patternConfluence.score}%</p>
                        <p className="text-blue-100 font-medium">Pattern Confluence</p>
                      </div>
                      
                      {currentPairAnalysis.candlestickPattern && (
                        <div className="p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-orange-800 flex items-center gap-1">
                              <span className="text-lg">🕯️</span>
                              Candlestick
                            </span>
                            <Badge variant="outline" className={`text-xs font-bold ${
                              currentPairAnalysis.candlestickPattern.direction === 'bullish' ? 'text-green-600 border-green-300' :
                              currentPairAnalysis.candlestickPattern.direction === 'bearish' ? 'text-red-600 border-red-300' :
                              'text-gray-600 border-gray-300'
                            }`}>
                              {currentPairAnalysis.candlestickPattern.direction.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-orange-900 mb-2">{currentPairAnalysis.candlestickPattern.name}</p>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-orange-700 font-medium">Confidence:</span>
                            <span className="font-bold text-orange-900">{currentPairAnalysis.candlestickPattern.confidence}%</span>
                          </div>
                          <Progress value={currentPairAnalysis.candlestickPattern.confidence} className="h-2 bg-orange-200" />
                        </div>
                      )}
                      
                      {currentPairAnalysis.chartPattern && (
                        <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-blue-800 flex items-center gap-1">
                              <span className="text-lg">📈</span>
                              Chart Pattern
                            </span>
                            <Badge variant="outline" className={`text-xs font-bold ${
                              currentPairAnalysis.chartPattern.direction === 'bullish' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                            }`}>
                              {currentPairAnalysis.chartPattern.direction.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-blue-900 mb-2">{currentPairAnalysis.chartPattern.name}</p>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-blue-700 font-medium">Confidence:</span>
                            <span className="font-bold text-blue-900">{currentPairAnalysis.chartPattern.confidence}%</span>
                          </div>
                          <Progress value={currentPairAnalysis.chartPattern.confidence} className="h-2 bg-blue-200" />
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-blue-700 font-medium">Status:</span>
                              <Badge variant="outline" className="text-xs font-bold">
                                {currentPairAnalysis.chartPattern.patternStatus.toUpperCase()}
                              </Badge>
                            </div>
                            {currentPairAnalysis.chartPattern.keyLevels.breakoutLevel && (
                              <div className="flex justify-between text-xs">
                                <span className="text-blue-700 font-medium">Breakout:</span>
                                <span className="font-bold text-blue-900">{currentPairAnalysis.chartPattern.keyLevels.breakoutLevel}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Strategy Pattern Summary */}
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl">
                        <p className="text-3xl font-bold">
                          {Math.round(currentStrategy.availablePairs.reduce((acc, p) => acc + p.patternConfluence.score, 0) / currentStrategy.availablePairs.length)}%
                        </p>
                        <p className="text-gray-100 font-medium">Avg Pattern Score</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-800">Active Patterns:</h4>
                        {Array.from(new Set(currentStrategy.availablePairs.map(p => p.candlestickPattern?.name).filter(Boolean))).slice(0, 3).map((pattern, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <span className="text-orange-700 font-medium">🕯️ {pattern}</span>
                            <Badge className="bg-orange-200 text-orange-800 font-bold">
                              {currentStrategy.availablePairs.filter(p => p.candlestickPattern?.name === pattern).length}
                            </Badge>
                          </div>
                        ))}
                        
                        {Array.from(new Set(currentStrategy.availablePairs.map(p => p.chartPattern?.name).filter(Boolean))).slice(0, 3).map((pattern, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <span className="text-blue-700 font-medium">📈 {pattern}</span>
                            <Badge className="bg-blue-200 text-blue-800 font-bold">
                              {currentStrategy.availablePairs.filter(p => p.chartPattern?.name === pattern).length}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Zap className="w-5 h-5" />
                  </div>
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                    <div className="p-2 bg-white/20 rounded-lg w-fit mx-auto mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-green-100 font-medium">Successful Signals</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                    <div className="p-2 bg-white/20 rounded-lg w-fit mx-auto mb-2">
                      <Target className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold">18</p>
                    <p className="text-blue-100 font-medium">Total Signals</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Win Rate</span>
                      <span className="font-bold text-green-600">67%</span>
                    </div>
                    <Progress value={67} className="h-3 bg-gray-200" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-green-700">Avg. Profit</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-600">+24 pips</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-medium text-red-700">Avg. Loss</span>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-red-600">-12 pips</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-700">Risk/Reward</span>
                    <span className="font-bold text-blue-600">1:2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Activity className="w-5 h-5" />
                  </div>
                  Market Status
                  {isLive && (
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-100">Live</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-medium text-gray-700">Market Session</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 font-bold">
                      London Open
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-sm font-medium text-gray-700">Volatility</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-6 bg-orange-400 rounded"></div>
                        <div className="w-2 h-6 bg-orange-500 rounded"></div>
                        <div className="w-2 h-6 bg-orange-600 rounded"></div>
                      </div>
                      <span className="text-sm font-bold text-orange-600">High</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-gray-700">Trend</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-600">Bullish</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-sm font-medium text-gray-700">News Impact</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 font-bold">
                      Medium
                    </Badge>
                  </div>
                </div>
                
                {/* Market Hours Indicator */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border">
                  <h4 className="font-bold text-gray-800 mb-3">Trading Sessions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">London</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-600">ACTIVE</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New York</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-medium text-yellow-600">OPENING</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tokyo</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-500">CLOSED</span>
                      </div>
                    </div>
                  </div>
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