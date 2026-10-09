import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import {SETTINGS_DEFAULTS} from './settings'; export {SETTINGS_DEFAULTS};
const ON_VERCEL=!!(process.env.VERCEL||process.env.NETLIFY||process.env.AWS_LAMBDA_FUNCTION_NAME);
export const DB_PATH=process.env.DB_PATH||(ON_VERCEL?'/tmp/boalkhali-db.json':path.join(process.cwd(),'data','db.json'));
export const UPLOAD_DIR=process.env.UPLOAD_DIR||(ON_VERCEL?'/tmp/boalkhali-uploads':path.join(process.cwd(),'public','uploads'));
export const UPLOAD_QUOTA_BYTES=Math.floor((Number(process.env.UPLOAD_QUOTA_GB)||5)*1024*1024*1024); // posting uploads quota: 5 GB (user, 2026-10-08)
// ---- DB backend selection (2026-10-08): Firestore when all 3 service-account env vars are set, else local file ----
export const DB_BACKEND:'firestore'|'file'=(process.env.FIREBASE_PROJECT_ID&&process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY)?'firestore':'file';
let _fsDb:any=null; let _fsInit:Promise<any>|null=null; let _fsCache:{db:any,at:number,v:number}|null=null; const FS_TTL_MS=30000; let _fsInflight:Promise<{db:any,v:number}>|null=null;
// Perf hotfix (2026-10-09, post-deploy): the 3s TTL + a full 13-collection re-scan on
// every cache miss saturated Firestore (Spark) once per-page-view writers appeared.
// TTL is 30s now, concurrent misses share ONE in-flight fetch, and a successful
// mutation primes the cache with the state it just committed instead of voiding it.
// ---- Concurrency core v2 (2026-10-09 batch, A-01/M-01) ----
// DIAGNOSIS (proven with a fake-Firestore harness that replicates the SDK re-invoking a
// transaction callback on contention — 12 acked concurrent post-creates, 4 survived, exactly
// the live audit): (1) mutateDBAsync set its `ok` flag inside the transaction callback; on
// contention Firestore re-runs the callback, the retry read a moved version and returned
// without staging a write, so an EMPTY transaction committed while `ok` stayed true from the
// first attempt — the API returned a created post that was never stored ("success JSONs all
// lied"). (2) Every write still funnels through ONE document bk_state/main: whole-state
// snapshots overwrite records they never touched, same-record races lose whole records, and
// the 1MB doc ceiling looms over every write.
// FIX: the hot collections (HOT_COLLECTIONS) live as PER-RECORD DOCUMENTS — bk_<name>/{id}
// on Firestore (same pattern as bk_images), per-record JSON files under <dbDir>/hot/<name>/
// on the file backend. Two writers touching different records can no longer collide at all.
// readDBAsync assembles legacy state (everything else, still bk_state/main / db.json) + the
// per-record collections; a one-time lazy migration copies legacy rows up (idempotent,
// marker-guarded). Writes diff base→new per collection and apply doc-level puts/deletes, so
// other writers' concurrent adds/edits in untouched records always survive. Shared scalars
// (settings/meta/…) stay on the legacy doc behind an optimistic version-checked transaction
// whose commit flag is reset at the top of EVERY callback invocation (the old bug), and
// mutateDBAsync re-runs fn on fresh state whenever the legacy doc moved underneath it.
// RESIDUAL (honest): two writers editing the SAME record concurrently resolve per-record
// last-writer-wins; an edit racing a delete of the same record resurrects the edited copy.
// Low-volume collections (notifications, audit_logs, announcements, …) remain on the legacy
// doc; the doc no longer grows with posts/users/sessions, so the 1MB ceiling is defused.
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
// ---- per-record store for the hot collections ----
export const HOT_COLLECTIONS=['users','posts','sessions','blood_requests','blood_donors','complaints','secret_reports','post_comments','saved_posts','content_types','contents','search_logs','business_verifications'];
const _HOTSET=new Set(HOT_COLLECTIONS); const _isHot=(k:string)=>_HOTSET.has(k);
const _recId=(r:any)=>(r&&typeof r==='object'&&r.id!==undefined&&r.id!==null)?String(r.id):null;
const _cleanRec=(r:any)=>{ try{ return JSON.parse(JSON.stringify(r)); }catch{ return r; } };
// Legacy arrays are newest-first (unshift) for the hot collections; keep that observable order.
const _sortHot=(arr:any[])=>arr.sort((a:any,b:any)=>String((b&&b.createdAt)||'').localeCompare(String((a&&a.createdAt)||''))||String((b&&b.id)||'').localeCompare(String((a&&a.id)||'')));
const _fname=(s:string)=>s.replace(/[^\w.-]/g,'_');
const _hotRoot=()=>path.join(path.dirname(DB_PATH),'hot');
function _hotListFile(name:string):any[]{ try{ const d=path.join(_hotRoot(),name); return _sortHot(fs.readdirSync(d).filter(f=>f.endsWith('.json')&&!f.startsWith('.')).map(f=>{ try{ return JSON.parse(fs.readFileSync(path.join(d,f),'utf8')); }catch{ return null; } }).filter(Boolean)); }catch{ return []; } }
function _hotPutFile(name:string,r:any){ const d=path.join(_hotRoot(),name); fs.mkdirSync(d,{recursive:true}); const f=path.join(d,_fname(_recId(r) as string)+'.json'); const t=f+'.tmp'; fs.writeFileSync(t,JSON.stringify(r)); fs.renameSync(t,f); }
function _hotDelFile(name:string,id:string){ try{ fs.unlinkSync(path.join(_hotRoot(),name,_fname(id)+'.json')); }catch{} }
let _fileMig=false;
const _hotMigratedFile=()=>{ try{ return fs.existsSync(path.join(_hotRoot(),'.migrated')); }catch{ return false; } };
function _hotMarkFile(){ try{ fs.mkdirSync(_hotRoot(),{recursive:true}); fs.writeFileSync(path.join(_hotRoot(),'.migrated'),new Date().toISOString()); }catch{} }
async function _hotListFs(name:string):Promise<any[]>{ const c=(await firestoreDB()).collection('bk_'+name); const s=await c.get(); return _sortHot(s.docs.map((d:any)=>d.data())); }
async function _hotApplyFs(puts:{name:string,r:any}[],dels:{name:string,id:string}[]){ if(!puts.length&&!dels.length) return; const f=await firestoreDB(); const ops:any[]=[...puts.map(r=>({t:'s',r})),...dels.map(d=>({t:'d',d}))]; for(let i=0;i<ops.length;i+=400){ const b=f.batch(); for(const o of ops.slice(i,i+400)){ if(o.t==='s') b.set(f.collection('bk_'+o.r.name).doc(String(o.r.r.id)),_cleanRec(o.r.r)); else b.delete(f.collection('bk_'+o.d.name).doc(String(o.d.id))); } await b.commit(); } }
let _hotMigP:Promise<void>|null=null;
async function _ensureHotMigrated(legacy:any){ if(DB_BACKEND==='file'){ if(_fileMig||_hotMigratedFile()){ _fileMig=true; return; } for(const n of HOT_COLLECTIONS){ if(_hotListFile(n).length===0&&Array.isArray(legacy[n])) for(const r of legacy[n]) if(_recId(r)) _hotPutFile(n,r); } _hotMarkFile(); _fileMig=true; return; }
 if(_hotMigP) return _hotMigP; _hotMigP=(async()=>{ const f=await firestoreDB(); const mref=f.collection('bk_meta').doc('hot_migration'); const m=await mref.get(); if(m.exists) return; for(const n of HOT_COLLECTIONS){ const cur=await _hotListFs(n); if(cur.length===0&&Array.isArray(legacy[n])) await _hotApplyFs(legacy[n].filter((r:any)=>_recId(r)).map((r:any)=>({name:n,r})),[]); } await mref.set({at:new Date().toISOString()}); })(); return _hotMigP; }
// Overlay the per-record collections onto a legacy state object (which first seeds the
// one-time migration from its own hot arrays when the store is still empty).
async function _overlayHot(db:any){ await _ensureHotMigrated(db); if(DB_BACKEND==='file'){ for(const n of HOT_COLLECTIONS) db[n]=_hotListFile(n); } else { for(const n of HOT_COLLECTIONS) db[n]=await _hotListFs(n); } return db; }
function _legacyOf(db:any){ const o:any={}; for(const k of Object.keys(db||{})) if(!_isHot(k)) o[k]=db[k]; return o; }
function _hotDiff(base:any,mine:any){ const puts:{name:string,r:any}[]=[]; const dels:{name:string,id:string}[]=[]; for(const n of HOT_COLLECTIONS){ if(!Array.isArray(mine[n])) continue; const bm=new Map((Array.isArray(base[n])?base[n]:[]).map((r:any)=>[_recId(r),r])); const seen=new Set<string>(); for(const r of mine[n]){ const k=_recId(r); if(!k) continue; seen.add(k); const b=bm.get(k); if(!b||!_jeq(b,r)) puts.push({name:n,r}); } bm.forEach((_v,k)=>{ if(k&&!seen.has(k)) dels.push({name:n,id:k}); }); } return {puts,dels}; }
async function _applyHotDiff(diff:{puts:{name:string,r:any}[],dels:{name:string,id:string}[]}):Promise<void>{ if(DB_BACKEND==='file'){ for(const p of diff.puts) _hotPutFile(p.name,p.r); for(const d of diff.dels) _hotDelFile(d.name,d.id); return; } await _hotApplyFs(diff.puts,diff.dels); }
// Persist (base -> mine) shared by writeDBAsync/mutateDBAsync. Legacy keys go through a
// version-checked write of bk_state/main (hot arrays stripped — they live per-record now);
// hot keys go out as per-record puts/deletes diffed against base. A legacy-doc version move
// mid-write aborts BEFORE anything is applied and the caller retries on fresh state.
// The legacy doc is written ONLY when a legacy key actually changed vs base — hot-only
// writes (a new post, a new session) never touch bk_state/main, so they cannot contend at
// all. Returns 'skip' (unchanged), true (committed) or false (version moved; caller retries
// on fresh state). `committed` is reset at the top of EVERY callback invocation: the SDK
// re-runs the callback on contention, and a stale true was the old silent-loss bug.
async function _writeLegacyFs(base:any,mine:any,baseV:number):Promise<boolean|string>{ if(_jeq(_legacyOf(base),_legacyOf(mine))) return 'skip'; const legacyJson=JSON.stringify(_legacyOf(mine)); const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main'); let committed=false;
 await fsdb.runTransaction(async(tx:any)=>{ committed=false; const s2=await tx.get(ref); const curV=s2.exists?Number((s2.data()||{}).v)||0:0; if(curV!==baseV) return; tx.set(ref,{json:legacyJson,v:curV+1,updatedAt:new Date().toISOString()}); committed=true; }); return committed; }
async function _persistMerged(base:any,mine:any):Promise<any>{
 if(DB_BACKEND==='file'){ return _withFileLock(async()=>{ const curFile=normalizeDB(readFileDB()); const cur=await _overlayHot(JSON.parse(JSON.stringify(curFile))); const b=base||cur; const merged=base?_merge3(b,mine,cur):_cleanRec(mine); const diff=_hotDiff(b,merged); await _applyHotDiff(diff); const legacyFile:any={...curFile}; const ml=_legacyOf(merged); for(const k of Object.keys(ml)) legacyFile[k]=ml[k]; writeFileDB(legacyFile); return merged; }); }
 const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main');
 for(let i=0;i<10;i++){ const s=await ref.get(); const curV=s.exists?Number((s.data()||{}).v)||0:0; let cur:any; if(s.exists){ try{ cur=normalizeDB(JSON.parse((s.data()||{}).json||'')); }catch{ cur={}; } } else cur=normalizeDB(seedDB()); const curFull=await _overlayHot(cur); const b=base||curFull; const merged=base?_merge3(b,mine,curFull):_cleanRec(mine); const diff=_hotDiff(b,merged); const w=await _writeLegacyFs(b,merged,curV);
  if(w!==true&&w!=='skip'){ await new Promise(r=>setTimeout(r,20*(i+1)+Math.floor(Math.random()*15))); continue; }
  await _hotApplyFs(diff.puts,diff.dels); try{ _fsCache={db:JSON.parse(JSON.stringify(merged)),at:Date.now(),v:w===true?curV+1:curV}; }catch{ _fsCache=null; } return merged; }
 throw new Error('DB_WRITE_CONTENTION: write failed after 10 retries'); }
export async function mutateDBAsync<T>(fn:(db:any)=>T|Promise<T>):Promise<T>{
 if(DB_BACKEND==='file'){ return _withFileLock(async()=>{ const curFile=normalizeDB(readFileDB()); const db:any=await _overlayHot(JSON.parse(JSON.stringify(curFile))); const base=JSON.parse(JSON.stringify(db)); const out=await fn(db); const diff=_hotDiff(base,db); await _applyHotDiff(diff); const legacyFile:any={...curFile}; const ml=_legacyOf(db); for(const k of Object.keys(ml)) legacyFile[k]=ml[k]; writeFileDB(legacyFile); return out; }); }
 // Firestore: fn runs on freshly-assembled state; if the legacy doc moves before commit,
 // fn RE-RUNS on fresh state — a mutation is only acknowledged after its writes are staged
 // in a transaction that actually committed (the old code could acknowledge a lost write).
 for(let i=0;i<10;i++){ const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main'); const snap=await ref.get(); let db:any; let v=0; if(!snap.exists){ db=normalizeDB(seedDB()); } else { v=Number((snap.data()||{}).v)||0; try{ db=normalizeDB(JSON.parse((snap.data()||{}).json||'')); }catch{ throw new Error('FIRESTORE_STATE_CORRUPT: bk_state/main json field is not valid JSON'); } }
  const full:any=await _overlayHot(db); const base=JSON.parse(JSON.stringify(full)); const out=await fn(full); const diff=_hotDiff(base,full); const w=await _writeLegacyFs(base,full,v);
  if(w!==true&&w!=='skip'){ await new Promise(r=>setTimeout(r,20*(i+1)+Math.floor(Math.random()*15))); continue; }
  await _hotApplyFs(diff.puts,diff.dels); try{ _fsCache={db:JSON.parse(JSON.stringify(full)),at:Date.now(),v:w===true?v+1:v}; }catch{ _fsCache=null; } return out; }
 throw new Error('DB_WRITE_CONTENTION: mutation failed after 10 retries'); }
// ---- Fast-path single-record writes (2026-10-09 perf hotfix) ----
// mutateDBAsync assembles the WHOLE state (legacy doc + 13 full-collection scans) per
// call; the per-page-view writers (view counters, search logs) multiplied that into
// Firestore saturation. These helpers touch exactly ONE per-record document instead,
// preserving the old writers' stored shapes, caps and ordering.
function _hotGetFile(name:string,rid:string):any{ try{ const p=path.join(_hotRoot(),name,_fname(rid)+'.json'); if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8')); }catch{} const l=_hotListFile(name); return l.find((r:any)=>_recId(r)===rid)||null; }
const _APPEND_CAPS:Record<string,number>={search_logs:2000}; // mirrors SEARCH_LOG_CAP (lib/searchLog.ts)
export async function incrementHotViews(name:'posts'|'contents',rid:string):Promise<number|null>{
 if(!_HOTSET.has(name)||!rid) return null;
 if(DB_BACKEND==='file'){ return _withFileLock(async()=>{ const rec=_hotGetFile(name,rid); if(!rec) return null; rec.views=(Number(rec.views)||0)+1; _hotPutFile(name,rec); return rec.views; }); }
 const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_'+name).doc(rid); const admin=await firebaseAdmin();
 try{ await ref.update({views:admin.firestore.FieldValue.increment(1)}); }catch(e:any){ const s0=await ref.get(); if(!s0.exists) return null; throw e; }
 const s=await ref.get(); if(!s.exists) return null; const views=Number((s.data()||{}).views)||0;
 if(_fsCache&&Array.isArray(_fsCache.db[name])){ const r=_fsCache.db[name].find((x:any)=>x&&String(x.id)===rid); if(r) r.views=views; }
 return views; }
export async function appendHotRecord(name:string,rec:any):Promise<boolean>{
 if(!_HOTSET.has(name)||!rec||!_recId(rec)) return false; const cap=_APPEND_CAPS[name]||0;
 if(DB_BACKEND==='file'){ return _withFileLock(async()=>{ _hotPutFile(name,_cleanRec(rec)); if(cap>0){ const list=_hotListFile(name); if(list.length>cap){ const ex=Math.min(list.length-cap,100); for(const old of list.slice(list.length-ex)) _hotDelFile(name,_recId(old) as string); } } return true; }); }
 const fsdb=await firestoreDB(); const col=fsdb.collection('bk_'+name); await col.doc(_recId(rec) as string).set(_cleanRec(rec));
 if(_fsCache&&Array.isArray(_fsCache.db[name])){ const arr=_fsCache.db[name]; if(!arr.some((x:any)=>x&&String(x.id)===String(rec.id))) arr.unshift(_cleanRec(rec)); if(cap>0&&arr.length>cap) arr.length=cap; }
 if(cap>0){ try{ const cnt=await col.count().get(); const n=Number(cnt.data().count)||0; if(n>cap){ const ex=Math.min(n-cap,100); const old=await col.orderBy('createdAt','asc').limit(ex).get(); if(!old.empty){ const b=fsdb.batch(); old.forEach((d:any)=>b.delete(d.ref)); await b.commit(); } } }catch{} }
 return true; }
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
 const db:any={users:[{id:'u_owner',name:'MD. Habibur Rahman',email:'habiburrahman962540@gmail.com',passwordHash:hash('OwnerDemo123!'),role:'SUPER_ADMIN',membership:'PREMIUM CITIZEN',verified:true,phone:'',area:'বোয়ালখালী',address:'বোয়ালখালী, বাংলাদেশ',privacyMode:false,createdAt:now(),totalPosts:1,publishedPosts:1},{id:'u_admin',name:'Admin',email:adminEmail,passwordHash:hash(process.env.ADMIN_PASSWORD||'admin'),role:'ADMIN',membership:'PREMIUM CITIZEN',verified:true,createdAt:now(),totalPosts:0,publishedPosts:0},{id:'u_citizen',name:'Test Citizen',email:'citizen@boalkhali.local',passwordHash:hash('Citizen123!'),role:'CITIZEN',membership:'FREE',verified:true,createdAt:now(),totalPosts:0,publishedPosts:0}],roles:['CITIZEN','BUSINESS','SERVICE_PROVIDER','MODERATOR','ADMIN','SUPER_ADMIN'],categories:CATEGORIES,subcategories:[],locations:LOCATIONS,feature_flags:CATEGORIES.map(c=>({categorySlug:c.slug,enabled:true,updatedAt:now()})),posts:[],post_images:[],saved_posts:[],restaurants:[],menus:[],doctors:[],blood_donors:[],blood_requests:[],jobs:[],services:[],service_providers:[],lost_found:[],complaints:[],secret_reports:[],emergency_alerts:[],announcements:[{id:id('ann'),title:'স্বাগতম! আমরা আছি আপনার পাশে',body:'বোয়ালখালী কানেক্টে স্বাগতম',active:true,createdAt:now()}],notifications:[],advertisements:[],memberships:[{id:id('mem'),userId:'u_owner',plan:'PREMIUM CITIZEN',status:'ACTIVE',createdAt:now()}],reviews:[],transport_routes:[{id:id('tr'),type:'train',name:'কর্ণফুলী এক্সপ্রেস',route:'বোয়ালখালী → চট্টগ্রাম',time:'08:00',station:'বোয়ালখালী বাস স্ট্যান্ড'},{id:id('tr'),type:'bus',name:'বোয়ালখালী → চট্টগ্রাম বাস',route:'বোয়ালখালী → চট্টগ্রাম',time:'07:30',station:'বাস টার্মিনাল'}],transport_schedules:[],audit_logs:[],system_metrics:[],sessions:[],tokens:[],settings:{...SETTINGS_DEFAULTS}};
 const P=(o:any)=>({views:0,createdAt:now(),status:'APPROVED',verified:false,promoted:false,...o});
 db.posts.push(P({id:'p_bike',userId:'u_owner',categorySlug:'market',title:'Bajaj Discover 125cc ডিস্ক ব্রেক মোটরসাইকেল',desc:'ভালো কন্ডিশন, সব কাগজ আপডেট',price:88000,location:'বোয়ালখালী বাজার, বোয়ালখালী',landmark:'বোয়ালখালী বাজার',phone:'01712445566',whatsapp:'01712445566',promoted:true,image:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'}));
 db.posts.push(P({id:'p_phone',userId:'u_owner',categorySlug:'market',title:'Redmi Note 12 Pro (8GB/128GB) স্মার্টফোন',desc:'ফুল বক্স, অল্প ব্যবহৃত',price:16500,location:'বোয়ালখালী সুপার মার্কেট, বোয়ালখালী',phone:'01712445566',image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'}));
 db.posts.push(P({id:'p_house',userId:'u_citizen',categorySlug:'house',title:'কধুরখীল মোড়ে ৩ রুমের ফ্যামিলি বাসা ভাড়া',desc:'৩ রুম + ড্রয়িং, টাইলস, পানির সুবিধা',price:8500,location:'কধুরখীল',subcategory:'ফ্যামিলি বাসা',rooms:'৩ রুম + ড্রয়িং'}));
 db.restaurants.push({id:'r1',name:'বোম্বে সুইটস ও কনফেকশনারি',category:'ঐতিহ্যবাহী মিষ্টি',price:'৩৫০ ৳/কেজি',location:'কালুরঘাট রোড, বোয়ালখালী',verified:true,delivery:false,menu:'চামচম, রসগোল্লা, ক্ষীরভোগ',desc:'খাঁটি গাভীর দুধের চামচম, ক্ষীরসা, কাঁচাগোল্লা ও জিলাপি',image:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',phone:''},{id:'r2',name:'বোয়ালখালী স্পেশাল বিরিয়ানি ও কাচ্চি ঘর',category:'বিরিয়ানি ও কাবাব',price:'১৮০ ৳/প্লেট',location:'উপজেলা মোড়, বোয়ালখালী',verified:true,delivery:true,menu:'শাহী কাচ্চি, বিফ তেহারি, মোরগ পোলাও',desc:'খাসির শাহী কাচ্চি, সরিষার তেলে রান্না বিফ তেহারি',image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',phone:''});
 db.jobs.push({id:'j1',title:'চৌমুহনী বাজারের শীর্ষ কাপড়ের শোরুমে সেলস এক্সিকিউটিভ আবশ্যক',company:'আল-মদিনা ফ্যাশন হাউজ',type:'FULL-TIME',salary:'১২,০০০ - ১৫,০০০ ৳ (কমিশনসহ)',deadline:'২০২৬-09-25',location:'চৌমুহনী বাজার ২য় তলা, বোয়ালখালী',verified:true,desc:'গ্রাহকদের সাথে মার্জিত আচরণ ও সেলস হ্যান্ডেল করতে হবে। ন্যূনতম এসএসসি পাস।',phone:'01712445566'},{id:'j2',title:'আধুনিক অফসেট প্রেসে গ্রাফিক্স ডিজাইনার ও কম্পিউটার অপারেটর',company:'বোয়ালখালী ডিজিটাল প্রেস',type:'FULL-TIME',salary:'১৪,০০০ - ১৮,০০০ ৳ (কমিশনসহ)',deadline:'২০২৬-09-30',location:'কালুরঘাট রোড, বোয়ালখালী',verified:true,desc:'অফসেট প্রেসে কাজের অভিজ্ঞতা থাকতে হবে',phone:'01712445567'});
 // A-04 (2026-10-09 batch): demo health records (doctor d1 01710000003, blood request b1, donor bd1,
 // service providers s1/s2) REMOVED from the seed — invented phone numbers were rendered publicly as
 // real, callable contacts for a doctor, a critical patient and an "available now" donor. Fresh
 // databases now start honestly empty here; real entries come from admin import / citizen flows.
 db.emergency_alerts.push({id:'e1',title:'জরুরি সতর্কতা',body:'জরুরি প্রয়োজনে যোগাযোগ করুন',severity:'HIGH',active:true,createdAt:now()});
 db.advertisements.push({id:'ad1',title:'মেগা ফ্যাশন পয়েন্ট • ঈদ ও শীতের মেগা ছাড়',body:'সর্বোচ্চ ৫০% পর্যন্ত ছাড়! শীত ও উৎসবের কেনাকাটায় সেরা ছাড়',image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',status:'APPROVED',promoted:true,impressions:0,clicks:0,startDate:now(),endDate:''});
 // Wave 1 honesty: the seed ad previously carried fabricated impressions:120/clicks:12
 // with no counting code behind them. Counters now start at the true 0 and only move
 // via the beacon/click routes. (An already-stored ad in an existing DB keeps whatever
 // it has — this seed line governs fresh databases only; zeroing stored counters is an
 // owner/admin decision, not something a seed may silently rewrite.)
 db.complaints.push({id:'c1',userId:'u_citizen',type:'রাস্তা',desc:'কধুরখীল রাস্তায় পানি জমে আছে',location:'কধুরখীল',status:'NEW',createdAt:now()});
 db.secret_reports.push({id:'sec1',title:'গোপন রিপোর্ট ১',desc:'(Admin only) নাগরিকের গোপন তথ্য',priority:'HIGH',status:'NEW',createdAt:now(),submitterHidden:true});
 db.volunteers=[];
 return db;
}
// Every array collection the codebase reads. Loaded state (file OR Firestore doc) is normalized through
// normalizeDB() so a collection missing from an older/partial stored DB can never crash a page with
// "Cannot read properties of undefined" (root cause of the 2026-10-08 admin 500s: pages read collections
// the seed never created). New collections used anywhere MUST be added here.
export const DB_COLLECTIONS=['users','roles','categories','subcategories','locations','feature_flags','posts','post_images','saved_posts','restaurants','menus','doctors','blood_donors','blood_requests','jobs','services','service_providers','lost_found','complaints','secret_reports','emergency_alerts','announcements','notifications','advertisements','memberships','reviews','transport_routes','transport_schedules','audit_logs','system_metrics','sessions','tokens','volunteers','reports','post_comments','visits','reset_requests','content_types','contents','search_logs','business_verifications'];
export function normalizeDB(d:any):any{ if(!d||typeof d!=='object'||Array.isArray(d)) d={}; for(const k of DB_COLLECTIONS){ if(!Array.isArray(d[k])) d[k]=[]; } if(!d.settings||typeof d.settings!=='object'||Array.isArray(d.settings)) d.settings={}; for(const k of Object.keys(SETTINGS_DEFAULTS)) if(d.settings[k]===undefined) d.settings[k]=(SETTINGS_DEFAULTS as any)[k]; if(!d.visitStats||typeof d.visitStats!=='object'||Array.isArray(d.visitStats)) d.visitStats={total:0,byDay:{}}; if(typeof d.visitStats.total!=='number') d.visitStats.total=0; if(!d.visitStats.byDay||typeof d.visitStats.byDay!=='object') d.visitStats.byDay={}; if(!d.meta||typeof d.meta!=='object'||Array.isArray(d.meta)) d.meta={}; if(typeof d.meta.uploadBytesUsed!=='number') d.meta.uploadBytesUsed=0; if(!d.vanalytics||typeof d.vanalytics!=='object'||Array.isArray(d.vanalytics)) d.vanalytics={days:{},total:0,since:null,logs:[]}; if(!d.vanalytics.days||typeof d.vanalytics.days!=='object'||Array.isArray(d.vanalytics.days)) d.vanalytics.days={}; if(typeof d.vanalytics.total!=='number') d.vanalytics.total=0; if(!Array.isArray(d.vanalytics.logs)) d.vanalytics.logs=[];
 // Blood-request status canonicalization (2026-10-09): legacy records were written as 'OPEN'
 // while the dashboard counts only 'ACTIVE' — the two views disagreed. ACTIVE is now the single
 // canonical open-state: every read normalizes OPEN -> ACTIVE, and the create path writes ACTIVE
 // only, so any subsequent write persists the canonical value. isOpen() readers still accept both.
 if(Array.isArray(d.blood_requests)) for(const r of d.blood_requests){ if(r&&r.status==='OPEN') r.status='ACTIVE'; }
 return d; }
function readFileDB():any{ try{ if(!fs.existsSync(DB_PATH)){const d=seedDB(); writeFileDB(d); return d;} return normalizeDB(JSON.parse(fs.readFileSync(DB_PATH,'utf8')));}catch{ const d=seedDB(); writeFileDB(d); return d;}}
function writeFileDB(d:any){ fs.mkdirSync(path.dirname(DB_PATH),{recursive:true}); const t=DB_PATH+'.tmp'; fs.writeFileSync(t,JSON.stringify(d,null,2)); fs.renameSync(t,DB_PATH);}
async function _fsFetchState():Promise<{db:any,v:number}>{ const fsdb=await firestoreDB(); const ref=fsdb.collection('bk_state').doc('main'); let snap:any; try{ snap=await ref.get(); }catch(e:any){ throw new Error('FIRESTORE_READ_FAILED: '+(e?.message||e)); } if(!snap.exists){ const d=normalizeDB(seedDB()); await _overlayHot(d); await writeDBAsync(d); return {db:d,v:1}; } const v=Number((snap.data()||{}).v)||0; let db:any; try{ db=normalizeDB(JSON.parse((snap.data()||{}).json||'')); }catch{ throw new Error('FIRESTORE_STATE_CORRUPT: bk_state/main json field is not valid JSON'); } await _overlayHot(db); return {db,v}; }
export async function readDBAsync():Promise<any>{ if(DB_BACKEND==='file'){ const db=normalizeDB(readFileDB()); await _overlayHot(db); return _stamp(db,0); } if(_fsCache&&Date.now()-_fsCache.at<FS_TTL_MS) return _stamp(JSON.parse(JSON.stringify(_fsCache.db)),_fsCache.v);
 // In-flight dedupe: concurrent cache misses share ONE fetch instead of each fanning
 // out into 13 full-collection scans; the shared promise clears when it settles.
 if(!_fsInflight){ _fsInflight=_fsFetchState().then((r)=>{ _fsCache={db:r.db,at:Date.now(),v:r.v}; return r; }).finally(()=>{ _fsInflight=null; }); } const r=await _fsInflight; return _stamp(JSON.parse(JSON.stringify(r.db)),r.v); }
export async function writeDBAsync(d:any):Promise<void>{ const st=_dbBase.get(d); if(!st){ if(DB_BACKEND==='file') await _persistMerged(null,d); else await _persistMerged(null,d); return; } const base=JSON.parse(st.snap); await _persistMerged(base,d); }
export function audit(db:any,actor:string,action:string,target:string,meta:any={}){ db.audit_logs.unshift({id:id('log'),actor,action,target,metadata:meta,createdAt:now()}); }
export function sanitize(s:any){ return String(s||'').replace(/<[^>]*>/g,'').trim().slice(0,5000); }
// Search-analytics record (Wave 2): defensive coercion for bk_search_logs rows. The ONLY
// fields ever stored are the normalized term, the result count and the Dhaka day — no user
// id, session or IP (privacy by shape, see lib/searchLog.ts).
export function sanitizeSearchLog(r:any):any|null{ if(!r||typeof r!=='object'||!r.id) return null; const term=sanitize(r.term).slice(0,120); if(!term) return null; const rc=Number(r.resultCount); const d=String(r.day||''); return {id:String(r.id),term,resultCount:Number.isFinite(rc)&&rc>0?Math.floor(rc):0,day:/^\d{4}-\d{2}-\d{2}$/.test(d)?d:'',createdAt:String(r.createdAt||'')}; }
// Business verification request (Wave 3): an owner's ask for the ✓ যাচাইকৃত badge on
// their own CMS business content, decided in /admin/verifications. Defensive coercion
// in the sanitizeSearchLog pattern — unknown/garbled stored rows degrade to a safe
// shape, never crash a page. NOTE: nothing here is client-writable; the write routes
// build records field-by-field and `verified` lives on the content record, set only by
// the admin review route.
export const BV_STATUSES=['PENDING','APPROVED','REJECTED'];
export function sanitizeBusinessVerification(r:any):any|null{ if(!r||typeof r!=='object'||!r.id||!r.userId||!r.contentId) return null; return {id:String(r.id),userId:String(r.userId),contentId:String(r.contentId),businessName:sanitize(r.businessName).slice(0,200),note:sanitize(r.note).slice(0,1000),status:BV_STATUSES.includes(r.status)?r.status:'PENDING',reviewerId:String(r.reviewerId||''),reviewNote:sanitize(r.reviewNote).slice(0,500),createdAt:String(r.createdAt||''),reviewedAt:r.reviewedAt?String(r.reviewedAt):null}; }
// Public projection of a post: moderation metadata never leaves the server, and when the
// seller hid their phone (hidePhone) the contact numbers are removed for everyone except
// the owner and ADMIN/SUPER_ADMIN/MODERATOR.
export function publicPost(p:any,u:any){ if(!p) return p; const priv=!!u&&(u.id===p.userId||['ADMIN','SUPER_ADMIN','MODERATOR'].includes(u.role)); const q:any={...p}; delete q.moderator; delete q.latencyMin; delete q.approvedAt; delete q.rejectReason; if(p.hidePhone&&!priv){ delete q.phone; delete q.whatsapp; } return q; }
// Donor phone privacy (Wave 1): the public donor surface must never print a full
// number to anonymous visitors. Logged-in users (and the donor/staff) see it in full;
// everyone else gets first-2 + last-3 only, e.g. 01••• •••566.
export function maskPhone(ph:any){ const s=String(ph||''); if(s.length<6) return s; return s.slice(0,2)+'••• •••'+s.slice(-3); }
export function publicDonor(d:any,u:any){ if(!d) return d; const priv=!!u&&(u.id===d.userId||['ADMIN','SUPER_ADMIN','MODERATOR'].includes(u.role)); const q:any={...d}; if(!priv) q.phone=maskPhone(d.phone); return q; }
