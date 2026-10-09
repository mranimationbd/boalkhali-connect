'use client';
// Footer (F2: brand fields now come from db.settings via SiteSettings; ui.tsx re-exports this).
import Link from 'next/link'; import {VisitorCounter} from './VisitorCounter'; import {useSiteSettings} from './SiteSettings';
const bn=(n:any)=>String(n??'').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[+d]);
export function Footer(){ const s=useSiteSettings(); const year=bn(new Date().getFullYear()); const links:[string,string][]=[['/categories','ক্যাটাগরিসমূহ'],['/emergency','জরুরি সেবা'],['/content','তথ্য ভাণ্ডার'],['/directory','ডিরেক্টরি ও মানচিত্র'],['/education','শিক্ষা প্রতিষ্ঠান'],['/businesses','স্থানীয় ব্যবসা'],['/blood','রক্তদান'],['/doctors','ডাক্তার ডিরেক্টরি'],['/volunteers','স্বেচ্ছাসেবীবৃন্দ'],['/boalkhali','বোয়ালখালীকে জানুন'],['/complaint','অভিযোগ জানান'],['/privacy','গোপনীয়তা নীতি'],['/terms','শর্তাবলী'],['/about','নির্মাতা ও পরিচিতি']];
 return <footer className="mt-12 border-t border-[var(--line)] bg-[var(--surface)]"><div className="mx-auto max-w-5xl px-4 py-6">
  <div className="flex items-center gap-3"><img src="/api/img/logo" alt="সাইট লোগো" className="h-10 w-10 rounded-xl shrink-0"/><div><b className="font-display">{s.siteName}</b><p className="text-[11px] text-gray-500">{s.tagline}</p></div></div>
  <VisitorCounter/>
  <nav aria-label="ফুটার লিংক" className="mt-4 flex flex-wrap gap-x-4 gap-y-2">{links.map(([h,l])=>(<Link key={h} href={h} className="rounded px-0.5 text-sm text-[var(--ink-soft)] hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">{l}</Link>))}</nav>
  {(s.contactPhone||s.contactEmail)&&<p className="mt-4 text-xs text-gray-500">যোগাযোগ: {s.contactPhone&&<a className="font-bold" href={`tel:${s.contactPhone}`}>📞 {bn(s.contactPhone)}</a>}{s.contactPhone&&s.contactEmail?' • ':''}{s.contactEmail&&<a className="font-bold" href={`mailto:${s.contactEmail}`}>✉️ {s.contactEmail}</a>}</p>}
  <p className="mt-4 text-xs text-gray-400">নির্মাতা ও পরিচালক: MD. Habibur Rahman</p>
  <p className="text-xs text-gray-400">© {year} {s.siteName} — সর্বস্বত্ব সংরক্ষিত</p>
 </div></footer>}
