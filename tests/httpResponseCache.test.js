const test = require('node:test');
const assert = require('node:assert/strict');
const createResponseCache = require('../lib/httpResponseCache');

function makeResponse() {
  const headers = {};
  const listeners = {};
  return {
    statusCode: 200,
    headers,
    body: undefined,
    set(name, value) { headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    once(event, callback) { listeners[event] = callback; return this; },
    json(body) {
      this.body = body;
      listeners.finish?.();
      return this;
    },
  };
}

function makeRequest(path, query = {}) {
  return { method: 'GET', path, query };
}

test('caches successful GET JSON responses and marks cache hits', () => {
  let clock = 1000;
  const middleware = createResponseCache({
    now: () => clock,
    getPolicy: () => ({ ttlMs: 2000, shouldCache: (body) => body.success === true }),
  });

  const first = makeResponse();
  let firstNext = 0;
  middleware(makeRequest('/api/stock/RELIANCE'), first, () => {
    firstNext += 1;
    first.json({ success: true, price: 100 });
  });

  assert.equal(firstNext, 1);
  assert.equal(first.headers['X-AHQ-Cache'], 'MISS');

  clock += 500;
  const second = makeResponse();
  let secondNext = 0;
  middleware(makeRequest('/api/stock/RELIANCE'), second, () => { secondNext += 1; });

  assert.equal(secondNext, 0);
  assert.equal(second.headers['X-AHQ-Cache'], 'HIT');
  assert.equal(second.headers['X-AHQ-Cache-Age-Ms'], '500');
  assert.deepEqual(second.body, { success: true, price: 100 });
});

test('does not cache failed or explicitly non-cacheable responses', () => {
  const middleware = createResponseCache({
    getPolicy: () => ({ ttlMs: 1000, shouldCache: (body) => body.success === true }),
  });

  const first = makeResponse();
  middleware(makeRequest('/api/option-chain/NIFTY'), first, () => {
    first.status(503).json({ success: false, error: 'provider unavailable' });
  });

  const second = makeResponse();
  let nextCalls = 0;
  middleware(makeRequest('/api/option-chain/NIFTY'), second, () => {
    nextCalls += 1;
    second.json({ success: true, live: true });
  });

  assert.equal(nextCalls, 1);
  assert.equal(second.headers['X-AHQ-Cache'], 'MISS');
  assert.equal(second.body.success, true);
});


test('coalesces concurrent identical requests into one provider fetch', async () => {
  const middleware = createResponseCache({
    getPolicy: () => ({ ttlMs: 1000, shouldCache: (body) => body.success === true }),
  });
  const request = makeRequest('/api/option-chain/NIFTY', { expiry: '2026-11-26' });
  const first = makeResponse();
  let providerCalls = 0;
  middleware(request, first, () => { providerCalls += 1; });

  const second = makeResponse();
  let secondNextCalls = 0;
  middleware(makeRequest('/api/option-chain/NIFTY', { expiry: '2026-11-26' }), second, () => {
    secondNextCalls += 1;
  });

  first.json({ success: true, live: true, data: { strikes: [] } });
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(providerCalls, 1);
  assert.equal(secondNextCalls, 0);
  assert.equal(second.headers['X-AHQ-Cache'], 'HIT');
  assert.equal(second.body.live, true);
});

test('canonicalizes query keys so parameter order does not fragment the cache', () => {
  const middleware = createResponseCache({
    getPolicy: () => ({ ttlMs: 1000, shouldCache: (body) => body.success === true }),
  });

  const first = makeResponse();
  middleware(makeRequest('/api/prices', { symbol: 'RELIANCE', interval: '1d' }), first, () => {
    first.json({ success: true, count: 1 });
  });

  const second = makeResponse();
  let nextCalls = 0;
  middleware(makeRequest('/api/prices', { interval: '1d', symbol: 'RELIANCE' }), second, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 0);
  assert.equal(second.headers['X-AHQ-Cache'], 'HIT');
  assert.deepEqual(second.body, { success: true, count: 1 });
});
