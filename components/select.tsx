'use client';
import { useEffect, useId, useRef, useState } from 'react';
type Option={value:string,label:string,hint?:string};
// Accessible "select-only combobox" (WAI-ARIA APG) that submits through a hidden input.
export function Select({id,name,labelId,options,defaultValue='',describedBy,invalid}:{id:string,name:string,labelId:string,options:Option[],defaultValue?:string,describedBy?:string,invalid?:boolean}){
 const [value,setValue]=useState(defaultValue); const [open,setOpen]=useState(false); const [active,setActive]=useState(0); const [up,setUp]=useState(false);
 const root=useRef<HTMLDivElement>(null); const trigger=useRef<HTMLButtonElement>(null); const list=useRef<HTMLUListElement>(null); const typed=useRef({text:'',time:0}); const uid=useId();
 const selectedIndex=Math.max(0,options.findIndex(o=>o.value===value)); const current=options[selectedIndex];
 useEffect(()=>{const form=root.current?.closest('form'); const reset=()=>setValue(defaultValue); form?.addEventListener('reset',reset); return()=>form?.removeEventListener('reset',reset);},[defaultValue]);
 useEffect(()=>{if(!open)return; function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);} document.addEventListener('pointerdown',outside); return()=>document.removeEventListener('pointerdown',outside);},[open]);
 useEffect(()=>{if(open)list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({block:'nearest'});},[open,active]);
 function show(index=selectedIndex){const r=trigger.current!.getBoundingClientRect(); setUp(window.innerHeight-r.bottom<360&&r.top>window.innerHeight-r.bottom); setActive(index); setOpen(true);}
 function choose(index:number){setValue(options[index].value); setOpen(false); trigger.current?.focus();}
 function key(e:React.KeyboardEvent){
  const last=options.length-1;
  if(!open){if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault(); show(e.key==='ArrowUp'?Math.max(0,selectedIndex-1):selectedIndex);} else if(e.key.length===1)search(e.key,false); return;}
  if(e.key==='Escape'){e.preventDefault(); e.stopPropagation(); setOpen(false);}
  else if(e.key==='ArrowDown'){e.preventDefault(); setActive(Math.min(last,active+1));}
  else if(e.key==='ArrowUp'){e.preventDefault(); setActive(Math.max(0,active-1));}
  else if(e.key==='Home'||e.key==='PageUp'){e.preventDefault(); setActive(0);}
  else if(e.key==='End'||e.key==='PageDown'){e.preventDefault(); setActive(last);}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault(); choose(active);}
  else if(e.key==='Tab'){setValue(options[active].value); setOpen(false);}
  else if(e.key.length===1)search(e.key,true);
 }
 function search(char:string,isOpen:boolean){const now=Date.now(); typed.current={text:(now-typed.current.time>600?'':typed.current.text)+char.toLowerCase(),time:now}; const from=isOpen?active:selectedIndex; const order=[...options.keys()].map(i=>(i+from+(typed.current.text.length===1?1:0))%options.length); const match=order.find(i=>options[i].label.toLowerCase().startsWith(typed.current.text)); if(match===undefined)return; isOpen?setActive(match):setValue(options[match].value);}
 return <div className={'select'+(open?' is-open':'')+(up?' is-up':'')} ref={root}>
  <input type="hidden" id={id} name={name} value={value}/>
  <button ref={trigger} type="button" role="combobox" className={'select-trigger'+(value?'':' is-placeholder')} aria-haspopup="listbox" aria-expanded={open} aria-controls={uid+'-list'} aria-labelledby={labelId} aria-activedescendant={open?uid+'-'+active:undefined} aria-describedby={describedBy} aria-invalid={invalid||undefined} onClick={()=>open?setOpen(false):show()} onKeyDown={key}>
   <span className="select-value">{current.label}</span>
   <svg className="select-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
  </button>
  <ul ref={list} id={uid+'-list'} role="listbox" aria-labelledby={labelId} tabIndex={-1} className="select-list" hidden={!open}>
   {options.map((o,i)=><li key={o.value} id={uid+'-'+i} data-index={i} role="option" aria-selected={o.value===value} className={'select-option'+(i===active?' is-active':'')} onPointerMove={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(i)}>
    <span className="select-option-text"><span>{o.label}</span>{o.hint&&<small>{o.hint}</small>}</span>
    <svg className="select-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
   </li>)}
  </ul>
 </div>
}
