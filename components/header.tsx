'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { services } from '@/lib/content';
const before=[['/','Home'],['/about','About Us']], after=[['/who-we-help','Who We Help'],['/our-approach','Our Approach'],['/careers','Careers'],['/events','Events']];
const Chevron=()=><svg className="chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>;
export function Header(){
 const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false); const path=usePathname(); const ref=useRef<HTMLElement>(null); const button=useRef<HTMLButtonElement>(null); const details=useRef<HTMLDetailsElement>(null);
 const closeAll=()=>{setOpen(false);if(details.current)details.current.open=false;};
 useEffect(()=>{closeAll();},[path]);
 useEffect(()=>{function key(e:KeyboardEvent){if(e.key==='Escape'){const wasOpen=details.current?.open;if(!wasOpen&&button.current?.getAttribute('aria-expanded')!=='true')return;closeAll();(wasOpen?details.current?.querySelector('summary'):button.current)?.focus();}}
  function outside(e:PointerEvent){if(details.current?.open&&!details.current.contains(e.target as Node)&&!button.current?.contains(e.target as Node)&&window.matchMedia('(min-width:981px)').matches)details.current.open=false;}
  function scroll(){setScrolled(window.scrollY>8);}
  const mq=window.matchMedia('(min-width:981px)'); function resize(){if(mq.matches)setOpen(false);}
  scroll(); document.addEventListener('keydown',key); document.addEventListener('pointerdown',outside); window.addEventListener('scroll',scroll,{passive:true}); mq.addEventListener('change',resize);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);window.removeEventListener('scroll',scroll);mq.removeEventListener('change',resize);};},[]);
 useEffect(()=>{document.body.classList.toggle('menu-open',open);return()=>document.body.classList.remove('menu-open');},[open]);
 const navClick=(e:React.MouseEvent)=>{if((e.target as HTMLElement).closest('a'))closeAll();};
 const homeClick=(e:React.MouseEvent)=>{closeAll();if(path!=='/'||e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0)return;e.preventDefault();window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 const inServices=path.startsWith('/services');
 return <header className={'header'+(scrolled?' is-scrolled':'')+(open?' is-open':'')} ref={ref}><div className="container header-inner">
  <Link href="/" className="wordmark" aria-label="Veda Group home" onClick={homeClick}>VEDA<span>GROUP</span><small>INTERNATIONAL BUSINESS DEVELOPMENT</small></Link>
  <button ref={button} className="menu-button" aria-expanded={open} aria-controls="main-nav" onClick={()=>setOpen(!open)}><span className="menu-label">{open?'Close':'Menu'}</span><span className="burger" aria-hidden="true"><i/><i/><i/></span></button>
  <nav id="main-nav" className={open?'navigation is-open':'navigation'} aria-label="Main navigation" onClick={navClick}>
   <div className="nav-links">
    {before.map(([href,label])=><Link key={href} href={href} className="nav-link" aria-current={path===href?'page':undefined}>{label}<span className="nav-arrow" aria-hidden="true">↗</span></Link>)}
    <details className="dropdown" ref={details}><summary className={'nav-link'+(inServices?' is-current':'')}>Services <Chevron/></summary>
     <div className="dropdown-panel">
      <div className="mega-intro"><p className="eyebrow">OUR SERVICES</p><p className="mega-title">Practical support for growth across borders.</p><p className="mega-copy">Focused services to help you explore markets, build relationships and progress opportunities.</p><Link href="/services" className="mega-all">View all services <span aria-hidden="true">→</span></Link></div>
      <ul className="mega-grid">{services.map((s,i)=><li key={s.slug}><Link href={'/services/'+s.slug} className="mega-item" aria-current={path==='/services/'+s.slug?'page':undefined}><span className="mega-index">{String(i+1).padStart(2,'0')}</span><span className="mega-text"><strong>{s.title}</strong><span>{s.summary}</span></span><span className="mega-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>
     </div>
    </details>
    {after.map(([href,label])=><Link key={href} href={href} className="nav-link" aria-current={path===href?'page':undefined}>{label}<span className="nav-arrow" aria-hidden="true">↗</span></Link>)}
   </div>
   <div className="nav-cta"><p className="nav-cta-note">Connecting ambition with opportunity.</p><Link href="/contact" className="button small">Contact Us <span>↗</span></Link></div>
  </nav>
 </div></header>
}
