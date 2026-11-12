// NSE stock-option eligibility derives from the exchange's daily F&O
// instrument master. It does NOT imply that every cash-market ticker has options.
function collectFnoSymbols(rows,bySymbol) {
 const eligible=new Set();
 if(!Array.isArray(rows)||!(bySymbol instanceof Map))return [];
 for(const item of rows){
  if(item?.segment!=='NSE_FO'||!['CE','PE'].includes(item.instrument_type)||
    !(item.underlying_type==='EQUITY'||String(item.underlying_key||'').startsWith('NSE_EQ|')))continue;
  const ticker=String(item.underlying_symbol||'').trim().toUpperCase();
  if(/^[A-Z0-9&_.-]{1,40}$/.test(ticker)&&bySymbol.has(ticker))eligible.add(ticker);
 }
 return [...eligible].sort();
}
module.exports={collectFnoSymbols};
