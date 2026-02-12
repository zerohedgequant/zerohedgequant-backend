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

// Upstox fetch helper
async function upstoxGet(endpoint, params = {}) {
  try {
    const r = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${CONFIG.accessToken}`, 'Accept': 'application/json' },
      params,
      timeout: 12000
    });
    return { ok: true, data: r.data };
  } catch (err) {
    return {
      ok: false,
      status: err.response?.status,
      error: err.response?.data || err.message
    };
  }
}

// ══════════════════════════════════════
// DEBUG: Try every possible key format
// ══════════════════════════════════════
app.get('/api/debug', async (req, res) => {
  const formats = [
    'NSE_EQ|INE002A01018',
    'NSE_EQ|RELIANCE',
    'NSE_EQ|RELIANCE-EQ',
    'NSE_EQ|2885',
  ];

  const indexFormats = [
    'NSE_INDEX|Nifty 50',
    'NSE_INDEX|NIFTY 50',
    'NSE_INDEX|Nifty+50',
    'NSE_INDEX|NIFTY50',
  ];

  const results = {};

  // Test each equity format
  for (const key of formats) {
    const r = await upstoxGet('/market-quote/ltp', { instrument_key: key });
    results[key] = r.ok ? { SUCCESS: true, data: r.data } : { SUCCESS: false, status: r.status, error: r.error };
  }

  // Test index formats
  for (const key of indexFormats) {
    const r = await upstoxGet('/market-quote/ltp', { instrument_key: key });
    results[key] = r.ok ? { SUCCESS: true, data: r.data } : { SUCCESS: false, status: r.status, error: r.error };
  }

  // Test instrument search API
  const search = await upstoxGet('/search', { q: 'RELIANCE', exchange: 'NSE' });
  results['SEARCH_RELIANCE'] = search.ok ? { SUCCESS: true, first_3_results: (search.data?.data || []).slice(0, 3) } : { SUCCESS: false, error: search.error };

  res.json({
    version: 'debug-3.2',
    token_present: !!CONFIG.accessToken,
    token_preview: CONFIG.accessToken ? CONFIG.accessToken.substring(0, 25) + '...' : 'NONE',
    results
  });
});

app.get('/', (req, res) => {
  res.json({ service: 'ZerohedgeQuant DEBUG v3.2', status: 'running', instructions: 'Go to /api/debug to test Upstox key formats' });
});

app.listen(PORT, () => {
  console.log('DEBUG server v3.2 on port ' + PORT);
  console.log('Token present:', !!CONFIG.accessToken);
});
