// Sends sample admin + confirmation emails through Resend using .env.local/.env settings.
// Usage: npx tsx scripts/send-test-email.ts [confirmation-recipient@example.com]
import { existsSync } from 'node:fs';
import { adminEnquiryEmail, confirmationEmail } from '../lib/email-templates';
for(const file of ['.env.local','.env'])if(existsSync(file))process.loadEnvFile(file);
const apiKey=process.env.RESEND_API_KEY,from=process.env.ENQUIRY_FROM,to=process.env.ENQUIRY_TO;
if(!apiKey||!from||!to){console.error('Set RESEND_API_KEY, ENQUIRY_FROM and ENQUIRY_TO in .env.local first.');process.exit(1);}
const recipients=to.split(',').map(a=>a.trim()).filter(Boolean),visitor=process.argv[2]||recipients[0];
const sample={name:'Sample Person',email:visitor,organisation:'Sample Organisation Ltd',market:'India',service:'international-market-entry',message:'This is a test enquiry sent from the Veda Group website setup.\n\nWe are exploring entry into the Indian market and would welcome an initial conversation.',privacy:true,website:''};
async function send(label:string,email:object){const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(email)});console.log(`${label}: ${response.status} ${await response.text()}`);return response.ok;}
(async()=>{const ok=await send('Admin email → '+recipients.join(', '),{from,to:recipients,reply_to:sample.email,...adminEnquiryEmail(sample)})&&await send('Confirmation email → '+visitor,{from,to:[visitor],...confirmationEmail(sample)});
process.exit(ok?0:1);})();
