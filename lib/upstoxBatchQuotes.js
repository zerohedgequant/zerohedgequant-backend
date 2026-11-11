// Pure Upstox v2 bulk-quote parser. No network calls, account data or secrets.
// The v2 market-quote API supports up to 500 instrument keys per request.
const asNumber = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const positive = v => (asNumber(v) !== null && v > 0 ? v : null);
function timestampOf(value) {
 if (value === undefined || value === null || value === '') return null;
 const n = typeof value === 'number' ? value : /^\d+$/.test(String(value)) ? Number(value) : NaN;
 const rawMs = Number.isFinite(n) ? (n < 1e11 ? n * 1000 : n) : Date.parse(value);
 return Number.isFinite(rawMs) && rawMs > Date.UTC(2020,0,1) && rawMs < Date.now()+3600000 ? new Date(rawMs).toISOString() : null;
}
function parseBatchQuotes(payload, symbols, stocks) {
 const out = {}, allowed = new Set(symbols);
 const isinToSym = new Map(symbols.filter(sym => stocks[sym]?.isin).map(sym => [stocks[sym].isin,sym]));
 for (const [key,val] of Object.entries(payload && typeof payload==='object' && !Array.isArray(payload) ? payload : {})) {
  if(!val||typeof val !== 'object')continue;
  const token=String(val.instrument_token||val.instrument_key||'');
  const tokenIsin=token.includes('|')?token.split('|').at(-1):null;
  const keySymbol=key.startsWith('NSE_EQ:')?key.slice('NSE_EQ:'.length):key.startsWith('NSE_EQ|')?key.slice('NSE_EQ|'.length):key;
  const sym=isinToSym.get(tokenIsin)||isinToSym.get(keySymbol)||(allowed.has(keySymbol)?keySymbol:null);
  if(!sym||!allowed.has(sym))continue;
  const price=positive(val.last_price);
  if(price===null)continue;
  const prevClose=positive(val.ohlc?.close);
  const change=asNumber(val.net_change)??(prevClose!==null?+(price-prevClose).toFixed(2):null);
  const pct=asNumber(val.percentage_change)??(prevClose!==null?+((price-prevClose)/prevClose*100).toFixed(2):null);
  out[sym]={
   price, change, changePct:pct, volume:asNumber(val.volume),
   open:positive(val.ohlc?.open),high:positive(val.ohlc?.high),low:positive(val.ohlc?.low),
   prevClose,priceSrc:'Upstox',priceAsOf:timestampOf(val.timestamp||val.last_trade_time)
  };
 }
 return out;
}
module.exports={parseBatchQuotes,timestampOf};
