'use client'; import {Shell,PostCard} from '@/components/ui'; import {catIcon,catEmoji} from '@/lib/catIcons'; import {CATEGORY_THUMBS} from '@/lib/catThumbs'; import Image from 'next/image'; import {useState,useEffect,Fragment} from 'react'; import Link from 'next/link'; import dynamic from 'next/dynamic'; import {useRouter} from 'next/navigation'; import {errMsg} from '@/lib/errMsg';
const Hero3D=dynamic(()=>import('@/components/CreateHero3D'),{ssr:false});

// Per-category subcategory options (used when the DB category has none saved)
const SUBCATS: Record<string,string[]> = {
 house:['ফ্যামিলি বাসা','ব্যাচেলর বাসা','মেস সিট','দোকান / অফিস ভাড়া','সাবলেট'],
 market:['মোবাইল / গ্যাজেট','আসবাবপত্র','ইলেকট্রনিক্স','বাইক / যানবাহন','পোশাক','গৃহস্থালি পণ্য','অন্যান্য'],
 doctor:['জেনারেল ফিজিশিয়ান','ডেন্টাল','শিশু বিশেষজ্ঞ','গাইনি ও প্রসূতি','চক্ষু','অন্যান্য'],
 blood:['জরুরি রক্ত প্রয়োজন','রক্তদানে ইচ্ছুক'],
 jobs:['ফুল-টাইম চাকরি','পার্ট-টাইম','ফ্রিল্যান্স / রিমোট','ইন্টার্নশিপ','নিয়োগ বিজ্ঞপ্তি'],
 food:['রেস্টুরেন্ট','হোমমেড খাবার','ক্যাটারিং','মিষ্টি / বেকারি'],
 transport:['বাস সার্ভিস','ট্রেন তথ্য','রেন্ট-এ-কার','সিএনজি / অটো'],
 lost:['হারিয়েছে','পাওয়া গেছে'],
 event:['বিয়ে / অনুষ্ঠান','ডেকোরেশন','সাউন্ড ও লাইটিং','কমিউনিটি সেন্টার'],
 legal:['আইনি পরামর্শ','দলিল / ভূমি সেবা'],
 electrician:['বাসা ওয়্যারিং','ফ্যান / লাইট ফিটিং','মোটর / পাম্প'],
 plumber:['স্যানিটারি কাজ','পাইপলাইন','ট্যাংক পরিষ্কার'],
 ac:['এসি সার্ভিসিং','ফ্রিজ সার্ভিসিং','গ্যাস চার্জ'],
 driver:['মাসিক ড্রাইভার','রেন্ট-এ-কার সার্ভিস','ট্রিপ ভাড়া'],
 tutor:['স্কুল টিউশন','কলেজ টিউশন','ভর্তি কোচিং','আরবি / কুরআন শিক্ষা'],
 vet:['গরু / ছাগল চিকিৎসা','হাঁস-মুরগি','পোষা প্রাণী'],
 mason:['নতুন বাড়ি নির্মাণ','মেরামত কাজ','টাইলস / রং'],
 mobile:['মোবাইল সার্ভিসিং','ডিসপ্লে / ব্যাটারি','সফটওয়্যার সমস্যা'],
 secret:[],
};
const priceLabel=(cat:string)=>cat==='house'?'মাসিক ভাড়া (টাকা)':cat==='market'?'দাম (টাকা)':cat==='jobs'?'বেতন / সম্মানী (টাকা)':cat==='lost'?'পুরস্কার ঘোষণা (ঐচ্ছিক)':'মূল্য / ফি (ঐচ্ছিক)';
const hidePrice=(cat:string)=>['blood','secret'].includes(cat);
const showRooms=(cat:string)=>cat==='house';
const showExpiry=(cat:string)=>['jobs','house','market','event'].includes(cat);
const normPhone=(s:string)=>{const d=String(s||'').replace(/\D/g,'');return /^01[3-9]\d{8}$/.test(d)?d:''};

/* ---------- visual stepper ---------- */
const STEP_DEFS=[['১','ক্যাটাগরি'],['২','বিস্তারিত'],['৩','প্রিভিউ']];
function Stepper({step,go}:{step:number;go:(n:number)=>void}){
 return <div className="card !p-4" aria-label="পোস্ট তৈরির ধাপ">
  <div className="flex items-start">
   {STEP_DEFS.map(([n,l],i)=>{ const idx=i+1; const done=idx<step; const cur=idx===step;
    return <Fragment key={n}>
     <button type="button" disabled={!done} onClick={()=>{ if(done) go(idx); }}
      className={`flex shrink-0 flex-col items-center gap-1.5 ${done?'cursor-pointer':'cursor-default'}`} aria-current={cur?'step':undefined}>
      <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black transition-all duration-300 ${done?'bg-[var(--brand-600)] text-white shadow-[var(--shadow-2)]':cur?'anim-ring scale-105 bg-[var(--brand-600)] text-white':'bg-gray-100 text-gray-400'}`}>{done?'✓':n}</span>
      <span className={`text-[11px] font-bold ${cur?'text-[var(--brand-700)]':done?'text-[var(--ink)]':'text-gray-400'}`}>{l}</span>
     </button>
     {idx<3&&<div className="mx-2 mt-5 h-1 min-w-4 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full bg-gradient-to-r from-[var(--brand-400)] to-[var(--brand-600)] transition-all duration-500 ${idx<step?'w-full':'w-0'}`}/></div>}
    </Fragment>;})}
  </div>
 </div>;
}

/* ---------- category card with thumbnail ---------- */
function CatCard({c,selected,onPick,idx}:{c:any;selected:boolean;onPick:()=>void;idx:number}){
 const thumb=CATEGORY_THUMBS[c.slug];
 const tint=c.color||'#0a7a54';
 return <button type="button" onClick={onPick} aria-pressed={selected}
  style={{animationDelay:`${Math.min(idx,14)*45}ms`}}
  className={`anim-rise group press relative overflow-hidden rounded-[var(--r-lg)] border-2 text-left transition-all duration-200 ${selected?'border-[var(--brand-600)] shadow-[var(--shadow-3)]':'border-transparent shadow-[var(--shadow-1)]'}`}>
  <div className="relative aspect-[16/10] w-full overflow-hidden" style={{background:`linear-gradient(135deg,${tint}26,${tint}0d)`}}>
   {thumb?(
    <Image src={thumb} alt={c.name} fill sizes="(max-width:768px)50vw,240px" className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"/>
   ):(
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3">
     {catIcon(c.slug)?<img src={catIcon(c.slug)} alt="" className="h-14 w-14 object-contain drop-shadow"/>:<span className="text-5xl">{catEmoji(c.slug)}</span>}
    </div>
   )}
   <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"/>
   {selected&&<span className="anim-pop absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-600)] text-sm font-black text-white shadow-[var(--shadow-2)]">✓</span>}
   <span className="absolute inset-x-0 bottom-0 block p-2.5">
    <b className="block text-sm font-black leading-snug text-white" style={{textShadow:'0 1px 6px rgba(0,0,0,.55)'}}>{c.name}</b>
    {c.desc&&<span className="mt-0.5 block text-[11px] font-medium leading-tight text-white/90" style={{textShadow:'0 1px 4px rgba(0,0,0,.55)'}}>{c.desc}</span>}
   </span>
  </div>
 </button>;
}

/* ---------- consistent error banner ---------- */
function ErrBar({msg}:{msg:string}){
 if(!msg) return null;
 return <p role="alert" className="anim-pop flex items-start gap-2 rounded-[var(--r-md)] bg-[var(--danger-bg)] p-3 text-sm font-bold text-[var(--danger)]"><span aria-hidden="true">⚠️</span><span>{msg}</span></p>;
}

/* ---------- sticky mobile action bar ---------- */
function ActionBar({children}:{children:any}){
 return <div className="sticky bottom-24 z-30 pt-5" style={{background:'linear-gradient(to top, var(--bg) 60%, transparent)'}}>
  <div className="flex gap-2">{children}</div>
 </div>;
}

/* ---------- 3D hero (React Three Fiber) ---------- */
function Hero(){
 return <div className="anim-rise relative overflow-hidden rounded-[var(--r-xl)] p-5 text-white shadow-[var(--shadow-2)]" style={{background:'linear-gradient(120deg,#065f46 0%,#0a7a54 55%,#10b981 100%)'}}>
  <div className="pointer-events-none absolute inset-0" aria-hidden="true"><Hero3D/></div>
  <div className="relative">
   <h1 className="font-display text-xl font-black">নতুন পোস্ট করুন</h1>
   <p className="mt-1 max-w-md text-sm text-white/90">বোয়ালখালীর হাজারো মানুষের কাছে পৌঁছে দিন — বাসা ভাড়া, বাই-সেল, সেবা, চাকরি ও আরও অনেক কিছু।</p>
  </div>
 </div>;
}

export default function Client({cats,locs}:{cats:any[];locs:string[]}){
 const router=useRouter();
 const [me,setMe]=useState<string|null>(null); const [showAuthPop,setShowAuthPop]=useState(false);
 useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(j=>{ if(j&&j.user&&j.user.id){ setMe(j.user.id); } else { setMe(''); setShowAuthPop(true); } }).catch(()=>{ setMe(''); setShowAuthPop(true); }); },[]);
 const [step,setStep]=useState(1); const [cat,setCat]=useState(''); const [title,setTitle]=useState(''); const [sub,setSub]=useState(''); const [rooms,setRooms]=useState(''); const [price,setPrice]=useState(''); const [desc,setDesc]=useState(''); const [loc,setLoc]=useState(locs[0]||''); const [landmark,setLandmark]=useState(''); const [phone,setPhone]=useState(''); const [wa,setWa]=useState(''); const [hidePhone,setHidePhone]=useState(false); const [wantVerified,setWantVerified]=useState(false); const [exp,setExp]=useState(''); const [img,setImg]=useState(''); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false); const [upBusy,setUpBusy]=useState(false); const [sent,setSent]=useState(false);
 const cObj=cats.find((c:any)=>c.slug===cat);
 const dbSubs=((cObj&&(cObj.subcategories||[]))||[]).filter(Boolean);
 const subs=dbSubs.length?dbSubs:(SUBCATS[cat]||[]);
 const pickCat=(slug:string)=>{ setCat(slug); const c=cats.find((x:any)=>x.slug===slug); const ds=((c&&(c.subcategories||[]))||[]).filter(Boolean); const ss=ds.length?ds:(SUBCATS[slug]||[]); setSub(ss[0]||''); setMsg(''); };
 const resetAll=()=>{ setSent(false); setStep(1); setCat(''); setTitle(''); setSub(''); setRooms(''); setPrice(''); setDesc(''); setLoc(locs[0]||''); setLandmark(''); setPhone(''); setWa(''); setHidePhone(false); setWantVerified(false); setExp(''); setImg(''); setMsg(''); };
 const toStep2=()=>{ if(!cat){ setMsg('আগে ক্যাটাগরি বেছে নিন'); return; } setMsg(''); setStep(2); };
 const toStep3=()=>{ if(!title.trim()||!desc.trim()){ setMsg('শিরোনাম ও বিস্তারিত বিবরণ আবশ্যক'); return; } const ph=normPhone(phone); if(!ph){ setMsg('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)'); return; } setPhone(ph); setMsg(''); setStep(3); };
 const submit=async()=>{ setBusy(true); setMsg(''); try{ const body={categorySlug:cat,title,subcategory:sub,rooms:showRooms(cat)?rooms:'',price:hidePrice(cat)?'':price,desc,location:loc,landmark,phone: normPhone(phone),whatsapp:wa?normPhone(wa):'',image:img,hidePhone,verificationRequested:wantVerified,expiresAt:exp}; const r=await fetch('/api/posts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}); const j=await r.json(); if(r.ok){ setSent(true); } else setMsg('❌ '+errMsg(j.error)); }catch{ setMsg('❌ '+errMsg(null)); } setBusy(false); };
 const upload=async(file?:File)=>{ if(!file)return; setUpBusy(true); const fd=new FormData(); fd.append('file',file); try{ const r=await fetch('/api/upload',{method:'POST',body:fd}); const j=await r.json(); if(j.url){ setImg(j.url); setMsg('ছবি আপলোড হয়েছে'); } else setMsg('আপলোড ব্যর্থ: '+errMsg(j.error)); }catch{ setMsg('আপলোড ব্যর্থ: '+errMsg(null)); } setUpBusy(false); };

 if(sent) return <Shell><main className="mx-auto max-w-2xl p-4"><div className="anim-pop card py-10 text-center"><div className="text-5xl">✅</div><h2 className="mt-3 text-xl font-black">আপনার পোস্ট পর্যালোচনার জন্য পাঠানো হয়েছে</h2><p className="mt-2 text-sm text-gray-600">«{title}» — অনুমোদন হলেই নিউজফিডে দেখা যাবে। আপনার পোস্টের অবস্থা <b>আমার পোস্টসমূহ</b>-এ «অপেক্ষমাণ» হিসেবে দেখতে পাবেন।</p><div className="mt-6 flex flex-col gap-2"><Link href="/my-posts" className="btn w-full !py-3">আমার পোস্টসমূহ দেখুন</Link><button className="press w-full rounded-2xl bg-gray-100 py-3 font-bold" onClick={resetAll}>আরেকটি পোস্ট করুন</button></div></div></main></Shell>;
 if(me===null) return <Shell><main className="mx-auto max-w-2xl p-4"><div className="card py-10 text-center text-gray-500">লোড হচ্ছে…</div></main></Shell>;

 return <Shell><main className="create-flow mx-auto max-w-2xl space-y-4 p-4">
 {showAuthPop&&me===''&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-[2px]"><div className="anim-pop card relative w-full max-w-sm !p-6 text-center"><button type="button" onClick={()=>setShowAuthPop(false)} aria-label="বন্ধ করুন" className="press absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-lg font-black">✕</button><div className="mt-2 text-5xl">🔐</div><h2 className="mt-2 text-lg font-black">লগইন প্রয়োজন</h2><p className="mt-1 text-sm text-gray-600">পোস্ট করতে হলে আগে লগইন বা রেজিস্ট্রেশন করুন।</p><button type="button" onClick={()=>router.push('/login?next=/create')} className="btn mt-4 w-full !py-3">Okay</button></div></div>}

 {me===''?(<div className="anim-rise card py-10 text-center"><div className="text-5xl">🔐</div><h2 className="mt-3 text-xl font-black">পোস্ট করতে লগইন করুন</h2><p className="mt-2 text-sm text-gray-600">বোয়ালখালী কানেক্টে পোস্ট করতে একটি অ্যাকাউন্ট প্রয়োজন।</p><div className="mt-6 flex flex-col gap-2"><Link href="/login?next=/create" className="btn w-full !py-3">লগইন করুন</Link><Link href="/register" className="press w-full rounded-2xl bg-gray-100 py-3 text-center font-bold">নতুন অ্যাকাউন্ট খুলুন</Link></div></div>):(<>
  <Hero/>
  <Stepper step={step} go={setStep}/>
  <div key={step} className="anim-step">

  {step===1&&<div className="card">
   <h2 className="font-display text-lg font-black">কী পোস্ট করতে চান? <span className="text-[var(--danger)]">*</span></h2>
   <p className="cf-hint">একটি ক্যাটাগরি বেছে নিন — সেই অনুযায়ী পরের ধাপের ফর্ম সাজানো হবে।</p>
   {cats.length===0&&<p className="mt-3 rounded-xl bg-[var(--warning-bg)] p-3 text-sm font-bold text-[var(--warning)]">কোনো ক্যাটাগরি চালু নেই — অ্যাডমিন প্যানেল থেকে ক্যাটাগরি চালু করুন।</p>}
   <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
    {cats.map((c:any,i:number)=><CatCard key={c.slug} c={c} idx={i} selected={cat===c.slug} onPick={()=>{ pickCat(c.slug); setStep(2); }}/>)}
   </div>
   <div className="mt-4"><ErrBar msg={msg}/></div>
   <button type="button" className="btn mt-3 w-full !py-3.5 !text-base" onClick={toStep2}>পরের ধাপ ›</button>
  </div>}

  {step===2&&<div className="space-y-4">
   <div className="card">
    <h2 className="font-display text-lg font-black">পোস্টের মূল বিবরণ{cObj&&<span className="chip ml-2 !bg-[var(--brand-50)] text-[var(--brand-700)]">{cObj.name}</span>}</h2>
    <div className="mt-3 space-y-4">
     <label className="cf-label">পোস্টের শিরোনাম <span className="text-[var(--danger)]">*</span>
      <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="যেমন: কধুরখীল মোড়ে ৩ রুমের ফ্যামিলি বাসা ভাড়া"/>
      <p className="cf-hint">স্পষ্ট ও সুনির্দিষ্ট শিরোনামে সাড়া বেশি পাবেন।</p>
     </label>
     {subs.length>0&&<label className="cf-label">ধরণ / সাব-ক্যাটাগরি
      <select value={sub} onChange={e=>setSub(e.target.value)}>{subs.map((s:string)=><option key={s}>{s}</option>)}</select>
     </label>}
     {showRooms(cat)&&<label className="cf-label">রুমের বিবরণ
      <input value={rooms} onChange={e=>setRooms(e.target.value)} placeholder="৩ রুম + ড্রয়িং"/>
     </label>}
     {!hidePrice(cat)&&<label className="cf-label">{priceLabel(cat)}
      <input value={price} onChange={e=>setPrice(e.target.value)} type="number" min="0" placeholder={cat==='house'?'৮৫০০':''}/>
      <p className="cf-hint">খালি রাখলে "আলোচনা সাপেক্ষে" দেখাবে।</p>
     </label>}
     <label className="cf-label">বিস্তারিত বিবরণ <span className="text-[var(--danger)]">*</span>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} maxLength={2000} placeholder="স্পেস, সুবিধা বা বৈশিষ্ট্য লিখুন..."/>
      <p className="cf-hint text-right">{desc.length}/২০০০</p>
     </label>
     {showExpiry(cat)&&<><label className="cf-label">{cat==='jobs'?'আবেদনের শেষ তারিখ':'মেয়াদ শেষের তারিখ'} (ঐচ্ছিক)
      <input type="date" value={exp} onChange={e=>setExp(e.target.value)}/>
      <p className="cf-hint">তারিখ দিলে ওই দিনের পর পোস্টটি সক্রিয় তালিকা ও অনুসন্ধানে আর দেখা যাবে না।</p>
     </label></>}
    </div>
   </div>

   <div className="card">
    <h2 className="font-display text-lg font-black">বোয়ালখালীর এলাকা ও ঠিকানা <span className="text-[var(--danger)]">*</span></h2>
    <div className="mt-3 space-y-4">
     <label className="cf-label">এলাকা
      <select value={loc} onChange={e=>setLoc(e.target.value)}>{locs.map((l:string)=><option key={l}>{l}</option>)}</select>
     </label>
     <label className="cf-label">ল্যান্ডমার্ক (ঐচ্ছিক)
      <input value={landmark} onChange={e=>setLandmark(e.target.value)} placeholder="নির্দিষ্ট ল্যান্ডমার্ক / রোড নম্বর"/>
      <p className="cf-hint">যেমন: বোয়ালখালী কারখানা গেটের বিপরীতে</p>
     </label>
    </div>
   </div>

   <div className="card">
    <h2 className="font-display text-lg font-black">ছবি <span className="text-sm font-bold text-gray-400">(ঐচ্ছিক)</span></h2>
    <p className="cf-hint">JPG, PNG বা WEBP — ছবি দিলে বেশি ভিউ পাওয়া যায়।</p>
    <input className="mt-2" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>upload(e.target.files?.[0])}/>
    {upBusy&&<p className="mt-2 text-xs">আপলোড হচ্ছে…</p>}
    {img&&<div className="anim-pop relative mt-2 inline-block"><img src={img} className="h-32 rounded-xl shadow-[var(--shadow-2)]" alt="আপলোড করা ছবি"/><button type="button" onClick={()=>setImg('')} className="chip absolute right-1 top-1 !bg-red-600 !text-white">✕ ছবি সরান</button></div>}
   </div>

   <div className="card">
    <h2 className="font-display text-lg font-black">যোগাযোগ <span className="text-[var(--danger)]">*</span></h2>
    <div className="mt-3 space-y-4">
     <label className="cf-label">মোবাইল নম্বর <span className="text-[var(--danger)]">*</span>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric"/>
      <p className="cf-hint">এই নম্বরেই আগ্রহীরা যোগাযোগ করবে।</p>
     </label>
     <label className="cf-label">হোয়াটসঅ্যাপ <span className="text-sm font-bold text-gray-400">(ঐচ্ছিক)</span>
      <input value={wa} onChange={e=>setWa(e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric"/>
     </label>
     <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--brand-50)] p-3"><input type="checkbox" checked={wantVerified} onChange={e=>setWantVerified(e.target.checked)} className="!w-auto"/> <span className="text-sm">ভেরিফাইড পোস্ট চাই — অ্যাডমিন যাচাই করে ব্যাজ দেবে</span></label>
     <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-50 p-3"><input type="checkbox" checked={hidePhone} onChange={e=>setHidePhone(e.target.checked)} className="!w-auto"/> <span className="text-sm">ফোন নম্বর লুকান — পোস্টে কল/WhatsApp বোতাম দেখাবে না</span></label>
    </div>
   </div>

   <div className="card !bg-[var(--warning-bg)]"><h2 className="font-black">🛡️ নিরাপত্তা টিপস</h2><ul className="list-disc space-y-1 pl-5 text-sm"><li>জনসমাগম ও নিরাপদ স্থানে দেখা করুন।</li><li>আগে থেকে অগ্রিম টাকা পাঠাবেন না।</li><li>পণ্য নিজে দেখে যাচাই করে তারপর কিনুন।</li><li>সন্দেহজনক পোস্ট দেখলে রিপোর্ট করুন।</li></ul></div>

   <ErrBar msg={msg}/>
   <ActionBar>
    <button type="button" className="press flex-1 rounded-2xl bg-gray-100 py-3.5 font-bold" onClick={()=>setStep(1)}>‹ ক্যাটাগরি</button>
    <button type="button" className="btn flex-[2] !py-3.5 !text-base justify-center" onClick={toStep3}>প্রিভিউ দেখুন ›</button>
   </ActionBar>
   <a href="/" className="press block rounded-2xl bg-gray-100 py-3 text-center font-bold">বাতিল করুন</a>
  </div>}

  {step===3&&<div className="space-y-4">
   <div className="card"><h2 className="font-display text-lg font-black">ফিডে যেমন দেখাবে</h2><div className="anim-rise mx-auto mt-3 max-w-sm pointer-events-none"><PostCard p={{id:'',categorySlug:cat,title:title||'শিরোনাম',subcategory:sub,desc,price:Number(price||0),location:loc,landmark,phone,whatsapp:wa,image:img,hidePhone,sold:false,verified:false,promoted:false,views:0}} catName={cObj?.name} catColor={cObj?.color}/></div></div>
   <div className="card"><h2 className="font-display text-lg font-black">যা যা থাকছে</h2>
    <dl className="mt-3 space-y-2.5 text-sm">
     <div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">ক্যাটাগরি</dt><dd className="font-bold">{cObj?.name||cat}{sub&&` · ${sub}`}</dd></div>
     <div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">শিরোনাম</dt><dd className="font-bold">{title}</dd></div>
     <div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">এলাকা</dt><dd>{loc}{landmark?' · '+landmark:''}</dd></div>
     <div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">মোবাইল</dt><dd>{phone}{hidePhone?' (লুকানো থাকবে)':''}</dd></div>
     {exp&&<div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">{cat==='jobs'?'শেষ তারিখ':'মেয়াদ'}</dt><dd>{new Date(exp+'T00:00:00').toLocaleDateString('bn-BD')}</dd></div>}
     {wa&&<div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">হোয়াটসঅ্যাপ</dt><dd>{wa}</dd></div>}
     {wantVerified&&<div className="flex gap-2"><dt className="w-24 shrink-0 font-bold text-gray-500">ভেরিফিকেশন</dt><dd><span className="chip !bg-[var(--brand-50)] text-[var(--brand-700)]">অ্যাডমিন যাচাইয়ের অনুরোধ</span></dd></div>}
    </dl>
    <p className="mt-3 rounded-xl bg-[var(--warning-bg)] p-2.5 text-[13px] font-bold text-[var(--warning)]">প্রকাশের পর পোস্টটি মডারেশনে যাবে — অনুমোদন হলেই ফিডে দেখা যাবে।</p>
   </div>
   <ErrBar msg={msg}/>
   <div className="flex gap-2"><button type="button" className="press flex-1 rounded-2xl bg-gray-100 py-3.5 font-bold" onClick={()=>setStep(2)}>‹ সম্পাদনা করুন</button><button type="button" disabled={busy} className="btn flex-1 !py-4 !text-lg justify-center" onClick={submit}>{busy?'পাঠানো হচ্ছে…':'✨ প্রকাশ করুন'}</button></div>
  </div>}

  </div>
 </>)}
 </main></Shell>;
}
