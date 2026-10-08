'use client'; import {useState} from 'react'; import errMsg from '@/lib/errMsg';
export default function AdActions({id,status}:{id:string,status:string}){const [busy,setBusy]=useState('');
 const act=async(action:string)=>{ if(action==='delete'&&!confirm('এই বিজ্ঞাপনটি মুছে ফেলবেন?')) return; setBusy(action);
  const res=await fetch('/api/admin/ads',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,action})}); const j=await res.json().catch(()=>({}));
  if(!res.ok){ alert('ব্যর্থ হয়েছে: '+errMsg(j.error)); setBusy(''); return } location.reload(); };
 return <div className="flex gap-2 mt-3 flex-wrap">{status!=='HIDDEN'&&<button disabled={!!busy} onClick={()=>act('hide')} className="chip bg-slate-200">ফিডে লুকান</button>}{status==='HIDDEN'&&<button disabled={!!busy} onClick={()=>act('show')} className="chip bg-emerald-100">আবার দেখান</button>}<button disabled={!!busy} onClick={()=>act('delete')} className="chip bg-red-100 text-red-700">মুছে ফেলুন</button></div>}
