import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate a slow LLM response (30 seconds)
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  return NextResponse.json({
    symbol: "EURUSD",
    signal: "BUY",
    confidence: "HIGH",
    sentiment_score: 0.75,
    buy_probability: "75%",
    sell_probability: "15%",
    neutral_probability: "10%",
    rationale: "Positive sentiment analysis from test endpoint",
    key_insights: ["Test insight 1", "Test insight 2"],
    risk_level: "LOW",
    timeframe: "SHORT",
    sources_analyzed: 10,
    source_types: ["reddit", "news"], 
    analysis_timestamp: new Date().toISOString(),
    component_analyses: [{
      source: "test",
      type: "news",
      confidence: "HIGH",
      sentiment_score: 0.8
    }]
  });
}
