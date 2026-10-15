'use client';
import {useMemo, useState} from 'react';
import Link from 'next/link';
import {Shell, SectionTitle, bn} from '@/components/ui';
import {PLACES, VILLAGES, UNIONS, UPlace} from '@/lib/unseen';

function PlaceCard({p}:{p:UPlace}){
  return <div className="card lift !p-0 overflow-hidden">
    <div className="grid aspect-[16/9] w-full place-items-center bg-brand-50 text-5xl" aria-hidden="true">{p.icon}</div>
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="chip bg-brand-50 text-brand-800 text-[11px] font-bold">{p.catBn}</span>
        <span className="chip bg-amber-50 text-amber-800 text-[11px] font-bold">📍 {p.union}</span>
      </div>
      <h3 className="font-display mt-2 font-bold leading-snug">{p.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{p.desc}</p>
      {p.tips && <p className="mt-2 rounded-xl bg-emerald-50 p-2.5 text-[13px] leading-relaxed text-emerald-900"><b>🧭 কীভাবে যাবেন:</b> {p.tips}</p>}
    </div>
  </div>;
}

export default function UnseenPlaces(){
  const [q, setQ] = useState('');
  const [union, setUnion] = useState('');
  const [tab, setTab] = useState<'places'|'villages'>('places');

  const places = useMemo(()=>{
    const s = q.trim();
    return PLACES.filter(p =>
      (!union || p.union === union) &&
      (!s || p.name.includes(s) || p.desc.includes(s) || p.union.includes(s)));
  }, [q, union]);

  const villages = useMemo(()=>{
    const s = q.trim();
    return VILLAGES.filter(v =>
      (!union || v.union === union) &&
      (!s || v.name.includes(s) || v.union.includes(s) || v.nameEn.toLowerCase().includes(s.toLowerCase())));
  }, [q, union]);

  return <Shell><main className="mx-auto max-w-6xl space-y-6 p-3 md:p-4">
    <SectionTitle title="🏞️ কোথায় ঘুরবেন" sub={`${bn(PLACES.length)}টি দর্শনীয় স্থান • ${bn(VILLAGES.length)}টি গ্রাম — বোয়ালখালীর সব ঠিকানা`}/>

    {/* search + tabs */}
    <div className="card !p-4">
      <div className="flex gap-2">
        <button onClick={()=>setTab('places')} className={`chip font-bold ${tab==='places'?'bg-brand-600 text-white':'bg-brand-50 text-brand-800'}`}>📍 দর্শনীয় ({bn(PLACES.length)})</button>
        <button onClick={()=>setTab('villages')} className={`chip font-bold ${tab==='villages'?'bg-brand-600 text-white':'bg-brand-50 text-brand-800'}`}>🏘️ গ্রাম ({bn(VILLAGES.length)})</button>
      </div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="খুঁজুন — নাম বা এলাকা লিখুন…"
        className="mt-3 w-full rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm outline-none focus:border-brand-600" aria-label="খুঁজুন"/>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <button onClick={()=>setUnion('')} className={`chip text-xs font-bold ${!union?'bg-brand-600 text-white':'bg-gray-100 text-gray-700'}`}>সব এলাকা</button>
        {UNIONS.map(u=>(
          <button key={u} onClick={()=>setUnion(union===u?'':u)} className={`chip text-xs font-bold ${union===u?'bg-brand-600 text-white':'bg-gray-100 text-gray-700'}`}>{u}</button>
        ))}
      </div>
    </div>

    {tab==='places' ? (
      places.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{places.map(p=><PlaceCard key={p.id} p={p}/>)}</div>
      : <p className="card p-8 text-center text-gray-500">কিছু পাওয়া যায়নি — অন্য নামে খুঁজে দেখুন।</p>
    ) : (
      villages.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {villages.map(v=>(
          <div key={v.name} className="card lift !p-4">
            <p className="font-display font-bold leading-snug"><span aria-hidden="true">🏘️ </span>{v.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="chip bg-brand-50 text-brand-800 font-bold">{v.union}</span>
              {v.note && <span className="text-gray-500">{v.note}</span>}
            </p>
          </div>
        ))}
      </div>
      : <p className="card p-8 text-center text-gray-500">কিছু পাওয়া যায়নি — অন্য নামে খুঁজে দেখুন।</p>
    )}

    {/* travel info */}
    <div className="card !p-4">
      <p className="font-display font-bold">💰 খরচ ও থাকার ধারণা</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
        <li>বোয়ালখালী একদিনের ভ্রমণের জন্য উপযুক্ত — চট্টগ্রাম শহর থেকে বাস/CNG/টেম্পুতে যাতায়াত, ভাড়া গন্তব্য অনুযায়ী।</li>
        <li>নৌকা ভ্রমণ (কধুরখীল নৌঘাট) বা পাহাড়ি পথে হাঁটার জন্য স্থানীয় মাঝি/গাইডের সাথে দরদাম করে নিন।</li>
        <li>থাকার জন্য চট্টগ্রাম শহরে হোটেল সুবিধাজনক; বোয়ালখালীতে রাত্রিযাপনের বাণিজ্যিক হোটেল সীমিত।</li>
        <li>খাবার: কালুরঘাট-কানুনগোপাড়া এলাকায় সাশ্রয়ী হোটেল ও রেস্টুরেন্ট আছে।</li>
      </ul>
      <p className="mt-2 text-[11px] text-gray-400">ভাড়া ও খরচ সময়ভেদে বদলায় — যাত্রার আগে স্থানীয়ভাবে যাচাই করে নিন।</p>
    </div>

    <p className="text-center text-[11px] text-gray-400">
      গ্রামের তালিকা: বাংলা উইকিপিডিয়ার ইউনিয়ন পাতা (সংশ্লিষ্ট ইউপি পোর্টাল সূত্রে)। আরও জানতে <Link href="/unseen-boalkhali/trip" className="font-bold text-brand-700 underline">ট্রিপ প্ল্যানার</Link> ব্যবহার করুন।
    </p>
  </main></Shell>;
}
