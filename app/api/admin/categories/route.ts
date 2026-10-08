export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {readDBAsync,writeDBAsync,audit} from '@/lib/db'; import {requireRole} from '@/lib/auth';
// Category enable/disable (batch S1). Holders of categories.manage = ADMIN/SUPER_ADMIN.
// Delete is intentionally unsupported: existing posts must never be orphaned.
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const b=await req.json().catch(()=>({})); const db=await readDBAsync(); const c=db.categories.find((x:any)=>x.slug===String(b.slug||'')); if(!c) return NextResponse.json({error:'NOT_FOUND'},{status:404}); c.enabled=!!b.enabled; audit(db,(r as any).user.email,'CATEGORY_TOGGLE',c.slug,{enabled:c.enabled}); await writeDBAsync(db); return NextResponse.json({ok:true,slug:c.slug,enabled:c.enabled}); }
