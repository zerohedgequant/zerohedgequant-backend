const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// ═══════════════════════════════════════════════════════
// CONFIG - Update token via Render Environment Variables
// ═══════════════════════════════════════════════════════
const CONFIG = {
  apiKey: process.env.UPSTOX_API_KEY || 'e58f4629-5461-4568-8d95-a71d860c6321',
  apiSecret: process.env.UPSTOX_API_SECRET || 'q029n42dyk',
  accessToken: process.env.UPSTOX_ACCESS_TOKEN || 'eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJDVDMzMjAiLCJqdGkiOiI2OThkODM3MGQ2ZTE0MTViZTU5ZTUxNDQiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzcwODgxOTA0LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3NzA5MzM2MDB9.eDRGLXja2Un_a55qJk-GCaEQUCHGB6zEAp5U461UgPM',
  baseUrl: 'https://api.upstox.com/v2'
};

// ═══════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ═══════════════════════════════════════════════════════
// STOCK UNIVERSE - 50 NSE Stocks
// ═══════════════════════════════════════════════════════
const STOCKS = {
  'RELIANCE':   { name: 'Reliance Industries', sector: 'Energy', industry: 'Oil & Gas - Refining', mcap: 'Large' },
  'TCS':        { name: 'Tata Consultancy Services', sector: 'Technology', industry: 'IT Services', mcap: 'Large' },
  'HDFCBANK':   { name: 'HDFC Bank', sector: 'Financial', industry: 'Banks - Private', mcap: 'Large' },
  'INFY':       { name: 'Infosys', sector: 'Technology', industry: 'IT Services', mcap: 'Large' },
  'ICICIBANK':  { name: 'ICICI Bank', sector: 'Financial', industry: 'Banks - Private', mcap: 'Large' },
  'BHARTIARTL': { name: 'Bharti Airtel', sector: 'Communication', industry: 'Telecom', mcap: 'Large' },
  'SBIN':       { name: 'State Bank of India', sector: 'Financial', industry: 'Banks - Public', mcap: 'Large' },
  'ITC':        { name: 'ITC Ltd', sector: 'Consumer Defensive', industry: 'FMCG', mcap: 'Large' },
  'KOTAKBANK':  { name: 'Kotak Mahindra Bank', sector: 'Financial', industry: 'Banks - Private', mcap: 'Large' },
  'LT':         { name: 'Larsen & Toubro', sector: 'Industrials', industry: 'Engineering', mcap: 'Large' },
  'HINDUNILVR': { name: 'Hindustan Unilever', sector: 'Consumer Defensive', industry: 'FMCG', mcap: 'Large' },
  'AXISBANK':   { name: 'Axis Bank', sector: 'Financial', industry: 'Banks - Private', mcap: 'Large' },
  'BAJFINANCE': { name: 'Bajaj Finance', sector: 'Financial', industry: 'NBFC', mcap: 'Large' },
  'MARUTI':     { name: 'Maruti Suzuki', sector: 'Consumer Cyclical', industry: 'Auto', mcap: 'Large' },
  'TATAMOTORS': { name: 'Tata Motors', sector: 'Consumer Cyclical', industry: 'Auto', mcap: 'Large' },
  'SUNPHARMA':  { name: 'Sun Pharma', sector: 'Healthcare', industry: 'Pharma', mcap: 'Large' },
  'TITAN':      { name: 'Titan Company', sector: 'Consumer Cyclical', industry: 'Jewelry', mcap: 'Large' },
  'ASIANPAINT': { name: 'Asian Paints', sector: 'Basic Materials', industry: 'Paints', mcap: 'Large' },
  'WIPRO':      { name: 'Wipro', sector: 'Technology', industry: 'IT Services', mcap: 'Large' },
  'HCLTECH':    { name: 'HCL Technologies', sector: 'Technology', industry: 'IT Services', mcap: 'Large' },
  'ULTRACEMCO': { name: 'UltraTech Cement', sector: 'Basic Materials', industry: 'Cement', mcap: 'Large' },
  'POWERGRID':  { name: 'Power Grid Corp', sector: 'Utilities', industry: 'Power', mcap: 'Large' },
  'NTPC':       { name: 'NTPC Ltd', sector: 'Utilities', industry: 'Power', mcap: 'Large' },
  'TATASTEEL':  { name: 'Tata Steel', sector: 'Basic Materials', industry: 'Steel', mcap: 'Large' },
  'NESTLEIND':  { name: 'Nestle India', sector: 'Consumer Defensive', industry: 'FMCG', mcap: 'Large' },
  'TECHM':      { name: 'Tech Mahindra', sector: 'Technology', industry: 'IT Services', mcap: 'Large' },
  'ONGC':       { name: 'ONGC', sector: 'Energy', industry: 'Oil & Gas', mcap: 'Large' },
  'ADANIENT':   { name: 'Adani Enterprises', sector: 'Industrials', industry: 'Conglomerate', mcap: 'Large' },
  'ADANIPORTS': { name: 'Adani Ports', sector: 'Industrials', industry: 'Ports', mcap: 'Large' },
  'COALINDIA':  { name: 'Coal India', sector: 'Energy', industry: 'Mining', mcap: 'Large' },
  'BAJAJFINSV': { name: 'Bajaj Finserv', sector: 'Financial', industry: 'Financial Services', mcap: 'Large' },
  'JSWSTEEL':   { name: 'JSW Steel', sector: 'Basic Materials', industry: 'Steel', mcap: 'Large' },
  'INDUSINDBK': { name: 'IndusInd Bank', sector: 'Financial', industry: 'Banks - Private', mcap: 'Large' },
  'GRASIM':     { name: 'Grasim Industries', sector: 'Basic Materials', industry: 'Cement', mcap: 'Large' },
  'CIPLA':      { name: 'Cipla', sector: 'Healthcare', industry: 'Pharma', mcap: 'Large' },
  'DRREDDY':    { name: "Dr. Reddy's Labs", sector: 'Healthcare', industry: 'Pharma', mcap: 'Large' },
  'EICHERMOT':  { name: 'Eicher Motors', sector: 'Consumer Cyclical', industry: 'Auto', mcap: 'Large' },
  'DIVISLAB':   { name: "Divi's Laboratories", sector: 'Healthcare', industry: 'Pharma', mcap: 'Large' },
  'BPCL':       { name: 'BPCL', sector: 'Energy', industry: 'Oil & Gas', mcap: 'Large' },
  'BRITANNIA':  { name: 'Britannia Industries', sector: 'Consumer Defensive', industry: 'FMCG', mcap: 'Large' },
  'HEROMOTOCO': { name: 'Hero MotoCorp', sector: 'Consumer Cyclical', industry: 'Auto', mcap: 'Large' },
  'APOLLOHOSP': { name: 'Apollo Hospitals', sector: 'Healthcare', industry: 'Hospitals', mcap: 'Large' },
  'HINDALCO':   { name: 'Hindalco', sector: 'Basic Materials', industry: 'Metals', mcap: 'Large' },
  'SBILIFE':    { name: 'SBI Life Insurance', sector: 'Financial', industry: 'Insurance', mcap: 'Large' },
  'TATACONSUM': { name: 'Tata Consumer', sector: 'Consumer Defensive', industry: 'FMCG', mcap: 'Large' },
  'BAJAJ-AUTO': { name: 'Bajaj Auto', sector: 'Consumer Cyclical', industry: 'Auto', mcap: 'Large' },
  'HDFCLIFE':   { name: 'HDFC Life Insurance', sector: 'Financial', industry: 'Insurance', mcap: 'Large' },
  'M&M':        { name: 'Mahindra & Mahindra', sector: 'Consumer Cyclical', industry: 'Auto', mcap: 'Large' },
  'LTIM':       { name: 'LTIMindtree', sector: 'Technology', industry: 'IT Services', mcap: 'Large' },
  'SHRIRAMFIN': { name: 'Shriram Finance', sector: 'Financial', industry: 'NBFC', mcap: 'Large' },
};

// ═══════════════════════════════════════════════════════
// UPSTOX API HELPER
// ═══════════════════════════════════════════════════════
async function upstoxFetch(endpoint, params = {}) {
  try {
    const resp = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${CONFIG.accessToken}`,
        'Accept': 'application/json'
      },
      params,
      timeout: 12000
    });
    return resp.data;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    console.error(`[Upstox ${endpoint}] ${status}: ${msg}`);
    if (status === 401) {
      console.error('⚠️  ACCESS TOKEN EXPIRED — Update UPSTOX_ACCESS_TOKEN env var on Render');
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════
const cache = {};
function cached(key, ttlMs, fetchFn) {
  return async (req, res) => {
    const now = Date.now();
    if (cache[key] && now - cache[key].ts < ttlMs) {
      return res.json({ success: true, data: cache[key].data, cached: true });
    }
    try {
      const data = await fetchFn(req);
      if (data) {
        cache[key] = { data, ts: now };
        return res.json({ success: true, data });
      }
      // Return stale cache if available
      if (cache[key]) {
        return res.json({ success: true, data: cache[key].data, stale: true });
      }
      return res.json({ success: false, error: 'No data available' });
    } catch (e) {
      console.error(`[${key}] Error:`, e.message);
      if (cache[key]) return res.json({ success: true, data: cache[key].data, stale: true });
      return res.status(500).json({ success: false, error: e.message });
    }
  };
}

// ═══════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({
    service: 'ZerohedgeQuant API v3',
    status: 'running',
    stocks: Object.keys(STOCKS).length,
    tokenSet: !!CONFIG.accessToken,
    endpoints: ['/api/indices', '/api/market-data', '/api/stock/:symbol', '/api/screener', '/api/search', '/api/option-chain/:underlying', '/api/market-status']
  });
});

// ── INDICES ──
app.get('/api/indices', cached('indices', 10000, async () => {
  const keys = [
    'NSE_INDEX|Nifty 50',
    'NSE_INDEX|Nifty Bank',
    'NSE_INDEX|Nifty IT',
    'NSE_INDEX|Nifty Financial Services'
  ];
  const encoded = keys.map(k => encodeURIComponent(k)).join(',');
  const result = await upstoxFetch('/market-quote/quotes', { instrument_key: encoded });
  if (!result?.data) return null;

  const out = {};
  const nameMap = {
    'NSE_INDEX|Nifty 50': 'NIFTY50',
    'NSE_INDEX|Nifty Bank': 'BANKNIFTY',
    'NSE_INDEX|Nifty IT': 'NIFTYIT',
    'NSE_INDEX|Nifty Financial Services': 'FINNIFTY'
  };

  for (const [rawKey, val] of Object.entries(result.data)) {
    // Upstox returns keys with URL encoding, try to match
    let matched = null;
    for (const [origKey, label] of Object.entries(nameMap)) {
      if (rawKey.includes('Nifty 50') || rawKey.includes('Nifty+50')) { matched = 'NIFTY50'; break; }
      if (rawKey.includes('Nifty Bank') || rawKey.includes('Nifty+Bank')) { matched = 'BANKNIFTY'; break; }
      if (rawKey.includes('Nifty IT') || rawKey.includes('Nifty+IT')) { matched = 'NIFTYIT'; break; }
      if (rawKey.includes('Nifty Financial') || rawKey.includes('Nifty+Financial')) { matched = 'FINNIFTY'; break; }
    }
    if (matched && val) {
      out[matched] = {
        value: val.last_price || 0,
        change: val.net_change || 0,
        changePct: val.percentage_change || 0,
        open: val.ohlc?.open || 0,
        high: val.ohlc?.high || 0,
        low: val.ohlc?.low || 0,
        prevClose: val.ohlc?.close || 0,
        volume: val.volume || 0
      };
    }
  }
  return out;
}));

// ── ALL MARKET DATA ──
app.get('/api/market-data', cached('market', 15000, async () => {
  const symbols = Object.keys(STOCKS);
  const allData = {};

  // Build instrument keys — use NSE_EQ|SYMBOL format
  for (let i = 0; i < symbols.length; i += 20) {
    const batch = symbols.slice(i, i + 20);
    const keys = batch.map(s => `NSE_EQ|${s}`);
    const encoded = keys.map(k => encodeURIComponent(k)).join(',');

    const result = await upstoxFetch('/market-quote/quotes', { instrument_key: encoded });
    if (result?.data) {
      for (const [rawKey, val] of Object.entries(result.data)) {
        if (!val) continue;
        // Extract symbol from key like "NSE_EQ|RELIANCE" or "NSE_EQ|INE..."
        let sym = null;
        for (const s of batch) {
          if (rawKey.includes(s)) { sym = s; break; }
        }
        // Also try matching by trading_symbol from response
        if (!sym && val.trading_symbol) {
          sym = batch.find(s => val.trading_symbol === s || val.trading_symbol.startsWith(s));
        }
        if (sym) {
          const info = STOCKS[sym];
          allData[sym] = {
            symbol: sym,
            name: info.name,
            sector: info.sector,
            industry: info.industry,
            price: val.last_price || 0,
            change: val.net_change || 0,
            changePct: val.percentage_change || 0,
            open: val.ohlc?.open || 0,
            high: val.ohlc?.high || 0,
            low: val.ohlc?.low || 0,
            prevClose: val.ohlc?.close || 0,
            volume: val.volume || 0,
            upperCircuit: val.upper_circuit_limit || 0,
            lowerCircuit: val.lower_circuit_limit || 0,
          };
        }
      }
    }
    if (i + 20 < symbols.length) await new Promise(r => setTimeout(r, 300));
  }

  // Fill missing stocks with info only (price=0)
  for (const [sym, info] of Object.entries(STOCKS)) {
    if (!allData[sym]) {
      allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry, price: 0, change: 0, changePct: 0, volume: 0 };
    }
  }

  return allData;
}));

// ── SINGLE STOCK ──
app.get('/api/stock/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const info = STOCKS[sym];
  if (!info) return res.status(404).json({ success: false, error: 'Stock not found' });

  const key = encodeURIComponent(`NSE_EQ|${sym}`);
  const result = await upstoxFetch('/market-quote/quotes', { instrument_key: key });
  if (!result?.data) return res.json({ success: false, error: 'API error' });

  const val = Object.values(result.data)[0];
  if (!val) return res.json({ success: false, error: 'No data' });

  res.json({
    success: true,
    data: {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      price: val.last_price || 0,
      change: val.net_change || 0,
      changePct: val.percentage_change || 0,
      open: val.ohlc?.open || 0,
      high: val.ohlc?.high || 0,
      low: val.ohlc?.low || 0,
      prevClose: val.ohlc?.close || 0,
      volume: val.volume || 0,
      avgPrice: val.average_price || 0,
      upperCircuit: val.upper_circuit_limit || 0,
      lowerCircuit: val.lower_circuit_limit || 0,
      totalBuyQty: val.total_buy_quantity || 0,
      totalSellQty: val.total_sell_quantity || 0,
      depth: val.depth || null,
    }
  });
});

// ── SEARCH ──
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toUpperCase().trim();
  if (!q) return res.json({ success: true, data: [] });
  const results = Object.entries(STOCKS)
    .filter(([s, i]) => s.includes(q) || i.name.toUpperCase().includes(q) || i.sector.toUpperCase().includes(q))
    .slice(0, 15)
    .map(([s, i]) => ({ symbol: s, name: i.name, sector: i.sector, industry: i.industry }));
  res.json({ success: true, data: results });
});

// ── SCREENER (returns enriched data with fundamentals) ──
app.get('/api/screener', cached('screener', 30000, async () => {
  // First get live prices
  let liveData = cache.market?.data || {};
  if (!Object.keys(liveData).length) {
    // Quick fetch
    const syms = Object.keys(STOCKS);
    for (let i = 0; i < syms.length; i += 20) {
      const batch = syms.slice(i, i + 20);
      const keys = batch.map(s => `NSE_EQ|${s}`);
      const encoded = keys.map(k => encodeURIComponent(k)).join(',');
      const result = await upstoxFetch('/market-quote/quotes', { instrument_key: encoded });
      if (result?.data) {
        for (const [rawKey, val] of Object.entries(result.data)) {
          if (!val) continue;
          const sym = batch.find(s => rawKey.includes(s)) || (val.trading_symbol && batch.find(s => val.trading_symbol.startsWith(s)));
          if (sym) liveData[sym] = val;
        }
      }
      if (i + 20 < syms.length) await new Promise(r => setTimeout(r, 300));
    }
  }

  return Object.entries(STOCKS).map(([sym, info]) => {
    const live = liveData[sym] || {};
    const price = live.price || live.last_price || 0;
    const changePct = live.changePct || live.percentage_change || 0;
    const volume = live.volume || 0;

    // Deterministic pseudo-fundamentals seeded by symbol
    const seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = (min, max, offset = 0) => {
      const x = Math.sin(seed * 9301 + offset * 49297) * 10000;
      return +(min + (x - Math.floor(x)) * (max - min)).toFixed(2);
    };

    const sectorDefaults = {
      Technology: { pe: [22,45], pb: [5,15], roe: [18,35], margin: [15,28], de: [0,0.3], div: [0.3,1.5] },
      Financial:  { pe: [10,25], pb: [1.5,4], roe: [12,22], margin: [20,40], de: [0.5,4], div: [0.5,2] },
      Energy:     { pe: [8,18], pb: [1,3], roe: [10,20], margin: [8,18], de: [0.3,1.5], div: [2,5] },
      Healthcare: { pe: [20,40], pb: [3,10], roe: [15,30], margin: [12,25], de: [0,0.5], div: [0.5,2] },
      'Consumer Defensive': { pe: [35,70], pb: [8,25], roe: [20,45], margin: [10,22], de: [0,0.4], div: [1,3] },
      'Consumer Cyclical':  { pe: [15,35], pb: [3,10], roe: [12,25], margin: [8,18], de: [0.2,1.2], div: [0.5,2] },
      'Basic Materials':    { pe: [8,20], pb: [1,4], roe: [10,22], margin: [8,20], de: [0.3,1.5], div: [1,4] },
      Industrials:          { pe: [15,35], pb: [2,8], roe: [12,22], margin: [8,15], de: [0.3,1.5], div: [0.5,2] },
      Utilities:            { pe: [10,20], pb: [1.5,4], roe: [10,18], margin: [15,30], de: [1,3], div: [2,5] },
      Communication:        { pe: [15,30], pb: [3,8], roe: [10,20], margin: [10,20], de: [0.5,2], div: [0.5,2] },
    };
    const sd = sectorDefaults[info.sector] || sectorDefaults.Industrials;

    const pe = r(sd.pe[0], sd.pe[1], 1);
    const fwdPe = r(sd.pe[0] * 0.8, sd.pe[1] * 0.9, 2);
    const peg = r(0.5, 2.5, 3);
    const ps = r(1, 10, 4);
    const pb = r(sd.pb[0], sd.pb[1], 5);
    const evEbitda = r(8, 25, 6);
    const roe = r(sd.roe[0], sd.roe[1], 7);
    const roa = r(sd.roe[0] * 0.4, sd.roe[1] * 0.6, 8);
    const debtEq = r(sd.de[0], sd.de[1], 9);
    const grossMargin = r(sd.margin[0] + 15, sd.margin[1] + 20, 10);
    const operMargin = r(sd.margin[0] + 5, sd.margin[1] + 8, 11);
    const netMargin = r(sd.margin[0], sd.margin[1], 12);
    const dividend = r(sd.div[0], sd.div[1], 13);
    const eps = price > 0 ? +(price / pe).toFixed(2) : 0;
    const rsi = r(25, 75, 14);
    const beta = r(0.6, 1.5, 15);
    const sma20 = price > 0 ? +(price * r(0.96, 1.04, 16)).toFixed(2) : 0;
    const sma50 = price > 0 ? +(price * r(0.92, 1.08, 17)).toFixed(2) : 0;
    const sma200 = price > 0 ? +(price * r(0.82, 1.18, 18)).toFixed(2) : 0;
    const high52 = price > 0 ? +(price * r(1.05, 1.40, 19)).toFixed(2) : 0;
    const low52 = price > 0 ? +(price * r(0.60, 0.92, 20)).toFixed(2) : 0;
    const volatility = r(1, 5, 21);
    const avgVol = Math.floor(r(500000, 15000000, 22));
    const targetPrice = price > 0 ? +(price * r(1.02, 1.30, 23)).toFixed(2) : 0;
    const mcapVal = price > 0 ? +(price * r(100, 900, 24) * 1000000).toFixed(0) : 0;

    return {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      exchange: 'NSE', country: 'India', mcap: info.mcap,
      price, change: live.change || live.net_change || 0, changePct,
      volume, avgVolume: avgVol,
      open: live.open || live.ohlc?.open || 0,
      high: live.high || live.ohlc?.high || 0,
      low: live.low || live.ohlc?.low || 0,
      prevClose: live.prevClose || live.ohlc?.close || 0,
      // Fundamentals
      pe, fwdPe, peg, ps, pb, evEbitda, eps,
      roe, roa, debtEquity: debtEq,
      grossMargin, operatingMargin: operMargin, netMargin,
      dividend, marketCap: mcapVal, targetPrice,
      // Technicals
      rsi, beta, sma20, sma50, sma200,
      high52w: high52, low52w: low52,
      volatility,
      perf1w: r(-5, 5, 25), perf1m: r(-10, 10, 26), perf3m: r(-15, 15, 27),
      perf6m: r(-20, 25, 28), perfYTD: r(-15, 30, 29), perf1y: r(-20, 50, 30),
      gap: r(-3, 3, 31),
      relVolume: r(0.5, 2.5, 32),
      pattern: ['Double Bottom', 'Head & Shoulders', 'Ascending Triangle', 'Channel Up', 'Wedge Down', 'Cup & Handle', 'None'][seed % 7],
      candlestick: ['Hammer', 'Doji', 'Engulfing', 'Morning Star', 'Spinning Top', 'Marubozu', 'None'][seed % 7],
      analystRec: ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][(seed * 3) % 5],
    };
  });
}));

// ── OPTION CHAIN ──
app.get('/api/option-chain/:underlying', async (req, res) => {
  const ul = req.params.underlying.toUpperCase();
  const expiry = req.query.expiry || '';

  // Map underlying to instrument key
  let instKey;
  if (ul === 'NIFTY' || ul === 'NIFTY50') instKey = 'NSE_INDEX|Nifty 50';
  else if (ul === 'BANKNIFTY') instKey = 'NSE_INDEX|Nifty Bank';
  else if (ul === 'FINNIFTY') instKey = 'NSE_INDEX|Nifty Financial Services';
  else if (STOCKS[ul]) instKey = `NSE_EQ|${ul}`;
  else return res.status(404).json({ success: false, error: 'Unknown underlying' });

  // Try real Upstox option chain
  const params = { instrument_key: instKey };
  if (expiry) params.expiry_date = expiry;
  const result = await upstoxFetch('/option/chain', params);

  if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
    // Parse real option chain data
    const spotResult = await upstoxFetch('/market-quote/ltp', { instrument_key: encodeURIComponent(instKey) });
    const spotPrice = spotResult?.data ? Object.values(spotResult.data)[0]?.last_price || 0 : 0;

    const strikes = result.data.map(item => ({
      strike_price: item.strike_price,
      call: item.call_options ? {
        ltp: item.call_options.market_data?.ltp || 0,
        change: item.call_options.market_data?.net_change || 0,
        volume: item.call_options.market_data?.volume || 0,
        oi: item.call_options.market_data?.oi || 0,
        oi_change: item.call_options.market_data?.oi_change || 0,
        iv: item.call_options.option_greeks?.iv || 0,
        delta: item.call_options.option_greeks?.delta || 0,
        theta: item.call_options.option_greeks?.theta || 0,
        gamma: item.call_options.option_greeks?.gamma || 0,
        vega: item.call_options.option_greeks?.vega || 0,
      } : null,
      put: item.put_options ? {
        ltp: item.put_options.market_data?.ltp || 0,
        change: item.put_options.market_data?.net_change || 0,
        volume: item.put_options.market_data?.volume || 0,
        oi: item.put_options.market_data?.oi || 0,
        oi_change: item.put_options.market_data?.oi_change || 0,
        iv: item.put_options.option_greeks?.iv || 0,
        delta: item.put_options.option_greeks?.delta || 0,
        theta: item.put_options.option_greeks?.theta || 0,
        gamma: item.put_options.option_greeks?.gamma || 0,
        vega: item.put_options.option_greeks?.vega || 0,
      } : null,
    }));

    return res.json({
      success: true,
      data: { underlying: ul, spot_price: spotPrice, expiry: expiry || 'next', strikes },
      live: true
    });
  }

  // Fallback: simulated option chain
  let spot = 0;
  try {
    const spotR = await upstoxFetch('/market-quote/ltp', { instrument_key: encodeURIComponent(instKey) });
    spot = spotR?.data ? Object.values(spotR.data)[0]?.last_price || 0 : 0;
  } catch (e) {}
  if (!spot) {
    if (ul.includes('NIFTY') && !ul.includes('BANK') && !ul.includes('FIN')) spot = 23500;
    else if (ul.includes('BANK')) spot = 50000;
    else if (ul.includes('FIN')) spot = 21000;
    else spot = 2000;
  }

  const step = spot > 10000 ? 100 : spot > 1000 ? 50 : 25;
  const atm = Math.round(spot / step) * step;
  const strikes = [];
  for (let i = -12; i <= 12; i++) {
    const strike = atm + i * step;
    const itmC = Math.max(0, spot - strike);
    const itmP = Math.max(0, strike - spot);
    const tv = spot * 0.018 * Math.exp(-Math.abs(i) * 0.25);
    strikes.push({
      strike_price: strike,
      call: {
        ltp: +(itmC + tv + Math.random() * 3).toFixed(2),
        change: +((Math.random() - 0.5) * 12).toFixed(2),
        volume: Math.floor(Math.random() * 200000) + 500,
        oi: Math.floor(Math.random() * 1000000) + 2000,
        oi_change: Math.floor((Math.random() - 0.3) * 60000),
        iv: +(11 + Math.abs(i) * 0.7 + Math.random() * 2).toFixed(2),
      },
      put: {
        ltp: +(itmP + tv + Math.random() * 3).toFixed(2),
        change: +((Math.random() - 0.5) * 12).toFixed(2),
        volume: Math.floor(Math.random() * 200000) + 500,
        oi: Math.floor(Math.random() * 1000000) + 2000,
        oi_change: Math.floor((Math.random() - 0.3) * 60000),
        iv: +(11 + Math.abs(i) * 0.7 + Math.random() * 2).toFixed(2),
      },
    });
  }

  // Get upcoming expiry dates (next 4 Thursdays)
  const expiries = [];
  const today = new Date();
  let d = new Date(today);
  for (let count = 0; count < 4; count++) {
    d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
    expiries.push(d.toISOString().split('T')[0]);
    d = new Date(d);
    d.setDate(d.getDate() + 1);
  }

  res.json({
    success: true,
    data: { underlying: ul, spot_price: spot, expiry: expiry || expiries[0], expiries, strikes },
    simulated: true
  });
});

// ── MARKET STATUS ──
app.get('/api/market-status', (req, res) => {
  const now = new Date();
  const istStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const ist = new Date(istStr);
  const h = ist.getHours(), m = ist.getMinutes(), day = ist.getDay();
  const t = h * 60 + m;
  const weekday = day >= 1 && day <= 5;

  let status = 'closed';
  if (weekday) {
    if (t >= 555 && t < 570) status = 'pre-open';
    else if (t >= 570 && t < 930) status = 'open';
    else if (t >= 930 && t < 960) status = 'post-close';
  }

  res.json({ success: true, data: { status, ist: istStr } });
});

// ── STOCKS LIST ──
app.get('/api/stocks-list', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(STOCKS).map(([s, i]) => ({ symbol: s, name: i.name, sector: i.sector, industry: i.industry }))
  });
});

// ═══════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`🚀 ZerohedgeQuant API v3 on port ${PORT}`);
  console.log(`📊 ${Object.keys(STOCKS).length} stocks tracked`);
  console.log(`🔑 Token configured: ${CONFIG.accessToken ? 'YES' : 'NO'}`);
});
