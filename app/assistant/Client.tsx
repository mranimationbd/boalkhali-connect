'use client'; import {useState} from 'react'; import Link from 'next/link';
// Assistant chat UI (Wave 3). Plain ask-and-answer over /api/assistant: the server
// answers ONLY from stored site records and links to them; an honest not-found
// state renders when the site has nothing on the topic. Nothing is generated.
const EXAMPLES=['বাসা ভাড়া পাওয়া যাবে?','রক্তদাতা দরকার','ডাক্তার কোথায় বসেন','দর্শনীয় স্থান','চাকরি আছে কি','জরুরি নম্বর লাগবে'];
type Turn={q:string,note:string,sections:any[]};
export function AssistantChat(){ const [q,setQ]=useState(''); const [busy,setBusy]=useState(false); const [err,setErr]=useState(''); const [turns,setTurns]=useState<Turn[]>([]);
 const ask=async(text:string)=>{ const query=text.trim(); if(!query||busy) return; setBusy(true); setErr(''); try{ const r=await fetch('/api/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:query})}); const j=await r.json().catch(()=>({})); if(r.status===429){ setErr(j.message||'অনেকগুলো প্রশ্ন হয়ে গেছে — একটু পরে আবার চেষ্টা করুন'); } else if(!r.ok){ setErr('উত্তর আনা যায়নি — আবার চেষ্টা করুন'); } else { setTurns(t=>[{q:query,note:j.note||'',sections:j.sections||[]},...t]); setQ(''); } }catch{ setErr('সংযোগে সমস্যা হয়েছে — আবার চেষ্টা করুন'); } setBusy(false); };
 return <div><form className="card flex gap-2" onSubmit={e=>{e.preventDefault(); ask(q);}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="যা জানতে চান লিখুন… যেমন: রক্তদাতা, ডাক্তার, বাসা" aria-label="সহায়িকাকে প্রশ্ন করুন" className="flex-1"/><button className="btn shrink-0" disabled={busy}>{busy?'খুঁজছি…':'জিজ্ঞেস করুন'}</button></form>
 <div className="mt-2 flex flex-wrap gap-1.5">{EXAMPLES.map(x=>(<button key={x} type="button" onClick={()=>ask(x)} className="chip press bg-brand-50 text-brand-700">{x}</button>))}</div>
 {err&&<p className="card mt-3 text-sm text-red-600">{err}</p>}
 {turns.length===0&&!err&&<p className="text-sm text-gray-400 mt-3">উপরে একটি উদাহরণ চাপ দিন, নয়তো নিজের প্রশ্ন লিখুন।</p>}
 {turns.map((t,i)=>(<div key={i} className="mt-4"><p className="text-sm"><span className="chip bg-slate-700 text-white">আপনি</span> <b>{t.q}</b></p>
 {t.note&&<p className="card mt-2 text-sm bg-amber-50 border-amber-200 text-amber-800">{t.note}</p>}
 {t.sections.map((s:any,si:number)=>(<div key={si} className="card mt-2"><h3 className="font-black text-sm">{s.title}</h3><div className="mt-2 grid gap-1.5">{s.items.map((it:any,ii:number)=>(<Link key={ii} href={it.href} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 hover:bg-brand-50"><span className="min-w-0 flex-1"><b className="block truncate text-sm">{it.label}</b>{it.sub&&<span className="block truncate text-xs text-gray-500">{it.sub}</span>}</span><span className="text-brand-700 font-black">→</span></Link>))}</div></div>))}
 </div>))}
 </div>; }
