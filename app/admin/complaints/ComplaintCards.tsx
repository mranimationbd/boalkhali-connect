'use client'; import {useState} from 'react'; import errMsg from '@/lib/errMsg';
const LBL:any={NEW:'নতুন',RECEIVED:'নতুন',OPEN:'নতুন',IN_PROGRESS:'প্রক্রিয়াধীন',RESOLVED:'সমাধান হয়েছে',REJECTED:'বাতিল'};
const CHIP:any={NEW:'bg-red-100 text-red-700',RECEIVED:'bg-red-100 text-red-700',OPEN:'bg-red-100 text-red-700',IN_PROGRESS:'bg-sky-100 text-sky-700',RESOLVED:'bg-emerald-100 text-emerald-700',REJECTED:'bg-slate-200'};
export default function ComplaintCards({items,canManage}:{items:any[],canManage:boolean}){
 const [list,setList]=useState<any[]>(items); const [busy,setBusy]=useState('');
 const act=async(id:string,action:string)=>{ if(action==='delete'&&!confirm('এই অভিযোগটি মুছে ফেলবেন?')) return; setBusy(id+action);
  const res=await fetch('/api/admin/complaints',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,action})}); const j=await res.json().catch(()=>({}));
  if(!res.ok){ alert('ব্যর্থ হয়েছে: '+errMsg(j.error)); setBusy(''); return }
  if(action==='delete') setList(l=>l.filter(x=>x.id!==id)); else setList(l=>l.map(x=>x.id===id?{...x,status:j.status||x.status}:x)); setBusy(''); };
 if(list.length===0) return <div className="card mt-3">কোনো অভিযোগ জমা পড়েনি।</div>;
 return <>{list.map((c:any)=>(<div key={c.id} className="card mt-3"><div className="flex gap-2 flex-wrap items-center"><b>{c.type||'অভিযোগ'}</b><span className={`chip ${CHIP[c.status]||'bg-red-100 text-red-700'}`}>{LBL[c.status]||'নতুন'}</span><span className="chip bg-slate-100">📍 {c.location||''}</span></div><p className="text-sm mt-1">{c.desc}</p><p className="text-xs text-gray-400 mt-1">জমাদানকারী: {c.submitterName||'অজ্ঞাত'} • {c.createdAt?new Date(c.createdAt).toLocaleString('bn-BD'):''}</p>{canManage&&<div className="flex gap-2 mt-3 flex-wrap">{c.status!=='IN_PROGRESS'&&c.status!=='RESOLVED'&&<button disabled={!!busy} onClick={()=>act(c.id,'seen')} className="chip bg-sky-100 text-sky-700">দেখা হয়েছে</button>}{c.status!=='RESOLVED'&&<button disabled={!!busy} onClick={()=>act(c.id,'resolve')} className="chip bg-emerald-100 text-emerald-700">কাজ হয়েছে</button>}<button disabled={!!busy} onClick={()=>act(c.id,'delete')} className="chip bg-red-100 text-red-700">মুছুন</button></div>}</div>))}</>;
}
