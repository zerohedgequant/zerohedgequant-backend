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

// Fetch quotes one instrument at a time (batched commas break Upstox URL encoding)
async function fetchQuotesIndividually(symbols, parallel = 5) {
  const out = {};
  for (let i = 0; i < symbols.length; i += parallel) {
    const batch = symbols.slice(i, i + parallel);
    const results = await Promise.all(batch.map(async (sym) => {
      const url = `${CONFIG.baseUrl}/market-quote/quotes?instrument_key=NSE_EQ%7C${STOCKS[sym].isin}`;
      try {
        const r = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${CONFIG.accessToken}`, 'Accept': 'application/json' },
          timeout: 12000
        });
        return { sym, val: r.data?.data ? Object.values(r.data.data)[0] : null };
      } catch (err) {
        console.error(`[Upstox quote ${sym}] ${err.response?.status}: ${err.response?.data?.errors?.[0]?.message || err.message}`);
        return { sym, val: null };
      }
    }));
    for (const { sym, val } of results) {
      if (!val || !val.last_price) continue;
      const prevClose = val.ohlc?.close || 0;
      let pct = val.percentage_change || 0;
      if (!pct && prevClose) pct = +(((val.last_price - prevClose) / prevClose) * 100).toFixed(2);
      out[sym] = {
        price: val.last_price, change: val.net_change || (prevClose ? +(val.last_price - prevClose).toFixed(2) : 0),
        changePct: pct, volume: val.volume || 0,
        open: val.ohlc?.open || 0, high: val.ohlc?.high || 0, low: val.ohlc?.low || 0, prevClose
      };
    }
    if (i + parallel < symbols.length) await new Promise(r => setTimeout(r, 300));
  }
  return out;
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
    const resp = await yahooGet(url);

    const result = resp.data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const sd = result.summaryDetail || {};
    const ks = result.defaultKeyStatistics || {};
    const fd = result.financialData || {};
    const pr = result.price || {};

    const extract = (obj) => obj?.raw ?? obj?.fmt ?? null;

    const data = {
      // Live-ish price (Yahoo) used as fallback when Upstox is post-market/0
      yPrice: extract(pr.regularMarketPrice),
      yChangePct: extract(pr.regularMarketChangePercent) != null ? +(extract(pr.regularMarketChangePercent) * 100).toFixed(2) : null,
      yPrevClose: extract(pr.regularMarketPreviousClose),
      yOpen: extract(pr.regularMarketOpen),
      yHigh: extract(pr.regularMarketDayHigh),
      yLow: extract(pr.regularMarketDayLow),
      yVolume: extract(pr.regularMarketVolume),
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

// ═══════════════════════════════════════════════════════
// EXPANDED UNIVERSES (v6) — US large caps + NSE additions
// All served via Yahoo Finance (delayed ~15min). Wrong/renamed
// tickers simply return no data and are dropped — graceful.
// ═══════════════════════════════════════════════════════
const US_STOCKS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","BRK-B","JPM","V","UNH","XOM","LLY","JNJ","PG","MA","HD","AVGO","CVX","MRK","ABBV","COST","PEP","KO","ADBE","WMT","CRM","BAC","TMO","MCD","CSCO","ACN","NFLX","AMD","LIN","ABT","ORCL","DHR","DIS","WFC","TXN","PM","VZ","INTU","CAT","NEE","UNP","IBM","AMGN","GE","COP","NKE","QCOM","HON","SPGI","LOW","RTX","BA","INTC","UPS","T","GS","SBUX","ELV","PLD","MS","BLK","DE","MDT","BMY","AXP","TJX","GILD","ADP","LMT","SYK","MDLZ","C","VRTX","ISRG","CB","MMC","AMT","REGN","SCHW","ZTS","SO","CI","PGR","MO","BSX","DUK","CL","EOG","ITW","NOC","SLB","BDX","CME","PYPL","UBER","PLTR","ABNB","SNOW","COIN","SHOP","ARM","SMCI","MU","PANW","CRWD","SPOT","HOOD","DELL","ANET","KLAC","LRCX","AMAT","MRVL","NOW","SNPS","CDNS","FTNT","WDAY","TEAM","DDOG","NET","ZS","MDB","TTD","ROKU","DKNG","RBLX","CMG","LULU","MAR","BKNG","DAL","UAL","F","GM","RIVN","LCID"];

const NSE_EXTRA = ["TRENT","BEL","HAL","DLF","VBL","PIDILITIND","GODREJCP","DABUR","MARICO","COLPAL","BERGEPAINT","HAVELLS","SIEMENS","ABB","BOSCHLTD","CUMMINSIND","ASHOKLEY","TVSMOTOR","BAJAJ-AUTO","HEROMOTOCO","EICHERMOT","MOTHERSON","BHARATFORG","APOLLOHOSP","MAXHEALTH","FORTIS","LUPIN","AUROPHARMA","TORNTPHARM","ZYDUSLIFE","ALKEM","GLENMARK","BIOCON","SYNGENE","NAUKRI","IRCTC","INDIGO","PNB","BANKBARODA","CANBK","UNIONBANK","IDFCFIRSTB","FEDERALBNK","AUBANK","CHOLAFIN","SHRIRAMFIN","MUTHOOTFIN","LICHSGFIN","RECLTD","PFC","IRFC","SAIL","NMDC","VEDL","HINDZINC","JINDALSTEL","NATIONALUM","TATAELXSI","PERSISTENT","COFORGE","MPHASIS","LTIM","OFSS","KPITTECH","TATACOMM","INDUSTOWER","IDEA"];

// Yahoo session: cookie + crumb (required since 2023 for quoteSummary)
const ySession = { cookie: null, crumb: null, ts: 0 };
const Y_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getYahooSession(force = false) {
  if (!force && ySession.crumb && Date.now() - ySession.ts < 6 * 60 * 60 * 1000) return ySession;
  try {
    const r1 = await axios.get('https://fc.yahoo.com', {
      headers: { 'User-Agent': Y_UA }, timeout: 8000,
      validateStatus: () => true   // fc.yahoo.com returns 404 but sets the cookie
    });
    const setCookie = r1.headers['set-cookie'];
    if (setCookie && setCookie.length) {
      ySession.cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    }
    const r2 = await axios.get('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': Y_UA, 'Cookie': ySession.cookie || '' }, timeout: 8000
    });
    if (typeof r2.data === 'string' && r2.data.length < 30) {
      ySession.crumb = r2.data;
      ySession.ts = Date.now();
      console.log('[Yahoo] session crumb acquired');
    }
  } catch (e) {
    console.error('[Yahoo] session error:', e.message);
  }
  return ySession;
}

async function yahooGet(url) {
  const s = await getYahooSession();
  const sep = url.includes('?') ? '&' : '?';
  const full = s.crumb ? `${url}${sep}crumb=${encodeURIComponent(s.crumb)}` : url;
  try {
    return await axios.get(full, {
      headers: { 'User-Agent': Y_UA, 'Accept': 'application/json', 'Cookie': s.cookie || '' },
      timeout: 9000
    });
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      const s2 = await getYahooSession(true);   // refresh session once and retry
      const full2 = s2.crumb ? `${url}${sep}crumb=${encodeURIComponent(s2.crumb)}` : url;
      return axios.get(full2, {
        headers: { 'User-Agent': Y_UA, 'Accept': 'application/json', 'Cookie': s2.cookie || '' },
        timeout: 9000
      });
    }
    throw err;
  }
}

const yqCache = {}; // { "MKT:SYM": { data, ts } }
const YQ_TTL = 15 * 60 * 1000;

async function fetchYahooQuoteFull(symbol, market) {
  const key = `${market}:${symbol}`;
  const cached = yqCache[key];
  if (cached && Date.now() - cached.ts < YQ_TTL) return cached.data;
  const ySym = market === 'IN' ? symbol.replace('&', '%26') + '.NS' : symbol;
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ySym}?modules=price,summaryDetail,defaultKeyStatistics,financialData,assetProfile`;
  try {
    const resp = await yahooGet(url);
    const r = resp.data?.quoteSummary?.result?.[0];
    if (!r) return null;
    const x = (o) => o?.raw ?? null;
    const pr = r.price || {}, sd = r.summaryDetail || {}, ks = r.defaultKeyStatistics || {}, fd = r.financialData || {}, ap = r.assetProfile || {};
    const pc = (o) => (x(o) != null ? +(x(o) * 100).toFixed(2) : null);
    const data = {
      name: pr.longName || pr.shortName || symbol,
      sector: ap.sector || '-', industry: ap.industry || '-',
      price: x(pr.regularMarketPrice) || 0,
      change: x(pr.regularMarketChange) || 0,
      changePct: x(pr.regularMarketChangePercent) != null ? +(x(pr.regularMarketChangePercent) * 100).toFixed(2) : 0,
      volume: x(pr.regularMarketVolume) || 0,
      open: x(pr.regularMarketOpen) || 0,
      prevClose: x(pr.regularMarketPreviousClose) || 0,
      marketCap: x(pr.marketCap),
      pe: x(sd.trailingPE), fwdPe: x(ks.forwardPE), peg: x(ks.pegRatio),
      ps: x(sd.priceToSalesTrailing12Months), pb: x(ks.priceToBook), evEbitda: x(ks.enterpriseToEbitda),
      eps: x(ks.trailingEps) ?? x(sd.trailingEps),
      roe: pc(fd.returnOnEquity), roa: pc(fd.returnOnAssets),
      debtEquity: x(fd.debtToEquity) != null ? +(x(fd.debtToEquity) / 100).toFixed(2) : null,
      grossMargin: pc(fd.grossMargins), operatingMargin: pc(fd.operatingMargins), netMargin: pc(fd.profitMargins),
      dividend: pc(sd.dividendYield),
      beta: x(sd.beta) ?? x(ks.beta),
      sma50: x(sd.fiftyDayAverage), sma200: x(sd.twoHundredDayAverage),
      high52w: x(sd.fiftyTwoWeekHigh), low52w: x(sd.fiftyTwoWeekLow),
      targetPrice: x(fd.targetMeanPrice),
      revenueGrowth: pc(fd.revenueGrowth), earningsGrowth: pc(fd.earningsGrowth)
    };
    yqCache[key] = { data, ts: Date.now() };
    return data;
  } catch (err) {
    console.error(`[YahooQ ${market}:${symbol}] ${err.response?.status || err.message}`);
    return null;
  }
}

// Fetch any missing/stale symbols in parallel batches
async function ensureYahooBatch(symbols, market, parallel = 8) {
  const missing = symbols.filter((s) => {
    const c = yqCache[`${market}:${s}`];
    return !c || Date.now() - c.ts > YQ_TTL;
  });
  for (let i = 0; i < missing.length; i += parallel) {
    await Promise.all(missing.slice(i, i + parallel).map((s) => fetchYahooQuoteFull(s, market)));
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
  // v6: refresh expanded universes (quotes + fundamentals via Yahoo)
  try {
    await ensureYahooBatch(NSE_EXTRA, 'IN', 6);
    await ensureYahooBatch(US_STOCKS, 'US', 6);
    console.log(`[YahooQ] Universe refresh done. IN+:${NSE_EXTRA.length} US:${US_STOCKS.length}`);
  } catch (e) { console.error('[YahooQ] universe refresh error', e.message); }
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
        const pc = val.ohlc?.close || 0;
        let ipct = val.percentage_change || 0;
        if (!ipct && pc && val.last_price) ipct = +((((val.last_price - pc) / pc) * 100)).toFixed(2);
        out[idx.label] = {
          value: val.last_price || 0,
          change: val.net_change || (pc && val.last_price ? +(val.last_price - pc).toFixed(2) : 0),
          changePct: ipct,
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
  const live = await fetchQuotesIndividually(symbols);
  const allData = {};
  let liveCount = 0;
  for (const [sym, info] of Object.entries(STOCKS)) {
    if (live[sym]) {
      allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry, ...live[sym] };
      liveCount++;
    } else {
      allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry, price: 0, change: 0, changePct: 0, volume: 0 };
    }
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

// ── DEEP FUNDAMENTALS (Yahoo: ratios + earnings history + price series) ──
const deepCache = {}; // { "MKT:SYM": { data, ts } }
const DEEP_TTL = 30 * 60 * 1000;

async function fetchYahooDeep(symbol, market) {
  const sym = symbol.toUpperCase();
  const ySym = market === 'US' ? sym : sym.replace('&', '%26') + '.NS';

  // 1) quoteSummary — profile, ratios, earnings history
  const qsUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ySym}?modules=price,summaryDetail,defaultKeyStatistics,financialData,assetProfile,earnings`;
  // 2) chart — 1y weekly closes for the price chart
  const chUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ySym}?range=1y&interval=1wk`;

  const [qs, ch] = await Promise.allSettled([yahooGet(qsUrl), yahooGet(chUrl)]);
  const ex = (o) => (o?.raw ?? o?.fmt ?? null);

  let out = { symbol: sym, market, name: sym };

  if (qs.status === 'fulfilled') {
    const r = qs.value.data?.quoteSummary?.result?.[0] || {};
    const pr = r.price || {}, sd = r.summaryDetail || {}, ks = r.defaultKeyStatistics || {},
          fd = r.financialData || {}, ap = r.assetProfile || {}, ea = r.earnings || {};
    out.name = pr.longName || pr.shortName || sym;
    out.sector = ap.sector || null;
    out.industry = ap.industry || null;
    out.about = ap.longBusinessSummary || null;
    out.price = ex(pr.regularMarketPrice);
    out.changePct = ex(pr.regularMarketChangePercent) != null ? +(ex(pr.regularMarketChangePercent) * 100).toFixed(2) : null;
    out.change = ex(pr.regularMarketChange);
    out.open = ex(pr.regularMarketOpen); out.high = ex(pr.regularMarketDayHigh);
    out.low = ex(pr.regularMarketDayLow); out.prevClose = ex(pr.regularMarketPreviousClose);
    out.volume = ex(pr.regularMarketVolume);
    out.fundamentals = {
      marketCap: ex(pr.marketCap), pe: ex(sd.trailingPE), fwdPe: ex(sd.forwardPE),
      pb: ex(ks.priceToBook), peg: ex(ks.pegRatio), ps: ex(sd.priceToSalesTrailing12Months),
      evEbitda: ex(ks.enterpriseToEbitda), eps: ex(ks.trailingEps), bookValue: ex(ks.bookValue),
      dividend: ex(sd.dividendYield) != null ? +(ex(sd.dividendYield) * 100).toFixed(2) : null,
      roe: ex(fd.returnOnEquity) != null ? +(ex(fd.returnOnEquity) * 100).toFixed(2) : null,
      roa: ex(fd.returnOnAssets) != null ? +(ex(fd.returnOnAssets) * 100).toFixed(2) : null,
      grossMargin: ex(fd.grossMargins) != null ? +(ex(fd.grossMargins) * 100).toFixed(2) : null,
      operatingMargin: ex(fd.operatingMargins) != null ? +(ex(fd.operatingMargins) * 100).toFixed(2) : null,
      netMargin: ex(fd.profitMargins) != null ? +(ex(fd.profitMargins) * 100).toFixed(2) : null,
      revenueGrowth: ex(fd.revenueGrowth) != null ? +(ex(fd.revenueGrowth) * 100).toFixed(2) : null,
      earningsGrowth: ex(fd.earningsGrowth) != null ? +(ex(fd.earningsGrowth) * 100).toFixed(2) : null,
      debtEquity: ex(fd.debtToEquity), currentRatio: ex(fd.currentRatio), beta: ex(sd.beta),
      high52w: ex(sd.fiftyTwoWeekHigh), low52w: ex(sd.fiftyTwoWeekLow),
      sma50: ex(sd.fiftyDayAverage), sma200: ex(sd.twoHundredDayAverage),
      targetPrice: ex(fd.targetMeanPrice), numAnalysts: ex(fd.numberOfAnalystOpinions),
      analystRec: fd.recommendationKey || null,
    };
    // earnings history -> [{label, revenue, profit}]
    const yc = ea.financialsChart?.yearly || [];
    out.annual = yc.map((x) => ({ label: String(ex(x.date) ?? ''), revenue: ex(x.revenue), profit: ex(x.earnings) }));
    const qc = ea.financialsChart?.quarterly || [];
    out.quarterly = qc.map((x) => ({ label: String(x.date ?? ''), revenue: ex(x.revenue), profit: ex(x.earnings) }));
  }

  // price series
  if (ch.status === 'fulfilled') {
    const c = ch.value.data?.chart?.result?.[0];
    const ts = c?.timestamp || [];
    const close = c?.indicators?.quote?.[0]?.close || [];
    out.history = ts.map((t, i) => ({ t, c: close[i] })).filter((p) => p.c != null);
  } else out.history = [];

  return out;
}

app.get('/api/fundamentals/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const market = req.query.market === 'US' ? 'US' : 'NSE';
  const key = `${market}:${sym}`;
  const cached = deepCache[key];
  if (cached && Date.now() - cached.ts < DEEP_TTL) return res.json({ success: true, data: cached.data, cached: true });
  try {
    const data = await fetchYahooDeep(sym, market);
    if (!data || data.price == null) return res.status(404).json({ success: false, error: 'No data' });
    deepCache[key] = { data, ts: Date.now() };
    res.json({ success: true, data });
  } catch (e) {
    res.status(502).json({ success: false, error: 'Yahoo fetch failed' });
  }
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
    liveData = await fetchQuotesIndividually(Object.keys(STOCKS));
  }

  // Trigger background Yahoo fetch if not done
  if (Object.keys(yahooCache).length < Object.keys(STOCKS).length) {
    backgroundFetchFundamentals();
  }

  const coreRows = Object.entries(STOCKS).map(([sym, info]) => {
    const live = liveData[sym] || {};
    const yahoo = yahooCache[sym]?.data || {};

    // Prefer live Upstox price; fall back to Yahoo when market is closed / Upstox returns 0.
    const hasUpstox = (live.price || 0) > 0;
    const price = hasUpstox ? live.price : (yahoo.yPrice || 0);
    const changePct = hasUpstox ? (live.changePct || 0) : (yahoo.yChangePct ?? 0);
    const prevClose = hasUpstox ? (live.prevClose || 0) : (yahoo.yPrevClose || 0);
    const change = hasUpstox ? (live.change || 0)
      : (yahoo.yPrice && yahoo.yPrevClose ? +(yahoo.yPrice - yahoo.yPrevClose).toFixed(2) : 0);
    const priceSrc = hasUpstox ? 'Upstox' : (yahoo.yPrice ? 'Yahoo' : 'NA');

    return {
      symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
      exchange: 'NSE', country: 'India',
      priceSrc,
      // Live price (Upstox) with Yahoo fallback post-market
      price,
      change,
      changePct,
      volume: hasUpstox ? (live.volume || 0) : (yahoo.yVolume || 0),
      open: hasUpstox ? (live.open || 0) : (yahoo.yOpen || 0),
      high: hasUpstox ? (live.high || 0) : (yahoo.yHigh || 0),
      low: hasUpstox ? (live.low || 0) : (yahoo.yLow || 0),
      prevClose,
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

  // v6: expanded NSE names served via Yahoo (delayed) — skip any already in core to avoid duplicates
  const coreSet = new Set(Object.keys(STOCKS));
  const extraRows = NSE_EXTRA.filter((sym) => !coreSet.has(sym)).map((sym) => {
    const y = yqCache[`IN:${sym}`]?.data;
    if (!y || !y.price) return null;
    return { symbol: sym, exchange: 'NSE', country: 'India', src: 'yahoo', priceSrc: 'Yahoo', ...y };
  }).filter(Boolean);
  ensureYahooBatch(NSE_EXTRA, 'IN').catch(() => {});

  // Launch hygiene: never surface a row with no usable price.
  const all = [...coreRows, ...extraRows].filter((r) => (r.price || 0) > 0);
  return all;
}));

// ── OPTION CHAIN ──
═══════════════════════════════════════════════════════════════════
  BACKEND FIX — Option chain EXPIRY LIST (server.js)
  Problem: /option/chain (no expiry_date) returns only the NEAREST
  expiry, so the expiries[] list had just 1 entry → no selector.
  Fix: also call /option/contract to get the FULL expiry list.
═══════════════════════════════════════════════════════════════════

REPLACE the entire existing route:

    app.get('/api/option-chain/:underlying', async (req, res) => {
       ... (the whole handler, down to its closing  });  )

WITH THIS:

─────────────────────────────────────────────────────────────────
app.get('/api/option-chain/:underlying', async (req, res) => {
  const ul = req.params.underlying.toUpperCase();
  const expiry = req.query.expiry || '';

  let instKeyOC;
  if (ul === 'NIFTY' || ul === 'NIFTY50') instKeyOC = 'NSE_INDEX|Nifty 50';
  else if (ul === 'BANKNIFTY') instKeyOC = 'NSE_INDEX|Nifty Bank';
  else if (ul === 'FINNIFTY') instKeyOC = 'NSE_INDEX|Nifty Financial Services';
  else if (STOCKS[ul]) instKeyOC = `NSE_EQ|${STOCKS[ul].isin}`;
  else return res.status(404).json({ success: false, error: 'Unknown underlying' });

  // Spot price
  const spotR = await upstoxFetch('/market-quote/ltp', { instrument_key: instKeyOC });
  const spotPrice = spotR?.data ? Object.values(spotR.data)[0]?.last_price || 0 : 0;

  // ── NEW: full expiry list via /option/contract ──
  let allExpiries = [];
  try {
    const contractR = await upstoxFetch('/option/contract', { instrument_key: instKeyOC });
    if (contractR?.data && Array.isArray(contractR.data)) {
      allExpiries = [...new Set(contractR.data.map(c => c.expiry).filter(Boolean))].sort();
    }
  } catch (e) { console.error('[OC expiries]', e.message); }

  // Chain for the chosen (or nearest) expiry
  const params = { instrument_key: instKeyOC };
  const useExpiry = expiry || allExpiries[0] || '';
  if (useExpiry) params.expiry_date = useExpiry;
  const result = await upstoxFetch('/option/chain', params);

  if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
    const strikes = result.data.map(item => ({
      strike_price: item.strike_price,
      expiry: item.expiry || useExpiry,
      call: item.call_options ? {
        ltp: item.call_options.market_data?.ltp || 0,
        change: item.call_options.market_data?.net_change || 0,
        volume: item.call_options.market_data?.volume || 0,
        oi: item.call_options.market_data?.oi || 0,
        oi_change: (item.call_options.market_data?.oi || 0) - (item.call_options.market_data?.prev_oi || 0),
        iv: item.call_options.option_greeks?.iv ? +(item.call_options.option_greeks.iv).toFixed(2) : null,
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
        oi_change: (item.put_options.market_data?.oi || 0) - (item.put_options.market_data?.prev_oi || 0),
        iv: item.put_options.option_greeks?.iv ? +(item.put_options.option_greeks.iv).toFixed(2) : null,
        delta: item.put_options.option_greeks?.delta ?? null,
        gamma: item.put_options.option_greeks?.gamma ?? null,
        theta: item.put_options.option_greeks?.theta ?? null,
        vega: item.put_options.option_greeks?.vega ?? null,
      } : null,
    }));

    // Prefer the full contract-derived list; fall back to chain-derived
    const chainExpiries = [...new Set(result.data.map(d => d.expiry).filter(Boolean))].sort();
    const expiries = allExpiries.length ? allExpiries : chainExpiries;

    return res.json({
      success: true,
      data: { underlying: ul, spot_price: spotPrice, expiry: useExpiry || expiries[0] || 'next', expiries, strikes },
      live: true,
      dataSource: 'Upstox'
    });
  }

  return res.json({
    success: false,
    error: 'Option chain not available for this instrument',
    spot_price: spotPrice,
    expiries: allExpiries,
  });
});
─────────────────────────────────────────────────────────────────

NOTES:
• Also fixed IV: Upstox already returns IV as a percentage (e.g. 12.5),
  so the old code multiplied by 100 incorrectly (showed 1250). Removed ×100.
• oi_change now computed as oi - prev_oi (Upstox doesn't send oi_change
  directly; the old `.oi_change` field was always 0/undefined).

After replacing: commit → Render redeploys (~50s).
Then on /options you'll see the full expiry tab list (weekly + monthly),
and IV / Chg-OI will be correct.

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
// US MARKET (v6) — Yahoo Finance, ~15min delayed
// ═══════════════════════════════════════════════════════
app.get('/api/us-screener', withCache('us_screener', 60000, async () => {
  await ensureYahooBatch(US_STOCKS, 'US', 8);
  return US_STOCKS.map((sym) => {
    const y = yqCache[`US:${sym}`]?.data;
    if (!y || !y.price) return null;
    return { symbol: sym, exchange: 'US', country: 'USA', src: 'yahoo', ...y };
  }).filter(Boolean);
}));

const US_INDICES = [
  { key: '^GSPC', label: 'S&P 500' },
  { key: '^IXIC', label: 'NASDAQ' },
  { key: '^DJI', label: 'DOW JONES' },
  { key: '^VIX', label: 'VIX' }
];
app.get('/api/us-indices', withCache('us_indices', 60000, async () => {
  const out = {};
  await Promise.all(US_INDICES.map(async (idx) => {
    try {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(idx.key)}?modules=price`;
      const resp = await yahooGet(url);
      const pr = resp.data?.quoteSummary?.result?.[0]?.price;
      if (!pr) return;
      out[idx.label] = {
        value: pr.regularMarketPrice?.raw || 0,
        change: pr.regularMarketChange?.raw || 0,
        changePct: pr.regularMarketChangePercent?.raw != null ? +(pr.regularMarketChangePercent.raw * 100).toFixed(2) : 0
      };
    } catch (e) { console.error(`[US idx ${idx.key}] ${e.message}`); }
  }));
  return out;
}));

// ═══════════════════════════════════════════════════════
// UPSTOX AUTH — one-tap daily token refresh
// Visit /auth/login each morning; token updates in place.
// ═══════════════════════════════════════════════════════
const AUTH = {
  apiKey: process.env.UPSTOX_API_KEY || '',
  apiSecret: process.env.UPSTOX_API_SECRET || '',
  redirectUri: process.env.UPSTOX_REDIRECT_URI ||
    'https://zerohedgequant-backend.onrender.com/auth/callback',
  updatedAt: process.env.UPSTOX_ACCESS_TOKEN ? 'from env at boot' : null
};

app.get('/auth/login', (req, res) => {
  if (!AUTH.apiKey) return res.status(500).send('UPSTOX_API_KEY not set on server');
  const url =
    'https://api.upstox.com/v2/login/authorization/dialog' +
    `?response_type=code&client_id=${encodeURIComponent(AUTH.apiKey)}` +
    `&redirect_uri=${encodeURIComponent(AUTH.redirectUri)}`;
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('No auth code returned by Upstox');
    const body = new URLSearchParams({
      code,
      client_id: AUTH.apiKey,
      client_secret: AUTH.apiSecret,
      redirect_uri: AUTH.redirectUri,
      grant_type: 'authorization_code'
    });
    const r = await axios.post(
      'https://api.upstox.com/v2/login/authorization/token',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' } }
    );
    if (!r.data || !r.data.access_token) throw new Error('No access_token in response');
    CONFIG.accessToken = r.data.access_token;   // live swap — no restart needed
    AUTH.updatedAt = new Date().toISOString();
    cache.indices = null; cache.market = null; cache.screener = null;  // bust stale zero-price caches
    res.send(
      '<body style="font-family:monospace;background:#0a0f1e;color:#2dd482;display:grid;place-items:center;height:90vh">' +
      '<div><h2>&#10003; AlphaHedgeQuant token refreshed</h2>' +
      `<p style="color:#8a94a8">Valid until ~3:30 AM IST tomorrow. Updated: ${AUTH.updatedAt}</p></div></body>`
    );
  } catch (e) {
    res.status(500).send('Token exchange failed: ' + (e.response?.data?.errors?.[0]?.message || e.message));
  }
});

app.get('/auth/status', (req, res) => {
  res.json({ tokenSet: !!CONFIG.accessToken, updatedAt: AUTH.updatedAt });
});


// ═══════════════════════════════════════════════════════════════════════════
// AHQ BACKEND — PASTE THIS ENTIRE BLOCK INTO server.js
// POSITION: anywhere ABOVE the app.listen(...) call at the bottom
// These two sections add: /api/scanner/signals  +  /api/backtest
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// SIGNAL MATH HELPERS (pure JS — no extra npm packages needed)
// ─────────────────────────────────────────────────────────────────────────
function calcSMA(arr, period) {
  const out = new Array(arr.length).fill(null);
  for (let i = period - 1; i < arr.length; i++) {
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += arr[j];
    out[i] = s / period;
  }
  return out;
}

function calcEMA(arr, period) {
  const out = new Array(arr.length).fill(null);
  const k = 2 / (period + 1);
  let started = false;
  let seed = 0;
  let seedCount = 0;
  for (let i = 0; i < arr.length; i++) {
    if (!started) {
      if (arr[i] == null) continue;
      seed += arr[i]; seedCount++;
      if (seedCount === period) { out[i] = seed / period; started = true; }
    } else {
      if (arr[i] == null) { out[i] = out[i - 1]; continue; }
      out[i] = arr[i] * k + out[i - 1] * (1 - k);
    }
  }
  return out;
}

function calcRSI(arr, period = 14) {
  const out = new Array(arr.length).fill(null);
  if (arr.length < period + 1) return out;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = arr[i] - arr[i - 1];
    if (d > 0) avgGain += d; else avgLoss += Math.abs(d);
  }
  avgGain /= period; avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < arr.length; i++) {
    const d = arr[i] - arr[i - 1];
    const gain = d > 0 ? d : 0;
    const loss = d < 0 ? Math.abs(d) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

function calcZScore(arr, period = 20) {
  const out = new Array(arr.length).fill(null);
  for (let i = period - 1; i < arr.length; i++) {
    const slice = arr.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    out[i] = std === 0 ? 0 : (arr[i] - mean) / std;
  }
  return out;
}

function calcBollinger(arr, period = 20, numStd = 2) {
  const sma = calcSMA(arr, period);
  const upper = new Array(arr.length).fill(null);
  const lower = new Array(arr.length).fill(null);
  for (let i = period - 1; i < arr.length; i++) {
    const slice = arr.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    upper[i] = mean + numStd * std;
    lower[i] = mean - numStd * std;
  }
  return { sma, upper, lower };
}

// ─────────────────────────────────────────────────────────────────────────
// COMPOSITE SIGNAL GENERATOR — 5 strategies, majority vote
// Input: array of { date, close, high, low, volume }
// Output: { direction, confidence, rsi, zscore, momentum20, entry, stop, target }
// ─────────────────────────────────────────────────────────────────────────
function computeSignal(prices) {
  if (!prices || prices.length < 35) return null;
  const closes = prices.map(p => p.close);
  const L = closes.length - 1;

  const ema9  = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const rsi   = calcRSI(closes, 14);
  const zscore = calcZScore(closes, 20);
  const bb    = calcBollinger(closes, 20, 2);

  const mom20 = L >= 20 ? ((closes[L] / closes[L - 20]) - 1) * 100 : null;
  const price = closes[L];

  const votes = [];

  // 1. EMA Cross
  if (ema9[L] != null && ema21[L] != null) {
    votes.push(ema9[L] > ema21[L] ? 'BUY' : 'SELL');
  }
  // 2. RSI extremes
  if (rsi[L] != null) {
    if (rsi[L] < 35) votes.push('BUY');
    else if (rsi[L] > 65) votes.push('SELL');
    else votes.push('HOLD');
  }
  // 3. Z-Score mean reversion
  if (zscore[L] != null) {
    if (zscore[L] < -1.8) votes.push('BUY');
    else if (zscore[L] > 1.8) votes.push('SELL');
    else votes.push('HOLD');
  }
  // 4. Bollinger Band
  if (bb.upper[L] != null) {
    if (price < bb.lower[L]) votes.push('BUY');
    else if (price > bb.upper[L]) votes.push('SELL');
    else votes.push('HOLD');
  }
  // 5. 20-day momentum
  if (mom20 != null) {
    if (mom20 > 4) votes.push('BUY');
    else if (mom20 < -4) votes.push('SELL');
    else votes.push('HOLD');
  }

  const buys  = votes.filter(v => v === 'BUY').length;
  const sells = votes.filter(v => v === 'SELL').length;
  const total = votes.length;

  let direction, confidence;
  if (buys >= 4)           { direction = 'STRONG BUY';  confidence = Math.round((buys / total) * 100); }
  else if (buys === 3)     { direction = 'BUY';          confidence = Math.round((buys / total) * 100); }
  else if (sells >= 4)     { direction = 'STRONG SELL';  confidence = Math.round((sells / total) * 100); }
  else if (sells === 3)    { direction = 'SELL';         confidence = Math.round((sells / total) * 100); }
  else if (buys > sells)   { direction = 'WEAK BUY';    confidence = Math.round((buys / total) * 100); }
  else if (sells > buys)   { direction = 'WEAK SELL';   confidence = Math.round((sells / total) * 100); }
  else                     { direction = 'HOLD';         confidence = 50; }

  const isBullish = direction.includes('BUY');
  const isBearish = direction.includes('SELL');

  return {
    direction,
    confidence,
    rsi: rsi[L] != null ? Math.round(rsi[L]) : null,
    zscore: zscore[L] != null ? +zscore[L].toFixed(2) : null,
    momentum20: mom20 != null ? +mom20.toFixed(1) : null,
    emaBullish: ema9[L] > ema21[L],
    price: +price.toFixed(2),
    entry: +price.toFixed(2),
    stop: +(price * (isBullish ? 0.97 : isBearish ? 1.03 : 1)).toFixed(2),
    target: +(price * (isBullish ? 1.06 : isBearish ? 0.94 : 1)).toFixed(2),
    riskReward: isBullish || isBearish ? 2.0 : null,
    bullVotes: buys,
    bearVotes: sells,
    totalStrategies: total,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// BACKTEST ENGINE — ported from QUANT-DESK app-2.py
// ─────────────────────────────────────────────────────────────────────────
function periodsPerYear(interval) {   switch (interval) {     case '1m':  return 252 * 375;     case '5m':  return 252 * 75;     case '15m': return 252 * 25;     case '30m': return 252 * 12.5;     case '60m':     case '1h':  return 252 * 6.25;     case '1wk': return 52;     default:    return 252;   } }  function runBacktest(prices, strategy, params, initialCapital = 100000, interval = '1d') {
  const closes = prices.map(p => p.close);
  const n = closes.length;
  const positions = new Array(n).fill(0);

  if (strategy === 'mean_reversion') {
    const { lookback = 20, entryZ = 2.0, exitZ = 0.5 } = params;
    const z = calcZScore(closes, lookback);
    for (let i = 1; i < n; i++) {
      if (z[i] == null) continue;
      if (z[i] < -entryZ)       positions[i] = 1;
      else if (z[i] > entryZ)   positions[i] = -1;
      else if (Math.abs(z[i]) <= exitZ) positions[i] = 0;
      else positions[i] = positions[i - 1];
    }
  } else if (strategy === 'momentum') {
    const { fast = 10, slow = 30 } = params;
    const ef = calcEMA(closes, fast);
    const es = calcEMA(closes, slow);
    const rsi = calcRSI(closes, 14);
    for (let i = 1; i < n; i++) {
      if (ef[i] == null || es[i] == null) continue;
      if (ef[i] > es[i] && (rsi[i] == null || rsi[i] < 70)) positions[i] = 1;
      else if (ef[i] < es[i] && (rsi[i] == null || rsi[i] > 30)) positions[i] = -1;
      else positions[i] = positions[i - 1];
    }
  } else if (strategy === 'bollinger') {
    const { lookback = 20, numStd = 2.0 } = params;
    const bb = calcBollinger(closes, lookback, numStd);
    for (let i = 1; i < n; i++) {
      if (bb.upper[i] == null) continue;
      if (closes[i] < bb.lower[i])      positions[i] = 1;
      else if (closes[i] > bb.upper[i]) positions[i] = -1;
      else                              positions[i] = positions[i - 1];
    }
  } else if (strategy === 'vwap') {
    const { period = 5, threshold = 0.015 } = params;
    const vwap = calcSMA(closes, period);
    for (let i = 1; i < n; i++) {
      if (vwap[i] == null) continue;
      const ratio = closes[i] / vwap[i] - 1;
      if (ratio < -threshold)      positions[i] = 1;
      else if (ratio > threshold)  positions[i] = -1;
      else                         positions[i] = positions[i - 1];
    }
  }

  // Returns
  const returns    = closes.map((c, i) => i === 0 ? 0 : (c - closes[i - 1]) / closes[i - 1]);
  const stratRet   = returns.map((r, i) => i === 0 ? 0 : positions[i - 1] * r);

  // Portfolio & benchmark
  let portfolio  = [initialCapital];
  let benchmark  = [initialCapital];
  for (let i = 1; i < n; i++) {
    portfolio.push(portfolio[i - 1] * (1 + stratRet[i]));
    benchmark.push(benchmark[i - 1] * (1 + returns[i]));
  }

  const finalVal = portfolio[n - 1];
  const totalReturn = (finalVal / initialCapital - 1) * 100;
  const benchReturn = (benchmark[n - 1] / initialCapital - 1) * 100;

  const valid = stratRet.slice(1);
  const mean  = valid.reduce((a, b) => a + b, 0) / valid.length;
  const std   = Math.sqrt(valid.reduce((a, b) => a + (b - mean) ** 2, 0) / valid.length);
  const sharpe = std === 0 ? 0 : (mean / std) * Math.sqrt(periodsPerYear(interval));

  const downside = valid.filter(r => r < 0);
  const downStd  = downside.length < 2 ? 0.0001 :
    Math.sqrt(downside.reduce((a, b) => a + b ** 2, 0) / downside.length);
  const sortino  = (mean / downStd) * Math.sqrt(periodsPerYear(interval));

  // Max drawdown
  let maxDD = 0, peak = portfolio[0];
  for (const v of portfolio) {
    if (v > peak) peak = v;
    const dd = (v - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }

  const wins = valid.filter(r => r > 0).length;
  const winRate = (wins / valid.length) * 100;

  let trades = 0;
  for (let i = 1; i < n; i++) if (positions[i] !== positions[i - 1]) trades++;

  // Downsample equity curve to max 250 points
  const step = Math.max(1, Math.floor(n / 250));
  const curve = prices
    .filter((_, i) => i % step === 0)
    .map((p, idx) => ({
      date: p.date,
      strategy: Math.round(portfolio[Math.min(idx * step, n - 1)]),
      benchmark: Math.round(benchmark[Math.min(idx * step, n - 1)]),
    }));

  return {
    metrics: {
      totalReturn:      +totalReturn.toFixed(2),
      benchmarkReturn:  +benchReturn.toFixed(2),
      sharpe:           +sharpe.toFixed(2),
      sortino:          +sortino.toFixed(2),
      maxDrawdown:      +(maxDD * 100).toFixed(2),
      winRate:          +winRate.toFixed(1),
      trades,
      finalValue:       Math.round(finalVal),
      annualizedReturn: +(((finalVal / initialCapital) ** (periodsPerYear(interval) / n) - 1) * 100).toFixed(2),
    },
    equityCurve: curve,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// YAHOO FINANCE DAILY FETCHER (uses the existing yahooGet helper in server.js)
// ─────────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
//  REPLACE the existing `async function fetchYahooOHLC(...)` (around line 1141)
//  with this version. Adds `interval` support + Yahoo's per-interval range caps.
// ═══════════════════════════════════════════════════════════════════════════

// Yahoo's max lookback per interval (in days). Intraday is heavily limited.
const YAHOO_INTERVAL_MAX_DAYS = {
  '1m':  7,
  '5m':  60,
  '15m': 60,
  '30m': 60,
  '60m': 730,
  '1h':  730,   // alias of 60m
  '1d':  3650,
  '1wk': 3650,
};

async function fetchYahooOHLC(rawSymbol, days = 120, interval = '1d') {
  // Accepts both NSE symbols ('RELIANCE') and Yahoo symbols ('RELIANCE.NS', 'AAPL')
  const ySymbol = rawSymbol.includes('.') || /^[A-Z]{1,5}$/.test(rawSymbol) && !STOCKS[rawSymbol]
    ? rawSymbol
    : rawSymbol + '.NS';

  // Normalise interval + clamp the lookback to what Yahoo actually serves
  const iv = (interval === '1h') ? '60m' : interval;
  const maxDays = YAHOO_INTERVAL_MAX_DAYS[iv] || 3650;
  const useDays = Math.min(days, maxDays);
  const isIntraday = /m$/.test(iv) || iv === '60m';

  const p2 = Math.floor(Date.now() / 1000);
  const p1 = Math.floor((Date.now() - useDays * 24 * 3600 * 1000) / 1000);
  const url =
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}` +
    `?period1=${p1}&period2=${p2}&interval=${iv}`;

  try {
    const resp  = await yahooGet(url);
    const res0  = resp.data?.chart?.result?.[0];
    if (!res0) return null;
    const ts    = res0.timestamp;
    const q     = res0.indicators?.quote?.[0];
    if (!ts || !q) return null;
    const adj   = res0.indicators?.adjclose?.[0]?.adjclose;
    return ts
      .map((t, i) => ({
        // intraday → full ISO datetime; daily/weekly → date only
        date:   isIntraday
                  ? new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ')
                  : new Date(t * 1000).toISOString().split('T')[0],
        open:   q.open[i]   != null ? +q.open[i].toFixed(2)   : null,
        high:   q.high[i]   != null ? +q.high[i].toFixed(2)   : null,
        low:    q.low[i]    != null ? +q.low[i].toFixed(2)    : null,
        close:  adj ? (adj[i] != null ? +adj[i].toFixed(2) : null) : (q.close[i] != null ? +q.close[i].toFixed(2) : null),
        volume: q.volume[i] || 0,
      }))
      .filter(p => p.close != null && p.close > 0);
  } catch (e) {
    console.error(`[OHLC] ${rawSymbol} (${iv}): ${e.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// ROUTE 1: GET /api/scanner/signals
// Returns composite BUY/SELL/HOLD signals for all 50 NSE stocks
// Cached 5 minutes — safe to poll from the frontend
// ─────────────────────────────────────────────────────────────────────────
let scannerCache = { data: null, ts: 0 };

app.get('/api/scanner/signals', async (req, res) => {
  const now = Date.now();
  if (scannerCache.data && now - scannerCache.ts < 5 * 60 * 1000) {
    return res.json({ success: true, data: scannerCache.data, cached: true, cachedAt: new Date(scannerCache.ts).toISOString() });
  }

  const symbols = Object.keys(STOCKS).slice(0, 50); // all 50 stocks
  const results = [];

  // Batch: 5 concurrent to avoid Yahoo rate limits
  const BATCH = 5;
  for (let i = 0; i < symbols.length; i += BATCH) {
    const batch = symbols.slice(i, i + BATCH);
    const resolved = await Promise.all(
      batch.map(async (sym) => {
        const prices = await fetchYahooOHLC(sym, 90);
        if (!prices || prices.length < 35) return null;
        const sig = computeSignal(prices);
        if (!sig) return null;
        return {
          symbol:   sym,
          name:     STOCKS[sym]?.name || sym,
          sector:   STOCKS[sym]?.sector || '—',
          ...sig,
        };
      })
    );
    results.push(...resolved.filter(Boolean));
    if (i + BATCH < symbols.length) await new Promise(r => setTimeout(r, 400)); // polite delay
  }

  // Sort: STRONG BUY first, then BUY, WEAK BUY, HOLD, WEAK SELL, SELL, STRONG SELL
  const ORDER = { 'STRONG BUY': 0, 'BUY': 1, 'WEAK BUY': 2, 'HOLD': 3, 'WEAK SELL': 4, 'SELL': 5, 'STRONG SELL': 6 };
  results.sort((a, b) => (ORDER[a.direction] ?? 3) - (ORDER[b.direction] ?? 3));

  scannerCache = { data: results, ts: now };
  res.json({
    success: true,
    data: results,
    cached: false,
    generatedAt: new Date(now).toISOString(),
    count: results.length,
  });
});

// ─────────────────────────────────────────────────────────────────────────
// ROUTE 2: POST /api/backtest
// Body: { symbol, strategy, startDate?, endDate?, initialCapital?, params? }
// Strategies: mean_reversion | momentum | bollinger | vwap
// ─────────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
//  REPLACE the existing `app.post('/api/backtest', ...)` handler (around 1234)
//  with this version. Adds `interval` support + honest intraday-window handling.
// ═══════════════════════════════════════════════════════════════════════════
app.post('/api/backtest', async (req, res) => {
  try {
    const {
      symbol         = 'RELIANCE',
      strategy       = 'mean_reversion',
      startDate,
      endDate,
      initialCapital = 100000,
      params         = {},
      interval       = '1d',     // NEW: 1m | 5m | 15m | 30m | 60m/1h | 1d | 1wk
    } = req.body;

    if (!['mean_reversion', 'momentum', 'bollinger', 'vwap'].includes(strategy)) {
      return res.status(400).json({ success: false, error: `Unknown strategy "${strategy}". Use: mean_reversion | momentum | bollinger | vwap` });
    }

    const VALID_INTERVALS = ['1m', '5m', '15m', '30m', '60m', '1h', '1d', '1wk'];
    if (!VALID_INTERVALS.includes(interval)) {
      return res.status(400).json({ success: false, error: `Invalid interval. Use one of: ${VALID_INTERVALS.join(', ')}` });
    }

    const isIntraday = /m$/.test(interval) || interval === '1h' || interval === '60m';

    // Date range — default last 365 days (daily) / shorter handled by clamp in fetch
    const p2 = endDate   ? Math.floor(new Date(endDate).getTime()   / 1000) : Math.floor(Date.now() / 1000);
    const p1 = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : p2 - 365 * 24 * 3600;
    const days = Math.round((p2 - p1) / 86400) + 5;

    const prices = await fetchYahooOHLC(symbol, days, interval);
    if (!prices || prices.length < 40) {
      return res.status(400).json({
        success: false,
        error: isIntraday
          ? `Not enough ${interval} data for ${symbol}. Yahoo limits intraday history (1m≈7d, 5/15/30m≈60d, 1h≈730d). Pick a wider interval or a recent window.`
          : `Not enough data for ${symbol}. Check the symbol (NSE ticker, SYMBOL.NS, or AAPL for US).`,
      });
    }

    // For intraday, the date strings are 'YYYY-MM-DD HH:MM' — only date-filter when
    // the user supplied dates AND we're on a daily/weekly interval. For intraday we
    // use whatever window Yahoo returned (already clamped), to keep behaviour honest.
    let filtered = prices;
    if (!isIntraday) {
      const startStr = startDate || '';
      const endStr   = endDate   || '';
      filtered = prices.filter(p =>
        (!startStr || p.date >= startStr) &&
        (!endStr   || p.date <= endStr)
      );
    }
    if (filtered.length < 40) {
      return res.status(400).json({ success: false, error: 'Date range too narrow — need at least 40 bars.' });
    }

    const result = runBacktest(filtered, strategy, params, Number(initialCapital));

    res.json({
      success: true,
      symbol,
      strategy,
      interval,
      intraday: isIntraday,
      period: { from: filtered[0].date, to: filtered[filtered.length - 1].date, bars: filtered.length },
      initialCapital: Number(initialCapital),
      ...result,
    });
  } catch (e) {
    console.error('[Backtest]', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════
//  AHQ RESEARCH LIBRARY — arXiv q-fin feed
//  PASTE THIS BLOCK INTO server.js, ABOVE app.listen(...)
//  Adds: GET /api/research/arxiv
//  No new npm packages (uses the axios already imported at top of server.js)
// ═══════════════════════════════════════════════════════════════════════════

// arXiv quantitative-finance subcategories
const QFIN_CATEGORIES = {
  all:    { label: "All q-fin",            query: "cat:q-fin.*" },
  ST:     { label: "Statistics / Stat-arb", query: "cat:q-fin.ST" },
  TR:     { label: "Trading & Microstructure", query: "cat:q-fin.TR" },
  PM:     { label: "Portfolio Management",  query: "cat:q-fin.PM" },
  RM:     { label: "Risk Management",       query: "cat:q-fin.RM" },
  CP:     { label: "Computational Finance", query: "cat:q-fin.CP" },
  PR:     { label: "Pricing of Securities", query: "cat:q-fin.PR" },
  MF:     { label: "Mathematical Finance",  query: "cat:q-fin.MF" },
  GN:     { label: "General Finance",       query: "cat:q-fin.GN" },
  EC:     { label: "Economics",             query: "cat:q-fin.EC" },
};

// Tiny XML field extractor (arXiv returns Atom XML). Avoids adding an XML lib.
function extractAll(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g");
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}
function extractOne(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}
function decodeEntities(s) {
  return (s || "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ").trim();
}

let arxivCache = {}; // keyed by category, { data, ts }

app.get("/api/research/arxiv", async (req, res) => {
  try {
    const cat = (req.query.cat || "all").toString();
    const max = Math.min(parseInt(req.query.max) || 25, 50);
    const search = (req.query.q || "").toString().trim();

    const catDef = QFIN_CATEGORIES[cat] || QFIN_CATEGORIES.all;

    // 10-min cache per category (skip cache when a text search is supplied)
    const cacheKey = `${cat}:${search}`;
    const now = Date.now();
    if (!search && arxivCache[cacheKey] && now - arxivCache[cacheKey].ts < 10 * 60 * 1000) {
      return res.json({ success: true, cached: true, category: catDef.label, data: arxivCache[cacheKey].data });
    }

    // Build arXiv query
    let searchQuery = catDef.query;
    if (search) {
      // combine category + free-text in title/abstract
      const esc = encodeURIComponent(search);
      searchQuery = `(${catDef.query})+AND+(ti:${esc}+OR+abs:${esc})`;
    } else {
      searchQuery = encodeURIComponent(catDef.query);
    }

    const url =
      `http://export.arxiv.org/api/query?search_query=${searchQuery}` +
      `&start=0&max_results=${max}&sortBy=submittedDate&sortOrder=descending`;

    const r = await axios.get(url, { timeout: 15000, headers: { "User-Agent": "AlphaHedgeQuant/1.0" } });
    const xml = r.data;

    const entries = extractAll(xml, "entry").map((block) => {
      const id = extractOne(block, "id");
      const arxivId = id.split("/abs/")[1] || id;
      const title = decodeEntities(extractOne(block, "title"));
      const summary = decodeEntities(extractOne(block, "summary"));
      const published = extractOne(block, "published").slice(0, 10);
      const updated = extractOne(block, "updated").slice(0, 10);

      // authors
      const authorBlocks = extractAll(block, "author");
      const authors = authorBlocks.map((a) => decodeEntities(extractOne(a, "name"))).filter(Boolean);

      // primary category
      const primaryMatch = block.match(/<arxiv:primary_category[^>]*term="([^"]+)"/);
      const primaryCat = primaryMatch ? primaryMatch[1] : "";

      // links: pdf + abstract page
      const pdfMatch = block.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);
      const pdf = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${arxivId}`;
      const abs = `https://arxiv.org/abs/${arxivId}`;

      return {
        id: arxivId,
        title,
        authors: authors.slice(0, 6),
        authorsMore: Math.max(0, authors.length - 6),
        summary: summary.length > 320 ? summary.slice(0, 317) + "..." : summary,
        published,
        updated,
        primaryCat,
        abs,
        pdf,
        source: "arXiv",
      };
    });

    if (!search) arxivCache[cacheKey] = { data: entries, ts: now };

    res.json({
      success: true,
      cached: false,
      category: catDef.label,
      count: entries.length,
      generatedAt: new Date(now).toISOString(),
      data: entries,
    });
  } catch (e) {
    console.error("[arXiv]", e.message);
    res.status(500).json({ success: false, error: "Could not reach arXiv. " + e.message });
  }
});

// List available categories (frontend builds the filter chips from this)
app.get("/api/research/categories", (req, res) => {
  res.json({
    success: true,
    data: Object.entries(QFIN_CATEGORIES).map(([key, v]) => ({ key, label: v.label })),
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  ADD THIS ROUTE to server.js, ABOVE app.listen(...)
//  GET /api/prices?symbol=RELIANCE&interval=1d
//  Returns raw OHLC array — used by the custom-strategy (Pyodide) page.
//  Reuses fetchYahooOHLC (already interval-aware).
// ═══════════════════════════════════════════════════════════════════════════
app.get('/api/prices', async (req, res) => {
  try {
    const symbol   = (req.query.symbol || 'RELIANCE').toString();
    const interval = (req.query.interval || '1d').toString();

    const VALID = ['1m','5m','15m','30m','60m','1h','1d','1wk'];
    if (!VALID.includes(interval)) {
      return res.status(400).json({ success: false, error: `Invalid interval. Use: ${VALID.join(', ')}` });
    }

    // Lookback window per interval (daily/weekly get ~2y)
    const DAYS = { '1m':7, '5m':60, '15m':60, '30m':60, '60m':730, '1h':730, '1d':730, '1wk':730 };
    const days = DAYS[interval] || 730;

    const prices = await fetchYahooOHLC(symbol, days, interval);
    if (!prices || prices.length < 20) {
      return res.status(400).json({ success: false, error: `Not enough data for ${symbol} at ${interval}.` });
    }

    res.json({
      success: true,
      symbol,
      interval,
      count: prices.length,
      data: prices,   // [{date, open, high, low, close, volume}, ...]
    });
  } catch (e) {
    console.error('[Prices]', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
// ═══════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`AlphaHedgeQuant API v8.0 (Production) on port ${PORT}`);
  console.log(`${Object.keys(STOCKS).length} stocks | Token: ${CONFIG.accessToken ? 'SET' : 'MISSING'}`);
  console.log(`Daily token login: /auth/login`);
  console.log(`Universes: NSE ${Object.keys(STOCKS).length}+${NSE_EXTRA.length} | US ${US_STOCKS.length}`);

  setTimeout(() => {
    console.log('[Startup] Starting Yahoo Finance background fetch...');
    backgroundFetchFundamentals();
  }, 5000);
});
