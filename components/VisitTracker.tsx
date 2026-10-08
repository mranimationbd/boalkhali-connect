'use client'; import {usePathname} from 'next/navigation'; import {useEffect} from 'react';
// Site-wide visit beacon (citizen Shell only — admin pages never mount Shell and are skipped here too).
// One POST per path per browser session; failures are silent by design (analytics must never break the page).
export function VisitTracker(){ const path=usePathname(); useEffect(()=>{ if(!path||path.startsWith('/admin')||path.startsWith('/api')) return; const k='vt:'+path; try{ if(sessionStorage.getItem(k)) return; sessionStorage.setItem(k,'1'); }catch{ /* storage unavailable — still track once */ } fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({path}),keepalive:true}).catch(()=>{}); },[path]); return null }
