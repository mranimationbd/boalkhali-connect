'use client'; import {useState} from 'react'; import errMsg from '@/lib/errMsg';
const SL:any={NEW:'নতুন',SEEN:'দেখা হয়েছে',RESOLVED:'সমাধান'};
const CHIP:any={NEW:'bg-amber-100',SEEN:'bg-sky-100 text-sky-700',RESOLVED:'bg-emerald-100 text-emerald-700'};
const FIELDS:[string,string][]=[['phone','ফোন'],['mobile','মোবাইল'],['contact','যোগাযোগ'],['name','নাম'],['reporterName','প্রেরক'],['location','স্থান'],['area','এলাকা'],['address','ঠিকানা'],['email','ইমেইল']];
export default function SecretCards({items}:{items:any[]}){
 const [list,setList]=useState<any[]>(items); const [open,setOpen]=useState<string|null>(null); const [busy,setBusy]=useState('');
 const act=async(id:string,action:string)=>{ if(action==='delete'&&!confirm('এই গোপন রিপোর্টটি মুছে ফেলবেন?')) return; setBusy(id+action);
  const res=await fetch('/api/admin/secret',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,action})}); const j=await res.json().catch(()=>({}));
  if(!res.ok){ alert('ব্যর্থ হয়েছে: '+errMsg(j.error)); setBusy(''); return }
  if(action==='delete') setList(l=>l.filter(x=>x.id!==id)); else setList(l=>l.map(x=>x.id===id?{...x,status:action==='seen'?'SEEN':'RESOLVED'}:x)); setBusy(''); };
 if(list.length===0) return <div className="card mt-3">এখনো কোনো গোপন রিপোর্ট জমা পড়েনি।</div>;
 return <>{list.map((r:any)=>{ const expanded=open===r.id; const extra=FIELDS.filter(([k])=>r[k]);
  return <div key={r.id} className="card mt-3">
   <button type="button" onClick={()=>setOpen(expanded?null:r.id)} className="w-full text-left">
    <div className="flex gap-2 flex-wrap items-center"><b>{r.title||'শিরোনামহীন রিপোর্ট'}</b><span className="chip bg-red-100 text-red-700">{r.priority||'NORMAL'}</span><span className={`chip ${CHIP[r.status]||'bg-amber-100'}`}>{SL[r.status]||'নতুন'}</span>{r.submitterHidden&&<span className="chip bg-slate-200">পরিচয় গোপন</span>}<span className="chip bg-slate-100 ml-auto">{expanded?'বন্ধ করুন ▴':'বিস্তারিত ▾'}</span></div>
    {!expanded&&<p className="text-sm mt-1 line-clamp-2">{r.desc}</p>}
    <p className="text-xs text-gray-400 mt-1">{r.createdAt?new Date(r.createdAt).toLocaleString('bn-BD'):''}</p>
   </button>
   {expanded&&<div className="mt-2 border-t pt-2">
    <p className="text-sm whitespace-pre-wrap">{r.desc||'—'}</p>
    {extra.length>0&&<div className="mt-2 space-y-1">{extra.map(([k,l])=>(<p key={k} className="text-sm"><b>{l}:</b> {String(r[k])}</p>))}</div>}
    <div className="flex gap-2 mt-3 flex-wrap">
     {r.status!=='SEEN'&&r.status!=='RESOLVED'&&<button disabled={!!busy} onClick={()=>act(r.id,'seen')} className="chip bg-sky-100 text-sky-700">দেখা হয়েছে</button>}
     {r.status!=='RESOLVED'&&<button disabled={!!busy} onClick={()=>act(r.id,'resolve')} className="chip bg-emerald-100 text-emerald-700">সমাধান হয়েছে</button>}
     <button disabled={!!busy} onClick={()=>act(r.id,'delete')} className="chip bg-red-100 text-red-700">মুছে ফেলুন</button>
    </div>
   </div>}
  </div>})}</>;
}
