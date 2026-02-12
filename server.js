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
// STOCK UNIVERSE — 50 Nifty stocks, confirmed ISINs
// ═══════════════════════════════════════════════════════
const STOCKS = {
  'RELIANCE':   { name: 'Reliance Industries', sector: 'Energy', industry: 'Oil & Gas', isin: 'INE002A01018' },
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
// UPSTOX HELPER (confirmed working format: NSE_EQ|ISIN)
// ═══════════════════════════════════════════════════════
async function upstoxFetch(endpoint, params = {}) {
  try {
    const r = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${CONFIG.accessToken}`, 'Accept': 'application/json' },
      params, timeout: 12000
    });
    return r.data;
  } catch (err) {
    const s = err.response?.status;
    const m = err.response?.data?.errors?.[0]?.message || err.message;
    console.error(`[Upstox ${endpoint}] ${s}: ${m}`);
    return null;
  }
}

function matchSymbol(rawKey, batch) {
  for (const sym of batch) {
    if (rawKey.includes(STOCKS[sym].isin)) return sym;
  }
  return null;
}

// ═══════════════════════════════════════════════════════
// YAHOO FINANCE HELPER (real fundamentals)
// ═══════════════════════════════════════════════════════
const yahooCache = {}; // { symbol: { data, ts } }
const YAHOO_TTL = 4 * 60 * 60 * 1000; // 4 hours

async function fetchYahooFundamentals(symbol) {
  // Check cache
  const cached = yahooCache[symbol];
  if (cached && Date.now() - cached.ts < YAHOO_TTL) return cached.data;

  const yahooSym = symbol.replace('&', '%26') + '.NS';
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${yahooSym}?modules=price,summaryDetail,defaultKeyStatistics,financialData`;

  try {
    const resp = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 8000
    });

    const result = resp.data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const sd = result.summaryDetail || {};
    const ks = result.defaultKeyStatistics || {};
    const fd = result.financialData || {};
    const pr = result.price || {};

    const extract = (obj) => obj?.raw ?? obj?.fmt ?? null;

    const data = {
      // Valuation
      pe: extract(sd.trailingPE),
      fwdPe: extract(ks.forwardPE),
      pb: extract(ks.priceToBook),
      peg: extract(ks.pegRatio),
      evEbitda: extract(ks.enterpriseToEbitda),
      ps: extract(ks.priceToSalesTrailing12Months),
      marketCap: extract(pr.marketCap),
      // Profitability
      roe: extract(fd.returnOnEquity) ? +(extract(fd.returnOnEquity) * 100).toFixed(2) : null,
      roa: extract(fd.returnOnAssets) ? +(extract(fd.returnOnAssets) * 100).toFixed(2) : null,
      grossMargin: extract(fd.grossMargins) ? +(extract(fd.grossMargins) * 100).toFixed(2) : null,
      operatingMargin: extract(fd.operatingMargins) ? +(extract(fd.operatingMargins) * 100).toFixed(2) : null,
      netMargin: extract(fd.profitMargins) ? +(extract(fd.profitMargins) * 100).toFixed(2) : null,
      // Per share
      eps: extract(sd.trailingEps) || extract(ks.trailingEps),
      bookValue: extract(ks.bookValue),
      // Dividends
      dividend: extract(sd.dividendYield) ? +(extract(sd.dividendYield) * 100).toFixed(2) : null,
      dividendRate: extract(sd.dividendRate),
      // Risk
      beta: extract(ks.beta),
      debtEquity: extract(fd.debtToEquity) ? +(extract(fd.debtToEquity)).toFixed(2) : null,
      currentRatio: extract(fd.currentRatio),
      // 52 week
      high52w: extract(sd.fiftyTwoWeekHigh),
      low52w: extract(sd.fiftyTwoWeekLow),
      sma50: extract(sd.fiftyDayAverage),
      sma200: extract(sd.twoHundredDayAverage),
      // Growth
      revenueGrowth: extract(fd.revenueGrowth) ? +(extract(fd.revenueGrowth) * 100).toFixed(2) : null,
      earningsGrowth: extract(fd.earningsGrowth) ? +(extract(fd.earningsGrowth) * 100).toFixed(2) : null,
      // Target
      targetPrice: extract(fd.targetMeanPrice),
      analystRec: fd.recommendationKey || null,
      numAnalysts: extract(fd.numberOfAnalystOpinions),
    };

    yahooCache[symbol] = { data, ts: Date.now() };
    return data;
  } catch (err) {
    console.error(`[Yahoo ${symbol}] ${err.response?.status || err.message}`);
    return null;
  }
}

// Background: fetch fundamentals for all stocks gradually
let yahooFetchInProgress = false;
async function backgroundFetchFundamentals() {
  if (yahooFetchInProgress) return;
  yahooFetchInProgress = true;
  console.log('[Yahoo] Starting background fundamental fetch...');
  let count = 0;
  for (const sym of Object.keys(STOCKS)) {
    if (yahooCache[sym] && Date.now() - yahooCache[sym].ts < YAHOO_TTL) continue;
    await fetchYahooFundamentals(sym);
    count++;
    await new Promise(r => setTimeout(r, 500)); // Rate limit: 2 req/sec
  }
  console.log(`[Yahoo] Background fetch done. ${count} stocks updated.`);
  yahooFetchInProgress = false;
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
  res.json({
    service: 'ZerohedgeQuant API v5.0 (Production)',
    status: 'running',
    stocks: Object.keys(STOCKS).length,
    tokenSet: !!CONFIG.accessToken,
    yahooFundamentals: Object.keys(yahooCache).length,
    dataDisclaimer: 'Prices from Upstox. Fundamentals from Yahoo Finance. Option chain from Upstox.'
  });
});

// ── INDICES ──
app.get('/api/indices', withCache('indices', 10000, async () => {
  const indexList = [
    { key: 'NSE_INDEX|Nifty 50', label: 'NIFTY50' },
    { key: 'NSE_INDEX|Nifty Bank', label: 'BANKNIFTY' },
    { key: 'NSE_INDEX|Nifty IT', label: 'NIFTYIT' },
    { key: 'NSE_INDEX|Nifty Financial Services', label: 'FINNIFTY' },
  ];

  const out = {};
  for (const idx of indexList) {
    // Use full quotes for NIFTY50 to get OHLC, LTP for others
    const endpoint = idx.label === 'NIFTY50' ? '/market-quote/quotes' : '/market-quote/ltp';
    const result = await upstoxFetch(endpoint, { instrument_key: idx.key });
    if (result?.data) {
      const val = Object.values(result.data)[0];
      if (val) {
        out[idx.label] = {
          value: val.last_price || 0,
          change: val.net_change || 0,
          changePct: val.percentage_change || 0,
          open: val.ohlc?.open || 0,
          high: val.ohlc?.high || 0,
          low: val.ohlc?.low || 0,
          prevClose: val.ohlc?.close || 0,
        };
      }
    }
  }
  console.log(`[Indices] ${Object.keys(out).join(', ')}`);
  return out;
}));

// ── MARKET DATA ──
app.get('/api/market-data', withCache('market', 15000, async () => {
  const symbols = Object.keys(STOCKS);
  const allData = {};
  let liveCount = 0;

  for (let i = 0; i < symbols.length; i += 10) {
    const batch = symbols.slice(i, i + 10);
    const keys = batch.map(s => `NSE_EQ|${STOCKS[s].isin}`).join(',');
    const result = await upstoxFetch('/market-quote/quotes', { instrument_key: keys });
    if (result?.data) {
      for (const [rawKey, val] of Object.entries(result.data)) {
        if (!val || !val.last_price) continue;
        const sym = matchSymbol(rawKey, batch);
        if (sym) {
          allData[sym] = {
            symbol: sym, name: STOCKS[sym].name, sector: STOCKS[sym].sector, industry: STOCKS[sym].industry,
            price: val.last_price, change: val.net_change || 0, changePct: val.percentage_change || 0,
            open: val.ohlc?.open || 0, high: val.ohlc?.high || 0, low: val.ohlc?.low || 0,
            prevClose: val.ohlc?.close || 0, volume: val.volume || 0,
          };
          liveCount++;
        }
      }
    }
    if (i + 10 < symbols.length) await new Promise(r => setTimeout(r, 400));
  }

  for (const [sym, info] of Object.entries(STOCKS)) {
    if (!allData[sym]) allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry, price: 0, change: 0, changePct: 0, volume: 0 };
  }

  console.log(`[Market] ${liveCount}/${symbols.length} live`);
  return allData;
}));

// ── SINGLE STOCK (Upstox price + Yahoo fundamentals) ──
app.get('/api/stock/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const info = STOCKS[sym];
  if (!info) return res.status(404).json({ success: false, error: 'Stock not found' });

  // Fetch price from Upstox
  const result = await upstoxFetch('/market-quote/quotes', { instrument_key: `NSE_EQ|${info.isin}` });
  const val = result?.data ? Object.values(result.data)[0] : null;

  // Fetch fundamentals from Yahoo Finance
  const yahoo = await fetchYahooFundamentals(sym);

  const priceData = val ? {
    price: val.last_price || 0, change: val.net_change || 0, changePct: val.percentage_change || 0,
    open: val.ohlc?.open || 0, high: val.ohlc?.high || 0, low: val.ohlc?.low || 0,
    prevClose: val.ohlc?.close || 0, volume: val.volume || 0,
    avgPrice: val.average_price || 0,
    upperCircuit: val.upper_circuit_limit || 0, lowerCircuit: val.lower_circuit_limit || 0,
    totalBuyQty: val.total_buy_quantity || 0, totalSellQty: val.total_sell_quantity || 0,
  } : { price: 0 };

  res.json({
    success: true,
    data: {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      ...priceData,
      fundamentals: yahoo || null,
      dataSource: { price: 'Upstox', fundamentals: yahoo ? 'Yahoo Finance' : 'Unavailable' }
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

// ── SCREENER (real prices + Yahoo fundamentals where available) ──
app.get('/api/screener', withCache('screener', 30000, async () => {
  // Get live prices
  let liveData = cache.market?.data || {};
  const hasLive = Object.values(liveData).some(s => s.price > 0);
  if (!hasLive) {
    const symbols = Object.keys(STOCKS);
    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10);
      const keys = batch.map(s => `NSE_EQ|${STOCKS[s].isin}`).join(',');
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

  // Trigger background Yahoo fetch if not done
  if (Object.keys(yahooCache).length < Object.keys(STOCKS).length) {
    backgroundFetchFundamentals();
  }

  return Object.entries(STOCKS).map(([sym, info]) => {
    const live = liveData[sym] || {};
    const yahoo = yahooCache[sym]?.data || {};

    return {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      exchange: 'NSE', country: 'India',
      // Real price data from Upstox
      price: live.price || 0,
      change: live.change || 0,
      changePct: live.changePct || 0,
      volume: live.volume || 0,
      open: live.open || 0,
      high: live.high || 0,
      low: live.low || 0,
      prevClose: live.prevClose || 0,
      // Real fundamentals from Yahoo Finance (null = not yet loaded)
      pe: yahoo.pe || null,
      fwdPe: yahoo.fwdPe || null,
      peg: yahoo.peg || null,
      ps: yahoo.ps || null,
      pb: yahoo.pb || null,
      evEbitda: yahoo.evEbitda || null,
      eps: yahoo.eps || null,
      roe: yahoo.roe || null,
      roa: yahoo.roa || null,
      debtEquity: yahoo.debtEquity || null,
      grossMargin: yahoo.grossMargin || null,
      operatingMargin: yahoo.operatingMargin || null,
      netMargin: yahoo.netMargin || null,
      dividend: yahoo.dividend || null,
      marketCap: yahoo.marketCap || null,
      targetPrice: yahoo.targetPrice || null,
      beta: yahoo.beta || null,
      sma50: yahoo.sma50 || null,
      sma200: yahoo.sma200 || null,
      high52w: yahoo.high52w || null,
      low52w: yahoo.low52w || null,
      revenueGrowth: yahoo.revenueGrowth || null,
      earningsGrowth: yahoo.earningsGrowth || null,
      analystRec: yahoo.analystRec || null,
      numAnalysts: yahoo.numAnalysts || null,
      fundamentalsLoaded: !!yahoo.pe,
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

  // Get spot price
  const spotR = await upstoxFetch('/market-quote/ltp', { instrument_key: instKeyOC });
  const spotPrice = spotR?.data ? Object.values(spotR.data)[0]?.last_price || 0 : 0;

  // Try real option chain
  const params = { instrument_key: instKeyOC };
  if (expiry) params.expiry_date = expiry;
  const result = await upstoxFetch('/option/chain', params);

  if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
    const strikes = result.data.map(item => ({
      strike_price: item.strike_price,
      expiry: item.expiry || expiry,
      call: item.call_options ? {
        ltp: item.call_options.market_data?.ltp || 0,
        change: item.call_options.market_data?.net_change || 0,
        volume: item.call_options.market_data?.volume || 0,
        oi: item.call_options.market_data?.oi || 0,
        oi_change: item.call_options.market_data?.oi_change || 0,
        iv: item.call_options.option_greeks?.iv ? +(item.call_options.option_greeks.iv * 100).toFixed(2) : null,
        delta: item.call_options.option_greeks?.delta ?? null,
        gamma: item.call_options.option_greeks?.gamma ?? null,
        theta: item.call_options.option_greeks?.theta ?? null,
        vega: item.call_options.option_greeks?.vega ?? null,
      } : null,
      put: item.put_options ? {
        ltp: item.put_options.market_data?.ltp || 0,
        change: item.put_options.market_data?.net_change || 0,
        volume: item.put_options.market_data?.volume || 0,
        oi: item.put_options.market_data?.oi || 0,
        oi_change: item.put_options.market_data?.oi_change || 0,
        iv: item.put_options.option_greeks?.iv ? +(item.put_options.option_greeks.iv * 100).toFixed(2) : null,
        delta: item.put_options.option_greeks?.delta ?? null,
        gamma: item.put_options.option_greeks?.gamma ?? null,
        theta: item.put_options.option_greeks?.theta ?? null,
        vega: item.put_options.option_greeks?.vega ?? null,
      } : null,
    }));

    // Get expiry dates from data
    const expiries = [...new Set(result.data.map(d => d.expiry).filter(Boolean))].sort();

    return res.json({
      success: true,
      data: { underlying: ul, spot_price: spotPrice, expiry: expiry || expiries[0] || 'next', expiries, strikes },
      live: true,
      dataSource: 'Upstox'
    });
  }

  // No option chain available
  return res.json({
    success: false,
    error: 'Option chain not available for this instrument',
    spot_price: spotPrice
  });
});

// ── RATING TRACKER (Coming Soon) ──
app.get('/api/ratings', (req, res) => {
  res.json({
    success: true,
    status: 'coming_soon',
    message: 'Rating Tracker is under development. Real analyst rating data will be integrated soon.'
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
  res.json({ success: true, data: Object.entries(STOCKS).map(([s, i]) => ({ symbol: s, name: i.name, sector: i.sector, industry: i.industry })) });
});

// ═══════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`ZerohedgeQuant API v5.0 (Production) on port ${PORT}`);
  console.log(`${Object.keys(STOCKS).length} stocks | Token: ${CONFIG.accessToken ? 'SET' : 'MISSING'}`);

  // Start background Yahoo Finance fetch after 5 seconds
  setTimeout(() => {
    console.log('[Startup] Starting Yahoo Finance background fetch...');
    backgroundFetchFundamentals();
  }, 5000);
});
