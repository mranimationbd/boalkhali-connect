'use client';
import {useRef,useState} from 'react';

/* Profile picture uploader for /profile — shows current avatar (or placeholder),
   lets the user pick a photo, previews it, uploads to /api/user/avatar. */
export default function AvatarForm({initial}:{initial:string|null}){
  const [url,setUrl]=useState<string|null>(initial||null);
  const [preview,setPreview]=useState<string|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState('');
  const inputRef=useRef<HTMLInputElement>(null);

  const pick=(f:File|undefined)=>{
    setErr('');
    if(!f) return;
    if(!['image/jpeg','image/png','image/webp'].includes(f.type)){ setErr('শুধু JPG, PNG বা WebP ছবি দিন।'); return; }
    if(f.size>5*1024*1024){ setErr('ছবি ৫MB-এর বেশি হওয়া যাবে না।'); return; }
    setFile(f);
    const r=new FileReader();
    r.onload=()=>setPreview(String(r.result));
    r.readAsDataURL(f);
  };

  const upload=async()=>{
    if(!file||busy) return;
    setBusy(true); setErr('');
    try{
      const fd=new FormData(); fd.append('file',file);
      const res=await fetch('/api/user/avatar',{method:'POST',body:fd});
      const j=await res.json();
      if(!res.ok) throw new Error(j.error||'UPLOAD_FAILED');
      setUrl(j.url); setPreview(null); setFile(null);
    }catch(e:any){
      setErr('আপলোড হয়নি — আবার চেষ্টা করুন।');
    }finally{ setBusy(false); }
  };

  const remove=async()=>{
    if(busy||!url) return;
    if(!confirm('প্রোফাইল ছবি মুছে ফেলবেন?')) return;
    setBusy(true); setErr('');
    try{
      const res=await fetch('/api/user/avatar',{method:'DELETE'});
      if(!res.ok) throw new Error('FAILED');
      setUrl(null);
    }catch{ setErr('মোছা যায়নি — আবার চেষ্টা করুন।'); }
    finally{ setBusy(false); }
  };

  const shown=preview||url;
  return <div>
    <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-emerald-100 text-4xl">
      {shown
        ? <img src={shown} alt="প্রোফাইল ছবি" className="h-full w-full object-cover"/>
        : <span aria-hidden="true">👤</span>}
    </div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
      onChange={e=>pick(e.target.files?.[0])} aria-label="প্রোফাইল ছবি বেছে নিন"/>
    {!preview ? (
      <div className="mt-2 flex justify-center gap-2">
        <button onClick={()=>inputRef.current?.click()} className="chip bg-brand-50 font-bold text-brand-800 press">
          📷 {url?'ছবি বদলান':'ছবি যোগ করুন'}
        </button>
        {url && <button onClick={remove} disabled={busy} className="chip bg-red-50 font-bold text-red-700 press disabled:opacity-40">🗑️ মুছুন</button>}
      </div>
    ) : (
      <div className="mt-2">
        <p className="text-xs text-gray-500">প্রিভিউ — পছন্দ হলে আপলোড করুন</p>
        <div className="mt-1.5 flex justify-center gap-2">
          <button onClick={upload} disabled={busy} className="btn !py-1.5 text-sm disabled:opacity-40">{busy?'আপলোড হচ্ছে…':'✓ আপলোড করুন'}</button>
          <button onClick={()=>{setPreview(null);setFile(null);}} disabled={busy} className="btn !bg-slate-200 !text-slate-700 !py-1.5 text-sm">বাতিল</button>
        </div>
      </div>
    )}
    {err && <p className="mt-1.5 text-xs font-bold text-red-600">{err}</p>}
  </div>;
}
