import type { Metadata } from 'next';
import { pageMetadata, siteUrl, websiteSchema } from '@/lib/seo';
import { StructuredData } from '@/components/structured-data';
import localFont from 'next/font/local';
const manrope = localFont({
  src: [
    { path: '../node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../node_modules/@fontsource/manrope/files/manrope-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../node_modules/@fontsource/manrope/files/manrope-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-manrope', display: 'swap', adjustFontFallback: 'Arial',
});
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/shared';
import { Motion } from '@/components/motion';
import { motionScript } from '@/lib/motion-script';
export const metadata: Metadata = {...pageMetadata('/', 'Veda Group', 'Veda Group helps businesses and institutions explore international markets, develop commercial relationships and pursue cross-border opportunities.'), alternates:undefined, metadataBase:new URL(siteUrl), verification:process.env.GOOGLE_SITE_VERIFICATION ? {google:process.env.GOOGLE_SITE_VERIFICATION} : undefined};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning><body className={manrope.variable}><script dangerouslySetInnerHTML={{__html:motionScript}}/><Motion/><StructuredData data={websiteSchema()}/><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>}
