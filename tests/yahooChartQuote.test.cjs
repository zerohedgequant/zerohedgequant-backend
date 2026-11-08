const test=require("node:test");
const assert=require("node:assert/strict");
const {fromYahooChart}=require("../lib/yahooChartQuote");
const now=Date.parse("2026-11-09T00:00:00.000Z");
const base={chart:{result:[{meta:{regularMarketPrice:205,previousClose:200,regularMarketTime:Math.floor((now-3_600_000)/1000),longName:"Example, Inc.",regularMarketVolume:1000},indicators:{quote:[{open:[201],high:[207],low:[198],volume:[1000]}]}}],error:null}};
test("maps real timestamped chart quotes and computes percent from prior close",()=>{
 const q=fromYahooChart(base,"EX",now);
 assert.equal(q.price,205);assert.equal(q.change,5);assert.equal(q.changePct,2.5);
 assert.equal(q.priceSource,"Yahoo Finance chart (delayed, not a live exchange feed)");
 assert.equal(q.stale,false);assert.equal(q.marketCap,null);assert.match(q.priceAsOf,/Z$/);
});
test("does not present stale, missing, or invalid upstream numbers as real quotes",()=>{
 const b=JSON.parse(JSON.stringify(base));
 const variants=[
  null,{}, {chart:{error:{code:"unauthorized"},result:[]}},
  {...b,chart:{...b.chart,result:[{...b.chart.result[0],meta:{...b.chart.result[0].meta,regularMarketPrice:0}}]}},
  {...b,chart:{...b.chart,result:[{...b.chart.result[0],meta:{...b.chart.result[0].meta,regularMarketTime:Math.floor((now-9*86400000)/1000)}}]}},
 ];
 for(const v of variants)assert.equal(fromYahooChart(v,"EX",now),null);
});
test("never fabricate daily change when prior close is absent",()=>{
 const v=JSON.parse(JSON.stringify(base));delete v.chart.result[0].meta.previousClose;
 const q=fromYahooChart(v,"EX",now);
 assert.equal(q.change,null);assert.equal(q.changePct,null);
});
