import { services } from './content';
import type { Enquiry } from './enquiry';
// Table-based, inline-styled HTML for broad email-client support. All user input is escaped.
const navy='#10243a',teal='#226e71',ink='#172b3d',muted='#5a6773',pale='#f3f6f5',border='#dbe2e4';
const font="Manrope,'Helvetica Neue',Helvetica,Arial,sans-serif";
export const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const serviceTitle=(slug:string)=>services.find(s=>s.slug===slug)?.title||'';
const firstName=(name:string)=>name.split(/\s+/)[0]||name;
const fmtDate=(date:Date)=>new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/London'}).format(date)+' (UK)';
function layout({preheader,body,footer}:{preheader:string,body:string,footer:string}){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>Veda Group</title></head>
<body style="margin:0;padding:0;background:${pale};font-family:${font};color:${ink};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${pale}"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${border}">
<tr><td style="background:${navy};padding:34px 44px 30px">
<div style="font-family:${font};font-size:22px;font-weight:700;letter-spacing:.13em;color:#ffffff;line-height:1.2">VEDA<span style="font-weight:400;margin-left:6px">GROUP</span></div>
<div style="font-family:${font};font-size:8px;letter-spacing:.22em;color:#9fc3c4;margin-top:8px">INTERNATIONAL BUSINESS DEVELOPMENT</div>
</td></tr>
<tr><td style="height:3px;background:${teal};line-height:3px;font-size:0">&nbsp;</td></tr>
${body}
<tr><td style="padding:26px 44px 32px;border-top:1px solid ${border};font-family:${font};font-size:11px;line-height:1.7;color:${muted}">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}
const eyebrow=(text:string)=>`<div style="font-family:${font};font-size:10px;font-weight:700;letter-spacing:.18em;color:${teal};margin-bottom:16px">${text}</div>`;
const para=(html:string,extra='')=>`<p style="margin:0 0 16px;font-family:${font};font-size:15px;line-height:1.75;color:${muted};${extra}">${html}</p>`;
function row(label:string,value:string,href?:string){
 const shown=value?escapeHtml(value):`<span style="color:#9aa5ae">Not provided</span>`;
 const content=value&&href?`<a href="${escapeHtml(href)}" style="color:${teal};text-decoration:none">${shown}</a>`:shown;
 return `<tr><td style="padding:14px 0;border-bottom:1px solid ${border};width:38%;vertical-align:top;font-family:${font};font-size:10px;font-weight:700;letter-spacing:.14em;color:${muted};text-transform:uppercase">${label}</td><td style="padding:14px 0 14px 12px;border-bottom:1px solid ${border};vertical-align:top;font-family:${font};font-size:15px;font-weight:600;color:${ink}">${content}</td></tr>`;
}
const messageBlock=(message:string)=>`<div style="background:${pale};border-left:3px solid ${teal};padding:20px 22px;font-family:${font};font-size:14px;line-height:1.75;color:${ink};white-space:pre-wrap">${escapeHtml(message)}</div>`;

export function adminEnquiryEmail(data:Enquiry,received=new Date()){
 const service=serviceTitle(data.service);
 const subject=`New enquiry — ${data.name}${data.organisation?` · ${data.organisation}`:''}`;
 const body=`<tr><td style="padding:40px 44px 8px">
${eyebrow('NEW WEBSITE ENQUIRY')}
<h1 style="margin:0 0 10px;font-family:${font};font-size:28px;font-weight:500;line-height:1.2;letter-spacing:-.02em;color:${navy}">${escapeHtml(data.name)}</h1>
<div style="font-family:${font};font-size:14px;color:${muted}">${data.organisation?escapeHtml(data.organisation)+' &middot; ':''}Received ${escapeHtml(fmtDate(received))}</div>
</td></tr>
<tr><td style="padding:28px 44px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${border}">
${row('Full name',data.name)}${row('Business email',data.email,'mailto:'+data.email)}${row('Phone number',data.phone||'',data.phone?'tel:'+data.phone.replace(/[^+0-9]/g,''):undefined)}${row('Organisation',data.organisation)}${row('Market of interest',data.market)}${row('Service of interest',service)}
</table></td></tr>
<tr><td style="padding:28px 44px 8px">${eyebrow('THE OPPORTUNITY')}${messageBlock(data.message)}</td></tr>
<tr><td style="padding:28px 44px 40px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${navy}"><a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent('Re: Your enquiry to Veda Group')}" style="display:inline-block;padding:15px 26px;font-family:${font};font-size:12px;font-weight:700;letter-spacing:.06em;color:#ffffff;text-decoration:none">REPLY TO ${escapeHtml(firstName(data.name).toUpperCase())} &nbsp;&#8599;</a></td></tr></table>
<div style="margin-top:14px;font-family:${font};font-size:12px;color:${muted}">Replying to this email also goes directly to ${escapeHtml(data.email)}. Please respond within 24 hours.</div></td></tr>`;
 const html=layout({preheader:`${data.name}${data.organisation?` from ${data.organisation}`:''} has submitted an enquiry${service?` about ${service}`:''}.`,body,footer:'Submitted through the contact form on vedagroup.uk. The sender acknowledged the privacy information before submitting.'});
 const text=`New website enquiry\n\nFull name: ${data.name}\nBusiness email: ${data.email}\nPhone number: ${data.phone||'Not provided'}\nOrganisation: ${data.organisation||'Not provided'}\nMarket of interest: ${data.market||'Not provided'}\nService of interest: ${service||'Not provided'}\nReceived: ${fmtDate(received)}\n\nThe opportunity:\n${data.message}`;
 return {subject,html,text};
}

export function confirmationEmail(data:Enquiry){
 const service=serviceTitle(data.service),name=firstName(data.name);
 const subject='Thank you for contacting Veda Group';
 const steps=[['01','We review your enquiry','A member of our team reads every enquiry personally.'],['02','We get in touch within 24 hours','We will contact you at this email address to explore fit and next steps.'],['03','A conversation with purpose','Together we discuss your goals and how we may be able to help.']];
 const body=`<tr><td style="padding:44px 44px 8px">
${eyebrow('ENQUIRY RECEIVED')}
<h1 style="margin:0 0 22px;font-family:${font};font-size:30px;font-weight:500;line-height:1.2;letter-spacing:-.02em;color:${navy}">Thank you, ${escapeHtml(name)}.</h1>
${para(`We have received your enquiry${data.organisation?` on behalf of <strong style="color:${ink}">${escapeHtml(data.organisation)}</strong>`:''}${service?` regarding <strong style="color:${ink}">${escapeHtml(service)}</strong>`:''}. A member of our team will be in contact with you <strong style="color:${ink}">within 24 hours</strong>.`)}
</td></tr>
<tr><td style="padding:16px 44px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${steps.map(([n,title,copy])=>`<tr><td style="width:46px;padding:14px 0;vertical-align:top;font-family:${font};font-size:13px;font-weight:700;color:${teal}">${n}</td><td style="padding:14px 0;border-bottom:1px solid ${border};vertical-align:top"><div style="font-family:${font};font-size:15px;font-weight:600;color:${ink}">${title}</div><div style="margin-top:4px;font-family:${font};font-size:13px;line-height:1.6;color:${muted}">${copy}</div></td></tr>`).join('')}
</table></td></tr>
<tr><td style="padding:30px 44px 8px">${eyebrow('YOUR MESSAGE')}${messageBlock(data.message)}</td></tr>
<tr><td style="padding:30px 44px 42px">${para('Kind regards,',`margin:0;color:${ink}`)}<div style="font-family:${font};font-size:15px;font-weight:700;color:${navy};margin-top:4px">The Veda Group team</div></td></tr>`;
 const html=layout({preheader:'We have received your enquiry and will be in contact within 24 hours.',body,footer:'You are receiving this email because you submitted an enquiry on vedagroup.uk. This mailbox is not monitored, so please do not reply directly. If you did not make this enquiry, you can safely ignore this message.'});
 const text=`Thank you, ${name}.\n\nWe have received your enquiry${data.organisation?` on behalf of ${data.organisation}`:''}${service?` regarding ${service}`:''}. A member of our team will be in contact with you within 24 hours.\n\nYour message:\n${data.message}\n\nKind regards,\nThe Veda Group team\n\nThis mailbox is not monitored, so please do not reply directly.`;
 return {subject,html,text};
}
