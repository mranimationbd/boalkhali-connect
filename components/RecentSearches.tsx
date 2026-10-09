'use client'; import {useEffect,useState} from 'react'; import Link from 'next/link';
// Recent searches (Wave 2): stored ONLY in this browser's localStorage — never sent to
// the server, never part of the search analytics (which log term+count+day, no identity).
// The current query is recorded on mount; the list can be wiped with one tap.
const KEY='bk_recent_searches';
export default function RecentSearches({currentQ=''}:{currentQ?:string}){ const [items,setItems]=useState<string[]>([]);
 useEffect(()=>{ try{ let list:string[]=[]; try{ const raw=JSON.parse(localStorage.getItem(KEY)||'[]'); if(Array.isArray(raw)) list=raw.map((x:any)=>String(x)).filter(Boolean); }catch{ list=[]; } const q=(currentQ||'').trim(); if(q){ list=[q,...list.filter(x=>x!==q)].slice(0,8); try{ localStorage.setItem(KEY,JSON.stringify(list)); }catch{} } setItems(list.filter(x=>x!==q)); }catch{} },[currentQ]);
 const clear=()=>{ try{ localStorage.removeItem(KEY); }catch{} setItems([]); };
 return <section data-recent-searches className="card mt-3"><div className="flex items-center justify-between gap-2"><b>🕘 সাম্প্রতিক খোঁজা</b>{items.length>0&&<button type="button" onClick={clear} className="text-xs font-bold text-red-600 press">✕ মুছে ফেলুন</button>}</div>{items.length===0?<p className="text-xs text-gray-400 mt-1">আপনার সাম্প্রতিক খোঁজাগুলো শুধু এই ব্রাউজারেই থাকে — সার্ভারে পাঠানো হয় না।</p>:<div className="flex flex-wrap gap-1.5 mt-2">{items.map(t=>(<Link key={t} href={'/search?q='+encodeURIComponent(t)} className="chip press bg-slate-100">{t}</Link>))}</div>}</section>; }
