'use client'; import {bn} from '@/components/ui'; import {errMsg} from '@/lib/errMsg'; import {useEffect,useState} from 'react'; import Link from 'next/link';
// Business verification review queue (Wave 3). Lists owner requests (pending first);
// approve writes the ✓ badge onto the content record server-side, reject records the
// reason — both notify the owner. Gated by the 'business.verify' permission.
const ST:any={PENDING:['অপেক্ষমাণ','bg-amber-100 text-amber-800'],APPROVED:['অনুমোদিত ✓','bg-emerald-100 text-emerald-800'],REJECTED:['বাতিল','bg-red-100 text-red-700']};
export default function P(){ const [items,setItems]=useState<any[]|null>(null); const [notes,setNotes]=useState<Record<string,string>>({}); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState('');
 const load=async()=>{ const r=await fetch('/api/admin/verifications'); if(r.ok){ const j=await r.json(); setItems(j.items||[]); } else setItems([]); };
 useEffect(()=>{load()},[]);
 const decide=async(it:any,action:string)=>{ setBusy(it.id+action); setMsg(''); const r=await fetch('/api/admin/verifications',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:it.id,action,note:notes[it.id]||''})}); const j=await r.json().catch(()=>({})); setBusy(''); if(r.ok){ setMsg(action==='approve'?'অনুমোদিত — ব্যবসাটিতে এখন ✓ যাচাইকৃত ব্যাজ দেখাবে।':'আবেদন বাতিল করা হয়েছে — মালিককে জানানো হয়েছে।'); load(); } else setMsg('ব্যর্থ: '+(j.message||errMsg(j.error))); };
 return <main className="p-4 max-w-4xl mx-auto"><h1 className="font-black text-xl">🏅 ব্যবসা যাচাই আবেদন</h1><p className="text-sm text-gray-500 mt-1">মালিকদের পাঠানো যাচাইয়ের আবেদন পর্যালোচনা করুন। অনুমোদন হলেই ব্যবসার পাশে ✓ যাচাইকৃত ব্যাজ জুড়বে; বাতিল হলে মন্তব্যসহ মালিক নোটিফিকেশন পাবেন।</p>
 {msg&&<p className="card mt-3 text-sm">{msg}</p>}
 {items===null&&<p className="card mt-3 text-sm">লোড হচ্ছে…</p>}
 {items!==null&&items.length===0&&<div className="card mt-3 text-center py-8 text-sm text-gray-500">এখনো কোনো যাচাইয়ের আবেদন আসেনি।</div>}
 {items?.map(it=>{ const st=ST[it.status]||[it.status,'bg-slate-100']; return <div key={it.id} className="card mt-3"><div className="flex flex-wrap items-center gap-2"><b>{it.businessName||'(নাম নেই)'}</b><span className={'chip '+st[1]}>{st[0]}</span>{it.contentStatus&&<span className="chip bg-slate-100">কনটেন্ট: {it.contentStatus}</span>}</div>
 <p className="text-xs text-gray-500 mt-1">আবেদনকারী: <b>{it.ownerName||it.ownerEmail||it.userId}</b> • {it.createdAt?new Date(it.createdAt).toLocaleString('bn-BD'):''}{it.contentSlug&&<> • <Link href={'/content/business/'+it.contentSlug} className="font-bold text-brand-700" target="_blank">ব্যবসার পেজ দেখুন ↗</Link></>}</p>
 {it.note&&<p className="text-sm mt-2 bg-slate-50 rounded-xl p-2">{it.note}</p>}
 {it.status!=='PENDING'&&<p className="text-xs text-gray-400 mt-1">সিদ্ধান্ত: {it.reviewedAt?new Date(it.reviewedAt).toLocaleString('bn-BD'):''}{it.reviewNote?(' • মন্তব্য: '+it.reviewNote):''}</p>}
 {it.status==='PENDING'&&<div className="mt-2 flex flex-wrap gap-2"><input value={notes[it.id]||''} onChange={e=>setNotes({...notes,[it.id]:e.target.value})} placeholder="মন্তব্য (ঐচ্ছিক)" className="min-w-52 flex-1"/><button className="btn !py-2" disabled={busy===it.id+'approve'} onClick={()=>decide(it,'approve')}>✓ অনুমোদন</button><button className="btn !py-2 !bg-red-600" disabled={busy===it.id+'reject'} onClick={()=>decide(it,'reject')}>বাতিল</button></div>}
 </div>; })}
 </main>; }
