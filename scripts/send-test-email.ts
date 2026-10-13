// Sends sample admin + confirmation emails through Resend using .env.local/.env settings.
// Usage: npx tsx scripts/send-test-email.ts [confirmation-recipient@example.com]
import { loadEnvConfig } from '@next/env';
import { randomUUID } from 'node:crypto';
import { adminEnquiryEmail, confirmationEmail } from '../lib/email-templates';
loadEnvConfig(process.cwd(), true);
const apiKey=process.env.RESEND_API_KEY,from=process.env.ENQUIRY_FROM,to=process.env.ENQUIRY_TO;
if(!apiKey||!from||(!to&&!process.argv[2])){console.error('Save RESEND_API_KEY and ENQUIRY_FROM in .env or .env.local, and provide a test recipient.');process.exit(1);}
const recipients=(process.argv[2]||to!).split(',').map(a=>a.trim()).filter(Boolean),visitor=recipients[0];
const sample={name:'Sample Person',email:visitor,phone:'+442079460958',organisation:'Sample Organisation Ltd',market:'India',service:'international-market-entry',message:'This is a test enquiry sent from the Veda Group website setup.\n\nWe are exploring entry into the Indian market and would welcome an initial conversation.',privacy:true,website:''};
const runId=randomUUID();
async function send(label:string,email:object){const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`veda-test/${runId}/${label.startsWith('Admin')?'admin':'confirmation'}`},signal:AbortSignal.timeout(10000),body:JSON.stringify(email)});const result=await response.json();console.log(`${label}: ${response.status}`,response.ok?{id:result.id}:{code:result.name,message:result.message});return response.ok;}
(async()=>{const ok=await send('Admin email → '+recipients.join(', '),{from,to:recipients,reply_to:sample.email,...adminEnquiryEmail(sample)})&&await send('Confirmation email → '+visitor,{from,to:[visitor],...confirmationEmail(sample)});
process.exit(ok?0:1);})();
