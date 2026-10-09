import Link from 'next/link'; import {Shell, SectionTitle} from '@/components/ui'; import {VISIT_IMAGES} from '@/lib/visitImages'; import {MapPin, Navigation, ExternalLink} from 'lucide-react';
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
const INSIDE: {name: string; area: string; desc: string; go: string; img?: string}[] = [
 {name: 'কর্ণফুলী রিভারভিউ (মুক্তিযোদ্ধা রিভার ভিউ)', area: 'পশ্চিম কধুরখীল', desc: 'কর্ণফুলীর পূর্ব তীরে খোলা ভিউ পয়েন্ট — নদী, সাম্পান আর সূর্যাস্ত দেখার জন্য উপজেলার সবচেয়ে পরিচিত বিকেলের গন্তব্য। পৌরসভার পর্যটন তালিকায় এটি কর্ণফুলী তীরের বিনোদনকেন্দ্র হিসেবে রয়েছে।', go: 'কালুরঘাট সেতু পার হয়ে বোয়ালখালী–কধুরখীল সড়ক ধরে।'},
 {name: 'কালুরঘাট ফেরিঘাট', area: 'পশ্চিম গোমদণ্ডী', desc: 'সেতুর পূর্ব প্রান্তে সক্রিয় নদী-ঘাট — ফেরি, সাম্পান ও নৌকার আসা-যাওয়া কাছ থেকে দেখা যায়। এটি সাজানো পিকনিক স্পট নয়, নদী-যাতায়াতের জীবন্ত অভিজ্ঞতা।', go: 'আরাকান সড়ক ধরে কালুরঘাট; সেতুর পূর্ব প্রান্ত থেকে ঘাট এলাকা।'},
 {name: 'মেধস মুনির আশ্রম', area: 'মধ্যম করলডেঙ্গা', desc: 'করলডেঙ্গা পাহাড়ের চূড়ায় হিন্দু তীর্থস্থান; চত্বরে একাধিক মন্দির, সিঁড়িপথ, সীতার পুকুর ও ঝরনা রয়েছে। স্থানীয় ঐতিহ্য অনুযায়ী এখান থেকে দুর্গাপূজার সূচনা হয়েছিল বলে বিশ্বাস করা হয়।', go: 'বহদ্দারহাট থেকে কানুনগোপাড়া–দাশের দীঘির পাড় হয়ে স্থানীয় সিএনজিতে আশ্রম গেট।'},
 {name: 'বু-আলী কালান্দর শাহ (রহ.) মাজার', area: 'মধ্যম করলডেঙ্গা', desc: 'করলডেঙ্গা পাহাড়ের পাদদেশে উপজেলার অন্যতম পরিচিত সুফি মাজার; বাংলাপিডিয়ার প্রাচীন নিদর্শনের তালিকায় স্থান পেয়েছে।', go: 'বহদ্দারহাট → কালুরঘাট সেতু → কানুনগোপাড়া হয়ে স্থানীয় যানে করলডেঙ্গা।'},
 {name: 'আহলা দরবার শরীফ', area: 'আহলা করলডেঙ্গা', desc: 'করলডেঙ্গা পাহাড়ের পাদদেশে মসজিদ ও মাজারকেন্দ্রিক দরবার শরীফ; বার্ষিক ওরশে দূর-দূরান্ত থেকে মানুষের সমাগম হয়।', go: 'বহদ্দারহাট থেকে বোয়ালখালীগামী বাস/টেম্পুতে; চট্টগ্রাম–দোহাজারী লাইনের বেঙ্গুরা স্টেশনও ব্যবহার করা যায়।'},
 {name: 'শ্রীপুর বুড়া মসজিদ', area: 'শ্রীপুর খরণদ্বীপ', desc: 'ঐতিহ্যবাহী জামে মসজিদ — জনশ্রুতি অনুযায়ী প্রায় তিনশো বছরের পুরনো; ৮৬ ফুট মিনার রয়েছে এবং প্রতি শুক্রবারে বড় জমায়েত হয়।', go: 'বহদ্দারহাট → কানুনগোপাড়া রোড → শ্রীপুর মুন্সির হাট সংলগ্ন এলাকা।'},
 {name: 'কধুরখীল মাটির স্কুলভবন ও পার্বতী চরণ দীঘি', area: 'কধুরখীল', desc: '১৯১৮–১৯২০ সালে স্থানীয় উপকরণে নির্মিত বিশাল মাটির স্কুলভবন ও পাশের দীঘি — টিকে থাকা অন্যতম বড় মৃৎভবন হিসেবে প্রত্নতত্ত্ব অধিদপ্তরের তালিকাভুক্ত।', go: 'উপজেলা সদর থেকে কানুনগোপাড়া–হাওলা ডিসি সড়ক ধরে কধুরখীল।'},
 {name: 'কালাচাঁদ ঠাকুরবাড়ি', area: 'পোপাদিয়া', desc: 'ঐতিহ্যবাহী মন্দিরপ্রাঙ্গণ; বার্ষিক মেলায় প্রচুর পুণ্যার্থী ও দর্শনার্থীর ভিড় হয়।', go: 'উপজেলা সদর থেকে পোপাদিয়া রোড ধরে স্থানীয় যানে।'},
 {name: 'করলডেঙ্গা–জ্যৈষ্ঠপুরা পাহাড়ি বনাঞ্চল', area: 'পূর্ব বোয়ালখালী', desc: 'উপজেলার পূর্বাংশের সবুজ পাহাড়ি বনাঞ্চল ও জ্যৈষ্ঠপুরা পাহাড় — পাহাড়ি ঢালে সারি সারি গাছপালা আর শান্ত প্রকৃতি; প্রকৃতি-ভ্রমণ ও পিকনিকের উপযোগী এলাকা।', go: 'বহদ্দারহাট → কানুনগোপাড়া → স্থানীয় সিএনজি/টেম্পুতে পাহাড়ি এলাকা।', img: 'hill'},
 {name: 'স্যার আশুতোষ কলেজ ও শহীদ স্মৃতিস্তম্ভ', area: 'কানুনগোপাড়া', desc: '১৯৩৯ সালে প্রতিষ্ঠিত উপজেলার প্রাচীন সরকারি কলেজ ক্যাম্পাস; সংলগ্ন স্থানে মুক্তিযুদ্ধের শহীদ স্মৃতিস্তম্ভ রয়েছে।', go: 'বহদ্দারহাট থেকে কানুনগোপাড়াগামী বাস/টেম্পু।'},
];
const NEARBY: {name: string; area: string; desc: string}[] = [
 {name: 'কালুরঘাট স্বাধীন বাংলা বেতার কেন্দ্র', area: 'চান্দগাঁও, চট্টগ্রাম সিটি', desc: '১৯৭১ সালের মার্চে এখান থেকে স্বাধীনতার ঘোষণা প্রচারিত হয় — সেতুর ওপারেই মুক্তিযুদ্ধের অন্যতম গৌরবময় স্মৃতিস্থল।'},
 {name: 'পতেঙ্গা সমুদ্র সৈকত', area: 'চট্টগ্রাম সিটি', desc: 'কর্ণফুলী মোহনার সৈকত — সূর্যাস্ত, নদী-সাগরের মিলন আর জাহাজ দেখার জন্য জনপ্রিয়।'},
 {name: 'পারকি সমুদ্র সৈকত', area: 'আনোয়ারা', desc: 'প্রশস্ত বালুময় সৈকত ও ঝাউবন; কর্ণফুলী চ্যানেল ও সাগর একসঙ্গে দেখা যায়। তুলনামূলক লম্বা ডে-ট্রিপ।'},
 {name: 'শেখ রাসেল এভিয়ারি ও ইকো-পার্ক', area: 'রাঙ্গুনিয়া', desc: 'পাহাড়ঘেরা পার্কে পাখি, লেক, ঝুলন্ত সেতু, ওয়াচটাওয়ার ও হরিণ অভয়ারণ্য।'},
 {name: 'বায়েজিদ বোস্তামী মাজার', area: 'নাসিরাবাদ, চট্টগ্রাম সিটি', desc: 'পাহাড়ি এলাকায় মসজিদ-মাজার প্রাঙ্গণ ও কাছিমের জন্য পরিচিত পুকুর; ধর্মীয় বিশ্বাসের স্থান হিসেবে দর্শনার্থীরা আসেন।'},
];
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
function PlaceCard({p}: {p: {name: string; area: string; desc: string; go?: string; img?: string}}) {
 return <article className="card lift !p-0 overflow-hidden">
  {p.img && VISIT_IMAGES[p.img] ? <figure><img src={VISIT_IMAGES[p.img]} alt={p.name} loading="lazy" className="aspect-[16/9] w-full object-cover"/><figcaption className="bg-brand-50 px-3 py-1.5 text-[11px] text-brand-800">{CAP}</figcaption></figure> : <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-emerald-800 to-emerald-600 text-6xl" aria-hidden="true">🏞️</div>}
  <div className="p-4">
   <h3 className="font-display font-bold leading-snug">{p.name}</h3>
   <p className="mt-1 flex items-center gap-1 text-xs font-bold text-brand-700"><MapPin size={12} className="shrink-0"/>{p.area}</p>
   <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.desc}</p>
   {p.go && <p className="mt-3 flex gap-1.5 rounded-xl bg-brand-50 p-2.5 text-xs leading-relaxed text-brand-900"><Navigation size={13} className="mt-0.5 shrink-0"/><span><b>কীভাবে যাবেন:</b> {p.go}</span></p>}
  </div>
 </article>;
}
export default function BoalkhaliPage() {
 return <Shell><main className="mx-auto max-w-6xl space-y-8 p-3 md:p-4">
  {/* (a) HERO */}
  <section className="relative overflow-hidden rounded-[28px] text-white shadow-elev-2">
   <img src={VISIT_IMAGES.hero} alt="কর্ণফুলী নদী, সাম্পান ও কালুরঘাট সেতু — বোয়ালখালী" className="absolute inset-0 h-full w-full object-cover"/>
   <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/35 to-transparent"/>
   <div className="relative flex min-h-[320px] flex-col justify-end p-5 md:min-h-[380px] md:p-8">
    <p className="chip w-fit border border-white/25 bg-white/15 text-white backdrop-blur">📍 বোয়ালখালী, চট্টগ্রাম</p>
    <h1 className="font-display mt-3 text-3xl font-black leading-tight md:text-5xl">বোয়ালখালীকে জানুন</h1>
    <p className="mt-2 max-w-2xl text-sm text-emerald-50/95 md:text-base">কর্ণফুলীর তীরে, করলডেঙ্গা পাহাড়ের কোলে — বোয়ালখালীর মানুষ, প্রকৃতি, ঐতিহ্য আর ঘোরার জায়গা, যাচাইকৃত তথ্যে এক পেজে।</p>
    <p className="mt-3 text-[11px] text-white/60">{CAP} — কর্ণফুলী নদী ও কালুরঘাট সেতু</p>
   </div>
  </section>
  {/* (b) এক নজরে */}
  <section>
   <SectionTitle title="এক নজরে বোয়ালখালী" sub="সরকারি ও পাবলিক সূত্রে যাচাইকৃত তথ্য"/>
   <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
    {STATS.map(([ic, k, v]) => (<div key={k} className="card lift !p-4"><span className="text-2xl" aria-hidden="true">{ic}</span><p className="mt-1 text-[11px] font-bold text-gray-400">{k}</p><p className="font-display font-bold leading-snug">{v}</p></div>))}
   </div>
   <div className="card mt-3 !p-4"><p className="text-xs font-bold text-gray-400">এলাকাসমূহ</p><div className="mt-2 flex flex-wrap gap-1.5">{UNIONS.map((u) => (<span key={u} className="chip bg-brand-50 text-brand-800">{u}</span>))}</div></div>
  </section>
  {/* (c) পর্যটন — ভিতরে */}
  <section id="darshoniyo" className="scroll-mt-24">
   <SectionTitle title="🏞️ পর্যটন ও দর্শনীয় স্থান" sub="বোয়ালখালীর ভিতরের যাচাইকৃত গন্তব্য"/>
   <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{INSIDE.map((p) => (<PlaceCard key={p.name} p={p}/>))}</div>
  </section>
  {/* (d) কাছাকাছি */}
  <section>
   <SectionTitle title="🧭 কাছাকাছি ঘোরার জায়গা" sub="বোয়ালখালীর পাশে — একদিনের ভ্রমণে ঘুরে আসা যায়"/>
   <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{NEARBY.map((p) => (<PlaceCard key={p.name} p={p}/>))}</div>
  </section>
  {/* (e) কীভাবে যাবেন */}
  <section>
   <SectionTitle title="🚌 কীভাবে যাবেন" sub="চট্টগ্রাম শহর থেকে বোয়ালখালী"/>
   <div className="mt-3 grid gap-3 md:grid-cols-2">
    {TRANSPORT.map(([ic, t]) => (<div key={t.slice(0, 24)} className="card lift flex gap-3 !p-4"><span className="text-2xl shrink-0" aria-hidden="true">{ic}</span><p className="text-sm leading-relaxed text-gray-700">{t}</p></div>))}
   </div>
  </section>
  {/* (f) হাট-বাজার */}
  <section id="haat" className="scroll-mt-24">
   <SectionTitle title="🧺 হাট-বাজার" sub="উপজেলার পরিচিত বাজারগুলো"/>
   <figure className="card mt-3 !p-0 overflow-hidden"><img src={VISIT_IMAGES.haat} alt="বোয়ালখালীর হাট-বাজার" loading="lazy" className="aspect-[21/9] w-full object-cover"/><figcaption className="bg-brand-50 px-3 py-1.5 text-[11px] text-brand-800">{CAP} — গ্রামীণ হাট-বাজার</figcaption></figure>
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
  <section id="itihas" className="scroll-mt-24">
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
  <section>
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
