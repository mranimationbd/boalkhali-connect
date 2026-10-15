'use client';
import {useMemo, useState} from 'react';
import {Shell, SectionTitle, bn} from '@/components/ui';
import {PLACES} from '@/lib/unseen';

function fmtTime(mins: number){
  const h = Math.floor(mins/60), m = mins%60;
  const bnH = bn(h > 12 ? h-12 : h), suffix = h >= 12 ? 'দুপুর' : 'সকাল';
  const hh = h === 0 ? 12 : h > 12 ? h-12 : h;
  return `${suffix} ${bn(hh)}:${bn(String(m).padStart(2,'0'))}`;
}

export default function TripPlanner(){
  const [sel, setSel] = useState<string[]>([]);
  const [people, setPeople] = useState(4);
  const [food, setFood] = useState(200);
  const [transport, setTransport] = useState(800);
  const [boat, setBoat] = useState(0);
  const [startHour, setStartHour] = useState(9);

  const toggle = (id:string)=> setSel(s=> s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  const plan = useMemo(()=>{
    const spots = PLACES.filter(p=>sel.includes(p.id)).sort((a,b)=>a.lon-b.lon); // পশ্চিম → পূর্ব
    let t = startHour*60;
    return spots.map((p,i)=>{
      const arrive = t;
      const depart = t + 90;
      t = depart + 30;
      return {p, arrive, depart, last: i===spots.length-1};
    });
  }, [sel, startHour]);

  const total = transport + boat + food*people;
  const perPerson = people>0 ? Math.round(total/people) : 0;

  return <Shell><main className="mx-auto max-w-6xl space-y-6 p-3 md:p-4">
    <SectionTitle title="🧭 ট্রিপ প্ল্যানার" sub="জায়গা বেছে নিন — দিনের প্ল্যান ও খরচের হিসাব পেয়ে যান"/>

    {/* step 1: pick places */}
    <div className="card !p-4">
      <p className="font-display font-bold">১. ঘোরার জায়গা বেছে নিন ({bn(sel.length)}টি)</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PLACES.map(p=>{
          const on = sel.includes(p.id);
          return <button key={p.id} onClick={()=>toggle(p.id)}
            className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${on?'border-brand-600 bg-brand-50':'border-[var(--line)] bg-white'}`}>
            <span className="text-2xl" aria-hidden="true">{p.icon}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{p.name}</span>
              <span className="block text-[11px] text-gray-500">{p.union}</span>
            </span>
            <span className={`ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full border text-sm ${on?'border-brand-600 bg-brand-600 text-white':'border-gray-300 text-transparent'}`}>✓</span>
          </button>;
        })}
      </div>
    </div>

    {/* step 2: inputs */}
    <div className="card !p-4">
      <p className="font-display font-bold">২. খরচের ধারণা দিন</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['👥','কতজন যাবেন', people, setPeople, 1],
          ['🍛','জনপ্রতি খাবার (৳)', food, setFood, 0],
          ['🚕','যাতায়াত মোট (৳)', transport, setTransport, 0],
          ['⛵','নৌকা ভাড়া (৳)', boat, setBoat, 0],
        ].map(([icon,label,val,setter,min]:any)=>(
          <label key={label as string} className="block rounded-2xl border border-[var(--line)] p-3">
            <span className="text-xs font-bold text-gray-500">{icon} {label}</span>
            <input type="number" min={min} value={val} onChange={e=>setter(Math.max(min, Number(e.target.value)||0))}
              className="num mt-1 w-full bg-transparent text-xl font-black text-brand-700 outline-none"/>
          </label>
        ))}
      </div>
      <label className="mt-3 block text-sm font-bold text-gray-600">🕘 যাত্রা শুরুর সময়:
        <select value={startHour} onChange={e=>setStartHour(Number(e.target.value))} className="ml-2 rounded-xl border border-[var(--line)] px-2 py-1">
          {[8,9,10].map(h=><option key={h} value={h}>সকাল {bn(h)}টা</option>)}
        </select>
      </label>
    </div>

    {/* step 3: output */}
    {plan.length>0 ? (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card !p-4">
          <p className="font-display font-bold">৩. আপনার দিনের প্ল্যান</p>
          <ol className="mt-3 space-y-0">
            {plan.map(({p,arrive,depart,last},i)=>(
              <li key={p.id} className="relative flex gap-3 pb-5 last:pb-0">
                {!last && <span aria-hidden="true" className="absolute left-[15px] top-9 h-[calc(100%-2rem)] w-0.5 bg-brand-100"/>}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-black text-white num">{bn(i+1)}</span>
                <div className="min-w-0">
                  <p className="font-bold leading-snug"><span className="mr-1">{p.icon}</span>{p.name}</p>
                  <p className="text-xs text-gray-500">{fmtTime(arrive)} – {fmtTime(depart)} • {p.union}</p>
                  {!last && <p className="mt-0.5 text-[11px] text-brand-700">↓ ~৩০ মিনিট যাতায়াত</p>}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-gray-400">রুট পশ্চিম (কালুরঘাট) → পূর্ব ক্রমে সাজানো — ফেরার পথ সহজ হবে। প্রতিটি স্পটে ~১.৫ ঘণ্টা ধরা হয়েছে।</p>
        </div>
        <div className="card !p-4">
          <p className="font-display font-bold">💰 আনুমানিক খরচ</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>🚕 যাতায়াত</span><b className="num">{bn(transport)} ৳</b></div>
            <div className="flex justify-between"><span>🍛 খাবার ({bn(people)} জন × {bn(food)} ৳)</span><b className="num">{bn(food*people)} ৳</b></div>
            {boat>0 && <div className="flex justify-between"><span>⛵ নৌকা ভাড়া</span><b className="num">{bn(boat)} ৳</b></div>}
            <div className="flex justify-between border-t border-[var(--line)] pt-2 text-base"><span className="font-bold">মোট</span><b className="num font-black text-brand-700">{bn(total)} ৳</b></div>
            <div className="flex justify-between"><span className="text-gray-500">জনপ্রতি</span><b className="num text-brand-700">~{bn(perPerson)} ৳</b></div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400">এটি আপনার দেওয়া সংখ্যার হিসাব — বাস্তব ভাড়া দরদাম ও মৌসুমভেদে বদলাতে পারে। দর্শনীয় স্থানে প্রবেশ ফি সাধারণত নেই/নগণ্য।</p>
        </div>
      </div>
    ) : (
      <div className="card p-8 text-center text-gray-500">
        <p className="text-4xl" aria-hidden="true">🧭</p>
        <p className="mt-2 font-bold">উপরে অন্তত ১টি জায়গা বেছে নিন</p>
        <p className="text-sm">তাহলেই দিনের প্ল্যান ও খরচের হিসাব তৈরি হয়ে যাবে।</p>
      </div>
    )}
  </main></Shell>;
}
