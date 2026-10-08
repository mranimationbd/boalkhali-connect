import {readDBAsync} from '@/lib/db'; import Client from './Client';
export const dynamic='force-dynamic';
export const metadata={title:'নতুন পোস্ট করুন — বোয়ালখালী কানেক্ট',description:'বাসা ভাড়া, বাই-সেল, ডাক্তার, রক্তদান, চাকরি ও লোকাল সেবার পোস্ট করুন — বোয়ালখালী, চট্টগ্রাম'};
export default async function P(){const db=await readDBAsync(); const cats=(db.categories||[]).filter((c:any)=>c.enabled).map((c:any)=>({slug:c.slug,name:c.name,desc:c.desc||'',color:c.color||'#0a7a54'})); const locs=(db.locations||[]).map((l:any)=>l.name).filter(Boolean); return <Client cats={cats} locs={locs.length?locs:['কধুরখীল']}/>}
