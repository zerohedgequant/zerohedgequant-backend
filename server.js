const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

const CONFIG = {
  accessToken: process.env.UPSTOX_ACCESS_TOKEN || '',
  baseUrl: 'https://api.upstox.com/v2'
};

app.use(cors({ origin: '*', methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

// ═══════════════════════════════════════════════════════
// STOCK UNIVERSE — ISIN keys (confirmed working)
// ═══════════════════════════════════════════════════════
const STOCKS = {
  'RELIANCE':   { name: 'Reliance Industries', sector: 'Energy', industry: 'Oil & Gas - Refining', isin: 'INE002A01018' },
  'TCS':        { name: 'Tata Consultancy Services', sector: 'Technology', industry: 'IT Services', isin: 'INE467B01029' },
  'HDFCBANK':   { name: 'HDFC Bank', sector: 'Financial', industry: 'Banks - Private', isin: 'INE040A01034' },
  'INFY':       { name: 'Infosys', sector: 'Technology', industry: 'IT Services', isin: 'INE009A01021' },
  'ICICIBANK':  { name: 'ICICI Bank', sector: 'Financial', industry: 'Banks - Private', isin: 'INE090A01021' },
  'BHARTIARTL': { name: 'Bharti Airtel', sector: 'Communication', industry: 'Telecom', isin: 'INE397D01024' },
  'SBIN':       { name: 'State Bank of India', sector: 'Financial', industry: 'Banks - Public', isin: 'INE062A01020' },
  'ITC':        { name: 'ITC Ltd', sector: 'Consumer Defensive', industry: 'FMCG', isin: 'INE154A01025' },
  'KOTAKBANK':  { name: 'Kotak Mahindra Bank', sector: 'Financial', industry: 'Banks - Private', isin: 'INE237A01028' },
  'LT':         { name: 'Larsen & Toubro', sector: 'Industrials', industry: 'Engineering', isin: 'INE018A01030' },
  'HINDUNILVR': { name: 'Hindustan Unilever', sector: 'Consumer Defensive', industry: 'FMCG', isin: 'INE030A01027' },
  'AXISBANK':   { name: 'Axis Bank', sector: 'Financial', industry: 'Banks - Private', isin: 'INE238A01034' },
  'BAJFINANCE': { name: 'Bajaj Finance', sector: 'Financial', industry: 'NBFC', isin: 'INE296A01024' },
  'MARUTI':     { name: 'Maruti Suzuki', sector: 'Consumer Cyclical', industry: 'Auto', isin: 'INE585B01010' },
  'TATAMOTORS': { name: 'Tata Motors', sector: 'Consumer Cyclical', industry: 'Auto', isin: 'INE155A01022' },
  'SUNPHARMA':  { name: 'Sun Pharma', sector: 'Healthcare', industry: 'Pharma', isin: 'INE044A01036' },
  'TITAN':      { name: 'Titan Company', sector: 'Consumer Cyclical', industry: 'Jewelry', isin: 'INE280A01028' },
  'ASIANPAINT': { name: 'Asian Paints', sector: 'Basic Materials', industry: 'Paints', isin: 'INE021A01026' },
  'WIPRO':      { name: 'Wipro', sector: 'Technology', industry: 'IT Services', isin: 'INE075A01022' },
  'HCLTECH':    { name: 'HCL Technologies', sector: 'Technology', industry: 'IT Services', isin: 'INE860A01027' },
  'ULTRACEMCO': { name: 'UltraTech Cement', sector: 'Basic Materials', industry: 'Cement', isin: 'INE481G01011' },
  'POWERGRID':  { name: 'Power Grid Corp', sector: 'Utilities', industry: 'Power', isin: 'INE752E01010' },
  'NTPC':       { name: 'NTPC Ltd', sector: 'Utilities', industry: 'Power', isin: 'INE733E01010' },
  'TATASTEEL':  { name: 'Tata Steel', sector: 'Basic Materials', industry: 'Steel', isin: 'INE081A01020' },
  'NESTLEIND':  { name: 'Nestle India', sector: 'Consumer Defensive', industry: 'FMCG', isin: 'INE239A01016' },
  'TECHM':      { name: 'Tech Mahindra', sector: 'Technology', industry: 'IT Services', isin: 'INE669C01036' },
  'ONGC':       { name: 'ONGC', sector: 'Energy', industry: 'Oil & Gas', isin: 'INE213A01029' },
  'ADANIENT':   { name: 'Adani Enterprises', sector: 'Industrials', industry: 'Conglomerate', isin: 'INE423A01024' },
  'ADANIPORTS': { name: 'Adani Ports', sector: 'Industrials', industry: 'Ports', isin: 'INE742F01042' },
  'COALINDIA':  { name: 'Coal India', sector: 'Energy', industry: 'Mining', isin: 'INE522F01014' },
  'BAJAJFINSV': { name: 'Bajaj Finserv', sector: 'Financial', industry: 'Financial Services', isin: 'INE918I01026' },
  'JSWSTEEL':   { name: 'JSW Steel', sector: 'Basic Materials', industry: 'Steel', isin: 'INE019A01038' },
  'INDUSINDBK': { name: 'IndusInd Bank', sector: 'Financial', industry: 'Banks - Private', isin: 'INE095A01012' },
  'GRASIM':     { name: 'Grasim Industries', sector: 'Basic Materials', industry: 'Cement', isin: 'INE047A01021' },
  'CIPLA':      { name: 'Cipla', sector: 'Healthcare', industry: 'Pharma', isin: 'INE059A01026' },
  'DRREDDY':    { name: "Dr. Reddy's Labs", sector: 'Healthcare', industry: 'Pharma', isin: 'INE089A01023' },
  'EICHERMOT':  { name: 'Eicher Motors', sector: 'Consumer Cyclical', industry: 'Auto', isin: 'INE066A01021' },
  'DIVISLAB':   { name: "Divi's Laboratories", sector: 'Healthcare', industry: 'Pharma', isin: 'INE361B01024' },
  'BPCL':       { name: 'BPCL', sector: 'Energy', industry: 'Oil & Gas', isin: 'INE541A01028' },
  'BRITANNIA':  { name: 'Britannia Industries', sector: 'Consumer Defensive', industry: 'FMCG', isin: 'INE216A01030' },
  'HEROMOTOCO': { name: 'Hero MotoCorp', sector: 'Consumer Cyclical', industry: 'Auto', isin: 'INE158A01026' },
  'APOLLOHOSP': { name: 'Apollo Hospitals', sector: 'Healthcare', industry: 'Hospitals', isin: 'INE437A01024' },
  'HINDALCO':   { name: 'Hindalco', sector: 'Basic Materials', industry: 'Metals', isin: 'INE038A01020' },
  'SBILIFE':    { name: 'SBI Life Insurance', sector: 'Financial', industry: 'Insurance', isin: 'INE123W01016' },
  'TATACONSUM': { name: 'Tata Consumer', sector: 'Consumer Defensive', industry: 'FMCG', isin: 'INE192A01025' },
  'BAJAJ-AUTO': { name: 'Bajaj Auto', sector: 'Consumer Cyclical', industry: 'Auto', isin: 'INE917I01010' },
  'HDFCLIFE':   { name: 'HDFC Life Insurance', sector: 'Financial', industry: 'Insurance', isin: 'INE795G01014' },
  'M&M':        { name: 'Mahindra & Mahindra', sector: 'Consumer Cyclical', industry: 'Auto', isin: 'INE101A01026' },
  'LTIM':       { name: 'LTIMindtree', sector: 'Technology', industry: 'IT Services', isin: 'INE214T01019' },
  'SHRIRAMFIN': { name: 'Shriram Finance', sector: 'Financial', industry: 'NBFC', isin: 'INE721A01013' },
};

// ═══════════════════════════════════════════════════════
// UPSTOX HELPERS
// ═══════════════════════════════════════════════════════
async function upstoxFetch(endpoint, params = {}) {
  try {
    const r = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${CONFIG.accessToken}`, 'Accept': 'application/json' },
      params,
      timeout: 12000
    });
    return r.data;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    console.error(`[Upstox ${endpoint}] ${status}: ${msg}`);
    return null;
  }
}

function instKey(sym) {
  return STOCKS[sym] ? `NSE_EQ|${STOCKS[sym].isin}` : null;
}

function matchSymbol(rawKey, batchSymbols) {
  for (const sym of batchSymbols) {
    if (rawKey.includes(STOCKS[sym].isin)) return sym;
  }
  return null;
}

// ═══════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════
const cache = {};
function withCache(key, ttlMs, fetchFn) {
  return async (req, res) => {
    const now = Date.now();
    if (cache[key] && now - cache[key].ts < ttlMs) {
      return res.json({ success: true, data: cache[key].data, cached: true });
    }
    try {
      const data = await fetchFn(req);
      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        cache[key] = { data, ts: now };
        return res.json({ success: true, data });
      }
      if (cache[key]) return res.json({ success: true, data: cache[key].data, stale: true });
      return res.json({ success: false, error: 'No data available' });
    } catch (e) {
      console.error(`[${key}]`, e.message);
      if (cache[key]) return res.json({ success: true, data: cache[key].data, stale: true });
      return res.status(500).json({ success: false, error: e.message });
    }
  };
}

// ═══════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({ service: 'ZerohedgeQuant API v4.0', status: 'running', stocks: Object.keys(STOCKS).length, tokenSet: !!CONFIG.accessToken });
});

// ── INDICES (confirmed: NSE_INDEX|Nifty 50 works) ──
app.get('/api/indices', withCache('indices', 10000, async () => {
  // Fetch one at a time since batch might have encoding issues
  const indexList = [
    { key: 'NSE_INDEX|Nifty 50', label: 'NIFTY50' },
    { key: 'NSE_INDEX|Nifty Bank', label: 'BANKNIFTY' },
    { key: 'NSE_INDEX|Nifty IT', label: 'NIFTYIT' },
    { key: 'NSE_INDEX|Nifty Financial Services', label: 'FINNIFTY' },
  ];

  const out = {};
  for (const idx of indexList) {
    const result = await upstoxFetch('/market-quote/ltp', { instrument_key: idx.key });
    if (result?.data) {
      const val = Object.values(result.data)[0];
      if (val && val.last_price) {
        out[idx.label] = {
          value: val.last_price,
          change: val.net_change || 0,
          changePct: val.percentage_change || 0,
        };
      }
    }
  }

  // Now get full quotes for NIFTY50 to get OHLC
  const niftyFull = await upstoxFetch('/market-quote/quotes', { instrument_key: 'NSE_INDEX|Nifty 50' });
  if (niftyFull?.data) {
    const v = Object.values(niftyFull.data)[0];
    if (v && out.NIFTY50) {
      out.NIFTY50.change = v.net_change || out.NIFTY50.change;
      out.NIFTY50.changePct = v.percentage_change || out.NIFTY50.changePct;
      out.NIFTY50.open = v.ohlc?.open || 0;
      out.NIFTY50.high = v.ohlc?.high || 0;
      out.NIFTY50.low = v.ohlc?.low || 0;
      out.NIFTY50.prevClose = v.ohlc?.close || 0;
    }
  }

  console.log(`[Indices] Loaded: ${Object.keys(out).join(', ')} | NIFTY=${out.NIFTY50?.value || 'N/A'}`);
  return out;
}));

// ── MARKET DATA (all stocks) ──
app.get('/api/market-data', withCache('market', 15000, async () => {
  const symbols = Object.keys(STOCKS);
  const allData = {};
  let liveCount = 0;

  // Fetch in small batches of 10 using ISIN keys
  for (let i = 0; i < symbols.length; i += 10) {
    const batch = symbols.slice(i, i + 10);
    const keys = batch.map(s => instKey(s)).filter(Boolean);
    const joined = keys.join(',');

    const result = await upstoxFetch('/market-quote/quotes', { instrument_key: joined });
    if (result?.data) {
      for (const [rawKey, val] of Object.entries(result.data)) {
        if (!val || !val.last_price) continue;
        const sym = matchSymbol(rawKey, batch);
        if (sym) {
          allData[sym] = {
            symbol: sym,
            name: STOCKS[sym].name,
            sector: STOCKS[sym].sector,
            industry: STOCKS[sym].industry,
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
          liveCount++;
        }
      }
    }
    // Rate limit pause
    if (i + 10 < symbols.length) await new Promise(r => setTimeout(r, 400));
  }

  // Fill missing stocks
  for (const [sym, info] of Object.entries(STOCKS)) {
    if (!allData[sym]) {
      allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry, price: 0, change: 0, changePct: 0, volume: 0 };
    }
  }

  console.log(`[Market] ${liveCount}/${symbols.length} stocks with live prices`);
  return allData;
}));

// ── SINGLE STOCK ──
app.get('/api/stock/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const info = STOCKS[sym];
  if (!info) return res.status(404).json({ success: false, error: 'Stock not found' });

  const result = await upstoxFetch('/market-quote/quotes', { instrument_key: `NSE_EQ|${info.isin}` });
  if (!result?.data) return res.json({ success: false, error: 'API error' });

  const val = Object.values(result.data)[0];
  if (!val) return res.json({ success: false, error: 'No data' });

  res.json({
    success: true,
    data: {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      price: val.last_price || 0, change: val.net_change || 0, changePct: val.percentage_change || 0,
      open: val.ohlc?.open || 0, high: val.ohlc?.high || 0, low: val.ohlc?.low || 0, prevClose: val.ohlc?.close || 0,
      volume: val.volume || 0, avgPrice: val.average_price || 0,
      upperCircuit: val.upper_circuit_limit || 0, lowerCircuit: val.lower_circuit_limit || 0,
      totalBuyQty: val.total_buy_quantity || 0, totalSellQty: val.total_sell_quantity || 0,
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

// ── SCREENER ──
app.get('/api/screener', withCache('screener', 30000, async () => {
  // Use cached market data if available, otherwise fetch
  let liveData = cache.market?.data || {};
  const hasLive = Object.values(liveData).some(s => s.price > 0);

  if (!hasLive) {
    const symbols = Object.keys(STOCKS);
    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10);
      const keys = batch.map(s => instKey(s)).filter(Boolean).join(',');
      const result = await upstoxFetch('/market-quote/quotes', { instrument_key: keys });
      if (result?.data) {
        for (const [rawKey, val] of Object.entries(result.data)) {
          if (!val) continue;
          const sym = matchSymbol(rawKey, batch);
          if (sym) liveData[sym] = { price: val.last_price, change: val.net_change, changePct: val.percentage_change, volume: val.volume, open: val.ohlc?.open, high: val.ohlc?.high, low: val.ohlc?.low, prevClose: val.ohlc?.close };
        }
      }
      if (i + 10 < symbols.length) await new Promise(r => setTimeout(r, 400));
    }
  }

  return Object.entries(STOCKS).map(([sym, info]) => {
    const live = liveData[sym] || {};
    const price = live.price || 0;
    const changePct = live.changePct || 0;
    const volume = live.volume || 0;

    const seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (min, max, off = 0) => {
      const x = Math.sin(seed * 9301 + off * 49297) * 10000;
      return +(min + (x - Math.floor(x)) * (max - min)).toFixed(2);
    };

    const sd = {
      Technology: { pe:[22,45], pb:[5,15], roe:[18,35], mg:[15,28], de:[0,0.3], dv:[0.3,1.5] },
      Financial:  { pe:[10,25], pb:[1.5,4], roe:[12,22], mg:[20,40], de:[0.5,4], dv:[0.5,2] },
      Energy:     { pe:[8,18], pb:[1,3], roe:[10,20], mg:[8,18], de:[0.3,1.5], dv:[2,5] },
      Healthcare: { pe:[20,40], pb:[3,10], roe:[15,30], mg:[12,25], de:[0,0.5], dv:[0.5,2] },
      'Consumer Defensive': { pe:[35,70], pb:[8,25], roe:[20,45], mg:[10,22], de:[0,0.4], dv:[1,3] },
      'Consumer Cyclical':  { pe:[15,35], pb:[3,10], roe:[12,25], mg:[8,18], de:[0.2,1.2], dv:[0.5,2] },
      'Basic Materials':    { pe:[8,20], pb:[1,4], roe:[10,22], mg:[8,20], de:[0.3,1.5], dv:[1,4] },
      Industrials:          { pe:[15,35], pb:[2,8], roe:[12,22], mg:[8,15], de:[0.3,1.5], dv:[0.5,2] },
      Utilities:            { pe:[10,20], pb:[1.5,4], roe:[10,18], mg:[15,30], de:[1,3], dv:[2,5] },
      Communication:        { pe:[15,30], pb:[3,8], roe:[10,20], mg:[10,20], de:[0.5,2], dv:[0.5,2] },
    }[info.sector] || { pe:[15,30], pb:[2,6], roe:[12,22], mg:[10,20], de:[0.3,1.5], dv:[0.5,2] };

    const pe = rng(sd.pe[0], sd.pe[1], 1);
    const pb = rng(sd.pb[0], sd.pb[1], 5);
    const roe = rng(sd.roe[0], sd.roe[1], 7);
    const netMargin = rng(sd.mg[0], sd.mg[1], 12);
    const dividend = rng(sd.dv[0], sd.dv[1], 13);

    return {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      exchange: 'NSE', country: 'India', mcap: 'Large',
      price, change: live.change || 0, changePct, volume, avgVolume: Math.floor(rng(500000,15000000,22)),
      open: live.open || 0, high: live.high || 0, low: live.low || 0, prevClose: live.prevClose || 0,
      pe, fwdPe: rng(sd.pe[0]*0.8, sd.pe[1]*0.9, 2), peg: rng(0.5,2.5,3), ps: rng(1,10,4), pb,
      evEbitda: rng(8,25,6), eps: price > 0 ? +(price/pe).toFixed(2) : 0,
      roe, roa: rng(sd.roe[0]*0.4, sd.roe[1]*0.6, 8), debtEquity: rng(sd.de[0], sd.de[1], 9),
      grossMargin: rng(sd.mg[0]+15, sd.mg[1]+20, 10), operatingMargin: rng(sd.mg[0]+5, sd.mg[1]+8, 11),
      netMargin, dividend,
      marketCap: price > 0 ? +(price * rng(100,900,24) * 1000000).toFixed(0) : 0,
      targetPrice: price > 0 ? +(price * rng(1.02,1.30,23)).toFixed(2) : 0,
      rsi: rng(25,75,14), beta: rng(0.6,1.5,15),
      sma20: price > 0 ? +(price * rng(0.96,1.04,16)).toFixed(2) : 0,
      sma50: price > 0 ? +(price * rng(0.92,1.08,17)).toFixed(2) : 0,
      sma200: price > 0 ? +(price * rng(0.82,1.18,18)).toFixed(2) : 0,
      high52w: price > 0 ? +(price * rng(1.05,1.40,19)).toFixed(2) : 0,
      low52w: price > 0 ? +(price * rng(0.60,0.92,20)).toFixed(2) : 0,
      volatility: rng(1,5,21),
      perf1w: rng(-5,5,25), perf1m: rng(-10,10,26), perf3m: rng(-15,15,27),
      perf6m: rng(-20,25,28), perfYTD: rng(-15,30,29), perf1y: rng(-20,50,30),
      gap: rng(-3,3,31), relVolume: rng(0.5,2.5,32),
      pattern: ['Double Bottom','Head & Shoulders','Ascending Triangle','Channel Up','Wedge Down','Cup & Handle','None'][seed%7],
      candlestick: ['Hammer','Doji','Engulfing','Morning Star','Spinning Top','Marubozu','None'][seed%7],
      analystRec: ['Strong Buy','Buy','Hold','Sell','Strong Sell'][(seed*3)%5],
    };
  });
}));

// ── OPTION CHAIN ──
app.get('/api/option-chain/:underlying', async (req, res) => {
  const ul = req.params.underlying.toUpperCase();
  const expiry = req.query.expiry || '';

  let instKeyOC;
  if (ul === 'NIFTY' || ul === 'NIFTY50') instKeyOC = 'NSE_INDEX|Nifty 50';
  else if (ul === 'BANKNIFTY') instKeyOC = 'NSE_INDEX|Nifty Bank';
  else if (ul === 'FINNIFTY') instKeyOC = 'NSE_INDEX|Nifty Financial Services';
  else if (STOCKS[ul]) instKeyOC = `NSE_EQ|${STOCKS[ul].isin}`;
  else return res.status(404).json({ success: false, error: 'Unknown underlying' });

  // Try real option chain
  const params = { instrument_key: instKeyOC };
  if (expiry) params.expiry_date = expiry;
  const result = await upstoxFetch('/option/chain', params);

  if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
    const spotR = await upstoxFetch('/market-quote/ltp', { instrument_key: instKeyOC });
    const spotPrice = spotR?.data ? Object.values(spotR.data)[0]?.last_price || 0 : 0;

    const strikes = result.data.map(item => ({
      strike_price: item.strike_price,
      call: item.call_options ? {
        ltp: item.call_options.market_data?.ltp || 0,
        change: item.call_options.market_data?.net_change || 0,
        volume: item.call_options.market_data?.volume || 0,
        oi: item.call_options.market_data?.oi || 0,
        oi_change: item.call_options.market_data?.oi_change || 0,
        iv: item.call_options.option_greeks?.iv || 0,
      } : null,
      put: item.put_options ? {
        ltp: item.put_options.market_data?.ltp || 0,
        change: item.put_options.market_data?.net_change || 0,
        volume: item.put_options.market_data?.volume || 0,
        oi: item.put_options.market_data?.oi || 0,
        oi_change: item.put_options.market_data?.oi_change || 0,
        iv: item.put_options.option_greeks?.iv || 0,
      } : null,
    }));

    return res.json({ success: true, data: { underlying: ul, spot_price: spotPrice, expiry: expiry || 'next', strikes }, live: true });
  }

  // Fallback: simulated option chain
  let spot = 0;
  const spotR2 = await upstoxFetch('/market-quote/ltp', { instrument_key: instKeyOC });
  if (spotR2?.data) spot = Object.values(spotR2.data)[0]?.last_price || 0;
  if (!spot) {
    if (ul.includes('NIFTY') && !ul.includes('BANK') && !ul.includes('FIN')) spot = 25800;
    else if (ul.includes('BANK')) spot = 55000;
    else if (ul.includes('FIN')) spot = 24000;
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
      call: { ltp: +(itmC+tv+Math.random()*3).toFixed(2), change: +((Math.random()-0.5)*12).toFixed(2), volume: Math.floor(Math.random()*200000)+500, oi: Math.floor(Math.random()*1000000)+2000, oi_change: Math.floor((Math.random()-0.3)*60000), iv: +(11+Math.abs(i)*0.7+Math.random()*2).toFixed(2) },
      put: { ltp: +(itmP+tv+Math.random()*3).toFixed(2), change: +((Math.random()-0.5)*12).toFixed(2), volume: Math.floor(Math.random()*200000)+500, oi: Math.floor(Math.random()*1000000)+2000, oi_change: Math.floor((Math.random()-0.3)*60000), iv: +(11+Math.abs(i)*0.7+Math.random()*2).toFixed(2) },
    });
  }

  const expiries = [];
  let d = new Date();
  for (let c = 0; c < 4; c++) {
    d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
    expiries.push(d.toISOString().split('T')[0]);
    d = new Date(d); d.setDate(d.getDate() + 1);
  }

  res.json({ success: true, data: { underlying: ul, spot_price: spot, expiry: expiry || expiries[0], expiries, strikes }, simulated: true });
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
  res.json({ success: true, data: Object.entries(STOCKS).map(([s, i]) => ({ symbol: s, name: i.name, sector: i.sector, industry: i.industry })) });
});

// ═══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`ZerohedgeQuant API v4.0 on port ${PORT}`);
  console.log(`${Object.keys(STOCKS).length} stocks | Token: ${CONFIG.accessToken ? 'SET' : 'MISSING'}`);
  console.log(`Sample key: NSE_EQ|${STOCKS.RELIANCE.isin}`);
});
