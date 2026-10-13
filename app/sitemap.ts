import { pages } from '@/lib/content';
export default function sitemap(){return pages.map(path=>({url:'https://vedagroup.uk'+path,changeFrequency:'monthly' as const,priority:path==='/'?1:.7}))}
