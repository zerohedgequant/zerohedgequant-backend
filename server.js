const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== UPSTOX CONFIGURATION ====================
// New Access Token - Updated 6 Feb 2026
const UPSTOX_ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJDVDMzMjAiLCJqdGkiOiI2OTg1OWJjZWIyZDM4MDRmYzRkZjYyOWMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzcwMzYzODU0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NzA0MTUyMDB9.-ipXkL6hFK0t6uZtnksnjKoMLDOi9zRllNEmmZwgkUY';

const UPSTOX_BASE_URL = 'https://api.upstox.com/v2';

// Stock symbols mapping (NSE)
const STOCK_SYMBOLS = {
  'RELIANCE': 'NSE_EQ|INE002A01018',
  'TCS': 'NSE_EQ|INE467B01029',
  'HDFCBANK': 'NSE_EQ|INE040A01034',
  'INFY': 'NSE_EQ|INE009A01021',
  'ICICIBANK': 'NSE_EQ|INE090A01021',
  'BHARTIARTL': 'NSE_EQ|INE397D01024',
  'SBIN': 'NSE_EQ|INE062A01020',
  'ITC': 'NSE_EQ|INE154A01025',
  'KOTAKBANK': 'NSE_EQ|INE237A01028',
  'LT': 'NSE_EQ|INE018A01030',
  'AXISBANK': 'NSE_EQ|INE238A01034',
  'WIPRO': 'NSE_EQ|INE075A01022',
  'TATAMOTORS': 'NSE_EQ|INE155A01022',
  'SUNPHARMA': 'NSE_EQ|INE044A01036',
  'MARUTI': 'NSE_EQ|INE585B01010',
  'TITAN': 'NSE_EQ|INE280A01028',
  'ASIANPAINT': 'NSE_EQ|INE021A01026',
  'BAJFINANCE': 'NSE_EQ|INE296A01024',
  'HCLTECH': 'NSE_EQ|INE860A01027',
  'NTPC': 'NSE_EQ|INE733E01010',
  'POWERGRID': 'NSE_EQ|INE752E01010',
  'ONGC': 'NSE_EQ|INE213A01029',
  'COALINDIA': 'NSE_EQ|INE522F01014',
  'JSWSTEEL': 'NSE_EQ|INE019A01038',
  'TATASTEEL': 'NSE_EQ|INE081A01020',
  'HINDALCO': 'NSE_EQ|INE038A01020',
  'ADANIENT': 'NSE_EQ|INE423A01024',
  'ADANIPORTS': 'NSE_EQ|INE742F01042',
  'ULTRACEMCO': 'NSE_EQ|INE481G01011',
  'GRASIM': 'NSE_EQ|INE047A01021',
  'TECHM': 'NSE_EQ|INE669C01036',
  'DRREDDY': 'NSE_EQ|INE089A01023',
  'CIPLA': 'NSE_EQ|INE059A01026',
  'APOLLOHOSP': 'NSE_EQ|INE437A01024',
  'EICHERMOT': 'NSE_EQ|INE066A01021',
  'BAJAJ-AUTO': 'NSE_EQ|INE917I01010',
  'HEROMOTOCO': 'NSE_EQ|INE158A01026',
  'M&M': 'NSE_EQ|INE101A01026',
  'NESTLEIND': 'NSE_EQ|INE239A01016',
  'BRITANNIA': 'NSE_EQ|INE216A01030',
  'DIVISLAB': 'NSE_EQ|INE361B01024',
  'BPCL': 'NSE_EQ|INE541A01028',
  'IOC': 'NSE_EQ|INE242A01010',
  'INDUSINDBK': 'NSE_EQ|INE095A01012',
  'TATACONSUM': 'NSE_EQ|INE192A01025',
  'SBILIFE': 'NSE_EQ|INE123W01016',
  'HDFCLIFE': 'NSE_EQ|INE795G01014',
  'SHRIRAMFIN': 'NSE_EQ|INE721A01013',
  'HINDUNILVR': 'NSE_EQ|INE030A01027'
};

// Index symbols
const INDEX_SYMBOLS = {
  'NIFTY': 'NSE_INDEX|Nifty 50',
  'SENSEX': 'BSE_INDEX|SENSEX',
  'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
  'NIFTYIT': 'NSE_INDEX|Nifty IT',
  'VIX': 'NSE_INDEX|India VIX'
};

// ==================== API ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ZerohedgeQuant API is running',
    timestamp: new Date().toISOString()
  });
});

// Get market data (indices + stocks)
app.get('/api/market-data', async (req, res) => {
  try {
    // Fetch index data
    const indexData = await fetchIndexData();
    
    // Fetch stock data
    const stockData = await fetchStockData();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      nifty: indexData.nifty,
      sensex: indexData.sensex,
      banknifty: indexData.banknifty,
      vix: indexData.vix,
      stocks: stockData
    });
  } catch (error) {
    console.error('Error fetching market data:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single stock quote
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const instrumentKey = STOCK_SYMBOLS[symbol];
    
    if (!instrumentKey) {
      return res.status(404).json({ 
        success: false, 
        error: 'Symbol not found' 
      });
    }
    
    const quote = await fetchQuote(instrumentKey);
    res.json({
      success: true,
      symbol: symbol,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get multiple stock quotes
app.get('/api/quotes', async (req, res) => {
  try {
    const symbols = req.query.symbols?.split(',') || Object.keys(STOCK_SYMBOLS);
    const quotes = {};
    
    for (const symbol of symbols.slice(0, 50)) {
      const instrumentKey = STOCK_SYMBOLS[symbol.toUpperCase()];
      if (instrumentKey) {
        try {
          const quote = await fetchQuote(instrumentKey);
          quotes[symbol.toUpperCase()] = quote;
        } catch (e) {
          console.error(`Error fetching ${symbol}:`, e.message);
        }
      }
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      quotes: quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get option chain
app.get('/api/option-chain/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const expiry = req.query.expiry;
    
    const response = await axios.get(`${UPSTOX_BASE_URL}/option/chain`, {
      params: {
        instrument_key: STOCK_SYMBOLS[symbol] || `NSE_INDEX|${symbol}`,
        expiry_date: expiry
      },
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    res.json({
      success: true,
      symbol: symbol,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error fetching option chain:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

async function fetchQuote(instrumentKey) {
  try {
    const response = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
      params: {
        instrument_key: instrumentKey
      },
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    const data = response.data.data[instrumentKey];
    if (!data) return null;
    
    return {
      price: data.last_price,
      open: data.ohlc?.open,
      high: data.ohlc?.high,
      low: data.ohlc?.low,
      close: data.ohlc?.close,
      change: data.net_change,
      changePct: data.change,
      volume: data.volume,
      timestamp: data.last_trade_time
    };
  } catch (error) {
    console.error(`Error fetching quote for ${instrumentKey}:`, error.message);
    return null;
  }
}

async function fetchIndexData() {
  const indices = {
    nifty: null,
    sensex: null,
    banknifty: null,
    vix: null
  };
  
  try {
    // Fetch Nifty 50
    const niftyResponse = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
      params: { instrument_key: INDEX_SYMBOLS.NIFTY },
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    const niftyData = niftyResponse.data.data[INDEX_SYMBOLS.NIFTY];
    if (niftyData) {
      indices.nifty = {
        value: niftyData.last_price,
        change: niftyData.net_change,
        changePct: niftyData.change
      };
    }
  } catch (e) {
    console.error('Error fetching Nifty:', e.message);
  }
  
  try {
    // Fetch Bank Nifty
    const bankNiftyResponse = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
      params: { instrument_key: INDEX_SYMBOLS.BANKNIFTY },
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    const bankNiftyData = bankNiftyResponse.data.data[INDEX_SYMBOLS.BANKNIFTY];
    if (bankNiftyData) {
      indices.banknifty = {
        value: bankNiftyData.last_price,
        change: bankNiftyData.net_change,
        changePct: bankNiftyData.change
      };
    }
  } catch (e) {
    console.error('Error fetching Bank Nifty:', e.message);
  }
  
  try {
    // Fetch VIX
    const vixResponse = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
      params: { instrument_key: INDEX_SYMBOLS.VIX },
      headers: {
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    const vixData = vixResponse.data.data[INDEX_SYMBOLS.VIX];
    if (vixData) {
      indices.vix = {
        value: vixData.last_price,
        change: vixData.net_change,
        changePct: vixData.change
      };
    }
  } catch (e) {
    console.error('Error fetching VIX:', e.message);
  }
  
  return indices;
}

async function fetchStockData() {
  const stocks = {};
  const symbols = Object.keys(STOCK_SYMBOLS);
  
  // Fetch in batches of 10 to avoid rate limiting
  for (let i = 0; i < symbols.length; i += 10) {
    const batch = symbols.slice(i, i + 10);
    
    await Promise.all(batch.map(async (symbol) => {
      try {
        const quote = await fetchQuote(STOCK_SYMBOLS[symbol]);
        if (quote) {
          stocks[symbol] = quote;
        }
      } catch (e) {
        console.error(`Error fetching ${symbol}:`, e.message);
      }
    }));
    
    // Small delay between batches
    if (i + 10 < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return stocks;
}

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 ZerohedgeQuant API running on port ${PORT}`);
  console.log(`📊 Monitoring ${Object.keys(STOCK_SYMBOLS).length} stocks`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});
