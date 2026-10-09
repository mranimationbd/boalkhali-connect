// Bengali-aware search (A-05/M-23). The old matcher was Latin-substring-only, so the
// audience's own words (বাসা, বাইক) found nothing while 'Bajaj' worked. Matching here is:
//  1) bnNorm — lowercase, য়->য, ড়->র, nukta ় dropped, Bengali digits -> Latin, squashed spaces.
//  2) bnSkel — bnNorm minus combining vowel signs/diacritics, so বাসা still matches বাসা/বাশা spellings
//     typed without exact signs. A field matches when every query token hits norm OR skel.
//  3) synonym/category expansion — common Bengali words map to category slugs and extra terms
//     (বাসা -> house posts, বাইক -> মোটরসাইকেল/market, ডাক্তার -> doctor category + directory).
//  4) blood groups match case-insensitively in any script (b+ , B+ , বি+ -> B+ donor).
import {CATEGORIES} from './db';
import {isExpired} from './expiry';
const BN_DIGITS='০১২৩৪৫৬৭৮৯';
export function bnNorm(s:any){ return String(s||'').toLowerCase().replace(/[০-৯]/g,d=>String(BN_DIGITS.indexOf(d))).replace(/য়/g,'য').replace(/ড়/g,'র').replace(/়/g,'').replace(/[\-_]+/g,' ').replace(/\s+/g,' ').trim(); }
export function bnSkel(s:any){ return bnNorm(s).replace(/[া-ৌঁ-ঃ্]/g,''); }
const _hits=(hayNorm:string,haySkel:string,tokens:string[])=>tokens.every(t=>{ const sk=bnSkel(t); return hayNorm.includes(t)||(sk.length>=3&&haySkel.includes(sk)); });
const SYN:Record<string,{slugs?:string[],terms?:string[],doctor?:boolean,blood?:boolean,jobs?:boolean}>={ 'বাসা':{slugs:['house'],terms:['ফ্ল্যাট','মেস','রুম','বাড়ি']},'বাড়ি':{slugs:['house'],terms:['বাসা','ফ্ল্যাট']},'ফ্ল্যাট':{slugs:['house'],terms:['বাসা']},'মেস':{slugs:['house'],terms:['বাসা','রুম']},'বাইক':{slugs:['market'],terms:['মোটরসাইকেল','motorcycle','bike']},'মোটরসাইকেল':{slugs:['market'],terms:['বাইক','bike']},'মোবাইল':{slugs:['market','mobile'],terms:['ফোন','স্মার্টফোন','phone']},'ডাক্তার':{slugs:['doctor'],terms:['চিকিৎসক','doctor'],doctor:true},'চিকিৎসক':{slugs:['doctor'],terms:['ডাক্তার'],doctor:true},'রক্ত':{slugs:['blood'],blood:true},'রক্তদাতা':{slugs:['blood'],blood:true},'ডোনার':{slugs:['blood'],blood:true},'চাকরি':{slugs:['jobs'],terms:['নিয়োগ','job'],jobs:true},'নিয়োগ':{slugs:['jobs'],terms:['চাকরি'],jobs:true},'জব':{slugs:['jobs'],jobs:true},'খাবার':{slugs:['food'],terms:['রেস্টুরেন্ট','খাবার']},'রেস্টুরেন্ট':{slugs:['food'],terms:['খাবার']},'গাড়ি':{slugs:['driver','transport','market'],terms:['car','ভাড়া']},'ইলেকট্রিশিয়ান':{slugs:['electrician']},'প্লাম্বার':{slugs:['plumber']},'শিক্ষক':{slugs:['tutor'],terms:['টিউশন','গৃহশিক্ষক']},'টিউশন':{slugs:['tutor'],terms:['শিক্ষক']} };
const GROUP_ALIAS:Record<string,string>={ 'এ+':'A+','এ-':'A-','বি+':'B+','বি-':'B-','ও+':'O+','ও-':'O-','এবি+':'AB+','এবি-':'AB-' };
// synonym lookup happens on NORMALIZED tokens, so the map keys must be normalized too (বাড়ি -> বারি)
const SYNN:Record<string,any>={}; for(const k of Object.keys(SYN)) SYNN[bnNorm(k)]=SYN[k];
function groupOf(tokens:string[]):string{ for(const t of tokens){ const u=t.toUpperCase(); if(/^(AB|A|B|O)[+-]$/.test(u)) return u; if(GROUP_ALIAS[t]) return GROUP_ALIAS[t]; } return ''; }
export function searchAll(db:any,qRaw:string,f:{category?:string,area?:string,minPrice?:number,maxPrice?:number,sort?:string}={}){ const q=bnNorm(qRaw); const tokens=q?q.split(' '):[]; const synSlugs=new Set<string>(); const synTerms:string[]=[]; let wantDoctor=false, wantBlood=false, wantJobs=false; for(const t of tokens){ const s=SYNN[t]; if(s){ (s.slugs||[]).forEach(x=>synSlugs.add(x)); (s.terms||[]).forEach(x=>synTerms.push(bnNorm(x))); if(s.doctor) wantDoctor=true; if(s.blood) wantBlood=true; if(s.jobs) wantJobs=true; } }
 const catName:any={}; for(const c of CATEGORIES) catName[c.slug]=c.name; for(const c of (db.categories||[])) if(c&&c.slug) catName[c.slug]=c.name||catName[c.slug];
 const matchField=(useSyn:boolean,...fields:any[])=>{ const h=fields.map(x=>String(x||'')).join(' '); const hn=bnNorm(h); const hs=bnSkel(h); if(_hits(hn,hs,tokens)) return true; return useSyn&&synTerms.some(t=>{ const sk=bnSkel(t); return hn.includes(t)||(sk.length>=3&&hs.includes(sk)); }); };
 let posts=(db.posts||[]).filter((p:any)=>p.status==='APPROVED'&&!isExpired(p)&&(!f.category||p.categorySlug===f.category)&&(!f.area||String(p.location||'').includes(f.area))&&(!f.minPrice||Number(p.price||0)>=f.minPrice)&&(!f.maxPrice||Number(p.price||0)<=f.maxPrice));
 if(q){ const scored=posts.map((p:any)=>({p,direct:matchField(true,p.title,p.desc,p.location,p.landmark,p.subcategory,catName[p.categorySlug],p.categorySlug),viaCat:synSlugs.has(p.categorySlug)})).filter((x:any)=>x.direct||x.viaCat); posts=scored.sort((a:any,b:any)=>(Number(b.direct)-Number(a.direct))||String(b.p.createdAt||'').localeCompare(String(a.p.createdAt||''))).map((x:any)=>x.p); }
 if(f.sort==='price_asc') posts=[...posts].sort((a:any,b:any)=>Number(a.price||0)-Number(b.price||0)); else if(f.sort==='price_desc') posts=[...posts].sort((a:any,b:any)=>Number(b.price||0)-Number(a.price||0)); else if(!q) posts=[...posts].sort((a:any,b:any)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const g=groupOf(tokens);
 const donors=q?(db.blood_donors||[]).filter((d:any)=>{ if(g) return String(d.bloodGroup||'').toUpperCase()===g; if(wantBlood) return true; return matchField(false,d.name,d.bloodGroup,d.location,d.area); }):[];
 const doctors=q?(db.doctors||[]).filter((d:any)=>wantDoctor||matchField(false,d.name,d.specialty,d.chamber,d.address)):[];
 const liveJobs=(db.jobs||[]).filter((j:any)=>!isExpired(j)); const jobs=q?(wantJobs?liveJobs:liveJobs.filter((j:any)=>matchField(false,j.title,j.company,j.location,j.desc))):[]; const restaurants=q?(db.restaurants||[]).filter((r:any)=>matchField(false,r.name,r.category,r.location,r.menu)):[];
 // CMS contents: ONLY published items of enabled, public types — drafts/pending/archived/
 // trashed are hard-excluded from public search exactly as they 404 on public routes.
 const pubTypes=new Set((db.content_types||[]).filter((t:any)=>t&&t.enabled!==false&&t.publicListing).map((t:any)=>t.slug)); const typeName:any={}; (db.content_types||[]).forEach((t:any)=>{ typeName[t.slug]=t.nameBn||t.nameEn||t.slug; });
 const contents=q?(db.contents||[]).filter((c:any)=>c&&c.status==='PUBLISHED'&&pubTypes.has(c.typeSlug)).filter((c:any)=>matchField(false,c.titleBn,c.titleEn,c.shortDesc,c.slug,typeName[c.typeSlug],(c.tags||[]).join(' '))).map((c:any)=>({id:c.id,typeSlug:c.typeSlug,typeName:typeName[c.typeSlug]||c.typeSlug,slug:c.slug,title:c.titleBn||c.titleEn,shortDesc:c.shortDesc||'',href:'/content/'+c.typeSlug+'/'+c.slug})):[];
 return {posts,donors,doctors,jobs,restaurants,contents}; }
