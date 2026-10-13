import { NextRequest, NextResponse } from 'next/server';
import { validateEnquiry } from '@/lib/enquiry';
import { allowRequest } from '@/lib/rate-limit';
import { adminEnquiryEmail, confirmationEmail } from '@/lib/email-templates';
export const runtime='nodejs';
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const sendEmail=(apiKey:string,email:object)=>fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(10000),body:JSON.stringify(email)});
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 const expectedOrigin=process.env.SITE_ORIGIN || `${request.nextUrl.protocol}//${request.headers.get('host')}`;
 if(!origin||origin!==expectedOrigin)return reply({error:'This request could not be verified. Please use the website form.'},403);
 if(process.env.ENQUIRY_MODE==='email'&&!process.env.SITE_ORIGIN)return reply({error:'Enquiry delivery is not configured.'},503);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Unsupported request format.'},415);
 const length=Number(request.headers.get('content-length')||0);if(length>20000)return reply({error:'Your enquiry is too long.'},413);
 try{
  const ip=process.env.ENQUIRY_MODE==='email'?request.headers.get('x-real-ip')||'unknown':'local';
  if(!await allowRequest(ip))return reply({error:'Too many attempts. Please try again in 10 minutes.'},429);
  // Stream with a byte limit rather than buffering an unbounded body.
  const reader=request.body?.getReader();if(!reader)return reply({error:'Please provide an enquiry.'},400);
  let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>20000){await reader.cancel();return reply({error:'Your enquiry is too long.'},413);}chunks.push(value);}
  let raw:unknown;try{raw=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reply({error:'Please provide a valid enquiry.'},400);}
  const {data,errors}=validateEnquiry(raw);if(Object.keys(errors).length||!data)return reply({errors},422);
  if(data.website)return reply({error:'This enquiry could not be verified.'},422);
  const mode=process.env.ENQUIRY_MODE||'local';
  if(mode==='local')return reply({mode:'local',message:'Local test completed successfully. No email was sent and your enquiry was not saved.'});
  if(mode!=='email')return reply({error:'Enquiry delivery is not configured.'},503);
  const apiKey=process.env.RESEND_API_KEY,from=process.env.ENQUIRY_FROM,to=process.env.ENQUIRY_TO;
  if(!apiKey||!from||!to)return reply({error:'Enquiry delivery is not configured. Please try again later.'},503);
  const admin=adminEnquiryEmail(data),confirmation=confirmationEmail(data);
  const response=await sendEmail(apiKey,{from,to:to.split(',').map(a=>a.trim()).filter(Boolean),reply_to:data.email,...admin});
  if(!response.ok)return reply({error:'We could not send your enquiry. Please try again later.'},502);
  // The enquiry is already delivered; a failed acknowledgement must not report failure to the visitor.
  await sendEmail(apiKey,{from,to:[data.email],...confirmation}).catch(()=>null);
  return reply({mode:'email',message:'Thank you for getting in touch. We will be in contact with you within 24 hours. A confirmation has been sent to your email.'});
 }catch{return reply({error:'The enquiry service is temporarily unavailable. Please try again later.'},503);}
}
