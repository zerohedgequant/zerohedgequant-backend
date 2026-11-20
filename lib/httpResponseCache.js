const DEFAULT_MAX_ENTRIES = 500;

function createResponseCache({ getPolicy, maxEntries = DEFAULT_MAX_ENTRIES, now = Date.now } = {}) {
  if (typeof getPolicy !== 'function') throw new TypeError('getPolicy must be a function');

  const entries = new Map();
  const inFlight = new Map();

  function makeKey(req) {
    const query = Object.keys(req.query || {})
      .sort()
      .map((key) => {
        const value = req.query[key];
        const normalized = Array.isArray(value) ? value.map(String).join(',') : String(value);
        return encodeURIComponent(key) + '=' + encodeURIComponent(normalized);
      })
      .join('&');
    return req.method + ':' + req.path + (query ? '?' + query : '');
  }

  function touch(key, entry) {
    entries.delete(key);
    entries.set(key, entry);
  }

  function evict() {
    while (entries.size > maxEntries) {
      entries.delete(entries.keys().next().value);
    }
  }

  function sendHit(res, entry, ageMs) {
    res.set('X-AHQ-Cache', 'HIT');
    res.set('X-AHQ-Cache-Age-Ms', String(Math.max(0, ageMs)));
    if (entry.cacheControl) res.set('Cache-Control', entry.cacheControl);
    return res.status(entry.status).json(entry.body);
  }

  return function responseCacheMiddleware(req, res, next) {
    if (req.method !== 'GET') return next();

    let policy;
    try {
      policy = getPolicy(req);
    } catch (error) {
      return next(error);
    }

    if (!policy || !Number.isFinite(policy.ttlMs) || policy.ttlMs <= 0) return next();

    const key = makeKey(req);
    const ttlMs = policy.ttlMs;
    const currentTime = now();
    const cached = entries.get(key);

    if (cached && currentTime - cached.ts < ttlMs) {
      touch(key, cached);
      return sendHit(res, cached, currentTime - cached.ts);
    }
    if (cached) entries.delete(key);

    const pending = inFlight.get(key);
    if (pending) {
      pending.then(() => {
        const latest = entries.get(key);
        const ageMs = latest ? now() - latest.ts : Infinity;
        if (latest && ageMs >= 0 && ageMs < ttlMs) {
          touch(key, latest);
          return sendHit(res, latest, ageMs);
        }
        return responseCacheMiddleware(req, res, next);
      }).catch(next);
      return;
    }

    let settled = false;
    let settle;
    const waitForRequest = new Promise((resolve) => { settle = resolve; });
    inFlight.set(key, waitForRequest);

    const finish = () => {
      if (!settled) {
        settled = true;
        settle();
      }
      if (inFlight.get(key) === waitForRequest) inFlight.delete(key);
    };

    res.set('X-AHQ-Cache', 'MISS');
    if (policy.cacheControl) res.set('Cache-Control', policy.cacheControl);

    const originalJson = res.json;
    res.json = function cachedJson(body, ...args) {
      const status = res.statusCode || 200;
      let shouldCache = false;
      try {
        shouldCache = status === 200 && (!policy.shouldCache || policy.shouldCache(body, req));
      } catch (error) {
        console.warn('[Response cache] Cache predicate failed:', error.message);
      }

      if (shouldCache) {
        const entry = {
          body,
          status,
          ts: now(),
          cacheControl: policy.cacheControl || null,
        };
        touch(key, entry);
        evict();
      }

      finish();
      return originalJson.call(this, body, ...args);
    };

    res.once('finish', finish);
    res.once('close', finish);
    return next();
  };
}

module.exports = createResponseCache;
