'use client';
import {useMemo, useState} from 'react';
import {Shell, SectionTitle, bn} from '@/components/ui';
import {QUIZ, PLACES, VILLAGES, UNIONS, QuizQ, getLeaderboard, addScore, ScoreEntry} from '@/lib/unseen';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

/* ---------------- QUIZ ---------------- */
function QuizGame({onDone}:{onDone:(s:number,t:number)=>void}){
  const [qs] = useState<QuizQ[]>(()=>shuffle(QUIZ).slice(0,10));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number|null>(null);
  const [score, setScore] = useState(0);
  const q = qs[idx];

  const choose = (i:number)=>{
    if (picked!==null) return;
    setPicked(i);
    if (i===q.answer) setScore(s=>s+1);
  };
  const next = ()=>{
    if (idx+1>=qs.length){ onDone(picked===q.answer?score+1:score, qs.length); }
    else { setIdx(idx+1); setPicked(null); }
  };

  return <div className="card !p-5">
    <div className="flex items-center justify-between text-sm">
      <b>প্রশ্ন {bn(idx+1)} / {bn(qs.length)}</b>
      <b className="num text-brand-700">স্কোর: {bn(score)}</b>
    </div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-brand-600 transition-all" style={{width:`${((idx)/qs.length)*100}%`}}/></div>
    <p className="font-display mt-4 text-lg font-bold leading-snug">{q.q}</p>
    <div className="mt-3 grid gap-2">
      {q.options.map((op,i)=>{
        const isAns = i===q.answer, isPick = i===picked;
        let cls = 'border-[var(--line)] bg-white hover:border-brand-400';
        if (picked!==null){
          if (isAns) cls='border-green-600 bg-green-50';
          else if (isPick) cls='border-red-500 bg-red-50';
          else cls='border-[var(--line)] bg-white opacity-60';
        }
        return <button key={i} onClick={()=>choose(i)} disabled={picked!==null}
          className={`rounded-2xl border p-3 text-left text-sm font-bold transition ${cls}`}>
          <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-gray-100 text-xs num">{bn(i+1)}</span>{op}
          {picked!==null && isAns && <span className="ml-2">✓</span>}
        </button>;
      })}
    </div>
    {picked!==null && (
      <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
        <b>💡 জানেন কি?</b> {q.fact}
        <button onClick={next} className="btn mt-3 w-full">{idx+1>=qs.length?'ফলাফল দেখুন':'পরের প্রশ্ন →'}</button>
      </div>
    )}
  </div>;
}

/* ---------------- GUESS THE PLACE ---------------- */
interface GuessQ { prompt: string; icon: string; options: string[]; answer: number; }
function GuessGame({onDone}:{onDone:(s:number,t:number)=>void}){
  const [qs] = useState<GuessQ[]>(()=>{
    const picks = shuffle(PLACES).slice(0,8);
    return picks.map(p=>{
      const wrong = shuffle(PLACES.filter(x=>x.id!==p.id)).slice(0,3).map(x=>x.name);
      const options = shuffle([p.name, ...wrong]);
      return {prompt: p.desc, icon: p.icon, options, answer: options.indexOf(p.name)};
    });
  });
  const [idx,setIdx]=useState(0); const [picked,setPicked]=useState<number|null>(null); const [score,setScore]=useState(0);
  const q=qs[idx];
  const choose=(i:number)=>{ if(picked!==null)return; setPicked(i); if(i===q.answer)setScore(s=>s+1); };
  const next=()=>{ if(idx+1>=qs.length) onDone(score+(picked===q.answer?1:0), qs.length); else {setIdx(idx+1); setPicked(null);} };
  return <div className="card !p-5">
    <div className="flex items-center justify-between text-sm"><b>রাউন্ড {bn(idx+1)} / {bn(qs.length)}</b><b className="num text-brand-700">স্কোর: {bn(score)}</b></div>
    <p className="mt-3 text-sm font-bold text-gray-500">বর্ণনা পড়ে জায়গাটি চিনুন:</p>
    <p className="mt-1 rounded-2xl bg-brand-50 p-4 text-[15px] leading-relaxed"><span className="mr-1 text-2xl">{q.icon}</span>{q.prompt}</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {q.options.map((op,i)=>{
        const isAns=i===q.answer, isPick=i===picked;
        let cls='border-[var(--line)] bg-white hover:border-brand-400';
        if(picked!==null){ if(isAns)cls='border-green-600 bg-green-50'; else if(isPick)cls='border-red-500 bg-red-50'; else cls='border-[var(--line)] opacity-60'; }
        return <button key={i} onClick={()=>choose(i)} disabled={picked!==null} className={`rounded-2xl border p-3 text-sm font-bold transition ${cls}`}>{op}{picked!==null&&isAns&&' ✓'}</button>;
      })}
    </div>
    {picked!==null && <button onClick={next} className="btn mt-3 w-full">{idx+1>=qs.length?'ফলাফল দেখুন':'পরেরটি →'}</button>}
  </div>;
}

/* ---------------- MAP PUZZLE (which union?) ---------------- */
function MapPuzzle({onDone}:{onDone:(s:number,t:number)=>void}){
  const [qs] = useState(()=>{
    const items = shuffle([...PLACES.map(p=>({name:p.name, union:p.union})), ...VILLAGES.map(v=>({name:v.name, union:v.union}))]).slice(0,8);
    return items.map(it=>{
      const wrong = shuffle(UNIONS.filter(u=>u!==it.union)).slice(0,3);
      const options = shuffle([it.union, ...wrong]);
      return {...it, options, answer: options.indexOf(it.union)};
    });
  });
  const [idx,setIdx]=useState(0); const [picked,setPicked]=useState<number|null>(null); const [score,setScore]=useState(0);
  const q=qs[idx];
  const choose=(i:number)=>{ if(picked!==null)return; setPicked(i); if(i===q.answer)setScore(s=>s+1); };
  const next=()=>{ if(idx+1>=qs.length) onDone(score+(picked===q.answer?1:0), qs.length); else {setIdx(idx+1); setPicked(null);} };
  return <div className="card !p-5">
    <div className="flex items-center justify-between text-sm"><b>রাউন্ড {bn(idx+1)} / {bn(qs.length)}</b><b className="num text-brand-700">স্কোর: {bn(score)}</b></div>
    <p className="font-display mt-4 text-lg font-bold">🗺️ <b>{q.name}</b> কোন ইউনিয়নে?</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {q.options.map((op,i)=>{
        const isAns=i===q.answer, isPick=i===picked;
        let cls='border-[var(--line)] bg-white hover:border-brand-400';
        if(picked!==null){ if(isAns)cls='border-green-600 bg-green-50'; else if(isPick)cls='border-red-500 bg-red-50'; else cls='border-[var(--line)] opacity-60'; }
        return <button key={i} onClick={()=>choose(i)} disabled={picked!==null} className={`rounded-2xl border p-3 text-sm font-bold transition ${cls}`}>{op}{picked!==null&&isAns&&' ✓'}</button>;
      })}
    </div>
    {picked!==null && <button onClick={next} className="btn mt-3 w-full">{idx+1>=qs.length?'ফলাফল দেখুন':'পরেরটি →'}</button>}
  </div>;
}

/* ---------------- RESULT + LEADERBOARD ---------------- */
function Result({game, score, total, onRestart}:{game:string; score:number; total:number; onRestart:()=>void}){
  const [name,setName]=useState(''); const [saved,setSaved]=useState(false);
  const pct = Math.round(score/total*100);
  const msg = pct>=80 ? '🏆 অসাধারণ! আপনি বোয়ালখালীর সত্যিকারের জানেন!' : pct>=50 ? '👏 ভালো চেষ্টা! আরেকটু ঘুরে আসুন।' : '📚 মানচিত্র আর ঘোরার পেজ দেখে আবার চেষ্টা করুন!';
  const save=()=>{
    if(!name.trim()||saved) return;
    addScore({name:name.trim().slice(0,24), score, total, date:new Date().toISOString().slice(0,10), game});
    setSaved(true);
  };
  return <div className="card !p-6 text-center">
    <p className="text-5xl" aria-hidden="true">{pct>=80?'🏆':pct>=50?'👏':'📚'}</p>
    <p className="font-display mt-2 text-2xl font-black num">{bn(score)} / {bn(total)}</p>
    <p className="mt-1 text-sm text-gray-600">{msg}</p>
    {!saved ? (
      <div className="mx-auto mt-4 flex max-w-sm gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="আপনার নাম লিখুন" maxLength={24}
          className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] px-4 py-2.5 text-sm outline-none focus:border-brand-600" aria-label="আপনার নাম"/>
        <button onClick={save} className="btn shrink-0">সেভ করুন</button>
      </div>
    ) : <p className="mt-4 text-sm font-bold text-green-700">✓ লিডারবোর্ডে যোগ হয়েছে!</p>}
    <button onClick={onRestart} className="btn mt-4 !bg-brand-50 !text-brand-800">🔄 আবার খেলুন</button>
  </div>;
}

function Leaderboard(){
  const [rows] = useState<ScoreEntry[]>(()=>getLeaderboard());
  const [fgame,setFgame]=useState('');
  const games = useMemo(()=>['',...Array.from(new Set(rows.map(r=>r.game)))],[rows]);
  const list = rows.filter(r=>!fgame||r.game===fgame).slice(0,20);
  return <div className="card !p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-display text-lg font-bold">🏆 লিডারবোর্ড</p>
      <select value={fgame} onChange={e=>setFgame(e.target.value)} className="rounded-xl border border-[var(--line)] px-2 py-1 text-sm" aria-label="খেলা বাছুন">
        {games.map(g=><option key={g} value={g}>{g||'সব খেলা'}</option>)}
      </select>
    </div>
    {list.length? <ol className="mt-3 space-y-2">
      {list.map((r,i)=>(
        <li key={i} className={`flex items-center gap-3 rounded-2xl border p-2.5 text-sm ${i<3?'border-amber-300 bg-amber-50':'border-[var(--line)]'}`}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-black text-white num">{bn(i+1)}</span>
          <span className="min-w-0 flex-1"><b className="block truncate">{r.name}</b><span className="text-[11px] text-gray-500">{r.game} • {r.date}</span></span>
          <b className="num text-brand-700">{bn(r.score)}/{bn(r.total)}</b>
        </li>
      ))}
    </ol> : <p className="mt-3 text-center text-sm text-gray-500">এখনো কেউ খেলেনি — প্রথম স্কোরটি আপনার হোক! 🎮</p>}
    <p className="mt-3 text-[11px] text-gray-400">স্কোর আপনার ডিভাইসে সংরক্ষিত থাকে।</p>
  </div>;
}

/* ---------------- PAGE ---------------- */
type Game = 'quiz'|'guess'|'puzzle'|'board'|null;
const TABS: {id:Exclude<Game,null>; icon:string; title:string; desc:string}[] = [
  {id:'quiz', icon:'🎯', title:'বোয়ালখালী কুইজ', desc:'১০টি প্রশ্ন — ইতিহাস, গ্রাম, বিশিষ্ট ব্যক্তি'},
  {id:'guess', icon:'🖼️', title:'জায়গা চেনো', desc:'বর্ণনা পড়ে দর্শনীয় স্থান চিনুন'},
  {id:'puzzle', icon:'🧩', title:'ম্যাপ পাজল', desc:'জায়গাটি কোন ইউনিয়নে?'},
  {id:'board', icon:'🏆', title:'লিডারবোর্ড', desc:'সেরা স্কোরারদের তালিকা'},
];
const NAMES: Record<string,string> = {quiz:'বোয়ালখালী কুইজ', guess:'জায়গা চেনো', puzzle:'ম্যাপ পাজল'};

export default function Khela(){
  const [game,setGame]=useState<Game>(null);
  const [result,setResult]=useState<{score:number;total:number}|null>(null);
  const [round,setRound]=useState(0);

  const start=(g:Exclude<Game,null>)=>{ setGame(g); setResult(null); setRound(r=>r+1); };
  const done=(s:number,t:number)=> setResult({score:s,total:t});

  return <Shell><main className="mx-auto max-w-3xl space-y-6 p-3 md:p-4">
    <SectionTitle title="🎮 খেলা" sub="খেলুন, শিখুন, লিডারবোর্ডে নাম তুলুন"/>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>start(t.id)}
          className={`card lift press !p-4 text-center ${game===t.id?'!border-brand-600 ring-2 ring-brand-100':''}`}>
          <span className="text-3xl" aria-hidden="true">{t.icon}</span>
          <p className="font-display mt-1.5 text-sm font-bold leading-snug">{t.title}</p>
          <p className="mt-0.5 text-[11px] text-gray-500">{t.desc}</p>
        </button>
      ))}
    </div>

    {game==='board' && <Leaderboard key={'b'+round}/>}
    {game && game!=='board' && !result && (
      <div key={game+round}>
        {game==='quiz' && <QuizGame onDone={done}/>}
        {game==='guess' && <GuessGame onDone={done}/>}
        {game==='puzzle' && <MapPuzzle onDone={done}/>}
      </div>
    )}
    {game && game!=='board' && result && (
      <Result game={NAMES[game]} score={result.score} total={result.total} onRestart={()=>start(game)}/>
    )}
    {!game && (
      <div className="card p-8 text-center text-gray-500">
        <p className="text-4xl" aria-hidden="true">🎮</p>
        <p className="mt-2 font-bold">উপর থেকে একটি খেলা বেছে নিন</p>
      </div>
    )}
  </main></Shell>;
}
