export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {mutateDBAsync,audit} from '@/lib/db'; import {requireRole} from '@/lib/auth';
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const actor=(r as any).user; const b=await req.json(); const out:any=await mutateDBAsync((db:any)=>{ const rep=db.secret_reports.find((x:any)=>x.id===String(b.id||'')); if(!rep) return {e:404};
 if(b.action==='seen') rep.status='SEEN';
 else if(b.action==='resolve') rep.status='RESOLVED';
 else if(b.action==='delete') db.secret_reports=db.secret_reports.filter((x:any)=>x.id!==rep.id);
 else return {e:400};
 audit(db,actor.email,'SECRET_'+String(b.action).toUpperCase(),rep.id); return {id:rep.id,status:rep.status}; });
 if(out.e===404) return NextResponse.json({error:'NOT_FOUND'},{status:404}); if(out.e===400) return NextResponse.json({error:'INVALID_ACTION'},{status:400}); return NextResponse.json({ok:true,id:out.id,status:out.status}) }
