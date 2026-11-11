const test=require('node:test');const assert=require('node:assert/strict');const {parseBatchQuotes,timestampOf}=require('../lib/upstoxBatchQuotes');
const STOCKS={RELIANCE:{isin:'INE002A01018'},TCS:{isin:'INE467B01029'}};
test('v2 Upstox batch NSE_EQ:symbol keys map to requested ISIN universe and carry verified price fields',()=>{
 const result=parseBatchQuotes({
  'NSE_EQ:RELIANCE':{instrument_token:'NSE_EQ|INE002A01018',last_price:100,net_change:2,volume:12000,ohlc:{close:98,open:99,high:102,low:97},timestamp:'2026-11-11T12:00:00+05:30'},
  'NSE_EQ:TCS':{instrument_token:'NSE_EQ|INE467B01029',last_price:300,ohlc:{close:310}}
 },['RELIANCE','TCS'],STOCKS);
 assert.equal(result.RELIANCE.price,100);assert.equal(result.RELIANCE.changePct,2.04);
 assert.equal(result.RELIANCE.volume,12000);assert.ok(result.RELIANCE.priceAsOf?.startsWith('2026-11-11T06:30:00'));
 assert.equal(result.TCS.changePct,-3.23);
});
test('missing and zero quotes are never presented as live prices',()=>{
 const r=parseBatchQuotes({'NSE_EQ:RELIANCE':{last_price:0},'NSE_EQ:TCS':{last_price:null}},['RELIANCE','TCS'],STOCKS);
 assert.deepEqual(r,{});
});
test('unrelated or malformed provider symbols are ignored',()=>{
 const r=parseBatchQuotes({'NSE_EQ:EVIL':{last_price:120},'NSE_EQ:RELIANCE':{instrument_token:'NSE_EQ|INE002A01018',last_price:100}},['RELIANCE'],STOCKS);
 assert.deepEqual(Object.keys(r),['RELIANCE']);
});
test('no made-up event time or zero timestamp',()=>{
 assert.equal(timestampOf(null),null);assert.equal(timestampOf(0),null);
});
