import { createHash } from 'node:crypto';
const buckets=new Map<string,{count:number,until:number}>();
export async function allowRequest(identifier:string){
 const key='veda-enquiry:'+createHash('sha256').update(identifier).digest('hex');
 const url=process.env.UPSTASH_REDIS_REST_URL; const token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(url&&token){
  // Atomic increment + expiry in a shared store, safe across server instances.
  const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n";
  const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,'1',key]),signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('Rate limiter unavailable');const result=await response.json();if(typeof result.result!=='number')throw new Error('Rate limiter unavailable');return result.result<=5;
 }
 if(process.env.ENQUIRY_MODE==='email')throw new Error('Shared rate limiter required');
 const now=Date.now();for(const [k,b] of buckets)if(b.until<=now)buckets.delete(k);
 const bucket=buckets.get(key)||{count:0,until:now+600000};bucket.count++;buckets.set(key,bucket);return bucket.count<=5;
}
