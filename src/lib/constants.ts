export const NEWS_ITEMS = [
  { id: '1', currency: 'USD', source: 'Reuters', title: "Fed Chair Hints at Slower Pace of Rate Hikes", time: "2h ago", impact: "high" },
  { id: '2', currency: 'EUR', source: 'Forex Factory', title: "ECB President Signals Hawkish Stance on Inflation", time: "3h ago", impact: "high" },
  { id: '3', currency: 'JPY', source: 'Bloomberg', title: "Bank of Japan Intervenes in Currency Market", time: "5h ago", impact: "high" },
  { id: '4', currency: 'GBP', source: 'Reuters', title: "UK Inflation Data Comes in Hotter Than Expected", time: "8h ago", impact: "medium" },
  { id: '5', currency: 'CAD', source: 'Forex Factory', title: "Canadian Employment Numbers Beat Forecasts", time: "1d ago", impact: "medium" },
  { id: '6', currency: 'AUD', source: 'Bloomberg', title: "RBA Holds Rates Steady, Cites Global Uncertainty", time: "1d ago", impact: "low" },
];

export const CURRENCY_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD",
  "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "CAD/JPY", "CHF/JPY",
];

export const EDUCATION_TOPICS = {
  "Technical Analysis": [
    { title: "Candle Patterns: Engulfing, Doji, Hammer", content: "Candlestick patterns are graphical representations of price movements. Key patterns like the Engulfing, Doji, and Hammer can signal potential reversals or continuations in the market." },
    { title: "Chart Patterns: Head & Shoulders, Triangle, Flag", content: "Chart patterns are formations that appear on price charts. Patterns like Head and Shoulders (reversal), Triangles (continuation/reversal), and Flags (continuation) help traders predict future price movements." },
    { title: "Trend Indicators: MA/EMA, Ichimoku Cloud", content: "Trend indicators help identify the direction and strength of a market trend. Moving Averages (MA/EMA) smooth out price data to create a single flowing line, while the Ichimoku Cloud offers a more comprehensive view of support, resistance, and momentum." },
    { title: "Momentum Indicators: RSI, Stochastic, MACD", content: "Momentum indicators help determine the speed of price movement. RSI and Stochastic identify overbought/oversold conditions, while MACD shows the relationship between two moving averages of a security’s price." },
    { title: "Volatility Indicator: ATR", content: "The Average True Range (ATR) is a technical analysis indicator that measures market volatility by decomposing the entire range of an asset price for that period." },
    { title: "Tools: Fibonacci, Pivot Points, Trend Lines", content: "These tools are used to identify strategic places for transactions. Fibonacci retracement identifies potential support and resistance levels. Pivot Points use the prior period's high, low, and close to determine future support/resistance. Trend lines connect price points to identify the trend direction." },
  ],
  "Price Action": [
    { title: "Breakouts & Retests", content: "A breakout occurs when the price moves above a resistance level or below a support level. A retest is when the price returns to the breakout level to 'test' it as new support or resistance before continuing in the breakout direction." },
    { title: "Key Levels & Supply/Demand Zones", content: "Key levels are significant price points where the price has previously reacted. Supply and Demand zones are areas on the chart where the price has made a strong move up or down, indicating a large number of buy or sell orders." },
  ],
  "Trading Strategies": [
    { title: "Trend Following", content: "This strategy involves trading in the direction of the current market trend. The goal is to capture profits as the trend continues. 'The trend is your friend' is a common saying." },
    { title: "Confluence Strategy", content: "Confluence occurs when multiple technical indicators or analysis techniques converge to produce the same trading signal, increasing the probability of a successful trade." },
  ],
  "Risk & Psychology": [
    { title: "Risk/Reward Ratios", content: "The risk-to-reward ratio marks the prospective reward an investor can earn for every dollar they risk on an investment. Many successful traders aim for at least a 1:2 risk/reward ratio." },
    { title: "Trading Psychology", content: "This refers to the emotional and mental state that helps to dictate success or failure in trading securities. Discipline, patience, and managing fear and greed are critical components of a trader's psychology." },
  ],
  "Fundamentals": [
    { title: "Impact of Interest Rates, GDP, Unemployment", content: "Fundamental data provides insight into the health of a country's economy. Higher interest rates can strengthen a currency, strong GDP growth indicates a healthy economy, and low unemployment figures are generally positive for the currency." },
    { title: "Geopolitical Events & Central Banks", content: "Geopolitical events like elections or conflicts can create significant market volatility. Central bank decisions, particularly on interest rates and monetary policy, are among the most powerful drivers of currency values." },
  ]
};

// All times are in UTC
export const MARKET_SESSIONS = [
  { name: "Sydney", open: 21, close: 6 },
  { name: "Tokyo", open: 0, close: 9 },
  { name: "London", open: 7, close: 16 },
  { name: "New York", open: 12, close: 21 },
];


