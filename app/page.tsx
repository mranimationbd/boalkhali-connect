import Link from 'next/link'; import {readDBAsync} from '@/lib/db'; import {currentUser} from '@/lib/auth'; import {Shell,bn,PostCard,SectionTitle,EmptyState} from '@/components/ui'; import {catIcon,catEmoji} from '@/lib/catIcons'; import {VISIT_IMG_HERO} from '@/lib/visitImgHero'; import {Phone,Search,Plus,Grid3X3,Siren,Droplets,ClipboardList} from 'lucide-react';
export const dynamic='force-dynamic';
async function Weather(){ try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=22.382&longitude=91.921&current=temperature_2m,relative_humidity_2m,wind_speed_10m,visibility,weather_code&timezone=Asia%2FDhaka',{next:{revalidate:600}}); const j=await r.json(); const c=j.current; return <div className="card !bg-[#0b2e35] text-white"><div className="flex justify-between"><b>🌍 বোয়ালখালী আবহাওয়া ● লাইভ</b><span className="text-yellow-300 text-xs">আপডেট: {new Date(c.time).toLocaleTimeString('bn-BD')}</span></div><div className="text-5xl font-black my-3">{bn(Math.round(c.temperature_2m))}°<span className="text-yellow-400 text-2xl">C</span></div><p>আংশিক মেঘলা • অনুভূত: {bn(Math.round(c.temperature_2m))}°C</p><div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm"><div className="bg-white/10 rounded-xl p-2">আর্দ্রতা<br/><b className="text-yellow-300">{bn(c.relative_humidity_2m)}%</b></div><div className="bg-white/10 rounded-xl p-2">বাতাস<br/><b className="text-yellow-300">{bn(c.wind_speed_10m)} কিমি</b></div><div className="bg-white/10 rounded-xl p-2">দৃশ্যমানতা<br/><b className="text-yellow-300">{bn(Math.round((c.visibility||8000)/1000))} কিমি</b></div></div><p className="text-[10px] opacity-60 mt-2">আবহাওয়া: Open-Meteo</p></div>}catch{return <div className="card">আবহাওয়া লোড হচ্ছে না — API unavailable</div>} }
export default async function Home(){ const db=await readDBAsync(); const u=await currentUser(); const cats=db.categories.filter((c:any)=>c.enabled); const postsAll=db.posts.filter((p:any)=>p.status==='APPROVED'); const countOf:any={}; postsAll.forEach((p:any)=>{countOf[p.categorySlug]=(countOf[p.categorySlug]||0)+1}); const donors=(db.blood_donors||[]).filter((d:any)=>d.available!==false).length; const bloodReqs=(db.blood_requests||[]).filter((b:any)=>b.status==='OPEN'||b.status==='ACTIVE'); const blood=bloodReqs[0]; const alerts=(db.emergency_alerts||[]).filter((e:any)=>e.active); const anns=(db.announcements||[]).filter((a:any)=>a.active!==false).sort((a:any,b:any)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))); const ad=(db.advertisements||[]).find((a:any)=>a.status!=='HIDDEN'); const featured=postsAll.filter((p:any)=>p.promoted).slice(0,4); const latest=postsAll.slice(0,6); const ranked=[...cats].sort((a:any,b:any)=>(countOf[b.slug]||0)-(countOf[a.slug]||0)); const catNameOf:any=Object.fromEntries(cats.map((c:any)=>[c.slug,c.name])); const catColorOf:any=Object.fromEntries(cats.map((c:any)=>[c.slug,c.color]));
 return <Shell><main className="max-w-7xl mx-auto p-3 space-y-6">
 {/* 1-2. HERO + UNIVERSAL SEARCH */}
 <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 text-white p-5 md:p-8">
  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"/>
  <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"/>
  <div className="relative">
   <div className="flex flex-wrap items-center justify-between gap-2">
    <p className="text-emerald-100 text-sm">📍 বোয়ালখালী, চট্টগ্রাম</p>
    {u?<p className="chip bg-white/15 text-white border border-white/20">👋 স্বাগতম, {u.name}</p>:<Link href="/login" className="chip bg-white/15 text-white border border-white/20">লগইন / রেজিস্টার</Link>}
   </div>
   <h1 className="font-display text-3xl md:text-5xl font-black leading-tight mt-4">বোয়ালখালীর সবকিছু,<br/>এখন এক জায়গায়।</h1>
   <p className="text-emerald-100 mt-2 md:text-lg">সেবা খুঁজুন • ব্যবসা খুঁজুন • সাহায্য নিন • তথ্য শেয়ার করুন</p>
   {/* KNOW BOALKHALI — হিরোর একদম উপরে (ব্যবহারকারীর অনুরোধে মাঝের CTA কার্ড এখানে সরানো হয়েছে) */}
   <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-white/25 bg-white/10 p-3 backdrop-blur sm:flex-row sm:items-center">
    <Link href="/boalkhali" className="shrink-0"><img src={VISIT_IMG_HERO} alt="কর্ণফুলীর তীরে বোয়ালখালীর প্রাকৃতিক দৃশ্য (প্রতীকী ছবি)" loading="lazy" className="h-28 w-full rounded-2xl object-cover sm:h-20 sm:w-36"/></Link>
    <div className="min-w-0 flex-1">
     <div className="flex flex-wrap items-center gap-2"><Link href="/boalkhali" className="font-display text-base font-bold leading-snug md:text-lg">বোয়ালখালীকে জানুন</Link><span className="chip bg-yellow-400 font-bold text-black">গাইড</span></div>
     <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/90 md:text-sm">কর্ণফুলীর তীরে আমাদের উপজেলা — দর্শনীয় স্থান, হাট-বাজার, ইতিহাস ও বিশিষ্ট ব্যক্তিত্ব, যাচাইকৃত তথ্যে</p>
     <div className="mt-2 flex flex-wrap gap-1.5">
      <Link href="/boalkhali#darshoniyo" className="chip border border-white/30 bg-white/10 text-white transition hover:bg-white/20">🏞️ দর্শনীয় স্থানসমূহ</Link>
      <Link href="/boalkhali#haat" className="chip border border-white/30 bg-white/10 text-white transition hover:bg-white/20">🧺 হাট-বাজার</Link>
      <Link href="/boalkhali#itihas" className="chip border border-white/30 bg-white/10 text-white transition hover:bg-white/20">📜 ইতিহাস ও বিশিষ্ট ব্যক্তিত্ব</Link>
     </div>
    </div>
    <Link href="/boalkhali" className="btn shrink-0 !bg-white !text-emerald-800">বোয়ালখালীকে জানুন →</Link>
   </div>
   <form action="/search" className="mt-5 flex max-w-2xl items-center rounded-full bg-white p-1.5 shadow-elev-2">
    <Search className="ml-3 shrink-0 text-emerald-700"/>
    <input name="q" placeholder="আপনি কী খুঁজছেন?" aria-label="খুঁজুন" className="!border-0 !bg-transparent text-[var(--ink)] placeholder:text-gray-400"/>
    <button className="btn !rounded-full shrink-0">খুঁজুন</button>
   </form>
   <div className="mt-3 flex flex-wrap items-center gap-2">
    <span className="text-emerald-100/80 text-xs">জনপ্রিয়:</span>
    <Link href="/category/doctor" className="chip border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20">🩺 ডাক্তার খুঁজুন</Link>
    <Link href="/category/house" className="chip border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20">🏠 বাসা ভাড়া</Link>
    <Link href="/blood" className="chip border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20">🩸 রক্তদাতা</Link>
    <Link href="/category/jobs" className="chip border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20">💼 চাকরি</Link>
   </div>
   <p className="mt-4 text-xs text-emerald-100/90 num">{bn(postsAll.length)}টি লাইভ পোস্ট • {bn(donors)} জন রক্তদাতা প্রস্তুত • {bn(cats.length)}টি ক্যাটাগরি</p>
  </div>
 </section>
 {/* 3. QUICK ACTIONS */}
 <section>
  <SectionTitle title="⚡ দ্রুত সেবা" sub="এক ক্লিকেই জরুরি কাজ"/>
  <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-5">
   <Link href="/create" className="card lift press flex flex-col items-center gap-2 !p-4 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-800 text-white"><Plus size={24}/></span><b className="text-sm">পোস্ট করুন</b></Link>
   <Link href="/blood" className="card lift press flex flex-col items-center gap-2 !p-4 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-2xl"><Droplets className="text-red-600" size={24}/></span><b className="text-sm">রক্তের প্রয়োজন</b></Link>
   <Link href="/emergency" className="card lift press flex flex-col items-center gap-2 !p-4 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50"><Siren className="text-red-600" size={24}/></span><b className="text-sm">জরুরি সাহায্য</b></Link>
   <Link href="/categories" className="card lift press flex flex-col items-center gap-2 !p-4 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50"><Grid3X3 className="text-brand-700" size={24}/></span><b className="text-sm">সব ক্যাটাগরি</b></Link>
   <Link href="/complaint" className="card lift press flex flex-col items-center gap-2 !p-4 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50"><ClipboardList className="text-brand-700" size={24}/></span><b className="text-sm">অভিযোগ জানান</b></Link>
  </div>
 </section>
 {/* 4. POPULAR CATEGORIES — BENTO */}
 <section>
  <SectionTitle title="মূল ক্যাটাগরিসমূহ" sub="ক্লিক করে বিস্তারিত দেখুন" href="/categories" linkLabel="সব দেখুন ›"/>
  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
   {ranked.map((c:any,i:number)=>{const color=c.color||'#0a7a54'; const metric=c.slug==='blood'?(donors>0?bn(donors)+' জন দাতা প্রস্তুত':''):(countOf[c.slug]?bn(countOf[c.slug])+'টি পোস্ট':''); const feat=i<2; return <Link key={c.slug} href={`/category/${c.slug}`} className={`card lift press !p-4 ${feat?'col-span-2':''}`}>
    <div className={`flex ${feat?'items-center gap-4 text-left':'flex-col items-center gap-2 text-center'}`}>
     <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl md:h-16 md:w-16" style={{background:color+'1f'}}>{catIcon(c.slug)?<img src={catIcon(c.slug)} alt={c.name} className="h-11 w-11 object-contain md:h-12 md:w-12"/>:<span className="text-3xl">{catEmoji(c.slug)}</span>}</div>
     <div><p className={`font-bold ${feat?'text-base':'text-sm'}`}>{c.name}</p>{metric&&<p className="num mt-0.5 text-[11px] font-bold" style={{color}}>{metric}</p>}</div>
    </div>
   </Link>})}
  </div>
 </section>
 {/* 5. LIVE BOALKHALI */}
 <section className="card !p-0 overflow-hidden">
  <div className="flex items-center gap-2 px-4 pt-4">
   <span aria-hidden="true" className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60"/><span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"/></span>
   <h3 className="font-display text-lg font-bold">LIVE BOALKHALI</h3><span className="text-[11px] text-gray-400">এই মুহূর্তের আপডেট</span>
  </div>
  <div className="grid gap-3 p-4 md:grid-cols-2">
   {blood&&<div className="flex gap-3 rounded-2xl bg-red-600 p-4 text-white shadow"><span className="text-3xl">💧</span><div className="flex-1"><span className="chip bg-white text-red-600">জরুরি রক্ত প্রয়োজন</span> <span className="chip bg-red-800 text-white">{blood.bloodGroup}</span><p className="mt-1 font-bold">রোগী: {blood.patient} ({blood.location})</p>{bloodReqs.length>1&&<Link href="/blood" className="text-xs font-bold underline">আরও {bn(bloodReqs.length-1)}টি আবেদন দেখুন →</Link>}</div><a href={`tel:${blood.contact}`} aria-label="কল করুন" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-red-600"><Phone/></a></div>}
   {alerts.map((e:any)=>(<Link key={e.id} href="/emergency" className="card press block border-red-200 !bg-red-50"><span className="chip bg-red-600 text-white">⚠️ জরুরি সতর্কতা</span><p className="mt-2 font-bold">{e.title}</p><p className="text-sm text-gray-600">{e.body}</p><p className="mt-1 text-xs font-bold text-red-700">জরুরি সেবা দেখুন →</p></Link>))}
   {anns[0]&&<div className="rounded-2xl border border-[var(--line)] bg-brand-50 p-4"><span className="chip bg-brand-800 text-white">📢 ঘোষণা</span><p className="mt-2 font-bold">{anns[0].title}</p><p className="text-sm text-gray-600">{anns[0].body}</p></div>}
   <div className="[&_.card]:h-full"><Weather/></div>
  </div>
 </section>
 {/* SPONSORED (existing advertisements[0] feature) */}
 {ad&&<div className="card !bg-emerald-900 text-white"><span className="chip bg-yellow-400 font-bold text-black">স্পনসরড</span><h3 className="mt-2 text-lg font-black">{ad.title}</h3><p className="text-sm opacity-80">{ad.body}</p><Link href="/restaurants" className="btn !bg-white !text-emerald-900 mt-3">বিস্তারিত দেখুন →</Link></div>}
 {/* FEATURED */}
 {featured.length>0&&<section><SectionTitle title="⭐ ফিচার্ড পোস্ট" sub="স্পনসরড ও নির্বাচিত পোস্টসমূহ" href="/search" linkLabel="সব দেখুন ›"/><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{featured.map((p:any)=>(<PostCard key={p.id} p={p} catName={catNameOf[p.categorySlug]} catColor={catColorOf[p.categorySlug]}/>))}</div></section>}
 {/* 6. MARKETPLACE PREVIEW */}
 <section>
  <SectionTitle title="🛍️ বোয়ালখালী শহরের পোস্টসমূহ" sub="শহরের সর্বশেষ বাসা ভাড়া, কেনাবেচা ও জরুরি আপডেট" href="/search" linkLabel="সব দেখুন ›"/>
  <div className="my-3 flex gap-2"><Link href="/search?sort=new" className="btn !py-2">🕐 নতুন পোস্ট</Link><Link href="/search" className="chip border">🔥 জনপ্রিয়</Link></div>
  {latest.length>0?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{latest.map((p:any)=>(<PostCard key={p.id} p={p} catName={catNameOf[p.categorySlug]} catColor={catColorOf[p.categorySlug]}/>))}</div>:<EmptyState icon="📭" title="এখনো কোনো পোস্ট পাওয়া যায়নি" desc="প্রথম পোস্টটি আপনিই দিন — শহরের সবাই দেখবে।" href="/create" cta="পোস্ট করুন"/>}
 </section>
 {/* RESTAURANTS (existing directory strip) */}
 <section className="card !bg-orange-50">
  <SectionTitle title="🍴 রেস্টুরেন্ট ও খাবার" sub="বোয়ালখালীর স্পেশাল স্বাদ" href="/restaurants" linkLabel="সব দেখুন →"/>
  <div className="mt-3 grid gap-3 md:grid-cols-2">{db.restaurants.map((r:any)=>(<Link key={r.id} href="/restaurants" className="block overflow-hidden rounded-2xl bg-white shadow press">{r.image?<img src={r.image} alt={r.name} loading="lazy" className="h-32 w-full object-cover"/>:<div className="grid h-32 w-full place-items-center bg-orange-100 text-4xl">🍽️</div>}<div className="p-3"><span className="chip bg-orange-100 text-orange-700">{r.category}</span> <span className="chip bg-emerald-100">{r.price}</span><p className="font-bold">{r.name}</p><p className="text-xs text-gray-500">📍 {r.location}</p></div></Link>))}</div>
 </section>
 {/* 7. CTA BAND */}
 <section className="items-center justify-between gap-4 rounded-[28px] bg-gradient-to-br from-emerald-800 to-emerald-600 p-5 text-white md:flex md:p-6">
  <div><h3 className="font-display text-xl font-black">আপনার ব্যবসা বা সেবা সবার কাছে পৌঁছে দিন</h3><p className="mt-1 text-sm text-emerald-100">আজই একটি পোস্ট দিন — বোয়ালখালীর ক্রেতা ও গ্রাহকের কাছে পৌঁছান সহজে 🌱</p></div>
  <Link href="/create" className="btn mt-4 shrink-0 !bg-white !text-emerald-800 md:mt-0"><Plus size={18}/> পোস্ট করুন</Link>
 </section>
 </main></Shell> }
