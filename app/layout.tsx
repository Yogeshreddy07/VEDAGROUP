import type { Metadata } from 'next';
import { pageMetadata, siteUrl, websiteSchema } from '@/lib/seo';
import { StructuredData } from '@/components/structured-data';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/shared';
import { Motion } from '@/components/motion';
import { motionScript } from '@/lib/motion-script';
export const metadata: Metadata = {...pageMetadata('/', 'Veda Group', 'Veda Group helps businesses and institutions explore international markets, develop commercial relationships and pursue cross-border opportunities.'), alternates:undefined, metadataBase:new URL(siteUrl), verification:process.env.GOOGLE_SITE_VERIFICATION ? {google:process.env.GOOGLE_SITE_VERIFICATION} : undefined};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{__html:motionScript}}/><Motion/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Veda Group',url:'https://vedagroup.uk',description:'International business development'})}}/><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>}
