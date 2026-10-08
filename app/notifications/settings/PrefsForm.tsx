'use client'; import {useState} from 'react';
export type NotifPrefs={all:boolean,emergency:boolean,blood:boolean,newPosts:boolean};
const ROWS:{key:keyof NotifPrefs,label:string,desc:string}[]=[
{key:'all',label:'সব নোটিফিকেশন',desc:'সব ধরনের নোটিফিকেশন চালু বা বন্ধ করুন'},
{key:'emergency',label:'জরুরি সতর্কতা',desc:'সাইরেন ও জরুরি ঘোষণার সতর্কতা'},
{key:'blood',label:'রক্তের অনুরোধ',desc:'জরুরি রক্তের অনুরোধের খবর'},
{key:'newPosts',label:'নতুন পোস্ট',desc:'নতুন পোস্ট এলে জানিয়ে দিন'}];
export default function PrefsForm({initial}:{initial:NotifPrefs}){ const [prefs,setPrefs]=useState<NotifPrefs>(initial); const [msg,setMsg]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false);
 const toggle=(k:keyof NotifPrefs)=>{ setMsg(''); setErr(''); setPrefs(p=>({...p,[k]:!p[k]})); };
 const save=async()=>{ setBusy(true); setMsg(''); setErr(''); try{ const r=await fetch('/api/notifications/settings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(prefs)}); const j=await r.json(); if(!r.ok){ setErr(j.error==='LOGIN_REQUIRED'?'লগইন সেশন শেষ হয়ে গেছে — আবার লগইন করুন':'সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন'); return; } setPrefs(j.prefs); setMsg('সংরক্ষণ করা হয়েছে'); }catch{ setErr('সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন'); }finally{ setBusy(false); } };
 return <div className="card mt-3">{ROWS.map(({key,label,desc})=>(<div key={key} className="flex items-center justify-between gap-3 border rounded-2xl p-3 mt-2"><div><b>{label}</b><p className="text-xs text-gray-500">{desc}</p></div><button type="button" role="switch" aria-checked={prefs[key]} aria-label={label} onClick={()=>toggle(key)} className={`w-14 h-8 shrink-0 rounded-full p-1 transition-colors ${prefs[key]?'bg-emerald-500':'bg-gray-300'}`}><span className={`block w-6 h-6 bg-white rounded-full transition-transform ${prefs[key]?'translate-x-6':''}`}/></button></div>))}
 {err&&<p className="text-red-600 text-sm mt-3">{err}</p>}{msg&&<p className="text-emerald-700 text-sm mt-3" role="status">{msg}</p>}
 <button type="button" onClick={save} disabled={busy} className="btn w-full mt-4 justify-center">{busy?'সংরক্ষণ হচ্ছে…':'সংরক্ষণ করুন'}</button></div> }
