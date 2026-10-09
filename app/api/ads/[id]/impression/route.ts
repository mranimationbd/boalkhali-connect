export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {mutateDBAsync} from '@/lib/db'; import {rateLimit} from '@/lib/auth';
// Real impression counting (Wave 1): fired by components/AdCard once per mount.
// advertisements live on the legacy doc, so the increment rides mutateDBAsync's
// version-checked transaction — it re-runs on fresh state and is only acknowledged
// after the write actually commits (no in-memory-only counters, no fake numbers).
export async function POST(_req:Request,{params}:{params:{id:string}}){ if(!rateLimit('adimp',600)) return NextResponse.json({error:'RATE_LIMIT'},{status:429}); const out:any=await mutateDBAsync((db:any)=>{ const a=(db.advertisements||[]).find((x:any)=>x.id===params.id); if(!a) return {e:404}; a.impressions=(Number(a.impressions)||0)+1; return {ok:true,impressions:a.impressions}; }); if(out&&out.e) return NextResponse.json({error:'NOT_FOUND'},{status:404}); return NextResponse.json(out); }
