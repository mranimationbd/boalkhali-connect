export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,writeDBAsync,audit} from '@/lib/db'; import {requireRole} from '@/lib/auth';
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const actor=(r as any).user; const b=await req.json(); const db=await readDBAsync(); const ad=db.advertisements.find((x:any)=>x.id===String(b.id||'')); if(!ad) return NextResponse.json({error:'NOT_FOUND'},{status:404});
 if(b.action==='hide') ad.status='HIDDEN';
 else if(b.action==='show') ad.status='APPROVED';
 else if(b.action==='delete') db.advertisements=db.advertisements.filter((x:any)=>x.id!==ad.id);
 else return NextResponse.json({error:'INVALID_ACTION'},{status:400});
 audit(db,actor.email,'AD_'+String(b.action).toUpperCase(),ad.id); await writeDBAsync(db); return NextResponse.json({ok:true,id:ad.id,status:ad.status}) }
