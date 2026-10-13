'use client';
import { useEffect } from 'react';
// Scroll-reveal, parallax and tap ripples. Pure progressive enhancement:
// the pre-paint script in layout.tsx adds `html.motion`; without it nothing is hidden.
// Keep REVEAL/IMAGE in sync with the `html.motion :is(...)` lists in globals.css.
const REVEAL=['.split>*','.section-heading>*','.service-grid>*','.process>li','.values>*','.audience-grid>*','.audience-list>a','.clean-list>li','.service-detail>div>:not(ul)','.engagement','.scope-note','.cta-inner>*','.relationship-copy>*','.clients-head>*','.client-marquee','.contact-aside>*','.contact-grid>form','.empty-state','.legal>*','.footer-grid>*','.footer-bottom'].join(',');
const IMAGE='.relationship-image,.about-strip-image,.intro-image';
const PARALLAX='.hero-visual,.relationship-image';
const RIPPLE='.button,.service-card,.audience-list a,.mega-item,.menu-button';
export function Motion(){
 useEffect(()=>{
  const root=document.documentElement; if(!root.classList.contains('motion'))return;
  (window as unknown as {__vgMotion:boolean}).__vgMotion=true;
  const timers=new Set<number>();
  const later=(fn:()=>void,ms:number)=>{const t=window.setTimeout(()=>{timers.delete(t);fn();},ms);timers.add(t);};
  const reveal=(el:HTMLElement,delay:number,instant=false)=>{
   el.style.setProperty('--rd',delay+'ms');
   if(instant){el.setAttribute('data-revealed','done');return;}
   el.setAttribute('data-revealed','in');
   // Hand transitions back to the element's own styles (hover etc.) once the reveal is over.
   later(()=>el.setAttribute('data-revealed','done'),delay+1500);
  };
  const io=new IntersectionObserver(entries=>{
   const vh=window.innerHeight; const batch:HTMLElement[]=[];
   for(const e of entries){const el=e.target as HTMLElement;
    if(e.isIntersecting){batch.push(el);io.unobserve(el);}
    else if(e.boundingClientRect.bottom<0){reveal(el,0,true);io.unobserve(el);} // already scrolled past (e.g. restored scroll)
    else if(e.boundingClientRect.top<vh&&e.boundingClientRect.bottom>0){batch.push(el);io.unobserve(el);}
   }
   batch.sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1).forEach((el,i)=>reveal(el,Math.min(i,6)*90));
  },{rootMargin:'0px 0px -8% 0px'});
  const seen=new WeakSet<Element>();
  const scan=()=>{document.querySelectorAll<HTMLElement>(`:is(${REVEAL},${IMAGE}):not([data-revealed=done])`).forEach(el=>{if(seen.has(el))return;seen.add(el);
   if(el.getAttribute('data-revealed')==='in')later(()=>el.setAttribute('data-revealed','done'),1500);else io.observe(el);});};
  let scanQueued=0; const mo=new MutationObserver(()=>{if(!scanQueued)scanQueued=requestAnimationFrame(()=>{scanQueued=0;scan();});});
  // Parallax, batched into one frame per scroll.
  let frame=0;
  const update=()=>{frame=0; const vh=window.innerHeight; const factor=window.innerWidth<800?.05:.08;
   document.querySelectorAll<HTMLElement>(PARALLAX).forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-50||r.top>vh+50)return;const max=r.height*.06;const py=Math.max(-max,Math.min(max,(r.top+r.height/2-vh/2)*-factor));el.style.setProperty('--py',py.toFixed(1)+'px');});
   const max=root.scrollHeight-vh;
   // Short items at the very end of the page can never cross the observer's bottom inset.
   if(window.scrollY>=max-2)document.querySelectorAll<HTMLElement>(`:is(${REVEAL},${IMAGE}):not([data-revealed])`).forEach((el,i)=>{if(seen.has(el)&&el.getBoundingClientRect().top<vh){io.unobserve(el);reveal(el,i*90);}});
  };
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};

  const onDown=(e:PointerEvent)=>{if(e.button!==0)return;const host=(e.target as Element).closest<HTMLElement>(RIPPLE);if(!host)return;const r=host.getBoundingClientRect();
   host.style.setProperty('--rx',e.clientX-r.left+'px');host.style.setProperty('--ry',e.clientY-r.top+'px');host.style.setProperty('--rs',Math.max(r.width,r.height)*2.2+'px');
   host.removeAttribute('data-ripple');void host.offsetWidth;host.setAttribute('data-ripple','');later(()=>host.removeAttribute('data-ripple'),700);};
  const onPrint=()=>document.querySelectorAll<HTMLElement>(`:is(${REVEAL},${IMAGE}):not([data-revealed])`).forEach(el=>reveal(el,0,true));
  // Touching server-rendered nodes before React hydrates them (the page sits in a Suspense
  // boundary that hydrates after this layout) causes attribute mismatches, so wait for it.
  const idle=(fn:()=>void)=>'requestIdleCallback' in window?requestIdleCallback(fn,{timeout:300}):later(fn,50);
  const hydrated=()=>{const el=document.getElementById('main')?.firstElementChild;return !el||Object.keys(el).some(k=>k.startsWith('__reactFiber'));};
  let started=false,cancelled=false; const t0=performance.now();
  const start=()=>{if(cancelled)return;if(!hydrated()&&performance.now()-t0<3000){idle(start);return;}started=true;
   scan(); mo.observe(document.body,{childList:true,subtree:true});
   update(); window.addEventListener('scroll',onScroll,{passive:true}); window.addEventListener('resize',onScroll);
   document.addEventListener('pointerdown',onDown,{passive:true}); window.addEventListener('beforeprint',onPrint);};
  idle(start);
  return()=>{cancelled=true;if(!started)return;io.disconnect();mo.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(scanQueued);timers.forEach(clearTimeout);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);document.removeEventListener('pointerdown',onDown);window.removeEventListener('beforeprint',onPrint);};
 },[]);
 return null;
}
