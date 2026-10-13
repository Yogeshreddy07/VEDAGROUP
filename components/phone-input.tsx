'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { phoneCountries } from '@/lib/phone-countries';

const DEFAULT_COUNTRY = 'IN';
// Shared calling codes: list the main country first when searching by code.
const PRIMARY: Record<string, string> = { '1': 'US', '7': 'RU', '44': 'GB', '47': 'NO', '61': 'AU', '39': 'IT', '358': 'FI', '212': 'MA', '262': 'RE', '590': 'GP', '599': 'CW' };
const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Searchable country / calling-code picker. Submits the ISO country through a hidden input.
function CountryPicker({ invalid, describedBy }: { invalid: boolean, describedBy?: string }) {
 const [value,setValue]=useState(DEFAULT_COUNTRY); const [open,setOpen]=useState(false); const [query,setQuery]=useState(''); const [active,setActive]=useState(0); const [up,setUp]=useState(false);
 const root=useRef<HTMLDivElement>(null); const trigger=useRef<HTMLButtonElement>(null); const search=useRef<HTMLInputElement>(null); const list=useRef<HTMLUListElement>(null); const uid=useId();
 const current=phoneCountries.find(c=>c.country===value)??phoneCountries[0];
 const results=useMemo(()=>{const q=normalize(query.trim()).replace(/^\+/,''); if(!q)return phoneCountries;
  // Rank: ISO match, main country for an exact calling code, name prefix, then any other match.
  const rank=(c:typeof phoneCountries[number])=>c.country.toLowerCase()===q?0:c.code===q?(PRIMARY[q]===c.country?1:2):normalize(c.name).startsWith(q)?1:normalize(c.name).includes(q)?3:c.code.startsWith(q)?4:-1;
  return phoneCountries.map(c=>({c,r:rank(c)})).filter(x=>x.r>=0).sort((a,b)=>a.r-b.r).map(x=>x.c);},[query]);
 useEffect(()=>{const form=root.current?.closest('form'); const reset=()=>setValue(DEFAULT_COUNTRY); form?.addEventListener('reset',reset); return()=>form?.removeEventListener('reset',reset);},[]);
 useEffect(()=>{if(!open)return; function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);} document.addEventListener('pointerdown',outside); return()=>document.removeEventListener('pointerdown',outside);},[open]);
 useEffect(()=>{if(open)list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({block:'nearest'});},[open,active]);
 function show(){const r=trigger.current!.getBoundingClientRect(); setUp(window.innerHeight-r.bottom<380&&r.top>window.innerHeight-r.bottom); setQuery(''); setActive(Math.max(0,phoneCountries.findIndex(c=>c.country===value))); setOpen(true); requestAnimationFrame(()=>search.current?.focus());}
 function close(){setOpen(false); trigger.current?.focus();}
 function choose(index:number){const c=results[index]; if(!c)return; setValue(c.country); close(); document.getElementById('phone')?.focus();}
 function key(e:React.KeyboardEvent){
  const last=results.length-1;
  if(e.key==='Escape'){e.preventDefault(); e.stopPropagation(); close();}
  else if(e.key==='ArrowDown'){e.preventDefault(); setActive(Math.min(last,active+1));}
  else if(e.key==='ArrowUp'){e.preventDefault(); setActive(Math.max(0,active-1));}
  else if(e.key==='PageDown'){e.preventDefault(); setActive(Math.min(last,active+8));}
  else if(e.key==='PageUp'){e.preventDefault(); setActive(Math.max(0,active-8));}
  else if(e.key==='Enter'){e.preventDefault(); choose(active);}
  else if(e.key==='Tab'){setOpen(false);}
 }
 return <div className={'country-picker'+(open?' is-open':'')+(up?' is-up':'')} ref={root}>
  <input type="hidden" id="phoneCountry" name="phoneCountry" value={value}/>
  <button ref={trigger} type="button" className="country-trigger" aria-haspopup="dialog" aria-expanded={open} aria-label={`Phone country: ${current.name} (+${current.code}). Change country`} aria-invalid={invalid||undefined} aria-describedby={describedBy} onClick={()=>open?setOpen(false):show()} onKeyDown={e=>{if(!open&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault(); show();}}}>
   <span className="country-iso">{current.country}</span><span className="country-code">+{current.code}</span>
   <svg className="select-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
  </button>
  {open&&<div className="country-panel" role="dialog" aria-label="Choose phone country">
   <input ref={search} type="text" className="country-search" placeholder="Search country or code" autoComplete="off" spellCheck={false} role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls={uid+'-list'} aria-activedescendant={results.length?uid+'-'+active:undefined} aria-label="Search country or calling code" value={query} onChange={e=>{setQuery(e.target.value); setActive(0);}} onKeyDown={key}/>
   <ul ref={list} id={uid+'-list'} role="listbox" aria-label="Countries" className="country-list">
    {results.map((c,i)=><li key={c.country} id={uid+'-'+i} data-index={i} role="option" aria-selected={c.country===value} className={'country-option'+(i===active?' is-active':'')} onPointerMove={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(i)}>
     <span className="country-iso">{c.country}</span><span className="country-name">{c.name}</span><span className="country-code">+{c.code}</span>
    </li>)}
    {!results.length&&<li className="country-empty" role="presentation">No matching country</li>}
   </ul>
  </div>}
 </div>;
}

export function PhoneInput({ errors }: { errors: Record<string, string> }) {
  return <div className="field">
    <label htmlFor="phone">Phone number *</label>
    <div className="phone-input-row">
      <CountryPicker invalid={!!errors.phoneCountry} describedBy={errors.phoneCountry ? 'phoneCountry-error' : undefined}/>
      <input id="phone" name="phone" type="tel" autoComplete="tel-national" required maxLength={40} placeholder="Phone number" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-hint phone-error' : 'phone-hint'} />
    </div>
    <span id="phone-hint" className="phone-hint">Choose your country and enter your phone number.</span>
    {errors.phoneCountry && <span className="field-error" id="phoneCountry-error">{errors.phoneCountry}</span>}
    {errors.phone && <span className="field-error" id="phone-error">{errors.phone}</span>}
  </div>;
}
