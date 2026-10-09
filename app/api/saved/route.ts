export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,mutateDBAsync,id,now,publicPost} from '@/lib/db'; import {currentUser} from '@/lib/auth';
// Save/unsave a post (A-03). POST accepts JSON {postId} (fetch, from the save button) or a
// classic form post (hidden postId field, no-JS fallback -> 303 back to the referer). It
// TOGGLES: saving an already-saved post unsaves it. The old handler blindly ran req.json()
// on the form-encoded post-page form, which threw -> HTTP 500 for 100% of users.
export async function POST(req:Request){ const u=await currentUser(); const ct=req.headers.get('content-type')||''; const isForm=ct.includes('form-urlencoded')||ct.includes('multipart'); if(!u){ if(isForm) return NextResponse.redirect(new URL('/login?next=/saved',req.url),303); return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401}); }
 let postId=''; if(isForm){ try{ const f=await req.formData(); postId=String(f.get('postId')||f.get('id')||''); }catch{} } else { const b=await req.json().catch(()=>null); if(!b) return NextResponse.json({error:'INVALID_JSON'},{status:400}); postId=String(b.postId||b.id||''); }
 if(!postId) return isForm?NextResponse.redirect(new URL('/saved',req.url),303):NextResponse.json({error:'POST_ID_REQUIRED'},{status:400});
 const out:any=await mutateDBAsync((db:any)=>{ if(!db.posts.find((p:any)=>p.id===postId)) return {e:404,error:'POST_NOT_FOUND'}; const i=db.saved_posts.findIndex((s:any)=>s.userId===u.id&&s.postId===postId); if(i>=0){ db.saved_posts.splice(i,1); return {saved:false}; } db.saved_posts.push({id:id('sv'),userId:u.id,postId,createdAt:now()}); return {saved:true}; });
 if(out.e) return isForm?NextResponse.redirect(new URL('/saved',req.url),303):NextResponse.json({error:out.error},{status:out.e});
 if(isForm) return NextResponse.redirect(new URL(req.headers.get('referer')||('/post/'+postId),req.url),303);
 return NextResponse.json({ok:true,saved:out.saved}); }
export async function GET(){ const u=await currentUser(); if(!u) return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401}); const db=await readDBAsync(); const saved=db.saved_posts.filter((s:any)=>s.userId===u.id).map((s:any)=>{ const p=db.posts.find((x:any)=>x.id===s.postId); return p?publicPost(p,u):null; }).filter(Boolean); return NextResponse.json({saved}) }
