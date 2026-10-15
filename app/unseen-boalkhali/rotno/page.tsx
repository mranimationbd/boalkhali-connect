'use client';
import {useMemo, useState} from 'react';
import {Shell, SectionTitle, bn} from '@/components/ui';
import {GEMS, FOODS, getUserGems, addUserGem, UserGem} from '@/lib/unseen';

function GemForm({onAdd}:{onAdd:()=>void}){
  const [name,setName]=useState(''); const [area,setArea]=useState('');
  const [desc,setDesc]=useState(''); const [by,setBy]=useState('');
  const [done,setDone]=useState(false);
  const submit=()=>{
    if(!name.trim()||!desc.trim()||!by.trim()) return;
    addUserGem({name:name.trim().slice(0,60), area:area.trim().slice(0,60), desc:desc.trim().slice(0,500), by:by.trim().slice(0,24), date:new Date().toISOString().slice(0,10)});
    setName(''); setArea(''); setDesc(''); setBy(''); setDone(true); onAdd();
    setTimeout(()=>setDone(false), 4000);
  };
  const input = 'w-full rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm outline-none focus:border-brand-600';
  return <div className="card !p-5">
    <p className="font-display text-lg font-bold">➕ আপনার খুঁজে পাওয়া জায়গা জমা দিন</p>
    <p className="mt-1 text-sm text-gray-500">বোয়ালখালীর এমন কোনো জায়গা জানেন যা অনেকেই চেনে না? নিচে লিখুন — যাচাই করে তালিকায় যোগ করা হবে।</p>
    <div className="mt-4 grid gap-3">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="জায়গার নাম *" maxLength={60} className={input} aria-label="জায়গার নাম"/>
      <input value={area} onChange={e=>setArea(e.target.value)} placeholder="এলাকা / ইউনিয়ন" maxLength={60} className={input} aria-label="এলাকা"/>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="কেন এই জায়গাটি বিশেষ? কীভাবে যাবেন? *" rows={3} maxLength={500} className={input} aria-label="বিবরণ"/>
      <input value={by} onChange={e=>setBy(e.target.value)} placeholder="আপনার নাম *" maxLength={24} className={input} aria-label="আপনার নাম"/>
      <button onClick={submit} disabled={!name.trim()||!desc.trim()||!by.trim()} className="btn w-full disabled:opacity-40">জমা দিন 💎</button>
      {done && <p className="text-center text-sm font-bold text-green-700">✓ ধন্যবাদ! আপনার জমা নিচের তালিকায় যোগ হয়েছে।</p>}
    </div>
  </div>;
}

export default function Rotno(){
  const [gems,setGems]=useState<UserGem[]>(()=>getUserGems());
  const [tab,setTab]=useState<'gems'|'food'|'mine'>('gems');
  const top = useMemo(()=>{
    const c: Record<string,number> = {};
    gems.forEach(g=>{ c[g.by]=(c[g.by]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5);
  },[gems]);

  return <Shell><main className="mx-auto max-w-6xl space-y-6 p-3 md:p-4">
    <SectionTitle title="💎 লুকানো রত্ন" sub="ভ্রমণপিপাসুদের খুঁজে পাওয়া বোয়ালখালীর অজানা জায়গা"/>

    <div className="flex gap-2">
      {([['gems','💎 লুকানো রত্ন'],['food','🍽️ বিখ্যাত খাবার'],['mine','📮 সবার জমা']] as const).map(([id,label])=>(
        <button key={id} onClick={()=>setTab(id)} className={`chip font-bold ${tab===id?'bg-brand-600 text-white':'bg-brand-50 text-brand-800'}`}>{label}{id==='mine'&&gems.length>0?` (${bn(gems.length)})`:''}</button>
      ))}
    </div>

    {tab==='gems' && (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GEMS.map(g=>(
          <div key={g.name} className="card lift !p-4">
            <span className="text-4xl" aria-hidden="true">{g.icon}</span>
            <p className="font-display mt-2 font-bold leading-snug">{g.name}</p>
            <p className="text-xs font-bold text-brand-700">📍 {g.area}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{g.desc}</p>
            <p className="mt-2 text-[11px] font-bold text-amber-700">🗓️ যাওয়ার সেরা সময়: {g.best}</p>
          </div>
        ))}
      </div>
    )}

    {tab==='food' && (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FOODS.map(f=>(
            <div key={f.name} className="card lift !p-4">
              <span className="text-4xl" aria-hidden="true">{f.icon}</span>
              <p className="font-display mt-2 font-bold">{f.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{f.desc}</p>
              <p className="mt-2 text-xs font-bold text-brand-700">📍 {f.where}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">বোয়ালখালীর নিজস্ব ব্র্যান্ডের খাবারের তথ্য সংগ্রহ চলছে — নতুন তথ্য পেলে এখানে যোগ হবে।</p>
      </>
    )}

    {tab==='mine' && (
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          {gems.length ? gems.map((g,i)=>(
            <div key={i} className="card !p-4">
              <p className="font-display font-bold">💎 {g.name}</p>
              <p className="text-xs font-bold text-brand-700">{g.area?`📍 ${g.area} • `:''}✍️ {g.by} • {g.date}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{g.desc}</p>
            </div>
          )) : (
            <div className="card p-8 text-center text-gray-500">
              <p className="text-4xl" aria-hidden="true">📮</p>
              <p className="mt-2 font-bold">এখনো কেউ জমা দেননি</p>
              <p className="text-sm">ডান পাশের ফর্ম থেকে প্রথম জমা দিন!</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <GemForm onAdd={()=>setGems(getUserGems())}/>
          {top.length>0 && (
            <div className="card !p-4">
              <p className="font-display font-bold">🏆 সক্রিয় অবদানকারী</p>
              <ol className="mt-2 space-y-1.5 text-sm">
                {top.map(([n,c],i)=><li key={n} className="flex justify-between"><span>{bn(i+1)}. <b>{n}</b></span><span className="num text-brand-700">{bn(c)}টি জমা</span></li>)}
              </ol>
            </div>
          )}
        </div>
      </div>
    )}
  </main></Shell>;
}
