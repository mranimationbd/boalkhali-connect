import Link from 'next/link'; import {Home,Grid3X3,Wrench,User,MapPin,BadgeCheck} from 'lucide-react'; import {Header} from './Header'; import {catIcon,catEmoji} from '@/lib/catIcons';
export const bn=(n:any)=>String(n??'').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[+d]);
export function CatIcon({name,color}:{name:string,color:string}){return <div style={{background:color+'18',color}} className="w-14 h-14 rounded-full grid place-items-center text-2xl font-bold">{name.slice(0,1)}</div>}
export function BottomNav(){return <nav className="fixed bottom-0 inset-x-0 bg-[var(--surface)] border-t border-[var(--line)] flex justify-around py-2 z-50 md:hidden shadow-elev-1">{[[ '/','হোম',Home],['/categories','ক্যাটাগরি',Grid3X3],['/services','সেবাসমূহ',Wrench],['/profile','প্রোফাইল',User]].map(([h,l,I]:any)=>(<Link key={h} href={h} className="flex flex-col items-center text-xs text-brand-800"><I size={22}/>{l}</Link>))}</nav>}
export function Shell({children}:{children:any}){return <div className="pb-24 md:pb-8"><Header/>{children}<BottomNav/></div>}

/* ---- 2.0 shared premium components (B1, server-component safe, no hooks) ---- */
export function Badge({tone='neutral',children}:{tone?:'success'|'danger'|'warning'|'info'|'neutral';children:any}){const m:any={success:{background:'var(--success-bg)',color:'var(--success)'},danger:{background:'var(--danger-bg)',color:'var(--danger)'},warning:{background:'var(--warning-bg)',color:'var(--warning)'},info:{background:'var(--info-bg)',color:'var(--info)'},neutral:{background:'#eef2f0',color:'var(--ink-soft)'}};return <span className="chip" style={m[tone]}>{children}</span>}
export function SoldBadge(){return <span className="chip bg-black/70 text-white backdrop-blur-sm">বিক্রি হয়েছে</span>}
export function SponsoredBadge(){return <span className="chip" style={{background:'var(--warning-bg)',color:'var(--warning)'}}>স্পনসরড</span>}
export function VerifiedBadge({label='যাচাইকৃত'}:{label?:string}){return <span className="chip shrink-0" style={{background:'var(--info-bg)',color:'var(--info)'}}><BadgeCheck size={13}/>{label}</span>}
export function UrgentBadge({label='জরুরি'}:{label?:string}){return <span className="chip" style={{background:'var(--danger-bg)',color:'var(--danger)'}}>🔴 {label}</span>}
export function PriceTag({price,className=''}:{price:any;className?:string}){const n=Number(price||0);return n>0?<span className={`num font-black text-brand-700 ${className}`}>{bn(n)} ৳</span>:<span className={`font-bold text-brand-700 ${className}`}>আলোচনা সাপেক্ষে</span>}
export function SectionTitle({title,sub,href,linkLabel}:{title:string;sub?:string;href?:string;linkLabel?:string}){return <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold leading-snug">{title}</h3>{sub&&<p className="text-xs text-gray-500 mt-0.5">{sub}</p>}</div>{href&&<Link href={href} className="chip shrink-0 bg-brand-50 text-brand-700">{linkLabel||'সব দেখুন ›'}</Link>}</div>}
export function EmptyState({icon='📭',title,desc,href,cta}:{icon?:any;title:string;desc?:string;href?:string;cta?:string}){return <div className="card py-10 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-3xl">{icon}</div><h3 className="font-display mt-3 text-lg font-bold">{title}</h3>{desc&&<p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">{desc}</p>}{href&&cta&&<Link href={href} className="btn mt-4">{cta}</Link>}</div>}
export function SkeletonCard(){return <div className="card !p-0 overflow-hidden" aria-hidden="true"><div className="skel aspect-[4/3] w-full !rounded-none"/><div className="space-y-2 p-3"><div className="skel h-4 w-3/4"/><div className="skel h-3 w-1/2"/><div className="skel h-5 w-2/5"/></div></div>}
export function SkeletonList({count=4}:{count?:number}){return <div className="space-y-3" aria-hidden="true">{Array.from({length:count}).map((_,i)=>(<div key={i} className="card flex gap-3"><div className="skel h-20 w-20 shrink-0"/><div className="flex-1 space-y-2 py-1"><div className="skel h-4 w-2/3"/><div className="skel h-3 w-1/3"/><div className="skel h-3 w-1/2"/></div></div>))}</div>}
export function PostCard({p,catName,catColor}:{p:any;catName?:string;catColor?:string}){const color=catColor||'#0a7a54'; const icon=catIcon(p.categorySlug);
 return <Link href={`/post/${p.id}`} className="card lift press block !p-0 overflow-hidden">
  <div className="relative aspect-[4/3] w-full overflow-hidden" style={{background:color+'14'}}>
   {p.image?<img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover"/>:<div className="flex h-full w-full flex-col items-center justify-center gap-1">{icon?<img src={icon} alt="" className="h-20 w-20 object-contain"/>:<span className="text-6xl">{catEmoji(p.categorySlug)}</span>}<span className="text-xs font-bold" style={{color}}>ছবি নেই</span></div>}
   <div className="absolute left-2 top-2 flex gap-1">{p.promoted&&<SponsoredBadge/>}{p.urgent&&<UrgentBadge/>}</div>
   {p.sold&&<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/60 py-2 text-center font-black text-white"><span className="font-display">বিক্রি হয়েছে</span></div>}
  </div>
  <div className="p-3">
   <div className="flex items-start justify-between gap-2"><p className="font-bold leading-snug line-clamp-2">{p.title}</p>{p.verified&&<VerifiedBadge/>}</div>
   {p.location&&<p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} className="shrink-0"/>{p.location}</p>}
   <div className="mt-2 flex items-center justify-between gap-2"><PriceTag price={p.price}/>{catName&&<span className="chip" style={{background:color+'1a',color}}>{catName}</span>}</div>
  </div>
 </Link>}
