import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/enquiry/route';
import { getEnquiryMode } from '../lib/enquiry-config';

const payload={name:'Sample Person',email:'sample@example.com',organisation:'Sample Organisation',market:'India',service:'international-market-entry',message:'A sample enquiry for delivery validation only.',privacy:true,website:''};
const configured={RESEND_API_KEY:'test-key',ENQUIRY_FROM:'Veda <sender@example.com>',ENQUIRY_TO:'admin@example.com'};
test('email mode is inferred from complete credentials, with no production dry-run success',()=>{
 assert.equal(getEnquiryMode({...configured,NODE_ENV:'development'}),'email');
 assert.equal(getEnquiryMode({...configured,NODE_ENV:'production'}),'email');
 assert.equal(getEnquiryMode({...configured,ENQUIRY_MODE:'local',NODE_ENV:'production'}),'unavailable');
 assert.equal(getEnquiryMode({NODE_ENV:'production'}),'unavailable');
 assert.equal(getEnquiryMode({NODE_ENV:'development'}),'local');
 assert.equal(getEnquiryMode({...configured,ENQUIRY_MODE:'local',NODE_ENV:'development'}),'local');
 assert.equal(getEnquiryMode({ENQUIRY_MODE:'email',NODE_ENV:'development'}),'unavailable');
});

test('submission handles delivery outcomes without claiming a failed email was sent',async(t)=>{
 const keys=['NODE_ENV','ENQUIRY_MODE','RESEND_API_KEY','ENQUIRY_FROM','ENQUIRY_TO','SITE_ORIGIN','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN'];
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 const originalFetch=globalThis.fetch,originalError=console.error;
 const logs:unknown[][]=[];console.error=(...args)=>{logs.push(args)};
 function env(extra:Record<string,string>={}){for(const key of keys)delete process.env[key];Object.assign(process.env,configured,{NODE_ENV:'development'},extra);}
 function request(origin='http://localhost:3847',data=payload){return new NextRequest('http://localhost:3847/api/enquiry',{method:'POST',headers:{origin,host:'localhost:3847','content-type':'application/json'},body:JSON.stringify(data)});}
 try{
  await t.test('local email sends both templates and returns the requested success message',async()=>{
   env({SITE_ORIGIN:'https://vedagroup.uk'});const sent:Record<string,unknown>[]=[];
   globalThis.fetch=async(_,init)=>{sent.push(JSON.parse(init!.body as string));return Response.json({id:'test-id'});};
   const result=await POST(request());const body=await result.json();assert.equal(result.status,200);assert.equal(body.confirmationSent,true);assert.match(body.message,/Your form has been submitted successfully/);assert.match(body.message,/within 24 hours/);assert.equal(sent.length,2);assert.deepEqual(sent[0].to,['admin@example.com']);assert.deepEqual(sent[1].to,['sample@example.com']);assert.equal(sent[0].reply_to,'sample@example.com');
  });
  await t.test('admin rejection is a failure and does not send confirmation',async()=>{
   env();let count=0;globalThis.fetch=async()=>{count++;return Response.json({name:'validation_error'},{status:403});};
   assert.equal((await POST(request())).status,502);assert.equal(count,1);
  });
  await t.test('failed confirmation preserves accepted enquiry without false confirmation copy',async()=>{
   env();let count=0;globalThis.fetch=async()=>++count===1?Response.json({id:'test-id'}):Response.json({name:'validation_error'},{status:422});
   const result=await POST(request());const body=await result.json();assert.equal(result.status,200);assert.equal(body.confirmationSent,false);assert.doesNotMatch(body.message,/confirmation/i);assert.equal(count,2);
  });
  await t.test('untrusted origins and invalid enquiries send no emails',async()=>{
   env();globalThis.fetch=async()=>{throw new Error('Unexpected provider call')};assert.equal((await POST(request('https://untrusted.example'))).status,403);assert.equal((await POST(request(undefined,{...payload,message:'short'}))).status,422);
  });
  await t.test('production local mode cannot discard a real enquiry with a success response',async()=>{
   env({NODE_ENV:'production',ENQUIRY_MODE:'local',SITE_ORIGIN:'http://localhost:3847'});assert.equal((await POST(request())).status,503);
  });
  await t.test('production still requires a shared limiter',async()=>{
   env({NODE_ENV:'production',SITE_ORIGIN:'http://localhost:3847'});assert.equal((await POST(request())).status,503);
  });
  await t.test('production requires its public origin before sending email',async()=>{
   env({NODE_ENV:'production'});assert.equal((await POST(request())).status,503);
  });
  assert.ok(!JSON.stringify(logs).includes(configured.RESEND_API_KEY));assert.ok(!JSON.stringify(logs).includes(payload.email));
 }finally{globalThis.fetch=originalFetch;console.error=originalError;for(const key of keys){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}}
});
