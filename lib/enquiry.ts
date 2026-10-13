import { services } from './content';
import { parsePhoneNumberFromString, isSupportedCountry, type CountryCode } from 'libphonenumber-js/max';
import isEmail from 'validator/lib/isEmail';
export type Enquiry = {name:string,email:string,phone:string,organisation:string,market:string,service:string,message:string,privacy:boolean,website:string};
export function validateEnquiry(value:unknown):{data?:Enquiry,errors:Record<string,string>}{
 const errors:Record<string,string>={};
 if(!value||typeof value!=='object'||Array.isArray(value))return {errors:{form:'Please provide a valid enquiry.'}};
 const v=value as Record<string,unknown>; const data={} as Enquiry;
 for(const [key,max] of [['name',100],['email',254],['phone',40],['organisation',160],['market',120],['service',80],['message',3000],['website',200]] as const){if(v[key]!==undefined&&typeof v[key]!=='string'){errors[key]='Please enter text.';data[key]='';}else{data[key]=(v[key] as string||'').trim();if(data[key].length>max)errors[key]=`Please use ${max} characters or fewer.`;}}
 if(data.name.length<2)errors.name='Please enter your full name.';
 if(!isEmail(data.email,{allow_display_name:false,allow_utf8_local_part:false,require_tld:true})||/[\r\n]/.test(data.email))errors.email='Please enter a valid email address.';
 const country = typeof v.phoneCountry === 'string' && isSupportedCountry(v.phoneCountry) ? v.phoneCountry as CountryCode : undefined;
 if(v.phoneCountry !== undefined && !country)errors.phoneCountry='Please choose a valid phone country.';
 if(!data.phone)errors.phone='Please enter your phone number.';
 else if(!errors.phone){
  const phone=/^\+?[0-9 ().-]+$/.test(data.phone) && (country || data.phone.startsWith('+')) ? parsePhoneNumberFromString(data.phone,{defaultCountry:country,extract:false}) : undefined;
  if(!phone?.isValid() || (country && phone.country !== country))errors.phone=country?'Please enter a valid phone number for the selected country.':'Please enter a valid phone number including its country code.';
  else data.phone=phone.number;
 }
 if(data.message.length<20)errors.message='Please describe the opportunity in at least 20 characters.';
 if(data.service&&!services.some(s=>s.slug===data.service))errors.service='Please choose a listed service.';
 data.privacy=v.privacy===true;if(!data.privacy)errors.privacy='Please acknowledge the privacy information.';
 return {data,errors};
}
