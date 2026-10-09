'use client'; import {useEffect,useState} from 'react';
// Public visitor counter (§34/§61): aggregate numbers ONLY from /api/stats — no IPs or identities
// ever reach this component. Any failure (offline, stats down) renders nothing so the footer and
// the page are never affected. This file must stay client-bundle-safe (Shell imports it), so it
// talks to the API instead of importing server-only analytics code.
const bnN=(n:any)=>String(n??'').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[+d]);
export function VisitorCounter(){ const [s,setS]=useState<any>(null); useEffect(()=>{ let on=true; fetch('/api/stats').then(r=>r.ok?r.json():null).then(j=>{ if(on&&j&&typeof j.today==='number'&&typeof j.total==='number') setS(j); }).catch(()=>{}); return ()=>{ on=false; }; },[]); if(!s) return null; const cell=(v:any,l:string)=>(<div className="text-center"><p className="num text-xl font-black text-brand-700">{bnN(v)}</p><p className="text-[11px] text-gray-500">{l}</p></div>);
 return <div className="card mt-5 !py-4" aria-label="ভিজিটর পরিসংখ্যান"><p className="text-center text-xs font-black tracking-widest text-gray-500">BOALKHALI CONNECT</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{cell(s.today,'আজ')}{cell(s.month,'এই মাস')}{cell(s.year,'এই বছর')}{cell(s.total,'সর্বমোট ভিজিটর')}</div><p className="mt-2 text-center text-[10px] text-gray-400">পরিসংখ্যান নতুন ভিজিটর-গণনা পদ্ধতিতে সংগৃহীত — প্রতিদিনে অনন্য ভিজিটর হিসাব হয়</p></div> }
