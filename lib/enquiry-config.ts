type Environment = Record<string, string | undefined>;
export function getEnquiryMode(env: Environment = process.env): 'local' | 'email' | 'unavailable' {
 const requested = env.ENQUIRY_MODE?.trim();
 const configured = !!(env.RESEND_API_KEY?.trim() && env.ENQUIRY_FROM?.trim() && env.ENQUIRY_TO?.trim());
 if(requested === 'local') return env.NODE_ENV === 'production' ? 'unavailable' : 'local';
 if(requested && requested !== 'email') return 'unavailable';
 if(configured) return 'email';
 return requested === 'email' || env.NODE_ENV === 'production' ? 'unavailable' : 'local';
}
