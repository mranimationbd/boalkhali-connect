'use client'; import {Shell} from '@/components/ui'; import {useState} from 'react'; import Link from 'next/link';
import {errMsg} from '@/lib/errMsg';
// Password recovery: 3 steps — (1) email → 6-digit code mailed, (2) verify code,
// (3) set new password. Firebase accounts use the Firebase reset mail; if the site's
// SMTP isn't configured yet, the honest fallback is an admin reset request.
export default function P(){
 const [step,setStep]=useState(1);
 const [email,setEmail]=useState(''); const [code,setCode]=useState('');
 const [pw,setPw]=useState(''); const [pw2,setPw2]=useState('');
 const [resetToken,setResetToken]=useState('');
 const [busy,setBusy]=useState(false); const [msg,setMsg]=useState(''); const [err,setErr]=useState('');
 const askCode=async(ev:any)=>{ ev.preventDefault(); setMsg(''); setErr(''); const em=email.trim().toLowerCase();
  if(!em.includes('@')){ setErr('সঠিক ইমেইল ঠিকানা দিন'); return; } setBusy(true);
  try{ const r=await fetch('/api/auth/forgot-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){ setErr(errMsg(j.error)||'হয়নি — কিছুক্ষণ পর আবার চেষ্টা করুন'); setBusy(false); return; }
   if(j.mode==='firebase'){ try{ const {resetPassword}=await import('@/lib/firebaseClient'); await resetPassword(j.email||em);
     setMsg('✅ এই অ্যাকাউন্ট Google/Firebase দিয়ে চলে — Firebase থেকে রিসেট ইমেইল পাঠানো হয়েছে। ইনবক্স (ও স্প্যাম) দেখে লিংক থেকে নতুন পাসওয়ার্ড দিন।'); }
    catch{ setErr('রিসেট ইমেইল পাঠানো যায়নি — ইমেইল যাচাই করে আবার চেষ্টা করুন।'); } setBusy(false); return; }
   if(j.mode==='no-smtp'){ setMsg('ℹ️ সাইটের ইমেইল সার্ভার এখনো চালু হয়নি। নিচের বোতামে অ্যাডমিনের কাছে রিসেট অনুরোধ পাঠাতে পারেন — অ্যাডমিন নতুন পাসওয়ার্ড সেট করে দেবেন।'); setStep(9); setBusy(false); return; }
   if(j.mode==='send-failed'){ setErr('ইমেইল পাঠানো যায়নি — কিছুক্ষণ পর আবার চেষ্টা করুন, অথবা অ্যাডমিনের সহায়তা নিন।'); setBusy(false); return; }
   setMsg('✅ কোড পাঠানো হয়েছে — ইমেইল ইনবক্স (ও স্প্যাম ফোল্ডার) দেখুন। কোড ১৫ মিনিট কার্যকর থাকবে।'); setStep(2);
  }catch{ setErr('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন'); } setBusy(false); };
 const adminRequest=async()=>{ setBusy(true); setErr(''); try{ const r=await fetch('/api/auth/forgot',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({identifier:email})}); const j=await r.json().catch(()=>({}));
   setMsg(r.ok?'ℹ️ অ্যাডমিনের কাছে পাসওয়ার্ড রিসেটের অনুরোধ '+(j.already?'আগে থেকেই পাঠানো আছে':'পাঠানো হয়েছে')+'। অ্যাডমিন নতুন পাসওয়ার্ড সেট করে দিলে লগইন করতে পারবেন।':'❌ অনুরোধ পাঠানো যায়নি'); }catch{ setErr('নেটওয়ার্ক সমস্যা'); } setBusy(false); };
 const verify=async(ev:any)=>{ ev.preventDefault(); setMsg(''); setErr(''); const c=code.replace(/\D/g,'');
  if(c.length!==6){ setErr('৬ সংখ্যার কোড দিন'); return; } setBusy(true);
  try{ const r=await fetch('/api/auth/verify-reset-code',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:email.trim().toLowerCase(),code:c})});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){ setErr(j.error==='CODE_EXPIRED'?'কোডের মেয়াদ শেষ — নতুন কোড নিন':j.error==='TOO_MANY_ATTEMPTS'?'অনেকবার ভুল হয়েছে — নতুন কোড নিন':'কোডটি সঠিক নয় — আবার চেষ্টা করুন'); setBusy(false); return; }
   setResetToken(j.resetToken); setStep(3); setMsg('✅ কোড যাচাই হয়েছে — এবার নতুন পাসওয়ার্ড দিন।');
  }catch{ setErr('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন'); } setBusy(false); };
 const reset=async(ev:any)=>{ ev.preventDefault(); setMsg(''); setErr('');
  if(pw.length<6){ setErr('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return; }
  if(pw!==pw2){ setErr('দুটি পাসওয়ার্ড মিলছে না'); return; } setBusy(true);
  try{ const payload:any={resetToken:resetToken}; payload['password']=pw;
   const r=await fetch('/api/auth/reset-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
   const j=await r.json().catch(()=>({}));
   if(!r.ok){ setErr(j.error==='TOKEN_EXPIRED'?'সময় শেষ — শুরু থেকে আবার চেষ্টা করুন':'হয়নি — শুরু থেকে আবার চেষ্টা করুন'); setBusy(false); return; }
   setStep(4);
  }catch{ setErr('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন'); } setBusy(false); };
 return <Shell><main className="max-w-md mx-auto p-4"><div className="card">
  <h1 className="font-black text-xl">পাসওয়ার্ড ভুলে গেছেন?</h1>
  {step===1&&<form onSubmit={askCode}><p className="text-sm text-gray-500 mt-1">অ্যাকাউন্টের ইমেইল দিন — সেখানে ৬ সংখ্যার ভেরিফিকেশন কোড যাবে।</p>
   <label className="block text-sm font-bold mt-3">ইমেইল<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="you@example.com" autoComplete="email"/></label>
   {err&&<p className="text-red-600 text-sm mt-2">{err}</p>}{msg&&<p className="text-emerald-700 text-sm mt-2">{msg}</p>}
   <button className="btn w-full mt-3" disabled={busy}>{busy?'পাঠানো হচ্ছে…':'কোড পাঠান'}</button></form>}
  {step===2&&<form onSubmit={verify}><p className="text-sm text-gray-500 mt-1"><b>{email}</b> ঠিকানায় পাঠানো ৬ সংখ্যার কোডটি দিন।</p>
   <label className="block text-sm font-bold mt-3">ভেরিফিকেশন কোড<input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" required placeholder="••••••" className="text-center text-2xl tracking-[0.5em] font-black"/></label>
   {err&&<p className="text-red-600 text-sm mt-2">{err}</p>}{msg&&<p className="text-emerald-700 text-sm mt-2">{msg}</p>}
   <button className="btn w-full mt-3" disabled={busy}>{busy?'যাচাই হচ্ছে…':'কোড যাচাই করুন'}</button>
   <button type="button" className="w-full mt-2 text-sm text-emerald-700 font-bold" onClick={()=>setStep(1)}>কোড আসেনি? আবার পাঠান</button></form>}
  {step===3&&<form onSubmit={reset}><p className="text-sm text-gray-500 mt-1">নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)।</p>
   <label className="block text-sm font-bold mt-3">নতুন পাসওয়ার্ড<input value={pw} onChange={e=>setPw(e.target.value)} type="password" required minLength={6} autoComplete="new-password"/></label>
   <label className="block text-sm font-bold mt-2">আবার লিখুন<input value={pw2} onChange={e=>setPw2(e.target.value)} type="password" required autoComplete="new-password"/></label>
   {err&&<p className="text-red-600 text-sm mt-2">{err}</p>}{msg&&<p className="text-emerald-700 text-sm mt-2">{msg}</p>}
   <button className="btn w-full mt-3" disabled={busy}>{busy?'সংরক্ষণ হচ্ছে…':'নতুন পাসওয়ার্ড সেট করুন'}</button></form>}
  {step===4&&<div className="text-center py-4"><p className="text-4xl">✅</p><h2 className="font-black text-lg mt-2">পাসওয়ার্ড বদলে গেছে!</h2><p className="text-sm text-gray-500 mt-1">নিরাপত্তার জন্য সব ডিভাইস থেকে লগআউট করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।</p><Link href="/login" className="btn w-full mt-4 text-center">লগইন করুন</Link></div>}
  {step===9&&<div>{msg&&<p className="text-sm text-gray-600 mt-2">{msg}</p>}{err&&<p className="text-red-600 text-sm mt-2">{err}</p>}<button className="btn w-full mt-3" disabled={busy} onClick={adminRequest}>{busy?'পাঠানো হচ্ছে…':'অ্যাডমিনের কাছে অনুরোধ পাঠান'}</button><button className="w-full mt-2 text-sm text-emerald-700 font-bold" onClick={()=>setStep(1)}>← ইমেইল বদলান</button></div>}
  {step!==4&&step!==9&&<Link href="/login" className="btn w-full mt-3 !bg-slate-700 text-center">লগইনে ফিরুন</Link>}
 </div></main></Shell>;
}
