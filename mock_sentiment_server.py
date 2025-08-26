#!/usr/bin/env python3
"""
Simple Django sentiment server for testing
Run this file to simulate the sentiment analysis API
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
import datetime

class SentimentHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.split('/')
        
        # Handle CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        if len(path_parts) >= 4 and path_parts[1] == 'sentiment' and path_parts[2] == 'analyze':
            symbol = path_parts[3].upper()
            
            # Mock sentiment data
            data = {
                "symbol": symbol,
                "metadata": {
                    "keywords": ["forex", "trading", symbol[:3], symbol[3:], "currency"],
                    "subs": ["forex", "trading", "investing"],
                    "category": "Currency Trading",
                    "regions": ["Global"],
                    "note": "Mock data from test server"
                },
                "sources": {
                    "reddit": {
                        "enabled": True,
                        "items_found": 5,
                        "items": [
                            {
                                "title": f"[LIVE] {symbol} Technical Analysis",
                                "url": "https://reddit.com/r/forex/mock",
                                "author": "test_trader",
                                "subreddit": "forex", 
                                "created_at": datetime.datetime.now().isoformat(),
                                "text": f"Looking at {symbol} charts, seems like we have strong support...",
                                "upvotes": 42,
                                "comments": 8,
                                "upvote_ratio": 0.89
                            }
                        ]
                    },
                    "news": {
                        "enabled": True,
                        "items_found": 3,
                        "items": [
                            {
                                "title": f"{symbol} Forecast: Technical and Fundamental Analysis",
                                "url": "https://example.com/news/mock",
                                "publisher": "Mock Financial News",
                                "published": datetime.datetime.now().isoformat(),
                                "text": f"Latest {symbol} analysis suggests..."
                            }
                        ]
                    }
                },
                "total_items": 8,
                "timestamp": datetime.datetime.now().isoformat(),
                "sentiment_analysis": {
                    "signal": "Bullish",
                    "confidence": "High",
                    "buy_probability": "68%",
                    "sell_probability": "32%",
                    "rationale": f"Based on technical analysis and market sentiment, {symbol} shows bullish momentum with strong support levels.",
                    "key_insights": [
                        f"{symbol} showing strong bullish momentum",
                        "Technical indicators align with positive sentiment",
                        "Market risk appetite favors this currency pair"
                    ],
                    "risk_level": "Medium",
                    "timeframe": "24h",
                    "sources_analyzed": 8,
                    "source_types": ["reddit", "news"],
                    "analysis_timestamp": datetime.datetime.now().isoformat(),
                    "component_analyses": [
                        {
                            "source_type": "reddit",
                            "signal": "Bullish",
                            "confidence": "High",
                            "sentiment_score": 0.72
                        },
                        {
                            "source_type": "news",
                            "signal": "Neutral",
                            "confidence": "Medium", 
                            "sentiment_score": 0.15
                        }
                    ]
                }
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), SentimentHandler)
    print("Mock Django sentiment server running on http://localhost:8000")
    print("Try: http://localhost:8000/sentiment/analyze/eurusd/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()
