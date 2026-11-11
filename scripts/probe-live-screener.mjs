// Read-only external health audit. Never output tokens, quote payloads or IPs.
// Deliberately probes the same public API the AHQ market gateway relies on.
const base="https://zerohedgequant-backend.onrender.com";
const out=[];
async function probe(name,path,timeoutMs){
 const started=Date.now();
 try{
  const response=await fetch(base+path,{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(timeoutMs)});
  const text=await response.text();
  let data=null;try{data=JSON.parse(text)}catch{}
  const result={name,status:response.status,ms:Date.now()-started,
    success:data?.success===true??null,
    rows:Array.isArray(data?.data)?data.data.length:null,
    indexCount:data?.data&&!Array.isArray(data.data)&&typeof data.data==="object"?Object.keys(data.data).length:null,
    stale:data?.stale===true?true:data?.stale===false?false:null,
    tokenSet: name==="auth"?data?.tokenSet===true:null,
    tokenUpdatedAt:name==="auth"&&typeof data?.updatedAt==="string"?data.updatedAt:null,
    errorCode:!response.ok?String(data?.errorCode||"HTTP_ERROR").slice(0,45):null};
  out.push(result);console.log("AHQ_BACKEND_DIAGNOSTIC",JSON.stringify(result));
 }catch(err){const result={name,status:"connection_failure",ms:Date.now()-started,
   error:err.name==="TimeoutError"?"request timed out":err.name==="AbortError"?"aborted":"connection failure"};
   out.push(result);console.log("AHQ_BACKEND_DIAGNOSTIC",JSON.stringify(result));}
}
await probe("health","/healthz",55000);
await probe("auth","/auth/status",25000);
await probe("nse_screener","/api/screener",85000);
await probe("nse_indices","/api/indices",30000);
await probe("us_screener","/api/us-screener",55000);
await probe("us_indices","/api/us-indices",25000);
const failed=out.filter(x=>x.status!==200||x.name.includes("screener")&&(x.rows??0)===0||x.name.endsWith("indices")&&(x.indexCount??0)===0);
console.log("AHQ_BACKEND_SUMMARY",JSON.stringify({tested:out.length,failed:failed.map(x=>x.name),durationMs:out.reduce((n,x)=>n+x.ms,0)}));
if(failed.length)process.exitCode=1;
