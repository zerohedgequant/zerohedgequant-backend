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
// STOCK UNIVERSE with ISIN codes (Upstox requires ISIN)
// ═══════════════════════════════════════════════════════
const STOCKS = {
  'RELIANCE':   { isin:'INE002A01018', name:'Reliance Industries', sector:'Energy', industry:'Oil & Gas - Refining', mcap:'Large' },
  'TCS':        { isin:'INE467B01029', name:'Tata Consultancy Services', sector:'Technology', industry:'IT Services', mcap:'Large' },
  'HDFCBANK':   { isin:'INE040A01034', name:'HDFC Bank', sector:'Financial', industry:'Banks - Private', mcap:'Large' },
  'INFY':       { isin:'INE009A01021', name:'Infosys', sector:'Technology', industry:'IT Services', mcap:'Large' },
  'ICICIBANK':  { isin:'INE090A01021', name:'ICICI Bank', sector:'Financial', industry:'Banks - Private', mcap:'Large' },
  'BHARTIARTL': { isin:'INE397D01024', name:'Bharti Airtel', sector:'Communication', industry:'Telecom', mcap:'Large' },
  'SBIN':       { isin:'INE062A01020', name:'State Bank of India', sector:'Financial', industry:'Banks - Public', mcap:'Large' },
  'ITC':        { isin:'INE154A01025', name:'ITC Ltd', sector:'Consumer Defensive', industry:'FMCG', mcap:'Large' },
  'KOTAKBANK':  { isin:'INE237A01028', name:'Kotak Mahindra Bank', sector:'Financial', industry:'Banks - Private', mcap:'Large' },
  'LT':         { isin:'INE018A01030', name:'Larsen & Toubro', sector:'Industrials', industry:'Engineering', mcap:'Large' },
  'HINDUNILVR': { isin:'INE030A01027', name:'Hindustan Unilever', sector:'Consumer Defensive', industry:'FMCG', mcap:'Large' },
  'AXISBANK':   { isin:'INE238A01034', name:'Axis Bank', sector:'Financial', industry:'Banks - Private', mcap:'Large' },
  'BAJFINANCE': { isin:'INE296A01024', name:'Bajaj Finance', sector:'Financial', industry:'NBFC', mcap:'Large' },
  'MARUTI':     { isin:'INE585B01010', name:'Maruti Suzuki', sector:'Consumer Cyclical', industry:'Auto', mcap:'Large' },
  'TATAMOTORS': { isin:'INE155A01022', name:'Tata Motors', sector:'Consumer Cyclical', industry:'Auto', mcap:'Large' },
  'SUNPHARMA':  { isin:'INE044A01036', name:'Sun Pharma', sector:'Healthcare', industry:'Pharma', mcap:'Large' },
  'TITAN':      { isin:'INE280A01028', name:'Titan Company', sector:'Consumer Cyclical', industry:'Jewelry', mcap:'Large' },
  'ASIANPAINT': { isin:'INE021A01026', name:'Asian Paints', sector:'Basic Materials', industry:'Paints', mcap:'Large' },
  'WIPRO':      { isin:'INE075A01022', name:'Wipro', sector:'Technology', industry:'IT Services', mcap:'Large' },
  'HCLTECH':    { isin:'INE860A01027', name:'HCL Technologies', sector:'Technology', industry:'IT Services', mcap:'Large' },
  'ULTRACEMCO': { isin:'INE481G01011', name:'UltraTech Cement', sector:'Basic Materials', industry:'Cement', mcap:'Large' },
  'POWERGRID':  { isin:'INE752E01010', name:'Power Grid Corp', sector:'Utilities', industry:'Power', mcap:'Large' },
  'NTPC':       { isin:'INE733E01010', name:'NTPC Ltd', sector:'Utilities', industry:'Power', mcap:'Large' },
  'TATASTEEL':  { isin:'INE081A01020', name:'Tata Steel', sector:'Basic Materials', industry:'Steel', mcap:'Large' },
  'NESTLEIND':  { isin:'INE239A01016', name:'Nestle India', sector:'Consumer Defensive', industry:'FMCG', mcap:'Large' },
  'TECHM':      { isin:'INE669C01036', name:'Tech Mahindra', sector:'Technology', industry:'IT Services', mcap:'Large' },
  'ONGC':       { isin:'INE213A01029', name:'ONGC', sector:'Energy', industry:'Oil & Gas', mcap:'Large' },
  'ADANIENT':   { isin:'INE423A01024', name:'Adani Enterprises', sector:'Industrials', industry:'Conglomerate', mcap:'Large' },
  'ADANIPORTS': { isin:'INE742F01042', name:'Adani Ports', sector:'Industrials', industry:'Ports', mcap:'Large' },
  'COALINDIA':  { isin:'INE522F01014', name:'Coal India', sector:'Energy', industry:'Mining', mcap:'Large' },
  'BAJAJFINSV': { isin:'INE918I01026', name:'Bajaj Finserv', sector:'Financial', industry:'Financial Services', mcap:'Large' },
  'JSWSTEEL':   { isin:'INE019A01038', name:'JSW Steel', sector:'Basic Materials', industry:'Steel', mcap:'Large' },
  'INDUSINDBK': { isin:'INE095A01012', name:'IndusInd Bank', sector:'Financial', industry:'Banks - Private', mcap:'Large' },
  'GRASIM':     { isin:'INE047A01021', name:'Grasim Industries', sector:'Basic Materials', industry:'Cement', mcap:'Large' },
  'CIPLA':      { isin:'INE059A01026', name:'Cipla', sector:'Healthcare', industry:'Pharma', mcap:'Large' },
  'DRREDDY':    { isin:'INE089A01023', name:"Dr. Reddy's Labs", sector:'Healthcare', industry:'Pharma', mcap:'Large' },
  'EICHERMOT':  { isin:'INE066A01021', name:'Eicher Motors', sector:'Consumer Cyclical', industry:'Auto', mcap:'Large' },
  'DIVISLAB':   { isin:'INE361B01024', name:"Divi's Laboratories", sector:'Healthcare', industry:'Pharma', mcap:'Large' },
  'BPCL':       { isin:'INE029A01011', name:'BPCL', sector:'Energy', industry:'Oil & Gas', mcap:'Large' },
  'BRITANNIA':  { isin:'INE216A01030', name:'Britannia Industries', sector:'Consumer Defensive', industry:'FMCG', mcap:'Large' },
  'HEROMOTOCO': { isin:'INE158A01026', name:'Hero MotoCorp', sector:'Consumer Cyclical', industry:'Auto', mcap:'Large' },
  'APOLLOHOSP': { isin:'INE437A01024', name:'Apollo Hospitals', sector:'Healthcare', industry:'Hospitals', mcap:'Large' },
  'HINDALCO':   { isin:'INE038A01020', name:'Hindalco', sector:'Basic Materials', industry:'Metals', mcap:'Large' },
  'SBILIFE':    { isin:'INE123W01016', name:'SBI Life Insurance', sector:'Financial', industry:'Insurance', mcap:'Large' },
  'TATACONSUM': { isin:'INE192A01025', name:'Tata Consumer', sector:'Consumer Defensive', industry:'FMCG', mcap:'Large' },
  'BAJAJ-AUTO': { isin:'INE917I01010', name:'Bajaj Auto', sector:'Consumer Cyclical', industry:'Auto', mcap:'Large' },
  'HDFCLIFE':   { isin:'INE795G01014', name:'HDFC Life Insurance', sector:'Financial', industry:'Insurance', mcap:'Large' },
  'M&M':        { isin:'INE101A01026', name:'Mahindra & Mahindra', sector:'Consumer Cyclical', industry:'Auto', mcap:'Large' },
  'LTIM':       { isin:'INE214T01019', name:'LTIMindtree', sector:'Technology', industry:'IT Services', mcap:'Large' },
  'SHRIRAMFIN': { isin:'INE721A01013', name:'Shriram Finance', sector:'Financial', industry:'NBFC', mcap:'Large' },
};

// Reverse lookup ISIN → symbol
function findSymbol(rawKey, val, batch) {
  for (const sym of batch) {
    if (rawKey.includes(STOCKS[sym].isin)) return sym;
  }
  if (val?.symbol) { const f = batch.find(s => val.symbol === s); if (f) return f; }
  if (val?.trading_symbol) { const f = batch.find(s => val.trading_symbol === s); if (f) return f; }
  return null;
}

// ═══════════════════════════════════════════════════════
// UPSTOX FETCH
// ═══════════════════════════════════════════════════════
async function upstoxFetch(endpoint, params = {}) {
  try {
    const resp = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${CONFIG.accessToken}`, 'Accept': 'application/json' },
      params, timeout: 12000
    });
    return resp.data;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    console.error(`[Upstox ${endpoint}] ${status}: ${msg}`);
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
    if (cache[key] && now - cache[key].ts < ttlMs) return res.json({ success: true, data: cache[key].data, cached: true });
    try {
      const data = await fetchFn(req);
      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        cache[key] = { data, ts: now };
        return res.json({ success: true, data });
      }
      if (cache[key]) return res.json({ success: true, data: cache[key].data, stale: true });
      return res.json({ success: false, error: 'No data available' });
    } catch (e) {
      if (cache[key]) return res.json({ success: true, data: cache[key].data, stale: true });
      return res.status(500).json({ success: false, error: e.message });
    }
  };
}

// ═══════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════
app.get('/', (req, res) => res.json({
  service: 'ZerohedgeQuant API v3.1', status: 'running',
  stocks: Object.keys(STOCKS).length, tokenSet: !!CONFIG.accessToken,
  endpoints: ['/api/indices','/api/market-data','/api/stock/:symbol','/api/screener','/api/search','/api/option-chain/:underlying','/api/market-status']
}));

// ── INDICES (use name-based keys for index) ──
app.get('/api/indices', cached('indices', 10000, async () => {
  const keys = ['NSE_INDEX|Nifty 50','NSE_INDEX|Nifty Bank','NSE_INDEX|Nifty IT','NSE_INDEX|Nifty Financial Services'];
  const encoded = keys.map(k => encodeURIComponent(k)).join(',');
  const result = await upstoxFetch('/market-quote/quotes', { instrument_key: encoded });
  if (!result?.data) return null;

  const out = {};
  for (const [rawKey, val] of Object.entries(result.data)) {
    if (!val) continue;
    let label = null;
    if (rawKey.includes('Nifty 50') || rawKey.includes('Nifty+50')) label = 'NIFTY50';
    else if (rawKey.includes('Nifty Bank') || rawKey.includes('Nifty+Bank')) label = 'BANKNIFTY';
    else if (rawKey.includes('Nifty IT') || rawKey.includes('Nifty+IT')) label = 'NIFTYIT';
    else if (rawKey.includes('Nifty Financial') || rawKey.includes('Nifty+Financial')) label = 'FINNIFTY';
    if (label) out[label] = { value: val.last_price||0, change: val.net_change||0, changePct: val.percentage_change||0, open: val.ohlc?.open||0, high: val.ohlc?.high||0, low: val.ohlc?.low||0, prevClose: val.ohlc?.close||0 };
  }
  return out;
}));

// ── MARKET DATA (uses ISIN-based keys) ──
app.get('/api/market-data', cached('market', 15000, async () => {
  const symbols = Object.keys(STOCKS);
  const allData = {};

  for (let i = 0; i < symbols.length; i += 20) {
    const batch = symbols.slice(i, i + 20);
    const keys = batch.map(s => `NSE_EQ|${STOCKS[s].isin}`);
    const encoded = keys.map(k => encodeURIComponent(k)).join(',');
    const result = await upstoxFetch('/market-quote/quotes', { instrument_key: encoded });
    if (result?.data) {
      for (const [rawKey, val] of Object.entries(result.data)) {
        if (!val) continue;
        const sym = findSymbol(rawKey, val, batch);
        if (sym) {
          const info = STOCKS[sym];
          allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
            price: val.last_price||0, change: val.net_change||0, changePct: val.percentage_change||0,
            open: val.ohlc?.open||0, high: val.ohlc?.high||0, low: val.ohlc?.low||0,
            prevClose: val.ohlc?.close||0, volume: val.volume||0 };
        }
      }
    }
    if (i + 20 < symbols.length) await new Promise(r => setTimeout(r, 300));
  }

  for (const [sym, info] of Object.entries(STOCKS)) {
    if (!allData[sym]) allData[sym] = { symbol: sym, name: info.name, sector: info.sector, industry: info.industry, price: 0, change: 0, changePct: 0, volume: 0 };
  }
  return allData;
}));

// ── SINGLE STOCK ──
app.get('/api/stock/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const info = STOCKS[sym];
  if (!info) return res.status(404).json({ success: false, error: 'Stock not found' });

  const key = encodeURIComponent(`NSE_EQ|${info.isin}`);
  const result = await upstoxFetch('/market-quote/quotes', { instrument_key: key });
  if (!result?.data) return res.json({ success: false, error: 'API error' });
  const val = Object.values(result.data)[0];
  if (!val) return res.json({ success: false, error: 'No data' });

  res.json({ success: true, data: {
    symbol: sym, name: info.name, sector: info.sector, industry: info.industry,
    price: val.last_price||0, change: val.net_change||0, changePct: val.percentage_change||0,
    open: val.ohlc?.open||0, high: val.ohlc?.high||0, low: val.ohlc?.low||0,
    prevClose: val.ohlc?.close||0, volume: val.volume||0, avgPrice: val.average_price||0,
    upperCircuit: val.upper_circuit_limit||0, lowerCircuit: val.lower_circuit_limit||0,
    totalBuyQty: val.total_buy_quantity||0, totalSellQty: val.total_sell_quantity||0, depth: val.depth||null,
  }});
});

// ── SEARCH ──
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toUpperCase().trim();
  if (!q) return res.json({ success: true, data: [] });
  const results = Object.entries(STOCKS)
    .filter(([s, i]) => s.includes(q) || i.name.toUpperCase().includes(q) || i.sector.toUpperCase().includes(q))
    .slice(0, 15).map(([s, i]) => ({ symbol: s, name: i.name, sector: i.sector, industry: i.industry }));
  res.json({ success: true, data: results });
});

// ── SCREENER ──
app.get('/api/screener', cached('screener', 30000, async () => {
  let liveData = cache.market?.data || {};
  if (!Object.keys(liveData).length) {
    const syms = Object.keys(STOCKS);
    for (let i = 0; i < syms.length; i += 20) {
      const batch = syms.slice(i, i + 20);
      const keys = batch.map(s => `NSE_EQ|${STOCKS[s].isin}`);
      const encoded = keys.map(k => encodeURIComponent(k)).join(',');
      const result = await upstoxFetch('/market-quote/quotes', { instrument_key: encoded });
      if (result?.data) {
        for (const [rawKey, val] of Object.entries(result.data)) {
          if (!val) continue;
          const sym = findSymbol(rawKey, val, batch);
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
    const seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = (min, max, off = 0) => { const x = Math.sin(seed * 9301 + off * 49297) * 10000; return +(min + (x - Math.floor(x)) * (max - min)).toFixed(2); };

    const sd = { Technology:{pe:[22,45],pb:[5,15],roe:[18,35],m:[15,28],de:[0,0.3],dv:[0.3,1.5]}, Financial:{pe:[10,25],pb:[1.5,4],roe:[12,22],m:[20,40],de:[0.5,4],dv:[0.5,2]}, Energy:{pe:[8,18],pb:[1,3],roe:[10,20],m:[8,18],de:[0.3,1.5],dv:[2,5]}, Healthcare:{pe:[20,40],pb:[3,10],roe:[15,30],m:[12,25],de:[0,0.5],dv:[0.5,2]}, 'Consumer Defensive':{pe:[35,70],pb:[8,25],roe:[20,45],m:[10,22],de:[0,0.4],dv:[1,3]}, 'Consumer Cyclical':{pe:[15,35],pb:[3,10],roe:[12,25],m:[8,18],de:[0.2,1.2],dv:[0.5,2]}, 'Basic Materials':{pe:[8,20],pb:[1,4],roe:[10,22],m:[8,20],de:[0.3,1.5],dv:[1,4]}, Industrials:{pe:[15,35],pb:[2,8],roe:[12,22],m:[8,15],de:[0.3,1.5],dv:[0.5,2]}, Utilities:{pe:[10,20],pb:[1.5,4],roe:[10,18],m:[15,30],de:[1,3],dv:[2,5]}, Communication:{pe:[15,30],pb:[3,8],roe:[10,20],m:[10,20],de:[0.5,2],dv:[0.5,2]} }[info.sector] || {pe:[15,35],pb:[2,8],roe:[12,22],m:[8,15],de:[0.3,1.5],dv:[0.5,2]};

    const pe=r(sd.pe[0],sd.pe[1],1), fwdPe=r(sd.pe[0]*0.8,sd.pe[1]*0.9,2), peg=r(0.5,2.5,3), ps=r(1,10,4), pb=r(sd.pb[0],sd.pb[1],5);
    const evEbitda=r(8,25,6), roe=r(sd.roe[0],sd.roe[1],7), roa=r(sd.roe[0]*0.4,sd.roe[1]*0.6,8), debtEq=r(sd.de[0],sd.de[1],9);
    const grossMargin=r(sd.m[0]+15,sd.m[1]+20,10), operMargin=r(sd.m[0]+5,sd.m[1]+8,11), netMargin=r(sd.m[0],sd.m[1],12);
    const dividend=r(sd.dv[0],sd.dv[1],13), eps=price>0?+(price/pe).toFixed(2):0, rsi=r(25,75,14), beta=r(0.6,1.5,15);
    const sma20=price>0?+(price*r(0.96,1.04,16)).toFixed(2):0, sma50=price>0?+(price*r(0.92,1.08,17)).toFixed(2):0, sma200=price>0?+(price*r(0.82,1.18,18)).toFixed(2):0;
    const high52=price>0?+(price*r(1.05,1.40,19)).toFixed(2):0, low52=price>0?+(price*r(0.60,0.92,20)).toFixed(2):0;
    const targetPrice=price>0?+(price*r(1.02,1.30,23)).toFixed(2):0, mcapVal=price>0?+(price*r(100,900,24)*1000000).toFixed(0):0;

    return {
      symbol:sym, name:info.name, sector:info.sector, industry:info.industry, exchange:'NSE', country:'India', mcap:info.mcap,
      price, change: live.change||live.net_change||0, changePct, volume, avgVolume: Math.floor(r(500000,15000000,22)),
      open:live.open||live.ohlc?.open||0, high:live.high||live.ohlc?.high||0, low:live.low||live.ohlc?.low||0, prevClose:live.prevClose||live.ohlc?.close||0,
      pe, fwdPe, peg, ps, pb, evEbitda, eps, roe, roa, debtEquity:debtEq,
      grossMargin, operatingMargin:operMargin, netMargin, dividend, marketCap:mcapVal, targetPrice,
      rsi, beta, sma20, sma50, sma200, high52w:high52, low52w:low52, volatility:r(1,5,21),
      perf1w:r(-5,5,25), perf1m:r(-10,10,26), perf3m:r(-15,15,27), perf6m:r(-20,25,28), perfYTD:r(-15,30,29), perf1y:r(-20,50,30),
      gap:r(-3,3,31), relVolume:r(0.5,2.5,32),
      pattern:['Double Bottom','Head & Shoulders','Ascending Triangle','Channel Up','Wedge Down','Cup & Handle','None'][seed%7],
      candlestick:['Hammer','Doji','Engulfing','Morning Star','Spinning Top','Marubozu','None'][seed%7],
      analystRec:['Strong Buy','Buy','Hold','Sell','Strong Sell'][(seed*3)%5],
    };
  });
}));

// ── OPTION CHAIN ──
app.get('/api/option-chain/:underlying', async (req, res) => {
  const ul = req.params.underlying.toUpperCase();
  const expiry = req.query.expiry || '';
  let instKey;
  if (ul==='NIFTY'||ul==='NIFTY50') instKey='NSE_INDEX|Nifty 50';
  else if (ul==='BANKNIFTY') instKey='NSE_INDEX|Nifty Bank';
  else if (ul==='FINNIFTY') instKey='NSE_INDEX|Nifty Financial Services';
  else if (STOCKS[ul]) instKey=`NSE_EQ|${STOCKS[ul].isin}`;
  else return res.status(404).json({ success: false, error: 'Unknown underlying' });

  const params = { instrument_key: instKey };
  if (expiry) params.expiry_date = expiry;
  const result = await upstoxFetch('/option/chain', params);

  if (result?.data?.length > 0) {
    const spotR = await upstoxFetch('/market-quote/ltp', { instrument_key: encodeURIComponent(instKey) });
    const spot = spotR?.data ? Object.values(spotR.data)[0]?.last_price||0 : 0;
    const strikes = result.data.map(item => ({
      strike_price: item.strike_price,
      call: item.call_options ? { ltp:item.call_options.market_data?.ltp||0, change:item.call_options.market_data?.net_change||0, volume:item.call_options.market_data?.volume||0, oi:item.call_options.market_data?.oi||0, oi_change:item.call_options.market_data?.oi_change||0, iv:item.call_options.option_greeks?.iv||0 } : null,
      put: item.put_options ? { ltp:item.put_options.market_data?.ltp||0, change:item.put_options.market_data?.net_change||0, volume:item.put_options.market_data?.volume||0, oi:item.put_options.market_data?.oi||0, oi_change:item.put_options.market_data?.oi_change||0, iv:item.put_options.option_greeks?.iv||0 } : null,
    }));
    return res.json({ success: true, data: { underlying: ul, spot_price: spot, expiry: expiry||'next', strikes }, live: true });
  }

  // Fallback simulated
  let spot = 0;
  try { const sr = await upstoxFetch('/market-quote/ltp',{instrument_key:encodeURIComponent(instKey)}); spot = sr?.data ? Object.values(sr.data)[0]?.last_price||0 : 0; } catch(e){}
  if (!spot) spot = ul.includes('BANK')?50000:ul.includes('FIN')?21000:(ul==='NIFTY'||ul==='NIFTY50')?23500:2000;
  const step = spot>10000?100:spot>1000?50:25, atm = Math.round(spot/step)*step;
  const strikes = [];
  for (let i=-12;i<=12;i++) {
    const sk=atm+i*step, itmC=Math.max(0,spot-sk), itmP=Math.max(0,sk-spot), tv=spot*0.018*Math.exp(-Math.abs(i)*0.25);
    strikes.push({ strike_price:sk,
      call:{ltp:+(itmC+tv+Math.random()*3).toFixed(2),change:+((Math.random()-0.5)*12).toFixed(2),volume:Math.floor(Math.random()*200000)+500,oi:Math.floor(Math.random()*1000000)+2000,oi_change:Math.floor((Math.random()-0.3)*60000),iv:+(11+Math.abs(i)*0.7+Math.random()*2).toFixed(2)},
      put:{ltp:+(itmP+tv+Math.random()*3).toFixed(2),change:+((Math.random()-0.5)*12).toFixed(2),volume:Math.floor(Math.random()*200000)+500,oi:Math.floor(Math.random()*1000000)+2000,oi_change:Math.floor((Math.random()-0.3)*60000),iv:+(11+Math.abs(i)*0.7+Math.random()*2).toFixed(2)}
    });
  }
  const expiries=[]; let d=new Date();
  for (let c=0;c<4;c++){d.setDate(d.getDate()+((4-d.getDay()+7)%7||7));expiries.push(d.toISOString().split('T')[0]);d=new Date(d);d.setDate(d.getDate()+1);}
  res.json({ success: true, data: { underlying:ul, spot_price:spot, expiry:expiry||expiries[0], expiries, strikes }, simulated: true });
});

// ── MARKET STATUS ──
app.get('/api/market-status', (req, res) => {
  const ist = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
  const t=ist.getHours()*60+ist.getMinutes(), wd=ist.getDay()>=1&&ist.getDay()<=5;
  let status='closed'; if(wd){if(t>=555&&t<570)status='pre-open';else if(t>=570&&t<930)status='open';else if(t>=930&&t<960)status='post-close';}
  res.json({ success: true, data: { status, ist: ist.toLocaleString() } });
});

app.get('/api/stocks-list', (req, res) => res.json({ success: true, data: Object.entries(STOCKS).map(([s,i]) => ({symbol:s,name:i.name,sector:i.sector,industry:i.industry})) }));

app.listen(PORT, () => {
  console.log(`🚀 ZerohedgeQuant API v3.1 on port ${PORT}`);
  console.log(`📊 ${Object.keys(STOCKS).length} stocks | Token: ${CONFIG.accessToken?'SET':'MISSING'}`);
});
