# Forex Compass

A comprehensive forex trading platform providing real-time market analysis, sentiment tracking, and technical analysis tools to help traders make informed decisions.

## 🚀 Features

### 📊 Technical Analysis Bot
- **Multi-Strategy Analysis**: Support for 5+ trading strategies including Bollinger Bands, RSI Scalping, Moving Average Crossover, Fibonacci Retracement, and Momentum Breakout
- **Currency Pair Selection**: Analyze multiple forex pairs (EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD) with strategy-specific recommendations
- **Real-time Signals**: Live BUY/SELL/WAIT signals with confidence levels and strength indicators
- **Entry/Exit Points**: Clear display of entry prices, target prices, and stop-loss levels
- **Technical Indicators**: Comprehensive indicator analysis with confidence percentages
- **Signal Confirmations**: Real-time confirmation tracking for each trading signal

### 📈 Market Sentiment Analysis
- **AI-Powered Sentiment**: Advanced sentiment analysis using Django backend integration
- **Real-time News Processing**: Live forex news analysis and sentiment scoring
- **Multi-timeframe Analysis**: Sentiment tracking across different time horizons
- **Risk Assessment**: Automated risk evaluation based on sentiment data

### 📚 Educational Resources
- **Trading Patterns**: Interactive pattern recognition guides
- **Technical Indicators**: Comprehensive indicator explanations and usage
- **Risk Management**: Educational content on proper risk management techniques

### 🕐 Market Hours Tracker
- **Global Sessions**: Track London, Asian, New York, and Sydney trading sessions
- **Volatility Indicators**: Real-time volatility measurements
- **Session Overlap Analysis**: Identify high-activity trading periods

### 🧮 Trading Calculators
- **Position Size Calculator**: Calculate optimal position sizes based on risk tolerance
- **Pip Value Calculator**: Determine pip values for different currency pairs
- **Risk/Reward Calculator**: Analyze risk-to-reward ratios for potential trades

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend Integration**: Django REST API for sentiment analysis
- **Icons**: Lucide React icon library
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Real-time Data**: Live forex price feeds and market data

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/robinnayak/forex-compass.git
cd forex-compass
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Configure your environment variables for API endpoints and external services.

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for backend integration
│   │   ├── sentiment/     # Sentiment analysis endpoints
│   │   ├── forex-news/    # News data endpoints
│   │   └── education-api/ # Educational content API
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Homepage
├── components/            # Reusable React components
│   ├── pages/            # Page-specific components
│   │   ├── technical-bot.tsx        # Technical analysis interface
│   │   ├── sentiment-ai-tab.tsx     # AI sentiment analysis
│   │   ├── news-tab.tsx             # News and market updates
│   │   ├── education-tab.tsx        # Educational resources
│   │   ├── calculators-tab.tsx      # Trading calculators
│   │   └── market-hours-tab.tsx     # Market session tracker
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
└── contexts/             # React context providers
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=your-backend-api-url
DJANGO_SENTIMENT_API=your-sentiment-api-endpoint

# External Services
FOREX_DATA_API_KEY=your-forex-data-api-key
NEWS_API_KEY=your-news-api-key
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🔗 API Integration

The application integrates with several APIs:

### Django Backend
- **Sentiment Analysis**: `/api/sentiment` - AI-powered market sentiment analysis
- **News Processing**: `/api/forex-news` - Real-time forex news aggregation
- **Educational Content**: `/api/education-api` - Trading education resources

### External Services
- **Forex Data**: Real-time currency pair pricing
- **Market News**: Live news feeds from financial sources
- **Economic Calendar**: Major economic events and announcements

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Robin Nayak** - [@robinnayak](https://github.com/robinnayak)

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- shadcn for the beautiful UI component library
- The forex trading community for insights and feedback

## 📞 Support

For support, email robinnayak86@gmail.com or create an issue on GitHub.

---

**Happy Trading! 📈💰**
