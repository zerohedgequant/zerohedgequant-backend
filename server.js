const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// YOUR NEW TOKEN - Updated 6 Feb 2026
const UPSTOX_ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJDVDMzMjAiLCJqdGkiOiI2OTg1OWJjZWIyZDM4MDRmYzRkZjYyOWMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzcwMzYzODU0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NzA0MTUyMDB9.-ipXkL6hFK0t6uZtnksnjKoMLDOi9zRllNEmmZwgkUY';

const UPSTOX_BASE_URL = 'https://api.upstox.com/v2';

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
  'HCLTECH': 'NSE_EQ|INE860A01027',
  'NTPC': 'NSE_EQ|INE733E01010',
  'POWERGRID': 'NSE_EQ|INE752E01010',
  'ONGC': 'NSE_EQ|INE213A01029',
  'COALINDIA': 'NSE_EQ|INE522F01014',
  'TATASTEEL': 'NSE_EQ|INE081A01020',
  'HINDALCO': 'NSE_EQ|INE038A01020',
  'BAJFINANCE': 'NSE_EQ|INE296A01024',
  'HINDUNILVR': 'NSE_EQ|INE030A01027'
};

const INDEX_SYMBOLS = {
  'NIFTY': 'NSE_INDEX|Nifty 50',
  'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
  'VIX': 'NSE_INDEX|India VIX'
};

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'ZerohedgeQuant API Running' });
});

app.get('/api/market-data', async (req, res) => {
  try {
    const indices = {};
    const stocks = {};

    // Fetch Nifty
    try {
      const niftyRes = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
        params: { instrument_key: INDEX_SYMBOLS.NIFTY },
        headers: { 'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`, 'Accept': 'application/json' }
      });
      const niftyData = niftyRes.data.data[INDEX_SYMBOLS.NIFTY];
      if (niftyData) {
        indices.nifty = { value: niftyData.last_price, change: niftyData.net_change, changePct: niftyData.change };
      }
    } catch (e) { console.log('Nifty error:', e.message); }

    // Fetch Bank Nifty
    try {
      const bnRes = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
        params: { instrument_key: INDEX_SYMBOLS.BANKNIFTY },
        headers: { 'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`, 'Accept': 'application/json' }
      });
      const bnData = bnRes.data.data[INDEX_SYMBOLS.BANKNIFTY];
      if (bnData) {
        indices.banknifty = { value: bnData.last_price, change: bnData.net_change, changePct: bnData.change };
      }
    } catch (e) { console.log('BankNifty error:', e.message); }

    // Fetch VIX
    try {
      const vixRes = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
        params: { instrument_key: INDEX_SYMBOLS.VIX },
        headers: { 'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`, 'Accept': 'application/json' }
      });
      const vixData = vixRes.data.data[INDEX_SYMBOLS.VIX];
      if (vixData) {
        indices.vix = { value: vixData.last_price, change: vixData.net_change, changePct: vixData.change };
      }
    } catch (e) { console.log('VIX error:', e.message); }

    // Fetch stocks
    for (const [symbol, key] of Object.entries(STOCK_SYMBOLS)) {
      try {
        const stockRes = await axios.get(`${UPSTOX_BASE_URL}/market-quote/quotes`, {
          params: { instrument_key: key },
          headers: { 'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`, 'Accept': 'application/json' }
        });
        const stockData = stockRes.data.data[key];
        if (stockData) {
          stocks[symbol] = {
            price: stockData.last_price,
            change: stockData.net_change,
            changePct: stockData.change,
            volume: stockData.volume,
            open: stockData.ohlc?.open,
            high: stockData.ohlc?.high,
            low: stockData.ohlc?.low
          };
        }
      } catch (e) { console.log(`${symbol} error:`, e.message); }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      nifty: indices.nifty,
      sensex: indices.sensex,
      banknifty: indices.banknifty,
      vix: indices.vix,
      stocks: stocks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
