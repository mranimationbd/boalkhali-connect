import {readDBAsync} from '@/lib/db'; import {NextResponse} from 'next/server'; export const dynamic='force-dynamic';
// Publication probe for middleware.ts (post gate): the /post/[id] page renders its own
// not-found view for anything the requester may not see, but the root loading.tsx boundary
// makes Next flush HTTP 200 before notFound() can set the status — so middleware asks here
// and short-circuits real 404s, exactly like the /api/content-status gate for CMS details.
// Semantics mirror the page: an APPROVED post is public (sold/expired still render, with
// badges); anything else (missing, PENDING, REJECTED) is visible only to its owner or to
// staff (ADMIN/SUPER_ADMIN/MODERATOR). Middleware forwards the browser's cookie header,
// so the session below resolves to the very visitor the page would see. Anonymously a
// nonexistent id and someone else's pending post answer identically (visible:false) —
// the probe leaks no existence information.
const dec=(s:string)=>{ try{ return decodeURIComponent(s); }catch{ return s; } };
export async function GET(req:Request){ const u=new URL(req.url); const pid=dec(u.searchParams.get('id')||''); const db=await readDBAsync(); const p=(db.posts||[]).find((x:any)=>x.id===pid); let visible=!!p&&p.status==='APPROVED'; if(p&&!visible){ const m=(req.headers.get('cookie')||'').match(/(?:^|;\s*)sc_session=([^;]+)/); const sid=m?dec(m[1]):''; const sess=sid?(db.sessions||[]).find((s:any)=>s.id===sid):null; const ct=sess?Date.parse(sess.createdAt||''):0; if(sess&&ct&&Date.now()-ct<=14*864e5){ const me=(db.users||[]).find((x:any)=>x.id===sess.userId); visible=!!me&&!me.blocked&&(me.id===p.userId||['ADMIN','SUPER_ADMIN','MODERATOR'].includes(me.role)); } } return NextResponse.json({visible}); }
