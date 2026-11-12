const test=require("node:test");
const assert=require("node:assert/strict");
const {collectFnoSymbols}=require("../lib/terminalFnoUniverse");
const cash=new Map([["RELIANCE",{}],["M&M",{}],["TCS",{}],["NIFTY",{}]]);
test("all eligible NSE stock option tickers come from active exchange instruments",()=>{
 const rows=[
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"EQUITY",underlying_symbol:"RELIANCE"},
  {segment:"NSE_FO",instrument_type:"PE",underlying_type:"EQUITY",underlying_symbol:"RELIANCE"},
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"EQUITY",underlying_symbol:"M&M"},
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"EQUITY",underlying_symbol:"TCS"},
  {segment:"NSE_FO",instrument_type:"FUT",underlying_type:"EQUITY",underlying_symbol:"NIFTY"},
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"INDEX",underlying_symbol:"NIFTY"},
  {segment:"NSE_EQ",instrument_type:"EQ",underlying_type:"EQUITY",underlying_symbol:"TCS"},
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"EQUITY",underlying_symbol:"DELISTED"}
 ];
 assert.deepEqual(collectFnoSymbols(rows,cash),["M&M","RELIANCE","TCS"]);
});
test("underlying_key can establish NSE_EQ underlying when type not present",()=>{
 const rows=[{segment:"NSE_FO",instrument_type:"PE",underlying_key:"NSE_EQ|INE002A01018",underlying_symbol:"RELIANCE"}];
 assert.deepEqual(collectFnoSymbols(rows,cash),["RELIANCE"]);
});
test("invalid symbols and missing instrument registry do not invent F&O names",()=>{
 const rows=[
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"EQUITY",underlying_symbol:"<script>"},
  {segment:"NSE_FO",instrument_type:"CE",underlying_type:"EQUITY",underlying_symbol:"UNKNOWN"}
 ];
 assert.deepEqual(collectFnoSymbols(rows,cash),[]);
 assert.deepEqual(collectFnoSymbols(null,cash),[]);
});
test("backend contract supports all NSE cash symbols but only eligible stock-option underlyings",()=>{
 const fs=require("node:fs"),server=fs.readFileSync(require("node:path").join(__dirname,"../server.js"),"utf8");
 assert.match(server,/loadTerminalUniverse/);
 assert.match(server,/api\/terminal\/instruments/);
 assert.match(server,/api\/terminal\/fno-universe/);
 assert.match(server,/collectFnoSymbols\(rows,bySymbol\)/);
 assert.match(server,/fnoSet\.has\(ul\)/);
 assert.match(server,/NOT_FNO_ELIGIBLE/);
 assert.match(server,/isUsableQuote\(raw\)/);
 assert.doesNotMatch(server,/if\(!raw\)return res\.status\(503\)/);
});
