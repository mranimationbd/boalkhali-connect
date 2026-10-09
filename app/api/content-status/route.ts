import {readDBAsync,mutateDBAsync} from '@/lib/db'; import {sanitizeContentType,sanitizeContent,ensureCmsSeeds,needsCmsSeeds,isPublishedVisible} from '@/lib/cms'; import {PLACES} from '@/lib/places'; import {NextResponse} from 'next/server'; export const dynamic='force-dynamic';
// Publication probe for middleware.ts: the public detail page renders a not-found view for
// any non-PUBLISHED item, but the root loading.tsx boundary makes Next flush HTTP 200 before
// notFound() can set the status — so middleware asks here and short-circuits real 404s.
// Reveals nothing the public sitemap doesn't already list (published detail URLs only).
const dec=(s:string)=>{ try{ return decodeURIComponent(s); }catch{ return s; } };
export async function GET(req:Request){ const u=new URL(req.url); const ts=dec(u.searchParams.get('type')||''); const sl=dec(u.searchParams.get('slug')||''); let db=await readDBAsync(); if(needsCmsSeeds(db)){ await mutateDBAsync((d:any)=>{ ensureCmsSeeds(d,'system'); }); db=await readDBAsync(); } const type=sanitizeContentType((db.content_types||[]).find((x:any)=>x.slug===ts)); const c=sanitizeContent((db.contents||[]).find((x:any)=>x.typeSlug===ts&&x.slug===sl)); let visible=isPublishedVisible(c,type); // /boalkhali fallback: only while the places seed has never run (marker unset) and the
 // slug is one of the curated lib/places.ts items may the static fallback render — once
 // seeded, a missing record means the place was deleted in admin and must stay gone.
 if(!visible&&ts==='place'&&!c&&!(db.meta&&db.meta.placesSeedV1)&&PLACES.some((p:any)=>p.slug===sl)) visible=true; return NextResponse.json({visible}); }
