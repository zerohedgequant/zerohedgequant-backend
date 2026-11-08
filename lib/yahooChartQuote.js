"use strict";

// Yahoo's quoteSummary endpoint currently returns 401 from the Render host.
// Its chart endpoint provides a timestamped, potentially delayed indicative
// quote. Never invent a price and never label this as streaming/live data.
function finite(value){
  if(value===null||value===undefined||value==="")return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
}
const positive=value=>{const n=finite(value);return n!==null&&n>0?n:null};
function lastPresent(values){
  if(!Array.isArray(values))return null;
  for(let i=values.length-1;i>=0;i--){const n=finite(values[i]);if(n!==null)return n;}
  return null;
}
function fromYahooChart(payload,symbol,nowMs=Date.now()){
  const result=payload?.chart?.result?.[0];
  const meta=result?.meta;
  if(!meta||result?.error)return null;
  const price=positive(meta.regularMarketPrice);
  const epoch=finite(meta.regularMarketTime);
  if(price===null||epoch===null||epoch<=0)return null;
  const asOfMs=epoch*1000;
  const ageMs=nowMs-asOfMs;
  // Don't display an inexplicably future-dated or multi-week-old quote.
  if(!Number.isFinite(ageMs)||ageMs< -15*60*1000||ageMs>7*86400000)return null;
  const quote=result?.indicators?.quote?.[0]||{};
  const prevClose=positive(meta.previousClose)??positive(meta.chartPreviousClose);
  const change=prevClose===null?null:Math.round((price-prevClose)*100)/100;
  const changePct=prevClose===null?null:Math.round(((price-prevClose)/prevClose)*10000)/100;
  return {
    name: typeof meta.longName==="string"?meta.longName:(meta.shortName||symbol),
    sector:null,industry:null,price,change,changePct,
    volume:finite(meta.regularMarketVolume)??lastPresent(quote.volume),
    open:positive(meta.regularMarketOpen)??lastPresent(quote.open),
    high:positive(meta.regularMarketDayHigh)??lastPresent(quote.high),
    low:positive(meta.regularMarketDayLow)??lastPresent(quote.low),
    prevClose,marketCap:null,
    pe:null,fwdPe:null,peg:null,ps:null,pb:null,evEbitda:null,eps:null,roe:null,roa:null,
    debtEquity:null,grossMargin:null,operatingMargin:null,netMargin:null,
    dividend:null,beta:null,sma50:null,sma200:null,high52w:null,low52w:null,
    targetPrice:null,revenueGrowth:null,earningsGrowth:null,
    priceAsOf:new Date(asOfMs).toISOString(),
    priceSource:"Yahoo Finance chart (delayed, not a live exchange feed)",
    stale:ageMs>36*60*60*1000
  };
}
module.exports={fromYahooChart};
