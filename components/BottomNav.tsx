'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Home,Grid3X3,Plus,Bookmark,User} from 'lucide-react';

/* 2.0 B2 — mobile 5-tab bottom nav (citizen routes only; hidden on /admin). */
const RING='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';
const ACTIVE=' font-bold text-brand-700';
const IDLE=' font-semibold text-[var(--ink-soft)]';

function Tab({href,label,Icon,active}:{href:string;label:string;Icon:any;active:boolean}){
  const cls='flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] press '+RING+(active?ACTIVE:IDLE);
  return (
    <Link href={href} aria-current={active?'page':undefined} className={cls}>
      <Icon size={22} className={active?'scale-110':''}/>
      <span>{label}</span>
      <span className={'h-1 w-1 rounded-full '+(active?'bg-brand-600':'bg-transparent')}/>
    </Link>
  );
}

export function BottomNav(){
  const path=usePathname()||'/';
  if(path.startsWith('/admin'))return null;
  const createActive=path==='/create';
  const centerCls='flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] press '+RING+(createActive?ACTIVE:IDLE);
  const circleCls='-mt-7 grid h-14 w-14 place-items-center rounded-full border-4 border-[var(--surface)] text-white shadow-elev-2 '+(createActive?'bg-brand-600':'bg-brand-800');
  return (
    <nav aria-label="প্রধান নেভিগেশন" className="fixed inset-x-0 bottom-0 z-nav border-t border-[var(--line)] bg-[var(--surface)] shadow-elev-2 md:hidden" style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
      <div className="grid grid-cols-5 items-end px-1">
        <Tab href="/" label="হোম" Icon={Home} active={path==='/'}/>
        <Tab href="/categories" label="ক্যাটাগরি" Icon={Grid3X3} active={path.startsWith('/categor')}/>
        <Link href="/create" aria-label="নতুন পোস্ট করুন" aria-current={createActive?'page':undefined} className={centerCls}>
          <span className={circleCls}><Plus size={26}/></span>
          <span>পোস্ট</span>
          <span className={'h-1 w-1 rounded-full '+(createActive?'bg-brand-600':'bg-transparent')}/>
        </Link>
        <Tab href="/saved" label="সংরক্ষিত" Icon={Bookmark} active={path==='/saved'}/>
        <Tab href="/profile" label="প্রোফাইল" Icon={User} active={path.startsWith('/profile')||path.startsWith('/my-posts')}/>
      </div>
    </nav>
  );
}
