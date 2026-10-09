'use client';
import Link from 'next/link'; import {useState} from 'react'; import {Menu,X,Bell,Search,PlusCircle,User,FileText,Bookmark,HeartHandshake,Share2,EyeOff,BellRing,Siren,Info} from 'lucide-react'; import {useSiteSettings} from './SiteSettings';
const LINKS:{href:string,label:string,sub?:string,Icon:any}[]=[
{href:'/create',label:'নতুন পোস্ট করুন',Icon:PlusCircle},
{href:'/profile',label:'আমার প্রোফাইল',Icon:User},
{href:'/my-posts',label:'আমার পোস্টসমূহ',Icon:FileText},
{href:'/saved',label:'সংরক্ষিত পোস্ট',Icon:Bookmark},
{href:'/volunteers',label:'আমাদের স্বেচ্ছাসেবীবৃন্দ',Icon:HeartHandshake},
{href:'/secret',label:'পরিচয় গোপন মোড',sub:'নাম-পরিচয় গোপন রেখে তথ্য দিন',Icon:EyeOff},
{href:'/notifications/settings',label:'নোটিফিকেশন সেটিংস',Icon:BellRing},
{href:'/emergency',label:'জরুরি সিটি ডিরেক্টরি',Icon:Siren},
{href:'/about',label:'অ্যাপ নির্মাতা ও পরিচিতি',sub:'MD. Habibur Rahman',Icon:Info}];
export function Header(){ const [open,setOpen]=useState(false); const [shared,setShared]=useState(''); const s=useSiteSettings();
 const shareApp=async()=>{ setShared(''); const data={title:'বোয়ালখালী কানেক্ট',text:'বোয়ালখালী কানেক্ট — বোয়ালখালী, চট্টগ্রামের নাগরিক সেবা প্ল্যাটফর্ম',url:window.location.origin}; try{ if(navigator.share){ await navigator.share(data); setShared('শেয়ার হয়েছে ✅'); } else if(navigator.clipboard){ await navigator.clipboard.writeText(data.url); setShared('লিংক কপি হয়েছে'); } else { setShared(data.url); } }catch{ /* user cancelled the share sheet */ } };
 return <>
<header className="sticky top-0 bg-white/95 backdrop-blur z-40 border-b border-[var(--line)] shadow-elev-1"><div className="max-w-7xl mx-auto flex items-center gap-3 p-3"><button type="button" aria-label="মেনু খুলুন" onClick={()=>setOpen(true)} className="p-1 rounded-lg hover:bg-emerald-50"><Menu/></button><img src="/api/img/logo" alt="বোয়ালখালী কানেক্ট লোগো" className="w-10 h-10 rounded-xl shrink-0"/><div className="flex-1"><Link href="/" className="font-extrabold text-lg font-display">{s.siteName} <span className="text-brand-600">●</span></Link><p className="text-[11px] text-brand-700">{s.tagline}</p></div><Link href="/notifications" aria-label="নোটিফিকেশন"><Bell/></Link><Link href="/search" aria-label="খুঁজুন" className="bg-brand-800 text-white p-2 rounded-full press"><Search size={18}/></Link></div></header>
<div className={`fixed inset-0 z-[60] flex ${open?'':'pointer-events-none'}`} role="dialog" aria-modal="true" aria-hidden={!open}><div className={`absolute inset-0 bg-black/40 transition-opacity ${open?'opacity-100':'opacity-0'}`} onClick={()=>setOpen(false)}/><aside className={`relative bg-white w-72 max-w-[85vw] h-full shadow-2xl overflow-y-auto transition-transform duration-300 ${open?'translate-x-0':'-translate-x-full'}`}><div className="flex items-center gap-3 p-4 border-b"><img src="/api/img/logo" alt="বোয়ালখালী কানেক্ট লোগো" className="w-10 h-10 rounded-xl shrink-0"/><div className="flex-1"><b className="font-display">{s.siteName}</b><p className="text-[11px] text-brand-700">মেনু</p></div><button type="button" aria-label="মেনু বন্ধ করুন" onClick={()=>setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X/></button></div><nav className="p-2">
{LINKS.slice(0,5).map(({href,label,sub,Icon})=>(<Link key={href} href={href} onClick={()=>setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 font-medium text-[15px]"><Icon size={19} className="text-brand-700 shrink-0"/><span>{label}{sub&&<span className="block text-[11px] text-gray-500 font-normal">{sub}</span>}</span></Link>))}
<button type="button" onClick={shareApp} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 font-medium text-[15px] text-left"><Share2 size={19} className="text-brand-700 shrink-0"/>অ্যাপটি শেয়ার করুন</button>
{shared&&<p className="px-3 py-1.5 text-sm text-brand-700 font-medium" role="status">{shared}</p>}
{LINKS.slice(5).map(({href,label,sub,Icon})=>(<Link key={href} href={href} onClick={()=>setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-50 font-medium text-[15px]"><Icon size={19} className="text-brand-700 shrink-0"/><span>{label}{sub&&<span className="block text-[11px] text-gray-500 font-normal">{sub}</span>}</span></Link>))}
</nav></aside></div>
</> }
