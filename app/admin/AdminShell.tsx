'use client'; import Link from 'next/link'; import {usePathname} from 'next/navigation'; import {useState} from 'react'; import {ROLE_LABELS} from '@/lib/permissions';
// Dedicated Admin Control Center chrome (Admin separation batch S1): admin drawer + header.
// The public site Header/BottomNav never render inside /admin (public pages opt-in via Shell).
export default function AdminShell({user,items,children}:{user:{name:string,role:string},items:{href:string,label:string}[],children:any}){
 const path=usePathname()||'/admin'; const [open,setOpen]=useState(false);
 const active=(h:string)=>h==='/admin'?path==='/admin':path.startsWith(h);
 const title=(items.find(i=>active(i.href))||{label:'ড্যাশবোর্ড'}).label.replace(/^\S+\s+/,'');
 const logout=async()=>{ try{ await fetch('/api/auth/logout',{method:'POST'}); }catch{} location.href='/login'; };
 const side=(<div className="flex flex-col min-h-full"><div className="flex gap-2 items-center"><div className="w-10 h-10 bg-emerald-600 rounded-xl grid place-items-center text-white shrink-0">🛡️</div><div className="min-w-0"><b className="block truncate">বোয়ালখালী কানেক্ট</b><p className="text-xs text-gray-400">অ্যাডমিন কন্ট্রোল সেন্টার</p></div></div>
 <p className="text-[11px] text-gray-400 mt-5 mb-1">পরিচালনা মেনু</p>
 <nav>{items.map(i=>(<Link key={i.href} href={i.href} onClick={()=>setOpen(false)} className={`block py-2 px-3 rounded-xl text-sm font-medium mb-0.5 ${active(i.href)?'bg-emerald-600 text-white':'hover:bg-emerald-50'}`}>{i.label}</Link>))}</nav>
 <div className="mt-auto pt-4"><div className="border-t pt-3"><Link href="/" className="block py-2 px-3 rounded-xl hover:bg-emerald-50 text-sm font-medium">🌐 পাবলিক সাইট দেখুন</Link><button onClick={logout} className="block w-full text-left py-2 px-3 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600">🚪 লগআউট</button></div><p className="text-[11px] text-gray-400 px-3 mt-2">{user.name} • {ROLE_LABELS[user.role]||user.role}</p></div></div>);
 return <div className="flex min-h-screen"><aside className="w-72 shrink-0 bg-white border-r p-4 hidden lg:block sticky top-0 h-screen overflow-auto">{side}</aside>
 {open&&<div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)}/><aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white p-4 overflow-auto shadow-xl">{side}</aside></div>}
 <div className="flex-1 min-w-0 flex flex-col"><header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b px-4 py-3 flex items-center gap-2">
 <button type="button" aria-label="মেনু খুলুন" onClick={()=>setOpen(true)} className="lg:hidden w-10 h-10 grid place-items-center rounded-xl border text-lg">☰</button>
 <div className="font-black truncate">{title}</div>
 <div className="ml-auto flex items-center gap-2"><span className="chip bg-emerald-100 hidden sm:inline-block max-w-[220px] truncate">{user.name} • {ROLE_LABELS[user.role]||user.role}</span><Link href="/" title="পাবলিক সাইট দেখুন" className="w-10 h-10 grid place-items-center rounded-xl border">🌐</Link><button type="button" onClick={logout} title="লগআউট" className="w-10 h-10 grid place-items-center rounded-xl border">🚪</button></div></header>
 <main className="flex-1 p-4 bg-[#f6f8f7] min-w-0">{children}</main></div></div>; }
