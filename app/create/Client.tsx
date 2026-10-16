'use client'; import {Shell,PostCard} from '@/components/ui'; import {catIcon,catEmoji} from '@/lib/catIcons'; import {useState,useEffect} from 'react'; import Link from 'next/link'; import {useRouter} from 'next/navigation'; import {errMsg} from '@/lib/errMsg';

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
 const steps=[['১','ক্যাটাগরি'],['২','বিস্তারিত'],['৩','প্রিভিউ']];
 if(sent) return <Shell><main className="max-w-2xl mx-auto p-4"><div className="card text-center py-10"><div className="text-5xl">✅</div><h2 className="font-black text-xl mt-3">আপনার পোস্ট পর্যালোচনার জন্য পাঠানো হয়েছে</h2><p className="text-sm text-gray-600 mt-2">«{title}» — অনুমোদন হলেই নিউজফিডে দেখা যাবে। আপনার পোস্টের অবস্থা <b>আমার পোস্টসমূহ</b>-এ «অপেক্ষমাণ» হিসেবে দেখতে পাবেন।</p><div className="flex flex-col gap-2 mt-6"><Link href="/my-posts" className="btn w-full !py-3">আমার পোস্টসমূহ দেখুন</Link><button className="w-full bg-gray-100 rounded-2xl py-3 font-bold" onClick={resetAll}>আরেকটি পোস্ট করুন</button></div></div></main></Shell>;
 if(me===null) return <Shell><main className="max-w-2xl mx-auto p-4"><div className="card text-center py-10 text-gray-500">লোড হচ্ছে…</div></main></Shell>;
 return <Shell><main className="max-w-2xl mx-auto p-4">
 {showAuthPop&&me===''&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="card relative max-w-sm w-full text-center !p-6"><button type="button" onClick={()=>setShowAuthPop(false)} aria-label="বন্ধ করুন" className="absolute top-2 right-2 w-9 h-9 grid place-items-center rounded-full bg-gray-100 font-black text-lg">✕</button><div className="text-5xl mt-2">🔐</div><h2 className="font-black text-lg mt-2">লগইন প্রয়োজন</h2><p className="text-sm text-gray-600 mt-1">পোস্ট করতে হলে আগে লগইন বা রেজিস্ট্রেশন করুন।</p><button type="button" onClick={()=>router.push('/login?next=/create')} className="btn w-full !py-3 mt-4">Okay</button></div></div>}
 {me===''?(<div className="card text-center py-10"><div className="text-5xl">🔐</div><h2 className="font-black text-xl mt-3">পোস্ট করতে লগইন করুন</h2><p className="text-sm text-gray-600 mt-2">বোয়ালখালী কানেক্টে পোস্ট করতে একটি অ্যাকাউন্ট প্রয়োজন।</p><div className="flex flex-col gap-2 mt-6"><Link href="/login?next=/create" className="btn w-full !py-3">লগইন করুন</Link><Link href="/register" className="w-full bg-gray-100 rounded-2xl py-3 font-bold text-center">নতুন অ্যাকাউন্ট খুলুন</Link></div></div>):(<>
 <div className="flex gap-2 mb-4">{steps.map(([n,l],i)=>(<button key={n} type="button" disabled={i+1>step} onClick={()=>{ if(i+1<step) setStep(i+1); }} className={`chip !py-2 ${step===i+1?'!bg-emerald-600 !text-white':i+1<step?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-400'}`}>ধাপ {n} · {l}</button>))}</div>
 {step===1&&<div className="card"><h2 className="font-black">কী পোস্ট করতে চান? *</h2>{cats.length===0&&<p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3 mt-3">কোনো ক্যাটাগরি চালু নেই — অ্যাডমিন প্যানেল থেকে ক্যাটাগরি চালু করুন।</p>}<div className="grid grid-cols-3 gap-2 mt-3">{cats.map((c:any)=>(<button key={c.slug} type="button" onClick={()=>{ pickCat(c.slug); setStep(2); }} className={`rounded-2xl border p-3 text-center ${cat===c.slug?'border-emerald-600 bg-emerald-50':'border-gray-200'}`}><div className="mx-auto w-14 h-14 rounded-2xl grid place-items-center" style={{background:(c.color||'#0a7a54')+'1f'}}>{catIcon(c.slug)?<img src={catIcon(c.slug)} alt={c.name} className="w-10 h-10 object-contain"/>:<span className="text-3xl">{catEmoji(c.slug)}</span>}</div><b className="text-xs block mt-1 leading-snug">{c.name}</b>{c.desc&&<span className="text-[10px] text-gray-500 block leading-tight mt-0.5">{c.desc}</span>}</button>))}</div>{msg&&<p className="text-sm text-red-600 mt-3">{msg}</p>}<button type="button" className="btn w-full !py-3 mt-4" onClick={toStep2}>পরের ধাপ ›</button></div>}
 {step===2&&<div className="space-y-4">
  <div className="card"><h2 className="font-black">পোস্টের মূল বিবরণ{cObj&&<span className="ml-2 chip !bg-emerald-50">{cObj.name}</span>}</h2>
   <label>পোস্টের শিরোনাম *<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} placeholder="যেমন: কধুরখীল মোড়ে ৩ রুমের ফ্যামিলি বাসা ভাড়া"/></label>
   {subs.length>0&&<label>ধরণ / সাব-ক্যাটাগরি<select value={sub} onChange={e=>setSub(e.target.value)}>{subs.map((s:string)=><option key={s}>{s}</option>)}</select></label>}
   {showRooms(cat)&&<label>রুমের বিবরণ<input value={rooms} onChange={e=>setRooms(e.target.value)} placeholder="৩ রুম + ড্রয়িং"/></label>}
   {!hidePrice(cat)&&<label>{priceLabel(cat)}<input value={price} onChange={e=>setPrice(e.target.value)} type="number" min="0" placeholder={cat==='house'?'৮৫০০':cat==='jobs'?'':''}/></label>}
   <label>বিস্তারিত বিবরণ *<textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} maxLength={2000} placeholder="স্পেস, সুবিধা বা বৈশিষ্ট্য লিখুন..."/></label><div className="text-xs text-gray-400 text-right -mt-2">{desc.length}/২০০০</div>
   {showExpiry(cat)&&<><label>{cat==='jobs'?'আবেদনের শেষ তারিখ':'মেয়াদ শেষের তারিখ'} (ঐচ্ছিক)<input type="date" value={exp} onChange={e=>setExp(e.target.value)}/></label><p className="text-xs text-gray-500">তারিখ দিলে ওই দিনের পর পোস্টটি সক্রিয় তালিকা ও অনুসন্ধানে আর দেখা যাবে না। খালি রাখলে মেয়াদ থাকবে না।</p></>}
  </div>
  <div className="card"><h2 className="font-black">বোয়ালখালীর এলাকা ও ঠিকানা *</h2><select value={loc} onChange={e=>setLoc(e.target.value)}>{locs.map((l:string)=><option key={l}>{l}</option>)}</select><input value={landmark} onChange={e=>setLandmark(e.target.value)} placeholder="নির্দিষ্ট ল্যান্ডমার্ক / রোড নম্বর — যেমন: বোয়ালখালী কারখানা গেটের বিপরীতে"/></div>
  <div className="card"><h2 className="font-black">ছবি সংযুক্ত করুন (ঐচ্ছিক)</h2><p className="text-xs">JPG, PNG বা WEBP (ছবি দিলে বেশি ভিউ পাওয়া যায়)</p><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e=>upload(e.target.files?.[0])}/>{upBusy&&<p className="text-xs mt-2">আপলোড হচ্ছে…</p>}{img&&<div className="relative inline-block mt-2"><img src={img} className="h-32 rounded-xl"/><button type="button" onClick={()=>setImg('')} className="chip absolute top-1 right-1 !bg-red-600 !text-white">✕ ছবি সরান</button></div>}</div>
  <div className="card"><h2 className="font-black">যোগাযোগ *</h2><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="মোবাইল 01XXXXXXXXX" inputMode="numeric"/><input value={wa} onChange={e=>setWa(e.target.value)} placeholder="হোয়াটসঅ্যাপ 01XXXXXXXXX (ঐচ্ছিক)" inputMode="numeric"/>
   <label className="flex gap-2 items-center bg-emerald-50 p-3 rounded-xl cursor-pointer"><input type="checkbox" checked={wantVerified} onChange={e=>setWantVerified(e.target.checked)} className="!w-auto"/> ভেরিফাইড পোস্ট চাই — অ্যাডমিন যাচাই করে ব্যাজ দেবে</label>
   <label className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl mt-2 cursor-pointer"><input type="checkbox" checked={hidePhone} onChange={e=>setHidePhone(e.target.checked)} className="!w-auto"/> ফোন নম্বর লুকান — পোস্টে কল/WhatsApp বোতাম দেখাবে না</label></div>
  <div className="card !bg-amber-50"><h2 className="font-black">🛡️ নিরাপত্তা টিপস</h2><ul className="text-sm list-disc pl-5 space-y-1"><li>জনসমাগম ও নিরাপদ স্থানে দেখা করুন।</li><li>আগে থেকে অগ্রিম টাকা পাঠাবেন না।</li><li>পণ্য নিজে দেখে যাচাই করে তারপর কিনুন।</li><li>সন্দেহজনক পোস্ট দেখলে রিপোর্ট করুন।</li></ul></div>
  {msg&&<p className="card !text-red-600 text-sm">{msg}</p>}
  <div className="flex gap-2"><button type="button" className="flex-1 bg-gray-100 rounded-2xl py-3 font-bold" onClick={()=>setStep(1)}>‹ ক্যাটাগরি বদলান</button><button type="button" className="btn flex-1 !py-3" onClick={toStep3}>প্রিভিউ দেখুন ›</button></div>
  <a href="/" className="block text-center bg-gray-100 rounded-2xl py-3 font-bold">বাতিল করুন</a></div>}
 {step===3&&<div className="space-y-4">
  <div className="card"><h2 className="font-black">ফিডে যেমন দেখাবে</h2><div className="max-w-sm mx-auto mt-3 pointer-events-none"><PostCard p={{id:'',categorySlug:cat,title:title||'শিরোনাম',subcategory:sub,desc,price:Number(price||0),location:loc,landmark,phone,whatsapp:wa,image:img,hidePhone,sold:false,verified:false,promoted:false,views:0}} catName={cObj?.name} catColor={cObj?.color}/></div></div>
  <div className="card text-sm space-y-1"><h2 className="font-black">বিস্তারিত পেজে যা থাকবে</h2><p><b>ক্যাটাগরি:</b> {cObj?.name||cat}{sub&&` · ${sub}`}</p><p><b>বিবরণ:</b> {desc}</p><p><b>এলাকা:</b> {loc}{landmark?' · '+landmark:''}</p><p><b>মোবাইল:</b> {phone}{hidePhone?' (লুকানো থাকবে)':''}</p>{exp&&<p><b>{cat==='jobs'?'আবেদনের শেষ তারিখ':'মেয়াদ শেষের তারিখ'}:</b> {new Date(exp+'T00:00:00').toLocaleDateString('bn-BD')}</p>}{wa&&<p><b>হোয়াটসঅ্যাপ:</b> {wa}</p>}{wantVerified&&<p><b>ভেরিফিকেশন:</b> <span className="chip !bg-emerald-50">অ্যাডমিন যাচাইয়ের অনুরোধ করা হয়েছে</span></p>}<p className="text-amber-700 bg-amber-50 rounded-xl p-2">প্রকাশের পর পোস্টটি মডারেশনে যাবে — অনুমোদন হলেই ফিডে দেখা যাবে।</p></div>
  {msg&&<p className="card !text-red-600 text-sm">{msg}</p>}
  <div className="flex gap-2"><button type="button" className="flex-1 bg-gray-100 rounded-2xl py-3 font-bold" onClick={()=>setStep(2)}>‹ সম্পাদনা করুন</button><button type="button" disabled={busy} className="btn flex-1 !py-4 text-lg" onClick={submit}>{busy?'পাঠানো হচ্ছে…':'✨ প্রকাশ করুন'}</button></div></div>}
 </>)}
 </main></Shell>}
