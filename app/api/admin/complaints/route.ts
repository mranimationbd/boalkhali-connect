export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {mutateDBAsync,audit,now} from '@/lib/db'; import {requireRole} from '@/lib/auth'; import {hasPermission} from '@/lib/permissions';
// নাগরিক অভিযোগের কাজ: seen (→IN_PROGRESS, নতুন-কাউন্টার থেকে সরিয়ে দেয়) / resolve (→RESOLVED) / delete (হার্ড ডিলিট).
// অনুমতি: reports.manage — SUPER_ADMIN (সব) ও ADMIN (ডিফল্ট গ্রান্ট)-এর কাছে আছে; MODERATOR-এর শুধু reports.view, তাই
// মডারেটর কার্ড দেখতে পেলেও এই API 403 পাবে। প্রতিটি কাজ audit_logs-এ লেখা হয় (COMPLAINT_SEEN/RESOLVE/DELETE).
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const actor=(r as any).user; if(!hasPermission(actor.role,'reports.manage')) return NextResponse.json({error:'FORBIDDEN'},{status:403}); const b=await req.json(); const out:any=await mutateDBAsync((db:any)=>{ const c=db.complaints.find((x:any)=>x.id===String(b.id||'')); if(!c) return {e:404};
 if(b.action==='seen'){ c.status='IN_PROGRESS'; c.seenAt=now(); }
 else if(b.action==='resolve'){ c.status='RESOLVED'; c.resolvedAt=now(); }
 else if(b.action==='delete') db.complaints=db.complaints.filter((x:any)=>x.id!==c.id);
 else return {e:400};
 audit(db,actor.email,'COMPLAINT_'+String(b.action).toUpperCase(),c.id); return {id:c.id,status:c.status}; });
 if(out.e===404) return NextResponse.json({error:'NOT_FOUND'},{status:404}); if(out.e===400) return NextResponse.json({error:'INVALID_ACTION'},{status:400}); return NextResponse.json({ok:true,id:out.id,status:out.status}) }
