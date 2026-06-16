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
function runBacktest(prices, strategy, params, initialCapital = 100000) {
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
  const sharpe = std === 0 ? 0 : (mean / std) * Math.sqrt(252);

  const downside = valid.filter(r => r < 0);
  const downStd  = downside.length < 2 ? 0.0001 :
    Math.sqrt(downside.reduce((a, b) => a + b ** 2, 0) / downside.length);
  const sortino  = (mean / downStd) * Math.sqrt(252);

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
      annualizedReturn: +(((finalVal / initialCapital) ** (252 / n) - 1) * 100).toFixed(2),
    },
    equityCurve: curve,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// YAHOO FINANCE DAILY FETCHER (uses the existing yahooGet helper in server.js)
// ─────────────────────────────────────────────────────────────────────────
async function fetchYahooOHLC(rawSymbol, days = 120) {
  // Accepts both NSE symbols ('RELIANCE') and Yahoo symbols ('RELIANCE.NS', 'AAPL')
  const ySymbol = rawSymbol.includes('.') || /^[A-Z]{1,5}$/.test(rawSymbol) && !STOCKS[rawSymbol]
    ? rawSymbol
    : rawSymbol + '.NS';

  const p2 = Math.floor(Date.now() / 1000);
  const p1 = Math.floor((Date.now() - days * 24 * 3600 * 1000) / 1000);
  const url =
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}` +
    `?period1=${p1}&period2=${p2}&interval=1d`;

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
        date:   new Date(t * 1000).toISOString().split('T')[0],
        open:   q.open[i]   != null ? +q.open[i].toFixed(2)   : null,
        high:   q.high[i]   != null ? +q.high[i].toFixed(2)   : null,
        low:    q.low[i]    != null ? +q.low[i].toFixed(2)    : null,
        close:  adj ? (adj[i] != null ? +adj[i].toFixed(2) : null) : (q.close[i] != null ? +q.close[i].toFixed(2) : null),
        volume: q.volume[i] || 0,
      }))
      .filter(p => p.close != null && p.close > 0);
  } catch (e) {
    console.error(`[OHLC] ${rawSymbol}: ${e.message}`);
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
app.post('/api/backtest', async (req, res) => {
  try {
    const {
      symbol        = 'RELIANCE',
      strategy      = 'mean_reversion',
      startDate,
      endDate,
      initialCapital = 100000,
      params        = {},
    } = req.body;

    if (!['mean_reversion', 'momentum', 'bollinger', 'vwap'].includes(strategy)) {
      return res.status(400).json({ success: false, error: `Unknown strategy "${strategy}". Use: mean_reversion | momentum | bollinger | vwap` });
    }

    // Date range — default: last 365 days
    const p2 = endDate   ? Math.floor(new Date(endDate).getTime()   / 1000) : Math.floor(Date.now() / 1000);
    const p1 = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : p2 - 365 * 24 * 3600;
    const days = Math.round((p2 - p1) / 86400) + 5;

    const prices = await fetchYahooOHLC(symbol, days);
    if (!prices || prices.length < 40) {
      return res.status(400).json({ success: false, error: `Not enough data for ${symbol}. Check symbol (use NSE tickers or SYMBOL.NS / AAPL for US).` });
    }

    // Filter to requested date window
    const startStr = startDate || '';
    const endStr   = endDate   || '';
    const filtered = prices.filter(p =>
      (!startStr || p.date >= startStr) &&
      (!endStr   || p.date <= endStr)
    );
    if (filtered.length < 40) {
      return res.status(400).json({ success: false, error: 'Date range too narrow — need at least 40 trading days.' });
    }

    const result = runBacktest(filtered, strategy, params, Number(initialCapital));

    res.json({
      success: true,
      symbol,
      strategy,
      period: { from: filtered[0].date, to: filtered[filtered.length - 1].date, days: filtered.length },
      initialCapital: Number(initialCapital),
      ...result,
    });
  } catch (e) {
    console.error('[Backtest]', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
