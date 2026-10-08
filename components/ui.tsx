import Link from 'next/link'; import {Home,Grid3X3,Wrench,User} from 'lucide-react'; import {Header} from './Header';
export const bn=(n:any)=>String(n??'').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[+d]);
export function CatIcon({name,color}:{name:string,color:string}){return <div style={{background:color+'18',color}} className="w-14 h-14 rounded-full grid place-items-center text-2xl font-bold">{name.slice(0,1)}</div>}
export function BottomNav(){return <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 z-50 md:hidden">{[[ '/','হোম',Home],['/categories','ক্যাটাগরি',Grid3X3],['/services','সেবাসমূহ',Wrench],['/profile','প্রোফাইল',User]].map(([h,l,I]:any)=>(<Link key={h} href={h} className="flex flex-col items-center text-xs text-emerald-800"><I size={22}/>{l}</Link>))}</nav>}
export function Shell({children}:{children:any}){return <div className="pb-24 md:pb-8"><Header/>{children}<BottomNav/></div>}
