'use client'; import {useState} from 'react'; import errMsg from '@/lib/errMsg';
export default function AdActions({id,status,url}:{id:string,status:string,url?:string}){const [busy,setBusy]=useState(''); const [u,setU]=useState(url||'');
 const act=async(action:string,extra?:any)=>{ if(action==='delete'&&!confirm('এই বিজ্ঞাপনটি মুছে ফেলবেন?')) return; setBusy(action);
  const res=await fetch('/api/admin/ads',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,action,...extra})}); const j=await res.json().catch(()=>({}));
  if(!res.ok){ alert('ব্যর্থ হয়েছে: '+errMsg(j.error)); setBusy(''); return } location.reload(); };
 return <div className="mt-3"><div className="flex gap-2 flex-wrap">{status!=='HIDDEN'&&<button disabled={!!busy} onClick={()=>act('hide')} className="chip bg-slate-200">ফিডে লুকান</button>}{status==='HIDDEN'&&<button disabled={!!busy} onClick={()=>act('show')} className="chip bg-emerald-100">আবার দেখান</button>}<button disabled={!!busy} onClick={()=>act('delete')} className="chip bg-red-100 text-red-700">মুছে ফেলুন</button></div>
 <div className="flex gap-2 mt-2"><input value={u} onChange={e=>setU(e.target.value)} placeholder="বিজ্ঞাপনের গন্তব্য লিংক (https://…)" className="!w-full text-xs"/><button disabled={!!busy} onClick={()=>act('seturl',{url:u})} className="chip bg-blue-100 shrink-0">লিংক সংরক্ষণ</button></div></div>}
