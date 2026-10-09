import Link from 'next/link'; import {Shell, SectionTitle} from '@/components/ui'; import {loadBoalkhaliDb, resolvePlaces, VPlace} from '@/lib/placeView'; import {MapPin, Navigation, ExternalLink, ArrowRight} from 'lucide-react'; export const dynamic='force-dynamic';
export const metadata = {title: 'বোয়ালখালীকে জানুন — বোয়ালখালী কানেক্ট', description: 'কর্ণফুলীর তীরে বোয়ালখালী: এক নজরে উপজেলা, দর্শনীয় স্থান, কাছাকাছি ঘোরার জায়গা, যাতায়াত, হাট-বাজার, শিক্ষা-স্বাস্থ্য, ইতিহাস ও বিখ্যাত ব্যক্তি — যাচাইকৃত তথ্যে।'};
/* Verified local content pack: every fact is compiled from public-source research
   (~/workspace/boalkhali_research/ 01–04); items the sources marked uncertain are
   deliberately EXCLUDED. No invented phones, fares, haat days or opening hours. */
const STATS: [string, string, string][] = [
 ['📍', 'জেলা', 'চট্টগ্রাম'],
 ['🏘️', 'প্রশাসনিক কাঠামো', '১টি পৌরসভা + ৯টি ইউনিয়ন'],
 ['🌊', 'প্রধান নদী', 'কর্ণফুলী'],
 ['📐', 'আয়তন', '১২৬.৪৬ বর্গকিমি'],
 ['👥', 'জনসংখ্যা (আদমশুমারি ২০২২)', '২,৫৮,৬৮৮'],
 ['🎓', 'সাক্ষরতা ৭+ (২০২২)', '৮৩.৪৫%'],
];
const UNIONS = ['কধুরখীল', 'পশ্চিম গোমদণ্ডী', 'শাকপুরা', 'সারোয়াতলী', 'পোপাদিয়া', 'চরণদ্বীপ', 'শ্রীপুর খরণদ্বীপ', 'আমুচিয়া', 'আহলা করলডেঙ্গা', 'বোয়ালখালী পৌরসভা'];
const TRANSPORT: [string, string][] = [
 ['🚌', 'প্রধান রুট: চট্টগ্রাম শহরের বহদ্দারহাট বাস টার্মিনাল থেকে বাস/CNG/টেম্পুতে কালুরঘাট সেতু হয়ে বোয়ালখালী — জেলা সদর থেকে প্রায় ১২ কিমি পূর্বে।'],
 ['🌉', 'কালুরঘাট সেতু: ১৯৩০ সালে উদ্বোধন হওয়া রেল-কাম-সড়ক সেতুই বোয়ালখালী–শহরের মূল সংযোগ; একলেনের হওয়ায় পারাপারে অপেক্ষা স্বাভাবিক, ট্রেন এলে সড়ক যান চলাচল বন্ধ থাকে।'],
 ['🚕', 'CNG অটোরিকশা: শহরের কাপ্তাই রাস্তার মাথা ও কালুরঘাট পয়েন্ট থেকে বোয়ালখালীমুখী সিএনজি পাওয়া যায়; উপজেলার ভেতরে কালুরঘাট–ফুলতল, শাকপুরা, সি-অফিস, জোটপুকুর, কানুনগোপাড়া, দাশেরদীঘি ও বেঙ্গুরাসহ একাধিক স্টেশন আছে।'],
 ['🚂', 'ট্রেন: চট্টগ্রাম–দোহাজারী লাইনের বেঙ্গুরা স্টেশন ব্যবহার করে আহলা করলডেঙ্গা এলাকায় পৌঁছানো যায়।'],
];
const HAATS: [string, string][] = [
 ['কালুরঘাট বাজার', 'পশ্চিম গোমদণ্ডী'], ['জমাদার হাট', 'পশ্চিম গোমদণ্ডী'], ['ফুলতল বাজার', 'পশ্চিম গোমদণ্ডী'], ['চৌধুরী হাট', 'কধুরখীল'], ['কানুনগোপাড়া বাজার', 'সদর এলাকা'], ['কানুনগোপাড়া মাস্টার বাজার', 'সদর এলাকা'], ['শাকপুরা চৌমুহনী বাজার', 'শাকপুরা'], ['জোটপুকুর বাজার', 'সারোয়াতলী'],
];
const HISTORY: [string, string, string][] = [
 ['📜', 'নামের কথা', 'প্রচলিত মত হলো, নামটি হযরত বু-আলী কালান্দর শাহ (রহ.)-এর নাম থেকে এসেছে — এটি লোকঐতিহ্য হিসেবে প্রচলিত, প্রমাণিত ব্যুৎপত্তি নয়। তাঁর মাজার আজও করলডেঙ্গায় রয়েছে।'],
 ['🏛️', 'প্রশাসনিক যাত্রা', '১৯১০ সালে বোয়ালখালী থানা গঠিত হয় এবং ১৯৮৩ সালের ৩ জুলাই উপজেলায় রূপান্তরিত হয়। বোয়ালখালী পৌরসভা গঠিত হয় অক্টোবর ২০১২ সালে।'],
 ['🎖️', 'মুক্তিযুদ্ধ', '১৯৭১ সালে কালুরঘাট, কানুনগোপাড়া, ফকিরনী দীঘির পাড়সহ উপজেলার নানা স্থানে সম্মুখ সমর হয়; স্মৃতিচিহ্ন হিসেবে কলেজ সংলগ্ন শহীদ স্মৃতিস্তম্ভ রয়েছে।'],
 ['🏺', 'প্রাচীন নিদর্শন', 'বাংলাপিডিয়ার তালিকায় বোয়ালখালীর ঐতিহ্যের মধ্যে আছে শ্রীপুর বুড়া মসজিদ, দেওয়ান ভিটা (আনুমানিক ১৭১১), করলডেঙ্গায় বু-আলী কালান্দরের মাজার, কালাচাঁদ ঠাকুরবাড়ি, লালার দীঘি, কানুনগোপাড়া শ্যামরায় মন্দির ও মেধস মুনির আশ্রম।'],
];
const PERSONS: [string, string][] = [
 ['কল্পনা দত্ত (১৯১৩)', 'শ্রীপুর গ্রামে জন্ম; মাস্টারদা সূর্য সেনের ইন্ডিয়ান রিপাবলিকান আর্মির সদস্য বিপ্লবী নেত্রী।'],
 ['বিনোদ বিহারী চৌধুরী (১৯১১)', 'উত্তর ভূর্ষি গ্রামে জন্ম; সূর্য সেনের সহকর্মী ও স্বাধীনতা পুরস্কারপ্রাপ্ত শিক্ষাবিদ।'],
 ['রমেশ শীল (১৮৭৭)', 'পূর্ব গোমদণ্ডীতে জন্ম; বাংলা কবিগানের রূপকার ও একুশে পদকপ্রাপ্ত কবিয়াল।'],
 ['বিনয় বাঁশী জলদাস (১৯১১)', 'পূর্ব গোমদণ্ডীতে জন্ম; কিংবদন্তি ঢোলবাদক, একুশে পদক (২০০১) প্রাপ্ত।'],
 ['শেফালী ঘোষ (১৯৪১)', 'কানুনগোপাড়ায় জন্ম; চট্টগ্রামের আঞ্চলিক গানকে আন্তর্জাতিক পর্যায়ে পৌঁছে দেওয়া কণ্ঠশিল্পী।'],
 ['রমা চৌধুরী (১৯৪১)', 'পোপাদিয়া গ্রামে জন্ম; ‘একাত্তরের জননী’ গ্রন্থের লেখিকা।'],
 ['কবরী (১৯৫০)', 'বোয়ালখালীতে জন্ম; ‘সুতরাং’ দিয়ে শুরু করা কিংবদন্তি চলচ্চিত্র অভিনেত্রী।'],
 ['আব্দুল ওয়াহেদ বাঙ্গালী (১৮৫০)', 'খরণদ্বীপে জন্ম; ইসলামি পণ্ডিত ও সমাজ সংস্কারক, হাটহাজারী মাদরাসা প্রতিষ্ঠায় ভূমিকা রাখেন।'],
];
const GROUPS: {name: string; desc: string; url: string; icon: string}[] = [
 {name: 'Voice of Boalkhali (VoB)', desc: 'ফেসবুক কমিউনিটি গ্রুপ — সদস্য প্রায় ৫৮,০০০ (ফেসবুক অনুযায়ী)', url: 'https://facebook.com/groups/245852146611019/', icon: '📘'},
 {name: 'বোয়ালখালী নিউজ Boalkhali News', desc: 'ফেসবুক সংবাদ গ্রুপ — সদস্য প্রায় ২৯,০০০ (ফেসবুক অনুযায়ী)', url: 'https://facebook.com/groups/443387390818731/', icon: '📰'},
 {name: 'Channel Boalkhali', desc: 'বোয়ালখালী-কেন্দ্রিক একমাত্র ডেডিকেটেড স্থানীয় নিউজ চ্যানেল', url: 'https://channelboalkhali.tv', icon: '📺'},
];
const CAP = 'প্রতীকী ছবি (ইলাস্ট্রেশন)';
function PlaceCard({p}: {p: VPlace}) {
 const t = p.images[0];
 return <Link href={'/boalkhali/' + p.slug} className="card lift press !p-0 block overflow-hidden">
  {t ? <figure className="relative">
   <img src={t.url} alt={p.name} loading="lazy" className="aspect-[16/9] w-full object-cover"/>
   <span className={'chip absolute left-2 top-2 shadow ' + (p.inside ? 'bg-brand-600 text-white' : 'bg-amber-400 text-amber-950')}>{p.inside ? 'বোয়ালখালীর ভিতরে' : 'বোয়ালখালীর কাছাকাছি'}</span>
  </figure> : <div className="relative grid aspect-[16/9] w-full place-items-center bg-brand-50 text-4xl">📍<span className={'chip absolute left-2 top-2 shadow ' + (p.inside ? 'bg-brand-600 text-white' : 'bg-amber-400 text-amber-950')}>{p.inside ? 'বোয়ালখালীর ভিতরে' : 'বোয়ালখালীর কাছাকাছি'}</span></div>}
  {t && <figcaption className="bg-brand-50 px-3 py-1.5 text-[11px] text-brand-800">{t.ill ? 'প্রতীকী ছবি (ইলাস্ট্রেশন)' : (t.caption ? 'ছবি: ' + t.caption : 'আসল ছবি')}</figcaption>}
  <div className="p-4 pt-3">
   <h3 className="font-display font-bold leading-snug">{p.name}</h3>
   <p className="mt-1 flex items-center gap-1 text-xs font-bold text-brand-700"><MapPin size={12} className="shrink-0"/>{p.area}</p>
   <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.short}</p>
   <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700">বিস্তারিত ও ম্যাপ দেখুন <ArrowRight size={14}/></p>
  </div>
 </Link>;
}
export default async function BoalkhaliPage() {
 // CMS-driven: PUBLISHED 'place' contents (admin-editable); lib/places.ts only fills in
 // while the CMS places seed has never run, so the page can never come up empty.
 const ALL_PLACES = resolvePlaces(await loadBoalkhaliDb());
 const INSIDE_PLACES = ALL_PLACES.filter((p) => p.inside);
 const NEARBY_PLACES = ALL_PLACES.filter((p) => !p.inside);
 return <Shell><main className="mx-auto max-w-6xl space-y-8 p-3 md:p-4">
  {/* (a) HERO */}
  <section className="relative overflow-hidden rounded-[28px] text-white shadow-elev-2">
   <img src="/api/img/visit/hero" alt="কর্ণফুলী নদী, সাম্পান ও কালুরঘাট সেতু — বোয়ালখালী" className="absolute inset-0 h-full w-full object-cover"/>
   <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/35 to-transparent"/>
   <div className="relative flex min-h-[320px] flex-col justify-end p-5 md:min-h-[380px] md:p-8">
    <p className="chip w-fit border border-white/25 bg-white/15 text-white backdrop-blur">📍 বোয়ালখালী, চট্টগ্রাম</p>
    <h1 className="font-display mt-3 text-3xl font-black leading-tight md:text-5xl">বোয়ালখালীকে জানুন</h1>
    <p className="mt-2 max-w-2xl text-sm text-emerald-50/95 md:text-base">কর্ণফুলীর তীরে, করলডেঙ্গা পাহাড়ের কোলে — বোয়ালখালীর মানুষ, প্রকৃতি, ঐতিহ্য আর ঘোরার জায়গা, যাচাইকৃত তথ্যে এক পেজে।</p>
    <p className="mt-3 text-[11px] text-white/60">{CAP} — কর্ণফুলী নদী ও কালুরঘাট সেতু</p>
   </div>
  </section>
    <nav aria-label="পেজের ভিতরের নেভিগেশন" className="sticky top-[57px] z-30 -mx-1 rounded-2xl border border-[var(--line)] bg-white/95 px-2 py-2 shadow-elev-1 backdrop-blur md:top-16">
   <div className="flex gap-1.5 overflow-x-auto text-[13px] font-bold">
    <a href="#darshoniyo" className="chip shrink-0 bg-brand-600 text-white">দর্শনীয় স্থান</a>
    <a href="#kacha" className="chip shrink-0 bg-brand-50 text-brand-800">কাছাকাছি</a>
    <a href="#jatayat" className="chip shrink-0 bg-brand-50 text-brand-800">কীভাবে যাবেন</a>
    <a href="#haat" className="chip shrink-0 bg-brand-50 text-brand-800">হাট-বাজার</a>
    <a href="#itihas" className="chip shrink-0 bg-brand-50 text-brand-800">ইতিহাস</a>
    <a href="#community" className="chip shrink-0 bg-brand-50 text-brand-800">কমিউনিটি</a>
   </div>
  </nav>
{/* (b) এক নজরে */}
  <section>
   <SectionTitle title="এক নজরে বোয়ালখালী" sub="সরকারি ও পাবলিক সূত্রে যাচাইকৃত তথ্য"/>
   <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
    {STATS.map(([ic, k, v]) => (<div key={k} className="card lift !p-4"><span className="text-2xl" aria-hidden="true">{ic}</span><p className="mt-1 text-[11px] font-bold text-gray-400">{k}</p><p className="font-display font-bold leading-snug">{v}</p></div>))}
   </div>
   <div className="card mt-3 !p-4"><p className="text-xs font-bold text-gray-400">এলাকাসমূহ</p><div className="mt-2 flex flex-wrap gap-1.5">{UNIONS.map((u) => (<span key={u} className="chip bg-brand-50 text-brand-800">{u}</span>))}</div></div>
  </section>
  {/* (c) পর্যটন — ভিতরে */}
  <section id="darshoniyo" className="scroll-mt-32">
   <SectionTitle title="🏞️ পর্যটন ও দর্শনীয় স্থান" sub="বোয়ালখালীর ভিতরের যাচাইকৃত গন্তব্য"/>
   <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{INSIDE_PLACES.map((p) => (<PlaceCard key={p.slug} p={p}/>))}</div>
  </section>
  {/* (d) কাছাকাছি */}
  <section id="kacha" className="scroll-mt-32">
   <SectionTitle title="🧭 কাছাকাছি ঘোরার জায়গা" sub="বোয়ালখালীর পাশে — একদিনের ভ্রমণে ঘুরে আসা যায়"/>
   <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{NEARBY_PLACES.map((p) => (<PlaceCard key={p.slug} p={p}/>))}</div>
  </section>
  {/* (e) কীভাবে যাবেন */}
  <section id="jatayat" className="scroll-mt-32">
   <SectionTitle title="🚌 কীভাবে যাবেন" sub="চট্টগ্রাম শহর থেকে বোয়ালখালী"/>
   <div className="mt-3 grid gap-3 md:grid-cols-2">
    {TRANSPORT.map(([ic, t]) => (<div key={t.slice(0, 24)} className="card lift flex gap-3 !p-4"><span className="text-2xl shrink-0" aria-hidden="true">{ic}</span><p className="text-sm leading-relaxed text-gray-700">{t}</p></div>))}
   </div>
  </section>
  {/* (f) হাট-বাজার */}
  <section id="haat" className="scroll-mt-32">
   <SectionTitle title="🧺 হাট-বাজার" sub="উপজেলার পরিচিত বাজারগুলো"/>
   <figure className="card mt-3 !p-0 overflow-hidden"><img src="/api/img/visit/haat" alt="বোয়ালখালীর হাট-বাজার" loading="lazy" className="aspect-[21/9] w-full object-cover"/><figcaption className="bg-brand-50 px-3 py-1.5 text-[11px] text-brand-800">{CAP} — গ্রামীণ হাট-বাজার</figcaption></figure>
   <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
    {HAATS.map(([n, a]) => (<div key={n} className="card lift !p-3.5"><p className="font-display font-bold leading-snug">{n}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} className="shrink-0"/>{a}</p></div>))}
   </div>
   <p className="mt-2 text-xs text-gray-400">সূত্র অনুযায়ী উপজেলায় মোট ১৭টি হাট-বাজার রয়েছে; হাটবারের দিন নির্ভরযোগ্য সূত্রে যাচাই করা যায়নি, তাই এখানে দেওয়া হয়নি।</p>
  </section>
  {/* (g) শিক্ষা ও সেবা */}
  <section>
   <SectionTitle title="🎓 শিক্ষা ও সেবা (সারাংশ)" sub="প্রকাশিত সূত্র থেকে সংকলিত"/>
   <div className="mt-3 grid gap-3 md:grid-cols-3">
    <div className="card lift !p-4"><p className="font-display font-bold">🎓 শিক্ষা</p><p className="mt-1.5 text-sm leading-relaxed text-gray-600">সূত্র অনুযায়ী উপজেলায় ১টি সরকারি কলেজ, ৩টি বেসরকারি ডিগ্রি ও উচ্চ মাধ্যমিক কলেজ, ৩০টি মাধ্যমিক বিদ্যালয় ও ১৮টির বেশি মাদরাসা রয়েছে। প্রধান প্রতিষ্ঠান: স্যার আশুতোষ সরকারি কলেজ (কানুনগোপাড়া, প্রতিষ্ঠা ১৯৩৯), বোয়ালখালী সিরাজুল ইসলাম ডিগ্রি কলেজ, কধুরখীল সরকারি উচ্চ বিদ্যালয় ও শাকপুরা দারুচ্ছুন্নাত কামিল মাদরাসা।</p></div>
    <div className="card lift !p-4"><p className="font-display font-bold">🏥 স্বাস্থ্য</p><p className="mt-1.5 text-sm leading-relaxed text-gray-600">বোয়ালখালী উপজেলা স্বাস্থ্য কমপ্লেক্স — সদরে অবস্থিত ৫০ শয্যার সরকারি হাসপাতাল। এছাড়া সূত্র অনুযায়ী ৬টি ইউনিয়ন স্বাস্থ্য কেন্দ্র ও ৯টি পরিবার কল্যাণ কেন্দ্র (FWC) রয়েছে।</p><Link href="/doctors" className="btn mt-3 !py-2 text-sm">ডাক্তার ডিরেক্টরি দেখুন →</Link></div>
    <div className="card lift !p-4"><p className="font-display font-bold">🏦 ব্যাংকিং</p><p className="mt-1.5 text-sm leading-relaxed text-gray-600">গোমদণ্ডী, কানুনগোপাড়া ও চৌধুরীহাট এলাকায় সোনালী, অগ্রণী, ইসলামী, এবি ও ওয়ান ব্যাংকসহ অন্তত ১১টি ব্যাংক শাখা এবং ডাচ-বাংলাসহ একাধিক ATM বুথ রয়েছে।</p></div>
   </div>
   <p className="mt-2 text-xs text-gray-400">উপরের তালিকা প্রকাশিত সূত্র থেকে সংকলিত; প্রতিটি প্রতিষ্ঠানের হালনাগাদ তথ্য (সময়সূচি ও সেবা) যাচাই চলছে। জরুরি প্রয়োজনে <Link href="/emergency" className="font-bold text-brand-700 underline">জরুরি সেবা</Link> পেজ দেখুন।</p>
  </section>
  {/* (h) ইতিহাস ও বিখ্যাত ব্যক্তি */}
  <section id="itihas" className="scroll-mt-32">
   <SectionTitle title="📜 ইতিহাস ও ঐতিহ্য" sub="বোয়ালখালীর গল্প"/>
   <div className="mt-3 grid gap-3 md:grid-cols-2">
    {HISTORY.map(([ic, h, t]) => (<div key={h} className="card lift !p-4"><p className="font-display font-bold"><span aria-hidden="true">{ic}</span> {h}</p><p className="mt-1.5 text-sm leading-relaxed text-gray-600">{t}</p></div>))}
   </div>
   <h3 className="font-display mt-5 text-base font-bold">বোয়ালখালীর গর্ব — বিখ্যাত ব্যক্তি</h3>
   <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {PERSONS.map(([n, d]) => (<div key={n} className="card lift !p-3.5"><p className="font-display text-sm font-bold leading-snug">{n}</p><p className="mt-1 text-xs leading-relaxed text-gray-500">{d}</p></div>))}
   </div>
  </section>
  {/* (i) কমিউনিটি */}
  <section id="community" className="scroll-mt-32">
   <SectionTitle title="💬 কমিউনিটি" sub="অনলাইনে বোয়ালখালীর মানুষ"/>
   <div className="mt-3 grid gap-3 md:grid-cols-3">
    {GROUPS.map((g) => (<a key={g.name} href={g.url} target="_blank" rel="noopener noreferrer" className="card lift press block !p-4"><div className="flex items-start justify-between gap-2"><span className="text-3xl" aria-hidden="true">{g.icon}</span><ExternalLink size={14} className="shrink-0 text-gray-300"/></div><p className="font-display mt-2 font-bold leading-snug">{g.name}</p><p className="mt-1 text-xs leading-relaxed text-gray-500">{g.desc}</p></a>))}
   </div>
   <div className="card mt-3 !p-4">
    <p className="text-sm leading-relaxed text-gray-600">এসব গ্রুপে স্থানীয়রা সবচেয়ে বেশি খোঁজেন <b>রক্তদাতা</b>, <b>ডাক্তারের তথ্য</b> আর <b>বাসা ভাড়া</b> — সেগুলো এখন বোয়ালখালী কানেক্টেই পাবেন, খুঁজে পাওয়া সহজভাবে সাজানো।</p>
    <div className="mt-3 flex flex-wrap gap-2">
     <Link href="/blood" className="chip bg-red-50 font-bold text-red-700">🩸 রক্তদাতা খুঁজুন</Link>
     <Link href="/doctors" className="chip bg-brand-50 font-bold text-brand-800">🩺 ডাক্তার ডিরেক্টরি</Link>
     <Link href="/category/house" className="chip bg-brand-50 font-bold text-brand-800">🏠 বাসা ভাড়া</Link>
     <Link href="/emergency" className="chip bg-red-50 font-bold text-red-700">🚨 জরুরি সেবা</Link>
    </div>
   </div>
  </section>
  <p className="text-center text-[11px] text-gray-400">তথ্যসূত্র: উইকিপিডিয়া, বাংলাপিডিয়া, পৌরসভা পর্যটন পেজ ও জাতীয়/আঞ্চলিক সংবাদমাধ্যমের পাবলিক প্রতিবেদন (যাচাই: অক্টোবর ২০২৬)। কোনো তথ্য ভুল মনে হলে <Link href="/complaint" className="font-bold text-brand-700 underline">জানান</Link> — যাচাই করে ঠিক করা হবে।</p>
 </main></Shell>;
}
