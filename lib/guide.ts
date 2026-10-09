// Bengali AI Local Guide v1 — RETRIEVAL ONLY (Wave 3). Every answer is assembled
// from records that actually exist in the database (searchAll + live blood counts);
// when nothing matches it says so and offers category links instead. It never
// generates contact numbers, hours, credentials or locations. The emergency block
// mirrors the verified national numbers on /emergency (999 · 16263 · 333); keep the
// two in sync. A generative layer would need an owner-supplied LLM key (inventory
// E1) and is intentionally NOT wired up here — even if a key is configured, v1
// ignores it.
import {CATEGORIES} from './db'; import {searchAll,bnNorm} from './search';
export type GItem={label:string;href:string;sub?:string}; export type GSection={title:string;items:GItem[]};
const bd=(n:any)=>String(n??'').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[+d]);
const EMER_RE=/(জরুরি|জরুরী|অ্যাম্বুলেন্স|এম্বুলেন্স|অগ্নিকাণ্ড|আগুন লেগেছে|পুলিশ|ফায়ার|দুর্ঘটনা|এক্সিডেন্ট|ambulance|emergency|police)/;
const BLOOD_RE=/(রক্ত|ডোনার|blood|donor|ব্লাড)/;
const GROUP_ALIAS:Record<string,string>={ 'এ+':'A+','এ-':'A-','বি+':'B+','বি-':'B-','ও+':'O+','ও-':'O-','এবি+':'AB+','এবি-':'AB-' };
// groupOf reads the RAW query first: bnNorm squashes '-' to a space, so a typed
// 'AB-' would never survive normalization (and '+'-forms must match before that).
function groupOf(raw:any,nq:string):string{ for(const t of String(raw||'').split(/[\s,]+/)){ if(GROUP_ALIAS[t]) return GROUP_ALIAS[t]; const u=t.toUpperCase(); if(/^(AB|A|B|O)[+-]$/.test(u)) return u; } for(const t of nq.split(' ')){ if(GROUP_ALIAS[t]) return GROUP_ALIAS[t]; } return ''; }
function catSection():GSection{ const pick=['house','market','doctor','blood','jobs','food','event','transport']; const items=pick.map(s=>CATEGORIES.find((c:any)=>c.slug===s)).filter(Boolean).map((c:any)=>({label:c.name,href:'/category/'+c.slug,sub:c.desc})); return {title:'🧭 বিভাগ ঘুরে দেখুন',items}; }
export function guideAnswer(db:any,rawQ:any):{sections:GSection[];note:string}{ const q=String(rawQ||'').trim().slice(0,200); const nq=bnNorm(q);
 if(!nq) return {sections:[catSection()],note:'আপনি কী খুঁজছেন লিখুন — যেমন "বাসা ভাড়া", "ডাক্তার", "রক্তদাতা", "দর্শনীয় স্থান" বা যেকোনো জায়গা ও সেবার নাম।'};
 const sections:GSection[]=[];
 // Emergency first: verified national numbers only, exactly as listed on /emergency.
 if(EMER_RE.test(nq)) sections.push({title:'🚨 জরুরি নম্বর (যাচাইকৃত)',items:[{label:'জাতীয় জরুরি নম্বর ৯৯৯ — পুলিশ · ফায়ার · অ্যাম্বুলেন্স',href:'tel:999',sub:'এখনই কল করতে চাপ দিন'},{label:'স্বাস্থ্য বাতায়ন ১৬২৬৩',href:'tel:16263',sub:'সরকারি স্বাস্থ্য পরামর্শ ও হাসপাতালের তথ্য'},{label:'জাতীয় তথ্য ও সেবা ৩৩৩',href:'tel:333',sub:'সরকারি সেবার তথ্য'},{label:'সব জরুরি নম্বর ও সতর্কতা',href:'/emergency'}]});
 const r=searchAll(db,q);
 if(BLOOD_RE.test(nq)){ const g=groupOf(q,nq); const donors=(db.blood_donors||[]).filter((d:any)=>d&&d.available!==false&&(!g||String(d.bloodGroup||'').toUpperCase()===g)); const open=(db.blood_requests||[]).filter((x:any)=>x&&['ACTIVE','OPEN'].includes(String(x.status||'').toUpperCase())); const items:GItem[]=[{label:'রক্তদাতা তালিকায় এখন '+(g?(g+' গ্রুপের '):'')+bd(donors.length)+' জন আছেন',href:'/blood',sub:'রক্তদান পেজে তালিকা ও আবেদন'}]; donors.slice(0,3).forEach((d:any)=>items.push({label:String(d.name||'')+' ('+String(d.bloodGroup||'')+')',href:'/blood',sub:String(d.area||d.location||'')})); items.push({label:'চলমান রক্তের আবেদন: '+bd(open.length)+'টি',href:'/blood'}); sections.push({title:'🩸 রক্তদান',items}); }
 if(r.doctors.length>0) sections.push({title:'🩺 ডাক্তার',items:r.doctors.slice(0,5).map((d:any)=>({label:String(d.name||''),href:'/doctors',sub:[d.specialty,d.chamber].filter(Boolean).join(' • ')}))});
 const byType=new Map<string,any[]>(); (r.contents||[]).forEach((c:any)=>{ const a=byType.get(c.typeSlug)||[]; a.push(c); byType.set(c.typeSlug,a); }); byType.forEach((arr)=>{ sections.push({title:'📌 '+(arr[0].typeName||''),items:arr.slice(0,4).map((c:any)=>({label:String(c.title||''),href:c.typeSlug==='place'?'/boalkhali/'+c.slug:'/content/'+c.typeSlug+'/'+c.slug,sub:String(c.shortDesc||'')}))}); });
 if(r.posts.length>0) sections.push({title:'📝 পোস্ট',items:r.posts.slice(0,5).map((p:any)=>({label:String(p.title||''),href:'/post/'+p.id,sub:[p.location,Number(p.price||0)>0?(bd(p.price)+' ৳'):''].filter(Boolean).join(' • ')}))});
 if(r.jobs.length>0) sections.push({title:'💼 চাকরি',items:r.jobs.slice(0,4).map((j:any)=>({label:String(j.title||''),href:'/jobs',sub:[j.company,j.location].filter(Boolean).join(' • ')}))});
 if(r.restaurants.length>0) sections.push({title:'🍽️ রেস্টুরেন্ট',items:r.restaurants.slice(0,4).map((x:any)=>({label:String(x.name||''),href:'/restaurants',sub:String(x.location||'')}))});
 if(sections.length===0) return {sections:[catSection()],note:'দুঃখিত, "'+q+'" সম্পর্কে সাইটে এখনো কোনো তথ্য পাওয়া যায়নি। নিচের বিভাগগুলো ঘুরে দেখুন — নতুন তথ্য যোগ হলেই এখানে উত্তর পাওয়া যাবে।'};
 return {sections,note:''}; }
