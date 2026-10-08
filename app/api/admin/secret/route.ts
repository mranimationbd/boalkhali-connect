export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,writeDBAsync,audit} from '@/lib/db'; import {requireRole} from '@/lib/auth';
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const actor=(r as any).user; const b=await req.json(); const db=await readDBAsync(); const rep=db.secret_reports.find((x:any)=>x.id===String(b.id||'')); if(!rep) return NextResponse.json({error:'NOT_FOUND'},{status:404});
 if(b.action==='seen') rep.status='SEEN';
 else if(b.action==='resolve') rep.status='RESOLVED';
 else if(b.action==='delete') db.secret_reports=db.secret_reports.filter((x:any)=>x.id!==rep.id);
 else return NextResponse.json({error:'INVALID_ACTION'},{status:400});
 audit(db,actor.email,'SECRET_'+String(b.action).toUpperCase(),rep.id); await writeDBAsync(db); return NextResponse.json({ok:true,id:rep.id,status:rep.status}) }
