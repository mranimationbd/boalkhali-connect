export const dynamic='force-dynamic';
import {NextResponse} from 'next/server'; import {requireRole} from '@/lib/auth'; import {hasPermission} from '@/lib/permissions'; import {setRetentionDays,purgeOldIpLogs} from '@/lib/analytics';
// Raw-IP retention policy (§46): default 60 days, adjustable 30–90 by whoever holds
// analytics.ip.view (currently SUPER_ADMIN). Aggregates are never purged — only raw IP rows.
// Saving also runs one bounded purge with the new window.
export async function POST(req:Request){ const r=await requireRole(['ADMIN','SUPER_ADMIN','MODERATOR']); if((r as any).error) return NextResponse.json(r,{status:(r as any).status}); const u=(r as any).user; if(!hasPermission(u.role,'analytics.ip.view')) return NextResponse.json({error:'FORBIDDEN'},{status:403}); const b=await req.json().catch(()=>null); const n=Number(b&&b.retentionDays); if(!Number.isFinite(n)||n<30||n>90) return NextResponse.json({error:'RETENTION_RANGE'},{status:400}); await setRetentionDays(Math.round(n)); let purged=0; try{ purged=await purgeOldIpLogs(Math.round(n)); }catch{} return NextResponse.json({ok:true,retentionDays:Math.round(n),purged}); }
