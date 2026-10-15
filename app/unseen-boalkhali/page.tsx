import Link from 'next/link';
import {Shell, SectionTitle, bn} from '@/components/ui';
import BoalkhaliMap from '@/components/unseen/BoalkhaliMap';
import {PLACES, VILLAGES, UNIONS} from '@/lib/unseen';

export const metadata = {
  title: 'আনসিন বোয়ালখালী — ঘুরে দেখো বোয়ালখালী',
  description: 'বোয়ালখালীর ইন্টার‌্যাক্টিভ মানচিত্র, ৪৬টি গ্রাম, দর্শনীয় স্থান, ট্রিপ প্ল্যানার, কুইজ খেলা ও লুকানো রত্ন — সব এক জায়গায়।',
};

const FEATURES = [
  {href:'/unseen-boalkhali/map', icon:'🗺️', title:'ইন্টার‌্যাক্টিভ মানচিত্র', desc:'বোয়ালখালীর আসল সীমানায় গ্রাম, দর্শনীয় স্থান ও প্রকৃতির মার্কার — ক্লিক করলেই বিস্তারিত।'},
  {href:'/unseen-boalkhali/places', icon:'🏞️', title:'কোথায় ঘুরবেন', desc:'১৫টি যাচাইকৃত দর্শনীয় স্থান ও ৪৬টি গ্রামের ডিরেক্টরি — কীভাবে যাবেন, কী দেখবেন।'},
  {href:'/unseen-boalkhali/trip', icon:'🧭', title:'ট্রিপ প্ল্যানার', desc:'পছন্দের জায়গা বেছে নিন — দিনের প্ল্যান, রুটের ক্রম ও আনুমানিক খরচ হিসাব করে দেবে।'},
  {href:'/unseen-boalkhali/khela', icon:'🎮', title:'খেলা', desc:'বোয়ালখালী কুইজ, ছবি দেখে জায়গা চেনা, ম্যাপ পাজল — স্কোর তুলে লিডারবোর্ডে নাম লেখান।'},
  {href:'/unseen-boalkhali/rotno', icon:'💎', title:'লুকানো রত্ন', desc:'ভ্রমণপিপাসুদের খুঁজে পাওয়া অজানা জায়গা, বিখ্যাত খাবার — আপনিও জমা দিতে পারেন।'},
  {href:'/unseen-boalkhali/amar-map', icon:'🖼️', title:'আমার ভ্রমণ ম্যাপ', desc:'ঘোরা জায়গায় টিক দিন — সুন্দর ছবি বানিয়ে শেয়ার করুন।'},
];

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
function seasonal(month: number): {title:string; desc:string}[] {
  // month: 0-11
  if (month>=10 || month<=1) return [ // শীত
    {title:'🥾 করলডেঙ্গা পাহাড় ট্রেকিং', desc:'শীতের শুষ্ক আবহাওয়ায় পাহাড়ি পথে হাঁটার সেরা সময় — পরিষ্কার আকাশ, ঠান্ডা বাতাস।'},
    {title:'🌅 কালুরঘাটে সূর্যাস্ত', desc:'কুয়াশামুক্ত বিকেলে সেতুর নিচে নদীর পাড়ে সূর্যাস্ত দেখুন।'},
    {title:'🛕 মেধস আশ্রম দর্শন', desc:'শীতের সকালে পাহাড়চূড়ার তীর্থভূমি — ভিড় কম, পরিবেশ মনোরম।'},
  ];
  if (month>=5 && month<=8) return [ // বর্ষা
    {title:'⛵ কর্ণফুলীতে নৌকা ভ্রমণ', desc:'বর্ষায় নদী পানিতে ভরপুর — কধুরখীল নৌঘাট থেকে সাম্পানে ঘোরা।'},
    {title:'💧 সীতার ঝরনা', desc:'বর্ষায় পাহাড়ি ঝরনা পূর্ণ স্রোতে — করলডেঙ্গার সেরা দৃশ্য।'},
    {title:'🌧️ সবুজ গ্রামবাংলা', desc:'বৃষ্টিভেজা ধানখেত আর খাল-বিল — গ্রামের পথে হাঁটুন (ছাতা নিয়ে)।'},
  ];
  return [ // শরৎ/বসন্ত
    {title:'🏞️ লালার দীঘির পাড়', desc:'মেঘমুক্ত আকাশে দীঘির পাড়ে বিকেল কাটানোর উপযুক্ত সময়।'},
    {title:'🕌 ঐতিহ্য ভ্রমণ', desc:'শ্রীপুর বুড়া মসজিদ, দেওয়ান ভিটা, শ্যামরায় মন্দির — ইতিহাসের খোঁজে।'},
    {title:'🎪 হাট-বাজার ঘোরা', desc:'কালুরঘাট, কানুনগোপাড়া বাজারে স্থানীয় জীবনযাত্রা দেখুন।'},
  ];
}

export default function UnseenBoalkhali(){
  const featured = PLACES.slice(0, 6);
  const month = new Date().getMonth();
  const picks = seasonal(month);
  return <Shell><main className="mx-auto max-w-6xl space-y-8 p-3 md:p-4">
    {/* HERO */}
    <section className="relative overflow-hidden rounded-[28px] text-white shadow-elev-2">
      <img src="/unseen/hero.jpg" alt="কর্ণফুলীর তীরে বোয়ালখালী" className="absolute inset-0 h-full w-full object-cover"/>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/35 to-transparent"/>
      <div className="relative flex min-h-[300px] flex-col justify-end p-5 md:min-h-[360px] md:p-8">
        <p className="chip w-fit border border-white/25 bg-white/15 text-white backdrop-blur">📍 বোয়ালখালী, চট্টগ্রাম</p>
        <h1 className="font-display mt-3 text-3xl font-black leading-tight md:text-5xl">আনসিন বোয়ালখালী</h1>
        <p className="mt-2 max-w-2xl text-sm text-emerald-50/95 md:text-base">শুধু পর্যটন স্পট নয় — বোয়ালখালীর প্রতিটি গ্রাম, প্রতিটি লুকানো রত্ন। মানচিত্রে ঘুরুন, ট্রিপ সাজান, কুইজ খেলুন।</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/unseen-boalkhali/map" className="btn !bg-white !text-emerald-800">🗺️ মানচিত্র ঘুরুন</Link>
          <Link href="/unseen-boalkhali/trip" className="btn !bg-white/15 !text-white border border-white/30 backdrop-blur">🧭 ট্রিপ প্ল্যান করুন</Link>
        </div>
      </div>
    </section>

    {/* STATS */}
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        ['🏘️','গ্রাম', String(VILLAGES.length)],
        ['📍','দর্শনীয় স্থান', String(PLACES.length)],
        ['🗺️','ইউনিয়ন + পৌরসভা', bn(UNIONS.length)],
        ['💎','লুকানো রত্ন', '৮+'],
      ].map(([ic,k,v])=>(
        <div key={k} className="card lift !p-4 text-center">
          <span className="text-2xl" aria-hidden="true">{ic}</span>
          <p className="font-display mt-1 text-2xl font-black text-brand-700 num">{v}</p>
          <p className="text-xs font-bold text-gray-500">{k}</p>
        </div>
      ))}
    </section>

    {/* MAP */}
    <section>
      <SectionTitle title="🗺️ বোয়ালখালীর মানচিত্র" sub="মার্কারে ক্লিক করুন — গ্রাম, দর্শনীয় স্থান, প্রকৃতি" href="/unseen-boalkhali/map" linkLabel="বড় মানচিত্র →"/>
      <div className="mt-3"><BoalkhaliMap compact/></div>
    </section>

    {/* FEATURES */}
    <section>
      <SectionTitle title="✨ সব ফিচার" sub="ঘোরাঘুরির সব আয়োজন এক জায়গায়"/>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(f=>(
          <Link key={f.href} href={f.href} className="card lift press block !p-5">
            <span className="text-4xl" aria-hidden="true">{f.icon}</span>
            <p className="font-display mt-2 text-lg font-bold">{f.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{f.desc}</p>
            <p className="mt-3 text-sm font-bold text-brand-700">খুলুন →</p>
          </Link>
        ))}
      </div>
    </section>

    {/* SEASONAL */}
    <section>
      <SectionTitle title={`🗓️ ${BN_MONTHS[month]} মাসে কোথায় ঘুরবেন`} sub="মৌসুম অনুযায়ী সেরা গন্তব্য"/>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {picks.map(p=>(
          <div key={p.title} className="card lift !p-4">
            <p className="font-display font-bold leading-snug">{p.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* FEATURED PLACES */}
    <section>
      <SectionTitle title="🏞️ ঘুরে আসুন" sub="বোয়ালখালীর যাচাইকৃত দর্শনীয় স্থান" href="/unseen-boalkhali/places" linkLabel="সব দেখুন →"/>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map(p=>(
          <Link key={p.id} href="/unseen-boalkhali/places" className="card lift press block !p-0 overflow-hidden">
            <div className="grid aspect-[16/9] w-full place-items-center bg-brand-50 text-5xl" aria-hidden="true">{p.icon}</div>
            <div className="p-4">
              <h3 className="font-display font-bold leading-snug">{p.name}</h3>
              <p className="mt-0.5 text-xs font-bold text-brand-700">📍 {p.union}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{p.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>

    <p className="text-center text-[11px] text-gray-400">তথ্যসূত্র: উইকিপিডিয়া, বাংলাপিডিয়া, পৌরসভা পর্যটন পেজ ও জাতীয়/আঞ্চলিক সংবাদমাধ্যম (যাচাই: অক্টোবর ২০২৬)। মার্কারের অবস্থান আনুমানিক।</p>
  </main></Shell>;
}
