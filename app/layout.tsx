import type { Metadata } from 'next';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/shared';
import { Motion } from '@/components/motion';
import { motionScript } from '@/lib/motion-script';
export const metadata: Metadata = {metadataBase:new URL('https://vedagroup.uk'),title:{default:'Veda Group | International Business Development',template:'%s | Veda Group'},description:'Explore new markets, develop commercial relationships and pursue cross-border opportunities with Veda Group.',openGraph:{type:'website',siteName:'Veda Group',locale:'en_GB',images:[{url:'/images/architecture.jpg',width:1800,height:1200,alt:'International commercial architecture'}]},robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{__html:motionScript}}/><Motion/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Veda Group',url:'https://vedagroup.uk',description:'International business development'})}}/><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>}
