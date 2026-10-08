'use client'; import {Shell} from '@/components/ui'; import {useState} from 'react'; import Link from 'next/link'; import {firebaseEnabled} from '@/lib/firebaseClient'; import {errMsg} from '@/lib/errMsg';
const AREAS=['কধুরখীল','বোয়ালখালী বাজার','বোয়ালখালী বাস স্ট্যান্ড','কালুরঘাট রোড','চৌমুহনী বাজার','বোয়ালখালী সুপার মার্কেট','কধুরখীল মোড়','কালুরঘাট মোড়','ওয়ার্ড ১','ওয়ার্ড ২'];
export default function P(){const [m,setM]=useState(''); const [ok,setOk]=useState(false);
 const submit=async(ev:any)=>{ev.preventDefault(); const f=new FormData(ev.currentTarget); const body:any=Object.fromEntries(f); if(body.password!==body.confirmPassword){ setM(errMsg('PASSWORD_MISMATCH')); return; }
  try{ if(firebaseEnabled){ const {registerWithEmail}=await import('@/lib/firebaseClient'); const idToken=await registerWithEmail(body.email,body.password); const r=await fetch('/api/auth/firebase',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken,profile:{name:body.name,phone:body.phone,area:body.area,address:body.address,accountType:body.accountType,bloodGroup:body.bloodGroup}})}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'FAIL'); setOk(true); setM('আপনার Gmail-এ ভেরিফিকেশন ইমেইল পাঠানো হয়েছে — লিংকে ক্লিক করে যাচাই করুন'); }
  else { const r=await fetch('/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'FAIL'); setOk(true); setM('✅ রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন'); } }
  catch(e:any){ setM('❌ '+errMsg(e.message)); } };
 const google=async()=>{ try{ const {signInWithGoogle}=await import('@/lib/firebaseClient'); const idToken=await signInWithGoogle(); const r=await fetch('/api/auth/firebase',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken})}); if(r.ok) location.href='/profile'; else { const j=await r.json(); setM(errMsg(j.error)); } }catch{ setM('Google লগইন ব্যর্থ হয়েছে'); } };
 return <Shell><main className="max-w-md mx-auto p-4"><form className="card space-y-3" onSubmit={submit}><h1 className="font-black text-xl">রেজিস্টার — নতুন অ্যাকাউন্ট খুলুন</h1>{m&&<p className={ok?'text-emerald-700 text-sm':'text-red-600 text-sm'}>{m}</p>}
 <label>পুরো নাম *<input name="name" required placeholder="আপনার পুরো নাম"/></label>
 <label>ইমেইল *<input name="email" type="email" required placeholder="you@gmail.com"/></label>
 <label>মোবাইল নম্বর *<input name="phone" required inputMode="tel" placeholder="01XXXXXXXXX"/></label>
 <label>এলাকা *<select name="area" required defaultValue=""><option value="" disabled>এলাকা নির্বাচন করুন</option>{AREAS.map(a=><option key={a} value={a}>{a}</option>)}</select></label>
 <label>ঠিকানা (ঐচ্ছিক)<input name="address" placeholder="বাসা/হোল্ডিং, রোড"/></label>
 <label>অ্যাকাউন্টের ধরন<select name="accountType" defaultValue="CITIZEN"><option value="CITIZEN">নাগরিক</option><option value="BUSINESS">ব্যবসায়ী</option><option value="SERVICE_PROVIDER">সেবাদাতা</option></select></label>
 <label>রক্তের গ্রুপ (ঐচ্ছিক)<select name="bloodGroup" defaultValue=""><option value="">নির্বাচন করুন</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g=><option key={g} value={g}>{g}</option>)}</select></label>
 <label>পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)<input name="password" type="password" required minLength={6}/></label>
 <label>আবার পাসওয়ার্ড *<input name="confirmPassword" type="password" required minLength={6}/></label>
 <button className="btn w-full">অ্যাকাউন্ট তৈরি করুন</button>
 {firebaseEnabled&&<button type="button" onClick={google} className="w-full border rounded-2xl py-3 font-bold bg-white">Google দিয়ে লগইন</button>}
 <p className="text-sm text-center">আগে থেকে অ্যাকাউন্ট আছে? <Link href="/login" className="underline font-bold">লগইন করুন</Link></p></form></main></Shell>}
