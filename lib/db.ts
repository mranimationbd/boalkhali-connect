import fs from 'fs'; import path from 'path'; import crypto from 'crypto';
const ON_VERCEL=!!(process.env.VERCEL||process.env.NETLIFY||process.env.AWS_LAMBDA_FUNCTION_NAME);
export const DB_PATH=process.env.DB_PATH||(ON_VERCEL?'/tmp/boalkhali-db.json':path.join(process.cwd(),'data','db.json'));
export const UPLOAD_DIR=process.env.UPLOAD_DIR||(ON_VERCEL?'/tmp/boalkhali-uploads':path.join(process.cwd(),'public','uploads'));
export const UPLOAD_QUOTA_BYTES=Math.floor((Number(process.env.UPLOAD_QUOTA_GB)||5)*1024*1024*1024); // posting uploads quota: 5 GB (user, 2026-10-08)
// ---- DB backend selection (2026-10-08): Firestore when all 3 service-account env vars are set, else local file ----
// Firestore stores the ENTIRE DB as one JSON string in doc bk_state/main (~22KB today; Firestore doc limit 1MB — revisit if state grows past ~800KB). The doc additionally carries a numeric `v` field: the optimistic-concurrency version used by mutateDBAsync/writeDBAsync (see the concurrency core below).
export const DB_BACKEND:'firestore'|'file'=(process.env.FIREBASE_PROJECT_ID&&process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY)?'firestore':'file';
let _fsDb:any=null; let _fsInit:Promise<any>|null=null; let _fsCache:{db:any,at:number,v:number}|null=null; const FS_TTL_MS=3000;
// ---- Concurrency core (2026-10-09 data-integrity batch) ----
// Root cause of the audit's silent data loss: readDBAsync hands out a whole-state snapshot and
// writeDBAsync wrote the whole state straight back, so any writer holding a stale snapshot
// (Firestore network latency + the 3s cache above, concurrent serverless instances, or an await
// between read and write) silently overwrote newer records — posts/users vanished with no error.
// Fix, two layers: (1) mutateDBAsync(fn) re-reads fresh state and applies fn under an optimistic
// version check (Firestore transaction on the doc's `v` field, re-running fn on mismatch) or a
// single-process FIFO queue (file backend). High-risk routes use it: register, session creation
// (login/firebase), post create, moderate, admin users, secret intake/actions, track, upload bytes.
// (2) Legacy writeDBAsync(db) can no longer clobber: every readDBAsync result is stamped
// (WeakMap, invisible to JSON) with its base snapshot; if the stored state has moved on by write
// time, a three-way merge — per top-level key, id-keyed inside arrays — keeps BOTH writers'
// changes instead of dropping one side wholesale.
// RESIDUAL RISK (honest): two writers editing the SAME record concurrently still resolve
// last-writer-wins for that record, and a delete racing an edit of the same record resolves to
// the delete. Scalars inside shared objects (e.g. meta.*) are not field-merged. bk_state/main
// also remains ONE Firestore document (~1MB ceiling): splitting into per-collection documents
// is the eventual cure and is still owed. Unknown top-level keys pass through merges untouched.
const _dbBase=new WeakMap<object,{v:number,snap:string}>();
function _stamp(db:any,v:number){ try{ _dbBase.set(db,{v,snap:JSON.stringify(db)}); }catch{} return db; }
const _jeq=(a:any,b:any)=>{ try{ return JSON.stringify(a)===JSON.stringify(b); }catch{ return a===b; } };
function _mergeArr(base:any[],mine:any[],cur:any[]):any[]{ const keyOf=(r:any)=>(r&&typeof r==='object'&&r.id!==undefined&&r.id!==null)?String(r.id):null; if([...base,...mine,...cur].some(r=>keyOf(r)===null)) return mine; const bm=new Map(base.map(r=>[keyOf(r),r])), mm=new Map(mine.map(r=>[keyOf(r),r])), cm=new Map(cur.map(r=>[keyOf(r),r])); const out:any[]=[]; const seen=new Set<string>();
 for(const r of mine){ const k=keyOf(r) as string; if(!bm.has(k)&&!cm.has(k)){ out.push(r); seen.add(k); } }
 for(const r of cur){ const k=keyOf(r) as string; if(seen.has(k)) continue; seen.add(k); if(!mm.has(k)){ if(bm.has(k)) continue; out.push(r); continue; } const m=mm.get(k), b=bm.get(k); out.push(b!==undefined&&_jeq(m,b)?r:m); }
 for(const r of mine){ const k=keyOf(r) as string; if(seen.has(k)) continue; seen.add(k); if(!cm.has(k)&&bm.has(k)) continue; out.push(r); }
 return out; }
function _merge3(base:any,mine:any,cur:any):any{ const out:any={}; const keys=Array.from(new Set([...Object.keys(base||{}),...Object.keys(mine||{}),...Object.keys(cur||{})])); for(const k of keys){ const b=base?base[k]:undefined, m=mine?mine[k]:undefined, c=cur?cur[k]:undefined; if(_jeq(m,b)) out[k]=c; else if(_jeq(c,b)) out[k]=m; else if(Array.isArray(m)&&Array.isArray(c)) out[k]=_mergeArr(Array.isArray(b)?b:[],m,c); else out[k]=m; } return out; }
let _fileQ:Promise<any>=Promise.resolve();
function _withFileLock<T>(f:()=>Promise<T>):Promise<T>{ const run=_fileQ.then(f,f); _fileQ=run.then(()=>undefined,()=>undefined); return run; }
export async function mutateDBAsync<T>(fn:(db:any)=>T|Promise<T>):Promise<T>{
 if(DB_BACKEND==='file'){ return _withFileLock(async()=>{ const db=_stamp(readFileDB(),0); const out=await fn(db); writeFileDB(db); return out; }); }
 const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main');
 for(let i=0;i<8;i++){ let db:any, v=0; const snap=await ref.get(); if(!snap.exists){ db=normalizeDB(seedDB()); } else { const d:any=snap.data()||{}; v=Number(d.v)||0; try{ db=normalizeDB(JSON.parse(d.json||'')); }catch{ throw new Error('FIRESTORE_STATE_CORRUPT: bk_state/main json field is not valid JSON'); } }
  const out=await fn(db); const json=JSON.stringify(db); let ok=false;
  await fsdb.runTransaction(async(tx:any)=>{ const s2=await tx.get(ref); const curV=s2.exists?Number((s2.data()||{}).v)||0:0; if(curV!==v) return; tx.set(ref,{json,v:v+1,updatedAt:new Date().toISOString()}); ok=true; });
  if(ok){ _fsCache={db:JSON.parse(json),at:Date.now(),v:v+1}; return out; }
  await new Promise(r=>setTimeout(r,20*(i+1))); }
 throw new Error('DB_WRITE_CONTENTION: mutation failed after 8 retries'); }
async function firebaseAdmin():Promise<any>{ try{ const mod:any=await import('firebase-admin'); const admin=mod.default||mod; if(!admin.apps.length){ admin.initializeApp({credential:admin.credential.cert({projectId:process.env.FIREBASE_PROJECT_ID as string,clientEmail:process.env.FIREBASE_CLIENT_EMAIL as string,privateKey:(process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g,'\n')})}); } return admin; }catch(e:any){ throw new Error('FIRESTORE_INIT_FAILED: '+(e?.message||e)); } }
export async function getFirebaseAdmin():Promise<any>{ if(DB_BACKEND!=='firestore') throw new Error('FIREBASE_NOT_CONFIGURED'); return firebaseAdmin(); }
async function firestoreDB():Promise<any>{ if(_fsDb) return _fsDb; if(_fsInit) return _fsInit; _fsInit=(async()=>{ const admin=await firebaseAdmin(); _fsDb=admin.firestore(); return _fsDb; })(); return _fsInit; }
export function uploadUsageBytes(){ try{ return fs.readdirSync(UPLOAD_DIR).reduce((a,f)=>{try{return a+fs.statSync(path.join(UPLOAD_DIR,f)).size}catch{return a}},0);}catch{return 0} }
// Persisted upload-byte counter (single source of truth for quota + health panel). Incremented by lib/imageStore on every save/delete.
export function uploadCounterBytes(db:any){ return (db&&db.meta&&typeof db.meta.uploadBytesUsed==='number')?db.meta.uploadBytesUsed:0; }
export async function addUploadBytes(n:number){ return mutateDBAsync((db:any)=>{ if(!db.meta||typeof db.meta!=='object'||Array.isArray(db.meta)) db.meta={uploadBytesUsed:0}; db.meta.uploadBytesUsed=Math.max(0,(Number(db.meta.uploadBytesUsed)||0)+n); return db.meta.uploadBytesUsed; }); }
export type Role='CITIZEN'|'BUSINESS'|'SERVICE_PROVIDER'|'MODERATOR'|'ADMIN'|'SUPER_ADMIN';
export function id(p='id'){return p+'_'+crypto.randomBytes(6).toString('hex')}
export function now(){return new Date().toISOString()}
export const CATEGORIES=[
['house','বাসা ভাড়া','Home','#0a7a54','বাসা / মেস / দোকান'],['market','বাই-সেল','ShoppingBag','#2563eb','মোবাইল / আসবাব / পণ্য'],['doctor','ডাক্তার','Stethoscope','#0d9488','চিকিৎসা সেবা'],['blood','রক্তদান','Droplet','#e11d48','জরুরি রক্ত'],['secret','গোপন তথ্য','ShieldAlert','#dc2626','১০০% গোপনীয় রিপোর্ট'],['food','রেস্টুরেন্ট ও খাবার','UtensilsCrossed','#ea580c','বোয়ালখালীর স্পেশাল স্বাদ'],['transport','বাস ও ট্রেন','Bus','#059669','যাতায়াত ও সময়সূচী'],['jobs','চাকরি ও নিয়োগ','Briefcase','#7c3aed','চাকরি'],['lost','হারানো ও প্রাপ্তি','PackageSearch','#c2410c','হারানো জিনিস'],['legal','আইনগত সহায়তা','Scale','#334155','আইনি সেবা'],['event','অনুষ্ঠান ও ডেকোর','PartyPopper','#a21caf','ইভেন্ট'],['electrician','ইলেকট্রিশিয়ান','Zap','#ca8a04','ওয়্যারিং / ফ্যান / লাইন'],['plumber','প্লাম্বার','Wrench','#0891b2','স্যানিটারি / পাইপলাইন'],['ac','এসি/ফ্রিজ','Wind','#0284c7','সার্ভিসিং / গ্যাস চার্জ'],['driver','ড্রাইভার','Car','#6d28d9','ব্যক্তিগত / রেন্টাল কার'],['tutor','গৃহশিক্ষক','BookOpen','#9333ea','টিউশন / কোচিং'],['vet','পশু চিকিৎসক','PawPrint','#db2777','প্রাণী ও খামার সেবা'],['mason','রাজমিস্ত্রি','Hammer','#b45309','বাড়ি ও কনস্ট্রাকশন'],['mobile','মোবাইল মেকার','Smartphone','#1d4ed8','সার্ভিসিং ও রিপেয়ার']
].map((c,i)=>({id:id('cat'),slug:c[0],name:c[1],icon:c[2],color:c[3],desc:c[4],order:i+1,enabled:true,subcategories:[]}));
export const LOCATIONS=['কধুরখীল','বোয়ালখালী বাজার','বোয়ালখালী বাস স্ট্যান্ড','কালুরঘাট রোড','চৌমুহনী বাজার','বোয়ালখালী সুপার মার্কেট','কধুরখীল মোড়','কালুরঘাট মোড়','ওয়ার্ড ১','ওয়ার্ড ২'].map((n,i)=>({id:id('loc'),name:n,area:n,road:'',landmark:'',lat:22.382+ i*0.001,lng:91.921+i*0.001}));
function seedDB(){
 const adminEmail=(process.env.ADMIN_EMAIL||'admin@boalkhali.local').toLowerCase();
 const hash=(pw:string)=>{const s=crypto.randomBytes(16).toString('hex');const h=crypto.scryptSync(pw,s,64).toString('hex');return s+':'+h};
 const db:any={users:[{id:'u_owner',name:'MD. Habibur Rahman',email:'habiburrahman962540@gmail.com',passwordHash:hash('OwnerDemo123!'),role:'SUPER_ADMIN',membership:'PREMIUM CITIZEN',verified:true,phone:'',area:'বোয়ালখালী',address:'বোয়ালখালী, বাংলাদেশ',privacyMode:false,createdAt:now(),totalPosts:1,publishedPosts:1},{id:'u_admin',name:'Admin',email:adminEmail,passwordHash:hash(process.env.ADMIN_PASSWORD||'admin'),role:'ADMIN',membership:'PREMIUM CITIZEN',verified:true,createdAt:now(),totalPosts:0,publishedPosts:0},{id:'u_citizen',name:'Test Citizen',email:'citizen@boalkhali.local',passwordHash:hash('Citizen123!'),role:'CITIZEN',membership:'FREE',verified:true,createdAt:now(),totalPosts:0,publishedPosts:0}],roles:['CITIZEN','BUSINESS','SERVICE_PROVIDER','MODERATOR','ADMIN','SUPER_ADMIN'],categories:CATEGORIES,subcategories:[],locations:LOCATIONS,feature_flags:CATEGORIES.map(c=>({categorySlug:c.slug,enabled:true,updatedAt:now()})),posts:[],post_images:[],saved_posts:[],restaurants:[],menus:[],doctors:[],blood_donors:[],blood_requests:[],jobs:[],services:[],service_providers:[],lost_found:[],complaints:[],secret_reports:[],emergency_alerts:[],announcements:[{id:id('ann'),title:'স্বাগতম! আমরা আছি আপনার পাশে',body:'বোয়ালখালী কানেক্টে স্বাগতম',active:true,createdAt:now()}],notifications:[],advertisements:[],memberships:[{id:id('mem'),userId:'u_owner',plan:'PREMIUM CITIZEN',status:'ACTIVE',createdAt:now()}],reviews:[],transport_routes:[{id:id('tr'),type:'train',name:'কর্ণফুলী এক্সপ্রেস',route:'বোয়ালখালী → চট্টগ্রাম',time:'08:00',station:'বোয়ালখালী বাস স্ট্যান্ড'},{id:id('tr'),type:'bus',name:'বোয়ালখালী → চট্টগ্রাম বাস',route:'বোয়ালখালী → চট্টগ্রাম',time:'07:30',station:'বাস টার্মিনাল'}],transport_schedules:[],audit_logs:[],system_metrics:[],sessions:[],tokens:[]};
 const P=(o:any)=>({views:0,createdAt:now(),status:'APPROVED',verified:false,promoted:false,...o});
 db.posts.push(P({id:'p_bike',userId:'u_owner',categorySlug:'market',title:'Bajaj Discover 125cc ডিস্ক ব্রেক মোটরসাইকেল',desc:'ভালো কন্ডিশন, সব কাগজ আপডেট',price:88000,location:'বোয়ালখালী বাজার, বোয়ালখালী',landmark:'বোয়ালখালী বাজার',phone:'01712445566',whatsapp:'01712445566',promoted:true,image:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'}));
 db.posts.push(P({id:'p_phone',userId:'u_owner',categorySlug:'market',title:'Redmi Note 12 Pro (8GB/128GB) স্মার্টফোন',desc:'ফুল বক্স, অল্প ব্যবহৃত',price:16500,location:'বোয়ালখালী সুপার মার্কেট, বোয়ালখালী',phone:'01712445566',image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'}));
 db.posts.push(P({id:'p_house',userId:'u_citizen',categorySlug:'house',title:'কধুরখীল মোড়ে ৩ রুমের ফ্যামিলি বাসা ভাড়া',desc:'৩ রুম + ড্রয়িং, টাইলস, পানির সুবিধা',price:8500,location:'কধুরখীল',subcategory:'ফ্যামিলি বাসা',rooms:'৩ রুম + ড্রয়িং'}));
 db.restaurants.push({id:'r1',name:'বোম্বে সুইটস ও কনফেকশনারি',category:'ঐতিহ্যবাহী মিষ্টি',price:'৩৫০ ৳/কেজি',location:'কালুরঘাট রোড, বোয়ালখালী',verified:true,delivery:false,menu:'চামচম, রসগোল্লা, ক্ষীরভোগ',desc:'খাঁটি গাভীর দুধের চামচম, ক্ষীরসা, কাঁচাগোল্লা ও জিলাপি',image:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',phone:'01710000001'},{id:'r2',name:'বোয়ালখালী স্পেশাল বিরিয়ানি ও কাচ্চি ঘর',category:'বিরিয়ানি ও কাবাব',price:'১৮০ ৳/প্লেট',location:'উপজেলা মোড়, বোয়ালখালী',verified:true,delivery:true,menu:'শাহী কাচ্চি, বিফ তেহারি, মোরগ পোলাও',desc:'খাসির শাহী কাচ্চি, সরিষার তেলে রান্না বিফ তেহারি',image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',phone:'01710000002'});
 db.jobs.push({id:'j1',title:'চৌমুহনী বাজারের শীর্ষ কাপড়ের শোরুমে সেলস এক্সিকিউটিভ আবশ্যক',company:'আল-মদিনা ফ্যাশন হাউজ',type:'FULL-TIME',salary:'১২,০০০ - ১৫,০০০ ৳ (কমিশনসহ)',deadline:'২০২৬-09-25',location:'চৌমুহনী বাজার ২য় তলা, বোয়ালখালী',verified:true,desc:'গ্রাহকদের সাথে মার্জিত আচরণ ও সেলস হ্যান্ডেল করতে হবে। ন্যূনতম এসএসসি পাস।',phone:'01712445566'},{id:'j2',title:'আধুনিক অফসেট প্রেসে গ্রাফিক্স ডিজাইনার ও কম্পিউটার অপারেটর',company:'বোয়ালখালী ডিজিটাল প্রেস',type:'FULL-TIME',salary:'১৪,০০০ - ১৮,০০০ ৳',deadline:'২০২৬-09-30',location:'কালুরঘাট রোড, বোয়ালখালী',verified:true,desc:'অফসেট প্রেসে কাজের অভিজ্ঞতা থাকতে হবে',phone:'01712445567'});
 db.doctors.push({id:'d1',name:'ডা. আব্দুল করিম',specialty:'মেডিসিন',chamber:'বোয়ালখালী মেডিকেল',address:'বোয়ালখালী সদর রোড',phone:'01710000003',hours:'বিকাল ৪টা - রাত ৯টা',fee:500,verified:true,emergency:true});
 db.blood_requests.push({id:'b1',patient:'মোছাঃ রোকেয়া বেগম (৫৫)',bloodGroup:'B+',location:'বোয়ালখালী হাসপাতাল',urgency:'CRITICAL',contact:'01710000004',status:'ACTIVE',createdAt:now()});
 db.blood_donors.push({id:'bd1',name:'রাহিম উদ্দিন',bloodGroup:'B+',phone:'01710000005',location:'কধুরখীল',available:true,lastDonation:'2026-06-01'});
 db.emergency_alerts.push({id:'e1',title:'জরুরি সতর্কতা',body:'জরুরি প্রয়োজনে যোগাযোগ করুন',severity:'HIGH',active:true,createdAt:now()});
 db.advertisements.push({id:'ad1',title:'মেগা ফ্যাশন পয়েন্ট • ঈদ ও শীতের মেগা ছাড়',body:'সর্বোচ্চ ৫০% পর্যন্ত ছাড়! শীত ও উৎসবের কেনাকাটায় সেরা ছাড়',image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',status:'APPROVED',promoted:true,impressions:120,clicks:12,startDate:now(),endDate:now()});
 db.service_providers.push({id:'s1',name:'করিম ইলেকট্রিশিয়ান',service:'ইলেকট্রিশিয়ান',location:'বোয়ালখালী বাজার',phone:'01710000006',experience:'৫ বছর',pricing:'৩০০৳ থেকে',verified:true,rating:4.8},{id:'s2',name:'সুমন প্লাম্বার',service:'প্লাম্বার',location:'কধুরখীল',phone:'01710000007',experience:'৩ বছর',pricing:'২৫০৳ থেকে',verified:false,rating:4.5});
 db.complaints.push({id:'c1',userId:'u_citizen',type:'রাস্তা',desc:'কধুরখীল রাস্তায় পানি জমে আছে',location:'কধুরখীল',status:'NEW',createdAt:now()});
 db.secret_reports.push({id:'sec1',title:'গোপন রিপোর্ট ১',desc:'(Admin only) নাগরিকের গোপন তথ্য',priority:'HIGH',status:'NEW',createdAt:now(),submitterHidden:true});
 db.volunteers=[];
 return db;
}
// Every array collection the codebase reads. Loaded state (file OR Firestore doc) is normalized through
// normalizeDB() so a collection missing from an older/partial stored DB can never crash a page with
// "Cannot read properties of undefined" (root cause of the 2026-10-08 admin 500s: pages read collections
// the seed never created). New collections used anywhere MUST be added here.
export const DB_COLLECTIONS=['users','roles','categories','subcategories','locations','feature_flags','posts','post_images','saved_posts','restaurants','menus','doctors','blood_donors','blood_requests','jobs','services','service_providers','lost_found','complaints','secret_reports','emergency_alerts','announcements','notifications','advertisements','memberships','reviews','transport_routes','transport_schedules','audit_logs','system_metrics','sessions','tokens','volunteers','reports','post_comments','visits'];
export function normalizeDB(d:any):any{ if(!d||typeof d!=='object'||Array.isArray(d)) d={}; for(const k of DB_COLLECTIONS){ if(!Array.isArray(d[k])) d[k]=[]; } if(!d.visitStats||typeof d.visitStats!=='object'||Array.isArray(d.visitStats)) d.visitStats={total:0,byDay:{}}; if(typeof d.visitStats.total!=='number') d.visitStats.total=0; if(!d.visitStats.byDay||typeof d.visitStats.byDay!=='object') d.visitStats.byDay={}; if(!d.meta||typeof d.meta!=='object'||Array.isArray(d.meta)) d.meta={}; if(typeof d.meta.uploadBytesUsed!=='number') d.meta.uploadBytesUsed=0; if(!d.vanalytics||typeof d.vanalytics!=='object'||Array.isArray(d.vanalytics)) d.vanalytics={days:{},total:0,since:null,logs:[]}; if(!d.vanalytics.days||typeof d.vanalytics.days!=='object'||Array.isArray(d.vanalytics.days)) d.vanalytics.days={}; if(typeof d.vanalytics.total!=='number') d.vanalytics.total=0; if(!Array.isArray(d.vanalytics.logs)) d.vanalytics.logs=[];
 // Blood-request status canonicalization (2026-10-09): legacy records were written as 'OPEN'
 // while the dashboard counts only 'ACTIVE' — the two views disagreed. ACTIVE is now the single
 // canonical open-state: every read normalizes OPEN -> ACTIVE, and the create path writes ACTIVE
 // only, so any subsequent write persists the canonical value. isOpen() readers still accept both.
 if(Array.isArray(d.blood_requests)) for(const r of d.blood_requests){ if(r&&r.status==='OPEN') r.status='ACTIVE'; }
 return d; }
function readFileDB():any{ try{ if(!fs.existsSync(DB_PATH)){const d=seedDB(); writeFileDB(d); return d;} return normalizeDB(JSON.parse(fs.readFileSync(DB_PATH,'utf8')));}catch{ const d=seedDB(); writeFileDB(d); return d;}}
function writeFileDB(d:any){ fs.mkdirSync(path.dirname(DB_PATH),{recursive:true}); const t=DB_PATH+'.tmp'; fs.writeFileSync(t,JSON.stringify(d,null,2)); fs.renameSync(t,DB_PATH);}
export async function readDBAsync():Promise<any>{ if(DB_BACKEND==='file') return _stamp(readFileDB(),0); if(_fsCache&&Date.now()-_fsCache.at<FS_TTL_MS) return _stamp(JSON.parse(JSON.stringify(_fsCache.db)),_fsCache.v); const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main'); let snap:any; try{ snap=await ref.get(); }catch(e:any){ throw new Error('FIRESTORE_READ_FAILED: '+(e?.message||e)); } if(!snap.exists){ const d=seedDB(); await writeDBAsync(d); return _stamp(JSON.parse(JSON.stringify(d)),1); } let db:any; const v=Number((snap.data()||{}).v)||0; try{ db=normalizeDB(JSON.parse((snap.data()||{}).json||'')); }catch{ throw new Error('FIRESTORE_STATE_CORRUPT: bk_state/main json field is not valid JSON'); } _fsCache={db,at:Date.now(),v}; return _stamp(JSON.parse(JSON.stringify(db)),v); }
export async function writeDBAsync(d:any):Promise<void>{ const st=_dbBase.get(d);
 if(DB_BACKEND==='file'){ if(!st){ writeFileDB(d); return; } const base=JSON.parse(st.snap); const cur=readFileDB(); writeFileDB(_jeq(cur,base)?d:_merge3(base,d,cur)); return; }
 const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main');
 if(!st){ const json=JSON.stringify(d); let nv=1; try{ await fsdb.runTransaction(async(tx:any)=>{ const s=await tx.get(ref); nv=(s.exists?Number((s.data()||{}).v)||0:0)+1; tx.set(ref,{json,v:nv,updatedAt:new Date().toISOString()}); }); }catch(e:any){ throw new Error('FIRESTORE_WRITE_FAILED: '+(e?.message||e)); } _fsCache={db:JSON.parse(json),at:Date.now(),v:nv}; return; }
 const base=JSON.parse(st.snap); let finalDb:any=d, newV=0;
 try{ await fsdb.runTransaction(async(tx:any)=>{ const s=await tx.get(ref); const curV=s.exists?Number((s.data()||{}).v)||0:0; newV=curV+1; if(curV===st.v){ tx.set(ref,{json:JSON.stringify(d),v:newV,updatedAt:new Date().toISOString()}); finalDb=d; } else { let curDb:any={}; if(s.exists){ try{ curDb=normalizeDB(JSON.parse((s.data()||{}).json||'')); }catch{ curDb={}; } } finalDb=_merge3(base,d,curDb); tx.set(ref,{json:JSON.stringify(finalDb),v:newV,updatedAt:new Date().toISOString()}); } }); }catch(e:any){ throw new Error('FIRESTORE_WRITE_FAILED: '+(e?.message||e)); }
 _fsCache={db:JSON.parse(JSON.stringify(finalDb)),at:Date.now(),v:newV}; }
export function audit(db:any,actor:string,action:string,target:string,meta:any={}){ db.audit_logs.unshift({id:id('log'),actor,action,target,metadata:meta,createdAt:now()}); }
export function sanitize(s:any){ return String(s||'').replace(/<[^>]*>/g,'').trim().slice(0,5000); }
// Public projection of a post: moderation metadata never leaves the server, and when the
// seller hid their phone (hidePhone) the contact numbers are removed for everyone except
// the owner and ADMIN/SUPER_ADMIN/MODERATOR.
export function publicPost(p:any,u:any){ if(!p) return p; const priv=!!u&&(u.id===p.userId||['ADMIN','SUPER_ADMIN','MODERATOR'].includes(u.role)); const q:any={...p}; delete q.moderator; delete q.latencyMin; delete q.approvedAt; delete q.rejectReason; if(p.hidePhone&&!priv){ delete q.phone; delete q.whatsapp; } return q; }
