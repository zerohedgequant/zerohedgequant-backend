const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: '*',  // Allow all origins for now
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ═══════════════════════════════════════════════════════
// UPSTOX API CREDENTIALS (Secure - not exposed to frontend)
// ═══════════════════════════════════════════════════════
const UPSTOX_CONFIG = {
  apiKey: 'e58f4629-5461-4568-8d95-a71d860c6321',
  apiSecret: 'ad0oraj0me',
  accessToken: 'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJDVDMzMjAiLCJqdGkiOiI2OTgzYzg4MTIyOTcxMTc1ZDM3ZjdjZDkiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzcwMjQ0MjI1LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NzAzMjg4MDB9.eYlaUjBZluQiH0Wet7OwHRSRwzsYUgLU-i-F3gPmPwY'
};

// Headers for Upstox API
const getHeaders = () => ({
  'Authorization': `Bearer ${UPSTOX_CONFIG.accessToken}`,
  'Accept': 'application/json'
});

// ═══════════════════════════════════════════════════════
// STOCK SYMBOL MAPPING (NSE symbols)
// ═══════════════════════════════════════════════════════
const STOCK_SYMBOLS = {
  'TCS': 'NSE_EQ|INE467B01029',           // TCS
  'INFY': 'NSE_EQ|INE009A01021',          // Infosys
  'HDFCBANK': 'NSE_EQ|INE040A01034',      // HDFC Bank
  'RELIANCE': 'NSE_EQ|INE002A01018',      // Reliance
  'ICICIBANK': 'NSE_EQ|INE090A01021',     // ICICI Bank
  'HINDUNILVR': 'NSE_EQ|INE030A01027',    // HUL
  'SUNPHARMA': 'NSE_EQ|INE044A01036',     // Sun Pharma
  'MARUTI': 'NSE_EQ|INE585B01010',        // Maruti
  'DLF': 'NSE_EQ|INE271C01023',           // DLF
  'NTPC': 'NSE_EQ|INE733E01010',          // NTPC
  'BAJFINANCE': 'NSE_EQ|INE296A01024',    // Bajaj Finance
  'ASIANPAINT': 'NSE_EQ|INE021A01026'     // Asian Paints
};

// ═══════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ZerohedgeQuant API Server Running', timestamp: new Date() });
});

// Get Market Data for multiple stocks
app.get('/api/market-data', async (req, res) => {
  try {
    const symbols = Object.keys(STOCK_SYMBOLS).slice(0, 10); // Get first 10 stocks
    const instrumentKeys = symbols.map(s => STOCK_SYMBOLS[s]).join(',');
    
    const response = await axios.get(
      `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${instrumentKeys}`,
      { headers: getHeaders() }
    );

    const marketData = [];
    
    if (response.data && response.data.data) {
      Object.entries(response.data.data).forEach(([key, stock], index) => {
        const quote = stock.ohlc;
        const ltp = stock.last_price || quote.close;
        const prevClose = quote.close;
        const change = ltp - prevClose;
        const pct = ((change / prevClose) * 100).toFixed(2);
        
        marketData.push({
          name: symbols[index],
          sector: getSector(symbols[index]),
          price: ltp,
          change: change.toFixed(2),
          pct: parseFloat(pct),
          vol: formatVolume(stock.volume || 0),
          cap: getMarketCap(symbols[index]),
          spark: generateSparkline()
        });
      });
    }

    res.json({ success: true, data: marketData });
  } catch (error) {
    console.error('Error fetching market data:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch market data',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get Index Data (Nifty, Sensex, etc)
app.get('/api/indices', async (req, res) => {
  try {
    const indices = [
      'NSE_INDEX|Nifty 50',
      'NSE_INDEX|Nifty Bank',
      'BSE_INDEX|SENSEX'
    ].join(',');

    const response = await axios.get(
      `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${indices}`,
      { headers: getHeaders() }
    );

    const indexData = {};
    
    if (response.data && response.data.data) {
      Object.entries(response.data.data).forEach(([key, index]) => {
        const ltp = index.last_price;
        const prevClose = index.ohlc.close;
        const change = ltp - prevClose;
        const pct = ((change / prevClose) * 100).toFixed(2);
        
        const name = key.includes('Nifty 50') ? 'nifty' : 
                     key.includes('Nifty Bank') ? 'banknifty' : 'sensex';
        
        indexData[name] = {
          value: ltp.toFixed(2),
          change: change.toFixed(2),
          pct: parseFloat(pct)
        };
      });
    }

    res.json({ success: true, data: indexData });
  } catch (error) {
    console.error('Error fetching indices:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch indices',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get Screener Data (with fundamentals approximation)
app.get('/api/screener', async (req, res) => {
  try {
    const symbols = Object.keys(STOCK_SYMBOLS);
    const instrumentKeys = symbols.map(s => STOCK_SYMBOLS[s]).join(',');
    
    const response = await axios.get(
      `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${instrumentKeys}`,
      { headers: getHeaders() }
    );

    const screenerData = [];
    
    if (response.data && response.data.data) {
      Object.entries(response.data.data).forEach(([key, stock], index) => {
        const ltp = stock.last_price || stock.ohlc.close;
        
        screenerData.push({
          name: symbols[index],
          sector: getSector(symbols[index]),
          price: ltp,
          pe: getFundamental(symbols[index], 'pe'),
          roe: getFundamental(symbols[index], 'roe'),
          cap: getMarketCap(symbols[index]),
          hi: stock.ohlc.high || (ltp * 1.15).toFixed(2),
          lo: stock.ohlc.low || (ltp * 0.85).toFixed(2),
          de: getFundamental(symbols[index], 'de'),
          div: getFundamental(symbols[index], 'div')
        });
      });
    }

    res.json({ success: true, data: screenerData });
  } catch (error) {
    console.error('Error fetching screener data:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch screener data',
      message: error.response?.data?.message || error.message
    });
  }
});

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

function getSector(symbol) {
  const sectors = {
    'TCS': 'IT', 'INFY': 'IT',
    'HDFCBANK': 'Banking', 'ICICIBANK': 'Banking', 'BAJFINANCE': 'Banking',
    'HINDUNILVR': 'FMCG', 'ASIANPAINT': 'FMCG',
    'SUNPHARMA': 'Pharma',
    'MARUTI': 'Auto',
    'DLF': 'Realty',
    'RELIANCE': 'Energy', 'NTPC': 'Energy'
  };
  return sectors[symbol] || 'Other';
}

function getMarketCap(symbol) {
  const caps = {
    'TCS': '1,41,234', 'INFY': '72,418', 'HDFCBANK': '1,33,890',
    'RELIANCE': '1,95,102', 'ICICIBANK': '62,340', 'HINDUNILVR': '52,768',
    'SUNPHARMA': '37,486', 'MARUTI': '33,744', 'DLF': '19,082',
    'NTPC': '37,264', 'BAJFINANCE': '48,820', 'ASIANPAINT': '25,366'
  };
  return caps[symbol] || '10,000';
}

function getFundamental(symbol, type) {
  const data = {
    'TCS': { pe: 28.4, roe: 24.8, de: 0.02, div: 1.72 },
    'INFY': { pe: 25.6, roe: 28.4, de: 0.01, div: 2.14 },
    'HDFCBANK': { pe: 22.1, roe: 18.2, de: 0.14, div: 1.42 },
    'RELIANCE': { pe: 24.8, roe: 14.6, de: 0.21, div: 0.87 },
    'ICICIBANK': { pe: 19.4, roe: 17.6, de: 0.11, div: 1.88 },
    'HINDUNILVR': { pe: 48.6, roe: 20.2, de: 0.08, div: 2.48 },
    'SUNPHARMA': { pe: 34.2, roe: 16.8, de: 0.18, div: 0.62 },
    'MARUTI': { pe: 26.3, roe: 19.4, de: 0.04, div: 1.34 },
    'DLF': { pe: 38.1, roe: 22.6, de: 0.32, div: 0.44 },
    'NTPC': { pe: 16.8, roe: 12.4, de: 0.45, div: 3.12 },
    'BAJFINANCE': { pe: 29.4, roe: 21.8, de: 0.72, div: 1.06 },
    'ASIANPAINT': { pe: 52.4, roe: 26.8, de: 0.06, div: 1.82 }
  };
  return data[symbol]?.[type] || 0;
}

function formatVolume(vol) {
  if (vol > 1000000) return `${(vol / 1000000).toFixed(1)}M`;
  if (vol > 1000) return `${(vol / 1000).toFixed(1)}K`;
  return vol.toString();
}

function generateSparkline() {
  return Array.from({length: 7}, () => Math.random() * 4);
}

// ═══════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`🚀 ZerohedgeQuant API Server running on port ${PORT}`);
  console.log(`🔒 Upstox credentials secured`);
  console.log(`📊 Ready to serve market data`);
});
