import { services } from './content';
export type Enquiry = {name:string,email:string,organisation:string,market:string,service:string,message:string,privacy:boolean,website:string};
export function validateEnquiry(value:unknown):{data?:Enquiry,errors:Record<string,string>}{
 const errors:Record<string,string>={};
 if(!value||typeof value!=='object'||Array.isArray(value))return {errors:{form:'Please provide a valid enquiry.'}};
 const v=value as Record<string,unknown>; const data={} as Enquiry;
 for(const [key,max] of [['name',100],['email',254],['organisation',160],['market',120],['service',80],['message',3000],['website',200]] as const){if(v[key]!==undefined&&typeof v[key]!=='string'){errors[key]='Please enter text.';data[key]='';}else{data[key]=(v[key] as string||'').trim();if(data[key].length>max)errors[key]=`Please use ${max} characters or fewer.`;}}
 if(data.name.length<2)errors.name='Please enter your full name.';
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)||/[\r\n]/.test(data.email))errors.email='Please enter a valid email address.';
 if(data.message.length<20)errors.message='Please describe the opportunity in at least 20 characters.';
 if(data.service&&!services.some(s=>s.slug===data.service))errors.service='Please choose a listed service.';
 data.privacy=v.privacy===true;if(!data.privacy)errors.privacy='Please acknowledge the privacy information.';
 return {data,errors};
}
